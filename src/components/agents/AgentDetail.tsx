'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import type { Agent, Attribution } from '@/lib/types'
import { AgentType } from '@/lib/types'
import TrustScoreBadge from './TrustScoreBadge'

interface AgentDetailProps {
  agent: Agent
  attributions: Attribution[]
  designTitles: Map<number, string>
}

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

export default function AgentDetail({ agent, attributions, designTitles }: AgentDetailProps) {
  const [copied, setCopied] = useState(false)

  const totalPaidAmount = attributions.reduce(
    (sum, a) => sum + parseFloat(a.totalPaid),
    0
  )
  const avgPerAttribution =
    attributions.length > 0 ? totalPaidAmount / attributions.length : 0

  const handleCopy = async () => {
    await navigator.clipboard.writeText(agent.wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        <div
          className="w-16 h-16 border border-c3 bg-c2 text-c7 font-pixel flex items-center justify-center text-2xl shrink-0"
        >
          {agent.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold tracking-tight text-c11">{agent.name}</h1>
            <span
              className={`px-2 py-0.5 text-xs font-medium border border-c3 text-c7`}
            >
              {agent.active ? 'Active' : 'Inactive'}
            </span>
            <span
              className="px-2 py-0.5 text-xs font-medium border border-c3 text-c7"
            >
              {agent.agentType === AgentType.CLIENT ? 'Client' : 'Artist'}
            </span>
          </div>
          <p className="text-c7 text-base max-w-2xl">{agent.description}</p>
        </div>

        <div className="relative shrink-0">
          <TrustScoreBadge score={agent.reputationScore ?? 0} size="lg" />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Wallet */}
        <div className="border border-c3 p-4">
          <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-1">Wallet</p>
          <div className="flex items-center gap-2">
            <code className="font-mono text-sm text-c9">
              {truncateAddress(agent.wallet)}
            </code>
            <button
              onClick={handleCopy}
              className="text-c5 hover:text-c11 transition-colors"
              aria-label="Copy wallet address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-c7" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Registered */}
        <div className="border border-c3 p-4">
          <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-1">Registered</p>
          <p className="font-mono text-sm text-c9">{formatDate(agent.registeredAt)}</p>
        </div>

        {/* Capabilities */}
        <div className="border border-c3 p-4">
          <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-1">Capabilities</p>
          {agent.capabilitiesURI ? (
            <a
              href={`https://ipfs.io/ipfs/${agent.capabilitiesURI.replace('ipfs://', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm text-c9 hover:text-c11 flex items-center gap-1 transition-colors"
            >
              {truncateAddress(agent.capabilitiesURI)}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <p className="font-mono text-sm text-c5">Not specified</p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-c3 p-4">
          <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-1">Total Attributions</p>
          <p className="text-2xl font-semibold tracking-tight text-c11 tabular-nums">
            {attributions.length}
          </p>
        </div>
        <div className="border border-c3 p-4">
          <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-1">Total Paid</p>
          <p className="text-2xl font-semibold tracking-tight text-c11 tabular-nums">
            {totalPaidAmount.toFixed(2)} ETH
          </p>
        </div>
        <div className="border border-c3 p-4">
          <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-1">Avg Per Attribution</p>
          <p className="text-2xl font-semibold tracking-tight text-c11 tabular-nums">
            {avgPerAttribution.toFixed(3)} ETH
          </p>
        </div>
        <div className="border border-c3 p-4">
          <p className="text-c5 font-mono uppercase tracking-[0.2em] text-[10px] mb-1">Active Since</p>
          <p className="text-2xl font-semibold tracking-tight text-c11">
            {formatDate(agent.registeredAt)}
          </p>
        </div>
      </div>

      {/* Attribution History Table */}
      <div>
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
                      Design
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
                      <td className="px-4 py-3 text-sm text-c9">
                        {designTitles.get(attr.designId) ?? `Design #${attr.designId}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-c9 tabular-nums font-mono">
                        {attr.totalPaid} ETH
                      </td>
                      <td className="px-4 py-3 text-sm text-c9 tabular-nums font-mono">
                        {attr.artifactIds.length}
                      </td>
                      <td className="px-4 py-3 text-sm text-c5">
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
            <p className="text-c5">No attributions recorded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
