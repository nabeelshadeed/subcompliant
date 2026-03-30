import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  complianceDocuments, subProfiles, uploadSessions,
  subcontractors, documentAccess, documentTypes
} from '@/lib/db/schema'
import { eq, and, isNull, inArray } from 'drizzle-orm'
import { uploadToR2, generateDocKey, hashBuffer } from '@/lib/r2'
import { enqueueJob, rateLimit } from '@/lib/redis'
import { getAuthContext, logAudit } from '@/lib/auth/get-auth'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
]
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

/**
 * Detect the real file type from the first 12 bytes (magic bytes / file signature).
 * The browser-supplied Content-Type is untrusted; this reads the actual content.
 */
function detectMimeFromBytes(buf: Buffer): string | null {
  if (buf.length < 12) return null
  // PDF: %PDF
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return 'application/pdf'
  // JPEG: FF D8 FF
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg'
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47 &&
      buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A) return 'image/png'
  // WebP: RIFF....WEBP
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp'
  // HEIC/HEIF: ftyp box starts at byte 4
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return 'image/heic'
  return null
}

export async function POST(req: NextRequest) {
  try {
  // Supports two auth modes:
  // 1. Clerk JWT (contractor staff reviewing/uploading on behalf)
  // 2. Magic link token (subcontractor self-service)

  const uploadToken = req.nextUrl.searchParams.get('t')

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? (req as any).ip
    ?? 'unknown'

  let profileId:    string
  let contractorId: string
  let grantedBy:    string | null = null
  let sessionId:    string | null = null
  let sessionRequiredDocTypeIds: string[] | null = null

  if (uploadToken) {
    // ── Magic-link mode ─────────────────────────────────────────────────────
    const session = await db.query.uploadSessions.findFirst({
      where: eq(uploadSessions.token, uploadToken),
    })

    if (!session || new Date() > session.expiresAt) {
      return NextResponse.json({ error: { code: 'SESSION_INVALID', message: 'Invalid or expired upload link' } }, { status: 401 })
    }

    // Reject if session already completed (all required docs submitted)
    if (session.completedAt) {
      return NextResponse.json({ error: { code: 'SESSION_COMPLETED', message: 'All required documents have already been submitted for this link.' } }, { status: 410 })
    }

    sessionId = session.id
    sessionRequiredDocTypeIds = (session.requiredDocTypeIds as string[] | null) ?? null

    contractorId = session.contractorId

    // Use only session-stored values for email/name — never trust client-supplied
    // headers for identity in magic-link mode (injection vulnerability).
    const subEmail = session.subEmail
    const subName  = session.subName ?? 'Unknown'
    const [firstName, ...rest] = (subName).split(' ')

    let profile = await db.query.subProfiles.findFirst({
      where: eq(subProfiles.ownerEmail, subEmail ?? '')
    })

    if (!profile) {
      const shareToken = Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(32))).toString('base64url')
      const [created] = await db.insert(subProfiles).values({
        shareToken,
        ownerEmail: subEmail!,
        firstName:  firstName ?? subName,
        lastName:   rest.join(' ') || '—',
        companyName: undefined,
      }).returning()
      profile = created
    }

    profileId = profile.id

    // Ensure subcontractor relationship exists for this contractor/profile pair.
    // Use INSERT ... ON CONFLICT DO NOTHING to prevent duplicate rows from
    // concurrent uploads (race condition between findFirst and insert).
    // We rely on the unique index on (contractor_id, profile_id, deleted_at IS NULL).
    await db.insert(subcontractors).values({
      contractorId,
      profileId,
      status:      'active',
      invitedAt:   session.createdAt,
      activatedAt: new Date(),
    }).onConflictDoNothing()

    // Re-fetch to get the canonical record (whether newly created or pre-existing)
    const sub = await db.query.subcontractors.findFirst({
      where: and(
        eq(subcontractors.contractorId, contractorId),
        eq(subcontractors.profileId, profileId),
      ),
    })

    if (!sub) {
      return NextResponse.json({ error: { code: 'SUB_CREATE_FAILED', message: 'Could not link subcontractor profile' } }, { status: 500 })
    }

    // Update session with resolved subcontractor ID
    await db.update(uploadSessions)
      .set({ subcontractorId: sub.id })
      .where(eq(uploadSessions.id, session.id))

  } else {
    // ── Authenticated mode (Clerk) ──────────────────────────────────────────
    const { ctx, error } = await getAuthContext(req)
    if (error) return error
    contractorId = ctx.contractorId
    grantedBy    = ctx.userId

    const profileIdParam = req.nextUrl.searchParams.get('profileId')
    if (!profileIdParam) {
      return NextResponse.json({ error: { code: 'MISSING_PROFILE_ID', message: 'profileId query param required' } }, { status: 400 })
    }
    profileId = profileIdParam
  }

  // ── Simple rate limiting per profile + IP ─────────────────────────────────────
  const rateKey = `upload:${profileId}:${ip}`
  try {
    const rl = await rateLimit(rateKey, 20, 60) // 20 uploads per minute per profile+IP
    if (!rl.allowed) {
      return NextResponse.json({
        error: {
          code:    'RATE_LIMITED',
          message: 'Too many uploads. Please wait a moment and try again.',
        },
      }, { status: 429 })
    }
  } catch {
    // Redis unavailable — allow upload without rate limiting
  }

  // ── Parse multipart form ──────────────────────────────────────────────────
  const formData = await req.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: { code: 'INVALID_FORM', message: 'Multipart form data required' } }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const docTypeId = formData.get('documentTypeId') as string | null

  if (!file || !docTypeId) {
    return NextResponse.json({ error: { code: 'MISSING_FIELDS', message: 'file and documentTypeId required' } }, { status: 400 })
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({
      error: { code: 'INVALID_FILE_TYPE', message: `Allowed types: PDF, JPEG, PNG, WebP, HEIC` }
    }, { status: 400 })
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({
      error: { code: 'FILE_TOO_LARGE', message: 'Maximum file size is 25 MB' }
    }, { status: 400 })
  }

  // Validate document type exists
  const docType = await db.query.documentTypes.findFirst({ where: eq(documentTypes.id, docTypeId) })
  if (!docType) {
    return NextResponse.json({ error: { code: 'DOC_TYPE_NOT_FOUND', message: 'Invalid documentTypeId' } }, { status: 400 })
  }

  const buffer  = Buffer.from(await file.arrayBuffer())

  // Verify actual file content matches declared MIME type (magic bytes check).
  // The browser-supplied file.type is untrusted and trivially spoofed.
  const detectedMime = detectMimeFromBytes(buffer)
  if (!detectedMime) {
    return NextResponse.json(
      { error: { code: 'INVALID_FILE_TYPE', message: 'File type could not be verified. Allowed types: PDF, JPEG, PNG, WebP, HEIC' } },
      { status: 400 }
    )
  }
  if (detectedMime !== file.type) {
    return NextResponse.json(
      { error: { code: 'FILE_TYPE_MISMATCH', message: 'Declared file type does not match actual file content' } },
      { status: 400 }
    )
  }

  const fileHash = await hashBuffer(buffer)

  // Upload to R2 before the transaction so we don't hold a DB lock during I/O.
  // The file key is deterministic; if the transaction rolls back the orphaned R2
  // object is harmless (no DB record points to it).
  const fileKey = generateDocKey(profileId, docType.slug, file.name)
  await uploadToR2(fileKey, buffer, file.type, {
    profileId,
    documentTypeId: docTypeId,
    originalName:   file.name,
  })

  // Atomic duplicate-check + supersede + insert in a single transaction.
  // Without the transaction, two concurrent uploads of the same file can both
  // pass the duplicate check and both be inserted (TOCTOU race condition).
  let doc: typeof complianceDocuments.$inferSelect
  try {
    doc = await db.transaction(async (tx) => {
      // Check for exact duplicate inside the transaction
      const existing = await tx.query.complianceDocuments.findFirst({
        where: and(
          eq(complianceDocuments.profileId, profileId),
          eq(complianceDocuments.documentTypeId, docTypeId),
          eq(complianceDocuments.fileHash, fileHash),
          eq(complianceDocuments.isCurrent, true),
        ),
      })

      if (existing) {
        throw Object.assign(new Error('DUPLICATE_FILE'), { code: 'DUPLICATE_FILE' })
      }

      // Atomically mark previous version(s) superseded
      await tx.update(complianceDocuments)
        .set({ isCurrent: false, status: 'superseded' })
        .where(and(
          eq(complianceDocuments.profileId, profileId),
          eq(complianceDocuments.documentTypeId, docTypeId),
          eq(complianceDocuments.isCurrent, true),
        ))

      const [newDoc] = await tx.insert(complianceDocuments).values({
        profileId,
        documentTypeId: docTypeId,
        status:         'pending',
        fileKey,
        fileName:       file.name,
        fileSizeBytes:  file.size,
        mimeType:       file.type,
        fileHash,
      }).returning()

      return newDoc
    })
  } catch (err: any) {
    if (err?.code === 'DUPLICATE_FILE') {
      return NextResponse.json({ error: { code: 'DUPLICATE_FILE', message: 'Identical document already uploaded' } }, { status: 409 })
    }
    throw err
  }

  // Grant document access to the contractor
  await db.insert(documentAccess).values({
    documentId:   doc.id,
    contractorId,
    grantedBy:    grantedBy ?? undefined,
  }).onConflictDoNothing()

  // Enqueue security scan + processing job chain (non-fatal — doc is stored regardless)
  try {
    await enqueueJob('virus_scan', {
      documentId:  doc.id,
      profileId,
      contractorId,
      fileKey,
      mimeType:    file.type,
      docTypeSlug: docType.slug,
    })
  } catch {
    // Redis unavailable — upload still succeeds; job will need to be requeued manually
  }

  // ── Session completion check (magic-link mode only) ──────────────────────
  // Mark session as completed when all required document types have been uploaded.
  // This lets subsequent uploads in the same session proceed until all docs are done,
  // then locks the session to prevent further use.
  if (sessionId && sessionRequiredDocTypeIds && sessionRequiredDocTypeIds.length > 0) {
    const uploadedDocTypes = await db
      .select({ documentTypeId: complianceDocuments.documentTypeId })
      .from(complianceDocuments)
      .where(and(
        eq(complianceDocuments.profileId, profileId),
        eq(complianceDocuments.isCurrent, true),
        isNull(complianceDocuments.deletedAt),
        inArray(complianceDocuments.documentTypeId, sessionRequiredDocTypeIds),
      ))
    const uploadedTypeIds = new Set(uploadedDocTypes.map(r => r.documentTypeId))
    const allDone = sessionRequiredDocTypeIds.every(id => uploadedTypeIds.has(id))
    if (allDone) {
      await db.update(uploadSessions)
        .set({ completedAt: new Date() })
        .where(eq(uploadSessions.id, sessionId))
    }
  }

  logAudit({
    contractorId,
    actorId:    grantedBy ?? undefined,
    action:     'document_uploaded',
    resourceType: 'compliance_document',
    resourceId: doc.id,
    payload: {
      // Omit fileName: it often contains the subject's real name (PII).
      // The document record itself (resourceId) links back to the file.
      profileId,
      documentTypeId: docTypeId,
      fileSizeBytes:  file.size,
      mimeType:       file.type,
      uploadMode:     uploadToken ? 'magic_link' : 'authenticated',
    },
    ipAddress: ip,
  })

  return NextResponse.json({
    documentId: doc.id,
    status:     'pending',
    message:    'Document uploaded successfully. Processing and security scanning will begin shortly.',
  }, { status: 201 })
  } catch (err) {
    console.error('[upload] unhandled error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred. Please try again.' } },
      { status: 500 }
    )
  }
}
