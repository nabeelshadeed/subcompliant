import { requireUser } from '@/lib/auth/require-auth'
import { db } from '@/lib/db'
import {
  complianceDocuments, documentTypes, subProfiles, subcontractors
} from '@/lib/db/schema'
import { eq, and, between, lt, isNull } from 'drizzle-orm'
import { addDays } from 'date-fns'
import { formatDate, initials } from '@/lib/utils'
import { Clock, AlertTriangle, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'
import ChaseButton from '@/components/subcontractors/ChaseButton'

export const metadata: Metadata = { title: 'Expiry Timeline' }

interface ExpiringDoc {
  docId:           string
  docTypeName:     string
  expiresAt:       string
  subId:           string
  subFirstName:    string | null
  subLastName:     string | null
  subEmail:        string | null
  contractorName:  string
  daysRemaining:   number
}

function Bucket({ label, color, icon: Icon, docs }: {
  label: string
  color: string
  icon:  React.ElementType
  docs:  ExpiringDoc[]
}) {
  if (docs.length === 0) return null

  return (
    <div>
      <div className={`flex items-center gap-2.5 mb-3`}>
        <Icon size={15} className={color} />
        <h2 className={`text-sm font-semibold ${color}`}>{label}</h2>
        <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-white/10 text-white/60`}>
          {docs.length}
        </span>
      </div>
      <div className="card overflow-hidden divide-y divide-white/10">
        {docs.map(doc => (
          <div key={doc.docId} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/5 transition-colors">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent flex-shrink-0">
              {initials(doc.subFirstName, doc.subLastName)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {doc.subFirstName} {doc.subLastName}
              </p>
              <p className="text-xs text-white/50 truncate">{doc.docTypeName}</p>
            </div>

            {/* Days remaining */}
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-bold tabular-nums ${
                doc.daysRemaining <= 7 ? 'text-red-400' :
                doc.daysRemaining <= 14 ? 'text-orange-400' :
                doc.daysRemaining <= 30 ? 'text-amber-400' : 'text-white/60'
              }`}>
                {doc.daysRemaining}d
              </p>
              <p className="text-xs text-white/40">{formatDate(doc.expiresAt)}</p>
            </div>

            {/* Chase */}
            {doc.subEmail && (
              <ChaseButton
                email={doc.subEmail}
                name={`${doc.subFirstName ?? ''} ${doc.subLastName ?? ''}`.trim()}
                contractorName={doc.contractorName}
                subId={doc.subId}
              />
            )}

            <Link
              href={`/subcontractors/${doc.subId}`}
              className="text-white/30 hover:text-accent transition-colors flex-shrink-0"
            >
              <ChevronRight size={15} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ExpiryPage() {
  const user = await requireUser()
  const contractorId  = user.contractorId
  const contractorName = user.contractor?.name ?? 'Your company'

  const now   = new Date()
  const in90  = addDays(now, 90)

  // All approved, current docs expiring in next 90 days (excluding already expired)
  const rows = await db
    .select({
      docId:        complianceDocuments.id,
      docTypeName:  documentTypes.name,
      expiresAt:    complianceDocuments.expiresAt,
      subId:        subcontractors.id,
      subFirstName: subProfiles.firstName,
      subLastName:  subProfiles.lastName,
      subEmail:     subProfiles.ownerEmail,
    })
    .from(complianceDocuments)
    .innerJoin(documentTypes,  eq(complianceDocuments.documentTypeId, documentTypes.id))
    .innerJoin(subcontractors, eq(subcontractors.profileId,           complianceDocuments.profileId))
    .innerJoin(subProfiles,    eq(subProfiles.id,                     complianceDocuments.profileId))
    .where(and(
      eq(subcontractors.contractorId, contractorId),
      eq(complianceDocuments.status,    'approved'),
      eq(complianceDocuments.isCurrent, true),
      isNull(complianceDocuments.deletedAt),
      between(
        complianceDocuments.expiresAt,
        now.toISOString().slice(0, 10),
        in90.toISOString().slice(0, 10),
      ),
    ))
    .orderBy(complianceDocuments.expiresAt)

  const docs: ExpiringDoc[] = rows
    .filter(r => r.expiresAt)
    .map(r => ({
      ...r,
      expiresAt:      r.expiresAt!,
      contractorName,
      daysRemaining:  Math.max(0, Math.ceil(
        (new Date(r.expiresAt!).getTime() - now.getTime()) / 86400000
      )),
    }))

  const week    = docs.filter(d => d.daysRemaining <= 7)
  const month   = docs.filter(d => d.daysRemaining > 7  && d.daysRemaining <= 30)
  const quarter = docs.filter(d => d.daysRemaining > 30 && d.daysRemaining <= 90)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold font-display text-white">Expiry Timeline</h1>
          <p className="text-sm text-white/60 mt-0.5">
            {docs.length === 0
              ? 'No documents expiring in the next 90 days'
              : `${docs.length} document${docs.length !== 1 ? 's' : ''} expiring in the next 90 days`}
          </p>
        </div>
        <Link
          href="/compliance"
          className="text-xs font-medium text-white/50 hover:text-white flex items-center gap-1 transition-colors"
        >
          ← Compliance overview
        </Link>
      </div>

      {/* Summary pills */}
      {docs.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {week.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle size={13} className="text-red-400" />
              <span className="text-sm font-semibold text-red-400">{week.length} this week</span>
            </div>
          )}
          {month.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={13} className="text-amber-400" />
              <span className="text-sm font-semibold text-amber-400">{month.length} this month</span>
            </div>
          )}
          {quarter.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <Clock size={13} className="text-white/50" />
              <span className="text-sm font-semibold text-white/60">{quarter.length} next 90 days</span>
            </div>
          )}
        </div>
      )}

      {/* Grouped lists */}
      <Bucket label="Expiring this week"  color="text-red-400"    icon={AlertCircle}   docs={week} />
      <Bucket label="Expiring this month" color="text-amber-400"  icon={AlertTriangle} docs={month} />
      <Bucket label="Next 30–90 days"     color="text-white/60"   icon={Clock}         docs={quarter} />

      {/* All clear */}
      {docs.length === 0 && (
        <div className="card px-6 py-12 text-center">
          <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">All clear</p>
          <p className="text-xs text-white/50 mt-1">No approved documents expiring in the next 90 days.</p>
        </div>
      )}
    </div>
  )
}
