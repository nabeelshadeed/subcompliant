'use client'

import { useState } from 'react'
import { X, Mail, Send, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InviteModalProps {
  open:     boolean
  onClose:  () => void
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

export default function InviteModal({ open, onClose, onSuccess }: InviteModalProps) {
  const [email,      setEmail]      = useState('')
  const [name,       setName]       = useState('')
  const [message,    setMessage]    = useState('')
  const [selected,   setSelected]   = useState<string[]>(['public-liability', 'cscs-card'])
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [sent,       setSent]       = useState(false)

  if (!open) return null

  function toggleDoc(slug: string) {
    setSelected(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/magic-link', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          subContractorEmail:   email,
          subContractorName:    name || undefined,
          requiredDocTypeSlugs: selected,
          customMessage:        message || undefined,
          expiryHours:          72,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message ?? 'Failed to send invitation')
        return
      }

      setSent(true)
      setTimeout(() => {
        setSent(false)
        setEmail('')
        setName('')
        setMessage('')
        setSelected(['public-liability', 'cscs-card'])
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
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
              <Mail size={16} className="text-brand-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Invite Subcontractor</h2>
              <p className="text-xs text-gray-400">Send a magic link to collect compliance documents</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        {sent ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Send size={20} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Invitation sent!</p>
            <p className="text-sm text-gray-400 mt-1">Link expires in 72 hours</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="sub@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Required documents</label>
              <div className="grid grid-cols-2 gap-2">
                {DOC_TYPES.map(doc => (
                  <label
                    key={doc.slug}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors',
                      selected.includes(doc.slug)
                        ? 'border-brand-300 bg-brand-50 text-brand-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
                      selected.includes(doc.slug)
                        ? 'bg-brand-600 border-brand-600'
                        : 'border-gray-300'
                    )}>
                      {selected.includes(doc.slug) && (
                        <svg viewBox="0 0 10 8" className="w-2 h-2 fill-white">
                          <path d="M1 4l3 3 5-6" strokeWidth="1.5" stroke="white" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    {doc.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Message (optional)</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Please upload the documents below so we can continue working together."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Send Invite
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
