import { getServerUserId } from '@/lib/auth/get-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, notifications } from '@/lib/db/schema'
import { eq, and, gte, sql } from 'drizzle-orm'
import Sidebar from '@/components/layout/Sidebar'
import TopBar  from '@/components/layout/TopBar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await getServerUserId()
  if (!userId) redirect('/auth/sign-in')

  // Fetch user + recent notification count (last 7 days) for sidebar badge
  let recentNotifCount = 0
  try {
    const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, userId) })
    if (user) {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const result = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(and(
          eq(notifications.contractorId, user.contractorId),
          gte(notifications.createdAt, new Date(since)),
        ))
      recentNotifCount = result[0]?.count ?? 0
    }
  } catch {
    // Non-fatal — badge just won't show
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden font-sans">
      <Sidebar recentNotifCount={recentNotifCount} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  )
}
