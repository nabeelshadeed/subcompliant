import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { planFromPriceId, constructWebhookEvent } from '@/lib/stripe'
import { db } from '@/lib/db'
import { contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cacheGet, cacheSet } from '@/lib/redis'

export const dynamic = 'force-dynamic'

const PLAN_LIMITS: Record<string, number> = {
  starter:    10,
  pro:        50,
  business:  250,
  enterprise: 9999,
}

function getStripeInstance(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
}

export async function POST(req: NextRequest) {
  const sig  = req.headers.get('stripe-signature') ?? ''
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  // Idempotency: Stripe retries webhooks for up to 72h on 5xx. Skip events we
  // have already processed to prevent double-applying plan changes or downgrades.
  const dedupKey = `webhook:stripe:${event.id}`
  const alreadyProcessed = await cacheGet<boolean>(dedupKey)
  if (alreadyProcessed) {
    return NextResponse.json({ received: true })
  }

  const data = event.data.object as any

  switch (event.type) {
    case 'checkout.session.completed': {
      const contractorId = data.metadata?.contractorId
      if (contractorId && data.subscription) {
        const sub      = await getStripeInstance().subscriptions.retrieve(data.subscription)
        const priceId  = sub.items.data[0]?.price?.id ?? ''
        const planKey  = planFromPriceId(priceId) ?? 'starter'
        const subLimit = PLAN_LIMITS[planKey] ?? 10

        await db.update(contractors)
          .set({
            plan:             planKey as any,
            stripeSubId:      sub.id,
            stripeCustomerId: data.customer,
            subLimit,
            planExpiresAt:    new Date((sub.current_period_end ?? 0) * 1000),
            isActive:         true,
          })
          .where(eq(contractors.id, contractorId))
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub         = data as Stripe.Subscription
      const customerId  = sub.customer as string
      const priceId     = sub.items.data[0]?.price?.id ?? ''
      const planKey     = planFromPriceId(priceId) ?? 'starter'
      const subLimit    = PLAN_LIMITS[planKey] ?? 10
      const active      = sub.status === 'active' || sub.status === 'trialing'

      await db.update(contractors)
        .set({
          plan:          planKey as any,
          subLimit,
          planExpiresAt: new Date((sub.current_period_end ?? 0) * 1000),
          isActive:      active,
        })
        .where(eq(contractors.stripeCustomerId, customerId))
      break
    }

    case 'customer.subscription.deleted': {
      const sub = data as Stripe.Subscription
      await db.update(contractors)
        .set({ plan: 'starter', subLimit: 10, stripeSubId: null, isActive: true })
        .where(eq(contractors.stripeCustomerId, sub.customer as string))
      break
    }
  }

  // Mark event processed after successful handling (24h is enough; Stripe stops
  // retrying after 72h but dedup prevents any double-fire within that window).
  await cacheSet(dedupKey, true, 86400)

  return NextResponse.json({ received: true })
}
