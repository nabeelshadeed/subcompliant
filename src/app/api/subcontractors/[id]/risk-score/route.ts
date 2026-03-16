import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subcontractors, riskScores } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/get-auth'
import { calculateRiskScore, persistRiskScore } from '@/lib/risk-engine'

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

  // Try cached current score first
  const cached = await db.query.riskScores.findFirst({
    where: and(
      eq(riskScores.profileId, sub.profileId),
      eq(riskScores.contractorId, ctx.contractorId),
      eq(riskScores.isCurrent, true),
    ),
  })

  // If score is still valid (< 7 days old), return cached
  if (cached && cached.validUntil && new Date() < cached.validUntil) {
    return NextResponse.json({ ...cached, cached: true })
  }

  // Recalculate
  const breakdown = await calculateRiskScore(sub.profileId, ctx.contractorId)
  const scoreId   = await persistRiskScore(sub.profileId, ctx.contractorId, breakdown)

  return NextResponse.json({ ...breakdown, id: scoreId, cached: false })
}
