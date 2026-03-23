import { getServerUserId } from '@/lib/auth/get-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Fetch the authenticated DB user from server components / pages.
 * Redirects to sign-in if unauthenticated, /setup if no DB record yet
 * (webhook may still be in-flight — /setup auto-retries).
 * Never redirects to /auth/sign-up for an already-authenticated user:
 * Clerk's <SignUp> component throws a Server Component error when rendered
 * for a user who is already signed in.
 */
export async function requireUser() {
  const clerkUserId = await getServerUserId()
  if (!clerkUserId) redirect('/auth/sign-in')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
    with:  { contractor: true },
  })
  if (!user) redirect('/setup')

  return user
}
