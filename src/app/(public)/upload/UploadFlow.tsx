'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import FileDropzone from '@/components/documents/FileDropzone'
import { ShieldCheck, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'

interface DocType {
  id:          string
  name:        string
  slug:        string
  description: string | null
  category:    string
}

interface SessionData {
  sessionId:         string
  contractorName:    string
  contractorLogoUrl: string | null
  customMessage:     string | null
  prefilledName:     string | null
  prefilledEmail:    string | null
  requiredDocTypes:  DocType[]
  expiresAt:         string
}

type UploadStatus = 'pending' | 'uploaded' | 'error'

export default function UploadPage() {
  const searchParams = useSearchParams()
  const token        = searchParams.get('t')

  const [session,   setSession]   = useState<SessionData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [subEmail,  setSubEmail]  = useState('')
  const [subName,   setSubName]   = useState('')
  const [subCompany, setSubCompany] = useState('')
  const [step,      setStep]      = useState<'details' | 'upload' | 'done'>('details')
  const [statuses,  setStatuses]  = useState<Record<string, UploadStatus>>({})

  useEffect(() => {
    if (!token) {
      setLoadError('No upload token provided. Please use the link sent to your email.')
      setLoading(false)
      return
    }

    fetch(`/api/auth/upload-session/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setLoadError(data.error.message ?? 'Invalid or expired link')
        } else {
          setSession(data)
          setSubEmail(data.prefilledEmail ?? '')
          setSubName(data.prefilledName ?? '')
          const init: Record<string, UploadStatus> = {}
          data.requiredDocTypes.forEach((d: DocType) => { init[d.id] = 'pending' })
          setStatuses(init)
        }
      })
      .catch(() => setLoadError('Failed to load upload session'))
      .finally(() => setLoading(false))
  }, [token])

  function handleUploaded(docTypeId: string, _documentId: string) {
    setStatuses(prev => ({ ...prev, [docTypeId]: 'uploaded' }))
  }

  const allUploaded = session?.requiredDocTypes.every(d => statuses[d.id] === 'uploaded')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={24} className="text-brand-500 animate-spin" />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={22} className="text-red-500" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Link Invalid</h1>
          <p className="text-sm text-gray-500">{loadError}</p>
        </div>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Documents Submitted!</h1>
          <p className="text-sm text-gray-500">
            Your documents have been received by <strong>{session?.contractorName}</strong>.
            They will be reviewed shortly and you'll hear back by email.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-500">SubCompliant</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {session?.contractorName} requests your documents
          </h1>
          {session?.customMessage && (
            <p className="mt-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-3 mt-3 text-left italic">
              "{session.customMessage}"
            </p>
          )}
        </div>

        {/* Step 1: Your details */}
        {step === 'details' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Your details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={e => setSubName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={subEmail}
                  onChange={e => setSubEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company name</label>
                <input
                  type="text"
                  value={subCompany}
                  onChange={e => setSubCompany(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="ABC Electrical Ltd"
                />
              </div>
            </div>

            <button
              disabled={!subName || !subEmail}
              onClick={() => setStep('upload')}
              className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              Continue to Upload
            </button>
          </div>
        )}

        {/* Step 2: Upload documents */}
        {step === 'upload' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Upload {session?.requiredDocTypes.length} required document{session?.requiredDocTypes.length !== 1 ? 's' : ''}
            </div>

            {session?.requiredDocTypes.map(docType => (
              <div key={docType.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{docType.name}</h3>
                    {docType.description && (
                      <p className="text-xs text-gray-400 mt-0.5">{docType.description}</p>
                    )}
                  </div>
                  {statuses[docType.id] === 'uploaded'
                    ? <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    : <Clock size={16} className="text-gray-300 flex-shrink-0 mt-0.5" />
                  }
                </div>

                {statuses[docType.id] !== 'uploaded' && (
                  <FileDropzone
                    documentTypeId={docType.id}
                    documentTypeName={docType.name}
                    uploadToken={token ?? undefined}
                    onUploaded={docId => handleUploaded(docType.id, docId)}
                  />
                )}
              </div>
            ))}

            {allUploaded && (
              <button
                onClick={() => setStep('done')}
                className="w-full py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  Submit All Documents
                </span>
              </button>
            )}
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Secured by SubCompliant · Documents are encrypted and only visible to {session?.contractorName}
        </p>
      </div>
    </div>
  )
}
