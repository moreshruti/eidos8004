'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useWeb3 } from '@/context/Web3Context'
import { useAgentRegistry } from '@/hooks/useAgentRegistry'
import { withTxToast } from '@/lib/tx-toast'
import { WalletGate } from '@/components/ui/WalletGate'
import { AgentType } from '@/lib/types'

interface FormState {
  agentType: AgentType
  name: string
  description: string
  capabilitiesURI: string
  tokenURI: string
  termsAccepted: boolean
}

export default function AgentRegistrationForm() {
  const router = useRouter()
  const { address } = useWeb3()
  const { registerAgent } = useAgentRegistry()

  const [form, setForm] = useState<FormState>({
    agentType: AgentType.CLIENT,
    name: '',
    description: '',
    capabilitiesURI: '',
    tokenURI: '',
    termsAccepted: false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormState, string>> = {}

    if (!form.name.trim()) {
      newErrors.name = 'Agent name is required'
    }
    if (!form.capabilitiesURI.trim()) {
      newErrors.capabilitiesURI = 'Capabilities URI is required'
    }
    if (!form.termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await withTxToast(
        registerAgent(
          form.agentType,
          form.name,
          form.description,
          form.capabilitiesURI,
          form.tokenURI,
        ),
        {
          pending: 'Registering agent on-chain...',
          success: 'Agent registered successfully!',
          error: 'Registration failed',
        }
      )
      setIsSuccess(true)
    } catch (err) {
      // Check for "Already registered" revert
      const message = err instanceof Error ? err.message : ''
      if (message.includes('already registered') || message.includes('Already registered')) {
        setErrors({ name: 'This wallet already has a registered agent' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-c2 border border-c3 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-lg font-pixel uppercase text-c11 mb-2">Agent Registered</h2>
        <p className="text-sm text-c7 font-mono mb-6">Your agent is now on-chain and ready to attribute designs.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => router.push('/dashboard/agents')}
            className="bg-c12 text-c1 font-mono uppercase tracking-wider hover:bg-c11 px-6 py-2 text-xs transition-colors"
          >
            View Agent Registry
          </button>
          <button
            onClick={() => setIsSuccess(false)}
            className="border border-c3 text-c7 hover:text-c12 hover:border-c5 font-mono uppercase tracking-wider px-6 py-2 text-xs transition-colors"
          >
            Register Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <WalletGate message="Connect your wallet to register an AI agent">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Agent Type */}
        <div>
          <label className="block text-c7 font-mono uppercase tracking-[0.2em] text-[10px] mb-3">
            Agent Type
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, agentType: AgentType.CLIENT }))}
              disabled={isSubmitting}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                form.agentType === AgentType.CLIENT
                  ? 'bg-c2 border border-c5 text-c12'
                  : 'border border-c3 text-c7 hover:text-c9 hover:border-c5'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, agentType: AgentType.ARTIST }))}
              disabled={isSubmitting}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                form.agentType === AgentType.ARTIST
                  ? 'bg-c2 border border-c5 text-c12'
                  : 'border border-c3 text-c7 hover:text-c9 hover:border-c5'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Artist
            </button>
          </div>
        </div>

        {/* Agent Name */}
        <div>
          <label htmlFor="agent-name" className="block text-c7 font-mono uppercase tracking-[0.2em] text-[10px] mb-1.5">
            Agent Name
          </label>
          <input
            id="agent-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="e.g. StyleForge AI"
            disabled={isSubmitting}
            className="w-full bg-c2 border border-c3 px-4 py-2.5 text-sm text-c11 placeholder:text-c5 focus:border-c5 focus:outline-none transition-colors disabled:bg-c1 disabled:border-c2 disabled:text-c5"
          />
          {errors.name && (
            <p className="text-error text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="agent-description" className="block text-c7 font-mono uppercase tracking-[0.2em] text-[10px] mb-1.5">
            Description
          </label>
          <textarea
            id="agent-description"
            value={form.description}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Describe what your agent does..."
            rows={4}
            disabled={isSubmitting}
            className="w-full bg-c2 border border-c3 px-4 py-2.5 text-sm text-c11 placeholder:text-c5 focus:border-c5 focus:outline-none transition-colors resize-none disabled:bg-c1 disabled:border-c2 disabled:text-c5"
          />
        </div>

        {/* Capabilities URI */}
        <div>
          <label htmlFor="capabilities-uri" className="block text-c7 font-mono uppercase tracking-[0.2em] text-[10px] mb-1.5">
            Capabilities URI
          </label>
          <input
            id="capabilities-uri"
            type="text"
            value={form.capabilitiesURI}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, capabilitiesURI: e.target.value }))
            }
            placeholder="ipfs://... or https://..."
            disabled={isSubmitting}
            className="w-full bg-c2 border border-c3 px-4 py-2.5 text-sm text-c11 placeholder:text-c5 focus:border-c5 focus:outline-none transition-colors font-mono disabled:bg-c1 disabled:border-c2 disabled:text-c5"
          />
          <p className="text-xs text-c5 mt-1">
            URI pointing to your agent&apos;s capabilities document
          </p>
          {errors.capabilitiesURI && (
            <p className="text-error text-xs mt-1">{errors.capabilitiesURI}</p>
          )}
        </div>

        {/* Token URI */}
        <div>
          <label htmlFor="token-uri" className="block text-c7 font-mono uppercase tracking-[0.2em] text-[10px] mb-1.5">
            Token URI
          </label>
          <input
            id="token-uri"
            type="text"
            value={form.tokenURI}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, tokenURI: e.target.value }))
            }
            placeholder="ipfs://..."
            disabled={isSubmitting}
            className="w-full bg-c2 border border-c3 px-4 py-2.5 text-sm text-c11 placeholder:text-c5 focus:border-c5 focus:outline-none transition-colors font-mono disabled:bg-c1 disabled:border-c2 disabled:text-c5"
          />
          <p className="text-xs text-c5 mt-1">
            URI for the agent NFT metadata (optional)
          </p>
        </div>

        {/* Payment Wallet */}
        <div>
          <label htmlFor="payment-wallet" className="block text-c7 font-mono uppercase tracking-[0.2em] text-[10px] mb-1.5">
            Payment Wallet
          </label>
          <input
            id="payment-wallet"
            type="text"
            value={address ?? ''}
            disabled
            className="w-full bg-c1 border border-c2 px-4 py-2.5 text-sm text-c5 font-mono cursor-not-allowed"
          />
          <p className="text-xs text-c5 mt-1">
            Auto-filled from connected wallet
          </p>
        </div>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="pt-0.5">
              <div
                className={`w-5 h-5 border transition-colors flex items-center justify-center ${
                  form.termsAccepted
                    ? 'bg-c12 border-c12'
                    : 'border-c3 bg-transparent group-hover:border-c5'
                }`}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    termsAccepted: !prev.termsAccepted,
                  }))
                }
              >
                {form.termsAccepted && (
                  <svg
                    className="w-3 h-3 text-c1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-c7">
              I agree to the{' '}
              <span className="text-c11 hover:underline">
                Eidos8004 Attribution Protocol
              </span>
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-error text-xs mt-1">{errors.termsAccepted}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-c12 text-c1 hover:bg-c11 font-mono uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2.5 px-4 transition-colors text-sm flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Registering...
            </>
          ) : (
            'Register Agent'
          )}
        </button>
      </form>
    </WalletGate>
  )
}
