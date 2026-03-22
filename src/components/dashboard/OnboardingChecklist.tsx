'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, UserPlus, FileText, Building2, ShieldCheck, X } from 'lucide-react'
import Link from 'next/link'

export interface OnboardingStep {
  id:        string
  label:     string
  detail:    string
  done:      boolean
  href?:     string
  action?:   string
}

interface Props {
  steps:       OnboardingStep[]
  companyName: string
}

export default function OnboardingChecklist({ steps, companyName }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const doneCount = steps.filter(s => s.done).length
  const total     = steps.length
  const allDone   = doneCount === total
  const pct       = Math.round((doneCount / total) * 100)

  // Don't show at all once fully complete and user has seen it (after 1 day)
  // Simple: show until all done — let them dismiss manually once complete
  if (allDone) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={18} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-300">Setup complete</p>
          <p className="text-xs text-emerald-400/80 mt-0.5">You&apos;re all set up. Compliance tracking is running automatically.</p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/20 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
      >
        {/* Progress ring */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
            <circle
              cx="24" cy="24" r="20" fill="none"
              stroke="#CCFF00" strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 20}`}
              strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-accent">
            {doneCount}/{total}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Get started with SubCompliant</p>
          <p className="text-xs text-white/60 mt-0.5">
            {doneCount === 0
              ? 'Complete these steps to get full value from the platform'
              : `${total - doneCount} step${total - doneCount === 1 ? '' : 's'} remaining to complete your setup`}
          </p>
          {/* Progress bar */}
          <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden w-48">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {collapsed ? <ChevronDown size={16} className="text-white/50 flex-shrink-0" /> : <ChevronUp size={16} className="text-white/50 flex-shrink-0" />}
      </button>

      {/* Steps */}
      {!collapsed && (
        <div className="border-t border-white/10 divide-y divide-white/10">
          {steps.map((step, i) => (
            <div key={step.id} className={`flex items-start gap-4 px-5 py-3.5 ${step.done ? 'opacity-60' : ''}`}>
              <div className="mt-0.5 flex-shrink-0">
                {step.done
                  ? <CheckCircle2 size={18} className="text-accent" />
                  : <Circle size={18} className="text-white/30" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.done ? 'line-through text-white/50' : 'text-white'}`}>
                  {step.label}
                </p>
                {!step.done && (
                  <p className="text-xs text-white/50 mt-0.5">{step.detail}</p>
                )}
              </div>
              {!step.done && step.href && (
                <Link
                  href={step.href}
                  className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent/15 border border-accent/30 text-accent hover:bg-accent/25 transition-colors"
                >
                  {step.action ?? 'Do it →'}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
