'use client'

import { useState } from 'react'
import { useMockMode } from '@/context/MockModeContext'

export function MockModeBanner() {
  const { isMockMode } = useMockMode()
  const [dismissed, setDismissed] = useState(false)

  if (!isMockMode || dismissed) return null

  return (
    <div className="bg-c2 border-b border-c3 px-4 py-2 flex items-center justify-between">
      <p className="text-[11px] font-mono text-warning tracking-wide">
        TESTNET DEMO MODE — Displaying sample data
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="text-c5 hover:text-c9 transition-colors text-xs font-mono"
      >
        DISMISS
      </button>
    </div>
  )
}
