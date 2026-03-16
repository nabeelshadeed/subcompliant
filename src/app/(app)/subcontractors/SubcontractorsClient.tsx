'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, UserPlus, Filter } from 'lucide-react'
import InviteModal from '@/components/subcontractors/InviteModal'

interface Props {
  total:          number
  currentSearch?: string
  currentStatus?: string
}

const STATUSES = [
  { value: '',          label: 'All' },
  { value: 'active',    label: 'Active' },
  { value: 'invited',   label: 'Invited' },
  { value: 'inactive',  label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
]

export default function SubcontractorsClient({ total, currentSearch, currentStatus }: Props) {
  const router      = useRouter()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [, startTransition] = useTransition()

  function update(params: Record<string, string>) {
    const sp = new URLSearchParams(window.location.search)
    Object.entries(params).forEach(([k, v]) => v ? sp.set(k, v) : sp.delete(k))
    sp.delete('page')
    startTransition(() => router.push(`?${sp.toString()}`))
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Subcontractors</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} total</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              defaultValue={currentSearch}
              placeholder="Search by name…"
              onChange={e => update({ q: e.target.value })}
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-48"
            />
          </div>

          {/* Status filter */}
          <select
            defaultValue={currentStatus ?? ''}
            onChange={e => update({ status: e.target.value })}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            <UserPlus size={14} />
            Invite
          </button>
        </div>
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
