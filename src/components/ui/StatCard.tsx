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
  default: 'border-white/10',
  success: 'border-emerald-500/30 bg-emerald-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  danger:  'border-red-500/30 bg-red-500/10',
}

const iconBg = {
  default: 'bg-accent/15 text-accent',
  success: 'bg-emerald-500/20 text-emerald-400',
  warning: 'bg-amber-500/20 text-amber-400',
  danger:  'bg-red-500/20 text-red-400',
}

export default function StatCard({
  label, value, sub, icon: Icon, trend, variant = 'default', className
}: StatCardProps) {
  return (
    <div className={cn('card p-5', variants[variant], className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/60">{label}</p>
          <p className="mt-1 text-2xl font-bold font-display text-white tabular-nums">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-white/50">{sub}</p>}
          {trend && (
            <p className={cn(
              'mt-1 text-xs font-medium',
              trend.value >= 0 ? 'text-emerald-400' : 'text-red-400'
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
