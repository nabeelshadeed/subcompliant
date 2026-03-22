import { requireUser } from '@/lib/auth/require-auth'
import { db } from '@/lib/db'
import { subcontractors, subProfiles } from '@/lib/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { calculateCompliance, getContractorComplianceOverview } from '@/lib/compliance-engine'
import { ComplianceBadge } from '@/components/ui/Badges'
import StatCard from '@/components/ui/StatCard'
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Clock, FileBarChart } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Compliance Overview' }

export default async function CompliancePage() {
  const user = await requireUser()
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
        <h1 className="text-xl font-bold font-display text-white">Compliance Overview</h1>
        <p className="text-sm text-white/60 mt-0.5">Real-time compliance status across all subcontractors</p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/compliance/expiry"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/70 text-sm font-medium rounded-lg hover:bg-white/10 hover:text-white transition-colors"
        >
          <Clock size={14} />
          Expiry Timeline
        </Link>
        <Link
          href="/compliance/report"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/70 text-sm font-medium rounded-lg hover:bg-white/10 hover:text-white transition-colors"
        >
          <FileBarChart size={14} />
          Audit Report
        </Link>
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
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">
            Subcontractor Compliance — sorted by worst first
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              {['Subcontractor', 'Status', 'Score', 'Missing', 'Expiring', 'Expired'].map(h => (
                <th key={h} className="text-left text-xs font-semibold text-white/60 uppercase tracking-wide px-5 py-3">{h}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {subsWithCompliance.map(row => (
              <tr key={row.id} className="hover:bg-white/5 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-white">{row.firstName} {row.lastName}</p>
                  {row.companyName && <p className="text-xs text-white/50">{row.companyName}</p>}
                </td>
                <td className="px-5 py-3.5">
                  <ComplianceBadge status={row.compliance.status} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          row.compliance.score >= 80 ? 'bg-emerald-400' :
                          row.compliance.score >= 50 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${row.compliance.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white tabular-nums w-8">{row.compliance.score}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {row.compliance.missing.length > 0 ? (
                    <span className="text-xs text-red-400 font-medium">{row.compliance.missing.length}</span>
                  ) : (
                    <span className="text-xs text-white/40">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {row.compliance.expiringSoon.length > 0 ? (
                    <span className="text-xs text-amber-400 font-medium">{row.compliance.expiringSoon.length}</span>
                  ) : (
                    <span className="text-xs text-white/40">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {row.compliance.expired.length > 0 ? (
                    <span className="text-xs text-orange-400 font-medium">{row.compliance.expired.length}</span>
                  ) : (
                    <span className="text-xs text-white/40">—</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/subcontractors/${row.id}`} className="text-xs font-medium text-accent hover:text-accent-hover">
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
