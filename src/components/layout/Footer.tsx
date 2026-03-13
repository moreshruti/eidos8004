import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const links = [
  { href: '/docs', label: 'Docs', external: false },
  { href: 'https://github.com/eidos8004', label: 'GitHub', external: true },
  { href: 'https://eips.ethereum.org/EIPS/eip-8004', label: 'EIP-8004', external: true },
];

function Footer() {
  return (
    <footer>
      <div className="max-w-[960px] mx-auto px-6">
        <div className="border-t border-c2 flow-line grid grid-cols-1 sm:grid-cols-2">

          {/* Left — Brand + description */}
          <div className="py-14 px-6">
            <div className="flex items-center gap-1 mb-4">
              <span className="text-base font-semibold text-c12 tracking-tight">Eidos</span>
              <span className="text-base font-normal text-c7">8004</span>
            </div>
            <p className="text-sm text-c6 leading-relaxed max-w-xs">
              On-chain attribution for the age of AI.
              Designers own their work. Agents pay for usage.
            </p>
            <p className="mt-6 text-[10px] font-mono text-c5 uppercase tracking-[0.2em]">
              Polygon Amoy Testnet
            </p>
          </div>

          {/* Right — Links */}
          <div className="py-14 px-6">
            <p className="text-[10px] font-mono text-c5 uppercase tracking-[0.2em] mb-4">
              Links
            </p>
            <div className="grid grid-cols-2 gap-y-3">
              {links.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-c7 hover:text-c12 transition-colors duration-150 inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 text-c5 group-hover:text-c12 transition-colors" />
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-c7 hover:text-c12 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-c2 flow-line py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[10px] font-mono text-c5 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Eidos Protocol
          </span>
          <span className="text-[10px] font-mono text-c4 uppercase tracking-[0.2em]">
            Built on Ethereum &middot; Verified on Polygon
          </span>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
