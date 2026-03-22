'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useQueryString } from '@/hooks/useQueryString'

const CATEGORIES = ['insurance', 'certification', 'legal', 'training']
const SEARCH_DEBOUNCE_MS = 400

interface Props {
  currentSearch?:   string
  currentStatus?:   string
  currentCategory?: string
}

export default function DocumentFilters({ currentSearch, currentStatus, currentCategory }: Props) {
  const update = useQueryString()
  const [search, setSearch] = useState(currentSearch ?? '')

  // Sync local search from URL when navigating back
  useEffect(() => {
    setSearch(currentSearch ?? '')
  }, [currentSearch])

  // Debounced URL update for search input
  useEffect(() => {
    if (search === (currentSearch ?? '')) return
    const t = setTimeout(() => update({ q: search }), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [search, currentSearch, update])

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search documents…"
          className="pl-8 pr-3 py-2 text-sm border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent w-52 bg-white/5 text-white placeholder:text-white/40"
          aria-label="Search documents"
        />
      </div>

      {/* Category filter */}
      <div className="relative">
        <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" aria-hidden />
        <select
          aria-label="Filter by category"
          value={currentCategory ?? ''}
          onChange={e => update({ category: e.target.value })}
          className="pl-8 pr-8 py-2 text-sm border border-white/10 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
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
