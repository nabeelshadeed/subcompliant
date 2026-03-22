'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
    >
      <Printer size={14} />
      Print / Save as PDF
    </button>
  )
}
