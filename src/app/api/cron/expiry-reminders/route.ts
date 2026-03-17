import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { addDays, addHours } from 'date-fns'
import { db } from '@/lib/db'
import { complianceDocuments, subProfiles, subcontractors, notifications, uploadSessions } from '@/lib/db/schema'
import { eq, and, between, lt, sql } from 'drizzle-orm'
import { sendExpiryWarning } from '@/lib/resend'

export const dynamic = 'force-dynamic'

// Called by Vercel Cron (set in vercel.json) or an external scheduler
// Authorization: Bearer {CRON_SECRET}
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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

    // Check not already sent today for this doc + milestone
    const alreadySent = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.documentId, doc.docId),
        eq(notifications.eventType, `document_expiring_${daysRemaining}d`),
        sql`${notifications.createdAt} > NOW() - INTERVAL '20 hours'`,
      ),
    })

    if (alreadySent) { skipped++; continue }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    let uploadLink = `${appUrl}/upload`
    try {
      const token = crypto.randomBytes(48).toString('base64url')
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
      docId:       complianceDocuments.id,
      profileId:   complianceDocuments.profileId,
      ownerEmail:  subProfiles.ownerEmail,
      firstName:   subProfiles.firstName,
      lastName:    subProfiles.lastName,
      docTypeName: sql<string>`(
        SELECT name FROM document_types WHERE id = ${complianceDocuments.documentTypeId}
      )`,
    })
    .from(complianceDocuments)
    .innerJoin(subProfiles, eq(complianceDocuments.profileId, subProfiles.id))
    .where(and(
      eq(complianceDocuments.status, 'approved'),
      eq(complianceDocuments.isCurrent, true),
      lt(complianceDocuments.expiresAt, now.toISOString().slice(0,10)),
    ))

  for (const doc of expiredDocs) {
    // Update status → expired
    await db.update(complianceDocuments)
      .set({ status: 'expired', updatedAt: new Date() })
      .where(eq(complianceDocuments.id, doc.docId))

    expiredUpdated++

    // Avoid spamming duplicate expired alerts (once per 24h)
    const alreadyAlerted = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.documentId, doc.docId),
        eq(notifications.eventType, 'document_expired'),
        sql`${notifications.createdAt} > NOW() - INTERVAL '24 hours'`,
      ),
    })

    if (alreadyAlerted) continue

    await db.insert(notifications).values({
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

  return NextResponse.json({
    checked: expiringDocs.length,
    sent,
    skipped,
    expiredUpdated,
    timestamp: now.toISOString(),
  })
}
