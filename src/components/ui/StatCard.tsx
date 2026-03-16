import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label:    string
  value:    string | number
  sub?:     string
  icon?:    LucideIcon
  trend?:   { value: number; label: string }
  variant?: 'default' | 'success' | 'warning' | 'danger'
  className?: string
}

const variants = {
  default: 'border-gray-200',
  success: 'border-green-200 bg-green-50/30',
  warning: 'border-yellow-200 bg-yellow-50/30',
  danger:  'border-red-200 bg-red-50/30',
}

const iconBg = {
  default: 'bg-brand-50 text-brand-600',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger:  'bg-red-100 text-red-700',
}

export default function StatCard({
  label, value, sub, icon: Icon, trend, variant = 'default', className
}: StatCardProps) {
  return (
    <div className={cn('card p-5', variants[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
          {trend && (
            <p className={cn(
              'mt-1 text-xs font-medium',
              trend.value >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-2.5 rounded-lg flex-shrink-0 ml-3', iconBg[variant])}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  )
}
