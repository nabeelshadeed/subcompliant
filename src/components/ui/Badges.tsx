import { cn, complianceColor, docStatusColor } from '@/lib/utils'
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

export function RiskBadge({ score, level }: { score: number; level: string }) {
  const colors: Record<string, string> = {
    low:      'text-green-700 bg-green-50 border-green-200',
    medium:   'text-yellow-700 bg-yellow-50 border-yellow-200',
    high:     'text-orange-700 bg-orange-50 border-orange-200',
    critical: 'text-red-700 bg-red-50 border-red-200',
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
      colors[level] ?? 'text-gray-600 bg-gray-100 border-gray-200'
    )}>
      <span className="tabular-nums font-bold">{score}</span>
      <span className="capitalize">{level}</span>
    </span>
  )
}
