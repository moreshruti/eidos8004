'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useWeb3 } from '@/context/Web3Context'
import { useAgentRegistry } from '@/hooks/useAgentRegistry'
import { useAttributionValidator } from '@/hooks/useAttributionValidator'
import { useDesignNFT } from '@/hooks/useDesignNFT'
import AgentDetail from '@/components/agents/AgentDetail'
import type { Agent, Attribution } from '@/lib/types'

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-start gap-6 mb-8">
        <div className="w-16 h-16 bg-c3" />
        <div className="flex-1">
          <div className="h-8 w-48 bg-c3 mb-3" />
          <div className="h-4 w-96 bg-c3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-c3 p-4 h-20" />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-c3 p-4 h-24" />
        ))}
      </div>
    </div>
  )
}

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { chainId, isConnected } = useWeb3()
  const { getAgent } = useAgentRegistry()
  const { getAttributionsByAgent } = useAttributionValidator()
  const { getDesign } = useDesignNFT()

  const [agent, setAgent] = useState<Agent | null>(null)
  const [attributions, setAttributions] = useState<Attribution[]>([])
  const [designTitles, setDesignTitles] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!isConnected || !chainId) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchData() {
      setLoading(true)
      setNotFound(false)

      try {
        const fetchedAgent = await getAgent(Number(id))

        // Check if the agent is valid (has a name)
        if (!fetchedAgent.name) {
          if (!cancelled) setNotFound(true)
          return
        }

        if (!cancelled) setAgent(fetchedAgent)

        // Fetch attributions using agent's wallet address
        try {
          const fetchedAttrs = await getAttributionsByAgent(fetchedAgent.wallet)
          if (!cancelled) {
            setAttributions(fetchedAttrs)

            // Resolve design titles, caching in a Map
            const titleMap = new Map<number, string>()
            const uniqueDesignIds = [...new Set(fetchedAttrs.map((a) => a.designId))]

            await Promise.all(
              uniqueDesignIds.map(async (designId) => {
                try {
                  const design = await getDesign(designId)
                  titleMap.set(designId, design.title)
                } catch {
                  titleMap.set(designId, `Design #${designId}`)
                }
              })
            )

            if (!cancelled) setDesignTitles(titleMap)
          }
        } catch {
          // Attributions fetch failed -- show agent without attributions
        }
      } catch {
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, id])

  return (
    <div>
      {/* Back Button */}
      <Link
        href="/dashboard/agents"
        className="inline-flex items-center gap-1.5 text-sm text-c5 hover:text-c11 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Registry
      </Link>

      {loading ? (
        <DetailSkeleton />
      ) : !isConnected ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-c12 mb-2">
            Wallet not connected
          </h2>
          <p className="text-c5 mb-6">
            Connect your wallet to view agent details.
          </p>
        </div>
      ) : agent && !notFound ? (
        <AgentDetail
          agent={agent}
          attributions={attributions}
          designTitles={designTitles}
        />
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-c12 mb-2">
            Agent not found
          </h2>
          <p className="text-c5 mb-6">
            The agent you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/dashboard/agents"
            className="text-c7 hover:text-c11 text-sm transition-colors"
          >
            Return to Agent Registry
          </Link>
        </div>
      )}
    </div>
  )
}
