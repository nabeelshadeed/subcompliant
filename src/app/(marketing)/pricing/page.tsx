import type { Metadata } from 'next'
import PricingContent from './PricingContent'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'SubCompliant pricing. Starter from £39/month. Pro from £79/month. Business from £149/month. 14-day free trial on all plans. No credit card required.',
}

export default function PricingPage() {
  return (
    <main>
      <PricingContent />
    </main>
  )
}
