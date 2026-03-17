import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
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

export const metadata: Metadata = {
  title:       { template: '%s | SubCompliant', default: 'SubCompliant — Subcontractor Compliance' },
  description: 'Manage subcontractor compliance documents, risk scores, and certifications — built for UK contractors.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
        <body className="bg-[#0A0A0A] text-white antialiased font-sans min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
