'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, Loader2, FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface PendingDoc {
  id:          string
  fileName:    string | null
  docTypeName: string
  subName:     string
  submittedAt: string
}

interface Props {
  docs: PendingDoc[]
}

function ReviewButtons({ doc }: { doc: PendingDoc }) {
  const router  = useRouter()
  const [state, setState] = useState<'idle' | 'rejecting' | 'loading' | 'done-approve' | 'done-reject' | 'error'>('idle')
  const [reason, setReason] = useState('')
  const [errMsg, setErrMsg] = useState('')

  async function act(action: 'approve' | 'reject') {
    setState('loading')
    setErrMsg('')
    try {
      const res  = await fetch(`/api/documents/${doc.id}/review`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          action,
          rejectedReason: action === 'reject' ? reason : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setErrMsg(data.error?.message ?? 'Failed'); setState('error'); return }
      setState(action === 'approve' ? 'done-approve' : 'done-reject')
      setTimeout(() => router.refresh(), 1000)
    } catch {
      setErrMsg('Network error')
      setState('error')
    }
  }

  if (state === 'done-approve') return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
      <CheckCircle2 size={13} /> Approved
    </div>
  )
  if (state === 'done-reject') return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
      <XCircle size={13} /> Rejected
    </div>
  )
  if (state === 'loading') return <Loader2 size={14} className="animate-spin text-white/40" />

  if (state === 'rejecting') return (
    <div className="flex items-center gap-1.5 w-full">
      <input
        autoFocus
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Reason for rejection…"
        className="flex-1 text-xs px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-red-400/60"
      />
      <button
        onClick={() => act('reject')}
        disabled={!reason.trim()}
        className="text-xs font-semibold px-2.5 py-1 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg disabled:opacity-40 hover:bg-red-500/30 transition-colors"
      >
        Send
      </button>
      <button onClick={() => setState('idle')} className="text-xs text-white/40 hover:text-white">×</button>
    </div>
  )

  return (
    <div className="flex items-center gap-1.5">
      {errMsg && <span className="text-xs text-red-400 mr-1">{errMsg}</span>}
      <button
        onClick={() => act('approve')}
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/25 transition-colors"
      >
        <CheckCircle2 size={11} /> Approve
      </button>
      <button
        onClick={() => setState('rejecting')}
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/25 transition-colors"
      >
        <XCircle size={11} /> Reject
      </button>
    </div>
  )
}

export default function PendingReviewCard({ docs }: Props) {
  if (docs.length === 0) {
    return (
      <div className="card px-5 py-4 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 size={13} className="text-emerald-400" />
        </div>
        <p className="text-sm text-white/60">No documents pending review</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden border-amber-500/20">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-amber-500/5">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <h2 className="text-sm font-semibold text-white">
            Pending review
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/25 text-amber-400 text-[10px] font-bold">{docs.length}</span>
          </h2>
        </div>
        <Link href="/documents?status=pending" className="text-xs text-accent hover:text-accent/80 font-medium flex items-center gap-1">
          View all <ExternalLink size={10} />
        </Link>
      </div>

      <ul className="divide-y divide-white/10">
        {docs.map(doc => (
          <li key={doc.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
              <FileText size={12} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{doc.docTypeName}</p>
              <p className="text-[11px] text-white/50 mt-0.5">{doc.subName}</p>
            </div>
            <ReviewButtons doc={doc} />
          </li>
        ))}
      </ul>
    </div>
  )
}
