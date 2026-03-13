'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/context/Web3Context'
import { useRoyaltyDistribution } from '@/hooks/useRoyaltyDistribution'
import { withTxToast } from '@/lib/tx-toast'

export default function RoyaltyClaim() {
  const { address, isConnected } = useWeb3()
  const { getRoyaltyBalance, claimRoyalties } = useRoyaltyDistribution()
  const [balance, setBalance] = useState<string | null>(null)
  const [fetching, setFetching] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (!isConnected || !address) {
      setBalance(null)
      return
    }

    let cancelled = false

    async function fetchBalance() {
      setFetching(true)
      try {
        const result = await getRoyaltyBalance(address!)
        if (!cancelled) setBalance(result)
      } catch {
        if (!cancelled) setBalance(null)
      } finally {
        if (!cancelled) setFetching(false)
      }
    }

    fetchBalance()

    return () => {
      cancelled = true
    }
  }, [isConnected, address, getRoyaltyBalance])

  if (!isConnected) {
    return (
      <p className="font-mono text-sm text-c5">
        Connect wallet to view available royalties
      </p>
    )
  }

  if (fetching || balance === null) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-c5">
            Available Royalties
          </p>
          <div className="mt-1 h-8 w-32 animate-pulse bg-c3 rounded" />
        </div>
        <div className="h-9 w-36 animate-pulse bg-c3 rounded" />
      </div>
    )
  }

  const isEmpty = balance === '0' || balance === '0.0' || balance === '0.00'

  async function handleClaim() {
    setClaiming(true)
    try {
      await withTxToast(claimRoyalties(), {
        pending: 'Claiming royalties...',
        success: 'Royalties claimed',
        error: 'Claim failed',
      })
      // Refresh balance after successful claim
      if (address) {
        const updated = await getRoyaltyBalance(address)
        setBalance(updated)
      }
    } catch {
      // Error handled by withTxToast
    } finally {
      setClaiming(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-c5">
            Available Royalties
          </p>
          <p className="text-2xl font-mono text-c12 tabular-nums mt-1">
            {balance} <span className="text-sm text-c5">ETH</span>
          </p>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isEmpty || claiming}
          className="bg-c12 text-c1 font-mono uppercase tracking-wider hover:bg-c11 px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {claiming ? 'Claiming...' : 'Claim Royalties'}
        </button>
      </div>
      {showConfirm && (
        <div className="mt-4 border border-c3 bg-c2/50 p-4">
          <p className="text-sm text-c9 font-mono mb-1">Confirm Claim</p>
          <p className="text-xs text-c7 font-mono mb-4">
            You are about to claim <span className="text-c12 font-medium">{balance} ETH</span> in royalties.
            This will send a transaction to your wallet.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowConfirm(false); handleClaim(); }}
              className="bg-c12 text-c1 font-mono uppercase tracking-wider hover:bg-c11 px-4 py-2 text-xs transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="border border-c3 text-c7 hover:text-c12 hover:border-c5 font-mono uppercase tracking-wider px-4 py-2 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
