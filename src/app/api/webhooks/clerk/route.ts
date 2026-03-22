import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { db } from '@/lib/db'
import { users, contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cacheGet, cacheSet } from '@/lib/redis'
import { sendWelcomeEmail } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const svixId        = req.headers.get('svix-id') ?? ''
  const svixTimestamp = req.headers.get('svix-timestamp') ?? ''
  const svixSignature = req.headers.get('svix-signature') ?? ''
  const body          = await req.text()

  const wh = new Webhook(webhookSecret)
  let event: any

  try {
    event = wh.verify(body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  // Idempotency: svix-id is unique per delivery attempt. Clerk retries on 5xx
  // so without this a single event could create duplicate user/org records.
  const dedupKey = `webhook:clerk:${svixId}`
  const alreadyProcessed = await cacheGet<boolean>(dedupKey)
  if (alreadyProcessed) {
    return NextResponse.json({ received: true })
  }

  const { type, data } = event

  switch (type) {
    case 'user.created': {
      // If user has an org membership, link to contractor
      const orgId = data.organization_memberships?.[0]?.organization?.id
      let contractorId: string | null = null

      if (orgId) {
        const contractor = await db.query.contractors.findFirst({
          where: eq(contractors.clerkOrgId, orgId)
        })
        contractorId = contractor?.id ?? null
      }

      if (contractorId) {
        await db.insert(users).values({
          clerkUserId:  data.id,
          contractorId,
          email:        data.email_addresses?.[0]?.email_address ?? '',
          firstName:    data.first_name,
          lastName:     data.last_name,
          avatarUrl:    data.image_url,
          role:         'viewer',
        }).onConflictDoNothing()
      }
      break
    }

    case 'user.updated': {
      await db.update(users)
        .set({
          email:     data.email_addresses?.[0]?.email_address,
          firstName: data.first_name,
          lastName:  data.last_name,
          avatarUrl: data.image_url,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, data.id))
      break
    }

    case 'user.deleted': {
      await db.update(users)
        .set({ isActive: false })
        .where(eq(users.clerkUserId, data.id))
      break
    }

    case 'organization.created': {
      // Auto-create contractor record on org creation
      const slug = data.slug ?? data.id.replace('org_', '')
      await db.insert(contractors).values({
        clerkOrgId: data.id,
        name:       data.name,
        slug,
        plan:       'starter',
        subLimit:   10,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
      }).onConflictDoNothing()
      break
    }

    case 'organizationMembership.created': {
      const orgId = data.organization?.id
      const contractor = orgId
        ? await db.query.contractors.findFirst({ where: eq(contractors.clerkOrgId, orgId) })
        : null

      if (contractor) {
        const email     = data.public_user_data?.identifier ?? ''
        const firstName = data.public_user_data?.first_name ?? ''
        const isAdmin   = data.role === 'org:admin'

        await db.insert(users).values({
          clerkUserId:  data.public_user_data?.user_id,
          contractorId: contractor.id,
          email,
          firstName,
          lastName:     data.public_user_data?.last_name,
          avatarUrl:    data.public_user_data?.image_url,
          role:         isAdmin ? 'admin' : 'viewer',
        }).onConflictDoNothing()

        // Send welcome email to org admins only (the account owner)
        if (isAdmin && email) {
          const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://subcompliant.co.uk'
          await sendWelcomeEmail({
            to:             email,
            firstName:      firstName || 'there',
            contractorName: contractor.name,
            dashboardUrl:   `${appUrl}/dashboard`,
          }).catch(err => console.error('[clerk-webhook] welcome email failed:', err))
        }
      }
      break
    }

    default:
      // Ignore unhandled events
      break
  }

  await cacheSet(dedupKey, true, 86400)

  return NextResponse.json({ received: true })
}
