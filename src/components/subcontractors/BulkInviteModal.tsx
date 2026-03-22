'use client'

import { useState, useRef } from 'react'
import { X, Upload, Users, CheckCircle2, XCircle, Loader2, AlertCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open:      boolean
  onClose:   () => void
  onSuccess?: (count: number) => void
}

interface ParsedRow {
  email: string
  name:  string
  state: 'pending' | 'sending' | 'sent' | 'failed'
  error?: string
}

/** Parse a block of text into email+name pairs.
 *  Handles: single emails, "Name, email", "email, Name", CSV with header, tab-separated */
function parseInput(raw: string): ParsedRow[] {
  const lines = raw
    .split(/[\n\r]+/)
    .map(l => l.trim())
    .filter(l => l && !l.match(/^(email|name|subcontractor)/i)) // skip header rows

  const rows: ParsedRow[] = []
  const seen = new Set<string>()

  for (const line of lines) {
    // Split by comma or tab
    const parts = line.split(/[,\t]/).map(p => p.trim().replace(/^["']|["']$/g, ''))

    let email = ''
    let name  = ''

    if (parts.length === 1) {
      // Just an email
      if (parts[0].includes('@')) email = parts[0]
    } else if (parts.length >= 2) {
      // Figure out which part is the email
      const emailIdx = parts.findIndex(p => p.includes('@'))
      if (emailIdx !== -1) {
        email = parts[emailIdx]
        name  = parts.filter((_, i) => i !== emailIdx).join(' ').trim()
      }
    }

    if (!email || !email.includes('@') || !email.includes('.')) continue
    email = email.toLowerCase()
    if (seen.has(email)) continue
    seen.add(email)
    rows.push({ email, name, state: 'pending' })
  }

  return rows
}

const EXAMPLE_CSV = `email,name
james.smith@example.com,James Smith
sarah.jones@build.co.uk,Sarah Jones
m.patel@contractor.com,Mohammed Patel`

export default function BulkInviteModal({ open, onClose, onSuccess }: Props) {
  const [step,     setStep]     = useState<'input' | 'preview' | 'sending' | 'done'>('input')
  const [rawText,  setRawText]  = useState('')
  const [rows,     setRows]     = useState<ParsedRow[]>([])
  const [parseErr, setParseErr] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!open) return null

  function handleParse() {
    const parsed = parseInput(rawText)
    if (parsed.length === 0) {
      setParseErr('No valid email addresses found. Each line should contain an email address (optionally with a name).')
      return
    }
    setParseErr(null)
    setRows(parsed)
    setStep('preview')
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setRawText(ev.target?.result as string ?? '')
    reader.readAsText(file)
  }

  function removeRow(idx: number) {
    setRows(prev => prev.filter((_, i) => i !== idx))
  }

  async function sendAll() {
    setStep('sending')
    const updated = [...rows]

    for (let i = 0; i < updated.length; i++) {
      updated[i] = { ...updated[i], state: 'sending' }
      setRows([...updated])

      try {
        const res = await fetch('/api/auth/magic-link', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subContractorEmail:   updated[i].email,
            subContractorName:    updated[i].name || undefined,
            requiredDocTypeSlugs: ['public-liability', 'cscs-card'],
            expiryHours:          72,
          }),
        })
        const data = await res.json()
        updated[i] = {
          ...updated[i],
          state: res.ok ? 'sent' : 'failed',
          error: res.ok ? undefined : (data.error?.message ?? 'Failed'),
        }
      } catch {
        updated[i] = { ...updated[i], state: 'failed', error: 'Network error' }
      }

      setRows([...updated])
      // Small delay to avoid hammering the rate limiter
      if (i < updated.length - 1) await new Promise(r => setTimeout(r, 150))
    }

    setStep('done')
    const sentCount = updated.filter(r => r.state === 'sent').length
    if (sentCount > 0) onSuccess?.(sentCount)
  }

  function reset() {
    setStep('input')
    setRawText('')
    setRows([])
    setParseErr(null)
  }

  const sentCount   = rows.filter(r => r.state === 'sent').length
  const failedCount = rows.filter(r => r.state === 'failed').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={step === 'sending' ? undefined : onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#111] shadow-2xl shadow-black/60 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Users size={15} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Bulk Invite</h2>
              <p className="text-xs text-white/50">
                {step === 'input'   && 'Paste emails or upload a CSV'}
                {step === 'preview' && `${rows.length} subcontractor${rows.length !== 1 ? 's' : ''} ready to invite`}
                {step === 'sending' && `Sending ${sentCount + failedCount} of ${rows.length}…`}
                {step === 'done'    && `${sentCount} sent · ${failedCount} failed`}
              </p>
            </div>
          </div>
          {step !== 'sending' && (
            <button onClick={step === 'done' ? () => { reset(); onClose() } : onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Step 1: Input ─────────────────────────────────────────────── */}
          {step === 'input' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Upload size={12} />
                  Upload CSV
                </button>
                <span className="text-xs text-white/30">or paste below</span>
                <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
              </div>

              <textarea
                value={rawText}
                onChange={e => { setRawText(e.target.value); setParseErr(null) }}
                rows={10}
                placeholder={`Paste emails or CSV:\n\njames@example.com\nsarah.jones@build.co.uk, Sarah Jones\nm.patel@contractor.com, Mohammed Patel`}
                className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-accent resize-none font-mono"
              />

              {parseErr && (
                <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                  <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                  {parseErr}
                </div>
              )}

              <div className="bg-white/5 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-white/60">Accepted formats</p>
                <div className="font-mono text-xs text-white/40 space-y-0.5">
                  <p>james@example.com</p>
                  <p>James Smith, james@example.com</p>
                  <p>email,name (CSV with header)</p>
                </div>
              </div>

              <button
                onClick={handleParse}
                disabled={!rawText.trim()}
                className="w-full py-2.5 text-sm font-semibold bg-accent text-[#0A0A0A] rounded-lg hover:bg-accent-hover disabled:opacity-40 transition-colors"
              >
                Preview →
              </button>
            </div>
          )}

          {/* ── Step 2: Preview ───────────────────────────────────────────── */}
          {(step === 'preview' || step === 'sending' || step === 'done') && (
            <div className="divide-y divide-white/10">
              {rows.map((row, i) => (
                <div key={row.email} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{row.name || row.email}</p>
                    {row.name && <p className="text-xs text-white/50 truncate">{row.email}</p>}
                    {row.error && <p className="text-xs text-red-400 mt-0.5">{row.error}</p>}
                  </div>

                  {row.state === 'pending'  && step === 'preview' && (
                    <button onClick={() => removeRow(i)} className="p-1.5 rounded text-white/30 hover:text-red-400 transition-colors flex-shrink-0">
                      <X size={13} />
                    </button>
                  )}
                  {row.state === 'pending'  && step !== 'preview' && <span className="text-xs text-white/30 flex-shrink-0">Queued</span>}
                  {row.state === 'sending'  && <Loader2 size={14} className="animate-spin text-accent flex-shrink-0" />}
                  {row.state === 'sent'     && <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />}
                  {row.state === 'failed'   && <XCircle size={15} className="text-red-400 flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'preview' && (
          <div className="flex gap-3 px-6 py-4 border-t border-white/10 flex-shrink-0">
            <button onClick={reset} className="flex-1 py-2.5 text-sm font-medium text-white/60 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
              ← Back
            </button>
            <button
              onClick={sendAll}
              disabled={rows.length === 0}
              className="flex-1 py-2.5 text-sm font-semibold bg-accent text-[#0A0A0A] rounded-lg hover:bg-accent-hover disabled:opacity-40 transition-colors"
            >
              Send {rows.length} Invite{rows.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="px-6 py-4 border-t border-white/10 flex-shrink-0 space-y-3">
            {failedCount > 0 && (
              <p className="text-xs text-red-400 text-center">
                {failedCount} invite{failedCount !== 1 ? 's' : ''} failed — check the emails above and try again.
              </p>
            )}
            <button
              onClick={() => { reset(); onClose() }}
              className="w-full py-2.5 text-sm font-semibold bg-accent text-[#0A0A0A] rounded-lg hover:bg-accent-hover transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
