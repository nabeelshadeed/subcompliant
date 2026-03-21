'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'

interface Props {
  documentId: string
}

export function DownloadButton({ documentId }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch(`/api/documents/${documentId}/download-url`)
      if (!res.ok) return
      const { url } = await res.json()
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={12} />
      {loading ? '…' : 'Download'}
    </button>
  )
}
