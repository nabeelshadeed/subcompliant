import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return format(new Date(date), 'd MMM yyyy')
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function daysUntil(date: string | Date | null | undefined): number | null {
  if (!date) return null
  return differenceInDays(new Date(date), new Date())
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(Number(amount))
}

export function initials(first?: string | null, last?: string | null): string {
  return `${(first ?? '?')[0] ?? ''}${(last ?? '')[0] ?? ''}`.toUpperCase()
}

/** Build query string from params, omitting undefined and empty values to avoid ?key=undefined */
export function buildQueryString(params: Record<string, string | undefined>): string {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ) as Record<string, string>
  const qs = new URLSearchParams(filtered).toString()
  return qs ? `?${qs}` : ''
}

export function complianceColor(status: string): string {
  switch (status) {
    case 'compliant':           return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
    case 'partially_compliant': return 'text-amber-400 bg-amber-500/20 border-amber-500/30'
    case 'non_compliant':       return 'text-red-400 bg-red-500/20 border-red-500/30'
    default:                    return 'text-white/60 bg-white/10 border-white/20'
  }
}

export function riskColor(level: string): string {
  switch (level) {
    case 'low':      return 'text-emerald-400 bg-emerald-500/20'
    case 'medium':   return 'text-amber-400 bg-amber-500/20'
    case 'high':     return 'text-orange-400 bg-orange-500/20'
    case 'critical': return 'text-red-400 bg-red-500/20'
    default:         return 'text-white/60 bg-white/10'
  }
}

export function subStatusColor(status: string): string {
  switch (status) {
    case 'active':    return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    case 'invited':   return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30'
    default:          return 'bg-white/10 text-white/60 border-white/20'
  }
}

export function docCategoryBg(category: string | null | undefined): string {
  switch (category) {
    case 'insurance':     return 'bg-blue-500/20'
    case 'certification': return 'bg-purple-500/20'
    case 'legal':         return 'bg-orange-500/20'
    default:              return 'bg-white/10'
  }
}

export function docCategoryIconColor(category: string | null | undefined): string {
  switch (category) {
    case 'insurance':     return 'text-blue-400'
    case 'certification': return 'text-purple-400'
    case 'legal':         return 'text-orange-400'
    default:              return 'text-white/50'
  }
}

export function docStatusColor(status: string): string {
  switch (status) {
    case 'approved':    return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
    case 'pending':     return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    case 'processing':  return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    case 'rejected':    return 'text-red-400 bg-red-500/20 border-red-500/30'
    case 'expired':     return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    case 'missing':     return 'text-white/50 bg-white/10 border-white/20'
    case 'expiring_soon': return 'text-amber-400 bg-amber-500/20 border-amber-500/30'
    default:            return 'text-white/60 bg-white/10 border-white/20'
  }
}
