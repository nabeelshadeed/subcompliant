import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, complianceDocuments, documentTypes, subProfiles, subcontractors } from '@/lib/db/schema'
import { eq, and, desc, ilike, sql } from 'drizzle-orm'
import { DocStatusBadge } from '@/components/ui/Badges'
import { formatDate, formatBytes } from '@/lib/utils'
import { FileText, Download } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import EmptyState from '@/components/ui/EmptyState'
import DocumentFilters from '@/components/documents/DocumentFilters'
import { getPresignedDownloadUrl } from '@/lib/r2'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Documents' }

interface Props {
  searchParams: { q?: string; status?: string; category?: string; page?: string }
}

const STATUSES   = ['pending', 'processing', 'approved', 'rejected', 'expired']

export default async function DocumentsPage({ searchParams }: Props) {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect('/auth/sign-in')

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) })
  if (!user) redirect('/auth/sign-up')

  const contractorId = user.contractorId
  const page   = parseInt(searchParams.page ?? '1')
  const limit  = 30
  const offset = (page - 1) * limit

  // Subquery: profile IDs belonging to this contractor
  const profileIdsSq = db
    .select({ profileId: subcontractors.profileId })
    .from(subcontractors)
    .where(eq(subcontractors.contractorId, contractorId))

  const rows = await db
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
    .where(and(
      eq(complianceDocuments.isCurrent, true),
      sql`${complianceDocuments.profileId} IN (${profileIdsSq})`,
      searchParams.status   ? eq(complianceDocuments.status, searchParams.status as any)   : undefined,
      searchParams.category ? eq(documentTypes.category, searchParams.category)            : undefined,
      searchParams.q
        ? sql`(${documentTypes.name} || ' ' || COALESCE(${subProfiles.firstName}, '') || ' ' || COALESCE(${subProfiles.lastName}, '')) ILIKE ${`%${searchParams.q}%`}`
        : undefined,
    ))
    .orderBy(desc(complianceDocuments.submittedAt))
    .limit(limit)
    .offset(offset)

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(complianceDocuments)
    .innerJoin(documentTypes, eq(complianceDocuments.documentTypeId, documentTypes.id))
    .innerJoin(subProfiles,   eq(complianceDocuments.profileId, subProfiles.id))
    .where(and(
      eq(complianceDocuments.isCurrent, true),
      sql`${complianceDocuments.profileId} IN (${profileIdsSq})`,
    ))

  // Generate download URLs
  const rowsWithUrls = await Promise.all(
    rows.map(async r => ({
      ...r,
      downloadUrl: r.fileKey && r.status === 'approved'
        ? await getPresignedDownloadUrl(r.fileKey).catch(() => null)
        : null,
    }))
  )

  // Counts per status for filter pills
  const statusCounts = await db
    .select({
      status: complianceDocuments.status,
      count:  sql<number>`count(*)::int`,
    })
    .from(complianceDocuments)
    .innerJoin(subProfiles, eq(complianceDocuments.profileId, subProfiles.id))
    .where(and(
      eq(complianceDocuments.isCurrent, true),
      sql`${complianceDocuments.profileId} IN (${profileIdsSq})`,
    ))
    .groupBy(complianceDocuments.status)

  const countMap = Object.fromEntries(statusCounts.map(r => [r.status, r.count]))

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} documents across all subcontractors</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Suspense>
          <DocumentFilters
            currentSearch={searchParams.q}
            currentStatus={searchParams.status}
            currentCategory={searchParams.category}
          />
        </Suspense>

        {/* Status pills */}
        <div className="flex gap-1.5 flex-wrap">
          <FilterPill href="?" label="All" count={total} active={!searchParams.status} />
          {STATUSES.map(s => (
            <FilterPill
              key={s}
              href={`?status=${s}${searchParams.q ? `&q=${searchParams.q}` : ''}`}
              label={s.charAt(0).toUpperCase() + s.slice(1)}
              count={countMap[s] ?? 0}
              active={searchParams.status === s}
            />
          ))}
        </div>
      </div>

      {/* Table */}
      {rowsWithUrls.length === 0 ? (
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
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Document', 'Subcontractor', 'Status', 'Expires', 'Uploaded', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rowsWithUrls.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          row.docTypeCategory === 'insurance'    ? 'bg-blue-50' :
                          row.docTypeCategory === 'certification'? 'bg-purple-50' :
                          row.docTypeCategory === 'legal'        ? 'bg-orange-50' :
                          'bg-gray-100'
                        }`}>
                          <FileText size={14} className={
                            row.docTypeCategory === 'insurance'    ? 'text-blue-500' :
                            row.docTypeCategory === 'certification'? 'text-purple-500' :
                            row.docTypeCategory === 'legal'        ? 'text-orange-500' :
                            'text-gray-400'
                          } />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{row.docTypeName}</p>
                          {row.fileName && (
                            <p className="text-xs text-gray-400 truncate max-w-[180px]">{row.fileName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-gray-800">{row.subFirstName} {row.subLastName}</p>
                      {row.subCompanyName && (
                        <p className="text-xs text-gray-400">{row.subCompanyName}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <DocStatusBadge status={row.status} />
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      {row.expiresAt ? (
                        <span className={
                          new Date(row.expiresAt) < new Date()
                            ? 'text-red-600 font-semibold'
                            : new Date(row.expiresAt) < new Date(Date.now() + 30 * 86400000)
                            ? 'text-yellow-600 font-medium'
                            : 'text-gray-500'
                        }>
                          {formatDate(row.expiresAt)}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {formatDate(row.submittedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {row.downloadUrl ? (
                        <a
                          href={row.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                        >
                          <Download size={12} />
                          Download
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
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
                    href={`?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                    className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                {offset + limit < total && (
                  <Link
                    href={`?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
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

function FilterPill({ href, label, count, active }: {
  href: string; label: string; count: number; active: boolean
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? 'bg-brand-600 text-white'
          : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
      <span className={`tabular-nums ${active ? 'text-brand-200' : 'text-gray-400'}`}>{count}</span>
    </Link>
  )
}
