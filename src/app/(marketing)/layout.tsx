import { MarketingLayout } from '@/components/MarketingLayout'
import '../marketing.css'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mp">
      <MarketingLayout>{children}</MarketingLayout>
    </div>
  )
}
