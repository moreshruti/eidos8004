'use client'

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileUp, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useWeb3 } from '@/context/Web3Context'
import { useDesignNFT } from '@/hooks/useDesignNFT'
import { uploadToIPFS, uploadMetadataToIPFS } from '@/lib/ipfs'
import { withTxToast } from '@/lib/tx-toast'
import { WalletGate } from '@/components/ui/WalletGate'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'application/pdf']
const MAX_FILE_SIZE = 50 * 1024 * 1024

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Allowed: PNG, JPG, SVG, PDF'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Maximum size is 50MB'
  }
  return null
}

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

type MintStep = 'idle' | 'uploading_file' | 'uploading_metadata' | 'minting' | 'confirming'

const stepLabels: Record<MintStep, string> = {
  idle: '',
  uploading_file: 'Uploading to IPFS...',
  uploading_metadata: 'Uploading metadata...',
  minting: 'Minting NFT...',
  confirming: 'Confirming...',
}

export default function UploadForm() {
  const router = useRouter()
  const { isConnected } = useWeb3()
  const { mintDesign } = useDesignNFT()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [mintStep, setMintStep] = useState<MintStep>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isSubmitting = mintStep !== 'idle'

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      const error = validateFile(droppedFile)
      if (error) {
        toast.error(error)
        return
      }
      setFile(droppedFile)
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) {
      const error = validateFile(selected)
      if (error) {
        toast.error(error)
        return
      }
      setFile(selected)
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!file || !title || !category) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Step 1: Upload file to IPFS
      setMintStep('uploading_file')
      const fileResult = await uploadToIPFS(file)

      // Step 2: Upload metadata JSON to IPFS
      setMintStep('uploading_metadata')
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      const metadataResult = await uploadMetadataToIPFS({
        title,
        category,
        tags: parsedTags,
        image: fileResult.url,
      })

      // Step 3: Mint the design NFT
      setMintStep('minting')

      const mintPromise = mintDesign(
        title,
        description,
        category,
        fileResult.hash,
        parsedTags,
        metadataResult.url,
      )

      setMintStep('confirming')
      const tokenId = await withTxToast(mintPromise, {
        pending: 'Minting design NFT...',
        success: 'Design minted successfully!',
        error: 'Failed to mint design',
      })

      toast.success(`Token ID: ${tokenId}`)
      router.push(`/dashboard/portfolio/${tokenId}`)
    } catch (err) {
      console.error('Mint failed:', err)
      // withTxToast already shows error toast for the minting step
      // Show a generic error only if it failed before minting
      if (mintStep === 'uploading_file' || mintStep === 'uploading_metadata') {
        toast.error(
          err instanceof Error ? err.message : 'Upload failed'
        )
      }
    } finally {
      setMintStep('idle')
    }
  }

  return (
    <WalletGate message="Connect your wallet to mint designs">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border border-dashed p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-c5 bg-c2'
              : 'border-c3 bg-c1 hover:bg-c2/50 hover:border-c5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.svg,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="h-10 w-10 mx-auto mb-4 text-c6" />
          <p className="text-sm text-c8">
            Drag & drop your design or{' '}
            <span className="text-c9 font-medium">click to browse</span>
          </p>
          <p className="text-xs text-c7 mt-2">
            Max 50MB &middot; PNG, JPG, SVG, PDF
          </p>
        </div>

        {/* File preview */}
        {file && (
          <div>
            {preview && (
              <div className="border border-c2 overflow-hidden mb-3">
                <img src={preview} alt="Preview" className="w-full max-h-48 object-contain bg-c2/50" />
              </div>
            )}
          <div className="flex items-center gap-3 bg-c2/50 border border-c2 px-4 py-3">
            <FileUp className="h-5 w-5 text-c9 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-c12 truncate">
                {file.name}
              </p>
              <p className="text-xs text-c7">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
              }}
              className="p-1 hover:bg-c2 text-c7 hover:text-c12 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          </div>
        )}

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
            className="w-full bg-c1 border border-c3 px-4 py-2.5 text-sm text-c12 placeholder:text-c6 focus:border-c5 focus:outline-none transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-xs font-mono font-medium text-c8 uppercase tracking-wider"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your design"
            rows={3}
            className="w-full bg-c1 border border-c3 px-4 py-2.5 text-sm text-c12 placeholder:text-c6 focus:border-c5 focus:outline-none transition-colors resize-none"
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
            className="w-full bg-c1 border border-c3 px-4 py-2.5 text-sm text-c12 focus:border-c5 focus:outline-none transition-colors appearance-none"
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

        {/* Tags */}
        <div className="space-y-2">
          <label
            htmlFor="tags"
            className="block text-xs font-mono font-medium text-c8 uppercase tracking-wider"
          >
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="dark-mode, minimal, responsive"
            className="w-full bg-c1 border border-c3 px-4 py-2.5 text-sm text-c12 placeholder:text-c6 focus:border-c5 focus:outline-none transition-colors"
          />
          <p className="text-xs text-c7">Comma separated</p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-c12 text-c1 font-mono uppercase tracking-wider hover:bg-c11 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-3 transition-colors text-sm"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {stepLabels[mintStep]}
            </span>
          ) : (
            'Mint as NFT'
          )}
        </button>
      </form>
    </WalletGate>
  )
}
