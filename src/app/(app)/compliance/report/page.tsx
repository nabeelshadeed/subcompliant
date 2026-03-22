import { requireUser } from '@/lib/auth/require-auth'
import { db } from '@/lib/db'
import { subcontractors, subProfiles, complianceDocuments, documentTypes } from '@/lib/db/schema'
import { eq, and, inArray, isNull } from 'drizzle-orm'
import { calculateCompliance } from '@/lib/compliance-engine'
import { formatDate } from '@/lib/utils'
import { CheckCircle2, AlertTriangle, XCircle, Printer, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'
import PrintButton from './PrintButton'

export const metadata: Metadata = { title: 'Compliance Audit Report' }

export default async function AuditReportPage() {
  const user = await requireUser()
  const contractorId   = user.contractorId
  const contractor     = user.contractor!
  const generatedAt    = new Date()

  const subs = await db
    .select({
      id:          subcontractors.id,
      status:      subcontractors.status,
      invitedAt:   subcontractors.invitedAt,
      activatedAt: subcontractors.activatedAt,
      firstName:   subProfiles.firstName,
      lastName:    subProfiles.lastName,
      companyName: subProfiles.companyName,
      email:       subProfiles.ownerEmail,
      profileId:   subProfiles.id,
    })
    .from(subcontractors)
    .innerJoin(subProfiles, eq(subcontractors.profileId, subProfiles.id))
    .where(and(
      eq(subcontractors.contractorId, contractorId),
      inArray(subcontractors.status, ['active', 'invited']),
      isNull(subcontractors.deletedAt),
    ))
    .orderBy(subProfiles.lastName)

  const subsWithData = await Promise.all(
    subs.map(async sub => {
      const compliance = await calculateCompliance(sub.profileId, contractorId)

      // Fetch current docs for this sub
      const docs = await db
        .select({
          docTypeName: documentTypes.name,
          status:      complianceDocuments.status,
          expiresAt:   complianceDocuments.expiresAt,
          policyNumber: complianceDocuments.policyNumber,
          issuerName:   complianceDocuments.issuerName,
        })
        .from(complianceDocuments)
        .innerJoin(documentTypes, eq(complianceDocuments.documentTypeId, documentTypes.id))
        .where(and(
          eq(complianceDocuments.profileId, sub.profileId),
          eq(complianceDocuments.isCurrent, true),
          isNull(complianceDocuments.deletedAt),
        ))
        .orderBy(documentTypes.sortOrder)

      return { ...sub, compliance, docs }
    })
  )

  subsWithData.sort((a, b) => a.compliance.score - b.compliance.score)

  const compliantCount  = subsWithData.filter(s => s.compliance.status === 'compliant').length
  const partialCount    = subsWithData.filter(s => s.compliance.status === 'partially_compliant').length
  const nonCompliant    = subsWithData.filter(s => s.compliance.status === 'non_compliant').length
  const overallPct      = subsWithData.length > 0
    ? Math.round((compliantCount / subsWithData.length) * 100)
    : 0

  return (
    <>
      {/* Print button — hidden in print */}
      <div className="no-print flex items-center justify-between mb-6 max-w-4xl">
        <div>
          <Link href="/compliance" className="text-xs text-white/50 hover:text-white mb-2 inline-block">
            ← Back to compliance
          </Link>
          <h1 className="text-xl font-bold font-display text-white">Compliance Audit Report</h1>
          <p className="text-sm text-white/60 mt-0.5">
            Ready to save as PDF — click Print and choose "Save as PDF"
          </p>
        </div>
        <PrintButton />
      </div>

      {/* ── Printable Report ─────────────────────────────────────────────────── */}
      <div id="audit-report" className="max-w-4xl space-y-6 print:max-w-none print:space-y-4">

        {/* Cover block */}
        <div className="card p-6 print:border print:border-gray-200 print:bg-white print:text-gray-900">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center print:bg-gray-100 print:border-gray-200">
                <ShieldCheck size={18} className="text-accent print:text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white print:text-gray-900">{contractor.name}</h2>
                <p className="text-xs text-white/50 print:text-gray-500">Subcontractor Compliance Audit</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50 print:text-gray-500">Generated</p>
              <p className="text-sm font-semibold text-white print:text-gray-900">
                {generatedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-xs text-white/40 print:text-gray-400">
                {generatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Subcontractors', value: subsWithData.length, color: 'text-white print:text-gray-900' },
              { label: 'Fully Compliant',       value: compliantCount,      color: 'text-emerald-400 print:text-green-700' },
              { label: 'Partial',               value: partialCount,        color: 'text-amber-400 print:text-amber-700' },
              { label: 'Non-Compliant',         value: nonCompliant,        color: 'text-red-400 print:text-red-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center p-3 rounded-lg bg-white/5 print:bg-gray-50 print:border print:border-gray-200">
                <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
                <p className="text-xs text-white/50 print:text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 print:border-gray-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white/60 print:text-gray-600">Overall compliance rate</span>
              <span className={`font-bold ${overallPct >= 80 ? 'text-emerald-400' : overallPct >= 50 ? 'text-amber-400' : 'text-red-400'} print:text-gray-900`}>
                {overallPct}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden print:bg-gray-200">
              <div
                className={`h-full rounded-full ${overallPct >= 80 ? 'bg-emerald-400' : overallPct >= 50 ? 'bg-amber-400' : 'bg-red-400'} print:bg-gray-700`}
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Per-subcontractor detail */}
        {subsWithData.map(sub => (
          <div
            key={sub.id}
            className="card overflow-hidden print:border print:border-gray-200 print:bg-white print:break-inside-avoid"
          >
            {/* Sub header */}
            <div className="px-5 py-4 border-b border-white/10 print:border-gray-200 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-white print:text-gray-900">
                  {sub.firstName} {sub.lastName}
                  {sub.companyName && <span className="font-normal text-white/50 print:text-gray-500 ml-2">· {sub.companyName}</span>}
                </p>
                <p className="text-xs text-white/50 print:text-gray-500">{sub.email}</p>
              </div>

              <div className="flex items-center gap-3">
                {/* Compliance badge */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  sub.compliance.status === 'compliant'           ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 print:bg-green-50 print:text-green-700 print:border-green-200' :
                  sub.compliance.status === 'partially_compliant' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 print:bg-amber-50 print:text-amber-700 print:border-amber-200' :
                  'bg-red-500/20 text-red-400 border-red-500/30 print:bg-red-50 print:text-red-700 print:border-red-200'
                }`}>
                  {sub.compliance.status === 'compliant'           ? <CheckCircle2 size={11} /> :
                   sub.compliance.status === 'partially_compliant' ? <AlertTriangle size={11} /> :
                   <XCircle size={11} />}
                  {sub.compliance.status === 'compliant' ? 'Compliant' :
                   sub.compliance.status === 'partially_compliant' ? 'Partial' : 'Non-Compliant'}
                </span>
                <span className="text-sm font-bold text-white tabular-nums print:text-gray-900">
                  {sub.compliance.score}%
                </span>
              </div>
            </div>

            {/* Documents table */}
            {sub.docs.length > 0 ? (
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/5 print:bg-gray-50 border-b border-white/10 print:border-gray-200">
                    {['Document', 'Status', 'Expiry', 'Policy / Ref'].map(h => (
                      <th key={h} className="text-left text-[10px] font-semibold text-white/50 print:text-gray-500 uppercase tracking-wide px-4 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 print:divide-gray-100">
                  {sub.docs.map((doc, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2.5 text-white print:text-gray-900 font-medium">{doc.docTypeName}</td>
                      <td className="px-4 py-2.5">
                        <span className={`font-semibold capitalize ${
                          doc.status === 'approved' ? 'text-emerald-400 print:text-green-700' :
                          doc.status === 'rejected' ? 'text-red-400 print:text-red-700' :
                          doc.status === 'expired'  ? 'text-orange-400 print:text-orange-700' :
                          doc.status === 'pending'  ? 'text-amber-400 print:text-amber-700' :
                          'text-white/50 print:text-gray-500'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-white/60 print:text-gray-600">
                        {doc.expiresAt ? formatDate(doc.expiresAt) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-white/50 print:text-gray-500">
                        {doc.policyNumber || doc.issuerName || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-3 text-xs text-white/40 print:text-gray-400">No documents uploaded yet</p>
            )}

            {/* Issues callout */}
            {(sub.compliance.missing.length > 0 || sub.compliance.expired.length > 0) && (
              <div className="px-5 py-3 border-t border-white/10 print:border-gray-200 bg-red-500/5 print:bg-red-50">
                <p className="text-xs font-semibold text-red-400 print:text-red-700 mb-1">Action required</p>
                {sub.compliance.missing.length > 0 && (
                  <p className="text-xs text-red-400/80 print:text-red-600">
                    Missing: {sub.compliance.missing.join(', ')}
                  </p>
                )}
                {sub.compliance.expired.length > 0 && (
                  <p className="text-xs text-orange-400/80 print:text-orange-600">
                    Expired: {sub.compliance.expired.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Report footer */}
        <div className="text-center py-4 text-xs text-white/30 print:text-gray-400 border-t border-white/10 print:border-gray-200">
          Generated by SubCompliant · {contractor.name} · {formatDate(generatedAt)} · Confidential
        </div>
      </div>
    </>
  )
}
