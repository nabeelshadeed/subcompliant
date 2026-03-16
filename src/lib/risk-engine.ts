import { db } from './db'
import { riskScores, complianceDocuments, documentTypes } from './db/schema'
import { eq, and } from 'drizzle-orm'
import { calculateCompliance } from './compliance-engine'
import { addDays, isBefore, differenceInDays } from 'date-fns'

export interface RiskScoreBreakdown {
  total:          number   // 0-100 (100 = highest risk)
  insuranceScore: number
  cscsScore:      number
  tradeCertScore: number
  ramsScore:      number
  adminScore:     number
  riskLevel:      'low' | 'medium' | 'high' | 'critical'
  missingDocs:    string[]
  expiringDocs:   string[]
  expiredDocs:    string[]
}

/**
 * Calculate a risk score for a subcontractor.
 * Score of 0 = no risk (fully compliant), 100 = maximum risk.
 *
 * Component weights:
 *   Insurance (public liability, employers liability): 40%
 *   CSCS card: 20%
 *   Trade certifications: 20%
 *   RAMS: 10%
 *   Admin (UTR, Companies House): 10%
 */
export async function calculateRiskScore(
  profileId:    string,
  contractorId: string
): Promise<RiskScoreBreakdown> {
  const compliance = await calculateCompliance(profileId, contractorId)
  const docs       = compliance.documents
  const now        = new Date()
  const warn30     = addDays(now, 30)
  const warn7      = addDays(now, 7)

  // Helper: penalty for a doc category
  function docPenalty(slugPatterns: string[]): number {
    let penalty = 0
    for (const d of docs) {
      if (!slugPatterns.some(p => d.slug.includes(p))) continue
      if (d.status === 'missing' || d.status === 'rejected') { penalty += 100; continue }
      if (d.status === 'expired')                             { penalty += 90;  continue }
      if (d.expiresAt && isBefore(d.expiresAt, warn7))       { penalty += 60;  continue }
      if (d.expiresAt && isBefore(d.expiresAt, warn30))      { penalty += 30;  continue }
      if (d.status === 'pending')                             { penalty += 20;  continue }
    }
    return Math.min(100, Math.round(penalty / Math.max(1, slugPatterns.length)))
  }

  const insuranceScore = docPenalty(['public-liability', 'employers-liability'])
  const cscsScore      = docPenalty(['cscs-card'])
  const tradeCertScore = docPenalty(['gas-safe', 'niceic', 'napit', 'cisrs', 'cpcs', 'pasma'])
  const ramsScore      = docPenalty(['rams'])
  const adminScore     = docPenalty(['cis-verification', 'dbs-check'])

  // Weighted average
  const total = Math.round(
    insuranceScore * 0.40 +
    cscsScore      * 0.20 +
    tradeCertScore * 0.20 +
    ramsScore      * 0.10 +
    adminScore     * 0.10
  )

  const riskLevel: RiskScoreBreakdown['riskLevel'] =
    total <= 20  ? 'low' :
    total <= 50  ? 'medium' :
    total <= 75  ? 'high' :
                   'critical'

  return {
    total,
    insuranceScore,
    cscsScore,
    tradeCertScore,
    ramsScore,
    adminScore,
    riskLevel,
    missingDocs:  compliance.missing,
    expiringDocs: compliance.expiringSoon,
    expiredDocs:  compliance.expired,
  }
}

/**
 * Persist a risk score to the database (marking previous as non-current)
 */
export async function persistRiskScore(
  profileId:    string,
  contractorId: string,
  breakdown:    RiskScoreBreakdown
): Promise<string> {
  // Mark old scores as non-current
  await db
    .update(riskScores)
    .set({ isCurrent: false })
    .where(and(
      eq(riskScores.profileId, profileId),
      eq(riskScores.contractorId, contractorId),
      eq(riskScores.isCurrent, true),
    ))

  const [inserted] = await db.insert(riskScores).values({
    profileId,
    contractorId,
    score:         breakdown.total,
    insuranceScore: breakdown.insuranceScore,
    cscsScore:     breakdown.cscsScore,
    tradeCertScore: breakdown.tradeCertScore,
    ramsScore:     breakdown.ramsScore,
    adminScore:    breakdown.adminScore,
    missingDocs:   breakdown.missingDocs,
    expiringDocs:  breakdown.expiringDocs,
    expiredDocs:   breakdown.expiredDocs,
    isCurrent:     true,
    validUntil:    addDays(new Date(), 7), // re-score weekly or on new doc upload
  }).returning({ id: riskScores.id })

  return inserted.id
}
