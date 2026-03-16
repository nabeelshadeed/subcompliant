import { db } from './db'
import { complianceDocuments, documentTypes, subcontractors, subProfiles } from './db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import { addDays, isBefore, isAfter } from 'date-fns'

export type ComplianceStatus = 'compliant' | 'partially_compliant' | 'non_compliant'

export interface ComplianceResult {
  status:            ComplianceStatus
  score:             number            // 0-100
  totalRequired:     number
  compliant:         number
  missing:           string[]
  expired:           string[]
  expiringSoon:      string[]          // within 30 days
  documents:         ComplianceDocSummary[]
}

export interface ComplianceDocSummary {
  docTypeId:   string
  docTypeName: string
  slug:        string
  status:      'approved' | 'pending' | 'missing' | 'expired' | 'expiring_soon' | 'rejected'
  expiresAt:   Date | null
  documentId:  string | null
}

const EXPIRY_WARNING_DAYS = 30

/**
 * Calculate the compliance status for a subcontractor profile
 * against a specific contractor's required document set.
 */
export async function calculateCompliance(
  profileId:    string,
  contractorId: string
): Promise<ComplianceResult> {
  // 1. Get the sub's trade to determine required documents
  const profile = await db.query.subProfiles.findFirst({
    where: eq(subProfiles.id, profileId),
    with:  { trade: true },
  })

  // 2. Get all active document types
  const allDocTypes = await db.query.documentTypes.findMany({
    where: eq(documentTypes.isActive, true),
    orderBy: (t, { asc }) => [asc(t.sortOrder)],
  })

  // Required = system types + trade-specific types
  const required = allDocTypes.filter(dt => {
    if (dt.isSystemType) return true
    if (dt.requiredForTrades && profile?.tradeId) {
      return (dt.requiredForTrades as string[]).includes(profile.tradeId)
    }
    return false
  })

  // 3. Get the sub's current documents
  const docs = await db.query.complianceDocuments.findMany({
    where: and(
      eq(complianceDocuments.profileId, profileId),
      eq(complianceDocuments.isCurrent, true),
    ),
    with: { documentType: true },
  })

  const now    = new Date()
  const warn   = addDays(now, EXPIRY_WARNING_DAYS)

  const summary: ComplianceDocSummary[] = []
  const missing:      string[] = []
  const expired:      string[] = []
  const expiringSoon: string[] = []
  let compliantCount = 0

  for (const docType of required) {
    const doc = docs.find(d => d.documentTypeId === docType.id)

    let status: ComplianceDocSummary['status'] = 'missing'
    let expiresAt: Date | null = null

    if (!doc) {
      missing.push(docType.name)
    } else {
      expiresAt = doc.expiresAt ? new Date(doc.expiresAt) : null

      if (doc.status === 'rejected') {
        status = 'rejected'
        missing.push(docType.name)
      } else if (doc.status === 'pending' || doc.status === 'processing') {
        status = 'pending'
        // Pending still counts as missing for compliance calculation
        missing.push(docType.name)
      } else if (doc.status === 'approved') {
        if (expiresAt && isBefore(expiresAt, now)) {
          status = 'expired'
          expired.push(docType.name)
        } else if (expiresAt && isBefore(expiresAt, warn)) {
          status = 'expiring_soon'
          expiringSoon.push(docType.name)
          compliantCount++ // Still counts as compliant until expired
        } else {
          status = 'approved'
          compliantCount++
        }
      }
    }

    summary.push({
      docTypeId:   docType.id,
      docTypeName: docType.name,
      slug:        docType.slug,
      status,
      expiresAt,
      documentId:  doc?.id ?? null,
    })
  }

  const total = required.length
  const score = total === 0 ? 100 : Math.round((compliantCount / total) * 100)

  let overallStatus: ComplianceStatus
  if (score === 100) {
    overallStatus = 'compliant'
  } else if (score >= 50) {
    overallStatus = 'partially_compliant'
  } else {
    overallStatus = 'non_compliant'
  }

  return {
    status:        overallStatus,
    score,
    totalRequired: total,
    compliant:     compliantCount,
    missing,
    expired,
    expiringSoon,
    documents:     summary,
  }
}

/**
 * Get compliance overview for all subcontractors of a contractor
 */
export async function getContractorComplianceOverview(contractorId: string): Promise<{
  total:             number
  compliant:         number
  partiallyCompliant: number
  nonCompliant:      number
  percentCompliant:  number
  criticalAlerts:    number
}> {
  const subs = await db.query.subcontractors.findMany({
    where: and(
      eq(subcontractors.contractorId, contractorId),
      inArray(subcontractors.status, ['active', 'invited']),
    ),
  })

  let compliant = 0
  let partial   = 0
  let nonComp   = 0
  let critical  = 0

  await Promise.all(subs.map(async sub => {
    const result = await calculateCompliance(sub.profileId, contractorId)
    if (result.status === 'compliant')           compliant++
    else if (result.status === 'partially_compliant') partial++
    else                                         nonComp++

    if (result.expired.length > 0 || result.missing.length > 2) critical++
  }))

  const total = subs.length
  return {
    total,
    compliant,
    partiallyCompliant: partial,
    nonCompliant:       nonComp,
    percentCompliant:   total === 0 ? 0 : Math.round((compliant / total) * 100),
    criticalAlerts:     critical,
  }
}
