'use client'

import AnalyticsView from '@/components/dashboard/AnalyticsView'

export default function AnalyticsPage() {
  return (
    <div>
      {/* Header */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <h1 className="text-2xl font-pixel uppercase tracking-tight text-c11">Analytics</h1>
          <p className="font-mono text-c5 text-sm mt-1">
            Track your earnings and attribution metrics
          </p>
        </div>
      </section>

      {/* Analytics */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <AnalyticsView />
        </div>
      </section>
    </div>
  )
}
