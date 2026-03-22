import Link from 'next/link'
import { ShieldCheck, Mail, RefreshCw } from 'lucide-react'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-white/10 p-8 bg-[#111] space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center border border-accent/30">
            <ShieldCheck className="text-accent" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">Account setup</h1>
            <p className="text-sm text-white/60">Your account is being provisioned</p>
          </div>
        </div>

        <p className="text-white/70 text-sm leading-relaxed">
          This usually completes in a few seconds after sign-up. Try refreshing the page or signing out and back in.
          If the problem persists, contact support and we&apos;ll sort it straight away.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-[#0A0A0A] font-semibold text-sm rounded-lg hover:bg-accent-hover transition-colors"
          >
            <RefreshCw size={13} />
            Try again
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 font-medium text-sm rounded-lg hover:bg-white/10 hover:text-white transition-colors"
          >
            <Mail size={13} />
            Contact support
          </Link>
        </div>

        {/* Dev note — hidden in production via opacity */}
        <details className="text-xs text-white/30 cursor-pointer">
          <summary className="hover:text-white/50 transition-colors">Developer info</summary>
          <div className="mt-3 space-y-2">
            <p>If the database is not set up, run:</p>
            <pre className="bg-black/40 text-white/70 p-3 rounded-lg overflow-x-auto font-mono border border-white/10">
              npm run db:push
            </pre>
            <p>Get your connection string from Neon Console → your project → Connection string.</p>
          </div>
        </details>
      </div>
    </div>
  )
}
