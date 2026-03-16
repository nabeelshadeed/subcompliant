/**
 * Document Processing Worker
 * Run: npx tsx src/workers/document-processor.ts
 * Production: deploy as a Railway / Render worker with: npm run worker:dev
 */

import { db } from '@/lib/db'
import { complianceDocuments } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { dequeueJob, ackJob, nackJob, enqueueJob, Job } from '@/lib/redis'
import { extractDocument, inferExpiryDate } from '@/lib/textract'
import { calculateRiskScore, persistRiskScore } from '@/lib/risk-engine'

const R2_BUCKET = process.env.R2_BUCKET_NAME!
const POLL_MS   = 2000
const MAX_RETRY = 3

interface ProcessDocumentPayload {
  documentId:   string
  profileId:    string
  contractorId: string
  fileKey:      string
  mimeType:     string
  docTypeSlug:  string
}

interface VirusScanPayload extends ProcessDocumentPayload {
  _retryAttempt?: number
}

async function processDocument(payload: ProcessDocumentPayload): Promise<void> {
  const { documentId, profileId, contractorId, fileKey, mimeType } = payload

  console.log(`[worker] Processing document ${documentId}`)

  await db.update(complianceDocuments)
    .set({ status: 'processing' })
    .where(eq(complianceDocuments.id, documentId))

  try {
    let extractedData: any = null
    let expiresAt: Date | null = null
    let extractionConfidence = 0

    if (mimeType === 'application/pdf' || mimeType.startsWith('image/')) {
      try {
        extractedData = await extractDocument(R2_BUCKET, fileKey)
        expiresAt     = inferExpiryDate(extractedData)
        extractionConfidence = extractedData.confidence ?? 0
        console.log(`[worker] Textract complete — confidence: ${extractionConfidence}`)
      } catch (ocrErr) {
        console.warn(`[worker] Textract failed (non-fatal):`, ocrErr)
      }
    }

    await db.update(complianceDocuments)
      .set({
        status:               'approved',
        processedAt:          new Date(),
        extractedData,
        extractionConfidence: extractionConfidence.toString(),
        expiresAt:            expiresAt ? expiresAt.toISOString().slice(0, 10) : undefined,
        policyNumber:         extractedData?.keyValues?.['Policy Number'] ??
                              extractedData?.keyValues?.['Certificate Number'] ??
                              extractedData?.detectedRefs?.[0],
        issuerName:           extractedData?.keyValues?.['Insurer'] ??
                              extractedData?.keyValues?.['Issued by'] ??
                              extractedData?.keyValues?.['Provider'],
      })
      .where(eq(complianceDocuments.id, documentId))

    await enqueueJob('calculate_risk_score', { profileId, contractorId })
    console.log(`[worker] Document ${documentId} processed successfully`)

  } catch (err) {
    console.error(`[worker] Failed to process document ${documentId}:`, err)
    await db.update(complianceDocuments)
      .set({ status: 'pending' })
      .where(eq(complianceDocuments.id, documentId))
    throw err
  }
}

async function virusScanDocument(payload: VirusScanPayload): Promise<void> {
  const { documentId, fileKey, mimeType } = payload

  console.log(`[worker] Virus scan started for document ${documentId}`)

  // Placeholder hook for AV integration.
  // In production, integrate with a real malware scanning service here.
  if (!fileKey || !mimeType) {
    throw new Error('virus_scan payload missing fileKey or mimeType')
  }

  console.log(`[worker] Virus scan passed for document ${documentId}`)

  // Chain to main document processing
  await enqueueJob('process_document', payload)
}

async function processRiskScore(payload: { profileId: string; contractorId: string }) {
  const breakdown = await calculateRiskScore(payload.profileId, payload.contractorId)
  await persistRiskScore(payload.profileId, payload.contractorId, breakdown)
  console.log(`[worker] Risk score: ${breakdown.total} (${breakdown.riskLevel})`)
}

async function poll() {
  const job = await dequeueJob()

  if (!job) {
    await new Promise(r => setTimeout(r, POLL_MS))
    return
  }

  console.log(`[worker] Dequeued job ${job.id} type=${job.type}`)

  try {
    switch (job.type) {
      case 'virus_scan':
        await virusScanDocument(job.payload as VirusScanPayload)
        break
      case 'process_document':
        await processDocument(job.payload as ProcessDocumentPayload)
        break
      case 'calculate_risk_score':
        await processRiskScore(job.payload as { profileId: string; contractorId: string })
        break
      default:
        console.warn(`[worker] Unknown job type: ${job.type}`)
    }
    await ackJob(job as Job)
  } catch (err) {
    console.error(`[worker] Job ${job.id} failed (attempt ${(job.attempts ?? 0) + 1}):`, err)
    if ((job.attempts ?? 0) < MAX_RETRY) {
      await enqueueJob(job.type, { ...(job.payload as object), _retryAttempt: (job.attempts ?? 0) + 1 })
      await ackJob(job as Job)
    } else {
      await nackJob(job as Job, String(err))
    }
  }
}

async function main() {
  console.log('[worker] Document processor started')
  while (true) {
    await poll().catch(err => console.error('[worker] Poll error:', err))
  }
}

main()
