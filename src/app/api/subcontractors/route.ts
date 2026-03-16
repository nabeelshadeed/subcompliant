import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { subcontractors, subProfiles, riskScores, uploadSessions, documentTypes } from '@/lib/db/schema'
import { eq, and, inArray, desc, sql } from 'drizzle-orm'
import { getAuthContext, requireAdmin } from '@/lib/auth/get-auth'
import { sendMagicLinkInvite } from '@/lib/resend'
import { addHours } from 'date-fns'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { ctx, error } = await getAuthContext()
  if (error) return error

  const search = req.nextUrl.searchParams.get('q')
  const status = req.nextUrl.searchParams.get('status')
  const page   = parseInt(req.nextUrl.searchParams.get('page') ?? '1')
  const limit  = Math.min(parseInt(req.nextUrl.searchParams.get('limit') ?? '25'), 100)
  const offset = (page - 1) * limit

  const subs = await db
    .select({
      id:          subcontractors.id,
      status:      subcontractors.status,
      displayName: subcontractors.displayName,
      invitedAt:   subcontractors.invitedAt,
      activatedAt: subcontractors.activatedAt,
      profile: {
        id:          subProfiles.id,
        firstName:   subProfiles.firstName,
        lastName:    subProfiles.lastName,
        companyName: subProfiles.companyName,
        ownerEmail:  subProfiles.ownerEmail,
        phone:       subProfiles.phone,
        shareToken:  subProfiles.shareToken,
      },
      riskScore: riskScores.score,
    })
    .from(subcontractors)
    .innerJoin(subProfiles, eq(subcontractors.profileId, subProfiles.id))
    .leftJoin(riskScores, and(
      eq(riskScores.profileId, subProfiles.id),
      eq(riskScores.contractorId, ctx.contractorId),
      eq(riskScores.isCurrent, true),
    ))
    .where(and(
      eq(subcontractors.contractorId, ctx.contractorId),
      status ? eq(subcontractors.status, status as any) : undefined,
      search
        ? sql`(${subProfiles.firstName} || ' ' || ${subProfiles.lastName} || ' ' || COALESCE(${subProfiles.companyName}, '')) ILIKE ${`%${search}%`}`
        : undefined,
    ))
    .orderBy(desc(subcontractors.createdAt))
    .limit(limit)
    .offset(offset)

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subcontractors)
    .where(eq(subcontractors.contractorId, ctx.contractorId))

  return NextResponse.json({
    data: subs,
    meta: { total: count, page, limit, pages: Math.ceil(count / limit) },
  })
}

const inviteSchema = z.object({
  email:                z.string().email(),
  name:                 z.string().optional(),
  requiredDocTypeSlugs: z.array(z.string()).optional(),
  customMessage:        z.string().max(500).optional(),
  expiryHours:          z.number().default(72),
  projectId:            z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  const { ctx, error } = await getAuthContext()
  if (error) return error

  const adminError = requireAdmin(ctx)
  if (adminError) return adminError

  // Check plan sub limit
  const [{ count: activeSubs }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subcontractors)
    .where(and(
      eq(subcontractors.contractorId, ctx.contractorId),
      inArray(subcontractors.status, ['active', 'invited']),
    ))

  if (activeSubs >= ctx.contractor.subLimit) {
    return NextResponse.json({
      error: { code: 'PLAN_LIMIT_REACHED', message: `Your plan allows ${ctx.contractor.subLimit} subcontractors. Upgrade to add more.` }
    }, { status: 402 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = inviteSchema.safeParse(body)
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
    docTypeIds   = types.map(t => t.id)
    docTypeNames = types.map(t => t.name)
  }

  const token     = crypto.randomBytes(48).toString('base64url')
  const expiresAt = addHours(new Date(), data.expiryHours)

  const [session] = await db.insert(uploadSessions).values({
    token,
    contractorId:       ctx.contractorId,
    createdBy:          ctx.userId,
    requiredDocTypeIds: docTypeIds,
    customMessage:      data.customMessage,
    expiresAt,
    subEmail:           data.email,
    subName:            data.name,
    isSingleUse:        true,
  }).returning()

  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/upload?t=${token}`

  await sendMagicLinkInvite({
    to:             data.email,
    subName:        data.name ?? 'there',
    contractorName: ctx.contractor.name,
    magicLink,
    customMessage:  data.customMessage,
    expiresAt,
    requiredDocs:   docTypeNames,
  })

  return NextResponse.json({ sessionId: session.id, magicLink, expiresAt: expiresAt.toISOString() }, { status: 201 })
}
