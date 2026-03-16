import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subcontractors, complianceDocuments, documentTypes } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/get-auth'
import { getPresignedDownloadUrl } from '@/lib/r2'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { ctx, error } = await getAuthContext()
  if (error) return error

  const sub = await db.query.subcontractors.findFirst({
    where: and(
      eq(subcontractors.id, id),
      eq(subcontractors.contractorId, ctx.contractorId)
    ),
  })

  if (!sub) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Subcontractor not found' } }, { status: 404 })
  }

  const docs = await db
    .select({
      id:               complianceDocuments.id,
      status:           complianceDocuments.status,
      fileName:         complianceDocuments.fileName,
      fileKey:          complianceDocuments.fileKey,
      fileSizeBytes:    complianceDocuments.fileSizeBytes,
      mimeType:         complianceDocuments.mimeType,
      expiresAt:        complianceDocuments.expiresAt,
      issuedAt:         complianceDocuments.issuedAt,
      policyNumber:     complianceDocuments.policyNumber,
      coverageAmount:   complianceDocuments.coverageAmount,
      issuerName:       complianceDocuments.issuerName,
      referenceNumber:  complianceDocuments.referenceNumber,
      isVerified:       complianceDocuments.isVerified,
      isCurrent:        complianceDocuments.isCurrent,
      submittedAt:      complianceDocuments.submittedAt,
      rejectedReason:   complianceDocuments.rejectedReason,
      reviewNotes:      complianceDocuments.reviewNotes,
      documentType: {
        id:          documentTypes.id,
        name:        documentTypes.name,
        slug:        documentTypes.slug,
        category:    documentTypes.category,
      },
    })
    .from(complianceDocuments)
    .innerJoin(documentTypes, eq(complianceDocuments.documentTypeId, documentTypes.id))
    .where(and(
      eq(complianceDocuments.profileId, sub.profileId),
      eq(complianceDocuments.isCurrent, true),
    ))
    .orderBy(desc(complianceDocuments.submittedAt))

  // Add presigned download URLs for approved docs
  const withUrls = await Promise.all(docs.map(async doc => {
    let downloadUrl: string | null = null
    if (doc.fileKey && (doc.status === 'approved' || doc.status === 'pending')) {
      downloadUrl = await getPresignedDownloadUrl(doc.fileKey).catch(() => null)
    }
    return { ...doc, downloadUrl }
  }))

  return NextResponse.json({ data: withUrls })
}
