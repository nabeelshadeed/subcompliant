import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { uploadSessions, documentTypes } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'
import { getAuthContext, requireAdmin } from '@/lib/auth/get-auth'
import { sendMagicLinkInvite } from '@/lib/resend'
import { rateLimit } from '@/lib/redis'
import { addHours } from 'date-fns'

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
  const { ctx, error } = await getAuthContext()
  if (error) return error

  const adminError = requireAdmin(ctx)
  if (adminError) return adminError

  const rl = await rateLimit(`magic-link:${ctx.contractorId}`, 50, 3600)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMITED', message: 'Too many invites sent. Try again in an hour.' } },
      { status: 429 }
    )
  }

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.error.message } }, { status: 400 })
  }

  const data = parsed.data

  // Resolve document type IDs
  let docTypeIds: string[] | undefined
  let docTypeNames: string[] = ['All required compliance documents']

  if (data.requiredDocTypeSlugs?.length) {
    const types = await db.query.documentTypes.findMany({
      where: inArray(documentTypes.slug, data.requiredDocTypeSlugs),
    })
    const missingSlugs = data.requiredDocTypeSlugs.filter(s => !types.some(t => t.slug === s))
    if (missingSlugs.length > 0) {
      return NextResponse.json(
        { error: { code: 'INVALID_DOC_TYPES', message: `Unknown document type slugs: ${missingSlugs.join(', ')}` } },
        { status: 400 }
      )
    }
    docTypeIds   = types.map(t => t.id)
    docTypeNames = types.map(t => t.name)
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
    isSingleUse:        true,
  }).returning()

  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/upload?t=${token}`

  await sendMagicLinkInvite({
    to:             data.subContractorEmail,
    subName:        data.subContractorName ?? 'there',
    contractorName: ctx.contractor.name,
    magicLink,
    customMessage:  data.customMessage,
    expiresAt,
    requiredDocs:   docTypeNames,
  })

  return NextResponse.json({ sessionId: session.id, magicLink, expiresAt: expiresAt.toISOString() }, { status: 201 })
}
