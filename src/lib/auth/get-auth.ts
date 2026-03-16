import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, contractors, auditLogs } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export interface AuthContext {
  clerkUserId:  string
  userId:       string
  contractorId: string
  role:         'owner' | 'admin' | 'viewer'
  contractor:   typeof contractors.$inferSelect
}

/**
 * Resolve the authenticated Clerk session to a DB user + contractor.
 * Returns null + 401 response if unauthenticated or user not found.
 */
export async function getAuthContext(): Promise<
  { ctx: AuthContext; error: null } | { ctx: null; error: NextResponse }
> {
  const { userId: clerkUserId } = await auth()

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
  }).catch(() => {}) // fire-and-forget
}
