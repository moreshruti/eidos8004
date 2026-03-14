'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { WalletButton } from '@/components/ui/WalletButton';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/docs', label: 'Docs' },
];

function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide navbar on dashboard routes — dashboard has its own sidebar nav
  if (pathname.startsWith('/dashboard')) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-c1/80 backdrop-blur-xl border-b border-c3">
      <div className="max-w-[960px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 shrink-0">
            <span className="text-base font-semibold text-c12 tracking-tight">Eidos</span>
            <span className="text-base font-normal text-c7">8004</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                    ${isActive
                      ? 'text-c12'
                      : 'text-c7 hover:text-c12'
                    }
                  `.trim()}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Wallet */}
          <div className="hidden md:block">
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-c7 hover:text-c12 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-c3 bg-c1/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                    ${isActive
                      ? 'text-c12 bg-c2'
                      : 'text-c7 hover:text-c12 hover:bg-c2'
                    }
                  `.trim()}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-c3">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export { Navbar };
