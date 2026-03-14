'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useWeb3 } from '@/context/Web3Context'
import { useDesignNFT } from '@/hooks/useDesignNFT'
import { WalletGate } from '@/components/ui/WalletGate'

export default function EditDesignPage() {
  const params = useParams()
  const tokenId = params.tokenId as string
  const { isConnected } = useWeb3()
  const { getDesign } = useDesignNFT()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected) return

    async function fetchDesign() {
      try {
        setIsLoading(true)
        setFetchError(null)
        const design = await getDesign(Number(tokenId))
        setTitle(design.title)
        setCategory(design.category)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load design'
        setFetchError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDesign()
  }, [isConnected, tokenId, getDesign])

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href={`/dashboard/portfolio/${tokenId}`}
        className="inline-flex items-center gap-2 text-sm text-c8 hover:text-c12 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Design
      </Link>

      {/* Heading */}
      <h1 className="font-pixel uppercase text-c11 text-2xl">Edit Design</h1>

      <WalletGate message="Connect your wallet to view design details">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-c3" />
              <div className="h-10 w-full bg-c2 border border-c3" />
            </div>
          </div>
        ) : fetchError ? (
          <div className="border border-red-500/30 bg-red-500/5 px-4 py-6 text-center">
            <p className="text-sm text-red-400">{fetchError}</p>
          </div>
        ) : (
          <div className="border border-c3 p-8 text-center space-y-4">
            <p className="text-c11 font-mono text-sm">
              Design metadata is immutable after minting.
            </p>
            <div className="space-y-2">
              <p className="text-c5 font-mono text-xs">
                <span className="uppercase tracking-[0.2em]">Title:</span>{' '}
                <span className="text-c9">{title}</span>
              </p>
              <p className="text-c5 font-mono text-xs">
                <span className="uppercase tracking-[0.2em]">Category:</span>{' '}
                <span className="text-c9">{category}</span>
              </p>
            </div>
            <Link
              href={`/dashboard/portfolio/${tokenId}`}
              className="inline-block border border-c3 text-c7 hover:text-c12 hover:border-c5 font-mono uppercase tracking-wider px-6 py-2 text-xs transition-colors mt-4"
            >
              Back to Design
            </Link>
          </div>
        )}
      </WalletGate>
    </div>
  )
}
