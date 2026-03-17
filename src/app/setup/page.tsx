import Link from 'next/link'
import { Database, ArrowRight } from 'lucide-react'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-2xl border border-white/10 p-8 bg-[#111]" role="main">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
            <Database className="text-amber-400" size={24} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-display">Setup required</h1>
            <p className="text-sm text-white/60">Your database is not set up yet or you need to complete sign-in.</p>
          </div>
        </div>
        <p className="text-white/70 text-sm mb-4">
          If you&apos;re the developer: run the database migration once with your Neon connection string:
        </p>
        <pre className="bg-black/40 text-white/90 text-xs p-4 rounded-lg overflow-x-auto mb-6 border border-white/10 font-mono">
          DATABASE_URL=&quot;your-neon-connection-string&quot; npm run db:push
        </pre>
        <p className="text-white/60 text-sm mb-6">
          Get the connection string from Neon Console → your project → Connection string (pooled). Then refresh this page.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-accent hover:text-accent-hover font-medium text-sm transition-colors"
        >
          Back to home
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>
    </div>
  )
}
