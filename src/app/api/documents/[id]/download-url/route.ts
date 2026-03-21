import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { complianceDocuments, subcontractors } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/get-auth'
import { getPresignedDownloadUrl } from '@/lib/r2'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { ctx, error } = await getAuthContext()
  if (error) return error

  const doc = await db.query.complianceDocuments.findFirst({
    where: eq(complianceDocuments.id, id),
  })

  if (!doc || !doc.fileKey) {
    return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 })
  }

  // Verify this contractor has a subcontractor relationship with the document's owner
  const sub = await db.query.subcontractors.findFirst({
    where: and(
      eq(subcontractors.profileId, doc.profileId),
      eq(subcontractors.contractorId, ctx.contractorId),
    ),
  })

  if (!sub) {
    return NextResponse.json({ error: { code: 'FORBIDDEN' } }, { status: 403 })
  }

  const url = await getPresignedDownloadUrl(doc.fileKey)
  return NextResponse.json({ url })
}
