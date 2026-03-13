'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, Link2, Zap, Bot, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WalletButton } from '@/components/ui/WalletButton';
import { Footer } from '@/components/layout/Footer';
import { MorphingIcon } from '@/components/ui/MorphingIcon';
import { FlowPulse } from '@/components/ui/FlowPulse';
import { playClick } from '@/lib/sounds';
import { ProtocolStack } from '@/components/landing/ProtocolStack';
import { useDesignNFT } from '@/hooks/useDesignNFT';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { useAttributionValidator } from '@/hooks/useAttributionValidator';
import { useRoyaltyDistribution } from '@/hooks/useRoyaltyDistribution';
import { withMockFallback } from '@/lib/mock-fallback';

const FALLBACK_STATS = {
  designers: '1,200+',
  paidOut: '$850K+',
  agents: '67',
  attributions: '24K+',
};

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K+`;
  }
  return n.toLocaleString();
}

export default function Home() {
  const { totalDesigns } = useDesignNFT();
  const { totalAgents } = useAgentRegistry();
  const { totalAttributions } = useAttributionValidator();
  const { totalDistributed } = useRoyaltyDistribution();

  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState([
    { value: FALLBACK_STATS.designers, label: 'Designers' },
    { value: FALLBACK_STATS.paidOut, label: 'Paid Out' },
    { value: FALLBACK_STATS.agents, label: 'AI Agents' },
    { value: FALLBACK_STATS.attributions, label: 'Attributions' },
  ]);

  useEffect(() => {
    async function fetchStats() {
      const [designs, agents, attributions, distributed] = await Promise.all([
        withMockFallback(() => totalDesigns(), null),
        withMockFallback(() => totalAgents(), null),
        withMockFallback(() => totalAttributions(), null),
        withMockFallback(() => totalDistributed(), null),
      ]);

      setStats([
        {
          value: designs !== null ? formatCount(designs) : FALLBACK_STATS.designers,
          label: 'Designers',
        },
        {
          value: distributed !== null ? `$${distributed}` : FALLBACK_STATS.paidOut,
          label: 'Paid Out',
        },
        {
          value: agents !== null ? String(agents) : FALLBACK_STATS.agents,
          label: 'AI Agents',
        },
        {
          value: attributions !== null ? formatCount(attributions) : FALLBACK_STATS.attributions,
          label: 'Attributions',
        },
      ]);
      setStatsLoading(false);
    }

    fetchStats();
  }, [totalDesigns, totalAgents, totalAttributions, totalDistributed]);
  return (
    <div className="min-h-screen bg-c1 relative overflow-x-hidden">
      {/* ── Vertical guide lines ── */}
      <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">
        <div className="max-w-[960px] mx-auto h-full relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-c2 flow-line-v" />
          <div className="absolute right-6 top-0 bottom-0 w-px bg-c2 flow-line-v" />
        </div>
      </div>

      {/* ── Content column — px-6 aligns borders with vertical guides ── */}
      <div className="max-w-[960px] mx-auto px-6">

        {/* ── Hero ── */}
        <section className="border-t border-c2 flow-line">
          <div className="px-8 pb-28 text-center">

            {/* Pill with horizontal dashed lines */}
            <div className="pt-44 mb-10">
              <div className="-mx-8 border-t border-dashed border-c3" />
              <div className="flex justify-center">
                <div className="inline-flex items-center px-3 py-1.5 border-x border-dashed border-c3 bg-c2">
                  <span className="text-[11px] text-c7 font-mono tracking-wider uppercase">EIP-8004</span>
                </div>
              </div>
              <div className="-mx-8 border-t border-dashed border-c3" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-pixel tracking-[-0.02em] text-c12 leading-[1.1] uppercase">
              Own Your
              <br />
              Creative Legacy
            </h1>

            <p className="mt-8 text-sm text-c7 max-w-sm mx-auto leading-relaxed font-mono">
              Designers earn royalties when AI agents use their work.
              Blockchain-verified attribution. Instant settlement.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => { window.location.href = '/dashboard'; }}
                className="group"
              >
                Start Earning
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                How It Works
              </Button>
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section className="border-t border-c2 flow-line">
          <div className="px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 sm:divide-x sm:divide-c2">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center py-8">
                  <p className="text-2xl font-semibold text-c12 tabular-nums tracking-tight font-mono">
                    <span className={statsLoading ? 'animate-skeleton inline-block opacity-40' : ''}>
                      {stat.value}
                    </span>
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-c6 font-mono">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Hatch ── */}
        <div className="border-t border-c2 overflow-hidden">
          <div className="section-hatch" />
        </div>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="border-t border-c2 flow-line">
          <div className="px-8 pt-10 pb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
              How It Works
            </p>
            <h2 className="text-2xl font-pixel uppercase tracking-tight text-c11">
              Three steps to perpetual royalties
            </h2>
          </div>

          <div className="border-t border-c2 flow-line grid grid-cols-1 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Upload & Mint',
                desc: 'Upload your designs. Mint them as dynamic NFTs with custom royalty rates, categories, and license terms.',
              },
              {
                step: '02',
                title: 'Agents Discover',
                desc: 'Verified AI agents browse the on-chain registry, find your work, and request usage through smart contracts.',
              },
              {
                step: '03',
                title: 'Earn Royalties',
                desc: 'Every attribution triggers an instant payment. Track earnings, manage permissions, export reports.',
              },
            ].map((item, i) => (
              <div key={item.step} className={`py-8 px-6 ${i > 0 ? 'sm:border-l border-c2' : ''}`}>
                <span className="text-[10px] font-mono text-c5 uppercase tracking-[0.2em] block mb-3">
                  {item.step}
                </span>
                <h3 className="text-base font-medium text-c11">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-c7 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Hatch ── */}
        <div className="border-t border-c2 overflow-hidden">
          <div className="section-hatch" />
        </div>

        {/* ── Features ── */}
        <section className="border-t border-c2 flow-line">
          <div className="px-8 pt-10 pb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
              Why Eidos
            </p>
            <h2 className="text-2xl font-pixel uppercase tracking-tight text-c11">
              Built for creators in the age of AI
            </h2>
          </div>

          <div className="border-t border-c2 flow-line">
            {[
              {
                title: 'On-Chain Attribution',
                desc: 'Immutable proof of creative ownership. Every usage is recorded on Polygon with full provenance.',
                icon: Link2,
              },
              {
                title: 'Instant Royalties',
                desc: 'Real-time ETH payments via smart contracts. No invoices, no 60-day payment terms.',
                icon: Zap,
              },
              {
                title: 'Agent Registry',
                desc: 'AI agents register with verified identities, trust scores, and declared capabilities.',
                icon: Bot,
              },
              {
                title: 'Full Transparency',
                desc: 'Every attribution is tracked, timestamped, and publicly verifiable on-chain.',
                icon: null,
              },
            ].map((feature, i) => (
              <div key={feature.title} className={`py-8 px-6 sm:inline-block sm:w-1/2 sm:align-top ${i % 2 !== 0 ? 'sm:border-l border-c2' : ''} ${i >= 2 ? 'border-t border-c2' : ''}`}>
                {feature.icon ? (
                  <MorphingIcon icon={feature.icon} className="w-5 h-5 text-c5 mb-3" />
                ) : (
                  <Eye className="w-5 h-5 text-c5 mb-3 icon-blink" strokeWidth={1.5} />
                )}
                <h3 className="text-[15px] font-medium text-c11 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-c7 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Hatch ── */}
        <div className="border-t border-c2 overflow-hidden">
          <div className="section-hatch" />
        </div>

        {/* ── Protocol Architecture ── */}
        <ProtocolStack />

        {/* ── Hatch ── */}
        <div className="border-t border-c2 overflow-hidden">
          <div className="section-hatch" />
        </div>

        {/* ── CTA ── */}
        <section className="border-t border-c2 flow-line">
          <div className="px-8 py-16 text-center">
            <h2 className="text-2xl font-pixel uppercase tracking-tight text-c11">
              Start building your attribution layer
            </h2>
            <p className="mt-4 text-c6 text-sm font-mono">
              Connect your wallet to begin minting and earning.
            </p>
            <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3">
              <WalletButton />
              <Button
                variant="secondary"
                onClick={() => { window.open('https://eips.ethereum.org/EIPS/eip-8004', '_blank'); }}
              >
                Read the EIP
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </section>

      </div>

      <Footer />
      <FlowPulse />
    </div>
  );
}
