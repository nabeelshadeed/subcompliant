'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ShieldCheck, FileText,
  Bell, Settings, CreditCard, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',      label: 'Dashboard',      icon: LayoutDashboard, badge: false },
  { href: '/subcontractors', label: 'Subcontractors', icon: Users,           badge: false },
  { href: '/compliance',     label: 'Compliance',     icon: ShieldCheck,     badge: false },
  { href: '/documents',      label: 'Documents',      icon: FileText,        badge: false },
  { href: '/notifications',  label: 'Notifications',  icon: Bell,            badge: true  },
]

const BOTTOM = [
  { href: '/settings/billing', label: 'Billing',  icon: CreditCard },
  { href: '/settings',         label: 'Settings', icon: Settings   },
]

export default function Sidebar({
  recentNotifCount = 0,
  onClose,
}: {
  recentNotifCount?: number
  onClose?: () => void
}) {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }

  return (
    <aside className="w-60 flex flex-col flex-shrink-0 border-r border-white/10 h-full" style={{ background: 'var(--app-bg2)' }}>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/10 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent/20 border border-accent/30">
            <ShieldCheck className="w-4.5 h-4.5 text-accent" size={18} />
          </div>
          <span className="font-display font-bold text-white text-[15px]">Sub<span className="text-accent">Compliant</span></span>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-accent/15 text-accent border border-accent/25'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon size={16} className={isActive(href) ? 'text-accent' : 'text-white/50'} />
            <span className="flex-1">{label}</span>
            {badge && recentNotifCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[#0A0A0A] text-[10px] font-bold leading-none">
                {recentNotifCount > 99 ? '99+' : recentNotifCount}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-white/10 pt-3">
        {BOTTOM.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-accent/15 text-accent border border-accent/25'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon size={16} className={isActive(href) ? 'text-accent' : 'text-white/50'} />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
