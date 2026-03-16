import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subcontractors } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/get-auth'
import { calculateCompliance } from '@/lib/compliance-engine'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
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

  const result = await calculateCompliance(sub.profileId, ctx.contractorId)

  return NextResponse.json(result)
}
