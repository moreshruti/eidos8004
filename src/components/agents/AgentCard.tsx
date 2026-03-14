'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Agent, Attribution } from '@/lib/types'
import { useWeb3 } from '@/context/Web3Context'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import TrustScoreBadge from './TrustScoreBadge'
import { AgentType } from '@/lib/types'

interface AgentCardProps {
  agent: Agent
}

export default function AgentCard({ agent }: AgentCardProps) {
  const { chainId, isConnected } = useWeb3()
  const { getAttributionsByAgent } = useAttributionValidator()
  const [attributions, setAttributions] = useState<Attribution[]>([])

  useEffect(() => {
    if (!isConnected || !chainId) return

    let cancelled = false

    async function fetchAttributions() {
      try {
        const result = await getAttributionsByAgent(agent.wallet)
        if (!cancelled) setAttributions(result)
      } catch {
        // Silently fail for card-level attribution fetch
      }
    }

    fetchAttributions()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, agent.wallet])

  const totalPaidAmount = attributions.reduce(
    (sum, a) => sum + parseFloat(a.totalPaid),
    0
  )

  return (
    <Link href={`/dashboard/agents/${agent.agentId}`}>
      <div className="group bg-c1 p-5 hover:bg-c2 transition-colors duration-150 cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 border border-c3 bg-c2 flex items-center justify-center text-c7 font-pixel text-sm shrink-0"
            >
              {agent.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-c11 truncate">
                  {agent.name}
                </h3>
                {agent.active && (
                  <span className="w-1.5 h-1.5 bg-emerald-400 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-c5 font-mono uppercase tracking-[0.2em]">
                {agent.agentType === AgentType.CLIENT ? 'Client' : 'Artist'}
              </p>
            </div>
          </div>
          <div className="relative shrink-0">
            <TrustScoreBadge score={agent.reputationScore ?? 0} size="sm" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-c6 line-clamp-2 mb-4">
          {agent.description}
        </p>

        {/* Capabilities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.capabilitiesURI && (
            <span
              className="border border-c3 text-c7 text-[11px] px-1.5 py-0.5 font-mono"
            >
              View capabilities
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="mt-auto pt-3 border-t border-c2 flex items-center justify-between text-[10px] text-c5 font-mono tabular-nums">
          <span>
            {attributions.length} attributions
          </span>
          <span>{totalPaidAmount.toFixed(2)} ETH paid</span>
        </div>

        {/* View Details */}
        <div className="mt-3 text-[10px] text-c5 group-hover:text-c11 font-mono uppercase tracking-[0.2em] flex items-center gap-1 transition-colors">
          View Details
          <span>
            &rarr;
          </span>
        </div>
      </div>
    </Link>
  )
}
