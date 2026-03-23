import { NextRequest, NextResponse } from 'next/server'
import { addDays, addHours } from 'date-fns'
import { db } from '@/lib/db'
import { complianceDocuments, subProfiles, subcontractors, notifications, uploadSessions, contractors, users } from '@/lib/db/schema'
import { eq, and, between, lt, lte, sql, isNull } from 'drizzle-orm'
import { sendExpiryWarning, sendTrialExpiring } from '@/lib/resend'

export const dynamic = 'force-dynamic'

// Called by Cloudflare Workers cron trigger (scheduled event → internal fetch)
// OR an external scheduler with Authorization: Bearer {CRON_SECRET}
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  // Allow Cloudflare internal scheduled invocations (no auth header) or external callers with secret
  const isCloudflareInternal = req.headers.get('x-cf-worker') === '1'
  if (!isCloudflareInternal && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now     = new Date()
  const in30    = addDays(now, 30)
  const in7     = addDays(now, 7)

  // Find approved docs expiring in next 30 days (send reminder once per window)
  const expiringDocs = await db
    .select({
      docId:           complianceDocuments.id,
      documentTypeId:  complianceDocuments.documentTypeId,
      expiresAt:       complianceDocuments.expiresAt,
      profileId:       complianceDocuments.profileId,
      contractorId:    subcontractors.contractorId,
      subcontractorId: subcontractors.id,
      ownerEmail:      subProfiles.ownerEmail,
      firstName:       subProfiles.firstName,
      lastName:        subProfiles.lastName,
      docTypeName:     sql<string>`(
        SELECT name FROM document_types WHERE id = ${complianceDocuments.documentTypeId}
      )`,
    })
    .from(complianceDocuments)
    .innerJoin(subProfiles, eq(complianceDocuments.profileId, subProfiles.id))
    .innerJoin(subcontractors, eq(subcontractors.profileId, complianceDocuments.profileId))
    .where(and(
      eq(complianceDocuments.status, 'approved'),
      eq(complianceDocuments.isCurrent, true),
      between(complianceDocuments.expiresAt, now.toISOString().slice(0,10), in30.toISOString().slice(0,10)),
    ))

  let sent = 0
  let skipped = 0
  let expiredUpdated = 0

  for (const doc of expiringDocs) {
    if (!doc.expiresAt || !doc.ownerEmail) continue

    const expiresAt    = new Date(doc.expiresAt)
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000)

    // Only send on specific day milestones
    if (![30, 14, 7, 3, 1].includes(daysRemaining)) { skipped++; continue }

    // Dedup window is 23h (not 24h) to give a 1h buffer against cron drift while
    // still preventing double-sends from concurrent cron invocations. A daily cron
    // at 08:00 can fire up to ~1h late in Cloudflare Workers — 23h covers this.
    const alreadySent = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.documentId, doc.docId),
        eq(notifications.eventType, `document_expiring_${daysRemaining}d`),
        sql`${notifications.createdAt} > NOW() - INTERVAL '23 hours'`,
      ),
    })

    if (alreadySent) { skipped++; continue }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://subcompliant.com'
    let uploadLink = `${appUrl}/upload`
    try {
      const token = Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(48))).toString('base64url')
      await db.insert(uploadSessions).values({
        token:               token,
        contractorId:        doc.contractorId,
        subcontractorId:     doc.subcontractorId,
        requiredDocTypeIds:  doc.documentTypeId ? [doc.documentTypeId] : undefined,
        expiresAt:           addHours(now, 168),
        subEmail:            doc.ownerEmail,
        subName:             doc.firstName && doc.lastName ? `${doc.firstName} ${doc.lastName}`.trim() : undefined,
        isSingleUse:         false,
      })
      uploadLink = `${appUrl}/upload?t=${token}`
    } catch {
      // If session creation fails, link still goes to upload page (sub can request new link)
    }

    try {
      await sendExpiryWarning({
        to:            doc.ownerEmail,
        subName:       `${doc.firstName} ${doc.lastName}`,
        docTypeName:   doc.docTypeName ?? 'document',
        expiresAt,
        daysRemaining,
        uploadLink,
      })

      await db.insert(notifications).values({
        contractorId:    doc.contractorId,
        profileId:      doc.profileId,
        documentId:     doc.docId,
        eventType:      `document_expiring_${daysRemaining}d`,
        severity:       daysRemaining <= 7 ? 'critical' : 'warning',
        channel:        'email',
        status:         'sent',
        recipientEmail: doc.ownerEmail,
        subject:        `${doc.docTypeName} expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
        sentAt:         new Date(),
      })

      sent++
    } catch (err) {
      console.error(`Failed to send expiry warning for doc ${doc.docId}:`, err)
    }
  }

  // Mark already expired docs as expired and emit a one-time alert
  const expiredDocs = await db
    .select({
      docId:        complianceDocuments.id,
      profileId:    complianceDocuments.profileId,
      contractorId: subcontractors.contractorId,
      ownerEmail:   subProfiles.ownerEmail,
      firstName:    subProfiles.firstName,
      lastName:     subProfiles.lastName,
      docTypeName:  sql<string>`(
        SELECT name FROM document_types WHERE id = ${complianceDocuments.documentTypeId}
      )`,
    })
    .from(complianceDocuments)
    .innerJoin(subProfiles, eq(complianceDocuments.profileId, subProfiles.id))
    .innerJoin(subcontractors, eq(subcontractors.profileId, complianceDocuments.profileId))
    .where(and(
      eq(complianceDocuments.status, 'approved'),
      eq(complianceDocuments.isCurrent, true),
      lt(complianceDocuments.expiresAt, now.toISOString().slice(0,10)),
    ))

  for (const doc of expiredDocs) {
    // Use WHERE status = 'approved' so this is idempotent — if two cron runs
    // process the same expired doc concurrently, only the first UPDATE will
    // match (the second finds status already = 'expired' and affects 0 rows).
    const [updated] = await db.update(complianceDocuments)
      .set({ status: 'expired', updatedAt: new Date() })
      .where(and(
        eq(complianceDocuments.id, doc.docId),
        eq(complianceDocuments.status, 'approved'),
      ))
      .returning()

    if (!updated) continue  // Already processed by a concurrent run — skip notification

    expiredUpdated++

    // Avoid spamming duplicate expired alerts (once per 23h)
    const alreadyAlerted = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.documentId, doc.docId),
        eq(notifications.eventType, 'document_expired'),
        sql`${notifications.createdAt} > NOW() - INTERVAL '23 hours'`,
      ),
    })

    if (alreadyAlerted) continue

    await db.insert(notifications).values({
      contractorId:   doc.contractorId,
      profileId:      doc.profileId,
      documentId:     doc.docId,
      eventType:      'document_expired',
      severity:       'critical',
      channel:        'in_app',
      status:         'sent',
      recipientEmail: doc.ownerEmail,
      subject:        `${doc.docTypeName} has expired`,
      body:           `${doc.docTypeName} for ${doc.firstName} ${doc.lastName} has expired and must be renewed.`,
      sentAt:         new Date(),
    }).catch(() => {})
  }

  // ── Trial expiry reminder emails ─────────────────────────────────────────
  // Send to org admins whose trial ends in exactly 3 or 1 days
  let trialEmailsSent = 0
  const in1 = addDays(now, 1)
  const in3 = addDays(now, 3)

  const trialContractors = await db
    .select({
      id:          contractors.id,
      name:        contractors.name,
      trialEndsAt: contractors.trialEndsAt,
      plan:        contractors.plan,
    })
    .from(contractors)
    .where(and(
      eq(contractors.plan, 'starter'),
      isNull(contractors.stripeSubId),
      // Trial ends within the next 3 days (catches both 1-day and 3-day windows)
      between(
        sql<string>`DATE(${contractors.trialEndsAt})`,
        now.toISOString().slice(0, 10),
        in3.toISOString().slice(0, 10),
      ),
    ))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://subcompliant.com'

  for (const c of trialContractors) {
    if (!c.trialEndsAt) continue
    const daysLeft = Math.ceil((new Date(c.trialEndsAt).getTime() - now.getTime()) / 86400000)
    if (![3, 1].includes(daysLeft)) continue

    // Get the admin user(s) for this contractor
    const admins = await db.query.users.findMany({
      where: and(
        eq(users.contractorId, c.id),
        eq(users.role, 'admin'),
        eq(users.isActive, true),
      ),
    })

    for (const admin of admins) {
      if (!admin.email) continue

      // Dedup — only send once per milestone per contractor
      const dedupKey = `trial_expiry_${c.id}_${daysLeft}d`
      const alreadySent = await db.query.notifications.findFirst({
        where: and(
          eq(notifications.contractorId, c.id),
          eq(notifications.eventType, `trial_expiring_${daysLeft}d`),
          sql`${notifications.createdAt} > NOW() - INTERVAL '23 hours'`,
        ),
      })
      if (alreadySent) continue

      await sendTrialExpiring({
        to:         admin.email,
        firstName:  admin.firstName ?? 'there',
        daysLeft,
        upgradeUrl: `${appUrl}/settings/billing`,
      }).catch(err => console.error('[cron] trial email failed:', err))

      await db.insert(notifications).values({
        contractorId: c.id,
        eventType:    `trial_expiring_${daysLeft}d`,
        severity:     daysLeft <= 1 ? 'critical' : 'warning',
        channel:      'email',
        status:       'sent',
        recipientEmail: admin.email,
        subject:      `Your SubCompliant trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
        sentAt:       new Date(),
      }).catch(() => {})

      trialEmailsSent++
    }
  }

  return NextResponse.json({
    checked: expiringDocs.length,
    sent,
    skipped,
    expiredUpdated,
    trialEmailsSent,
    timestamp: now.toISOString(),
  })
}
