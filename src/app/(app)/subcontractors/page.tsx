import { Suspense } from 'react'
import SubcontractorList from './SubcontractorList'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Subcontractors' }

export default function SubcontractorsPage({
  searchParams
}: {
  searchParams: { q?: string; status?: string; page?: string }
}) {
  return (
    <div className="space-y-5 max-w-7xl">
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-sm text-gray-400">Loading…</div>}>
        <SubcontractorList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
