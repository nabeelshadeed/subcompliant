'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={22} className="text-red-400" />
        </div>
        <h2 className="text-base font-bold text-white mb-1">Something went wrong</h2>
        <p className="text-sm text-white/60 mb-5">
          {error.message || 'An unexpected error occurred. Please try again.'}
          {error.digest && (
            <span className="block mt-1 font-mono text-xs text-white/50">
              Ref: {error.digest}
            </span>
          )}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    </div>
  )
}
