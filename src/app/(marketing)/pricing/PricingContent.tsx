'use client'

import { useState } from 'react'
import Link from 'next/link'

const pMonthly = ['39', '79', '149']
const pAnnual = ['31', '63', '119']

export default function PricingContent() {
  const [billing, setBilling] = useState<'m' | 'a'>('m')
  const prices = billing === 'm' ? pMonthly : pAnnual
  const suffix = billing === 'a' ? '/mo billed annually' : '/mo'

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="eyebrow"><span className="eyebrow-dot" />Pricing</div>
          <h1 className="sh">Simple pricing for every<br />UK contractor.</h1>
          <p className="sl">14-day free trial on all plans. No credit card required. Cancel anytime.</p>
          <div className="pricing-toggle" role="group">
            <button type="button" className={`ptog ${billing === 'm' ? 'active' : ''}`} onClick={() => setBilling('m')}>Monthly</button>
            <button type="button" className={`ptog ${billing === 'a' ? 'active' : ''}`} onClick={() => setBilling('a')}>Annual <span className="ptog-save">Save 20%</span></button>
          </div>
          <div className="price-grid">
            <article className="price-card">
              <div className="price-tier">Starter</div>
              <div className="price-val"><sup>£</sup>{prices[0]}<sub>/{suffix}</sub></div>
              <div className="price-desc">For sole traders managing up to 10 subcontractors.</div>
              <ul className="price-feats">
                <li className="price-feat">Up to 10 subcontractors</li>
                <li className="price-feat">Document vault</li>
                <li className="price-feat">Expiry alerts (email)</li>
                <li className="price-feat">Trade-specific templates</li>
                <li className="price-feat">1 user seat</li>
                <li className="price-feat na">Compliance scores</li>
                <li className="price-feat na">HSE audit reports</li>
              </ul>
              <Link href="/auth/sign-up?plan=starter" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: 13 }}>Start Free Trial</Link>
            </article>
            <article className="price-card pop">
              <div className="price-pop">Most Popular</div>
              <div className="price-tier">Pro</div>
              <div className="price-val"><sup>£</sup>{prices[1]}<sub>/{suffix}</sub></div>
              <div className="price-desc">For growing contractors managing multiple sites.</div>
              <ul className="price-feats">
                <li className="price-feat">Up to 50 subcontractors</li>
                <li className="price-feat">Everything in Starter</li>
                <li className="price-feat">Real-time compliance scores</li>
                <li className="price-feat">HSE audit PDF reports</li>
                <li className="price-feat">Multi-site management</li>
                <li className="price-feat">SMS expiry alerts</li>
                <li className="price-feat">3 user seats</li>
              </ul>
              <Link href="/auth/sign-up?plan=pro" className="btn btn-acc" style={{ width: '100%', justifyContent: 'center', padding: 13 }}>Start Free Trial</Link>
            </article>
            <article className="price-card">
              <div className="price-tier">Business</div>
              <div className="price-val"><sup>£</sup>{prices[2]}<sub>/{suffix}</sub></div>
              <div className="price-desc">For established contractors with large supply chains.</div>
              <ul className="price-feats">
                <li className="price-feat">Up to 250 subcontractors</li>
                <li className="price-feat">Everything in Pro</li>
                <li className="price-feat">CSCS / Gas Safe / NICEIC verification</li>
                <li className="price-feat">API access</li>
                <li className="price-feat">10 user seats</li>
              </ul>
              <Link href="/auth/sign-up?plan=business" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: 13 }}>Start Free Trial</Link>
            </article>
            <article className="price-card">
              <div className="price-tier">Enterprise</div>
              <div className="price-val" style={{ fontSize: 28, letterSpacing: '-.5px' }}>Custom<sub style={{ fontSize: 12 }}> pricing</sub></div>
              <div className="price-desc">National contractors with complex compliance needs.</div>
              <ul className="price-feats">
                <li className="price-feat">Unlimited subcontractors</li>
                <li className="price-feat">Everything in Business</li>
                <li className="price-feat">White-label portal</li>
                <li className="price-feat">Unlimited seats</li>
                <li className="price-feat">Dedicated account manager</li>
              </ul>
              <a href="mailto:sales@subcompliant.co.uk" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: 13 }}>Contact Sales</a>
            </article>
          </div>
        </div>
      </section>
      <section className="faq-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-dot" />Pricing FAQ</div>
          <h2 className="sh" style={{ margin: '0 auto 10px' }}>Common pricing questions.</h2>
          <PricingFaq />
        </div>
      </section>
    </>
  )
}

function PricingFaq() {
  const [open, setOpen] = useState<number | null>(null)
  const items = [
    { q: 'Is there a free trial?', a: 'All plans include a 14-day free trial with full Pro features enabled. No credit card is required. At the end of the trial, your account is downgraded to Starter unless you activate a paid plan.' },
    { q: 'Can I change plans?', a: 'Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades take effect at the next billing cycle.' },
    { q: 'What happens when I cancel?', a: 'You can cancel anytime via account settings. Access continues until the end of your current billing period. Your data is retained for 90 days after cancellation and can be exported at any time.' },
    { q: 'Do you offer discounts for annual billing?', a: 'Yes — annual billing saves 20% compared to monthly. Switch to annual billing in your account settings at any time.' },
  ]
  return (
    <div className="faq-list">
      {items.map((item, i) => (
        <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
          <button type="button" className="faq-q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            {item.q}<span className="faq-icon">+</span>
          </button>
          <div className="faq-a" style={{ display: open === i ? 'block' : 'none' }}>{item.a}</div>
        </div>
      ))}
    </div>
  )
}
