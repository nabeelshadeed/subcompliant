import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, complianceDocuments, documentTypes, subProfiles, subcontractors } from '@/lib/db/schema'
import { eq, and, desc, ilike, sql } from 'drizzle-orm'
import { DocStatusBadge } from '@/components/ui/Badges'
import { formatDate, formatBytes, buildQueryString } from '@/lib/utils'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import EmptyState from '@/components/ui/EmptyState'
import DocumentFilters from '@/components/documents/DocumentFilters'
import { DownloadButton } from '@/components/documents/DownloadButton'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Documents' }

interface Props {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>
}

const STATUSES   = ['pending', 'processing', 'approved', 'rejected', 'expired']

export default async function DocumentsPage({ searchParams }: Props) {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect('/auth/sign-in')

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) })
  if (!user) redirect('/auth/sign-up')

  const contractorId = user.contractorId
  const sp = await searchParams
  const page   = parseInt(sp.page ?? '1')
  const limit  = 30
  const offset = (page - 1) * limit

  // Subquery: profile IDs belonging to this contractor
  const profileIdsSq = db
    .select({ profileId: subcontractors.profileId })
    .from(subcontractors)
    .where(eq(subcontractors.contractorId, contractorId))

  const listWhere = and(
    eq(complianceDocuments.isCurrent, true),
    sql`${complianceDocuments.profileId} IN (${profileIdsSq})`,
    sp.status ? eq(complianceDocuments.status, sp.status as 'pending' | 'processing' | 'approved' | 'rejected' | 'expired' | 'superseded') : undefined,
    sp.category ? eq(documentTypes.category, sp.category) : undefined,
    sp.q
      ? sql`(${documentTypes.name} || ' ' || COALESCE(${subProfiles.firstName}, '') || ' ' || COALESCE(${subProfiles.lastName}, '')) ILIKE ${`%${sp.q}%`}`
      : undefined,
  )

  const [rows, countResult] = await Promise.all([
    db
      .select({
        id:              complianceDocuments.id,
        status:          complianceDocuments.status,
        fileName:        complianceDocuments.fileName,
        fileSizeBytes:   complianceDocuments.fileSizeBytes,
        fileKey:         complianceDocuments.fileKey,
        expiresAt:       complianceDocuments.expiresAt,
        submittedAt:     complianceDocuments.submittedAt,
        isVerified:      complianceDocuments.isVerified,
        policyNumber:    complianceDocuments.policyNumber,
        coverageAmount:  complianceDocuments.coverageAmount,
        docTypeName:     documentTypes.name,
        docTypeCategory: documentTypes.category,
        subFirstName:    subProfiles.firstName,
        subLastName:     subProfiles.lastName,
        subCompanyName:  subProfiles.companyName,
        profileId:       subProfiles.id,
      })
      .from(complianceDocuments)
      .innerJoin(documentTypes,  eq(complianceDocuments.documentTypeId, documentTypes.id))
      .innerJoin(subProfiles,    eq(complianceDocuments.profileId, subProfiles.id))
      .where(listWhere)
      .orderBy(desc(complianceDocuments.submittedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: sql<number>`count(*)::int` })
      .from(complianceDocuments)
      .innerJoin(documentTypes, eq(complianceDocuments.documentTypeId, documentTypes.id))
      .innerJoin(subProfiles,   eq(complianceDocuments.profileId, subProfiles.id))
      .where(listWhere),
  ])
  const total = countResult[0]?.total ?? 0

  // Counts per status for filter pills (same base filter; category and q don't change status counts)
  const statusCounts = await db
    .select({
      status: complianceDocuments.status,
      count:  sql<number>`count(*)::int`,
    })
    .from(complianceDocuments)
    .innerJoin(documentTypes, eq(complianceDocuments.documentTypeId, documentTypes.id))
    .innerJoin(subProfiles, eq(complianceDocuments.profileId, subProfiles.id))
    .where(and(
      eq(complianceDocuments.isCurrent, true),
      sql`${complianceDocuments.profileId} IN (${profileIdsSq})`,
      sp.category ? eq(documentTypes.category, sp.category) : undefined,
      sp.q
        ? sql`(${documentTypes.name} || ' ' || COALESCE(${subProfiles.firstName}, '') || ' ' || COALESCE(${subProfiles.lastName}, '')) ILIKE ${`%${sp.q}%`}`
        : undefined,
    ))
    .groupBy(complianceDocuments.status)

  const countMap = Object.fromEntries(statusCounts.map(r => [r.status, r.count]))

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold font-display text-white">Documents</h1>
          <p className="text-sm text-white/60 mt-0.5">{total} documents across all subcontractors</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Suspense>
          <DocumentFilters
            currentSearch={sp.q}
            currentStatus={sp.status}
            currentCategory={sp.category}
          />
        </Suspense>

        {/* Status pills */}
        <div className="flex gap-1.5 flex-wrap">
          <FilterPill href="?" label="All" count={total} active={!sp.status} />
          {STATUSES.map(s => (
            <FilterPill
              key={s}
              href={`?status=${s}${sp.q ? `&q=${sp.q}` : ''}`}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              count={countMap[s] ?? 0}
              active={sp.status === s}
            />
          ))}
        </div>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title="No documents found"
            body="Documents uploaded by your subcontractors will appear here."
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {['Document', 'Subcontractor', 'Status', 'Expires', 'Uploaded', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-white/60 uppercase tracking-wide px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.map(row => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          row.docTypeCategory === 'insurance'    ? 'bg-blue-500/20' :
                          row.docTypeCategory === 'certification'? 'bg-purple-500/20' :
                          row.docTypeCategory === 'legal'        ? 'bg-orange-500/20' :
                          'bg-white/10'
                        }`}>
                          <FileText size={14} className={
                            row.docTypeCategory === 'insurance'    ? 'text-blue-400' :
                            row.docTypeCategory === 'certification'? 'text-purple-400' :
                            row.docTypeCategory === 'legal'        ? 'text-orange-400' :
                            'text-white/50'
                          } />
                        </div>
                        <div>
                          <p className="font-medium text-white">{row.docTypeName}</p>
                          {row.fileName && (
                            <p className="text-xs text-white/50 truncate max-w-[180px]">{row.fileName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-white">{row.subFirstName} {row.subLastName}</p>
                      {row.subCompanyName && (
                        <p className="text-xs text-white/50">{row.subCompanyName}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <DocStatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      {row.expiresAt ? (
                        <span className={
                          new Date(row.expiresAt) < new Date()
                            ? 'text-red-400 font-semibold'
                            : new Date(row.expiresAt) < new Date(Date.now() + 30 * 86400000)
                            ? 'text-amber-400 font-medium'
                            : 'text-white/50'
                        }>
                          {formatDate(row.expiresAt)}
                        </span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-white/50">
                      {formatDate(row.submittedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {row.fileKey && row.status === 'approved' ? (
                        <DownloadButton documentId={row.id} />
                      ) : (
                        <span className="text-xs text-white/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > limit && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
              <p className="text-xs text-white/50">
                Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={buildQueryString({ ...sp, page: String(page - 1) })}
                    className="px-3 py-1.5 text-xs font-medium border border-white/20 rounded-lg hover:bg-white/10 text-white"
                  >
                    Previous
                  </Link>
                )}
                {offset + limit < total && (
                  <Link
                    href={buildQueryString({ ...sp, page: String(page + 1) })}
                    className="px-3 py-1.5 text-xs font-medium bg-accent text-[#0A0A0A] rounded-lg hover:bg-accent-hover"
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

function FilterPill({ href, label, count, active }: {
  href: string; label: string; count: number; active: boolean
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-accent text-[#0A0A0A]'
          : 'bg-white/10 border border-white/20 text-white/80 hover:bg-white/15'
      }`}
    >
      {label}
      <span className={`tabular-nums ${active ? 'text-[#0A0A0A]/80' : 'text-white/50'}`}>{count}</span>
    </Link>
  )
}
