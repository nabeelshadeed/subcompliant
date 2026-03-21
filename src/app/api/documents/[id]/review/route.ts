import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addHours } from 'date-fns'
import { db } from '@/lib/db'
import { complianceDocuments, subcontractors, subProfiles, notifications, uploadSessions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthContext, requireAdmin, logAudit } from '@/lib/auth/get-auth'
import { enqueueJob } from '@/lib/redis'
import { sendDocumentApproved, sendDocumentRejected } from '@/lib/resend'

export const dynamic = 'force-dynamic'

const schema = z.object({
  action:         z.enum(['approve', 'reject']),
  reviewNotes:    z.string().optional(),
  rejectedReason: z.string().optional(),
  expiresAt:      z.string().optional(), // ISO date YYYY-MM-DD override
  policyNumber:   z.string().optional(),
  coverageAmount: z.number().optional(),
  issuerName:     z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    }).catch(() => {})
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
      isSingleUse:       true,
    })
    await sendDocumentRejected({
      to:             profile.ownerEmail,
      subName:        `${profile.firstName} ${profile.lastName}`,
      docTypeName:     (doc as { documentType?: { name: string } }).documentType?.name ?? 'Document',
      rejectedReason:  rejectedReason ?? 'Document did not meet requirements',
      reuploadLink:    `${appUrl}/upload?t=${reuploadToken}`,
    }).catch(() => {})
  }

  // Trigger risk score recalculation
  await enqueueJob('calculate_risk_score', {
    profileId:    doc.profileId,
    contractorId: ctx.contractorId,
  })

  // Audit log
  logAudit({
    contractorId: ctx.contractorId,
    actorId:      ctx.userId,
    action:       `document.${action}d`,
    resourceType: 'compliance_document',
    resourceId:   id,
    payload:      { reviewNotes, rejectedReason },
  })

  // In-app notification for contractor team
  await db.insert(notifications).values({
    contractorId:    ctx.contractorId,
    subcontractorId: sub.id,
    profileId:       doc.profileId,
    documentId:      doc.id,
    eventType:       `document.${action}d`,
    severity:        action === 'reject' ? 'warning' : 'info',
    channel:         'in_app',
    status:          'delivered',
    subject:         `${(doc as any).documentType?.name} ${action}d`,
    body:            `Document ${action}d for ${profile.firstName} ${profile.lastName}`,
    sentAt:          new Date(),
  }).catch(() => {})

  return NextResponse.json({ success: true, status: newStatus })
}
