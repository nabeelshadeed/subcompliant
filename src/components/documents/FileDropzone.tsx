'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'

interface DropzoneProps {
  documentTypeId:   string
  documentTypeName: string
  onUploaded?:      (documentId: string) => void
  uploadToken?:     string   // magic-link mode
  profileId?:       string   // authenticated mode
  subName?:         string   // passed in magic-link mode
  subEmail?:        string
  subCompany?:      string
  className?:       string
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg':      ['.jpg', '.jpeg'],
  'image/png':       ['.png'],
  'image/webp':      ['.webp'],
  'image/heic':      ['.heic', '.heif'],
}

function friendlyError(code: string | undefined, message: string): string {
  switch (code) {
    case 'DUPLICATE_FILE':
      return 'This exact file was already uploaded. Upload a different version if you need to replace it.'
    case 'LINK_USED':
      return 'This upload link has already been used. Ask your contractor for a new one.'
    case 'FILE_TOO_LARGE':
      return 'File is too large. Maximum size is 25 MB.'
    case 'INVALID_FILE_TYPE':
      return 'Unsupported file type. Please upload a PDF, JPG, PNG, WebP, or HEIC file.'
    case 'RATE_LIMITED':
      return 'Too many uploads in a short time. Please wait a minute and try again.'
    default:
      return message || 'Upload failed. Please try again.'
  }
}

export default function FileDropzone({
  documentTypeId, documentTypeName, onUploaded,
  uploadToken, profileId,
  subName, subEmail, subCompany,
  className,
}: DropzoneProps) {
  const [state,    setState]    = useState<UploadState>('idle')
  const [file,     setFile]     = useState<File | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0]
    if (!f) return

    setFile(f)
    setState('uploading')
    setErrorMsg(null)

    try {
      const form = new FormData()
      form.append('file', f)
      form.append('documentTypeId', documentTypeId)

      const url = uploadToken
        ? `/api/documents/upload?t=${uploadToken}`
        : `/api/documents/upload?profileId=${profileId}`

      const headers: Record<string, string> = {}
      if (subEmail)   headers['x-sub-email']   = subEmail
      if (subName)    headers['x-sub-name']     = subName
      if (subCompany) headers['x-sub-company']  = subCompany

      const res  = await fetch(url, { method: 'POST', body: form, headers })
      const data = await res.json()

      if (!res.ok) {
        setState('error')
        setErrorMsg(friendlyError(data.error?.code, data.error?.message))
        return
      }

      setState('success')
      onUploaded?.(data.documentId)
    } catch {
      setState('error')
      setErrorMsg('Connection error — please check your internet and try again.')
    }
  }, [documentTypeId, uploadToken, profileId, subName, subEmail, subCompany, onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:   ACCEPTED_TYPES,
    maxSize:  25 * 1024 * 1024,
    maxFiles: 1,
    disabled: state === 'uploading' || state === 'success',
    onDropRejected: (rejections) => {
      const err = rejections[0]?.errors[0]
      if (err?.code === 'file-too-large')     setErrorMsg('File is too large. Maximum size is 25 MB.')
      else if (err?.code === 'file-invalid-type') setErrorMsg('Unsupported file type. Please use PDF, JPG, PNG, WebP, or HEIC.')
      else                                     setErrorMsg('Could not add file. Please try again.')
      setState('error')
    },
  })

  function reset() {
    setFile(null)
    setState('idle')
    setErrorMsg(null)
  }

  if (state === 'uploading') {
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText size={16} className="text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file?.name}</p>
            <p className="text-xs text-gray-400">{file ? formatBytes(file.size) : ''} · Uploading…</p>
          </div>
          <Loader2 size={16} className="text-brand-500 animate-spin flex-shrink-0" />
        </div>
        {/* Animated indeterminate progress */}
        <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full animate-progress-indeterminate" />
        </div>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="border border-green-200 rounded-xl p-4 bg-green-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={16} className="text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-green-900 truncate">{file?.name}</p>
            <p className="text-xs text-green-600">Uploaded successfully</p>
          </div>
          <button
            onClick={reset}
            title="Replace this file"
            className="p-1.5 hover:bg-green-100 rounded-lg transition-colors text-green-600"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-brand-400 bg-brand-50'
            : state === 'error'
            ? 'border-red-300 bg-red-50'
            : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud size={28} className={cn(
          'mx-auto mb-2',
          isDragActive ? 'text-brand-500' : state === 'error' ? 'text-red-400' : 'text-gray-400'
        )} />
        <p className="text-sm font-medium text-gray-700">
          {isDragActive ? 'Drop to upload' : `Upload ${documentTypeName}`}
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, HEIC · up to 25 MB</p>

        {errorMsg && (
          <div className="mt-3 flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-left">
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{errorMsg}</span>
            <button
              onClick={e => { e.stopPropagation(); reset() }}
              className="underline whitespace-nowrap flex-shrink-0"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
