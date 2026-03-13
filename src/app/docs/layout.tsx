'use client'

import { Footer } from '@/components/layout/Footer'
import { FlowPulse } from '@/components/ui/FlowPulse'
import { NetworkBanner } from '@/components/ui/NetworkBanner'

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-c1 relative overflow-x-hidden">
      <NetworkBanner />

      {/* Vertical guide lines */}
      <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">
        <div className="max-w-[960px] mx-auto h-full relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-c2 flow-line-v" />
          <div className="absolute right-6 top-0 bottom-0 w-px bg-c2 flow-line-v" />
        </div>
      </div>

      {/* Content column */}
      <div className="max-w-[960px] mx-auto px-6">
        {children}
      </div>

      <Footer />
      <FlowPulse />
    </div>
  )
}
