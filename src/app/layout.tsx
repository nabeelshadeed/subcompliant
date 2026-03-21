import '@/lib/env'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { Syne, DM_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://subcompliant.co.uk'

export const metadata: Metadata = {
  title:       { template: '%s | SubCompliant', default: 'SubCompliant — Subcontractor Compliance' },
  description: 'Manage subcontractor compliance documents, risk scores, and certifications — built for UK contractors.',
  metadataBase: new URL(appUrl),
  keywords:    ['subcontractor compliance', 'UK compliance management', 'CSCS card checker', 'HSE audit', 'subcontractor documents', 'construction compliance software'],
  authors:     [{ name: 'SubCompliant Ltd' }],
  openGraph: {
    type:        'website',
    siteName:    'SubCompliant',
    title:       'SubCompliant — UK Subcontractor Compliance Platform',
    description: 'Manage subcontractor compliance documents, risk scores, and certifications — built for UK contractors.',
    url:         appUrl,
  },
  twitter: {
    card:        'summary_large_image',
    title:       'SubCompliant — UK Subcontractor Compliance Platform',
    description: 'Manage subcontractor compliance documents, risk scores, and certifications — built for UK contractors.',
  },
  robots: { index: true, follow: true },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type':    'SoftwareApplication',
  name:        'SubCompliant',
  description: 'UK subcontractor compliance management platform. Automated document tracking, real-time risk scoring, and HSE audit reports for UK contractors.',
  url:         appUrl,
  applicationCategory: 'BusinessApplication',
  operatingSystem:     'Web',
  offers: {
    '@type':        'Offer',
    price:          '39',
    priceCurrency:  'GBP',
  },
  author: { '@type': 'Organization', name: 'SubCompliant Ltd', url: appUrl },
}

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary:         '#CCFF00',
    colorBackground:       '#111111',
    colorForeground:       '#ffffff',
    colorInput:            '#181818',
    colorInputForeground:  '#ffffff',
    colorMuted:            '#262626',
    colorMutedForeground:  'rgba(255,255,255,0.55)',
    colorBorder:           'rgba(255,255,255,0.12)',
    colorDanger:           '#dc2626',
    fontFamily:            'var(--font-dm-sans), DM Sans, system-ui, sans-serif',
    fontFamilyButtons:     'var(--font-dm-sans), DM Sans, system-ui, sans-serif',
    borderRadius:          '0.75rem',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
        <body className="bg-[#0A0A0A] text-white antialiased font-sans min-h-screen">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
          />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
