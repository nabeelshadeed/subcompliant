import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import TopBar  from '@/components/layout/TopBar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let userId: string | null = null
  try {
    const authResult = await auth()
    userId = authResult.userId
  } catch {
    redirect('/auth/sign-in')
  }
  if (!userId) redirect('/auth/sign-in')

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#0A0A0A]">
          {children}
        </main>
      </div>
    </div>
  )
}
