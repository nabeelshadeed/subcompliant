'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, Lock, Users } from 'lucide-react'
import InviteModal from '@/components/subcontractors/InviteModal'
import BulkInviteModal from '@/components/subcontractors/BulkInviteModal'
import UpgradeModal from '@/components/ui/UpgradeModal'
import { useQueryString } from '@/hooks/useQueryString'

interface Props {
  total:          number
  currentSearch?: string
  currentStatus?: string
  currentSubs?:   number
  subLimit?:      number
  plan?:          string
}

const STATUSES = [
  { value: '',          label: 'All' },
  { value: 'active',    label: 'Active' },
  { value: 'invited',   label: 'Invited' },
  { value: 'inactive',  label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
]

export default function SubcontractorsClient({ total, currentSearch, currentStatus, currentSubs = 0, subLimit = 10, plan = 'starter' }: Props) {
  const router       = useRouter()
  const [inviteOpen,  setInviteOpen]  = useState(false)
  const [bulkOpen,    setBulkOpen]    = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const update    = useQueryString()
  const atLimit   = currentSubs >= subLimit

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold font-display text-white">Subcontractors</h1>
          <p className="text-sm text-white/60 mt-0.5">{total} total</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              defaultValue={currentSearch}
              placeholder="Search by name…"
              onChange={e => update({ q: e.target.value })}
              className="pl-8 pr-3 py-2 text-sm border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white/5 text-white placeholder:text-white/40 w-48"
            />
          </div>

          {/* Status filter */}
          <select
            defaultValue={currentStatus ?? ''}
            onChange={e => update({ status: e.target.value })}
            className="px-3 py-2 text-sm border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-white/5 text-white"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value} className="bg-[#111]">{s.label}</option>
            ))}
          </select>

          <button
            onClick={() => setBulkOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 text-white/70 text-sm font-medium rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            <Users size={14} />
            Bulk invite
          </button>

          {atLimit ? (
            <button
              onClick={() => setUpgradeOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors"
            >
              <Lock size={14} />
              Invite ({currentSubs}/{subLimit})
            </button>
          ) : (
            <button
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
            >
              <UserPlus size={14} />
              Invite
            </button>
          )}
        </div>
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <BulkInviteModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        featureName="Subcontractor limit reached"
        reason={`Your ${plan} plan supports up to ${subLimit} subcontractors. Upgrade to Pro to manage up to 50 — and unlock compliance scores, HSE audit reports, and SMS alerts.`}
        bullets={[
          `Up to 50 subcontractors (you have ${currentSubs})`,
          'Real-time compliance scores & risk ratings',
          'One-click HSE audit PDF reports',
          'SMS expiry alerts direct to subcontractors',
          '3 user seats included',
        ]}
      />
    </>
  )
}
