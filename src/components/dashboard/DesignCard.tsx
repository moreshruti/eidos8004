'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { DesignMetadata } from '@/lib/types'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import { getIPFSUrl } from '@/lib/ipfs'
import { ethers } from 'ethers'

interface DesignCardProps {
  design: DesignMetadata
}

export default function DesignCard({ design }: DesignCardProps) {
  const { getAttributionsByDesign } = useAttributionValidator()
  const [attributionCount, setAttributionCount] = useState(0)
  const [earnings, setEarnings] = useState(0)
  const [imgError, setImgError] = useState(false)

  const formattedThreshold = ethers.formatEther(design.thresholdPrice)

  useEffect(() => {
    let cancelled = false

    async function fetchAttributions() {
      try {
        const attrs = await getAttributionsByDesign(design.tokenId)
        if (!cancelled) {
          setAttributionCount(attrs.length)
          const total = attrs.reduce(
            (sum, a) => sum + parseFloat(a.totalPaid),
            0
          )
          setEarnings(total)
        }
      } catch {
        // Silently fail - show 0s
      }
    }

    fetchAttributions()
    return () => {
      cancelled = true
    }
  }, [design.tokenId, getAttributionsByDesign])

  return (
    <Link href={`/dashboard/portfolio/${design.tokenId}`} className="block">
      <div className="group bg-c2/50 border border-c2 overflow-hidden transition-colors duration-200 hover:bg-c2/80 cursor-pointer">
        {design.ipfsCid && !imgError ? (
          <img
            src={getIPFSUrl(design.ipfsCid)}
            alt={design.title}
            onError={() => setImgError(true)}
            className="h-36 w-full object-cover"
          />
        ) : (
          <div className="construction-grid bg-c2 h-36" />
        )}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-semibold text-c12 text-sm leading-tight">
              {design.title}
            </h3>
            <span className="inline-flex shrink-0 items-center border border-c3 text-c7 text-[10px] font-mono uppercase px-2 py-0.5">
              {design.category}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {design.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center border border-c3 text-c7 text-[10px] font-mono px-1.5 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-c7 font-mono tabular-nums pt-3 border-t border-c2">
            <span>{formattedThreshold} ETH threshold</span>
            <span className="w-px h-3 bg-c2" />
            <span>{attributionCount} attributions</span>
            <span className="w-px h-3 bg-c2" />
            <span className="text-c12 font-medium">
              {earnings.toFixed(4)} ETH
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
