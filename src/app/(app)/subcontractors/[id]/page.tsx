import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import {
  users, subcontractors, subProfiles, complianceDocuments, documentTypes, riskScores
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { calculateCompliance } from '@/lib/compliance-engine'
import { calculateRiskScore } from '@/lib/risk-engine'
import { ComplianceBadge, DocStatusBadge, RiskBadge } from '@/components/ui/Badges'
import { formatDate, formatBytes, initials } from '@/lib/utils'
import Link from 'next/link'
import {
  ArrowLeft, Mail, Phone, Building2, FileText,
  Shield, Download, Clock
} from 'lucide-react'
import { getPresignedDownloadUrl } from '@/lib/r2'
import DocumentReviewPanel from '@/components/documents/DocumentReviewPanel'
import { Metadata } from 'next'

interface Props { params: { id: string } }

export const metadata: Metadata = { title: 'Subcontractor Profile' }

export default async function SubcontractorProfilePage({ params }: Props) {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect('/auth/sign-in')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  })
  if (!user) redirect('/auth/sign-up')

  const sub = await db.query.subcontractors.findFirst({
    where: and(
      eq(subcontractors.id, params.id),
      eq(subcontractors.contractorId, user.contractorId)
    ),
    with: { profile: true },
  })
  if (!sub) notFound()

  const profile = sub.profile as typeof subProfiles.$inferSelect & { trade?: { name: string } | null }

  const [compliance, riskBreakdown, docs] = await Promise.all([
    calculateCompliance(sub.profileId, user.contractorId),
    calculateRiskScore(sub.profileId, user.contractorId),
    db
      .select({
        id:              complianceDocuments.id,
        status:          complianceDocuments.status,
        fileName:        complianceDocuments.fileName,
        fileSizeBytes:   complianceDocuments.fileSizeBytes,
        fileKey:         complianceDocuments.fileKey,
        expiresAt:       complianceDocuments.expiresAt,
        issuedAt:        complianceDocuments.issuedAt,
        policyNumber:    complianceDocuments.policyNumber,
        coverageAmount:  complianceDocuments.coverageAmount,
        issuerName:      complianceDocuments.issuerName,
        submittedAt:     complianceDocuments.submittedAt,
        isVerified:      complianceDocuments.isVerified,
        isCurrent:       complianceDocuments.isCurrent,
        reviewNotes:     complianceDocuments.reviewNotes,
        rejectedReason:  complianceDocuments.rejectedReason,
        docTypeId:       documentTypes.id,
        docTypeName:     documentTypes.name,
        docTypeSlug:     documentTypes.slug,
        docTypeCategory: documentTypes.category,
      })
      .from(complianceDocuments)
      .innerJoin(documentTypes, eq(complianceDocuments.documentTypeId, documentTypes.id))
      .where(and(
        eq(complianceDocuments.profileId, sub.profileId),
        eq(complianceDocuments.isCurrent, true),
      ))
      .orderBy(documentTypes.sortOrder),
  ])

  const docsWithUrls = await Promise.all(
    docs.map(async d => ({
      ...d,
      downloadUrl: d.fileKey
        ? await getPresignedDownloadUrl(d.fileKey).catch(() => null)
        : null,
    }))
  )

  const canReview = user.role === 'owner' || user.role === 'admin'

  const RISK_COMPONENTS = [
    { label: 'Insurance',   value: riskBreakdown.insuranceScore  ?? 0 },
    { label: 'CSCS',        value: riskBreakdown.cscsScore        ?? 0 },
    { label: 'Trade Certs', value: riskBreakdown.tradeCertScore   ?? 0 },
    { label: 'RAMS',        value: riskBreakdown.ramsScore        ?? 0 },
    { label: 'Admin',       value: riskBreakdown.adminScore       ?? 0 },
    { label: 'Overall',     value: riskBreakdown.total,  bold: true },
  ] as { label: string; value: number; bold?: boolean }[]

  function riskColour(v: number) {
    return v <= 20 ? 'bg-green-50 text-green-700'
         : v <= 50 ? 'bg-yellow-50 text-yellow-700'
         : v <= 75 ? 'bg-orange-50 text-orange-700'
                   : 'bg-red-50 text-red-700'
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <Link href="/subcontractors" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={14} /> Back to subcontractors
      </Link>

      {/* Profile header */}
      <div className="card p-6">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center text-xl font-bold text-brand-700 flex-shrink-0">
            {initials(profile.firstName, profile.lastName)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h1>
              <ComplianceBadge status={compliance.status} />
              <RiskBadge score={riskBreakdown.total} level={riskBreakdown.riskLevel} />
            </div>

            {profile.companyName && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                <Building2 size={13} />{profile.companyName}
              </div>
            )}

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Mail size={13} />{profile.ownerEmail}
              </span>
              {profile.phone && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone size={13} />{profile.phone}
                </span>
              )}
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
            sub.status === 'active'    ? 'bg-green-50 text-green-700 border-green-200' :
            sub.status === 'invited'   ? 'bg-blue-50 text-blue-700 border-blue-200' :
            sub.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
            'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {sub.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Compliance summary */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={15} className="text-brand-500" />Compliance
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Score</span>
              <span className="font-bold text-gray-900">{compliance.score}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  compliance.score >= 80 ? 'bg-green-500' :
                  compliance.score >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${compliance.score}%` }}
              />
            </div>
            <div className="pt-2 space-y-1.5 text-xs text-gray-600">
              {compliance.missing.length > 0 && (
                <p className="text-red-600">✕ Missing: {compliance.missing.join(', ')}</p>
              )}
              {compliance.expiringSoon.length > 0 && (
                <p className="text-yellow-600">⚠ Expiring: {compliance.expiringSoon.join(', ')}</p>
              )}
              {compliance.expired.length > 0 && (
                <p className="text-orange-600">! Expired: {compliance.expired.join(', ')}</p>
              )}
              {compliance.missing.length === 0 && compliance.expiringSoon.length === 0 && compliance.expired.length === 0 && (
                <p className="text-green-600 font-medium">All documents in order ✓</p>
              )}
            </div>
          </div>
        </div>

        {/* Risk breakdown */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Risk Score Breakdown</h2>
          <div className="grid grid-cols-3 gap-3">
            {RISK_COMPONENTS.map(({ label, value, bold }) => (
              <div key={label} className={`p-3 rounded-lg ${riskColour(value)}`}>
                <p className="text-xs opacity-70">{label}</p>
                <p className={`text-lg tabular-nums ${bold ? 'font-black' : 'font-bold'}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Documents</h2>
          {canReview && (
            <p className="text-xs text-gray-400">
              Admin — click Approve / Reject on any pending document
            </p>
          )}
        </div>

        {docsWithUrls.length === 0 ? (
          <div className="py-10 text-center">
            <FileText size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No documents uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {docsWithUrls.map(doc => (
              <div key={doc.id} className="px-5 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    doc.docTypeCategory === 'insurance'     ? 'bg-blue-50' :
                    doc.docTypeCategory === 'certification' ? 'bg-purple-50' :
                    doc.docTypeCategory === 'legal'         ? 'bg-orange-50' :
                    'bg-gray-100'
                  }`}>
                    <FileText size={15} className={
                      doc.docTypeCategory === 'insurance'     ? 'text-blue-500' :
                      doc.docTypeCategory === 'certification' ? 'text-purple-500' :
                      doc.docTypeCategory === 'legal'         ? 'text-orange-500' :
                      'text-gray-400'
                    } />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{doc.docTypeName}</span>
                      <DocStatusBadge status={doc.status} />
                      {doc.isVerified && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 font-medium">
                          Verified
                        </span>
                      )}
                    </div>

                    {doc.fileName && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {doc.fileName}
                        {doc.fileSizeBytes ? ` · ${formatBytes(doc.fileSizeBytes)}` : ''}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500 flex-wrap">
                      {doc.issuedAt && <span>Issued {formatDate(doc.issuedAt)}</span>}
                      {doc.expiresAt && (
                        <span className={
                          new Date(doc.expiresAt) < new Date()
                            ? 'text-red-600 font-semibold'
                            : new Date(doc.expiresAt) < new Date(Date.now() + 30 * 86400000)
                            ? 'text-yellow-600 font-medium'
                            : ''
                        }>
                          Expires {formatDate(doc.expiresAt)}
                        </span>
                      )}
                      {doc.policyNumber && <span>Ref: {doc.policyNumber}</span>}
                      {doc.issuerName && <span>{doc.issuerName}</span>}
                      {doc.coverageAmount && (
                        <span>
                          Cover: £{Number(doc.coverageAmount).toLocaleString('en-GB')}
                        </span>
                      )}
                    </div>

                    {doc.reviewNotes && (
                      <p className="mt-1 text-xs text-gray-500 italic">
                        Note: {doc.reviewNotes}
                      </p>
                    )}
                    {doc.rejectedReason && (
                      <p className="mt-1 text-xs text-red-600">
                        Rejected: {doc.rejectedReason}
                      </p>
                    )}

                    {/* Review actions */}
                    {canReview && doc.status !== 'approved' && doc.status !== 'superseded' && (
                      <DocumentReviewPanel
                        documentId={doc.id}
                        docTypeName={doc.docTypeName}
                        currentStatus={doc.status}
                      />
                    )}
                  </div>

                  {/* Download */}
                  {doc.downloadUrl && (
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 mt-1"
                    >
                      <Download size={12} />
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata footer */}
      <div className="text-xs text-gray-400 flex gap-4">
        {sub.invitedAt && <span>Invited {formatDate(sub.invitedAt)}</span>}
        {sub.activatedAt && <span>Activated {formatDate(sub.activatedAt)}</span>}
        {sub.notes && <span>Notes: {sub.notes}</span>}
      </div>
    </div>
  )
}
