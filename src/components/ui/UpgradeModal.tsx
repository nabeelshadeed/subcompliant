'use client'

import { useState } from 'react'
import { X, Check, Zap, Lock } from 'lucide-react'

interface Props {
  open:        boolean
  onClose:     () => void
  featureName: string
  reason:      string
  bullets?:    string[]
}

const DEFAULT_BULLETS = [
  'Up to 50 subcontractors (5× more than Starter)',
  'Real-time compliance scores & risk ratings',
  'One-click HSE audit PDF reports',
  'SMS expiry alerts direct to subcontractors',
  'Multi-site management + 3 user seats',
]

export default function UpgradeModal({ open, onClose, featureName, reason, bullets }: Props) {
  const [billing,  setBilling]  = useState<'monthly' | 'annual'>('monthly')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  if (!open) return null

  const price = billing === 'annual' ? '£63' : '£79'
  const items = bullets ?? DEFAULT_BULLETS

  async function upgrade() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/billing/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ planKey: 'pro', billing }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      setError(data.error?.message ?? 'Could not start checkout. Please try again.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-accent/30 bg-[#111] shadow-2xl shadow-black/60"
        style={{ boxShadow: '0 0 60px rgba(204,255,0,0.08)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <Lock size={18} className="text-accent" />
            </div>
            <div>
              <p className="text-xs text-accent font-semibold uppercase tracking-wider">Pro feature</p>
              <h2 className="text-base font-bold text-white leading-tight">{featureName}</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-white/70 leading-relaxed">{reason}</p>

          {/* Feature list */}
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/80">
                <Check size={14} className="text-accent mt-0.5 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {/* Billing toggle */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {(['monthly', 'annual'] as const).map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setBilling(b)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  billing === b ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white'
                }`}
              >
                {b === 'monthly' ? 'Monthly' : 'Annual'}
                {b === 'annual' && <span className="ml-1.5 text-accent">−20%</span>}
              </button>
            ))}
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={upgrade}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-accent text-[#0A0A0A] font-bold text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" />
                Starting checkout…
              </>
            ) : (
              <>
                <Zap size={15} />
                Upgrade to Pro — {price}/mo
              </>
            )}
          </button>

          <p className="text-center text-xs text-white/40">
            14-day money-back guarantee · No long-term contract · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}
