'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChevronDown } from 'lucide-react'
import type { Agent } from '@/lib/types'
import AgentCard from './AgentCard'
import { Pagination } from '@/components/ui/Pagination'

interface AgentListProps {
  agents: Agent[]
}

type SortOption = 'trust' | 'newest' | 'active'

const PAGE_SIZE = 12

export default function AgentList({ agents }: AgentListProps) {
  const [search, setSearch] = useState('')
  const [capabilityFilter, setCapabilityFilter] = useState('All Capabilities')
  const [sort, setSort] = useState<SortOption>('trust')
  const [page, setPage] = useState(1)

  // Derive unique capability URIs from the actual agents
  const capabilities = useMemo(() => {
    const caps = new Set<string>()
    agents.forEach((agent) => {
      if (agent.capabilitiesURI) caps.add(agent.capabilitiesURI)
    })
    return ['All Capabilities', ...Array.from(caps).sort()]
  }, [agents])

  const filtered = useMemo(() => {
    let result = agents

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.capabilitiesURI.toLowerCase().includes(q)
      )
    }

    // Capability filter
    if (capabilityFilter !== 'All Capabilities') {
      result = result.filter((a) => a.capabilitiesURI === capabilityFilter)
    }

    // Sort
    switch (sort) {
      case 'trust':
        result = [...result].sort((a, b) => (b.reputationScore ?? 0) - (a.reputationScore ?? 0))
        break
      case 'newest':
        result = [...result].sort((a, b) => b.registeredAt - a.registeredAt)
        break
      case 'active':
        result = [...result].sort(
          (a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0)
        )
        break
    }

    return result
  }, [agents, search, capabilityFilter, sort])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [search, capabilityFilter, sort])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginatedAgents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <section className="border-t border-c2 flow-line">
      {/* Search & Filters */}
      <div className="px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-c5" />
            <input
              type="text"
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-c2 border border-c3 pl-9 pr-4 py-2.5 text-sm text-c11 font-mono placeholder:text-c5 focus:outline-none focus:border-c5 transition-colors"
            />
          </div>

          {/* Capability Filter */}
          <div className="relative">
            <select
              value={capabilityFilter}
              onChange={(e) => setCapabilityFilter(e.target.value)}
              className="appearance-none bg-c2 border border-c3 px-4 py-2.5 pr-10 text-sm text-c7 font-mono focus:outline-none focus:border-c5 transition-colors cursor-pointer"
            >
              {capabilities.map((cap) => (
                <option key={cap} value={cap}>
                  {cap}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-c5 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none bg-c2 border border-c3 px-4 py-2.5 pr-10 text-sm text-c7 font-mono focus:outline-none focus:border-c5 transition-colors cursor-pointer"
            >
              <option value="trust">Reputation</option>
              <option value="newest">Newest</option>
              <option value="active">Most Active</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-c5 pointer-events-none" />
          </div>
        </div>

        {/* Count */}
        <p className="text-[10px] text-c5 font-mono uppercase tracking-[0.2em] mb-4">
          {filtered.length} agent{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-c2 border-t border-c2">
            {paginatedAgents.map((agent) => (
              <AgentCard key={agent.agentId} agent={agent} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : agents.length === 0 ? (
        <div className="text-center py-16">
          <div className="border border-c3 bg-c2 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-c7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <p className="text-sm text-c7 mb-4">No agents registered yet</p>
          <Link href="/dashboard/agents/register" className="inline-block bg-c12 text-c1 font-mono uppercase tracking-wider hover:bg-c11 px-6 py-2 text-xs transition-colors">
            Register First Agent
          </Link>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-c8 font-mono text-lg">No agents found</p>
          <p className="text-c6 font-mono text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </section>
  )
}
