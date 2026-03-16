import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, subcontractors, subProfiles, riskScores } from '@/lib/db/schema'
import { eq, and, inArray, desc, sql } from 'drizzle-orm'
import Link from 'next/link'
import { ComplianceBadge, RiskBadge } from '@/components/ui/Badges'
import { formatDate, formatRelative, initials } from '@/lib/utils'
import SubcontractorsClient from './SubcontractorsClient'
import EmptyState from '@/components/ui/EmptyState'
import { Users } from 'lucide-react'

interface Props {
  searchParams: { q?: string; status?: string; page?: string }
}

export default async function SubcontractorList({ searchParams }: Props) {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect('/auth/sign-in')

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) })
  if (!user) redirect('/auth/sign-up')

  const contractorId = user.contractorId
  const page   = parseInt(searchParams.page ?? '1')
  const limit  = 25
  const offset = (page - 1) * limit

  const baseWhere = and(
    eq(subcontractors.contractorId, contractorId),
    searchParams.status ? eq(subcontractors.status, searchParams.status as any) : undefined,
    searchParams.q
      ? sql`(${subProfiles.firstName} || ' ' || ${subProfiles.lastName} || ' ' || COALESCE(${subProfiles.companyName}, '')) ILIKE ${`%${searchParams.q}%`}`
      : undefined,
  )

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
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Subcontractor', 'Status', 'Risk', 'Invited', 'Activated'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3 first:pl-5">
                      {h}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700 flex-shrink-0">
                          {initials(row.profile?.firstName, row.profile?.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {row.profile?.firstName} {row.profile?.lastName}
                          </p>
                          {row.profile?.companyName && (
                            <p className="text-xs text-gray-400">{row.profile.companyName}</p>
                          )}
                          <p className="text-xs text-gray-400">{row.profile?.ownerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        row.status === 'active'    ? 'bg-green-50 text-green-700 border-green-200' :
                        row.status === 'invited'   ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        row.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {row.riskScore != null
                        ? <RiskBadge score={row.riskScore} level={row.riskLevel} />
                        : <span className="text-xs text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {row.invitedAt ? formatDate(row.invitedAt) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {row.activatedAt ? formatRelative(row.activatedAt) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/subcontractors/${row.id}`}
                        className="text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`?page=${page - 1}`}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {offset + limit < total && (
                  <Link
                    href={`?page=${page + 1}`}
                    className="px-3 py-1.5 text-xs font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                  >
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
