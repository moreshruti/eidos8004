'use client'

import StatsOverview from '@/components/dashboard/StatsOverview'
import RoyaltyClaim from '@/components/dashboard/RoyaltyClaim'
import EarningsChart from '@/components/dashboard/EarningsChart'
import RecentAttributions from '@/components/dashboard/RecentAttributions'
import TopDesigns from '@/components/dashboard/TopDesigns'

export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <h1 className="text-2xl font-pixel uppercase tracking-tight text-c11">Dashboard</h1>
          <p className="font-mono text-c5 text-sm mt-1">Welcome back, designer</p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <StatsOverview />
        </div>
      </section>

      {/* Royalty Claim */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <RoyaltyClaim />
        </div>
      </section>

      {/* Chart + Attributions */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <EarningsChart />
            </div>
            <div className="xl:col-span-1">
              <RecentAttributions />
            </div>
          </div>
        </div>
      </section>

      {/* Top Designs */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <TopDesigns />
        </div>
      </section>
    </div>
  )
}
