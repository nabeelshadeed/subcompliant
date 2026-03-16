import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, notifications } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { formatRelative } from '@/lib/utils'
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notifications' }

export default async function NotificationsPage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect('/auth/sign-in')

  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) })
  if (!user) redirect('/auth/sign-up')

  const notifs = await db.query.notifications.findMany({
    where: eq(notifications.contractorId, user.contractorId),
    orderBy: (n, { desc }) => [desc(n.createdAt)],
    limit: 100,
  })

  const SeverityIcon = ({ severity }: { severity: string }) => {
    if (severity === 'critical') return <XCircle size={16} className="text-red-500" />
    if (severity === 'warning')  return <AlertTriangle size={16} className="text-yellow-500" />
    return <Info size={16} className="text-blue-400" />
  }

  function XCircle({ size, className }: any) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-400 mt-0.5">{notifs.length} total</p>
      </div>

      <div className="card overflow-hidden">
        {notifs.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            body="You're all caught up. Alerts for expiring documents and compliance changes will appear here."
          />
        ) : (
          <ul className="divide-y divide-gray-50">
            {notifs.map(n => (
              <li key={n.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50">
                <div className={`mt-0.5 p-1.5 rounded-lg flex-shrink-0 ${
                  n.severity === 'critical' ? 'bg-red-50' :
                  n.severity === 'warning'  ? 'bg-yellow-50' : 'bg-blue-50'
                }`}>
                  <SeverityIcon severity={n.severity} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.subject ?? n.eventType}</p>
                  {n.body && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400">{formatRelative(n.createdAt)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      n.status === 'delivered' ? 'bg-green-50 text-green-600' :
                      n.status === 'failed'    ? 'bg-red-50 text-red-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {n.status}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">{n.channel}</span>
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
