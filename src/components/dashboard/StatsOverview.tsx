'use client'

import { useEffect, useState } from 'react'
import { useWeb3 } from '@/context/Web3Context'
import { useDesignNFT } from '@/hooks/useDesignNFT'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { withMockFallback } from '@/lib/mock-fallback'
import { mockAttributions } from '@/lib/mock-data'

interface Stats {
  totalEarnings: string
  activeDesigns: number
  totalAttributions: number
  uniqueAgents: number
}

export default function StatsOverview() {
  const { address, isConnected, chainId } = useWeb3()
  const { getDesignerPortfolio } = useDesignNFT()
  const { getAttributionsByDesigner, totalDistributed } = useAttributionValidator()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setStats(null)
      return
    }

    let cancelled = false

    async function fetchStats() {
      setLoading(true)
      try {
        const [tokenIds, attributions, balance] = await Promise.all([
          withMockFallback(() => getDesignerPortfolio(address!), [1, 2, 3, 4, 5, 6, 7, 8]),
          withMockFallback(() => getAttributionsByDesigner(address!), mockAttributions),
          withMockFallback(() => totalDistributed(), '1.55'),
        ])

        const uniqueAgentSet = new Set(attributions.map((a) => a.clientAgent))

        if (!cancelled) {
          setStats({
            totalEarnings: balance,
            activeDesigns: tokenIds.length,
            totalAttributions: attributions.length,
            uniqueAgents: uniqueAgentSet.size,
          })
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch stats:', err)
          toast.error('Failed to load stats')
          setStats({
            totalEarnings: '0',
            activeDesigns: 0,
            totalAttributions: 0,
            uniqueAgents: 0,
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchStats()
    return () => {
      cancelled = true
    }
  }, [address, chainId, isConnected, getDesignerPortfolio, getAttributionsByDesigner, totalDistributed])

  const statItems = [
    {
      label: 'Total Earnings',
      value: stats ? `${stats.totalEarnings} ETH` : '0 ETH',
    },
    {
      label: 'Active Designs',
      value: stats ? stats.activeDesigns.toString() : '0',
    },
    {
      label: 'Total Attributions',
      value: stats ? stats.totalAttributions.toString() : '0',
    },
    {
      label: 'Unique Agents',
      value: stats ? stats.uniqueAgents.toString() : '0',
    },
  ]

  if (!isConnected) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 sm:divide-x sm:divide-c2">
        {statItems.map((stat) => (
          <div key={stat.label} className="text-center py-8">
            <p className="text-2xl font-semibold text-c7 tabular-nums tracking-tight font-mono">--</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-c6 font-mono">{stat.label}</p>
            <p className="mt-2 text-xs text-c7">Connect wallet</p>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 sm:divide-x sm:divide-c2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center py-8 gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 sm:divide-x sm:divide-c2">
      {statItems.map((stat) => (
        <div key={stat.label} className="text-center py-8">
          <p className="text-2xl font-semibold text-c12 tabular-nums tracking-tight font-mono">{stat.value}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-c6 font-mono">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
