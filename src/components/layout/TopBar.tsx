'use client'

import { UserButton, OrganizationSwitcher } from '@clerk/nextjs'
import { Bell } from 'lucide-react'
import Link from 'next/link'

export default function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox:        'flex items-center',
              organizationSwitcherTrigger: 'text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg px-2 py-1.5',
            }
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell size={18} />
        </Link>

        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8',
            }
          }}
          afterSignOutUrl="/"
        />
      </div>
    </header>
  )
}
