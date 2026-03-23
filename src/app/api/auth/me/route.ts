import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth/get-auth'

export const dynamic = 'force-dynamic'

/**
 * Lightweight endpoint polled by the /setup page.
 * Returns 200 when the user's DB record exists, 404 if not yet created.
 */
export async function GET(req: NextRequest) {
  const { ctx } = await getAuthContext(req)
  if (!ctx) return NextResponse.json({ ready: false }, { status: 404 })
  return NextResponse.json({ ready: true }, { status: 200 })
}
