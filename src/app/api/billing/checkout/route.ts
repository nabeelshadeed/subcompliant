import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAuthContext, requireAdmin } from '@/lib/auth/get-auth'
import { PLANS, getOrCreateCustomer, createCheckoutSession } from '@/lib/stripe'
import { currentUser } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

const schema = z.object({
  planKey: z.enum(['starter', 'pro', 'business']),
  billing: z.enum(['monthly', 'annual']),
})

export async function POST(req: NextRequest) {
  const { ctx, error } = await getAuthContext(req)
  if (error) return error

  const adminError = requireAdmin(ctx)
  if (adminError) return adminError

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } }, { status: 400 })
  }

  const clerkUser = await currentUser()
  const email     = clerkUser?.emailAddresses[0]?.emailAddress ?? ''

  const customerId = await getOrCreateCustomer({
    email,
    name:         ctx.contractor.name,
    contractorId: ctx.contractorId,
    existing:     ctx.contractor.stripeCustomerId,
  })

  // Persist customerId if new
  if (!ctx.contractor.stripeCustomerId) {
    await db.update(contractors)
      .set({ stripeCustomerId: customerId })
      .where(eq(contractors.id, ctx.contractorId))
  }

  const plan    = PLANS[parsed.data.planKey]
  const priceId = parsed.data.billing === 'annual' ? plan.annual : plan.monthly

  const session = await createCheckoutSession({
    customerId,
    priceId,
    contractorId: ctx.contractorId,
    successUrl:   `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=1`,
    cancelUrl:    `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?cancelled=1`,
  })

  return NextResponse.json({ url: session.url })
}
