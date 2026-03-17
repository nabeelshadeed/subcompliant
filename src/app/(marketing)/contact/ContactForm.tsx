'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.querySelector('#c-name') as HTMLInputElement)?.value
    const email = (form.querySelector('#c-email') as HTMLInputElement)?.value
    if (!name?.trim() || !email?.trim()) return
    setSubmitted(true)
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
        <div className="form-group">
          <label htmlFor="c-name">Your name</label>
          <input type="text" id="c-name" placeholder="John Smith" required />
        </div>
        <div className="form-group">
          <label htmlFor="c-email">Email address</label>
          <input type="email" id="c-email" placeholder="you@company.co.uk" required />
        </div>
        <div className="form-group">
          <label htmlFor="c-subject">Subject</label>
          <select id="c-subject">
            <option>General enquiry</option>
            <option>Technical support</option>
            <option>Billing question</option>
            <option>Enterprise / Sales</option>
            <option>Demo request</option>
            <option>Partnership</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="c-msg">Message</label>
          <textarea id="c-msg" placeholder="How can we help?" />
        </div>
        <button type="submit" className="btn-submit">Send Message →</button>
      </form>
    </div>
  )
}
