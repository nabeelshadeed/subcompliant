import { cn, complianceColor, docStatusColor, subStatusColor } from '@/lib/utils'
import { CheckCircle2, AlertTriangle, XCircle, Clock, AlertCircle } from 'lucide-react'

export function ComplianceBadge({ status }: { status: string }) {
  const icons = {
    compliant:            <CheckCircle2 size={12} />,
    partially_compliant:  <AlertTriangle size={12} />,
    non_compliant:        <XCircle size={12} />,
  }

  const labels = {
    compliant:            'Compliant',
    partially_compliant:  'Partial',
    non_compliant:        'Non-compliant',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      complianceColor(status)
    )}>
      {icons[status as keyof typeof icons]}
      {labels[status as keyof typeof labels] ?? status}
    </span>
  )
}

export function DocStatusBadge({ status }: { status: string }) {
  const icons: Record<string, React.ReactNode> = {
    approved:     <CheckCircle2 size={11} />,
    pending:      <Clock size={11} />,
    processing:   <Clock size={11} />,
    rejected:     <XCircle size={11} />,
    expired:      <AlertCircle size={11} />,
    expiring_soon:<AlertTriangle size={11} />,
    missing:      <XCircle size={11} />,
    superseded:   <Clock size={11} />,
  }

  const labels: Record<string, string> = {
    approved:     'Approved',
    pending:      'Pending',
    processing:   'Processing',
    rejected:     'Rejected',
    expired:      'Expired',
    expiring_soon:'Expiring soon',
    missing:      'Missing',
    superseded:   'Superseded',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      docStatusColor(status)
    )}>
      {icons[status]}
      {labels[status] ?? status}
    </span>
  )
}

export function SubStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize',
      subStatusColor(status)
    )}>
      {status}
    </span>
  )
}

export function RiskBadge({ score, level }: { score: number; level: string }) {
  const colors: Record<string, string> = {
    low:      'text-emerald-400 bg-emerald-500/20 border-emerald-500/30',
    medium:   'text-amber-400 bg-amber-500/20 border-amber-500/30',
    high:     'text-orange-400 bg-orange-500/20 border-orange-500/30',
    critical: 'text-red-400 bg-red-500/20 border-red-500/30',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
      colors[level] ?? 'text-white/60 bg-white/10 border-white/20'
    )}>
      <span className="tabular-nums font-bold">{score}</span>
      <span className="capitalize">{level}</span>
    </span>
  )
}
