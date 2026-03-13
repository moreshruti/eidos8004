'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useWeb3 } from '@/context/Web3Context'
import { useDesignNFT } from '@/hooks/useDesignNFT'
import { withTxToast } from '@/lib/tx-toast'
import { WalletGate } from '@/components/ui/WalletGate'

const categories = [
  'UI Design',
  'Illustration',
  'Typography',
  'Icons',
  'Mobile',
  'Dashboard',
  'Branding',
  'Other',
]

export default function EditDesignPage() {
  const params = useParams()
  const router = useRouter()
  const tokenId = params.tokenId as string
  const { isConnected } = useWeb3()
  const { getDesign, updateDesignMetadata } = useDesignNFT()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
        setIsPublic(design.isPublic)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title || !category) return

    setIsSubmitting(true)

    try {
      const txPromise = updateDesignMetadata(
        Number(tokenId),
        title,
        category,
        isPublic,
      )

      await withTxToast(txPromise, {
        pending: 'Updating design metadata...',
        success: 'Design updated successfully!',
        error: 'Failed to update design',
      })

      router.push(`/dashboard/portfolio/${tokenId}`)
    } catch {
      // withTxToast already shows error toast
    } finally {
      setIsSubmitting(false)
    }
  }

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

      <WalletGate message="Connect your wallet to edit designs">
        {isLoading ? (
          /* Loading skeleton */
          <div className="space-y-6 animate-pulse">
            <div className="space-y-2">
              <div className="h-4 w-16 bg-c3" />
              <div className="h-10 w-full bg-c2 border border-c3" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-c3" />
              <div className="h-10 w-full bg-c2 border border-c3" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-c3" />
              <div className="flex gap-2">
                <div className="h-10 flex-1 bg-c2 border border-c3" />
                <div className="h-10 flex-1 bg-c2 border border-c3" />
              </div>
            </div>
            <div className="h-12 w-full bg-c3" />
          </div>
        ) : fetchError ? (
          /* Error state */
          <div className="border border-red-500/30 bg-red-500/5 px-4 py-6 text-center">
            <p className="text-sm text-red-400">{fetchError}</p>
          </div>
        ) : (
          /* Edit form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-xs font-mono font-medium text-c8 uppercase tracking-wider"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter design title"
                disabled={isSubmitting}
                className="w-full bg-c1 border border-c3 px-4 py-2.5 text-sm text-c12 placeholder:text-c6 focus:border-c5 focus:outline-none transition-colors disabled:opacity-50"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label
                htmlFor="category"
                className="block text-xs font-mono font-medium text-c8 uppercase tracking-wider"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-c1 border border-c3 px-4 py-2.5 text-sm text-c12 focus:border-c5 focus:outline-none transition-colors appearance-none disabled:opacity-50"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-medium text-c8 uppercase tracking-wider">
                Visibility
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    isPublic
                      ? 'bg-c2 border border-c5 text-c12'
                      : 'border border-c3 text-c7 hover:text-c9 hover:border-c5'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  disabled={isSubmitting}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    !isPublic
                      ? 'bg-c2 border border-c5 text-c12'
                      : 'border border-c3 text-c7 hover:text-c9 hover:border-c5'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Private
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !title || !category}
              className="w-full bg-c12 text-c1 font-mono uppercase tracking-wider hover:bg-c11 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-3 transition-colors text-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        )}
      </WalletGate>
    </div>
  )
}
