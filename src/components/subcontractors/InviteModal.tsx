'use client'

import { useState } from 'react'
import { X, Mail, Send, Loader2, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open:       boolean
  onClose:    () => void
  onSuccess?: () => void
}

const DOC_TYPES = [
  { slug: 'public-liability',    name: 'Public Liability Insurance',  required: true  },
  { slug: 'employers-liability', name: 'Employers Liability Insurance',required: true  },
  { slug: 'cscs-card',           name: 'CSCS Card',                   required: true  },
  { slug: 'rams',                name: 'RAMS / Method Statement',     required: false },
  { slug: 'gas-safe',            name: 'Gas Safe Registration',       required: false },
  { slug: 'niceic',              name: 'NICEIC / Electrical Cert',    required: false },
  { slug: 'cis-verification',    name: 'CIS Verification Letter',     required: false },
  { slug: 'dbs-check',           name: 'DBS Check',                   required: false },
]

const DEFAULT_SELECTED = ['public-liability', 'employers-liability', 'cscs-card']

export default function InviteModal({ open, onClose, onSuccess }: Props) {
  const [email,      setEmail]      = useState('')
  const [name,       setName]       = useState('')
  const [phone,      setPhone]      = useState('')
  const [message,    setMessage]    = useState('')
  const [selected,   setSelected]   = useState<string[]>(DEFAULT_SELECTED)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [sent,       setSent]       = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  if (!open) return null

  function toggleDoc(slug: string) {
    setSelected(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setShowErrors(true); return }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/magic-link', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subContractorEmail:   email.trim(),
          subContractorName:    name.trim()  || undefined,
          requiredDocTypeSlugs: selected,
          customMessage:        message.trim() || undefined,
          expiryHours:          72,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        // EMAIL_SEND_FAILED: session was created but email couldn't be sent.
        // Show the magic link so the contractor can share it manually.
        if (data.error?.code === 'EMAIL_SEND_FAILED' && data.error?.magicLink) {
          setError(`Email delivery failed. Share this link manually: ${data.error.magicLink}`)
        } else {
          setError(data.error?.message ?? 'Failed to send invitation')
        }
        return
      }

      setSent(true)
      setTimeout(() => {
        setSent(false)
        setEmail('')
        setName('')
        setPhone('')
        setMessage('')
        setSelected(DEFAULT_SELECTED)
        onSuccess?.()
        onClose()
      }, 2500)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#111] shadow-2xl shadow-black/60 max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-[#111] flex items-center justify-between px-5 py-4 border-b border-white/8 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
              <Mail size={15} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Request compliance documents</h2>
              <p className="text-xs text-white/40">CDM 2015 requires you to verify this subcontractor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {sent ? (
          <div className="py-12 flex flex-col items-center text-center px-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-4">
              <Send size={22} className="text-emerald-400" />
            </div>
            <p className="font-bold text-white text-base">Invitation sent!</p>
            <p className="text-sm text-white/50 mt-2 max-w-xs">
              A secure upload link has been emailed to{' '}
              <span className="text-white/80 font-medium">{email}</span>.
              It expires in 72 hours.
            </p>
            <p className="text-xs text-white/30 mt-3">This request is logged for your CDM 2015 audit trail.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">

            {/* CDM context banner */}
            <div className="flex items-start gap-2.5 bg-accent/6 border border-accent/15 rounded-xl px-3.5 py-3">
              <ShieldCheck size={14} className="text-accent mt-0.5 flex-shrink-0" />
              <p className="text-xs text-white/60 leading-relaxed">
                <span className="text-white/85 font-semibold">CDM 2015 Regulation 15</span> requires you to verify the competence of every subcontractor before they work on your site. This invitation will be logged in your compliance audit trail.
              </p>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Contact fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/55 mb-1.5">
                  Email address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setShowErrors(false) }}
                  placeholder="sub@example.com"
                  className={cn(
                    'w-full px-3 py-2.5 text-sm bg-white/5 border rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors',
                    showErrors && !email.trim() ? 'border-red-500/50' : 'border-white/10'
                  )}
                />
                {showErrors && !email.trim() && (
                  <p className="mt-1 text-xs text-red-400">Required</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/55 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/55 mb-1.5">
                Mobile number <span className="text-white/25 font-normal">(optional — for SMS delivery)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+44 7700 900000"
                className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
              />
              <p className="mt-1 text-xs text-white/30">SMS delivery increases document completion rates by 3×. Coming soon.</p>
            </div>

            {/* Required documents */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-white/55">Required documents</label>
                <span className="text-xs text-white/30">{selected.length} selected</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DOC_TYPES.map(doc => (
                  <label
                    key={doc.slug}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs cursor-pointer transition-all',
                      selected.includes(doc.slug)
                        ? 'border-accent/35 bg-accent/8 text-accent'
                        : 'border-white/8 text-white/55 hover:border-white/18 hover:text-white/75'
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={selected.includes(doc.slug)}
                      onChange={() => toggleDoc(doc.slug)}
                    />
                    <div className={cn(
                      'w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center',
                      selected.includes(doc.slug) ? 'bg-accent border-accent' : 'border-white/25'
                    )}>
                      {selected.includes(doc.slug) && (
                        <svg viewBox="0 0 10 8" className="w-2 h-2">
                          <path d="M1 4l3 3 5-6" strokeWidth="1.5" stroke="#0A0A0A" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="flex-1">{doc.name}</span>
                    {doc.required && (
                      <span className="text-[9px] font-bold text-white/25 uppercase tracking-wide">CDM</span>
                    )}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-white/30">
                Items marked <strong className="text-white/45">CDM</strong> are required under CDM 2015 for all subcontractors.
              </p>
            </div>

            {/* Custom message */}
            <div>
              <label className="block text-xs font-medium text-white/55 mb-1.5">
                Message to subcontractor <span className="text-white/25 font-normal">(optional)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Please upload your documents so we can confirm compliance before work begins on site."
                className="w-full px-3 py-2.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors resize-none"
              />
              <p className="mt-1 text-xs text-white/25 text-right">{message.length}/500</p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white/60 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selected.length === 0}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-[#0A0A0A] bg-accent rounded-xl hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {loading ? 'Sending…' : 'Send Secure Link'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  )
}
