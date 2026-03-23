import { getServerUserId } from '@/lib/auth/get-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, notifications, contractors } from '@/lib/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'
import AppShell from '@/components/layout/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await getServerUserId()
  if (!userId) redirect('/auth/sign-in')

  let recentNotifCount = 0
  let trialEndsAt: string | null = null
  let plan = 'starter'

  try {
    const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) })
    if (!user) redirect('/setup')

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const [notifResult, contractor] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(and(
          eq(notifications.contractorId, user.contractorId),
          gte(notifications.createdAt, new Date(since)),
        )),
      db.query.contractors.findFirst({
        where: eq(contractors.id, user.contractorId),
      }),
    ])
    recentNotifCount = notifResult[0]?.count ?? 0
    trialEndsAt = contractor?.trialEndsAt?.toISOString() ?? null
    plan = contractor?.plan ?? 'starter'

    // Require an active Stripe subscription (or active trial) to use the app
    const hasSub   = !!contractor?.stripeSubId
    const inTrial  = contractor?.trialEndsAt ? contractor.trialEndsAt > new Date() : false
    if (!hasSub && !inTrial) redirect('/onboarding')
  } catch (err: any) {
    // Re-throw redirects; swallow other errors so the shell still renders
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err
  }

  return (
    <AppShell recentNotifCount={recentNotifCount} trialEndsAt={trialEndsAt} plan={plan}>
      {children}
    </AppShell>
  )
}
