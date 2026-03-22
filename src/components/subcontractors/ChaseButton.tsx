'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

interface Props {
  email:          string
  name:           string
  contractorName: string
  subId:          string
}

export default function ChaseButton({ email, name }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  async function chase() {
    setState('loading')
    setErrMsg('')
    try {
      const res  = await fetch('/api/subcontractors', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email,
          name,
          customMessage: 'A reminder that your compliance documents are still outstanding. Please use the link below to upload them.',
          expiryHours: 72,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrMsg(data.error?.message ?? 'Failed to send')
        setState('error')
        return
      }
      setState('sent')
      // Reset after 5 seconds so button can be used again
      setTimeout(() => setState('idle'), 5000)
    } catch {
      setErrMsg('Network error')
      setState('error')
    }
  }

  if (state === 'sent') return (
    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
      <CheckCircle2 size={12} /> Sent
    </div>
  )

  return (
    <div className="flex flex-col items-end gap-0.5">
      <button
        onClick={chase}
        disabled={state === 'loading'}
        title={`Send reminder to ${name}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg text-white/60 border border-white/15 hover:bg-white/10 hover:text-white hover:border-white/25 disabled:opacity-40 transition-colors"
      >
        {state === 'loading'
          ? <Loader2 size={11} className="animate-spin" />
          : <Send size={11} />}
        {state === 'loading' ? 'Sending…' : 'Chase'}
      </button>
      {state === 'error' && (
        <span className="text-[10px] text-red-400">{errMsg}</span>
      )}
    </div>
  )
}
