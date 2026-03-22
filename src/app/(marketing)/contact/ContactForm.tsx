'use client'

import { useState } from 'react'

const SUBJECTS = [
  'General enquiry',
  'Technical support',
  'Billing question',
  'Enterprise / Sales',
  'Demo request',
  'Partnership',
] as const

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.querySelector('#c-name') as HTMLInputElement)?.value?.trim()
    const email = (form.querySelector('#c-email') as HTMLInputElement)?.value?.trim()
    const subject = (form.querySelector('#c-subject') as HTMLSelectElement)?.value?.trim()
    const message = (form.querySelector('#c-msg') as HTMLTextAreaElement)?.value?.trim()

    if (!name || !email) {
      setError('Please enter your name and email.')
      return
    }

    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers:  { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, subject: subject || SUBJECTS[0], message: message || '' }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error?.message ?? 'Something went wrong. Please try again or email us directly.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="form-card">
        <div className="success" style={{ display: 'block', textAlign: 'center', padding: '20px 0' }}>
          <div className="success-ico">✅</div>
          <h3>Message sent</h3>
          <p>Thank you — we will reply to your email within 1 business day.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="form-card">
      <h2>Send us a message</h2>
      <p>Fill in the form and we will reply within 1 business day.</p>
      <form id="contact-form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" role="alert" style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: 14 }}>
            {error}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="c-name">Your name</label>
          <input type="text" id="c-name" placeholder="John Smith" required disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="c-email">Email address</label>
          <input type="email" id="c-email" placeholder="you@company.co.uk" required disabled={loading} />
        </div>
        <div className="form-group">
          <label htmlFor="c-subject">Subject</label>
          <select id="c-subject" disabled={loading}>
            {SUBJECTS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="c-msg">Message</label>
          <textarea id="c-msg" placeholder="How can we help?" rows={4} disabled={loading} />
        </div>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send Message →'}
        </button>
      </form>
    </div>
  )
}
