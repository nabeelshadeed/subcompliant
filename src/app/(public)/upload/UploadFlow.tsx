'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import FileDropzone from '@/components/documents/FileDropzone'
import { ShieldCheck, CheckCircle2, XCircle, Clock, Loader2, RefreshCw, Mail } from 'lucide-react'

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
type ErrorCode = 'SESSION_EXPIRED' | 'SESSION_COMPLETED' | 'SESSION_NOT_FOUND' | 'NO_TOKEN' | 'NETWORK' | string

interface LoadError {
  code:    ErrorCode
  message: string
}

export default function UploadPage() {
  const searchParams = useSearchParams()
  const token        = searchParams.get('t')

  const [session,    setSession]    = useState<SessionData | null>(null)
  const [loadError,  setLoadError]  = useState<LoadError | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [subEmail,   setSubEmail]   = useState('')
  const [subName,    setSubName]    = useState('')
  const [subCompany, setSubCompany] = useState('')
  const [step,       setStep]       = useState<'details' | 'upload' | 'done'>('details')
  const [statuses,   setStatuses]   = useState<Record<string, UploadStatus>>({})
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    if (!token) {
      setLoadError({ code: 'NO_TOKEN', message: 'No upload token provided.' })
      setLoading(false)
      return
    }

    fetch(`/api/auth/upload-session/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setLoadError({ code: data.error.code ?? 'UNKNOWN', message: data.error.message ?? 'Invalid or expired link' })
        } else {
          setSession(data)
          setSubEmail(data.prefilledEmail ?? '')
          setSubName(data.prefilledName ?? '')
          const init: Record<string, UploadStatus> = {}
          data.requiredDocTypes.forEach((d: DocType) => { init[d.id] = 'pending' })
          setStatuses(init)
        }
      })
      .catch(() => setLoadError({ code: 'NETWORK', message: 'Could not reach the server. Check your connection and try again.' }))
      .finally(() => setLoading(false))
  }, [token])

  function handleUploaded(docTypeId: string) {
    setStatuses(prev => ({ ...prev, [docTypeId]: 'uploaded' }))
  }

  function handleContinue() {
    if (!subName.trim() || !subEmail.trim()) {
      setShowErrors(true)
      return
    }
    setStep('upload')
  }

  const allUploaded = session?.requiredDocTypes.every(d => statuses[d.id] === 'uploaded')

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={24} className="text-brand-500 animate-spin" />
      </div>
    )
  }

  // ── Error states — each has a distinct message + recovery action ───────────
  if (loadError) {
    if (loadError.code === 'SESSION_COMPLETED') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={26} className="text-green-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">Documents already submitted</h1>
            <p className="text-sm text-gray-500">
              You've already uploaded documents via this link. Your contractor will review them and contact you if anything is needed.
            </p>
          </div>
        </div>
      )
    }

    if (loadError.code === 'SESSION_EXPIRED') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={26} className="text-amber-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">This link has expired</h1>
            <p className="text-sm text-gray-500 mb-5">
              Upload links are valid for 72 hours. Ask your contractor to send you a new one.
            </p>
            <a
              href={`mailto:?subject=Please%20send%20a%20new%20upload%20link&body=Hi%2C%20the%20upload%20link%20you%20sent%20has%20expired.%20Could%20you%20please%20send%20a%20new%20one%3F`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Mail size={14} />
              Email your contractor
            </a>
          </div>
        </div>
      )
    }

    if (loadError.code === 'NETWORK') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw size={26} className="text-gray-500" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-2">Connection error</h1>
            <p className="text-sm text-gray-500 mb-5">{loadError.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        </div>
      )
    }

    // SESSION_NOT_FOUND or unknown
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle size={26} className="text-red-500" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">Link not found</h1>
          <p className="text-sm text-gray-500">
            This upload link doesn't exist or was never created. Please use the exact link from your invitation email, or ask your contractor to resend it.
          </p>
        </div>
      </div>
    )
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Documents submitted!</h1>
          <p className="text-sm text-gray-500 mb-4">
            <strong>{session?.contractorName}</strong> has received your documents and will review them shortly. You'll get an email if anything needs attention.
          </p>
          <div className="mt-4 bg-gray-50 rounded-xl p-4 text-left space-y-1.5">
            {session?.requiredDocTypes.map(d => (
              <div key={d.id} className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Main upload flow ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-5">
        {/* Brand header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-500">SubCompliant</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            {session?.contractorName} needs your documents
          </h1>
          {session?.customMessage && (
            <p className="mt-3 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-3 text-left italic">
              "{session.customMessage}"
            </p>
          )}
        </div>

        {/* Step 1: Details */}
        {step === 'details' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
              <h2 className="text-sm font-semibold text-gray-900">Your details</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subName}
                  onChange={e => { setSubName(e.target.value); setShowErrors(false) }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    showErrors && !subName.trim() ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="John Smith"
                />
                {showErrors && !subName.trim() && (
                  <p className="mt-1 text-xs text-red-600">Please enter your full name</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={subEmail}
                  onChange={e => { setSubEmail(e.target.value); setShowErrors(false) }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    showErrors && !subEmail.trim() ? 'border-red-400 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="you@example.com"
                />
                {showErrors && !subEmail.trim() && (
                  <p className="mt-1 text-xs text-red-600">Please enter your email address</p>
                )}
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
              onClick={handleContinue}
              className="w-full py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
            >
              Continue to Upload →
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

                {statuses[docType.id] !== 'uploaded' ? (
                  <FileDropzone
                    documentTypeId={docType.id}
                    documentTypeName={docType.name}
                    uploadToken={token ?? undefined}
                    subName={subName}
                    subEmail={subEmail}
                    subCompany={subCompany}
                    onUploaded={() => handleUploaded(docType.id)}
                  />
                ) : (
                  <p className="text-xs text-green-600 font-medium">✓ Uploaded</p>
                )}
              </div>
            ))}

            {allUploaded && (
              <button
                onClick={() => setStep('done')}
                className="w-full py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} />
                Submit All Documents
              </button>
            )}

            <button
              onClick={() => setStep('details')}
              className="w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back to details
            </button>
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Secured by SubCompliant · Documents are encrypted and only visible to {session?.contractorName}
        </p>
      </div>
    </div>
  )
}
