import Link from 'next/link'
import { buildQueryString } from '@/lib/utils'

interface Props {
  page:         number
  limit:        number
  total:        number
  searchParams: Record<string, string | undefined>
}

export default function Pagination({ page, limit, total, searchParams }: Props) {
  if (total <= limit) return null

  const offset = (page - 1) * limit

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
      <p className="text-xs text-white/50">
        Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={buildQueryString({ ...searchParams, page: String(page - 1) })}
            className="px-3 py-1.5 text-xs font-medium border border-white/20 rounded-lg hover:bg-white/10 text-white"
          >
            Previous
          </Link>
        )}
        {offset + limit < total && (
          <Link
            href={buildQueryString({ ...searchParams, page: String(page + 1) })}
            className="px-3 py-1.5 text-xs font-medium bg-accent text-[#0A0A0A] rounded-lg hover:bg-accent-hover"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  )
}
