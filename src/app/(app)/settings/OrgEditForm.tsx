'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface OrgEditFormProps {
  contractor: {
    name: string
    website?: string | null
    addressLine1?: string | null
    addressCity?: string | null
    addressPostcode?: string | null
    companiesHouseNo?: string | null
    vatNumber?: string | null
  }
}

export default function OrgEditForm({ contractor }: OrgEditFormProps) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [form, setForm] = useState({
    name:             contractor.name ?? '',
    website:          contractor.website ?? '',
    addressLine1:     contractor.addressLine1 ?? '',
    addressCity:      contractor.addressCity ?? '',
    addressPostcode:  contractor.addressPostcode ?? '',
    companiesHouseNo: contractor.companiesHouseNo ?? '',
    vatNumber:        contractor.vatNumber ?? '',
  })

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch('/api/account/update', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error?.message ?? 'Failed to save changes' })
        return
      }
      setMessage({ type: 'success', text: 'Organisation details updated.' })
      setEditing(false)
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <p className="text-xs font-medium text-white/50 mb-0.5">{label}</p>
      {editing ? (
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent/60"
        />
      ) : (
        <p className="text-sm text-white">{form[key] || <span className="text-white/30">—</span>}</p>
      )}
    </div>
  )

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Organisation Details</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-accent hover:text-accent/80 transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); setMessage(null) }}
              className="text-xs font-medium text-white/50 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={cn(
                'text-xs font-medium px-3 py-1 rounded-lg bg-accent text-[#0A0A0A] hover:bg-accent/90 transition-colors',
                saving && 'opacity-50 cursor-not-allowed'
              )}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={cn(
          'text-xs px-3 py-2 rounded-lg border',
          message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        )}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        {field('Company Name', 'name')}
        {field('Website', 'website', 'url')}
        {field('Address', 'addressLine1')}
        {field('City', 'addressCity')}
        {field('Postcode', 'addressPostcode')}
        {field('Companies House No.', 'companiesHouseNo')}
        {field('VAT Number', 'vatNumber')}
      </div>
    </div>
  )
}
