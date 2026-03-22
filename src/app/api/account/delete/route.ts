import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, logAudit } from '@/lib/auth/get-auth'
import { db } from '@/lib/db'
import { contractors, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { createClerkClient } from '@clerk/backend'

export async function DELETE(req: NextRequest) {
  const { ctx, error } = await getAuthContext(req)
  if (error) return error

  // Only the owner can delete the account
  if (ctx.role !== 'owner') {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Only the account owner can delete the account' } }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  if (body?.confirm !== 'DELETE') {
    return NextResponse.json({ error: { code: 'CONFIRM_REQUIRED', message: 'Send { "confirm": "DELETE" } to confirm account deletion' } }, { status: 422 })
  }

  // Fetch all users in this contractor before any destructive operations
  const allUsers = await db.query.users.findMany({ where: eq(users.contractorId, ctx.contractorId) })

  logAudit({ contractorId: ctx.contractorId, actorId: ctx.userId, action: 'account.delete' })

  // Delete Clerk users FIRST — before touching the database.
  //
  // Ordering rationale: if we delete the DB record first and Clerk deletion
  // subsequently fails, the Clerk users still exist but have no contractor
  // record — they're permanently locked out with no way to recover the account.
  //
  // If Clerk deletion fails first, the DB record is intact and the user can
  // retry the deletion. Orphaned Clerk users (no DB record) are far less
  // harmful than an intact Clerk user with no DB record.
  const clerk = createClerkClient({
    secretKey:       process.env.CLERK_SECRET_KEY!,
    publishableKey:  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  })

  const clerkResults = await Promise.allSettled(
    allUsers.map(u => clerk.users.deleteUser(u.clerkUserId))
  )

  const clerkFailures = clerkResults.filter(r => r.status === 'rejected')
  if (clerkFailures.length > 0) {
    console.error(`[account.delete] ${clerkFailures.length} Clerk deletion(s) failed for contractor ${ctx.contractorId}`, clerkFailures)
    // Continue with DB deletion — partial Clerk cleanup is better than none.
    // Remaining Clerk users can't authenticate (no DB record) and will be
    // cleaned up on next login attempt via the Clerk webhook.
  }

  // Delete contractor from DB — cascades to all related data via FK onDelete: 'cascade'
  await db.delete(contractors).where(eq(contractors.id, ctx.contractorId))

  return NextResponse.json({ ok: true })
}
