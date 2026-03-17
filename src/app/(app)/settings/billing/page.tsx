'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()
  const [billing,  setBilling]  = useState<'monthly' | 'annual'>('monthly')
  const [loading,  setLoading]  = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  useEffect(() => {
    const success = searchParams.get('success')
    const cancelled = searchParams.get('cancelled')
    if (success === '1') {
      setMessage({ type: 'success', text: 'Your subscription is now active. Thank you.' })
      window.history.replaceState({}, '', '/settings/billing')
    } else if (cancelled === '1') {
      setMessage({ type: 'info', text: 'Checkout was cancelled. You can try again anytime.' })
      window.history.replaceState({}, '', '/settings/billing')
    }
  }, [searchParams])

  async function startCheckout(planKey: string) {
    setLoading(planKey)
    setMessage(null)
    try {
      const res = await fetch('/api/billing/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planKey, billing }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      setMessage({ type: 'error', text: data.error?.message ?? 'Could not start checkout. Please try again.' })
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
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
      {message && (
        <div
          role="alert"
          className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            message.type === 'success' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
            message.type === 'error' && 'border-red-500/30 bg-red-500/10 text-red-400',
            message.type === 'info' && 'border-white/20 bg-white/5 text-white/90'
          )}
        >
          {message.text}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-white">Billing & Plan</h1>
          <p className="text-sm text-white/60 mt-0.5">Manage your subscription</p>
        </div>
        <button
          onClick={openPortal}
          disabled={portalLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
        >
          <CreditCard size={14} />
          {portalLoading ? 'Loading…' : 'Manage Billing'}
          <ExternalLink size={12} className="text-white/50" />
        </button>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-3 bg-white/10 p-1 rounded-lg w-fit">
        {(['monthly', 'annual'] as const).map(b => (
          <button
            key={b}
            onClick={() => setBilling(b)}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
              billing === b ? 'bg-white/20 text-white' : 'text-white/60'
            )}
          >
            {b === 'monthly' ? 'Monthly' : 'Annual'}
            {b === 'annual' && <span className="ml-1.5 text-xs text-emerald-400 font-semibold">Save 20%</span>}
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
              plan.popular ? 'border-accent ring-1 ring-accent' : ''
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-accent text-[#0A0A0A] text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-1">
                {plan.key === 'starter' && <Zap size={15} className="text-white/50" />}
                {plan.key === 'pro'     && <Zap size={15} className="text-accent" />}
                {plan.key === 'business'&& <Building2 size={15} className="text-purple-400" />}
                <h3 className="font-bold text-white">{plan.name}</h3>
              </div>
              <div className="mt-3 mb-4">
                <span className="text-3xl font-black text-white">
                  £{billing === 'annual' ? plan.price.annual : plan.price.monthly}
                </span>
                <span className="text-sm text-white/50">/mo</span>
                {billing === 'annual' && (
                  <p className="text-xs text-white/50 mt-0.5">Billed annually</p>
                )}
              </div>
              <p className="text-xs text-white/50 mb-4">Up to {plan.subLimit} subcontractors</p>

              <ul className="space-y-2 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                    <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
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
                  ? 'bg-accent text-[#0A0A0A] hover:bg-accent-hover'
                  : 'bg-white/10 text-white hover:bg-white/15',
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

      <p className="text-xs text-white/50">
        All plans include a 14-day free trial. No credit card required to start.
        Prices shown exclude VAT. Cancel any time.
      </p>
    </div>
  )
}
