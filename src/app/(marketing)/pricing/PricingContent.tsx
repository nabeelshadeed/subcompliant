'use client'

import { useState } from 'react'
import Link from 'next/link'

const pMonthly = ['39', '79', '149']
const pAnnual = ['31', '63', '119']

// Annual savings vs monthly: (monthly - annual) * 12
// Starter: (39-31)*12 = £96/yr  Pro: (79-63)*12 = £192/yr  Business: (149-119)*12 = £360/yr
const annualSavings = ['£96', '£192', '£360']

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
          <div className="pricing-trust">
            <span className="ptrust-badge">✓ No long-term contracts</span>
            <span className="ptrust-badge">✓ UK GDPR compliant</span>
            <span className="ptrust-badge">✓ Cancel in 60 seconds</span>
          </div>

          {/* 30-day money-back guarantee bar */}
          <div className="guarantee-bar" style={{ maxWidth: 520, margin: '0 auto 28px' }}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <span>30-day money-back guarantee — no questions asked</span>
          </div>

          <div className="pricing-toggle" role="group" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <button type="button" className={`ptog ${billing === 'm' ? 'active' : ''}`} onClick={() => setBilling('m')}>Monthly</button>
            <button type="button" className={`ptog ${billing === 'a' ? 'active' : ''}`} onClick={() => setBilling('a')}>Annual <span className="ptog-save">Save 20%</span></button>
          </div>
          {billing === 'a' && (
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--acc)', marginBottom: 28 }}>
              Save {annualSavings[1]}/yr on Pro · Save {annualSavings[0]}/yr on Starter · Save {annualSavings[2]}/yr on Business
            </p>
          )}

          <div className="price-grid">
            <article className="price-card">
              <div className="price-tier">Starter</div>
              <div className="price-val"><sup>£</sup>{prices[0]}<sub>{suffix}</sub></div>
              {billing === 'a' && <div style={{ fontSize: 11, color: 'var(--acc)', marginBottom: 4, fontWeight: 600 }}>Save {annualSavings[0]}/yr</div>}
              <div style={{ fontSize: 11, color: 'var(--w55)', marginBottom: 10, background: 'rgba(204,255,0,.07)', border: '1px solid rgba(204,255,0,.15)', borderRadius: 100, padding: '3px 10px', display: 'inline-block' }}>14-day free trial — no credit card</div>
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
              <div className="price-val"><sup>£</sup>{prices[1]}<sub>{suffix}</sub></div>
              {billing === 'a' && <div style={{ fontSize: 11, color: 'var(--acc)', marginBottom: 4, fontWeight: 600 }}>Save {annualSavings[1]}/yr</div>}
              <div style={{ fontSize: 11, color: 'var(--w55)', marginBottom: 10, background: 'rgba(204,255,0,.07)', border: '1px solid rgba(204,255,0,.15)', borderRadius: 100, padding: '3px 10px', display: 'inline-block' }}>14-day free trial — no credit card</div>
              <div className="price-desc">For growing contractors managing multiple sites.</div>
              <div style={{ fontSize: 12, color: 'var(--acc)', fontWeight: 600, marginBottom: 10 }}>Most value for growing contractors</div>
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
              <div className="price-val"><sup>£</sup>{prices[2]}<sub>{suffix}</sub></div>
              {billing === 'a' && <div style={{ fontSize: 11, color: 'var(--acc)', marginBottom: 4, fontWeight: 600 }}>Save {annualSavings[2]}/yr</div>}
              <div style={{ fontSize: 11, color: 'var(--w55)', marginBottom: 10, background: 'rgba(204,255,0,.07)', border: '1px solid rgba(204,255,0,.15)', borderRadius: 100, padding: '3px 10px', display: 'inline-block' }}>14-day free trial — no credit card</div>
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
              <div style={{ fontSize: 11, color: 'var(--w55)', marginBottom: 10, background: 'rgba(204,255,0,.07)', border: '1px solid rgba(204,255,0,.15)', borderRadius: 100, padding: '3px 10px', display: 'inline-block' }}>14-day free trial — no credit card</div>
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

      {/* Comparison section */}
      <section className="section" style={{ background: 'var(--bg2)', borderTop: '1px solid var(--bdr)', borderBottom: '1px solid var(--bdr)' }}>
        <div className="container">
          <div className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}><span className="eyebrow-dot" />How We Compare</div>
          <h2 className="sh" style={{ textAlign: 'center', margin: '0 auto 12px' }}>SubCompliant vs your current approach</h2>
          <p className="sl" style={{ textAlign: 'center', margin: '0 auto 40px', maxWidth: 560 }}>Most contractors manage compliance with spreadsheets or expensive enterprise tools. Neither works well at SME scale.</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 200 }}>Feature</th>
                  <th className="sc-col" style={{ minWidth: 160 }}>SubCompliant</th>
                  <th style={{ minWidth: 140 }}>Spreadsheets</th>
                  <th style={{ minWidth: 180 }}>CHAS / Constructionline</th>
                  <th style={{ minWidth: 160 }}>Avetta / Alcumus</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Auto expiry alerts</td>
                  <td className="sc-col"><span className="cmp-yes">✓ Yes — 30/14/7/3/1 day</span></td>
                  <td><span className="cmp-no">✗ Manual only</span></td>
                  <td><span className="cmp-no">✗ Not for subcontractors</span></td>
                  <td><span className="cmp-partial">~ Limited</span></td>
                </tr>
                <tr>
                  <td>Magic-link upload</td>
                  <td className="sc-col"><span className="cmp-yes">✓ No account needed</span></td>
                  <td><span className="cmp-no">✗ Email attachments</span></td>
                  <td><span className="cmp-no">✗ Subcontractor registers</span></td>
                  <td><span className="cmp-no">✗ Full registration</span></td>
                </tr>
                <tr>
                  <td>Real-time risk scores</td>
                  <td className="sc-col"><span className="cmp-yes">✓ Automated</span></td>
                  <td><span className="cmp-no">✗ None</span></td>
                  <td><span className="cmp-partial">~ Annual snapshot only</span></td>
                  <td><span className="cmp-partial">~ Enterprise only</span></td>
                </tr>
                <tr>
                  <td>HSE audit reports</td>
                  <td className="sc-col"><span className="cmp-yes">✓ One click PDF</span></td>
                  <td><span className="cmp-no">✗ Manual export</span></td>
                  <td><span className="cmp-partial">~ Own accreditation only</span></td>
                  <td><span className="cmp-partial">~ Enterprise tier</span></td>
                </tr>
                <tr>
                  <td>Price for SMEs</td>
                  <td className="sc-col"><span className="cmp-yes">✓ From £39/mo</span></td>
                  <td><span className="cmp-yes">✓ Free (but risky)</span></td>
                  <td><span className="cmp-partial">~ £400–£800/yr + fees</span></td>
                  <td><span className="cmp-no">✗ Enterprise pricing</span></td>
                </tr>
                <tr>
                  <td>Minutes to set up</td>
                  <td className="sc-col"><span className="cmp-yes">✓ Under 10 minutes</span></td>
                  <td><span className="cmp-partial">~ Hours to build</span></td>
                  <td><span className="cmp-no">✗ Days + audit visit</span></td>
                  <td><span className="cmp-no">✗ Weeks of onboarding</span></td>
                </tr>
              </tbody>
            </table>
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
    { q: 'Do you offer a money-back guarantee?', a: 'Yes. If SubCompliant isn\'t right for you within 30 days of your first payment, contact us for a full refund. No conditions, no questions.' },
    { q: 'What counts as a subcontractor?', a: 'Any individual or company in your supply chain whose documents you need to track. That includes sole traders, Ltd companies, and one-man-bands — anyone who works on your sites or projects.' },
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
