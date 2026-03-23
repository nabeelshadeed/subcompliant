'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPoller() {
  const router = useRouter()

  useEffect(() => {
    let attempts = 0
    const MAX = 20 // give up after ~60s

    const check = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          router.replace('/dashboard')
          return
        }
      } catch {
        // ignore network errors, keep polling
      }
      attempts++
      if (attempts < MAX) {
        setTimeout(check, 3000)
      }
    }

    const t = setTimeout(check, 2000)
    return () => clearTimeout(t)
  }, [router])

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin flex-shrink-0" />
      <span className="text-sm text-white/50">Waiting for account to be ready…</span>
    </div>
  )
}
