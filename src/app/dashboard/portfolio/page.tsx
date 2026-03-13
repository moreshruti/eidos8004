'use client'

import PortfolioGrid from '@/components/dashboard/PortfolioGrid'
import { useWeb3 } from '@/context/Web3Context'
import { useDesignNFT } from '@/hooks/useDesignNFT'
import { useEffect, useState } from 'react'

export default function PortfolioPage() {
  const { address, isConnected, chainId } = useWeb3()
  const { getDesignerPortfolio } = useDesignNFT()
  const [designCount, setDesignCount] = useState<number | null>(null)

  useEffect(() => {
    if (!isConnected || !address) {
      setDesignCount(null)
      return
    }

    let cancelled = false

    async function fetchCount() {
      try {
        const tokenIds = await getDesignerPortfolio(address!)
        if (!cancelled) setDesignCount(tokenIds.length)
      } catch {
        if (!cancelled) setDesignCount(0)
      }
    }

    fetchCount()
    return () => {
      cancelled = true
    }
  }, [address, chainId, isConnected, getDesignerPortfolio])

  return (
    <div>
      {/* Header */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <h1 className="text-2xl font-pixel uppercase tracking-tight text-c11">My Portfolio</h1>
          <p className="font-mono text-c5 text-sm mt-1">
            {isConnected
              ? designCount !== null
                ? `${designCount} designs minted`
                : 'Loading...'
              : 'Connect wallet to view portfolio'}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="border-t border-c2 flow-line">
        <div className="px-8 pt-10 pb-8">
          <PortfolioGrid />
        </div>
      </section>
    </div>
  )
}
