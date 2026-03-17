import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { HomepageClient } from '@/components/HomepageClient'
import './homepage.css'

export default async function HomePage() {
  try {
    const { userId } = await auth()
    if (userId) redirect('/dashboard')
  } catch {
    // Clerk unavailable — still show homepage
  }

  return (
    <div className="hp">
      <HomepageClient />
      <header role="banner">
        <nav className="nav" id="hp-nav" aria-label="Main navigation">
          <div className="nav-inner">
            <Link href="/" className="logo" aria-label="SubCompliant home">
              Sub<span>Compliant</span>
            </Link>
            <ul className="nav-links" role="list">
              <li><Link href="#why">Why SubCompliant</Link></li>
              <li><Link href="#features">Features</Link></li>
              <li><Link href="#how">How It Works</Link></li>
              <li><Link href="#pricing">Pricing</Link></li>
              <li><Link href="#faq">FAQ</Link></li>
            </ul>
            <div className="nav-right">
              <Link href="/auth/sign-in" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link href="/auth/sign-up" className="btn btn-acc btn-sm">Start Free Trial</Link>
              <button type="button" className="ham" id="hp-ham" aria-label="Open menu" aria-expanded="false">
                <span /><span /><span />
              </button>
            </div>
          </div>
        </nav>
      </header>
      <nav className="mob-menu" id="hp-mob-menu" aria-label="Mobile navigation">
        <Link href="#why">Why SubCompliant</Link>
        <Link href="#features">Features</Link>
        <Link href="#how">How It Works</Link>
        <Link href="#pricing">Pricing</Link>
        <Link href="#faq">FAQ</Link>
        <Link href="/auth/sign-in" className="btn btn-ghost btn-full">Sign In</Link>
        <Link href="/auth/sign-up" className="btn btn-acc btn-full">Start Free Trial</Link>
      </nav>

      <main id="main" role="main">
        <section className="hero" aria-labelledby="hero-h">
          <div className="hero-bg" aria-hidden="true">
            <div className="hero-blob" />
            <div className="hero-blob2" />
            <div className="hero-grid-bg" />
          </div>
          <div className="hero-content">
            <div className="container">
              <div className="hero-pill">
                <span className="hero-pulse" />
                UK Subcontractor Risk Management Platform
              </div>
              <h1 id="hero-h">
                One expired document
                <br />from a subcontractor
                <br />can <em>void everything.</em>
              </h1>
              <p className="hero-sub">
                SubCompliant automatically collects, verifies, and tracks every subcontractor&apos;s compliance documents — with real-time risk scoring, live certification checks, and one-click HSE audit reports.
              </p>
              <div className="hero-ctas">
                <Link href="/auth/sign-up" className="btn btn-acc btn-lg">Start Free — 14 Days →</Link>
                <Link href="#how" className="btn btn-ghost btn-lg">See How It Works</Link>
              </div>
              <p className="hero-note">
                <svg width="14" height="14" fill="none" viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" /><path d="M5 7l1.5 1.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                No credit card required &nbsp;·&nbsp; GDPR compliant &nbsp;·&nbsp; Cancel anytime
              </p>
              <div className="hero-stats" aria-label="Key statistics">
                <div className="hero-stat">
                  <div className="hsv">300<em>k+</em></div>
                  <div className="hsl">SME contractors in the UK who need this</div>
                </div>
                <div className="hero-stat">
                  <div className="hsv">£<em>5k</em></div>
                  <div className="hsl">Average HSE fine for site non-compliance</div>
                </div>
                <div className="hero-stat">
                  <div className="hsv">14<em>-day</em></div>
                  <div className="hsl">Free trial — full Pro access, no card needed</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="risk-banner" role="alert" aria-label="Compliance risk warning">
          <div className="container">
            <div className="risk-inner">
              <div className="risk-item">⚠️ <span><strong>Insurance lapse</strong> = contract void</span></div>
              <div className="risk-item">⚠️ <span><strong>Expired CSCS</strong> = HSE prosecution risk</span></div>
              <div className="risk-item">⚠️ <span><strong>No audit trail</strong> = personal liability</span></div>
              <div className="risk-item">⚠️ <span><strong>Spreadsheets</strong> miss renewals — it&apos;s not if, it&apos;s when</span></div>
            </div>
          </div>
        </div>

        <div className="proof-bar" aria-label="Trust indicators">
          <div className="container">
            <div className="proof-inner">
              <div className="proof-item"><span className="proof-ico">🔒</span><span>GDPR Compliant</span></div>
              <div className="proof-item"><span className="proof-ico">✅</span><span><strong className="proof-strong">HSE</strong> audit-ready reports</span></div>
              <div className="proof-item"><span className="proof-ico">🔍</span><span><strong className="proof-strong">Live</strong> CSCS · Gas Safe · NICEIC verification</span></div>
              <div className="proof-item"><span className="proof-ico">⚡</span><span>Live in <strong className="proof-strong">under 10 minutes</strong></span></div>
              <div className="proof-item"><span className="proof-ico">🏗️</span><span>Built for <strong className="proof-strong">UK SME contractors</strong></span></div>
            </div>
          </div>
        </div>

        <section className="section alt" id="why" aria-labelledby="why-h">
          <div className="container">
            <div className="eyebrow"><span className="eyebrow-dot" />Why SubCompliant</div>
            <h2 id="why-h" className="sh">Constructionline and CHAS prove <em style={{ fontStyle: 'normal', color: 'var(--acc)' }}>your</em> compliance. SubCompliant manages <em style={{ fontStyle: 'normal', color: 'var(--acc)' }}>theirs.</em></h2>
            <p className="sl">Every incumbent platform was built for procurement. None of them solve the daily operational problem — managing your subcontractors&apos; documents, tracking their renewals, and staying audit-ready without a spreadsheet.</p>
            <div style={{ marginTop: 40 }}>
              <Link href="/auth/sign-up" className="btn btn-acc btn-lg">Start Free for 14 Days →</Link>
            </div>
          </div>
        </section>

        <section className="section" id="features" aria-labelledby="feat-h">
          <div className="container">
            <div className="eyebrow"><span className="eyebrow-dot" />Platform Features</div>
            <h2 id="feat-h" className="sh">The complete subcontractor risk management system.</h2>
            <p className="sl">Document vault, expiry alerts, live verification, HSE audit reports, magic-link upload — built for UK contractors.</p>
            <div style={{ marginTop: 32 }}>
              <Link href="/auth/sign-up" className="btn btn-acc">Get started</Link>
            </div>
          </div>
        </section>

        <section className="section alt" id="how" aria-labelledby="how-h">
          <div className="container center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-dot" />How It Works</div>
            <h2 id="how-h" className="sh" style={{ margin: '0 auto 10px' }}>Live in 10 minutes. Compliant indefinitely.</h2>
            <p className="sl" style={{ margin: '0 auto 0' }}>Create account → Invite via magic link → Verify & approve → Automated from there.</p>
            <div style={{ marginTop: 32 }}>
              <Link href="/auth/sign-up" className="btn btn-acc btn-lg">Start Free Trial</Link>
            </div>
          </div>
        </section>

        <section className="section" id="pricing" aria-labelledby="price-h">
          <div className="container center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-dot" />Pricing</div>
            <h2 id="price-h" className="sh" style={{ margin: '0 auto 10px' }}>Simple pricing for every UK contractor.</h2>
            <p className="sl" style={{ margin: '0 auto 32px' }}>14-day free trial on all plans. No credit card. Cancel anytime.</p>
            <Link href="/auth/sign-up" className="btn btn-acc btn-lg">Start Free Trial</Link>
          </div>
        </section>

        <section className="section alt" id="faq" aria-labelledby="faq-h">
          <div className="container center">
            <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-dot" />FAQ</div>
            <h2 id="faq-h" className="sh">Frequently asked questions.</h2>
            <div className="faq-list" role="list">
              <div className="faq-item rv">
                <button type="button" className="faq-q" aria-expanded="false">How does SubCompliant differ from Constructionline or CHAS?<span className="faq-icon">+</span></button>
                <div className="faq-a" style={{ display: 'none' }}>Constructionline and CHAS help you prove your own compliance to buyers — they are annual accreditation schemes. SubCompliant manages your subcontractors&apos; compliance on a daily operational basis. They are complementary, not competing tools.</div>
              </div>
              <div className="faq-item rv d1">
                <button type="button" className="faq-q" aria-expanded="false">Do subcontractors need to create an account to upload documents?<span className="faq-icon">+</span></button>
                <div className="faq-a" style={{ display: 'none' }}>No. SubCompliant uses magic-link upload: you send a link, the subcontractor taps it and uploads directly. No account creation, no passwords, no friction.</div>
              </div>
              <div className="faq-item rv d2">
                <button type="button" className="faq-q" aria-expanded="false">Is there a free trial?<span className="faq-icon">+</span></button>
                <div className="faq-a" style={{ display: 'none' }}>All plans include a 14-day free trial with full Pro feature access. No credit card required.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="cta-section" aria-labelledby="cta-h">
          <div className="cta-bg" aria-hidden="true"><div className="cta-radial" /></div>
          <div className="container">
            <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-dot" />Get Started Today</div>
            <h2 id="cta-h" className="sh" style={{ maxWidth: 600, margin: '0 auto 16px' }}>Don&apos;t wait for a compliance incident to find you first.</h2>
            <p className="sl" style={{ margin: '0 auto 36px' }}>Join UK contractors who have eliminated subcontractor compliance risk. Takes 10 minutes to set up.</p>
            <div className="cta-actions">
              <Link href="/auth/sign-up" className="btn btn-acc btn-lg">Start Free for 14 Days →</Link>
              <Link href="/auth/sign-in" className="btn btn-ghost btn-lg">Sign In</Link>
            </div>
            <p className="cta-note">No credit card required &nbsp;·&nbsp; Cancel anytime &nbsp;·&nbsp; GDPR compliant</p>
          </div>
        </section>
      </main>

      <footer role="contentinfo">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <Link href="/" className="logo">Sub<span>Compliant</span></Link>
              <p>The UK&apos;s subcontractor risk management platform. Automated compliance tracking for SME contractors.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><Link href="#features">Features</Link></li>
                <li><Link href="/pricing">Pricing</Link></li>
                <li><Link href="#how">How It Works</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link href="/about">About</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><Link href="/auth/sign-in">Sign In</Link></li>
                <li><Link href="/auth/sign-up">Get started</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 SubCompliant Ltd. Registered in England &amp; Wales.</div>
            <nav className="footer-legal" aria-label="Legal">
              <Link href="/legal/privacy">Privacy</Link>
              <Link href="/legal/terms">Terms</Link>
              <Link href="/legal/cookies">Cookies</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
