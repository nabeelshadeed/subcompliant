'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPoller() {
  const router  = useRouter()
  const [state, setState] = useState<'polling' | 'slow' | 'failed'>('polling')

  useEffect(() => {
    let attempts  = 0
    let cancelled = false
    const SLOW_THRESHOLD = 3  // show "taking longer" after ~10s (3 × 3s polls + 1s initial)
    const MAX_ATTEMPTS   = 20 // hard stop after ~60s

    const check = async () => {
      if (cancelled) return
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          router.replace('/onboarding')
          return
        }
      } catch {
        // ignore network errors, keep polling
      }

      attempts++

      if (attempts >= SLOW_THRESHOLD && state !== 'slow' && attempts < MAX_ATTEMPTS) {
        setState('slow')
      }

      if (attempts >= MAX_ATTEMPTS) {
        setState('failed')
        return
      }

      setTimeout(check, 3000)
    }

    const t = setTimeout(check, 1000)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  if (state === 'failed') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 py-2">
          <div className="w-4 h-4 rounded-full bg-red-500/30 border border-red-500/60 flex-shrink-0" />
          <span className="text-sm text-red-400">Account setup timed out.</span>
        </div>
        <p className="text-xs text-white/40 leading-relaxed">
          This sometimes happens when our systems are slow. Try refreshing the page.
          If it persists, contact support.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-medium rounded-lg hover:bg-white/15 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 py-2">
        <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin flex-shrink-0" />
        <span className="text-sm text-white/50">
          {state === 'slow' ? 'Taking a little longer than usual…' : 'Waiting for account to be ready…'}
        </span>
      </div>
      {state === 'slow' && (
        <p className="text-xs text-white/30 leading-relaxed pl-7">
          Hang tight — still working on it. This shouldn&apos;t take more than 30 seconds.
        </p>
      )}
    </div>
  )
}
