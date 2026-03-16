import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import UploadFlow from './UploadFlow'

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={24} className="text-brand-500 animate-spin" />
      </div>
    }>
      <UploadFlow />
    </Suspense>
  )
}
