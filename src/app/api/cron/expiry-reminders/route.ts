import { NextRequest, NextResponse } from 'next/server'
import { addDays, addHours } from 'date-fns'
import { db } from '@/lib/db'
import { complianceDocuments, subProfiles, subcontractors, notifications, uploadSessions, contractors, users } from '@/lib/db/schema'
import { eq, and, between, lt, sql, isNull, inArray } from 'drizzle-orm'
import { sendExpiryWarning, sendTrialExpiring } from '@/lib/resend'

export const dynamic = 'force-dynamic'

// Called by Cloudflare Workers cron trigger (scheduled event → internal fetch)
// OR an external scheduler with Authorization: Bearer {CRON_SECRET}
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[cron] Unauthorized attempt from IP:', req.headers.get('x-forwarded-for') ?? 'unknown')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
  const now  = new Date()
  const in30 = addDays(now, 30)
  const in3  = addDays(now, 3)

  let sent           = 0
  let skipped        = 0
  let expiredUpdated = 0
  let trialEmailsSent= 0

  // ── 1. Expiry warning emails ───────────────────────────────────────────────

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
    .innerJoin(subProfiles,    eq(complianceDocuments.profileId,  subProfiles.id))
    .innerJoin(subcontractors, eq(subcontractors.profileId,       complianceDocuments.profileId))
    .where(and(
      eq(complianceDocuments.status,    'approved'),
      eq(complianceDocuments.isCurrent, true),
      isNull(subcontractors.deletedAt),
      between(complianceDocuments.expiresAt, now.toISOString().slice(0, 10), in30.toISOString().slice(0, 10)),
    ))

  if (expiringDocs.length > 0) {
    // ONE bulk query to load all recent dedup records — eliminates N serial findFirst() calls
    const expiringDocIds = expiringDocs.map(d => d.docId)
    const recentExpiryNotifs = await db
      .select({ documentId: notifications.documentId, eventType: notifications.eventType })
      .from(notifications)
      .where(and(
        inArray(notifications.documentId, expiringDocIds),
        sql`${notifications.createdAt} > NOW() - INTERVAL '25 hours'`,
      ))

    const sentExpiryKeys = new Set(
      recentExpiryNotifs.map(n => `${n.documentId}:${n.eventType}`)
    )

    // Collect notification rows to batch-insert after sending emails
    const newExpiryNotifRows: (typeof notifications.$inferInsert)[] = []

    // Send emails sequentially (each goes to a different recipient)
    for (const doc of expiringDocs) {
      if (!doc.expiresAt || !doc.ownerEmail) continue

      const expiresAt     = new Date(doc.expiresAt)
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000)

      if (![30, 14, 7, 3, 1].includes(daysRemaining)) { skipped++; continue }

      const dedupKey = `${doc.docId}:document_expiring_${daysRemaining}d`
      if (sentExpiryKeys.has(dedupKey)) { skipped++; continue }

      // Create upload session token — each doc needs a unique token (DB insert per doc)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://subcompliant.com'
      let uploadLink = `${appUrl}/upload`
      try {
        const token = Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(48))).toString('base64url')
        await db.insert(uploadSessions).values({
          token,
          contractorId:       doc.contractorId,
          subcontractorId:    doc.subcontractorId,
          requiredDocTypeIds: doc.documentTypeId ? [doc.documentTypeId] : undefined,
          expiresAt:          addHours(now, 168),
          subEmail:           doc.ownerEmail,
          subName:            doc.firstName && doc.lastName ? `${doc.firstName} ${doc.lastName}`.trim() : undefined,
          isSingleUse:        false,
        })
        uploadLink = `${appUrl}/upload?t=${token}`
      } catch (err) {
        console.error(`[cron] upload session create failed for doc ${doc.docId}:`, err)
      }

      try {
        await sendExpiryWarning({
          to:           doc.ownerEmail,
          subName:      `${doc.firstName} ${doc.lastName}`,
          docTypeName:  doc.docTypeName ?? 'document',
          expiresAt,
          daysRemaining,
          uploadLink,
        })

        // Mark in-memory immediately so a second row with the same docId
        // (sub linked to multiple contractors) doesn't send a duplicate email
        // in the same cron run before the batch insert completes.
        sentExpiryKeys.add(dedupKey)

        newExpiryNotifRows.push({
          contractorId:   doc.contractorId,
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
        console.error(`[cron] expiry email failed for doc ${doc.docId}:`, err)
      }
    }

    // ONE batch insert for all expiry notification records
    if (newExpiryNotifRows.length > 0) {
      await db.insert(notifications).values(newExpiryNotifRows)
        .catch(err => console.error('[cron] expiry notifications batch insert failed:', err))
    }
  }

  // ── 2. Mark expired docs & emit in-app alerts ──────────────────────────────

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
    .innerJoin(subProfiles,    eq(complianceDocuments.profileId,  subProfiles.id))
    .innerJoin(subcontractors, eq(subcontractors.profileId,       complianceDocuments.profileId))
    .where(and(
      eq(complianceDocuments.status,    'approved'),
      eq(complianceDocuments.isCurrent, true),
      isNull(subcontractors.deletedAt),
      lt(complianceDocuments.expiresAt, now.toISOString().slice(0, 10)),
    ))

  if (expiredDocs.length > 0) {
    // Batch-update all expired docs in ONE query instead of one UPDATE per doc
    const expiredDocIds = expiredDocs.map(d => d.docId)
    await db.update(complianceDocuments)
      .set({ status: 'expired', updatedAt: new Date() })
      .where(and(
        inArray(complianceDocuments.id, expiredDocIds),
        eq(complianceDocuments.status, 'approved'), // idempotent — only matches first run
      ))
    expiredUpdated = expiredDocs.length

    // ONE bulk dedup check for all expired docs
    const recentExpiredNotifs = await db
      .select({ documentId: notifications.documentId })
      .from(notifications)
      .where(and(
        inArray(notifications.documentId, expiredDocIds),
        eq(notifications.eventType, 'document_expired'),
        sql`${notifications.createdAt} > NOW() - INTERVAL '25 hours'`,
      ))

    const alertedDocIds = new Set(recentExpiredNotifs.map(n => n.documentId))

    // Collect in-app notification rows to batch-insert
    const newExpiredNotifRows: (typeof notifications.$inferInsert)[] = []
    for (const doc of expiredDocs) {
      if (alertedDocIds.has(doc.docId)) continue
      newExpiredNotifRows.push({
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
      })
    }

    if (newExpiredNotifRows.length > 0) {
      await db.insert(notifications).values(newExpiredNotifRows)
        .catch(err => console.error('[cron] expired notifications batch insert failed:', err))
    }
  }

  // ── 3. Trial expiry reminder emails ───────────────────────────────────────

  const trialContractors = await db
    .select({
      id:          contractors.id,
      name:        contractors.name,
      trialEndsAt: contractors.trialEndsAt,
    })
    .from(contractors)
    .where(and(
      eq(contractors.plan,    'starter'),
      isNull(contractors.stripeSubId),
      between(
        sql<string>`DATE(${contractors.trialEndsAt})`,
        now.toISOString().slice(0, 10),
        in3.toISOString().slice(0, 10),
      ),
    ))

  if (trialContractors.length > 0) {
    const trialContractorIds = trialContractors.map(c => c.id)

    // ONE query for all admins across all trial contractors
    const allAdmins = await db.query.users.findMany({
      where: and(
        inArray(users.contractorId, trialContractorIds),
        eq(users.role,     'admin'),
        eq(users.isActive, true),
      ),
    })

    // ONE dedup query for all trial notifications
    const recentTrialNotifs = await db
      .select({ contractorId: notifications.contractorId, eventType: notifications.eventType })
      .from(notifications)
      .where(and(
        inArray(notifications.contractorId, trialContractorIds),
        sql`${notifications.eventType} LIKE 'trial_expiring_%'`,
        sql`${notifications.createdAt} > NOW() - INTERVAL '25 hours'`,
      ))

    const sentTrialKeys = new Set(
      recentTrialNotifs.map(n => `${n.contractorId}:${n.eventType}`)
    )

    // Build a map of contractorId → admins for O(1) lookup
    const adminsByContractor = new Map<string, typeof allAdmins>()
    for (const admin of allAdmins) {
      const list = adminsByContractor.get(admin.contractorId) ?? []
      list.push(admin)
      adminsByContractor.set(admin.contractorId, list)
    }

    const newTrialNotifRows: (typeof notifications.$inferInsert)[] = []
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://subcompliant.com'

    for (const c of trialContractors) {
      if (!c.trialEndsAt) continue
      const daysLeft = Math.ceil((new Date(c.trialEndsAt).getTime() - now.getTime()) / 86400000)
      if (![3, 1].includes(daysLeft)) continue

      const admins = adminsByContractor.get(c.id) ?? []
      for (const admin of admins) {
        if (!admin.email) continue

        const dedupKey = `${c.id}:trial_expiring_${daysLeft}d`
        if (sentTrialKeys.has(dedupKey)) continue

        await sendTrialExpiring({
          to:         admin.email,
          firstName:  admin.firstName ?? 'there',
          daysLeft,
          upgradeUrl: `${appUrl}/settings/billing`,
        }).catch(err => console.error('[cron] trial email failed:', err))

        newTrialNotifRows.push({
          contractorId:   c.id,
          eventType:      `trial_expiring_${daysLeft}d`,
          severity:       daysLeft <= 1 ? 'critical' : 'warning',
          channel:        'email',
          status:         'sent',
          recipientEmail: admin.email,
          subject:        `Your SubCompliant trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
          sentAt:         new Date(),
        })

        // Mark as sent in-memory so subsequent admins on the same contractor don't re-send
        sentTrialKeys.add(dedupKey)
        trialEmailsSent++
      }
    }

    if (newTrialNotifRows.length > 0) {
      await db.insert(notifications).values(newTrialNotifRows)
        .catch(err => console.error('[cron] trial notifications batch insert failed:', err))
    }
  }

  return NextResponse.json({
    checked: (expiringDocs ?? []).length,
    sent,
    skipped,
    expiredUpdated,
    trialEmailsSent,
    timestamp: now.toISOString(),
  })
  } catch (err) {
    console.error('[cron:expiry-reminders] unhandled error:', err)
    return NextResponse.json(
      { error: 'Cron job failed', detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
