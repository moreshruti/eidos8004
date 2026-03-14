'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ethers } from 'ethers'
import { useWeb3 } from '@/context/Web3Context'
import { useDesignNFT } from '@/hooks/useDesignNFT'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import { useAgentRegistry } from '@/hooks/useAgentRegistry'
import { getIPFSUrl } from '@/lib/ipfs'
import type { DesignMetadata, Attribution } from '@/lib/types'

function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function truncateAddress(address: string): string {
  if (address.length <= 13) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function DesignDetailPage() {
  const params = useParams()
  const tokenId = Number(params.tokenId)

  const { isConnected } = useWeb3()
  const { getDesign } = useDesignNFT()
  const { getAttributionsByDesign } = useAttributionValidator()
  const { getAgentByWallet } = useAgentRegistry()

  const [design, setDesign] = useState<DesignMetadata | null>(null)
  const [attributions, setAttributions] = useState<Attribution[]>([])
  const [agentNames, setAgentNames] = useState<Map<string, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!isConnected || isNaN(tokenId)) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setNotFound(false)

      try {
        const designData = await getDesign(tokenId)
        if (cancelled) return
        setDesign(designData)

        const attrs = await getAttributionsByDesign(tokenId)
        if (cancelled) return
        const sorted = [...attrs].sort((a, b) => b.timestamp - a.timestamp)
        setAttributions(sorted)

        // Resolve unique agent names
        const uniqueAgents = Array.from(new Set(sorted.map((a) => a.clientAgent)))
        const names = new Map<string, string>()
        await Promise.allSettled(
          uniqueAgents.map(async (addr) => {
            try {
              const agent = await getAgentByWallet(addr)
              names.set(addr, agent.name)
            } catch {
              names.set(addr, truncateAddress(addr))
            }
          })
        )
        if (!cancelled) setAgentNames(names)
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [isConnected, tokenId, getDesign, getAttributionsByDesign, getAgentByWallet])

  const totalEarnings = attributions.reduce(
    (sum, a) => sum + parseFloat(a.totalPaid),
    0
  )

  // -- Not connected --
  if (!isConnected) {
    return (
      <div>
        <section className="border-t border-c2 flow-line">
          <div className="px-8 pt-10 pb-8">
            <Link
              href="/dashboard/portfolio"
              className="text-c5 hover:text-c11 font-mono text-sm transition-colors"
            >
              &larr; Back to Portfolio
            </Link>
            <div className="mt-16 text-center">
              <p className="text-c5 font-mono text-sm">Connect wallet to view design details</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // -- Loading --
  if (loading) {
    return (
      <div>
        <section className="border-t border-c2 flow-line">
          <div className="px-8 pt-10 pb-8">
            <div className="h-4 w-32 bg-c2 animate-skeleton mb-8" />

            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-80 h-64 bg-c2 animate-skeleton shrink-0" />
              <div className="flex-1 space-y-4">
                <div className="h-8 w-2/3 bg-c2 animate-skeleton" />
                <div className="h-4 w-24 bg-c2 animate-skeleton" />
                <div className="h-4 w-48 bg-c2 animate-skeleton" />
                <div className="h-4 w-36 bg-c2 animate-skeleton" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-c2 border border-c2 mt-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="h-3 w-20 bg-c2 animate-skeleton" />
                  <div className="h-6 w-16 bg-c2 animate-skeleton" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  // -- Not found --
  if (notFound || !design) {
    return (
      <div>
        <section className="border-t border-c2 flow-line">
          <div className="px-8 pt-10 pb-8">
            <Link
              href="/dashboard/portfolio"
              className="text-c5 hover:text-c11 font-mono text-sm transition-colors"
            >
              &larr; Back to Portfolio
            </Link>
            <div className="mt-16 text-center">
              <p className="text-c7 font-mono text-sm">Design not found</p>
              <Link
                href="/dashboard/portfolio"
                className="text-c5 hover:text-c11 font-mono text-xs mt-2 inline-block transition-colors"
              >
                Return to portfolio
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // -- Success --
  return (
    <div>
      {/* Back link */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <Link
            href="/dashboard/portfolio"
            className="text-c5 hover:text-c11 font-mono text-sm transition-colors"
          >
            &larr; Back to Portfolio
          </Link>

          {/* Header section */}
          <div className="flex flex-col md:flex-row gap-8 mt-6">
            {/* IPFS image */}
            <div className="w-full md:w-80 h-64 border border-c2 shrink-0 overflow-hidden relative">
              {!imgError ? (
                <Image
                  src={getIPFSUrl(design.ipfsCid)}
                  alt={design.title}
                  fill
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="construction-grid bg-c2 w-full h-full" />
              )}
            </div>

            {/* Meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-pixel uppercase tracking-tight text-c11">
                {design.title}
              </h1>

              <div className="flex items-center gap-2 mt-3">
                <span className="border border-c3 text-c7 font-mono text-[10px] uppercase px-2 py-0.5">
                  {design.category}
                </span>
              </div>

              {design.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {design.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-c3 text-c7 font-mono text-xs px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-1">
                <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px]">Artist</p>
                <p className="font-mono text-sm text-c9">{truncateAddress(design.artist)}</p>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px]">Created</p>
                <p className="font-mono text-sm text-c9">{formatDate(design.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section className="border-t border-c2">
        <div className="px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-c2 border-x border-b border-c2">
            <div className="p-4">
              <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-1">
                Threshold Price
              </p>
              <p className="text-2xl font-semibold tracking-tight text-c11 tabular-nums">
                {ethers.formatEther(design.thresholdPrice)} ETH
              </p>
            </div>
            <div className="p-4">
              <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-1">
                Total Attributions
              </p>
              <p className="text-2xl font-semibold tracking-tight text-c11 tabular-nums">
                {attributions.length}
              </p>
            </div>
            <div className="p-4">
              <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-1">
                Total Earnings
              </p>
              <p className="text-2xl font-semibold tracking-tight text-c11 tabular-nums">
                {totalEarnings.toFixed(4)} ETH
              </p>
            </div>
            <div className="p-4">
              <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-1">
                Visibility
              </p>
              <p className="text-2xl font-semibold tracking-tight text-c11">
                {design.isPublic ? 'Public' : 'Private'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section hatch */}
      <div className="section-hatch" />

      {/* Attribution History */}
      <section className="border-t border-c2">
        <div className="px-8 pt-8 pb-10">
          <h2 className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-3">
            Attribution History
          </h2>

          {attributions.length > 0 ? (
            <div className="border border-c3 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-c2">
                      <th className="text-left text-c5 font-mono uppercase tracking-[0.2em] text-[10px] px-4 py-3">
                        Agent
                      </th>
                      <th className="text-left text-c5 font-mono uppercase tracking-[0.2em] text-[10px] px-4 py-3">
                        Amount
                      </th>
                      <th className="text-left text-c5 font-mono uppercase tracking-[0.2em] text-[10px] px-4 py-3">
                        Artifacts
                      </th>
                      <th className="text-left text-c5 font-mono uppercase tracking-[0.2em] text-[10px] px-4 py-3">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attributions.map((attr) => (
                      <tr
                        key={attr.id}
                        className="border-b border-c2 last:border-b-0 hover:bg-c2 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-c9 font-mono">
                          {agentNames.get(attr.clientAgent) ?? truncateAddress(attr.clientAgent)}
                        </td>
                        <td className="px-4 py-3 text-sm text-c9 tabular-nums font-mono">
                          {parseFloat(attr.totalPaid).toFixed(4)} ETH
                        </td>
                        <td className="px-4 py-3 text-sm text-c9 tabular-nums font-mono">
                          {attr.artifactIds.length}
                        </td>
                        <td className="px-4 py-3 text-sm text-c5 font-mono">
                          {formatDate(attr.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="border border-c3 p-8 text-center">
              <p className="text-c5 font-mono text-sm">No attributions recorded yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
