import Link from 'next/link'

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="nav">
        <Link href="/" className="logo">Sub<span>Compliant</span></Link>
        <div className="nav-right">
          <Link href="/auth/sign-in" className="btn-sm btn-ghost">Sign In</Link>
          <Link href="/auth/sign-up" className="btn-sm btn-acc">Free Trial</Link>
        </div>
      </nav>
      {children}
      <footer>
        <Link href="/" className="logo" style={{ fontFamily: "'Syne',system-ui,sans-serif", fontSize: 16, fontWeight: 800, color: '#fff' }}>Sub<span style={{ color: 'var(--acc)' }}>Compliant</span></Link>
        <div className="footer-links">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <span style={{ color: 'rgba(255,255,255,.15)' }}>·</span>
          <Link href="/faq">FAQ</Link>
          <Link href="/help">Help Centre</Link>
          <Link href="/security">Security</Link>
          <span style={{ color: 'rgba(255,255,255,.15)' }}>·</span>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/cookies">Cookies</Link>
        </div>
        <div className="footer-copy">© 2026 SubCompliant Ltd.</div>
        <div className="footer-copy" style={{ marginTop: 4, opacity: 0.5, fontSize: 12 }}>Registered in England &amp; Wales · ICO Registered · UK GDPR Compliant</div>
      </footer>
    </>
  )
}
