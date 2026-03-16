import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  complianceDocuments, subProfiles, uploadSessions,
  subcontractors, documentAccess, documentTypes
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { uploadToR2, generateDocKey, hashBuffer } from '@/lib/r2'
import { enqueueJob, rateLimit } from '@/lib/redis'
import { getAuthContext, logAudit } from '@/lib/auth/get-auth'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
]
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB

export async function POST(req: NextRequest) {
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

  if (uploadToken) {
    // ── Magic-link mode ─────────────────────────────────────────────────────
    const session = await db.query.uploadSessions.findFirst({
      where: eq(uploadSessions.token, uploadToken),
    })

    if (!session || new Date() > session.expiresAt) {
      return NextResponse.json({ error: { code: 'SESSION_INVALID', message: 'Invalid or expired upload link' } }, { status: 401 })
    }

    contractorId = session.contractorId

    // Get or create sub profile from session info
    const subEmail = req.headers.get('x-sub-email') ?? session.subEmail
    const subName  = req.headers.get('x-sub-name')  ?? session.subName ?? 'Unknown'
    const [firstName, ...rest] = (subName).split(' ')

    let profile = await db.query.subProfiles.findFirst({
      where: eq(subProfiles.ownerEmail, subEmail ?? '')
    })

    if (!profile) {
      const shareToken = crypto.randomBytes(32).toString('base64url')
      const [created] = await db.insert(subProfiles).values({
        shareToken,
        ownerEmail: subEmail!,
        firstName:  firstName ?? subName,
        lastName:   rest.join(' ') || '—',
        companyName: req.headers.get('x-sub-company') ?? undefined,
      }).returning()
      profile = created
    }

    profileId = profile.id

    // Ensure subcontractor relationship exists for this contractor/profile pair
    let sub = await db.query.subcontractors.findFirst({
      where: and(
        eq(subcontractors.contractorId, contractorId),
        eq(subcontractors.profileId, profileId),
      ),
    })

    if (!sub) {
      const [createdSub] = await db.insert(subcontractors).values({
        contractorId,
        profileId,
        status:      'active',
        invitedAt:   session.createdAt,
        activatedAt: new Date(),
      }).returning()
      sub = createdSub
    }

    // Mark session used (idempotent)
    await db.update(uploadSessions)
      .set({ subcontractorId: sub.id, usedAt: new Date() })
      .where(eq(uploadSessions.id, session.id))

  } else {
    // ── Authenticated mode (Clerk) ──────────────────────────────────────────
    const { ctx, error } = await getAuthContext()
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
  const rl = await rateLimit(rateKey, 20, 60) // 20 uploads per minute per profile+IP
  if (!rl.allowed) {
    return NextResponse.json({
      error: {
        code:    'RATE_LIMITED',
        message: 'Too many uploads. Please wait a moment and try again.',
      },
    }, { status: 429 })
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
  const fileHash = hashBuffer(buffer)

  // Check for exact duplicate (same hash, same profile, same type)
  const existing = await db.query.complianceDocuments.findFirst({
    where: and(
      eq(complianceDocuments.profileId, profileId),
      eq(complianceDocuments.documentTypeId, docTypeId),
      eq(complianceDocuments.fileHash, fileHash),
      eq(complianceDocuments.isCurrent, true),
    )
  })

  if (existing) {
    return NextResponse.json({ error: { code: 'DUPLICATE_FILE', message: 'Identical document already uploaded' } }, { status: 409 })
  }

  // Mark any existing document of this type as superseded
  await db.update(complianceDocuments)
    .set({ isCurrent: false, status: 'superseded' })
    .where(and(
      eq(complianceDocuments.profileId, profileId),
      eq(complianceDocuments.documentTypeId, docTypeId),
      eq(complianceDocuments.isCurrent, true),
    ))

  // Upload to R2
  const fileKey = generateDocKey(profileId, docType.slug, file.name)
  await uploadToR2(fileKey, buffer, file.type, {
    profileId,
    documentTypeId: docTypeId,
    originalName:   file.name,
  })

  // Insert document record
  const [doc] = await db.insert(complianceDocuments).values({
    profileId,
    documentTypeId: docTypeId,
    status:         'pending',
    fileKey,
    fileName:       file.name,
    fileSizeBytes:  file.size,
    mimeType:       file.type,
    fileHash,
  }).returning()

  // Grant document access to the contractor
  await db.insert(documentAccess).values({
    documentId:   doc.id,
    contractorId,
    grantedBy:    grantedBy ?? undefined,
  }).onConflictDoNothing()

  // Enqueue security scan + processing job chain
  await enqueueJob('virus_scan', {
    documentId:  doc.id,
    profileId,
    contractorId,
    fileKey,
    mimeType:    file.type,
    docTypeSlug: docType.slug,
  })

  logAudit({
    contractorId,
    actorId:    grantedBy ?? undefined,
    action:     'document_uploaded',
    resourceType: 'compliance_document',
    resourceId: doc.id,
    payload: {
      profileId,
      documentTypeId: docTypeId,
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type,
      uploadMode: uploadToken ? 'magic_link' : 'authenticated',
    },
    ipAddress: ip,
  })

  return NextResponse.json({
    documentId: doc.id,
    status:     'pending',
    message:    'Document uploaded successfully. Processing and security scanning will begin shortly.',
  }, { status: 201 })
}
