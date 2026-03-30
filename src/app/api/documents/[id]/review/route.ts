import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addHours } from 'date-fns'
import { db } from '@/lib/db'
import { complianceDocuments, subcontractors, subProfiles, notifications, uploadSessions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthContext, requireAdmin, logAudit } from '@/lib/auth/get-auth'
import { calculateRiskScore, persistRiskScore } from '@/lib/risk-engine'
import { sendDocumentApproved, sendDocumentRejected } from '@/lib/resend'

export const dynamic = 'force-dynamic'

const schema = z.object({
  action:         z.enum(['approve', 'reject']),
  reviewNotes:    z.string().max(1000).optional(),
  rejectedReason: z.string().max(500).optional(),
  // expiresAt must be a future date — approving with a past expiry would
  // immediately mark the document expired, corrupting compliance scores.
  // Compare date-only (UTC) so today's date is valid regardless of the
  // contractor's local timezone (e.g. UK in BST).
  expiresAt: z.string().optional().refine(val => {
    if (!val) return true
    const d = new Date(val)
    if (isNaN(d.getTime())) return false
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    return d >= today
  }, 'Expiry date must be today or a future date'),
  policyNumber:   z.string().max(100).optional(),
  // coverageAmount must be positive — negative or zero coverage is not valid
  coverageAmount: z.number().positive('Coverage amount must be greater than zero').optional(),
  issuerName:     z.string().max(200).optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { id } = await params
  const { ctx, error } = await getAuthContext(req)
  if (error) return error

  const adminError = requireAdmin(ctx)
  if (adminError) return adminError

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } }, { status: 400 })
  }

  const { action, reviewNotes, rejectedReason, expiresAt, policyNumber, coverageAmount, issuerName } = parsed.data

  // Verify doc belongs to a sub of this contractor
  const doc = await db.query.complianceDocuments.findFirst({
    where: eq(complianceDocuments.id, id),
    with:  { documentType: true },
  })

  if (!doc) {
    return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })
  }

  // Only allow reviewing documents that are currently pending.
  // Re-approving an already-approved document (e.g. to change expiry) or
  // approving an expired document without a new upload is a data integrity risk.
  if (doc.status !== 'pending') {
    return NextResponse.json({
      error: {
        code:    'INVALID_STATE',
        message: `Document is not pending review (current status: ${doc.status}). Ask the subcontractor to re-upload.`,
      },
    }, { status: 409 })
  }

  // Verify contractor has access to this profile
  const sub = await db.query.subcontractors.findFirst({
    where: and(
      eq(subcontractors.profileId, doc.profileId),
      eq(subcontractors.contractorId, ctx.contractorId)
    ),
    with: { profile: true },
  })

  if (!sub) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected'
  const isChangesRequest = action === 'reject' && rejectedReason?.startsWith('Changes required:')
  const auditAction = action === 'approve' ? 'document.approved' : isChangesRequest ? 'document.changes_requested' : 'document.rejected'

  await db.update(complianceDocuments)
    .set({
      status:         newStatus,
      reviewedAt:     new Date(),
      reviewedBy:     ctx.userId,
      reviewNotes:    reviewNotes,
      rejectedReason: action === 'reject' ? (rejectedReason ?? 'Document rejected') : null,
      expiresAt:      expiresAt ?? doc.expiresAt,
      policyNumber:   policyNumber ?? doc.policyNumber,
      coverageAmount: coverageAmount ? String(coverageAmount) : doc.coverageAmount,
      issuerName:     issuerName ?? doc.issuerName,
      updatedAt:      new Date(),
    })
    .where(eq(complianceDocuments.id, id))

  // Notify sub by email
  const profile = sub.profile as typeof subProfiles.$inferSelect & { ownerEmail: string; firstName: string; lastName: string }
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? ''

  if (action === 'approve') {
    await sendDocumentApproved({
      to:          profile.ownerEmail,
      subName:     `${profile.firstName} ${profile.lastName}`,
      docTypeName: (doc as { documentType?: { name: string } }).documentType?.name ?? 'Document',
      reviewNotes,
    }).catch((err) => console.error('[review] email/notify failed:', err))
  } else {
    // Create a new upload session so the sub gets a valid re-upload link
    const reuploadToken = Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(48))).toString('base64url')
    const reuploadExpiresAt = addHours(new Date(), 72)
    await db.insert(uploadSessions).values({
      token:             reuploadToken,
      contractorId:      ctx.contractorId,
      subcontractorId:   sub.id,
      createdBy:         ctx.userId,
      requiredDocTypeIds: doc.documentTypeId ? [doc.documentTypeId] : undefined,
      expiresAt:         reuploadExpiresAt,
      subEmail:          profile.ownerEmail,
      subName:           `${profile.firstName} ${profile.lastName}`.trim() || undefined,
      isSingleUse:       false,
    })
    // Use a different email subject/body for "changes required" vs hard rejection
    const emailReason = rejectedReason ?? 'Document did not meet requirements'
    await sendDocumentRejected({
      to:             profile.ownerEmail,
      subName:        `${profile.firstName} ${profile.lastName}`,
      docTypeName:     (doc as { documentType?: { name: string } }).documentType?.name ?? 'Document',
      rejectedReason:  emailReason,
      reuploadLink:    `${appUrl}/upload?t=${reuploadToken}`,
      isChangesRequest,
    }).catch((err) => console.error('[review] email/notify failed:', err))
  }

  // Recalculate and persist risk score immediately so the subcontractor list
  // shows an up-to-date score without waiting for the 7-day cache to expire.
  // Fire-and-forget — a failure here is non-critical.
  calculateRiskScore(doc.profileId, ctx.contractorId)
    .then(breakdown => persistRiskScore(doc.profileId, ctx.contractorId, breakdown))
    .catch(err => console.error('[review] risk score recalc failed:', err))

  // Audit log
  logAudit({
    contractorId: ctx.contractorId,
    actorId:      ctx.userId,
    action:       auditAction,
    resourceType: 'compliance_document',
    resourceId:   id,
    payload:      { reviewNotes, rejectedReason },
  })

  const notifEventLabel = action === 'approve' ? 'approved' : isChangesRequest ? 'changes requested' : 'rejected'

  // In-app notification for contractor team
  await db.insert(notifications).values({
    contractorId:    ctx.contractorId,
    subcontractorId: sub.id,
    profileId:       doc.profileId,
    documentId:      doc.id,
    eventType:       auditAction,
    severity:        action === 'reject' ? 'warning' : 'info',
    channel:         'in_app',
    status:          'delivered',
    subject:         `${(doc as any).documentType?.name} ${notifEventLabel}`,
    body:            `Document ${notifEventLabel} for ${profile.firstName} ${profile.lastName}`,
    sentAt:          new Date(),
  }).catch((err) => console.error('[review] email/notify failed:', err))

  return NextResponse.json({ success: true, status: newStatus })
  } catch (err) {
    console.error('[review] unhandled error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred. Please try again.' } },
      { status: 500 }
    )
  }
}
