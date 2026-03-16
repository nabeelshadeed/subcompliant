import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title:       { template: '%s | SubCompliant', default: 'SubCompliant — Subcontractor Compliance' },
  description: 'Manage subcontractor compliance documents, risk scores, and certifications — built for UK contractors.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-gray-50 text-gray-900 antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
