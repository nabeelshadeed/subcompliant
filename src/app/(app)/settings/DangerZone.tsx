'use client'

import { useState } from 'react'
import { AlertTriangle, Download, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function DangerZone({ isOwner }: { isOwner: boolean }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const res = await fetch('/api/account/export')
      if (!res.ok) { setDeleteError('Export failed. Please try again.'); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `subcompliant-export-${new Date().toISOString().slice(0,10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setDeleteError('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/account/delete', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ confirm: 'DELETE' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setDeleteError(data.error?.message ?? 'Failed to delete account')
        return
      }
      // Redirect to sign-out / homepage after deletion
      window.location.href = '/auth/sign-in'
    } catch {
      setDeleteError('Network error. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="card p-5 space-y-4">
      {/* Data export */}
      <div className="flex items-center justify-between py-2 border-b border-white/10">
        <div>
          <p className="text-sm font-medium text-white">Export your data</p>
          <p className="text-xs text-white/50 mt-0.5">Download a CSV of all subcontractors and documents</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/80 border border-white/20 rounded-lg hover:bg-white/10 disabled:opacity-50 transition-colors"
        >
          <Download size={13} />
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Account deletion */}
      {isOwner && (
        <div>
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">Delete account</p>
              <p className="text-xs text-white/50 mt-0.5">
                Permanently deletes your organisation, all subcontractor data, and cancels your subscription. This cannot be undone.
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="mb-3 text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              {deleteError}
            </div>
          )}

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={13} />
              Delete Account
            </button>
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg space-y-3">
              <p className="text-sm font-medium text-red-300">Are you absolutely sure?</p>
              <p className="text-xs text-white/60">All data will be permanently deleted. This action cannot be reversed.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors',
                    deleting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {deleting ? 'Deleting…' : 'Yes, permanently delete'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-xs font-medium text-white/70 border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
