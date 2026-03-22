'use client'

import { useState } from 'react'
import { Clock, X, Zap } from 'lucide-react'
import UpgradeModal from './UpgradeModal'

interface Props {
  trialEndsAt: string | null   // ISO string
  plan:        string
}

function daysLeft(trialEndsAt: string): number {
  const diff = new Date(trialEndsAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export default function TrialBanner({ trialEndsAt, plan }: Props) {
  const [dismissed,    setDismissed]    = useState(false)
  const [upgradeOpen,  setUpgradeOpen]  = useState(false)

  // Only show during trial on non-paid plans
  if (!trialEndsAt || plan !== 'starter') return null
  if (dismissed) return null

  const ends = new Date(trialEndsAt)
  const now  = new Date()
  const days = daysLeft(trialEndsAt)

  // Don't show if trial is more than 7 days away OR already expired
  if (ends > now && days > 7) return null
  if (ends < now) return null   // expired → different UI (settings page handles this)

  const isUrgent  = days <= 3
  const isCritical = days === 0

  const bgColour  = isCritical ? 'bg-red-500/15 border-red-500/30'   : isUrgent ? 'bg-amber-500/15 border-amber-500/30'   : 'bg-accent/10 border-accent/20'
  const textColour = isCritical ? 'text-red-300'   : isUrgent ? 'text-amber-300'   : 'text-white/90'
  const badgeColour = isCritical ? 'bg-red-500/25 text-red-300 border-red-500/30' : isUrgent ? 'bg-amber-500/25 text-amber-300 border-amber-500/30' : 'bg-accent/20 text-accent border-accent/30'

  const label = isCritical
    ? 'Your free trial ends today'
    : `Your free trial ends in ${days} day${days === 1 ? '' : 's'}`

  return (
    <>
      <div className={`flex items-center gap-3 px-4 py-2.5 border-b text-xs ${bgColour} ${textColour} flex-shrink-0`}>
        <Clock size={13} className="flex-shrink-0" />

        <span className="flex-1 font-medium">{label}. Upgrade to Pro to keep full access.</span>

        <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColour}`}>
          {days === 0 ? 'Expires today' : `${days}d left`}
        </span>

        <button
          type="button"
          onClick={() => setUpgradeOpen(true)}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent text-[#0A0A0A] font-semibold text-xs hover:bg-accent/90 transition-colors"
        >
          <Zap size={11} />
          Upgrade
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded text-current/50 hover:text-current transition-colors"
          aria-label="Dismiss"
        >
          <X size={13} />
        </button>
      </div>

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        featureName="Upgrade to Pro"
        reason="Your trial is ending soon. Upgrade now to keep all your subcontractor data, compliance tracking, and expiry alerts — without interruption."
      />
    </>
  )
}
