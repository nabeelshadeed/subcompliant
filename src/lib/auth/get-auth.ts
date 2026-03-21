import { createClerkClient } from '@clerk/backend'
import { db } from '@/lib/db'
import { users, contractors, auditLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export interface AuthContext {
  clerkUserId:  string
  userId:       string
  contractorId: string
  role:         'owner' | 'admin' | 'viewer'
  contractor:   typeof contractors.$inferSelect
}

/**
 * Resolve the authenticated Clerk session to a DB user + contractor.
 * Uses @clerk/backend authenticateRequest() so it works in Cloudflare Workers
 * where Next.js middleware header-forwarding doesn't propagate auth state.
 */
export async function getAuthContext(req: NextRequest): Promise<
  { ctx: AuthContext; error: null } | { ctx: null; error: NextResponse }
> {
  const clerk = createClerkClient({
    secretKey:      process.env.CLERK_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  })

  const requestState = await clerk.authenticateRequest(req, {
    secretKey:      process.env.CLERK_SECRET_KEY!,
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  })

  const clerkUserId = requestState.isSignedIn ? requestState.toAuth().userId : null

  if (!clerkUserId) {
    return {
      ctx: null,
      error: NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }, { status: 401 }),
    }
  }

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
    with:  { contractor: true },
  })

  if (!user || !user.contractor) {
    return {
      ctx: null,
      error: NextResponse.json({ error: { code: 'USER_NOT_FOUND', message: 'User record not found. Please complete onboarding.' } }, { status: 404 }),
    }
  }

  if (!user.contractor.isActive) {
    return {
      ctx: null,
      error: NextResponse.json({ error: { code: 'ACCOUNT_SUSPENDED', message: 'Account suspended. Contact support.' } }, { status: 403 }),
    }
  }

  return {
    ctx: {
      clerkUserId,
      userId:       user.id,
      contractorId: user.contractorId,
      role:         user.role,
      contractor:   user.contractor,
    },
    error: null,
  }
}

/**
 * Require admin or owner role, return 403 otherwise
 */
export function requireAdmin(ctx: AuthContext): NextResponse | null {
  if (ctx.role === 'viewer') {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Admin role required' } },
      { status: 403 }
    )
  }
  return null
}

/**
 * Audit log helper
 */
export function logAudit(params: {
  contractorId:  string
  actorId?:      string
  actorEmail?:   string
  action:        string
  resourceType?: string
  resourceId?:   string
  payload?:      unknown
  ipAddress?:    string
}): void {
  db.insert(auditLogs).values({
    contractorId: params.contractorId,
    actorId:      params.actorId,
    actorEmail:   params.actorEmail,
    action:       params.action,
    resourceType: params.resourceType,
    resourceId:   params.resourceId,
    payload:      params.payload ?? null,
    ipAddress:    params.ipAddress,
  }).catch(err => console.error('[audit-log-fail]', { action: params.action, resourceId: params.resourceId, err })) // fire-and-forget
}
