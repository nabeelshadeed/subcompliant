import { requireUser } from '@/lib/auth/require-auth'
import { db } from '@/lib/db'
import { contractors, subcontractors, subProfiles, riskScores } from '@/lib/db/schema'
import { eq, and, inArray, desc, sql, isNull } from 'drizzle-orm'
import Link from 'next/link'
import { ComplianceBadge, RiskBadge, SubStatusBadge } from '@/components/ui/Badges'
import { formatDate, formatRelative, initials } from '@/lib/utils'
import SubcontractorsClient from './SubcontractorsClient'
import EmptyState from '@/components/ui/EmptyState'
import ChaseButton from '@/components/subcontractors/ChaseButton'
import Pagination from '@/components/ui/Pagination'
import { Users } from 'lucide-react'

interface Props {
  searchParams: { q?: string; status?: string; page?: string }
}

export default async function SubcontractorList({ searchParams }: Props) {
  const user = await requireUser()
  const contractorId = user.contractorId
  const page   = parseInt(searchParams.page ?? '1')
  const limit  = 25
  const offset = (page - 1) * limit

  const contractor = await db.query.contractors.findFirst({
    where: eq(contractors.id, contractorId),
  })

  const baseWhere = and(
    eq(subcontractors.contractorId, contractorId),
    isNull(subcontractors.deletedAt),
    searchParams.status ? eq(subcontractors.status, searchParams.status as any) : undefined,
    searchParams.q
      ? sql`(${subProfiles.firstName} || ' ' || ${subProfiles.lastName} || ' ' || COALESCE(${subProfiles.companyName}, '')) ILIKE ${`%${searchParams.q}%`}`
      : undefined,
  )

  // Count all active/invited subs for the limit check (not just this page)
  const [{ totalActive }] = await db
    .select({ totalActive: sql<number>`count(*)::int` })
    .from(subcontractors)
    .where(and(
      eq(subcontractors.contractorId, contractorId),
      inArray(subcontractors.status, ['active', 'invited']),
    ))

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id:          subcontractors.id,
        status:      subcontractors.status,
        invitedAt:   subcontractors.invitedAt,
        activatedAt: subcontractors.activatedAt,
        profile: {
          id:          subProfiles.id,
          firstName:   subProfiles.firstName,
          lastName:    subProfiles.lastName,
          companyName: subProfiles.companyName,
          ownerEmail:  subProfiles.ownerEmail,
        },
        riskScore:   riskScores.score,
        riskLevel: sql<string>`
          CASE
            WHEN ${riskScores.score} <= 20 THEN 'low'
            WHEN ${riskScores.score} <= 50 THEN 'medium'
            WHEN ${riskScores.score} <= 75 THEN 'high'
            ELSE 'critical'
          END
        `,
      })
      .from(subcontractors)
      .innerJoin(subProfiles, eq(subcontractors.profileId, subProfiles.id))
      .leftJoin(riskScores, and(
        eq(riskScores.profileId, subProfiles.id),
        eq(riskScores.contractorId, contractorId),
        eq(riskScores.isCurrent, true)
      ))
      .where(baseWhere)
      .orderBy(desc(subcontractors.createdAt))
      .limit(limit)
      .offset(offset),

    db.select({ total: sql<number>`count(*)::int` })
      .from(subcontractors)
      .innerJoin(subProfiles, eq(subcontractors.profileId, subProfiles.id))
      .where(baseWhere),
  ])

  return (
    <div className="space-y-4">
      {/* Header + controls */}
      <SubcontractorsClient
        total={total}
        currentSearch={searchParams.q}
        currentStatus={searchParams.status}
        currentSubs={totalActive}
        subLimit={contractor?.subLimit ?? 10}
        plan={contractor?.plan ?? 'starter'}
      />

      {/* Table */}
      {rows.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="No subcontractors yet"
            body="Invite a subcontractor to start collecting their compliance documents."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {['Subcontractor', 'Status', 'Risk', 'Invited', 'Activated'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-white/60 uppercase tracking-wide px-5 py-3 first:pl-5">
                      {h}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.map(row => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent flex-shrink-0">
                          {initials(row.profile?.firstName, row.profile?.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {row.profile?.firstName} {row.profile?.lastName}
                          </p>
                          {row.profile?.companyName && (
                            <p className="text-xs text-white/50">{row.profile.companyName}</p>
                          )}
                          <p className="text-xs text-white/50">{row.profile?.ownerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <SubStatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      {row.riskScore != null
                        ? <RiskBadge score={row.riskScore} level={row.riskLevel} />
                        : <span className="text-xs text-white/50">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/50">
                      {row.invitedAt ? formatDate(row.invitedAt) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/50">
                      {row.activatedAt ? formatRelative(row.activatedAt) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {row.status === 'invited' && row.profile?.ownerEmail && (
                          <ChaseButton
                            email={row.profile.ownerEmail}
                            name={`${row.profile.firstName ?? ''} ${row.profile.lastName ?? ''}`.trim()}
                            contractorName={contractor?.name ?? ''}
                            subId={row.id}
                          />
                        )}
                        <Link
                          href={`/subcontractors/${row.id}`}
                          className="text-xs font-medium text-accent hover:text-accent-hover"
                        >
                          View →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} limit={limit} total={total} searchParams={searchParams} />
        </div>
      )}
    </div>
  )
}
