import { getServerUserId } from '@/lib/auth/get-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, contractors, subcontractors, complianceDocuments, notifications, documentTypes } from '@/lib/db/schema'
import { eq, and, desc, inArray, sql } from 'drizzle-orm'
import { getContractorComplianceOverview } from '@/lib/compliance-engine'
import StatCard from '@/components/ui/StatCard'
import { ComplianceBadge, RiskBadge } from '@/components/ui/Badges'
import { formatDate, formatRelative } from '@/lib/utils'
import {
  Users, ShieldCheck, AlertTriangle, FileText,
  TrendingUp, Bell, Clock, CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const clerkUserId = await getServerUserId()
  if (!clerkUserId) redirect('/auth/sign-in')

  let user: Awaited<ReturnType<typeof db.query.users.findFirst>>
  let contractor: Awaited<ReturnType<typeof db.query.contractors.findFirst>>
  try {
    user = await db.query.users.findFirst({
      where: eq(users.clerkUserId, clerkUserId),
    })
    if (!user) redirect('/auth/sign-up')
    contractor = await db.query.contractors.findFirst({
      where: eq(contractors.id, user.contractorId),
    })
  } catch {
    redirect('/setup')
  }

  if (!contractor) redirect('/setup')
  const contractorId = user.contractorId

  // Parallel data fetch
  let overview: Awaited<ReturnType<typeof getContractorComplianceOverview>>
  let totalSubs: number
  let recentDocs: Array<{ id: string; status: string; submittedAt: Date; docTypeName: string | null }>
  let recentNotifs: Awaited<ReturnType<typeof db.query.notifications.findMany>>
  try {
    const result = await Promise.all([
      getContractorComplianceOverview(contractorId),
      db.select({ count: sql<number>`count(*)::int` })
        .from(subcontractors)
        .where(and(
          eq(subcontractors.contractorId, contractorId),
          inArray(subcontractors.status, ['active', 'invited'])
        ))
        .then(r => r[0]?.count ?? 0),
      db
        .select({
          id: complianceDocuments.id,
          status: complianceDocuments.status,
          submittedAt: complianceDocuments.submittedAt,
          docTypeName: documentTypes.name,
        })
        .from(complianceDocuments)
        .innerJoin(subcontractors, eq(subcontractors.profileId, complianceDocuments.profileId))
        .innerJoin(documentTypes, eq(complianceDocuments.documentTypeId, documentTypes.id))
        .where(and(
          eq(subcontractors.contractorId, contractorId),
          eq(complianceDocuments.isCurrent, true),
        ))
        .orderBy(desc(complianceDocuments.submittedAt))
        .limit(5),
      db.query.notifications.findMany({
        where: eq(notifications.contractorId, contractorId),
        orderBy: (n, { desc }) => [desc(n.createdAt)],
        limit: 5,
      }),
    ])
    ;[overview, totalSubs, recentDocs, recentNotifs] = result
  } catch {
    redirect('/setup')
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold font-display text-white">
          Good {getTimeOfDay()}, {user.firstName ?? 'there'} 👋
        </h1>
        <p className="text-sm text-white/60 mt-0.5">
          {contractor.name} · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Onboarding CTA — only shown when account is brand new */}
      {totalSubs === 0 && (
        <div className="card p-6 border border-accent/20 bg-accent/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={18} className="text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-white mb-1">Get started in 3 steps</h2>
              <p className="text-sm text-white/60 mb-4">Add your first subcontractor, send them a magic-link invite, and approve their documents — your compliance dashboard will populate automatically.</p>
              <div className="flex flex-wrap gap-2">
                <Link href="/subcontractors" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-[#0A0A0A] text-sm font-semibold hover:bg-accent/90 transition-colors">
                  <Users size={14} /> Add first subcontractor
                </Link>
                <Link href="/documents" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-colors">
                  <FileText size={14} /> View documents
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Subcontractors"
          value={totalSubs}
          sub={`${contractor.subLimit - totalSubs} slots remaining`}
          icon={Users}
        />
        <StatCard
          label="Compliant"
          value={overview.compliant}
          sub={`${overview.percentCompliant}% of total`}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          label="Partially Compliant"
          value={overview.partiallyCompliant}
          sub="Missing some documents"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          label="Non-Compliant"
          value={overview.nonCompliant}
          sub={`${overview.criticalAlerts} critical alerts`}
          icon={ShieldCheck}
          variant={overview.nonCompliant > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Compliance bar */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Compliance Rate</h2>
          <span className="text-sm font-bold font-display text-white">{overview.percentCompliant}%</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${overview.percentCompliant}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-white/60">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Compliant ({overview.compliant})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Partial ({overview.partiallyCompliant})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" /> Non-compliant ({overview.nonCompliant})
          </span>
        </div>
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent document activity */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Recent Documents</h2>
            <Link href="/documents" className="text-xs text-accent hover:text-accent-hover font-medium">
              View all
            </Link>
          </div>
          {recentDocs.length === 0 ? (
            <div className="py-10 text-center text-sm text-white/50">
              No documents yet — invite a subcontractor to get started
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {recentDocs.map(doc => (
                <li key={doc.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {doc.docTypeName ?? 'Document'}
                    </p>
                    <p className="text-xs text-white/50">{formatRelative(doc.submittedAt)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    doc.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    doc.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {doc.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent notifications */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Notifications</h2>
            <Link href="/notifications" className="text-xs text-accent hover:text-accent-hover font-medium">
              View all
            </Link>
          </div>
          {recentNotifs.length === 0 ? (
            <div className="py-10 text-center text-sm text-white/50">No notifications</div>
          ) : (
            <ul className="divide-y divide-white/10">
              {recentNotifs.map(n => (
                <li key={n.id} className="flex items-start gap-3 px-5 py-3 hover:bg-white/5">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    n.severity === 'critical' ? 'bg-red-400' :
                    n.severity === 'warning'  ? 'bg-amber-400' : 'bg-accent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white line-clamp-1">{n.subject ?? n.eventType}</p>
                    <p className="text-xs text-white/50 mt-0.5">{formatRelative(n.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <DashboardClient />
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
