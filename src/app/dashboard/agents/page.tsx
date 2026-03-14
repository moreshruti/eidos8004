'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useWeb3 } from '@/context/Web3Context'
import { useAgentRegistry } from '@/hooks/useAgentRegistry'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import AgentList from '@/components/agents/AgentList'
import { Button } from '@/components/ui/Button'
import type { Agent } from '@/lib/types'
import { withMockFallback } from '@/lib/mock-fallback'
import { mockAgents } from '@/lib/mock-data'

function StatSkeleton() {
  return (
    <div className="text-center py-8 animate-pulse">
      <div className="h-3 w-24 bg-c3 mx-auto mb-3" />
      <div className="h-8 w-16 bg-c3 mx-auto" />
    </div>
  )
}

export default function AgentsPage() {
  const { chainId, isConnected } = useWeb3()
  const { getAllAgents, loading: agentsLoading } = useAgentRegistry()
  const { totalAttributions } = useAttributionValidator()

  const [agents, setAgents] = useState<Agent[]>([])
  const [attrCount, setAttrCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected || !chainId) {
      setAgents([])
      setAttrCount(0)
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const [fetchedAgents, fetchedAttrCount] = await Promise.all([
          withMockFallback(() => getAllAgents(), mockAgents),
          withMockFallback(() => totalAttributions().catch(() => 0), mockAgents.length),
        ])
        if (!cancelled) {
          setAgents(fetchedAgents)
          setAttrCount(fetchedAttrCount)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load agents')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId])

  const totalAgentCount = agents.length
  const avgReputationScore =
    totalAgentCount > 0
      ? Math.round(agents.reduce((sum, a) => sum + (a.reputationScore ?? 0), 0) / totalAgentCount)
      : 0

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-pixel uppercase tracking-tight text-c11">AI Agent Registry</h1>
          <p className="text-sm text-c7 font-mono mt-1">
            Verified AI agents using EIP-8004 identity standard
          </p>
        </div>
        <Link href="/dashboard/agents/register">
          <Button variant="primary">Register Your Agent</Button>
        </Link>
      </div>

      {/* Stats Row */}
      <section className="border border-c2">
        <div className="grid grid-cols-3 sm:divide-x sm:divide-c2">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <div className="text-center py-8">
                <p className="text-2xl font-semibold text-c12 tabular-nums tracking-tight font-mono">
                  {totalAgentCount}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-c6 font-mono">
                  Total Agents
                </p>
              </div>
              <div className="text-center py-8">
                <p className="text-2xl font-semibold text-c12 tabular-nums tracking-tight font-mono">
                  {avgReputationScore}
                  <span className="text-lg text-c6">/100</span>
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-c6 font-mono">
                  Avg Reputation
                </p>
              </div>
              <div className="text-center py-8">
                <p className="text-2xl font-semibold text-c12 tabular-nums tracking-tight font-mono">
                  {attrCount}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-c6 font-mono">
                  Total Attributions
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/10 p-4 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Empty state when wallet not connected */}
      {!isConnected && !loading && (
        <div className="text-center py-16">
          <p className="text-c8 font-mono text-lg">Connect your wallet to view agents</p>
          <p className="text-c6 font-mono text-sm mt-1">
            A wallet connection is required to read on-chain data
          </p>
        </div>
      )}

      {/* Agent List */}
      {loading ? (
        <section className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-c2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-c1 p-5 animate-pulse h-64"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-c3" />
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-c3 mb-2" />
                    <div className="h-3 w-20 bg-c3" />
                  </div>
                </div>
                <div className="h-3 w-full bg-c3 mb-2" />
                <div className="h-3 w-3/4 bg-c3 mb-4" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-c3" />
                  <div className="h-5 w-20 bg-c3" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        isConnected && <AgentList agents={agents} />
      )}
    </div>
  )
}
