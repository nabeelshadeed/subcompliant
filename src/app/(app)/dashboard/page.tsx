import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, subcontractors, complianceDocuments, notifications } from '@/lib/db/schema'
import { eq, and, desc, inArray, gte, sql } from 'drizzle-orm'
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
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect('/auth/sign-in')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
    with:  { contractor: true },
  })

  if (!user) redirect('/auth/sign-up')

  const contractorId = user.contractorId

  // Parallel data fetch
  const [overview, totalSubs, recentDocs, recentNotifs] = await Promise.all([
    getContractorComplianceOverview(contractorId),
    db.select({ count: sql<number>`count(*)::int` })
      .from(subcontractors)
      .where(and(
        eq(subcontractors.contractorId, contractorId),
        inArray(subcontractors.status, ['active', 'invited'])
      ))
      .then(r => r[0]?.count ?? 0),
    db.query.complianceDocuments.findMany({
      where: and(
        sql`EXISTS (
          SELECT 1 FROM subcontractors s
          JOIN sub_profiles sp ON s.profile_id = sp.id
          WHERE sp.id = compliance_documents.profile_id
          AND s.contractor_id = ${contractorId}
        )`
      ),
      orderBy: (d, { desc }) => [desc(d.submittedAt)],
      limit: 5,
      with: { documentType: true },
    }),
    db.query.notifications.findMany({
      where: eq(notifications.contractorId, contractorId),
      orderBy: (n, { desc }) => [desc(n.createdAt)],
      limit: 5,
    }),
  ])

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          Good {getTimeOfDay()}, {user.firstName ?? 'there'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {user.contractor.name} · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Subcontractors"
          value={totalSubs}
          sub={`${user.contractor.subLimit - totalSubs} slots remaining`}
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
          <h2 className="text-sm font-semibold text-gray-900">Compliance Rate</h2>
          <span className="text-sm font-bold text-gray-900">{overview.percentCompliant}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all"
            style={{ width: `${overview.percentCompliant}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Compliant ({overview.compliant})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400" /> Partial ({overview.partiallyCompliant})
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
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent Documents</h2>
            <Link href="/documents" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              View all
            </Link>
          </div>
          {recentDocs.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">
              No documents yet — invite a subcontractor to get started
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentDocs.map(doc => (
                <li key={doc.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {(doc as any).documentType?.name ?? 'Document'}
                    </p>
                    <p className="text-xs text-gray-400">{formatRelative(doc.submittedAt)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    doc.status === 'approved' ? 'bg-green-50 text-green-700' :
                    doc.status === 'rejected' ? 'bg-red-50 text-red-700' :
                    'bg-gray-100 text-gray-500'
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
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Notifications</h2>
            <Link href="/notifications" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              View all
            </Link>
          </div>
          {recentNotifs.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No notifications</div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentNotifs.map(n => (
                <li key={n.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    n.severity === 'critical' ? 'bg-red-500' :
                    n.severity === 'warning'  ? 'bg-yellow-400' : 'bg-blue-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-1">{n.subject ?? n.eventType}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatRelative(n.createdAt)}</p>
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
