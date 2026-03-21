import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block font-display text-2xl font-bold text-white tracking-tight mb-3 hover:opacity-90 transition-opacity"
            aria-label="SubCompliant home"
          >
            Sub<span className="text-accent">Compliant</span>
          </Link>
          <p className="text-sm text-white/55 font-sans">
            14 days free · No credit card required
          </p>
        </div>
        <SignUp
          appearance={{
            variables: {
              colorPrimary:          '#CCFF00',
              colorBackground:       '#111111',
              colorForeground:       '#ffffff',
              colorInput:            '#181818',
              colorInputForeground:  '#ffffff',
              colorMuted:            '#262626',
              colorMutedForeground:  'rgba(255,255,255,0.55)',
              colorBorder:           'rgba(255,255,255,0.12)',
              fontFamily:            'var(--font-dm-sans), DM Sans, system-ui, sans-serif',
              fontFamilyButtons:     'var(--font-dm-sans), DM Sans, system-ui, sans-serif',
              borderRadius:          '0.75rem',
            } as Record<string, string>,
            elements: {
              rootBox:            'w-full',
              card:               'rounded-2xl shadow-2xl border border-white/10 bg-[#111]',
              cardBox:            'w-full',
              headerTitle:        'hidden',
              headerSubtitle:     'hidden',
              socialButtonsBlockButton: 'bg-white/10 border border-white/20 text-white hover:bg-white/15 font-sans',
              formFieldInput:     'bg-[#181818] border-white/20 text-white font-sans',
              formButtonPrimary:  'bg-accent text-[#0A0A0A] hover:opacity-90 font-semibold font-sans',
              footerActionLink:   'text-accent hover:opacity-90 font-sans',
            },
          }}
          redirectUrl="/dashboard"
          signInUrl="/auth/sign-in"
        />
      </div>
    </div>
  )
}
