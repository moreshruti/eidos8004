'use client'

import { useEffect, useState } from 'react'
import { useWeb3 } from '@/context/Web3Context'
import { useDesignNFT } from '@/hooks/useDesignNFT'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import { Skeleton } from '@/components/ui/Skeleton'
import toast from 'react-hot-toast'
import { ethers } from 'ethers'
import type { DesignMetadata } from '@/lib/types'
import { withMockFallback } from '@/lib/mock-fallback'
import { mockDesigns, mockAttributions } from '@/lib/mock-data'

interface DesignWithEarnings extends DesignMetadata {
  earnings: number
  attributionCount: number
}

export default function TopDesigns() {
  const { address, isConnected, chainId } = useWeb3()
  const { getDesignerPortfolio, getDesign } = useDesignNFT()
  const { getAttributionsByDesign } = useAttributionValidator()

  const [designs, setDesigns] = useState<DesignWithEarnings[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setDesigns([])
      return
    }

    let cancelled = false

    async function fetchTopDesigns() {
      setLoading(true)
      try {
        const tokenIds = await withMockFallback(
          () => getDesignerPortfolio(address!),
          mockDesigns.map((d) => d.tokenId)
        )

        const designsWithEarnings = await Promise.all(
          tokenIds.map(async (tokenId) => {
            const mockDesign = mockDesigns.find((d) => d.tokenId === tokenId) || mockDesigns[0]
            const mockDesignAttributions = mockAttributions.filter((a) => a.designId === tokenId)

            const [design, attributions] = await Promise.all([
              withMockFallback(() => getDesign(tokenId), mockDesign),
              withMockFallback(() => getAttributionsByDesign(tokenId), mockDesignAttributions),
            ])

            const earnings = attributions.reduce(
              (sum, a) =>
                sum + parseFloat(ethers.formatEther(a.royaltyAmount)),
              0
            )

            return {
              ...design,
              earnings,
              attributionCount: attributions.length,
            }
          })
        )

        const sorted = designsWithEarnings
          .sort((a, b) => b.earnings - a.earnings)
          .slice(0, 5)

        if (!cancelled) {
          setDesigns(sorted)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch top designs:', err)
          toast.error('Failed to load top designs')
          setDesigns([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchTopDesigns()
    return () => {
      cancelled = true
    }
  }, [address, chainId, isConnected, getDesignerPortfolio, getDesign, getAttributionsByDesign])

  if (loading) {
    return (
      <div className="border border-c2 overflow-hidden">
        <div className="px-6 py-4 border-b border-c2">
          <Skeleton className="h-5 w-24" />
        </div>
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex items-center gap-4 px-6 py-4${i > 0 ? ' border-t border-c2' : ''}`}>
              <Skeleton className="w-10 h-10" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="text-right">
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
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
          <h3 className="font-semibold text-sm tracking-tight text-c11">Top Designs</h3>
        </div>
        <div className="flex items-center justify-center py-12 text-sm text-c5">
          Connect wallet to view top designs
        </div>
      </div>
    )
  }

  return (
    <div className="border border-c2 overflow-hidden">
      <div className="px-6 py-4 border-b border-c2">
        <h3 className="font-semibold text-sm tracking-tight text-c11">Top Designs</h3>
      </div>
      {designs.length > 0 ? (
        <div>
          {designs.map((design, i) => (
            <div
              key={design.tokenId}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-c2/50 transition-colors${i > 0 ? ' border-t border-c2' : ''}`}
            >
              <div className="bg-c2 border border-c3 w-10 h-10 flex items-center justify-center font-mono text-c5 text-sm shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-c11 truncate">
                  {design.title}
                </p>
                <p className="text-c6 font-mono text-xs">{design.category}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium text-c12 font-mono tabular-nums">
                  {design.earnings.toFixed(4)} ETH
                </p>
                <p className="text-xs text-c6">
                  {design.attributionCount} attribution{design.attributionCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-12 text-sm text-c5">
          No designs yet
        </div>
      )}
    </div>
  )
}
