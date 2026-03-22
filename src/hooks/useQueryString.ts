'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'

/**
 * Returns a stable `update` function that merges key/value pairs into the
 * current URL search params and navigates. Empty values delete the key.
 * Always resets `page` to avoid stale pagination.
 */
export function useQueryString() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  return useCallback(
    (updates: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => v ? sp.set(k, v) : sp.delete(k))
      sp.delete('page')
      startTransition(() => router.push(`?${sp.toString()}`))
    },
    [searchParams, router],
  )
}
