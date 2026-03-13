'use client'

import { useEffect, useState } from 'react'
import { useWeb3 } from '@/context/Web3Context'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import { useDesignNFT } from '@/hooks/useDesignNFT'
import { useAgentRegistry } from '@/hooks/useAgentRegistry'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { ethers } from 'ethers'
import type { Attribution } from '@/lib/types'
import { withMockFallback } from '@/lib/mock-fallback'
import { mockAttributions } from '@/lib/mock-data'

const usageTypeLabels: Record<string, string> = {
  inspiration: 'Inspiration',
  direct_usage: 'Direct Use',
  training: 'Training',
}

function formatRelativeTime(timestamp: number): string {
  const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp
  const diff = Date.now() - ms
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 30) return `${Math.floor(days / 30)} months ago`
  if (days > 1) return `${days} days ago`
  if (days === 1) return 'Yesterday'
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} min ago`
  return 'Just now'
}

export default function RecentAttributions() {
  const { address, isConnected, chainId } = useWeb3()
  const { getAttributionsByDesigner } = useAttributionValidator()
  const { getDesign } = useDesignNFT()
  const { getAgent } = useAgentRegistry()

  const [attributions, setAttributions] = useState<Attribution[]>([])
  const [agentNames, setAgentNames] = useState<Map<string, string>>(new Map())
  const [designTitles, setDesignTitles] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setAttributions([])
      return
    }

    let cancelled = false

    async function fetchData() {
      setLoading(true)
      try {
        const attrs = await withMockFallback(
          () => getAttributionsByDesigner(address!),
          mockAttributions
        )
        const sorted = [...attrs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8)

        if (cancelled) return
        setAttributions(sorted)

        // Resolve unique agent names
        const uniqueAgents = Array.from(new Set(sorted.map((a) => a.agentAddress)))
        const agentMap = new Map<string, string>()
        await Promise.all(
          uniqueAgents.map(async (agentAddr) => {
            try {
              const agent = await getAgent(agentAddr)
              agentMap.set(agentAddr, agent.name)
            } catch {
              agentMap.set(agentAddr, `${agentAddr.slice(0, 6)}...${agentAddr.slice(-4)}`)
            }
          })
        )

        // Resolve unique design titles
        const uniqueDesigns = Array.from(new Set(sorted.map((a) => a.designId)))
        const designMap = new Map<number, string>()
        await Promise.all(
          uniqueDesigns.map(async (designId) => {
            try {
              const design = await getDesign(designId)
              designMap.set(designId, design.title)
            } catch {
              designMap.set(designId, `Design #${designId}`)
            }
          })
        )

        if (!cancelled) {
          setAgentNames(agentMap)
          setDesignTitles(designMap)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch attributions:', err)
          toast.error('Failed to load attributions')
          setAttributions([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [address, chainId, isConnected, getAttributionsByDesigner, getDesign, getAgent])

  if (loading) {
    return (
      <div className="border border-c2 overflow-hidden">
        <div className="px-6 py-4 border-b border-c2">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="px-6 py-3 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="border border-c2 overflow-hidden">
        <div className="px-6 py-4 border-b border-c2">
          <h3 className="font-semibold text-sm tracking-tight text-c11">Recent Attributions</h3>
        </div>
        <div className="flex items-center justify-center py-12 text-sm text-c5">
          Connect wallet to view attributions
        </div>
      </div>
    )
  }

  return (
    <div className="border border-c2 overflow-hidden">
      <div className="px-6 py-4 border-b border-c2">
        <h3 className="font-semibold text-sm tracking-tight text-c11">Recent Attributions</h3>
      </div>
      {attributions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-c6 font-mono text-[10px] uppercase tracking-[0.15em]">
                <th className="text-left px-6 py-3 font-medium">Agent</th>
                <th className="text-left px-6 py-3 font-medium hidden sm:table-cell">Design</th>
                <th className="text-left px-6 py-3 font-medium">Type</th>
                <th className="text-right px-6 py-3 font-medium">Amount</th>
                <th className="text-right px-6 py-3 font-medium hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {attributions.map((attr) => {
                const agentName =
                  agentNames.get(attr.agentAddress) ||
                  `${attr.agentAddress.slice(0, 6)}...${attr.agentAddress.slice(-4)}`
                const designTitle =
                  designTitles.get(attr.designId) || `Design #${attr.designId}`
                const formattedAmount = parseFloat(
                  ethers.formatEther(attr.royaltyAmount)
                ).toFixed(4)

                return (
                  <tr
                    key={attr.id}
                    className="border-t border-c2 hover:bg-c2/50 transition-colors"
                  >
                    <td className="px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="border border-c3 bg-c2 w-8 h-8 flex items-center justify-center text-[10px] font-medium text-c7 shrink-0">
                          {agentName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-c11">{agentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-c7 hidden sm:table-cell whitespace-nowrap max-w-[160px] truncate">
                      {designTitle}
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center border border-c3 text-c7 text-[10px] font-mono uppercase px-2 py-0.5">
                        {usageTypeLabels[attr.usageType] || attr.usageType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-c12 font-mono tabular-nums whitespace-nowrap">
                      {formattedAmount} ETH
                    </td>
                    <td className="px-6 py-3 text-right text-c6 hidden md:table-cell whitespace-nowrap">
                      {formatRelativeTime(attr.timestamp)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-c5">
          No attributions yet
        </div>
      )}
    </div>
  )
}
