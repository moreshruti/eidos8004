'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Upload,
  Grid3X3,
  BarChart3,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { NetworkBanner } from '@/components/ui/NetworkBanner'
import { WalletGate } from '@/components/ui/WalletGate'
import { MockModeBanner } from '@/components/ui/MockModeBanner'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { MockModeProvider } from '@/context/MockModeContext'
import { useWeb3 } from '@/context/Web3Context'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Upload', href: '/dashboard/upload', icon: Upload },
  { label: 'Portfolio', href: '/dashboard/portfolio', icon: Grid3X3 },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const { address, isConnected } = useWeb3()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '0x----...----'

  const avatarLetter = address ? address.slice(2, 3).toUpperCase() : '?'

  return (
    <div className="flex flex-col h-screen bg-c1">
      <NetworkBanner />
      <MockModeBanner />
      <div className="flex flex-1 min-h-0">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 bg-c1 border-r border-c2 flex flex-col transition-all duration-200 lg:translate-x-0 lg:static ${
            collapsed ? 'w-[72px]' : 'w-56'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          {/* Logo + collapse toggle */}
          <div className="h-14 flex items-center border-b border-c2 shrink-0 px-3">
            {!collapsed && (
              <Link href="/" className="flex items-center gap-0.5 ml-2">
                <span className="text-sm font-semibold font-pixel text-c12 tracking-tight">
                  Eidos
                </span>
                <span className="text-sm font-normal text-c7">
                  8004
                </span>
              </Link>
            )}
            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`hidden lg:flex p-2 text-c6 hover:text-c12 hover:bg-c2 transition-colors ${collapsed ? 'mx-auto' : 'ml-auto'}`}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
            {/* Mobile close */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto p-1.5 text-c7 hover:text-c12 hover:bg-c2 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className={`flex-1 py-4 ${collapsed ? 'px-3 space-y-2' : 'px-3 space-y-0.5'}`}>
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center transition-colors ${
                    collapsed
                      ? `justify-center w-11 h-11 mx-auto ${active ? 'text-c12 bg-c2 border border-c5' : 'text-c7 hover:text-c12 hover:bg-c2'}`
                      : `gap-3 px-3 py-2 text-sm ${active ? 'text-c12 border-l-2 border-c11 bg-c2' : 'text-c6 hover:text-c12 hover:bg-c2'}`
                  }`}
                >
                  <Icon className={collapsed ? 'h-5 w-5' : 'h-4 w-4 shrink-0'} />
                  {!collapsed && <span className="font-mono">{item.label}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className={`pb-4 border-t border-c2 pt-4 shrink-0 ${collapsed ? 'px-3' : 'px-3'}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center py-2' : 'gap-3 px-3 py-2'}`}>
              <div className={`bg-c3 border border-c3 flex items-center justify-center shrink-0 ${collapsed ? 'w-10 h-10 mx-auto' : 'w-8 h-8'}`}>
                <span className={`font-medium text-c8 ${collapsed ? 'text-sm' : 'text-xs'}`}>{avatarLetter}</span>
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-mono text-c9 truncate tabular-nums">
                    {displayAddress}
                  </p>
                  <p className="text-xs text-c5">
                    {isConnected ? 'Connected' : 'Not connected'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <header className="h-14 flex items-center px-4 border-b border-c2 lg:hidden shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-c7 hover:text-c12 hover:bg-c2"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="ml-3 flex items-center gap-0.5">
              <span className="text-sm font-semibold font-pixel text-c12 tracking-tight">Eidos</span>
              <span className="text-sm font-normal text-c7">8004</span>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
            <MockModeProvider>
              <WalletGate message="Connect your wallet to access the dashboard">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </WalletGate>
            </MockModeProvider>
          </main>
        </div>
      </div>
    </div>
  )
}
