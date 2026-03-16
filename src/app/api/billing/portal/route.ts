import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth/get-auth'
import { createPortalSession } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { ctx, error } = await getAuthContext()
  if (error) return error

  if (!ctx.contractor.stripeCustomerId) {
    return NextResponse.json({ error: { code: 'NO_SUBSCRIPTION', message: 'No active subscription found' } }, { status: 400 })
  }

  const session = await createPortalSession({
    customerId: ctx.contractor.stripeCustomerId,
    returnUrl:  `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  })

  return NextResponse.json({ url: session.url })
}
