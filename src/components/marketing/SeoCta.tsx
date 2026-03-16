'use client'

import Link from 'next/link'

interface SeoCtaProps {
  className?: string
}

export function SeoCta({ className }: SeoCtaProps) {
  return (
    <section className={['mt-12 border-t border-gray-200 pt-8', className].filter(Boolean).join(' ')}>
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-2xl px-6 py-6 md:px-8 md:py-7 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-semibold">
            Stop chasing subcontractor documents.
          </h2>
          <p className="mt-1 text-sm text-brand-50 max-w-xl">
            SubCompliant automatically collects and tracks subcontractor compliance documents so you can focus on running projects.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-white text-brand-700 text-sm font-semibold shadow-sm hover:bg-brand-50 transition-colors"
          >
            Start Managing Compliance
          </Link>
        </div>
      </div>
    </section>
  )
}

