'use client'

import { useState } from 'react'
import { UserPlus, Link2 } from 'lucide-react'
import InviteModal from '@/components/subcontractors/InviteModal'

export default function DashboardClient() {
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
        >
          <UserPlus size={15} />
          Invite Subcontractor
        </button>
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </>
  )
}
