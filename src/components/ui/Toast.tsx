'use client'

import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}

const COLOURS = {
  success: { bg: 'bg-emerald-500/15 border-emerald-500/30', icon: 'text-emerald-400', text: 'text-emerald-300' },
  error:   { bg: 'bg-red-500/15 border-red-500/30',         icon: 'text-red-400',     text: 'text-red-300'     },
  warning: { bg: 'bg-amber-500/15 border-amber-500/30',     icon: 'text-amber-400',   text: 'text-amber-300'   },
  info:    { bg: 'bg-blue-500/15 border-blue-500/30',       icon: 'text-blue-400',    text: 'text-blue-300'    },
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const dismiss = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, variant }])
    timers.current[id] = setTimeout(() => dismiss(id), 4000)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map(t => {
          const Icon = ICONS[t.variant]
          const c = COLOURS[t.variant]
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl max-w-sm animate-slide-up ${c.bg}`}
              role="alert"
            >
              <Icon size={16} className={`flex-shrink-0 ${c.icon}`} />
              <p className={`text-sm font-medium flex-1 ${c.text}`}>{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
