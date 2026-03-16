import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, subcontractors, subProfiles } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { calculateCompliance, getContractorComplianceOverview } from '@/lib/compliance-engine'
import { ComplianceBadge } from '@/components/ui/Badges'
import StatCard from '@/components/ui/StatCard'
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Compliance Overview' }

export default async function CompliancePage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect('/auth/sign-in')

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) })
  if (!user) redirect('/auth/sign-up')

  const contractorId = user.contractorId

  const overview = await getContractorComplianceOverview(contractorId)

  const subs = await db
    .select({
      id:          subcontractors.id,
      status:      subcontractors.status,
      firstName:   subProfiles.firstName,
      lastName:    subProfiles.lastName,
      companyName: subProfiles.companyName,
      profileId:   subProfiles.id,
    })
    .from(subcontractors)
    .innerJoin(subProfiles, eq(subcontractors.profileId, subProfiles.id))
    .where(and(
      eq(subcontractors.contractorId, contractorId),
      inArray(subcontractors.status, ['active', 'invited'])
    ))

  // Calculate compliance for each sub
  const subsWithCompliance = await Promise.all(
    subs.map(async sub => {
      const compliance = await calculateCompliance(sub.profileId, contractorId)
      return { ...sub, compliance }
    })
  )

  // Sort by compliance score ascending (worst first)
  subsWithCompliance.sort((a, b) => a.compliance.score - b.compliance.score)

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Compliance Overview</h1>
        <p className="text-sm text-gray-400 mt-0.5">Real-time compliance status across all subcontractors</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Compliant"          value={overview.compliant}          icon={CheckCircle2} variant="success" />
        <StatCard label="Partially Compliant" value={overview.partiallyCompliant} icon={AlertTriangle} variant="warning" />
        <StatCard label="Non-Compliant"       value={overview.nonCompliant}       icon={XCircle}      variant={overview.nonCompliant > 0 ? 'danger' : 'default'} />
        <StatCard label="Critical Alerts"     value={overview.criticalAlerts}     icon={ShieldCheck}  variant={overview.criticalAlerts > 0 ? 'danger' : 'default'} />
      </div>

      {/* Sub-by-sub table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Subcontractor Compliance — sorted by worst first
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Subcontractor', 'Status', 'Score', 'Missing', 'Expiring', 'Expired'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {subsWithCompliance.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-gray-900">{row.firstName} {row.lastName}</p>
                  {row.companyName && <p className="text-xs text-gray-400">{row.companyName}</p>}
                </td>
                <td className="px-5 py-3.5">
                  <ComplianceBadge status={row.compliance.status} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          row.compliance.score >= 80 ? 'bg-green-500' :
                          row.compliance.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${row.compliance.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 tabular-nums w-8">{row.compliance.score}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {row.compliance.missing.length > 0 ? (
                    <span className="text-xs text-red-600 font-medium">{row.compliance.missing.length}</span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {row.compliance.expiringSoon.length > 0 ? (
                    <span className="text-xs text-yellow-600 font-medium">{row.compliance.expiringSoon.length}</span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {row.compliance.expired.length > 0 ? (
                    <span className="text-xs text-orange-600 font-medium">{row.compliance.expired.length}</span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/subcontractors/${row.id}`} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
