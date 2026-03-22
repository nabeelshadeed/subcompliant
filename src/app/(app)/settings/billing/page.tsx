import { requireUser } from '@/lib/auth/require-auth'
import { db } from '@/lib/db'
import { subcontractors } from '@/lib/db/schema'
import { eq, and, inArray, sql } from 'drizzle-orm'
import { Metadata } from 'next'
import BillingClient from './BillingClient'

export const metadata: Metadata = { title: 'Billing & Plan' }

export default async function BillingPage() {
  const user = await requireUser()
  const contractor = user.contractor

  let currentSubs = 0
  try {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(subcontractors)
      .where(and(
        eq(subcontractors.contractorId, user.contractorId),
        inArray(subcontractors.status, ['active', 'invited']),
      ))
    currentSubs = result[0]?.count ?? 0
  } catch { /* non-fatal */ }

  return (
    <BillingClient
      currentSubs={currentSubs}
      subLimit={contractor?.subLimit ?? 10}
      plan={contractor?.plan ?? 'starter'}
    />
  )
}
