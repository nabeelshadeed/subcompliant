import Link from 'next/link'
import { ShieldCheck, Mail } from 'lucide-react'
import SetupPoller from './SetupPoller'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-white/10 p-8 bg-[#111] space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
            <ShieldCheck className="text-accent" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">Setting up your account…</h1>
            <p className="text-sm text-white/60">This takes just a few seconds</p>
          </div>
        </div>

        <p className="text-white/70 text-sm leading-relaxed">
          We&apos;re provisioning your workspace. The page will redirect automatically — no action needed.
          If it takes more than 30 seconds, contact support.
        </p>

        {/* Auto-polls /api/auth/me every 3s and redirects to /dashboard when ready */}
        <SetupPoller />

        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 font-medium text-sm rounded-lg hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          <Mail size={13} />
          Contact support
        </Link>
      </div>
    </div>
  )
}
