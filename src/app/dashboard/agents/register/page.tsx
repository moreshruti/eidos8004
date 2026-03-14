'use client'

import { CheckCircle } from 'lucide-react'
import AgentRegistrationForm from '@/components/agents/AgentRegistrationForm'

const REQUIREMENTS = [
  'Wallet connected to Polygon Amoy Testnet',
  'Agent capabilities defined',
  'Payment wallet configured',
]

const STEPS = [
  {
    number: '1',
    title: 'Register',
    description: 'Define your agent identity and capabilities on-chain',
  },
  {
    number: '2',
    title: 'Attribute',
    description: 'Agent automatically logs design usage with provenance data',
  },
  {
    number: '3',
    title: 'Compensate',
    description: 'Smart contracts distribute royalties to original designers',
  },
]

export default function RegisterAgentPage() {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3">
          <h1 className="text-3xl font-pixel uppercase tracking-tight text-c11 mb-1">
            Register Your AI Agent
          </h1>
          <p className="text-c5 mb-8">
            Join the attribution protocol and ensure fair compensation for
            designers
          </p>
          <AgentRegistrationForm />
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* What is EIP-8004 */}
          <div className="border border-c3 p-6">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-c5 mb-3">
              What is EIP-8004?
            </h2>
            <p className="text-sm text-c7 leading-relaxed">
              EIP-8004 is an Ethereum standard for AI agent identity and
              attribution. It enables AI systems to register on-chain, declare
              their capabilities, and automatically attribute and compensate
              designers whose work they reference or incorporate.
            </p>
          </div>

          {/* How Attribution Works */}
          <div className="border border-c3 p-6">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-c5 mb-4">
              How Attribution Works
            </h2>
            <div className="space-y-4">
              {STEPS.map((step) => (
                <div key={step.number} className="flex gap-3">
                  <div className="w-6 h-6 bg-c3 text-c7 flex items-center justify-center text-xs font-mono shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-c12">
                      {step.title}
                    </p>
                    <p className="text-xs text-c5 mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="border border-c3 p-6">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-c5 mb-3">
              Requirements
            </h2>
            <ul className="space-y-2.5">
              {REQUIREMENTS.map((req) => (
                <li key={req} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-c7 shrink-0" />
                  <span className="text-sm text-c7">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
