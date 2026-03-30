import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { subcontractors, subProfiles, riskScores, uploadSessions, documentTypes } from '@/lib/db/schema'
import { eq, and, inArray, desc, sql, isNull } from 'drizzle-orm'
import { getAuthContext, requireAdmin } from '@/lib/auth/get-auth'
import { sendMagicLinkInvite } from '@/lib/resend'
import { rateLimit } from '@/lib/redis'
import { addHours } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
  const { ctx, error } = await getAuthContext(req)
  if (error) return error

  const search = req.nextUrl.searchParams.get('q')
  const status = req.nextUrl.searchParams.get('status')
  const page   = Math.max(1, parseInt(req.nextUrl.searchParams.get('page')  ?? '1',  10) || 1)
  const limit  = Math.min(Math.max(1, parseInt(req.nextUrl.searchParams.get('limit') ?? '25', 10) || 25), 100)
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
      isNull(subcontractors.deletedAt),
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
    .where(and(
      eq(subcontractors.contractorId, ctx.contractorId),
      isNull(subcontractors.deletedAt),
    ))

  return NextResponse.json({
    data: subs,
    meta: { total: count, page, limit, pages: Math.ceil(count / limit) },
  })
  } catch (err) {
    console.error('[subcontractors:GET] unhandled error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 }
    )
  }
}

const inviteSchema = z.object({
  email:                z.string().email(),
  name:                 z.string().max(200).optional(),
  requiredDocTypeSlugs: z.array(z.string()).max(20).optional(),
  customMessage:        z.string().max(500).optional(),
  // Clamp to 1–720 hours (1h min prevents already-expired sessions; 720h = 30 days max)
  expiryHours:          z.number().min(1, 'expiryHours must be at least 1').max(720, 'expiryHours cannot exceed 720 (30 days)').default(72),
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

  // Check plan sub limit — skip enforcement during active trial so new users
  // can import their full supply chain before deciding on a plan
  const inActiveTrial = ctx.contractor.trialEndsAt
    ? new Date() < new Date(ctx.contractor.trialEndsAt)
    : false

  if (!inActiveTrial) {
    const [{ count: activeSubs }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(subcontractors)
      .where(and(
        eq(subcontractors.contractorId, ctx.contractorId),
        inArray(subcontractors.status, ['active', 'invited']),
        isNull(subcontractors.deletedAt),
      ))

    if (activeSubs >= ctx.contractor.subLimit) {
      return NextResponse.json({
        error: { code: 'PLAN_LIMIT_REACHED', message: `Your plan allows ${ctx.contractor.subLimit} subcontractors. Upgrade to add more.` }
      }, { status: 402 })
    }
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
    subEmail:           data.email,
    subName:            data.name,
    isSingleUse:        false,
  }).returning()

  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/upload?t=${token}`

  try {
    await sendMagicLinkInvite({
      to:             data.email,
      subName:        data.name ?? 'there',
      contractorName: ctx.contractor.name,
      magicLink,
      customMessage:  data.customMessage,
      expiresAt,
      requiredDocs:   docTypeNames,
    })
  } catch (emailErr) {
    // Email failed — session is created, log for manual follow-up
    console.error('[subcontractors:POST] invite email failed:', emailErr, { sessionId: session.id, to: data.email })
    return NextResponse.json(
      { error: { code: 'EMAIL_SEND_FAILED', message: 'Invitation created but email could not be sent. Please copy and share the link manually.', magicLink } },
      { status: 502 }
    )
  }

  return NextResponse.json({ sessionId: session.id, magicLink, expiresAt: expiresAt.toISOString() }, { status: 201 })
  } catch (err) {
    console.error('[subcontractors:POST] unhandled error:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 }
    )
  }
}
