import { SignIn } from '@clerk/nextjs'
import { ShieldCheck } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-600 rounded-xl mb-4">
            <ShieldCheck className="text-white" size={22} />
          </div>
          <h1 className="text-2xl font-bold text-white">SubCompliant</h1>
          <p className="text-slate-400 text-sm mt-1">Subcontractor compliance management</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox:         'w-full',
              card:            'rounded-2xl shadow-2xl border border-white/10',
              headerTitle:     'text-gray-900 font-bold',
              formButtonPrimary: 'bg-brand-600 hover:bg-brand-700 text-sm font-medium',
              footerActionLink:  'text-brand-600 hover:text-brand-700',
            }
          }}
          redirectUrl="/dashboard"
          signUpUrl="/auth/sign-up"
        />
      </div>
    </div>
  )
}
