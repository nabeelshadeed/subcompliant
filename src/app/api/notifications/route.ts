import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifications } from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { getAuthContext } from '@/lib/auth/get-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { ctx, error } = await getAuthContext()
  if (error) return error

  const page   = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
  const limit  = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '25'), 100)
  const offset = (page - 1) * limit
  const unreadOnly = req.nextUrl.searchParams.get('unread') === 'true'

  const rows = await db.query.notifications.findMany({
    where: and(
      eq(notifications.contractorId, ctx.contractorId),
      unreadOnly ? sql`${notifications.status} = 'queued'` : undefined,
    ),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit,
    offset,
  })

  return NextResponse.json({ data: rows })
}
