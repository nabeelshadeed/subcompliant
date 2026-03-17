import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact SubCompliant',
  description: 'Contact the SubCompliant team. Get support, request a demo, or speak to our sales team about Enterprise pricing.',
}

export default function ContactPage() {
  return (
    <main className="main">
      <div className="page-header">
        <div className="eyebrow">Get in Touch</div>
        <h1>Contact SubCompliant</h1>
        <p className="lead">We&apos;re a small UK team and we actually reply. Usually within a few hours.</p>
      </div>
      <div className="contact-grid">
        <div>
          <div className="contact-channels">
            <div className="channel-card">
              <div className="ch-ico">💬</div>
              <div>
                <div className="ch-title">General Support</div>
                <div className="ch-desc">Questions about your account, billing, or how the platform works.</div>
                <a href="mailto:hello@subcompliant.co.uk" className="ch-link" data-acc>hello@subcompliant.co.uk</a>
              </div>
            </div>
            <div className="channel-card">
              <div className="ch-ico">🏢</div>
              <div>
                <div className="ch-title">Enterprise Sales</div>
                <div className="ch-desc">Interested in the Enterprise plan or white-label options? Let&apos;s talk.</div>
                <a href="mailto:sales@subcompliant.co.uk" className="ch-link" data-acc>sales@subcompliant.co.uk</a>
              </div>
            </div>
            <div className="channel-card">
              <div className="ch-ico">🔒</div>
              <div>
                <div className="ch-title">Data Protection</div>
                <div className="ch-desc">GDPR requests, data access, or privacy concerns.</div>
                <a href="mailto:privacy@subcompliant.co.uk" className="ch-link" data-acc>privacy@subcompliant.co.uk</a>
              </div>
            </div>
            <div className="channel-card">
              <div className="ch-ico">⚖️</div>
              <div>
                <div className="ch-title">Legal</div>
                <div className="ch-desc">Legal matters, compliance questions, and terms enquiries.</div>
                <a href="mailto:legal@subcompliant.co.uk" className="ch-link" data-acc>legal@subcompliant.co.uk</a>
              </div>
            </div>
          </div>
        </div>
        <ContactForm />
      </div>
    </main>
  )
}
