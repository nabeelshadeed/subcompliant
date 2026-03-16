'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ShieldCheck, FileText,
  Bell, Settings, CreditCard, ChevronRight, Building2
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',         label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/subcontractors',    label: 'Subcontractors',  icon: Users },
  { href: '/compliance',        label: 'Compliance',      icon: ShieldCheck },
  { href: '/documents',         label: 'Documents',       icon: FileText },
  { href: '/notifications',     label: 'Notifications',   icon: Bell },
]

const BOTTOM = [
  { href: '/settings/billing',  label: 'Billing',         icon: CreditCard },
  { href: '/settings',          label: 'Settings',        icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <span className="font-semibold text-gray-900 text-[15px]">SubCompliant</span>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icon size={16} className={isActive(href) ? 'text-brand-600' : 'text-gray-400'} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-gray-100 pt-3">
        {BOTTOM.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(href)
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icon size={16} className={isActive(href) ? 'text-brand-600' : 'text-gray-400'} />
            {label}
          </Link>
        ))}
      </div>
    </aside>
  )
}
