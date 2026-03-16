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

export function complianceColor(status: string): string {
  switch (status) {
    case 'compliant':           return 'text-green-700 bg-green-50 border-green-200'
    case 'partially_compliant': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    case 'non_compliant':       return 'text-red-700 bg-red-50 border-red-200'
    default:                    return 'text-gray-600 bg-gray-100 border-gray-200'
  }
}

export function riskColor(level: string): string {
  switch (level) {
    case 'low':      return 'text-green-700 bg-green-50'
    case 'medium':   return 'text-yellow-700 bg-yellow-50'
    case 'high':     return 'text-orange-700 bg-orange-50'
    case 'critical': return 'text-red-700 bg-red-50'
    default:         return 'text-gray-600 bg-gray-100'
  }
}

export function docStatusColor(status: string): string {
  switch (status) {
    case 'approved':    return 'text-green-700 bg-green-50 border-green-200'
    case 'pending':     return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'processing':  return 'text-blue-700 bg-blue-50 border-blue-200'
    case 'rejected':    return 'text-red-700 bg-red-50 border-red-200'
    case 'expired':     return 'text-orange-700 bg-orange-50 border-orange-200'
    case 'missing':     return 'text-gray-500 bg-gray-50 border-gray-200'
    case 'expiring_soon': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
    default:            return 'text-gray-600 bg-gray-100 border-gray-200'
  }
}
