import { getServerUserId } from '@/lib/auth/get-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { HomepageClient } from '@/components/HomepageClient'
import './homepage.css'

export default async function HomePage() {
  try {
    const userId = await getServerUserId()
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
              <li><Link href="/guides">Guides</Link></li>
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
        <Link href="/guides">Guides</Link>
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
                SubCompliant automatically collects and tracks every subcontractor&apos;s compliance documents — with real-time risk scoring, automated expiry alerts, and one-click HSE audit reports.
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
              <div className="proof-item"><span className="proof-ico">📋</span><span><strong className="proof-strong">All</strong> UK compliance doc types supported</span></div>
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
            <div className="why-grid" style={{ marginTop: 40 }}>
              <div className="why-item">
                <span className="why-ico">📋</span>
                <div>
                  <strong>Spreadsheets miss renewals</strong>
                  <p>No alerts, no automation, no audit trail. One missed renewal and you&apos;re liable.</p>
                </div>
              </div>
              <div className="why-item">
                <span className="why-ico">🏗️</span>
                <div>
                  <strong>CHAS/Constructionline is for buyers</strong>
                  <p>They prove your compliance to clients. SubCompliant manages your subcontractors&apos; compliance for you.</p>
                </div>
              </div>
              <div className="why-item">
                <span className="why-ico">💼</span>
                <div>
                  <strong>Enterprise tools are overkill</strong>
                  <p>Avetta and Alcumus are built for FTSE 500. SubCompliant is built for UK SMEs — set up in 10 minutes, not 10 weeks.</p>
                </div>
              </div>
              <div className="why-item">
                <span className="why-ico">⚖️</span>
                <div>
                  <strong>Personal liability is real</strong>
                  <p>As the principal contractor, HSE holds you responsible for subcontractors on your sites. An audit trail isn&apos;t optional.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="features" aria-labelledby="feat-h">
          <div className="container">
            <div className="eyebrow"><span className="eyebrow-dot" />Platform Features</div>
            <h2 id="feat-h" className="sh">The complete subcontractor risk management system.</h2>
            <p className="sl">Built specifically for UK SME contractors — not adapted from a US enterprise tool.</p>
            <div className="feat-grid">
              <div className="feat-card rv">
                <div className="feat-ico">📤</div>
                <h3>Magic-Link Upload</h3>
                <p>Send a branded link. Subcontractor clicks, uploads their documents in under 2 minutes. No accounts, no passwords, no friction. Collection rates go from 60% to 98%.</p>
              </div>
              <div className="feat-card rv d1">
                <div className="feat-ico">⏰</div>
                <h3>Automatic Expiry Alerts</h3>
                <p>SubCompliant monitors every document expiry date and sends reminders at 30, 14, 7, 3, and 1 days before lapse — to you and to the subcontractor.</p>
              </div>
              <div className="feat-card rv d2">
                <div className="feat-ico">📊</div>
                <h3>Real-Time Risk Scoring</h3>
                <p>Every subcontractor gets an automated risk score (Low/Medium/High/Critical) based on document completeness, expiry proximity and document type weighting.</p>
              </div>
              <div className="feat-card rv d1">
                <div className="feat-ico">📋</div>
                <h3>HSE Audit Reports</h3>
                <p>Generate a PDF compliance report in one click — formatted for HSE site audits. Shows document status, expiry dates, and approval history for your entire supply chain.</p>
              </div>
              <div className="feat-card rv d2">
                <div className="feat-ico">🔔</div>
                <h3>Automated Expiry Chasing</h3>
                <p>When a document is nearing expiry, SubCompliant automatically sends a fresh magic-link to the subcontractor so they can re-upload — no manual chasing on your end.</p>
              </div>
              <div className="feat-card rv">
                <div className="feat-ico">🏗️</div>
                <h3>Trade-Specific Templates</h3>
                <p>Pre-built document checklists for electricians, gas engineers, roofers, scaffolders, groundworkers and more — so you always request exactly what each trade needs.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section alt" id="how" aria-labelledby="how-h">
          <div className="container">
            <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-dot" />How It Works</div>
            <h2 id="how-h" className="sh" style={{ margin: '0 auto 24px', textAlign: 'center' as const }}>Live in 10 minutes. Compliant indefinitely.</h2>
            <div className="how-steps">
              <div className="how-step">
                <div className="how-num">1</div>
                <h3>Create your account</h3>
                <p>Sign up in under 60 seconds. No credit card, no IT setup. Your dashboard is ready immediately.</p>
              </div>
              <div className="how-arrow" aria-hidden="true">→</div>
              <div className="how-step">
                <div className="how-num">2</div>
                <h3>Invite subcontractors</h3>
                <p>Enter an email address and click send. SubCompliant fires a branded magic-link — no account needed on their end.</p>
              </div>
              <div className="how-arrow" aria-hidden="true">→</div>
              <div className="how-step">
                <div className="how-num">3</div>
                <h3>They upload in 2 minutes</h3>
                <p>Your subcontractor taps the link, uploads their documents from their phone or laptop. You get a notification instantly.</p>
              </div>
              <div className="how-arrow" aria-hidden="true">→</div>
              <div className="how-step">
                <div className="how-num">4</div>
                <h3>Approve &amp; relax</h3>
                <p>Review, approve or reject with one click. SubCompliant monitors every expiry date from here — automatically.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="section alt" id="testimonials" aria-labelledby="testi-h">
          <div className="container">
            <div className="eyebrow"><span className="eyebrow-dot" />Trusted by UK Contractors</div>
            <h2 id="testi-h" className="sh">What contractors say.</h2>
            <p className="sl">From sole traders to national contractors — SubCompliant keeps subcontractor risk in check.</p>
            <div className="testi-grid">
              <div className="testi-card rv">
                <p className="testi-quote">&ldquo;We had a subcontractor on site with an expired public liability policy for three weeks before we noticed. SubCompliant would have flagged it on day one. It&rsquo;s non-negotiable for us now.&rdquo;</p>
                <div className="testi-author">
                  <div className="testi-av">JM</div>
                  <div>
                    <p className="testi-name">James M.</p>
                    <p className="testi-role">Director · JM Building Contractors, Manchester</p>
                  </div>
                </div>
              </div>
              <div className="testi-card rv d1">
                <p className="testi-quote">&ldquo;The magic-link upload is genius. My subbies tap a link and upload their certs — no accounts, no passwords. Our document collection rate went from 60% to nearly 100%.&rdquo;</p>
                <div className="testi-author">
                  <div className="testi-av">SR</div>
                  <div>
                    <p className="testi-name">Sarah R.</p>
                    <p className="testi-role">Operations Manager · Redstone Groundworks, Birmingham</p>
                  </div>
                </div>
              </div>
              <div className="testi-card rv d2">
                <p className="testi-quote">&ldquo;We passed our HSE site audit in 20 minutes because every document was organised and exportable. The auditor was impressed. Worth every penny of the subscription.&rdquo;</p>
                <div className="testi-author">
                  <div className="testi-av">DK</div>
                  <div>
                    <p className="testi-name">David K.</p>
                    <p className="testi-role">Site Manager · Kestrel Roofing Ltd, Leeds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" aria-label="Social proof">
          <div className="container">
            <div className="social-proof-bar">
              <div className="sp-item">
                <div className="sp-val">500<em>+</em></div>
                <div className="sp-label">UK contractors on the platform</div>
              </div>
              <div className="sp-sep" />
              <div className="sp-item">
                <div className="sp-val">12,000<em>+</em></div>
                <div className="sp-label">Compliance documents tracked</div>
              </div>
              <div className="sp-sep" />
              <div className="sp-item">
                <div className="sp-val">98<em>%</em></div>
                <div className="sp-label">Document collection rate via magic link</div>
              </div>
              <div className="sp-sep" />
              <div className="sp-item">
                <div className="sp-val">£0</div>
                <div className="sp-label">HSE fines paid by our customers</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="pricing" aria-labelledby="price-h">
          <div className="container">
            <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="eyebrow-dot" />Pricing</div>
            <h2 id="price-h" className="sh" style={{ margin: '0 auto 10px', textAlign: 'center' as const }}>Simple pricing. No surprises.</h2>
            <p className="sl" style={{ margin: '0 auto 36px', textAlign: 'center' as const }}>7-day free trial on all plans. Card required to activate. Cancel anytime.</p>
            <div className="price-grid">
              <article className="price-card">
                <div className="price-tier">Starter</div>
                <div className="price-val"><sup>£</sup>39<sub>/mo</sub></div>
                <div className="price-desc">For sole traders managing up to 10 subcontractors.</div>
                <ul className="price-feats">
                  <li className="price-feat">10 subcontractors</li>
                  <li className="price-feat">Magic-link document upload</li>
                  <li className="price-feat">Expiry email alerts</li>
                  <li className="price-feat">Trade-specific document templates</li>
                  <li className="price-feat">Document vault &amp; history</li>
                  <li className="price-feat">1 user seat</li>
                  <li className="price-feat na">Compliance scores</li>
                  <li className="price-feat na">HSE audit PDF reports</li>
                </ul>
                <Link href="/auth/sign-up?plan=starter" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: 13 }}>Start Free Trial</Link>
              </article>
              <article className="price-card pop">
                <div className="price-pop">Most Popular</div>
                <div className="price-tier">Pro</div>
                <div className="price-val"><sup>£</sup>79<sub>/mo</sub></div>
                <div className="price-desc">For growing contractors managing multiple sites and supply chains.</div>
                <ul className="price-feats">
                  <li className="price-feat">50 subcontractors</li>
                  <li className="price-feat">Everything in Starter</li>
                  <li className="price-feat">Real-time compliance scores</li>
                  <li className="price-feat">HSE audit PDF reports</li>
                  <li className="price-feat">Bulk invite &amp; chase</li>
                  <li className="price-feat">Multi-site management</li>
                  <li className="price-feat">SMS expiry alerts</li>
                  <li className="price-feat">3 user seats</li>
                </ul>
                <Link href="/auth/sign-up?plan=pro" className="btn btn-acc" style={{ width: '100%', justifyContent: 'center', padding: 13 }}>Start Free Trial</Link>
              </article>
              <article className="price-card">
                <div className="price-tier">Business</div>
                <div className="price-val"><sup>£</sup>149<sub>/mo</sub></div>
                <div className="price-desc">For established contractors with large, complex supply chains.</div>
                <ul className="price-feats">
                  <li className="price-feat">250 subcontractors</li>
                  <li className="price-feat">Everything in Pro</li>
                  <li className="price-feat">Custom document type templates</li>
                  <li className="price-feat">API access &amp; webhooks</li>
                  <li className="price-feat">Audit logs</li>
                  <li className="price-feat">Priority support</li>
                  <li className="price-feat">10 user seats</li>
                </ul>
                <Link href="/auth/sign-up?plan=business" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: 13 }}>Start Free Trial</Link>
              </article>
              <article className="price-card">
                <div className="price-tier">Enterprise</div>
                <div className="price-val" style={{ fontSize: 28, letterSpacing: '-.5px' }}>Custom<sub style={{ fontSize: 12 }}> pricing</sub></div>
                <div className="price-desc">National contractors with complex compliance programmes and multiple divisions.</div>
                <ul className="price-feats">
                  <li className="price-feat">Unlimited subcontractors</li>
                  <li className="price-feat">Everything in Business</li>
                  <li className="price-feat">White-label contractor portal</li>
                  <li className="price-feat">Dedicated account manager</li>
                  <li className="price-feat">SLA &amp; DPA included</li>
                  <li className="price-feat">Unlimited seats</li>
                </ul>
                <a href="mailto:sales@subcompliant.co.uk" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', padding: 13 }}>Contact Sales</a>
              </article>
            </div>
            <p style={{ textAlign: 'center' as const, marginTop: 24, fontSize: 13, color: 'var(--w30)' }}>
              All prices exclude VAT · Save 20% with annual billing · 30-day money-back guarantee
            </p>
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
              <div className="faq-item rv">
                <button type="button" className="faq-q" aria-expanded="false">What documents does SubCompliant track?<span className="faq-icon">+</span></button>
                <div className="faq-a" style={{ display: 'none' }}>All standard UK construction compliance documents — public liability insurance, employers liability, CSCS cards, Gas Safe registration, NICEIC/NAPIT certificates, RAMS, CIS registration, right-to-work, asbestos awareness, working at height certificates, and any custom document type you define.</div>
              </div>
              <div className="faq-item rv d1">
                <button type="button" className="faq-q" aria-expanded="false">How does the automatic expiry tracking work?<span className="faq-icon">+</span></button>
                <div className="faq-a" style={{ display: 'none' }}>When a document is uploaded and approved, SubCompliant records the expiry date and begins monitoring it automatically. You and your subcontractor receive email reminders at 30, 14, 7, 3, and 1 days before expiry. When a document expires, the subcontractor&apos;s compliance status updates in real time.</div>
              </div>
              <div className="faq-item rv d2">
                <button type="button" className="faq-q" aria-expanded="false">How long does it take to get started?<span className="faq-icon">+</span></button>
                <div className="faq-a" style={{ display: 'none' }}>Most contractors are live within 10 minutes. Sign up, add your first subcontractor, send a magic-link invite. That&apos;s it — no IT support needed, no software to install.</div>
              </div>
              <div className="faq-item rv">
                <button type="button" className="faq-q" aria-expanded="false">What happens if a subcontractor ignores the upload link?<span className="faq-icon">+</span></button>
                <div className="faq-a" style={{ display: 'none' }}>You&apos;ll see them flagged as non-compliant on your dashboard. You can send a reminder with one click, or download a compliance report to use in your pre-start meetings. The dashboard makes it immediately visible who is blocking your compliance score.</div>
              </div>
              <div className="faq-item rv d1">
                <button type="button" className="faq-q" aria-expanded="false">Is SubCompliant GDPR compliant?<span className="faq-icon">+</span></button>
                <div className="faq-a" style={{ display: 'none' }}>Yes. We are registered with the ICO and operate under UK GDPR. All data is stored in the EU, encrypted at rest and in transit, and you can export or delete all data at any time. We act as your data processor and sign a DPA on Business and Enterprise plans.</div>
              </div>
              <div className="faq-item rv d2">
                <button type="button" className="faq-q" aria-expanded="false">Can I use SubCompliant on mobile?<span className="faq-icon">+</span></button>
                <div className="faq-a" style={{ display: 'none' }}>Yes. SubCompliant is a web app optimised for mobile browsers — no app download needed. Manage subcontractors, review documents, and send invitations from any device.</div>
              </div>
              <div className="faq-item rv">
                <button type="button" className="faq-q" aria-expanded="false">What support do you offer?<span className="faq-icon">+</span></button>
                <div className="faq-a" style={{ display: 'none' }}>All plans include email support (hello@subcompliant.co.uk) with replies within 4 hours on weekdays. Pro and above get priority support. Enterprise plans include a dedicated account manager. We also have a Help Centre with guides at subcompliant.co.uk/help.</div>
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
              <h4>Resources</h4>
              <ul>
                <li><Link href="/guides">Guides</Link></li>
                <li><Link href="/guides/cscs-card-check">CSCS Card Check</Link></li>
                <li><Link href="/guides/gas-safe-verification">Gas Safe Guide</Link></li>
                <li><Link href="/guides/hse-compliance-checklist">HSE Checklist</Link></li>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: 'How does SubCompliant differ from Constructionline or CHAS?', acceptedAnswer: { '@type': 'Answer', text: 'Constructionline and CHAS help you prove your own compliance to buyers — they are annual accreditation schemes. SubCompliant manages your subcontractors\u2019 compliance on a daily operational basis. They are complementary, not competing tools.' } },
            { '@type': 'Question', name: 'Do subcontractors need to create an account to upload documents?', acceptedAnswer: { '@type': 'Answer', text: 'No. SubCompliant uses magic-link upload: you send a link, the subcontractor taps it and uploads directly. No account creation, no passwords, no friction.' } },
            { '@type': 'Question', name: 'Is there a free trial?', acceptedAnswer: { '@type': 'Answer', text: 'All plans include a 14-day free trial with full Pro feature access. No credit card required.' } },
            { '@type': 'Question', name: 'What documents does SubCompliant track?', acceptedAnswer: { '@type': 'Answer', text: 'All standard UK construction compliance documents \u2014 public liability insurance, employers liability, CSCS cards, Gas Safe registration, NICEIC/NAPIT certificates, RAMS, CIS registration, right-to-work, asbestos awareness, working at height certificates, and any custom document type you define.' } },
            { '@type': 'Question', name: 'How does the automatic expiry tracking work?', acceptedAnswer: { '@type': 'Answer', text: 'When a document is uploaded and approved, SubCompliant records the expiry date and begins monitoring it automatically. You and your subcontractor receive email reminders at 30, 14, 7, 3, and 1 days before expiry. When a document expires, the subcontractor\u2019s compliance status updates in real time.' } },
            { '@type': 'Question', name: 'How long does it take to get started?', acceptedAnswer: { '@type': 'Answer', text: 'Most contractors are live within 10 minutes. Sign up, add your first subcontractor, send a magic-link invite. That\u2019s it \u2014 no IT support needed, no software to install.' } },
            { '@type': 'Question', name: 'What happens if a subcontractor ignores the upload link?', acceptedAnswer: { '@type': 'Answer', text: 'You\u2019ll see them flagged as non-compliant on your dashboard. You can send a reminder with one click, or download a compliance report to use in your pre-start meetings. The dashboard makes it immediately visible who is blocking your compliance score.' } },
            { '@type': 'Question', name: 'Is SubCompliant GDPR compliant?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. We are registered with the ICO and operate under UK GDPR. All data is stored in the EU, encrypted at rest and in transit, and you can export or delete all data at any time. We act as your data processor and sign a DPA on Business and Enterprise plans.' } },
            { '@type': 'Question', name: 'Can I use SubCompliant on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. SubCompliant is a web app optimised for mobile browsers \u2014 no app download needed. Manage subcontractors, review documents, and send invitations from any device.' } },
            { '@type': 'Question', name: 'What support do you offer?', acceptedAnswer: { '@type': 'Answer', text: 'All plans include email support (hello@subcompliant.co.uk) with replies within 4 hours on weekdays. Pro and above get priority support. Enterprise plans include a dedicated account manager. We also have a Help Centre with guides at subcompliant.co.uk/help.' } },
          ],
        }) }}
      />
    </div>
  )
}
