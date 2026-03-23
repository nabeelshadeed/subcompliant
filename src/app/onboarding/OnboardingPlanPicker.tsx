'use client'

import { useState } from 'react'
import { Check, Zap, Building2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLANS = [
  {
    key:      'starter',
    name:     'Starter',
    price:    { monthly: 29, annual: 23 },
    subLimit: 10,
    features: ['10 subcontractors', 'Document uploads', 'Email notifications', 'Compliance dashboard'],
  },
  {
    key:      'pro',
    name:     'Pro',
    price:    { monthly: 79, annual: 63 },
    subLimit: 50,
    popular:  true,
    features: ['50 subcontractors', 'Risk scoring', 'Bulk chase', 'CSV exports', 'API access'],
  },
  {
    key:      'business',
    name:     'Business',
    price:    { monthly: 199, annual: 159 },
    subLimit: 250,
    features: ['250 subcontractors', 'Everything in Pro', 'Project management', 'Audit logs', 'Priority support'],
  },
]

export default function OnboardingPlanPicker() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  async function startCheckout(planKey: string) {
    setLoading(planKey)
    setError(null)
    try {
      const res = await fetch('/api/billing/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          planKey,
          billing,
          successPath: '/dashboard?welcome=1',
          cancelPath:  '/onboarding?cancelled=1',
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      setError(data.error?.message ?? 'Could not start checkout. Please try again.')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Trust bar */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
        <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> 7-day free trial</span>
        <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> Cancel anytime</span>
        <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-400" /> 30-day money-back guarantee</span>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg">
          {(['monthly', 'annual'] as const).map(b => (
            <button
              key={b}
              onClick={() => setBilling(b)}
              className={cn(
                'px-5 py-2 text-sm font-medium rounded-md transition-all',
                billing === b ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white'
              )}
            >
              {b === 'monthly' ? 'Monthly' : 'Annual'}
              {b === 'annual' && (
                <span className="ml-1.5 text-xs text-emerald-400 font-semibold">Save 20%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 px-4 py-3 text-sm text-center">
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
        {PLANS.map(plan => (
          <div
            key={plan.key}
            className={cn(
              'rounded-2xl border p-6 flex flex-col relative bg-[#111]',
              plan.popular
                ? 'border-accent ring-1 ring-accent'
                : 'border-white/10'
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-accent text-[#0A0A0A] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  Most Popular
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              {plan.key === 'starter'  && <Zap size={15} className="text-white/50" />}
              {plan.key === 'pro'      && <Zap size={15} className="text-accent" />}
              {plan.key === 'business' && <Building2 size={15} className="text-purple-400" />}
              <h3 className="font-bold text-white">{plan.name}</h3>
            </div>

            <div className="mt-2 mb-4">
              <span className="text-3xl font-black text-white">
                £{billing === 'annual' ? plan.price.annual : plan.price.monthly}
              </span>
              <span className="text-sm text-white/50">/mo</span>
              {billing === 'annual' && (
                <p className="text-xs text-white/40 mt-0.5">Billed annually</p>
              )}
            </div>

            <p className="text-xs text-white/50 mb-4">Up to {plan.subLimit} subcontractors</p>

            <ul className="space-y-2 mb-6 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                  <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => startCheckout(plan.key)}
              disabled={loading !== null}
              className={cn(
                'w-full py-3 text-sm font-bold rounded-xl transition-colors',
                plan.popular
                  ? 'bg-accent text-[#0A0A0A] hover:bg-accent/90 disabled:opacity-50'
                  : 'bg-white/10 text-white hover:bg-white/15 disabled:opacity-50',
              )}
            >
              {loading === plan.key ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  Loading…
                </span>
              ) : (
                `Start 7-day trial`
              )}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-white/30 max-w-md mx-auto">
        Your card is required to start the trial and will be charged after 7 days unless you cancel.
        Prices shown exclude VAT.
      </p>
    </div>
  )
}
