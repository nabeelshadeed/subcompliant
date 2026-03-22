'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import TrialBanner from '@/components/ui/TrialBanner'

export default function AppShell({
  children,
  recentNotifCount,
  trialEndsAt,
  plan,
}: {
  children: React.ReactNode
  recentNotifCount: number
  trialEndsAt?: string | null
  plan?: string
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar — fixed on mobile, static on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-30 md:relative md:flex md:flex-shrink-0 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          recentNotifCount={recentNotifCount}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(o => !o)} />
        <TrialBanner trialEndsAt={trialEndsAt ?? null} plan={plan ?? 'starter'} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  )
}
