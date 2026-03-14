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
      <div className="mb-6">
        <h1 className="text-2xl font-pixel uppercase tracking-tight text-c11">Dashboard</h1>
        <p className="font-mono text-c5 text-sm mt-1">Welcome back, designer</p>
      </div>

      {/* Stats */}
      <div className="border border-c2">
        <StatsOverview />
      </div>

      {/* Royalty Claim */}
      <div className="mt-6">
        <RoyaltyClaim />
      </div>

      {/* Chart + Attributions */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <EarningsChart />
        </div>
        <div className="xl:col-span-1">
          <RecentAttributions />
        </div>
      </div>

      {/* Top Designs */}
      <div className="mt-6">
        <TopDesigns />
      </div>
    </div>
  )
}
