import { Suspense } from 'react'
import SubcontractorList from './SubcontractorList'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Subcontractors' }

export default async function SubcontractorsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>
}) {
  const sp = await searchParams
  return (
    <div className="space-y-5 max-w-7xl">
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-sm text-gray-400">Loading…</div>}>
        <SubcontractorList searchParams={sp} />
      </Suspense>
    </div>
  )
}
