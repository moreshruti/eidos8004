'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/context/Web3Context'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import { withMockFallback } from '@/lib/mock-fallback'
import { mockAttributions } from '@/lib/mock-data'

export default function RoyaltyClaim() {
  const { address, isConnected } = useWeb3()
  const { getAttributionsByDesigner, totalDistributed } = useAttributionValidator()
  const [totalEarned, setTotalEarned] = useState<string | null>(null)
  const [attributionCount, setAttributionCount] = useState(0)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setTotalEarned(null)
      setAttributionCount(0)
      return
    }

    let cancelled = false

    async function fetchEarnings() {
      setFetching(true)
      try {
        const [attributions, distributed] = await Promise.all([
          withMockFallback(
            () => getAttributionsByDesigner(address!),
            mockAttributions
          ),
          withMockFallback(() => totalDistributed(), '1.55'),
        ])

        if (!cancelled) {
          const earned = attributions.reduce(
            (sum, a) => sum + parseFloat(a.totalPaid),
            0
          )
          setTotalEarned(earned.toFixed(4))
          setAttributionCount(attributions.length)
        }
      } catch {
        if (!cancelled) {
          setTotalEarned(null)
          setAttributionCount(0)
        }
      } finally {
        if (!cancelled) setFetching(false)
      }
    }

    fetchEarnings()

    return () => {
      cancelled = true
    }
  }, [isConnected, address, getAttributionsByDesigner, totalDistributed])

  if (!isConnected) {
    return (
      <p className="font-mono text-sm text-c5">
        Connect wallet to view earnings
      </p>
    )
  }

  if (fetching || totalEarned === null) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-c5">
            Total Earned
          </p>
          <div className="mt-1 h-8 w-32 animate-pulse bg-c3 rounded" />
        </div>
        <div className="h-9 w-36 animate-pulse bg-c3 rounded" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-c5">
          Total Earned
        </p>
        <p className="text-2xl font-mono text-c12 tabular-nums mt-1">
          {totalEarned} <span className="text-sm text-c5">ETH</span>
        </p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-c5">
          Attributions
        </p>
        <p className="text-2xl font-mono text-c12 tabular-nums mt-1">
          {attributionCount}
        </p>
      </div>
    </div>
  )
}
