'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useWeb3 } from '@/context/Web3Context'
import { useDesignNFT } from '@/hooks/useDesignNFT'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import { Skeleton } from '@/components/ui/Skeleton'
import { Pagination } from '@/components/ui/Pagination'
import DesignCard from './DesignCard'
import toast from 'react-hot-toast'
import type { DesignMetadata } from '@/lib/types'
import { withMockFallback } from '@/lib/mock-fallback'
import { mockDesigns, mockAttributions } from '@/lib/mock-data'

type SortOption = 'newest' | 'most_earned' | 'most_attributed'

const PAGE_SIZE = 12

export default function PortfolioGrid() {
  const { address, isConnected, chainId } = useWeb3()
  const { getDesignerPortfolio, getDesign } = useDesignNFT()
  const { getAttributionsByDesign } = useAttributionValidator()

  const [designs, setDesigns] = useState<DesignMetadata[]>([])
  const [designStats, setDesignStats] = useState<Record<number, { earnings: number; attributionCount: number }>>({})
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!isConnected || !address) {
      setDesigns([])
      return
    }

    let cancelled = false

    async function fetchPortfolio() {
      setLoading(true)
      try {
        const tokenIds = await withMockFallback(
          () => getDesignerPortfolio(address!),
          mockDesigns.map((d) => d.tokenId)
        )

        const allDesigns = await Promise.all(
          tokenIds.map(async (tokenId) => {
            const mockDesign = mockDesigns.find((d) => d.tokenId === tokenId) || null
            try {
              return await withMockFallback(() => getDesign(tokenId), mockDesign as DesignMetadata)
            } catch {
              return mockDesign
            }
          })
        )

        const validDesigns = allDesigns.filter((d): d is DesignMetadata => d !== null)

        if (!cancelled) {
          setDesigns(validDesigns)
        }

        // Fetch attribution stats for sorting
        const statsMap: Record<number, { earnings: number; attributionCount: number }> = {}
        await Promise.all(
          validDesigns.map(async (design) => {
            try {
              const attrs = await withMockFallback(
                () => getAttributionsByDesign(design.tokenId),
                mockAttributions.filter(a => a.designId === design.tokenId)
              )
              const totalEarnings = attrs.reduce((sum, a) => sum + parseFloat(a.royaltyAmount), 0)
              statsMap[design.tokenId] = { earnings: totalEarnings, attributionCount: attrs.length }
            } catch {
              statsMap[design.tokenId] = { earnings: 0, attributionCount: 0 }
            }
          })
        )
        if (!cancelled) setDesignStats(statsMap)
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch portfolio:', err)
          toast.error('Failed to load portfolio')
          setDesigns([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPortfolio()
    return () => {
      cancelled = true
    }
  }, [address, chainId, isConnected, getDesignerPortfolio, getDesign, getAttributionsByDesign])

  const allCategories = useMemo(() => {
    const cats = Array.from(new Set(designs.map((d) => d.category)))
    return ['All', ...cats]
  }, [designs])

  const filtered =
    selectedCategory === 'All'
      ? designs
      : designs.filter((d) => d.category === selectedCategory)

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.createdAt - a.createdAt
      case 'most_earned':
        return (designStats[b.tokenId]?.earnings ?? 0) - (designStats[a.tokenId]?.earnings ?? 0)
      case 'most_attributed':
        return (designStats[b.tokenId]?.attributionCount ?? 0) - (designStats[a.tokenId]?.attributionCount ?? 0)
      default:
        return 0
    }
  })

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [selectedCategory, sortBy])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (loading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-c2/50 border border-c2 overflow-hidden"
            >
              <Skeleton className="h-36 w-full rounded-none" />
              <div className="p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex gap-1.5">
                  <Skeleton className="h-5 w-14" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="border border-c3 bg-c2 w-16 h-16 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-c7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
            />
          </svg>
        </div>
        <p className="text-sm text-c7">Connect wallet to view your portfolio</p>
      </div>
    )
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-c1 border border-c3 px-3 py-2 text-sm text-c9 focus:border-c5 focus:outline-none transition-colors appearance-none pr-8"
        >
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-c1 border border-c3 px-3 py-2 text-sm text-c9 focus:border-c5 focus:outline-none transition-colors appearance-none pr-8"
        >
          <option value="newest">Newest</option>
          <option value="most_earned">Most Earned</option>
          <option value="most_attributed">Most Attributed</option>
        </select>
      </div>

      {/* Grid */}
      {sorted.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginated.map((design) => (
              <DesignCard key={design.tokenId} design={design} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="border border-c3 bg-c2 w-16 h-16 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-c7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z"
              />
            </svg>
          </div>
          {designs.length === 0 ? (
            <>
              <p className="text-sm text-c7 mb-4">
                You haven&apos;t minted any designs yet
              </p>
              <Link
                href="/dashboard/upload"
                className="inline-flex items-center px-4 py-2 bg-c9 text-c1 text-sm font-medium hover:bg-c8 transition-colors"
              >
                Upload Your First Design
              </Link>
            </>
          ) : (
            <p className="text-sm text-c7">
              No designs found in this category
            </p>
          )}
        </div>
      )}
    </div>
  )
}
