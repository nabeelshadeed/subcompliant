import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { uploadSessions } from '@/lib/db/schema'
import { getAuthContext, requireAdmin } from '@/lib/auth/get-auth'
import { sendMagicLinkInvite } from '@/lib/resend'
import { rateLimit } from '@/lib/redis'
import { addHours } from 'date-fns'
import { upsertDocTypesBySlug } from '@/lib/seed-doc-types'

export const dynamic = 'force-dynamic'

const schema = z.object({
  subContractorEmail:   z.string().email(),
  subContractorName:    z.string().optional(),
  tradeSlug:            z.string().optional(),
  requiredDocTypeSlugs: z.array(z.string()).optional(),
  customMessage:        z.string().max(500).optional(),
  expiryHours:          z.number().int().min(1).max(168).default(72),
  projectId:            z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  try {
  const { ctx, error } = await getAuthContext(req)
  if (error) return error

  const adminError = requireAdmin(ctx)
  if (adminError) return adminError

  try {
    const rl = await rateLimit(`magic-link:${ctx.contractorId}`, 50, 3600)
    if (!rl.allowed) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many invites sent. Try again in an hour.' } },
        { status: 429 }
      )
    }
  } catch {
    // Redis unavailable — allow invite without rate limiting
  }

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } }, { status: 400 })
  }

  const data = parsed.data

  // Resolve document type IDs — auto-create any missing built-in types on first use
  let docTypeIds: string[] | undefined
  let docTypeNames: string[] = ['All required compliance documents']

  if (data.requiredDocTypeSlugs?.length) {
    const resolved = await upsertDocTypesBySlug(data.requiredDocTypeSlugs)
    docTypeIds   = resolved.map(t => t.id)
    docTypeNames = resolved.map(t => t.name)
  }

  const token     = Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(48))).toString('base64url')
  const expiresAt = addHours(new Date(), data.expiryHours)

  const [session] = await db.insert(uploadSessions).values({
    token,
    contractorId:       ctx.contractorId,
    createdBy:          ctx.userId,
    requiredDocTypeIds: docTypeIds,
    customMessage:      data.customMessage,
    expiresAt,
    subEmail:           data.subContractorEmail,
    subName:            data.subContractorName,
    isSingleUse:        false,
  }).returning()

  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/upload?t=${token}`

  try {
    await sendMagicLinkInvite({
      to:             data.subContractorEmail,
      subName:        data.subContractorName ?? 'there',
      contractorName: ctx.contractor.name,
      magicLink,
      customMessage:  data.customMessage,
      expiresAt,
      requiredDocs:   docTypeNames,
    })
  } catch (emailErr) {
    console.error('[magic-link] invite email failed:', emailErr, { sessionId: session.id })
    return NextResponse.json(
      { error: { code: 'EMAIL_SEND_FAILED', message: 'Invitation created but email could not be sent. Share this link manually.', magicLink } },
      { status: 502 }
    )
  }

  return NextResponse.json({ sessionId: session.id, magicLink, expiresAt: expiresAt.toISOString() }, { status: 201 })
  } catch (err) {
    console.error('[magic-link] unhandled error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred. Please try again.' } },
      { status: 500 }
    )
  }
}
