import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page not found | SubCompliant',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-accent/20 border border-accent/30 mb-6">
        <ShieldCheck size={28} className="text-accent" />
      </div>

      <p className="text-accent font-bold font-mono text-sm mb-2 tracking-widest">404</p>
      <h1
        className="text-3xl font-bold text-white mb-3"
        style={{ fontFamily: "'Syne', system-ui, sans-serif" }}
      >
        Page not found
      </h1>
      <p className="text-white/60 text-sm max-w-xs mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-[#0A0A0A] text-sm font-semibold hover:bg-accent/90 transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
