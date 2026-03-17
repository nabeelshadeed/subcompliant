import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon:    LucideIcon
  title:   string
  body:    string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
        <Icon size={22} className="text-white/50" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-white/60 max-w-sm mb-4">{body}</p>
      {action}
    </div>
  )
}
