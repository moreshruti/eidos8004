'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useWeb3 } from '@/context/Web3Context'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { withMockFallback } from '@/lib/mock-fallback'
import { mockAttributions } from '@/lib/mock-data'

interface EarningsChartProps {
  height?: number
}

interface MonthlyData {
  month: string
  amount: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-c1 border border-c3 px-4 py-3">
      <p className="text-xs text-c7 mb-1">{label}</p>
      <p className="text-sm font-semibold font-mono text-c12 tabular-nums">
        {payload[0].value.toFixed(4)} ETH
      </p>
    </div>
  )
}

export default function EarningsChart({ height = 300 }: EarningsChartProps) {
  const { address, isConnected, chainId } = useWeb3()
  const { getAttributionsByDesigner } = useAttributionValidator()
  const [chartData, setChartData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setChartData([])
      return
    }

    let cancelled = false

    async function fetchEarnings() {
      setLoading(true)
      try {
        const attributions = await withMockFallback(
          () => getAttributionsByDesigner(address!),
          mockAttributions
        )

        // Group by month from timestamp, sum totalPaid per month
        const monthlyMap = new Map<string, number>()
        for (const attr of attributions) {
          const date = new Date(attr.timestamp * 1000)
          const monthKey = `${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`
          const amount = parseFloat(attr.totalPaid)
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount)
        }

        // Sort by date
        const sorted = Array.from(monthlyMap.entries())
          .sort((a, b) => {
            const dateA = new Date(a[0])
            const dateB = new Date(b[0])
            return dateA.getTime() - dateB.getTime()
          })
          .map(([month, amount]) => ({ month, amount }))

        if (!cancelled) {
          setChartData(sorted)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch earnings:', err)
          toast.error('Failed to load earnings data')
          setChartData([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchEarnings()
    return () => {
      cancelled = true
    }
  }, [address, chainId, isConnected, getAttributionsByDesigner])

  if (loading) {
    return (
      <div className="border border-c2 p-6">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-3 w-56 mb-6" />
        <div style={{ height }}>
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="border border-c2 p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-sm tracking-tight text-c12">Earnings Over Time</h3>
          <p className="text-xs text-c7 mt-1">Connect wallet to view earnings</p>
        </div>
        <div
          className="flex items-center justify-center text-sm text-c7"
          style={{ height }}
        >
          No data available
        </div>
      </div>
    )
  }

  return (
    <div className="border border-c2 p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-sm tracking-tight text-c12">Earnings Over Time</h3>
        <p className="text-xs text-c7 mt-1">Monthly ETH earnings from attributions</p>
      </div>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--c3)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--c3)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--c2)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--c5)', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--c5)', fontSize: 12 }}
              dx={-8}
              tickFormatter={(value: number) => `${value} ETH`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--c8)"
              strokeWidth={2}
              fill="url(#earningsGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div
          className="flex items-center justify-center text-sm text-c7"
          style={{ height }}
        >
          No earnings data yet
        </div>
      )}
    </div>
  )
}
