import { NextRequest, NextResponse } from 'next/server'
import { createClerkClient } from '@clerk/backend'
import { db } from '@/lib/db'
import { users, contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

/**
 * Polled by the /setup page every 3 seconds.
 * Returns 200 when the user's DB record exists, 404 if not yet created.
 *
 * Self-healing: if the Clerk webhook failed (wrong secret, delivery failure,
 * race condition) this endpoint provisions the DB records directly from the
 * Clerk API so users are never permanently stuck on /setup.
 */
export async function GET(req: NextRequest) {
  const clerk = createClerkClient({
    secretKey:      process.env.CLERK_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  })

  const requestState = await clerk.authenticateRequest(req, {
    secretKey:      process.env.CLERK_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  })

  if (!requestState.isSignedIn) {
    return NextResponse.json({ ready: false }, { status: 401 })
  }

  const clerkUserId = requestState.toAuth().userId

  // Fast path: DB record already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
  })
  if (existingUser) {
    return NextResponse.json({ ready: true }, { status: 200 })
  }

  // Slow path: webhook hasn't fired (or failed). Provision directly from Clerk.
  try {
    const [clerkUser, memberships] = await Promise.all([
      clerk.users.getUser(clerkUserId),
      clerk.users.getOrganizationMembershipList({ userId: clerkUserId }),
    ])

    const membership = memberships.data[0]
    if (!membership) {
      // Clerk org not created yet (edge case) — keep polling
      return NextResponse.json({ ready: false }, { status: 404 })
    }

    const orgId  = membership.organization.id
    const isAdmin = membership.role === 'org:admin'

    // Get or create contractor (same logic as webhook handler)
    let contractor = await db.query.contractors.findFirst({
      where: eq(contractors.clerkOrgId, orgId),
    })

    if (!contractor) {
      const slug = membership.organization.slug ?? orgId.replace('org_', '')
      const [created] = await db.insert(contractors).values({
        clerkOrgId:  orgId,
        name:        membership.organization.name,
        slug,
        plan:        'starter',
        subLimit:    10,
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
      }).onConflictDoNothing().returning()
      contractor = created
    }

    if (!contractor) {
      // Race condition resolved by another request — re-fetch
      contractor = await db.query.contractors.findFirst({
        where: eq(contractors.clerkOrgId, orgId),
      })
    }

    if (!contractor) {
      return NextResponse.json({ ready: false }, { status: 404 })
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''

    const [newUser] = await db.insert(users).values({
      clerkUserId,
      contractorId: contractor.id,
      email,
      firstName:    clerkUser.firstName,
      lastName:     clerkUser.lastName,
      avatarUrl:    clerkUser.imageUrl,
      role:         isAdmin ? 'admin' : 'viewer',
    }).onConflictDoNothing().returning()

    if (newUser) {
      return NextResponse.json({ ready: true }, { status: 200 })
    }

    // onConflictDoNothing fired — another concurrent request won; user exists
    const raceUser = await db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) })
    if (raceUser) return NextResponse.json({ ready: true }, { status: 200 })
  } catch (err) {
    console.error('[auth/me] provision error:', err)
  }

  return NextResponse.json({ ready: false }, { status: 404 })
}
