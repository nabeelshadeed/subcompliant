import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { OrganizationProfile } from '@clerk/nextjs'
import Link from 'next/link'
import { Settings, CreditCard, Users, Shield } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect('/auth/sign-in')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
    with:  { contractor: true },
  })

  if (!user) redirect('/auth/sign-up')

  const { contractor } = user as any

  const settingsSections = [
    { href: '/settings',         label: 'Organisation',  icon: Settings,    active: true },
    { href: '/settings/billing', label: 'Billing & Plan', icon: CreditCard,  active: false },
  ]

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">{contractor?.name}</p>
      </div>

      {/* Settings nav */}
      <div className="flex gap-1 border-b border-gray-200">
        {settingsSections.map(s => (
          <Link
            key={s.href}
            href={s.href}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              s.active
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <s.icon size={14} />
            {s.label}
          </Link>
        ))}
      </div>

      {/* Org info card */}
      <div className="card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Organisation Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Name</p>
            <p className="text-gray-900">{contractor?.name ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Slug</p>
            <p className="text-gray-500 font-mono text-xs">{contractor?.slug}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Plan</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 capitalize">
              {contractor?.plan}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-0.5">Subcontractor limit</p>
            <p className="text-gray-900">{contractor?.subLimit}</p>
          </div>
          {contractor?.companiesHouseNo && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-0.5">Companies House No.</p>
              <p className="text-gray-900 font-mono text-xs">{contractor.companiesHouseNo}</p>
            </div>
          )}
          {contractor?.vatNumber && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-0.5">VAT Number</p>
              <p className="text-gray-900 font-mono text-xs">{contractor.vatNumber}</p>
            </div>
          )}
        </div>

        {contractor?.trialEndsAt && new Date(contractor.trialEndsAt) > new Date() && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <strong>Trial active</strong> — expires{' '}
            {new Date(contractor.trialEndsAt).toLocaleDateString('en-GB', { dateStyle: 'long' })}.{' '}
            <Link href="/settings/billing" className="underline font-medium">Upgrade now</Link> to keep access.
          </div>
        )}
      </div>

      {/* Team members via Clerk */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users size={15} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Team Members</h2>
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
          <Shield size={15} className="text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">Security & Access</h2>
        </div>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span>Row-level security (RLS)</span>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Enabled</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span>Document encryption</span>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">AES-256</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span>Audit logging</span>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span>Authentication</span>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Clerk</span>
          </div>
        </div>
      </div>
    </div>
  )
}
