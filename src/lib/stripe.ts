import Stripe from 'stripe'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })
}

export const PLANS = {
  starter: {
    name:     'Starter',
    monthly:  process.env.STRIPE_PRICE_STARTER_MONTHLY!,
    annual:   process.env.STRIPE_PRICE_STARTER_ANNUAL!,
    subLimit: 10,
    features: ['10 subcontractors', 'Document uploads', 'Email notifications', 'Compliance dashboard'],
  },
  pro: {
    name:     'Pro',
    monthly:  process.env.STRIPE_PRICE_PRO_MONTHLY!,
    annual:   process.env.STRIPE_PRICE_PRO_ANNUAL!,
    subLimit: 50,
    features: ['50 subcontractors', 'Risk scoring', 'API access', 'Bulk chase', 'Live register checks'],
  },
  business: {
    name:     'Business',
    monthly:  process.env.STRIPE_PRICE_BUSINESS_MONTHLY!,
    annual:   process.env.STRIPE_PRICE_BUSINESS_ANNUAL!,
    subLimit: 250,
    features: ['250 subcontractors', 'Everything in Pro', 'Project management', 'Audit logs', 'Priority support'],
  },
} as const

export type PlanKey = keyof typeof PLANS

export async function getOrCreateCustomer(params: {
  email:       string
  name:        string
  contractorId: string
  existing?:   string | null
}): Promise<string> {
  if (params.existing) return params.existing
  const customer = await getStripe().customers.create({
    email:    params.email,
    name:     params.name,
    metadata: { contractorId: params.contractorId },
  })
  return customer.id
}

export async function createCheckoutSession(params: {
  customerId:   string
  priceId:      string
  contractorId: string
  successUrl:   string
  cancelUrl:    string
}): Promise<Stripe.Checkout.Session> {
  return getStripe().checkout.sessions.create({
    customer:   params.customerId,
    mode:       'subscription',
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url:  params.cancelUrl,
    metadata:   { contractorId: params.contractorId },
    subscription_data: {
      trial_period_days: 7,
      metadata:          { contractorId: params.contractorId },
    },
  })
}

export async function createPortalSession(params: {
  customerId:  string
  returnUrl:   string
}): Promise<Stripe.BillingPortal.Session> {
  return getStripe().billingPortal.sessions.create({
    customer:   params.customerId,
    return_url: params.returnUrl,
  })
}

export function planFromPriceId(priceId: string): PlanKey | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.monthly === priceId || plan.annual === priceId) return key as PlanKey
  }
  return null
}

// Webhook event construction (uses lazy client)
export function constructWebhookEvent(body: string, sig: string, secret: string): Stripe.Event {
  return getStripe().webhooks.constructEvent(body, sig, secret)
}
