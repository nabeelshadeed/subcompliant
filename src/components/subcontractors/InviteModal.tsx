'use client'

import { useState } from 'react'
import { X, Mail, Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open:      boolean
  onClose:   () => void
  onSuccess?: () => void
}

const DOC_TYPES = [
  { slug: 'public-liability',    name: 'Public Liability Insurance' },
  { slug: 'employers-liability', name: 'Employers Liability Insurance' },
  { slug: 'cscs-card',           name: 'CSCS Card' },
  { slug: 'rams',                name: 'RAMS Document' },
  { slug: 'gas-safe',            name: 'Gas Safe Registration' },
  { slug: 'niceic',              name: 'NICEIC Registration' },
]

const DEFAULT_SELECTED = ['public-liability', 'cscs-card']

export default function InviteModal({ open, onClose, onSuccess }: Props) {
  const [email,       setEmail]       = useState('')
  const [name,        setName]        = useState('')
  const [message,     setMessage]     = useState('')
  const [selected,    setSelected]    = useState<string[]>(DEFAULT_SELECTED)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [sent,        setSent]        = useState(false)
  const [showErrors,  setShowErrors]  = useState(false)

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
          subContractorEmail:   email,
          subContractorName:    name || undefined,
          requiredDocTypeSlugs: selected,
          customMessage:        message || undefined,
          expiryHours:          72,
        }),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error?.message ?? 'Failed to send invitation'); return }

      setSent(true)
      setTimeout(() => {
        setSent(false)
        setEmail('')
        setName('')
        setMessage('')
        setSelected(DEFAULT_SELECTED)
        onSuccess?.()
        onClose()
      }, 2000)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-[#111] shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Mail size={15} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Invite Subcontractor</h2>
              <p className="text-xs text-white/50">Send a magic link to collect compliance documents</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X size={15} />
          </button>
        </div>

        {sent ? (
          <div className="py-12 flex flex-col items-center text-center px-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-3">
              <Send size={20} className="text-emerald-400" />
            </div>
            <p className="font-semibold text-white">Invitation sent!</p>
            <p className="text-sm text-white/50 mt-1">
              A magic link has been emailed to <span className="text-white/80 font-medium">{email}</span>. It expires in 72 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => { setEmail(e.target.value); setShowErrors(false) }}
                  placeholder="sub@example.com"
                  className={`w-full px-3 py-2 text-sm bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent ${
                    showErrors && !email.trim() ? 'border-red-500/60' : 'border-white/10'
                  }`}
                />
                {showErrors && !email.trim() && (
                  <p className="mt-1 text-xs text-red-400">Email address is required</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-white/60 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-2">Required documents</label>
              <div className="grid grid-cols-2 gap-2">
                {DOC_TYPES.map(doc => (
                  <label
                    key={doc.slug}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors',
                      selected.includes(doc.slug)
                        ? 'border-accent/40 bg-accent/10 text-accent'
                        : 'border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
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
                      selected.includes(doc.slug) ? 'bg-accent border-accent' : 'border-white/30'
                    )}>
                      {selected.includes(doc.slug) && (
                        <svg viewBox="0 0 10 8" className="w-2 h-2">
                          <path d="M1 4l3 3 5-6" strokeWidth="1.5" stroke="#0A0A0A" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {doc.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1">Message (optional)</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Please upload the documents below so we can continue working together."
                className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white/70 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] bg-accent rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send Invite
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
