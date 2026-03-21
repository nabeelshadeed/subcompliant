import { getServerUserId } from '@/lib/auth/get-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, notifications } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { formatRelative } from '@/lib/utils'
import { Bell, AlertTriangle, Info, XCircle } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notifications' }

export default async function NotificationsPage() {
  const clerkUserId = await getServerUserId()
  if (!clerkUserId) redirect('/auth/sign-in')

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) })
  if (!user) redirect('/auth/sign-up')

  const notifs = await db.query.notifications.findMany({
    where: eq(notifications.contractorId, user.contractorId),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit: 100,
  })

  const SeverityIcon = ({ severity }: { severity: string }) => {
    if (severity === 'critical') return <XCircle size={16} className="text-red-400" aria-hidden />
    if (severity === 'warning')  return <AlertTriangle size={16} className="text-amber-400" aria-hidden />
    return <Info size={16} className="text-blue-400" aria-hidden />
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold font-display text-white">Notifications</h1>
        <p className="text-sm text-white/60 mt-0.5">{notifs.length} total</p>
      </div>

      <div className="card overflow-hidden">
        {notifs.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            body="You're all caught up. Alerts for expiring documents and compliance changes will appear here."
          />
        ) : (
          <ul className="divide-y divide-white/10">
            {notifs.map(n => (
              <li key={n.id} className="flex items-start gap-4 px-5 py-4 hover:bg-white/5">
                <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                  n.severity === 'critical' ? 'bg-red-500/20' :
                  n.severity === 'warning'  ? 'bg-amber-500/20' : 'bg-blue-500/20'
                }`}>
                  <SeverityIcon severity={n.severity} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{n.subject ?? n.eventType}</p>
                  {n.body && (
                    <p className="text-sm text-white/60 mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-white/50">{formatRelative(n.createdAt)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      n.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                      n.status === 'failed'    ? 'bg-red-500/20 text-red-400' :
                      'bg-white/10 text-white/50'
                    }`}>
                      {n.status}
                    </span>
                    <span className="text-xs text-white/50 capitalize">{n.channel}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
