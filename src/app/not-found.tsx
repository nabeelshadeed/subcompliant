import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldCheck size={26} className="text-brand-600" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-1">404</h1>
        <p className="text-base font-semibold text-gray-700 mb-1">Page not found</p>
        <p className="text-sm text-gray-500 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
