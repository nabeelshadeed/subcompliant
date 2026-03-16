'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'

interface DropzoneProps {
  documentTypeId:  string
  documentTypeName: string
  onUploaded?:     (documentId: string) => void
  uploadToken?:    string  // for magic-link mode
  profileId?:      string  // for authenticated mode
  className?:      string
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

export default function FileDropzone({
  documentTypeId, documentTypeName, onUploaded, uploadToken, profileId, className
}: DropzoneProps) {
  const [state,    setState]    = useState<UploadState>('idle')
  const [file,     setFile]     = useState<File | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(async (accepted: File[]) => {
    const f = accepted[0]
    if (!f) return

    setFile(f)
    setState('uploading')
    setProgress(0)
    setErrorMsg(null)

    try {
      const form = new FormData()
      form.append('file', f)
      form.append('documentTypeId', documentTypeId)

      const url = uploadToken
        ? `/api/documents/upload?t=${uploadToken}`
        : `/api/documents/upload?profileId=${profileId}`

      const res = await fetch(url, { method: 'POST', body: form })
      const data = await res.json()

      if (!res.ok) {
        setState('error')
        setErrorMsg(data.error?.message ?? 'Upload failed')
        return
      }

      setState('success')
      setProgress(100)
      onUploaded?.(data.documentId)
    } catch {
      setState('error')
      setErrorMsg('Network error — please try again')
    }
  }, [documentTypeId, uploadToken, profileId, onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg':      ['.jpg', '.jpeg'],
      'image/png':       ['.png'],
      'image/webp':      ['.webp'],
    },
    maxSize: 25 * 1024 * 1024,
    maxFiles: 1,
    disabled: state === 'uploading' || state === 'success',
  })

  function reset() {
    setFile(null)
    setState('idle')
    setErrorMsg(null)
    setProgress(0)
  }

  return (
    <div className={cn('w-full', className)}>
      {state === 'idle' || state === 'error' ? (
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
            isDragActive ? 'text-brand-500' : 'text-gray-400'
          )} />
          <p className="text-sm font-medium text-gray-700">
            {isDragActive ? 'Drop to upload' : `Upload ${documentTypeName}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 25 MB</p>
          {errorMsg && (
            <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle size={13} />
              {errorMsg}
              <button onClick={e => { e.stopPropagation(); reset() }} className="ml-auto underline">Retry</button>
            </div>
          )}
        </div>
      ) : state === 'uploading' ? (
        <div className="border border-gray-200 rounded-xl p-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={16} className="text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file?.name}</p>
              <p className="text-xs text-gray-400">{file ? formatBytes(file.size) : ''}</p>
            </div>
            <Loader2 size={16} className="text-brand-500 animate-spin flex-shrink-0" />
          </div>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-300"
              style={{ width: '60%' }}  // indeterminate
            />
          </div>
        </div>
      ) : (
        <div className="border border-green-200 rounded-xl p-4 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={16} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-900 truncate">{file?.name}</p>
              <p className="text-xs text-green-600">Uploaded — processing in background</p>
            </div>
            <button onClick={reset} className="p-1 hover:bg-green-100 rounded transition-colors">
              <X size={14} className="text-green-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
