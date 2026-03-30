import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { uploadSessions, documentTypes } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { ensureBuiltinDocTypes } from '@/lib/seed-doc-types'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
  const { token } = await params
  const session = await db.query.uploadSessions.findFirst({
    where: eq(uploadSessions.token, token),
    with:  { contractor: true },
  })

  if (!session) {
    return NextResponse.json({ error: { code: 'SESSION_NOT_FOUND', message: 'Upload link not found or expired' } }, { status: 404 })
  }

  if (new Date() > session.expiresAt) {
    return NextResponse.json({ error: { code: 'SESSION_EXPIRED', message: 'This upload link has expired' } }, { status: 410 })
  }

  if (session.completedAt) {
    return NextResponse.json({ error: { code: 'SESSION_COMPLETED', message: 'Documents already submitted' } }, { status: 409 })
  }

  // Ensure built-in doc types are seeded — this is the first touch point for
  // many subcontractors so we guarantee the table is populated before querying.
  await ensureBuiltinDocTypes()

  // Resolve required document types
  let requiredDocTypes: any[] = []
  if (session.requiredDocTypeIds?.length) {
    requiredDocTypes = await db.query.documentTypes.findMany({
      where: inArray(documentTypes.id, session.requiredDocTypeIds as string[]),
    })
  } else {
    // Return all system-required types if none specified
    requiredDocTypes = await db.query.documentTypes.findMany({
      where: eq(documentTypes.isSystemType, true),
      orderBy: (t, { asc }) => [asc(t.sortOrder)],
    })
  }

  return NextResponse.json({
    sessionId:         session.id,
    contractorName:    (session as any).contractor?.name,
    contractorLogoUrl: (session as any).contractor?.logoUrl,
    customMessage:     session.customMessage,
    prefilledName:     session.subName,
    prefilledEmail:    session.subEmail,
    expiresAt:         session.expiresAt.toISOString(),
    requiredDocTypes:  requiredDocTypes.map(t => ({
      id:                   t.id,
      name:                 t.name,
      slug:                 t.slug,
      category:             t.category,
      description:          t.description,
      defaultExpiryMonths:  t.defaultExpiryMonths,
    })),
  })
  } catch (err) {
    console.error('[upload-session:GET] unhandled error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Could not load upload session. Please try again.' } },
      { status: 500 }
    )
  }
}
