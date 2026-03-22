'use client'

import { UserButton, OrganizationSwitcher } from '@clerk/nextjs'
import { Bell, Menu } from 'lucide-react'
import Link from 'next/link'

export default function TopBar({ onMenuClick, recentNotifCount = 0 }: { onMenuClick?: () => void; recentNotifCount?: number }) {
  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0 border-b border-white/10" style={{ background: 'var(--app-bg2)' }}>
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox: 'flex items-center',
              organizationSwitcherTrigger: 'text-sm font-medium text-white/80 hover:bg-white/10 rounded-lg px-2 py-1.5 text-white',
            }
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/notifications"
          className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Bell size={18} />
          {recentNotifCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
          )}
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
