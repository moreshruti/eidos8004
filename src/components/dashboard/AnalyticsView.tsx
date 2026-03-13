'use client'

import { useEffect, useState } from 'react'
import EarningsChart from './EarningsChart'
import { useWeb3 } from '@/context/Web3Context'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import { useAgentRegistry } from '@/hooks/useAgentRegistry'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { ethers } from 'ethers'
import type { Attribution } from '@/lib/types'
import { withMockFallback } from '@/lib/mock-fallback'
import { mockAttributions, mockAgents } from '@/lib/mock-data'

const usageTypeLabels: Record<string, string> = {
  inspiration: 'Inspiration',
  direct_usage: 'Direct Usage',
  training: 'Training',
}

interface BreakdownItem {
  type: string
  label: string
  count: number
  percentage: number
}

interface TopAgent {
  name: string
  total: number
  trustScore: number
}

interface GrowthData {
  current: number
  previous: number
  change: string
  isPositive: boolean
}

export default function AnalyticsView() {
  const { address, isConnected, chainId } = useWeb3()
  const { getAttributionsByDesigner } = useAttributionValidator()
  const { getAgent } = useAgentRegistry()

  const [breakdown, setBreakdown] = useState<BreakdownItem[]>([])
  const [topAgents, setTopAgents] = useState<TopAgent[]>([])
  const [growth, setGrowth] = useState<GrowthData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setBreakdown([])
      setTopAgents([])
      setGrowth(null)
      return
    }

    let cancelled = false

    async function fetchAnalytics() {
      setLoading(true)
      try {
        const attributions = await withMockFallback(
          () => getAttributionsByDesigner(address!),
          mockAttributions
        )

        if (cancelled) return

        // Attribution breakdown by type
        const total = attributions.length
        const byType = attributions.reduce(
          (acc, a) => {
            acc[a.usageType] = (acc[a.usageType] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        )

        const breakdownData = Object.entries(byType).map(([type, count]) => ({
          type,
          label: usageTypeLabels[type] || type,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        }))

        // Top agents: aggregate earnings by agent, resolve names
        const agentTotals = new Map<string, number>()
        for (const a of attributions) {
          const current = agentTotals.get(a.agentAddress) || 0
          agentTotals.set(
            a.agentAddress,
            current + parseFloat(ethers.formatEther(a.royaltyAmount))
          )
        }

        const agentEntries = Array.from(agentTotals.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)

        const topAgentsData: TopAgent[] = await Promise.all(
          agentEntries.map(async ([agentAddr, total]) => {
            const mockAgent = mockAgents.find((a) => a.address === agentAddr)
            const fallbackAgent = mockAgent || {
              name: `${agentAddr.slice(0, 6)}...${agentAddr.slice(-4)}`,
              trustScore: 0,
            }
            try {
              const agent = await withMockFallback(
                () => getAgent(agentAddr),
                { ...mockAgents[0], address: agentAddr, ...fallbackAgent } as Awaited<ReturnType<typeof getAgent>>
              )
              return { name: agent.name, total, trustScore: agent.trustScore }
            } catch {
              return {
                name: fallbackAgent.name,
                total,
                trustScore: fallbackAgent.trustScore,
              }
            }
          })
        )

        // Monthly growth
        const monthlyMap = new Map<string, number>()
        for (const attr of attributions) {
          const date = new Date(attr.timestamp * 1000)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          const amount = parseFloat(ethers.formatEther(attr.royaltyAmount))
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount)
        }

        const sortedMonths = Array.from(monthlyMap.entries()).sort((a, b) =>
          a[0].localeCompare(b[0])
        )

        let growthData: GrowthData | null = null
        if (sortedMonths.length >= 2) {
          const current = sortedMonths[sortedMonths.length - 1][1]
          const previous = sortedMonths[sortedMonths.length - 2][1]
          const change = previous > 0 ? ((current - previous) / previous) * 100 : 0
          growthData = {
            current,
            previous,
            change: change.toFixed(1),
            isPositive: change >= 0,
          }
        }

        if (!cancelled) {
          setBreakdown(breakdownData)
          setTopAgents(topAgentsData)
          setGrowth(growthData)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch analytics:', err)
          toast.error('Failed to load analytics')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAnalytics()
    return () => {
      cancelled = true
    }
  }, [address, chainId, isConnected, getAttributionsByDesigner, getAgent])

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <EarningsChart height={320} />
        <div className="flex items-center justify-center py-12 text-sm text-c6">
          Connect wallet to view analytics
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border border-c2 p-6">
          <Skeleton className="h-5 w-40 mb-2" />
          <Skeleton className="h-3 w-56 mb-6" />
          <Skeleton className="h-80 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-c2 p-6">
              <Skeleton className="h-5 w-32 mb-5" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Larger chart */}
      <EarningsChart height={320} />

      {/* Three card row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Attribution by Type */}
        <div className="border border-c2 p-6">
          <h3 className="text-xs text-c7 uppercase tracking-wider font-medium font-mono mb-5">Attribution by Type</h3>
          {breakdown.length > 0 ? (
            <div className="space-y-4">
              {breakdown.map((item) => (
                <div key={item.type}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-c8">{item.label}</span>
                    <span className="text-sm font-semibold tracking-tight text-c12 font-mono tabular-nums">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="bg-c3 h-1.5 overflow-hidden">
                    <div
                      className="bg-c8 h-1.5 transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-c6">No attributions yet</p>
          )}
        </div>

        {/* Top Agents */}
        <div className="border border-c2 p-6">
          <h3 className="text-xs text-c7 uppercase tracking-wider font-medium font-mono mb-5">Top Agents</h3>
          {topAgents.length > 0 ? (
            <div className="space-y-4">
              {topAgents.map((agent, i) => (
                <div
                  key={agent.name}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 border border-c3 bg-c2 flex items-center justify-center text-xs font-medium text-c8 shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-c12 truncate">
                      {agent.name}
                    </p>
                    <p className="text-xs text-c7">
                      Trust: {agent.trustScore}%
                    </p>
                  </div>
                  <span className="text-sm font-semibold tracking-tight text-c12 font-mono tabular-nums shrink-0">
                    {agent.total.toFixed(4)} ETH
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-c6">No agent data yet</p>
          )}
        </div>

        {/* Monthly Growth */}
        <div className="border border-c2 p-6">
          <h3 className="text-xs text-c7 uppercase tracking-wider font-medium font-mono mb-5">Monthly Growth</h3>
          {growth ? (
            <div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-semibold tracking-tight font-mono tabular-nums">
                  {growth.change}%
                </span>
                <span
                  className={`text-sm font-medium ${
                    growth.isPositive ? 'text-c11' : 'text-c7'
                  }`}
                >
                  {growth.isPositive ? 'increase' : 'decrease'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-c7">This month</span>
                  <span className="text-c12 font-semibold tracking-tight font-mono tabular-nums">
                    {growth.current.toFixed(4)} ETH
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-c7">Last month</span>
                  <span className="text-c8 font-mono tabular-nums">
                    {growth.previous.toFixed(4)} ETH
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-c6">
              Not enough data for comparison
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
