'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, ChevronDown, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DocumentReviewPanelProps {
  documentId:  string
  docTypeName: string
  currentStatus: string
}

export default function DocumentReviewPanel({
  documentId, docTypeName, currentStatus
}: DocumentReviewPanelProps) {
  const router = useRouter()
  const [open,           setOpen]           = useState(false)
  const [action,         setAction]         = useState<'approve' | 'reject' | null>(null)
  const [reviewNotes,    setReviewNotes]    = useState('')
  const [rejectedReason, setRejectedReason] = useState('')
  const [expiresAt,      setExpiresAt]      = useState('')
  const [loading,        setLoading]        = useState(false)
  const [result,         setResult]         = useState<'success' | 'error' | null>(null)
  const [errorMsg,       setErrorMsg]       = useState('')

  async function submit() {
    if (!action) return
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch(`/api/documents/${documentId}/review`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewNotes:    reviewNotes || undefined,
          rejectedReason: rejectedReason || undefined,
          expiresAt:      expiresAt     || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error?.message ?? 'Review failed')
        setResult('error')
        return
      }

      setResult('success')
      setTimeout(() => {
        setOpen(false)
        setAction(null)
        setResult(null)
        router.refresh()
      }, 1500)
    } catch {
      setErrorMsg('Network error — please try again')
      setResult('error')
    } finally {
      setLoading(false)
    }
  }

  // Don't show for non-pending docs (unless reviewer wants to override)
  if (currentStatus === 'approved' || currentStatus === 'superseded') return null

  return (
    <div className="mt-2">
      {!open ? (
        <div className="flex gap-2">
          <button
            onClick={() => { setAction('approve'); setOpen(true) }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
          >
            <CheckCircle2 size={12} /> Approve
          </button>
          <button
            onClick={() => { setAction('reject'); setOpen(true) }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <XCircle size={12} /> Reject
          </button>
        </div>
      ) : (
        <div className={`border rounded-xl p-4 space-y-3 ${
          action === 'approve'
            ? 'border-green-200 bg-green-50/50'
            : 'border-red-200 bg-red-50/50'
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">
              {action === 'approve' ? '✓ Approve' : '✕ Reject'} — {docTypeName}
            </p>
            <button
              onClick={() => { setOpen(false); setAction(null); setResult(null) }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </div>

          {result === 'success' ? (
            <div className="flex items-center gap-2 text-sm font-medium text-green-700">
              <CheckCircle2 size={14} /> {action === 'approve' ? 'Approved' : 'Rejected'} — refreshing…
            </div>
          ) : (
            <>
              {errorMsg && (
                <p className="text-xs text-red-600">{errorMsg}</p>
              )}

              {action === 'approve' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Expiry date override (optional)
                    </label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={e => setExpiresAt(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Review notes (optional)
                    </label>
                    <input
                      type="text"
                      value={reviewNotes}
                      onChange={e => setReviewNotes(e.target.value)}
                      placeholder="e.g. Verified against policy document"
                      className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </>
              )}

              {action === 'reject' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Reason for rejection <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={rejectedReason}
                    onChange={e => setRejectedReason(e.target.value)}
                    placeholder="e.g. Coverage amount insufficient, please re-upload"
                    className="w-full px-2.5 py-1.5 text-xs border border-red-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-400"
                  />
                </div>
              )}

              <button
                onClick={submit}
                disabled={loading || (action === 'reject' && !rejectedReason.trim())}
                className={`w-full py-2 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                  action === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {loading
                  ? <Loader2 size={12} className="animate-spin" />
                  : action === 'approve'
                  ? <CheckCircle2 size={12} />
                  : <XCircle size={12} />
                }
                {loading ? 'Saving…' : `Confirm ${action === 'approve' ? 'approval' : 'rejection'}`}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
