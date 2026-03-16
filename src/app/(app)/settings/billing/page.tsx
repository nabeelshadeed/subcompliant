'use client'

import { useState } from 'react'
import { Check, Zap, Building2, CreditCard, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    key:      'starter',
    name:     'Starter',
    price:    { monthly: 29, annual: 23 },
    subLimit: 10,
    features: ['10 subcontractors', 'Document uploads', 'Email notifications', 'Compliance dashboard', '30-day document history'],
  },
  {
    key:      'pro',
    name:     'Pro',
    price:    { monthly: 79, annual: 63 },
    subLimit: 50,
    popular:  true,
    features: ['50 subcontractors', 'Risk scoring', 'API access', 'Bulk chase', 'Live register checks', 'CSV exports'],
  },
  {
    key:      'business',
    name:     'Business',
    price:    { monthly: 199, annual: 159 },
    subLimit: 250,
    features: ['250 subcontractors', 'Everything in Pro', 'Project management', 'Audit logs', 'Priority support', 'SSO'],
  },
]

export default function BillingPage() {
  const [billing,  setBilling]  = useState<'monthly' | 'annual'>('monthly')
  const [loading,  setLoading]  = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  async function startCheckout(planKey: string) {
    setLoading(planKey)
    const plan = PLANS.find(p => p.key === planKey)!
    const priceId = `STRIPE_PRICE_${planKey.toUpperCase()}_${billing.toUpperCase()}`

    try {
      const res = await fetch('/api/billing/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planKey, billing, priceId: process.env[`NEXT_PUBLIC_${priceId}`] ?? priceId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Billing & Plan</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your subscription</p>
        </div>
        <button
          onClick={openPortal}
          disabled={portalLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <CreditCard size={14} />
          {portalLoading ? 'Loading…' : 'Manage Billing'}
          <ExternalLink size={12} className="text-gray-400" />
        </button>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-lg w-fit">
        {(['monthly', 'annual'] as const).map(b => (
          <button
            key={b}
            onClick={() => setBilling(b)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
              billing === b ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            )}
          >
            {b === 'monthly' ? 'Monthly' : 'Annual'}
            {b === 'annual' && <span className="ml-1.5 text-xs text-green-600 font-semibold">Save 20%</span>}
          </button>
        ))}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map(plan => (
          <div
            key={plan.key}
            className={cn(
              'card p-6 flex flex-col relative',
              plan.popular ? 'border-brand-400 ring-1 ring-brand-400' : ''
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-brand-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                {plan.key === 'starter' && <Zap size={15} className="text-gray-400" />}
                {plan.key === 'pro'     && <Zap size={15} className="text-brand-500" />}
                {plan.key === 'business'&& <Building2 size={15} className="text-purple-500" />}
                <h3 className="font-bold text-gray-900">{plan.name}</h3>
              </div>
              <div className="mt-3 mb-4">
                <span className="text-3xl font-black text-gray-900">
                  £{billing === 'annual' ? plan.price.annual : plan.price.monthly}
                </span>
                <span className="text-sm text-gray-400">/mo</span>
                {billing === 'annual' && (
                  <p className="text-xs text-gray-400 mt-0.5">Billed annually</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-4">Up to {plan.subLimit} subcontractors</p>

              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => startCheckout(plan.key)}
              disabled={loading === plan.key}
              className={cn(
                'mt-auto w-full py-2.5 text-sm font-semibold rounded-lg transition-colors',
                plan.popular
                  ? 'bg-brand-600 text-white hover:bg-brand-700'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200',
                loading === plan.key ? 'opacity-50 cursor-not-allowed' : ''
              )}
            >
              {loading === plan.key ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Loading…
                </span>
              ) : (
                `Get ${plan.name}`
              )}
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        All plans include a 14-day free trial. No credit card required to start.
        Prices shown exclude VAT. Cancel any time.
      </p>
    </div>
  )
}
