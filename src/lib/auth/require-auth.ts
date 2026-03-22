import { getServerUserId } from '@/lib/auth/get-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Fetch the authenticated DB user from server components / pages.
 * Redirects to sign-in if unauthenticated, sign-up if no DB record.
 */
export async function requireUser() {
  const clerkUserId = await getServerUserId()
  if (!clerkUserId) redirect('/auth/sign-in')

  const user = await db.query.users.findFirst({
    where: eq(users.clerkUserId, clerkUserId),
    with:  { contractor: true },
  })
  if (!user) redirect('/auth/sign-up')

  return user
}
