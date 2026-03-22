import { requireUser } from '@/lib/auth/require-auth'
import { OrganizationProfile } from '@clerk/nextjs'
import Link from 'next/link'
import { Settings, CreditCard, Users, Shield } from 'lucide-react'
import { Metadata } from 'next'
import OrgEditForm from './OrgEditForm'
import DangerZone from './DangerZone'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const user = await requireUser()
  const contractor = user.contractor

  const settingsSections = [
    { href: '/settings',         label: 'Organisation',  icon: Settings,    active: true },
    { href: '/settings/billing', label: 'Billing & Plan', icon: CreditCard,  active: false },
  ]

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold font-display text-white">Settings</h1>
        <p className="text-sm text-white/60 mt-0.5">{contractor?.name}</p>
      </div>

      {/* Settings nav */}
      <div className="flex gap-1 border-b border-white/10">
        {settingsSections.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              s.active
                ? 'border-accent text-accent'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <s.icon size={14} />
            {s.label}
          </Link>
        ))}
      </div>

      {/* Plan / slug info card */}
      <div className="card p-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-white/50 mb-0.5">Slug</p>
            <p className="text-white/60 font-mono text-xs">{contractor?.slug}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-white/50 mb-0.5">Plan</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30 capitalize">
              {contractor?.plan}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-white/50 mb-0.5">Subcontractor limit</p>
            <p className="text-white">{contractor?.subLimit}</p>
          </div>
        </div>

        {contractor?.trialEndsAt && new Date(contractor.trialEndsAt) > new Date() && (
          <div className="mt-4 p-3 bg-amber-500/15 border border-amber-500/30 rounded-lg text-sm text-amber-300">
            <strong>Trial active</strong> — expires{' '}
            {new Date(contractor.trialEndsAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}.{' '}
            <Link href="/settings/billing" className="underline font-medium text-accent">Upgrade now</Link> to keep access.
          </div>
        )}
      </div>

      {/* Editable org details */}
      <OrgEditForm contractor={contractor} />

      {/* Team members via Clerk */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2">
          <Users size={15} className="text-white/50" />
          <h2 className="text-sm font-semibold text-white">Team Members</h2>
        </div>
        <div className="p-5">
          <OrganizationProfile
            appearance={{
              elements: {
                rootBox:  'w-full',
                card:     'shadow-none border-0 p-0',
                navbar:   'hidden',
                pageScrollBox: 'p-0',
              }
            }}
          />
        </div>
      </div>

      {/* Security */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={15} className="text-white/50" />
          <h2 className="text-sm font-semibold text-white">Security & Access</h2>
        </div>
        <div className="space-y-3 text-sm text-white/80">
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span>Row-level security (RLS)</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">Enabled</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span>Document encryption</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">AES-256</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span>Audit logging</span>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span>Authentication</span>
            <span className="text-xs font-medium text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">Clerk</span>
          </div>
        </div>
      </div>

      {/* Data export + danger zone */}
      <div>
        <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Data & Account</h2>
        <DangerZone isOwner={(user as any).role === 'owner'} />
      </div>
    </div>
  )
}
