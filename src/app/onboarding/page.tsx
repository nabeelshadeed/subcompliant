import { getServerUserId } from '@/lib/auth/get-auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { users, contractors } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { ShieldCheck } from 'lucide-react'
import OnboardingPlanPicker from './OnboardingPlanPicker'

export const metadata = { title: 'Choose your plan — SubCompliant' }

export default async function OnboardingPage() {
  const clerkUserId = await getServerUserId()
  if (!clerkUserId) redirect('/auth/sign-in')

  // If they already have an active subscription, send them to the dashboard
  const user = await db.query.users.findFirst({ where: eq(users.clerkUserId, clerkUserId) })
  if (user) {
    const contractor = await db.query.contractors.findFirst({ where: eq(contractors.id, user.contractorId) })
    if (contractor?.stripeSubId) redirect('/dashboard')
  }

  // No DB record yet — send back to setup to be provisioned
  if (!user) redirect('/setup')

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-2">
            <ShieldCheck size={13} />
            Account ready
          </div>
          <h1 className="text-4xl font-black text-white font-display">
            Choose your plan
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Start your 7-day free trial. Full access, card required — cancel before day 7 and you won&apos;t be charged.
          </p>
        </div>

        <OnboardingPlanPicker />
      </div>
    </div>
  )
}
