'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { useTransition, useState } from 'react'

const CATEGORIES = ['insurance', 'certification', 'legal', 'training']

interface Props {
  currentSearch?:   string
  currentStatus?:   string
  currentCategory?: string
}

export default function DocumentFilters({ currentSearch, currentStatus, currentCategory }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch ?? '')

  function update(key: string, value: string) {
    const sp = new URLSearchParams(searchParams.toString())
    value ? sp.set(key, value) : sp.delete(key)
    sp.delete('page')
    startTransition(() => router.push(`?${sp.toString()}`))
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => {
            setSearch(e.target.value)
            update('q', e.target.value)
          }}
          placeholder="Search documents…"
          className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-52 bg-white"
        />
      </div>

      {/* Category filter */}
      <div className="relative">
        <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <select
          value={currentCategory ?? ''}
          onChange={e => update('category', e.target.value)}
          className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none"
        >
          <option value="">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
