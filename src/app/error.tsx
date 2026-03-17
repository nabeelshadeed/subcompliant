'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react'

export default function GlobalError({
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-amber-600" />
        </div>
        <h1 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-600 mb-6">
          This is often due to missing configuration. Check that your database is set up and env vars are set in Cloudflare.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/setup"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700"
          >
            <ExternalLink size={14} />
            Setup / config
          </Link>
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Sign in
          </Link>
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
        {error.digest && (
          <p className="mt-4 text-xs text-gray-400 font-mono">Ref: {error.digest}</p>
        )}
      </div>
    </div>
  )
}
