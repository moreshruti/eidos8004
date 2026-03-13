'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { setMockFallbackListener } from '@/lib/mock-fallback'

const MockModeContext = createContext({ isMockMode: false })

export function MockModeProvider({ children }: { children: ReactNode }) {
  const [isMockMode, setIsMockMode] = useState(false)

  useEffect(() => {
    setMockFallbackListener(() => setIsMockMode(true))
    return () => setMockFallbackListener(null)
  }, [])

  return (
    <MockModeContext.Provider value={{ isMockMode }}>
      {children}
    </MockModeContext.Provider>
  )
}

export function useMockMode() {
  return useContext(MockModeContext)
}
