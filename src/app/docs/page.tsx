export default function DocsPage() {
  return (
    <div>
      {/* Header */}
      <section className="border-t border-c2 flow-line">
        <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
          Documentation
        </p>
        <h1 className="text-2xl font-pixel uppercase tracking-tight text-c11">
          EIP-8004: Creative Attribution Protocol
        </h1>
      </section>

      {/* Hatch */}
      <div className="border-t border-c2 overflow-hidden">
        <div className="section-hatch" />
      </div>

      {/* What is EIP-8004 */}
      <section className="border-t border-c2 flow-line">
        <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
          Overview
        </p>
        <h2 className="text-lg font-pixel uppercase text-c11 mb-6">
          What is EIP-8004
        </h2>
        <div className="space-y-4 text-sm text-c7 font-mono leading-relaxed max-w-[640px]">
          <p>
            An Ethereum standard for on-chain creative attribution.
          </p>
          <p>
            Designers mint work as NFTs. AI agents register with verified identity.
            Every usage is recorded on-chain. Royalties distribute instantly.
          </p>
          <p>
            No middlemen. No delayed payments. No ambiguity about who made what.
          </p>
        </div>
      </section>

      {/* Hatch */}
      <div className="border-t border-c2 overflow-hidden">
        <div className="section-hatch" />
      </div>

      {/* How Attribution Works */}
      <section className="border-t border-c2 flow-line">
        <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
          Process
        </p>
        <h2 className="text-lg font-pixel uppercase text-c11 mb-8">
          How Attribution Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-c2">
          {[
            {
              step: '01',
              title: 'Mint',
              desc: 'Designer mints design as NFT with royalty rate',
            },
            {
              step: '02',
              title: 'Register',
              desc: 'AI agent registers with verified identity',
            },
            {
              step: '03',
              title: 'Attribute',
              desc: 'Agent attributes a design, triggering on-chain record',
            },
            {
              step: '04',
              title: 'Distribute',
              desc: 'Royalties auto-distribute to designer wallet',
            },
          ].map((item) => (
            <div key={item.step} className="bg-c1 p-6">
              <p className="text-[10px] font-mono text-c5 mb-2">{item.step}</p>
              <p className="text-c11 font-medium mb-1">{item.title}</p>
              <p className="text-sm text-c7 font-mono leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Hatch */}
      <div className="border-t border-c2 overflow-hidden">
        <div className="section-hatch" />
      </div>

      {/* Smart Contracts */}
      <section className="border-t border-c2 flow-line">
        <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
          Architecture
        </p>
        <h2 className="text-lg font-pixel uppercase text-c11 mb-8">
          Smart Contracts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-c2">
          {[
            {
              name: 'DesignNFT',
              desc: 'ERC-721 for minting and managing design assets',
            },
            {
              name: 'AgentRegistry',
              desc: 'Registration and trust scoring for AI agents',
            },
            {
              name: 'AttributionValidator',
              desc: 'Records and validates usage attributions',
            },
            {
              name: 'RoyaltyDistribution',
              desc: 'Handles royalty deposits and claims',
            },
          ].map((contract) => (
            <div key={contract.name} className="bg-c1 p-6">
              <p className="font-mono text-c11 mb-1">{contract.name}</p>
              <p className="text-sm text-c7 font-mono leading-relaxed">
                {contract.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Hatch */}
      <div className="border-t border-c2 overflow-hidden">
        <div className="section-hatch" />
      </div>

      {/* API Reference */}
      <section className="border-t border-c2 flow-line">
        <p className="text-[10px] font-mono text-c5 tracking-[0.2em] uppercase mb-4">
          API Reference
        </p>
        <h2 className="text-lg font-pixel uppercase text-c11 mb-8">
          Contract Functions
        </h2>
        <div className="space-y-6">
          <div>
            <p className="text-c9 font-medium text-sm mb-2">DesignNFT</p>
            <div className="bg-c2 border border-c3 p-4 font-mono text-xs text-c9 overflow-x-auto">
              <p>mintDesign(title, category, tags, royaltyBps, isPublic, ipfsHash, metadataURI)</p>
              <p>getDesign(tokenId)</p>
              <p>getDesignerPortfolio(address)</p>
              <p>updateDesignMetadata(tokenId, title, category, isPublic)</p>
            </div>
          </div>
          <div>
            <p className="text-c9 font-medium text-sm mb-2">AgentRegistry</p>
            <div className="bg-c2 border border-c3 p-4 font-mono text-xs text-c9 overflow-x-auto">
              <p>registerAgent(name, capabilities, metadataURI)</p>
              <p>getAgent(address)</p>
              <p>isRegisteredAgent(address)</p>
              <p>getAllAgents()</p>
            </div>
          </div>
          <div>
            <p className="text-c9 font-medium text-sm mb-2">AttributionValidator</p>
            <div className="bg-c2 border border-c3 p-4 font-mono text-xs text-c9 overflow-x-auto">
              <p>validateAttribution(designId, agentAddress, usageType, context)</p>
              <p>getAttributionsByDesign(designId)</p>
              <p>getAttributionsByDesigner(address)</p>
            </div>
          </div>
          <div>
            <p className="text-c9 font-medium text-sm mb-2">RoyaltyDistribution</p>
            <div className="bg-c2 border border-c3 p-4 font-mono text-xs text-c9 overflow-x-auto">
              <p>depositRoyalty(designId)</p>
              <p>claimRoyalties()</p>
              <p>getRoyaltyBalance(address)</p>
              <p>totalDistributed()</p>
            </div>
          </div>
        </div>
      </section>

      {/* Hatch */}
      <div className="border-t border-c2 overflow-hidden">
        <div className="section-hatch" />
      </div>

      {/* Integration Example */}
      <section className="border-t border-c2 flow-line">
        <p className="text-[10px] font-mono text-c5 tracking-[0.2em] uppercase mb-4">
          Integration
        </p>
        <h2 className="text-lg font-pixel uppercase text-c11 mb-8">
          Integration Example
        </h2>
        <pre className="bg-c2 border border-c3 p-4 font-mono text-xs text-c9 overflow-x-auto">
{`import { ethers } from 'ethers'
import DesignNFT from './abis/DesignNFT.json'

const provider = new ethers.BrowserProvider(window.ethereum)
const signer = await provider.getSigner()
const contract = new ethers.Contract(DESIGN_NFT_ADDRESS, DesignNFT, signer)

// Mint a design
const tx = await contract.mintDesign(
  'My Design',
  'UI Design',
  ['minimal', 'dark'],
  500,    // 5% royalty
  true,   // public
  ipfsHash,
  metadataURI
)
await tx.wait()`}
        </pre>
      </section>

      {/* Hatch */}
      <div className="border-t border-c2 overflow-hidden">
        <div className="section-hatch" />
      </div>

      {/* Getting Started */}
      <section className="border-t border-c2 flow-line">
        <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
          Quick Start
        </p>
        <h2 className="text-lg font-pixel uppercase text-c11 mb-8">
          Getting Started
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-c2">
          {/* For Designers */}
          <div className="bg-c1 p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
              For Designers
            </p>
            <ol className="space-y-3">
              {[
                'Connect wallet',
                'Upload design',
                'Set royalty rate',
                'Start earning',
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="text-[10px] font-mono text-c5 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-c7 font-mono">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* For Agent Operators */}
          <div className="bg-c1 p-6">
            <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
              For Agent Operators
            </p>
            <ol className="space-y-3">
              {[
                'Connect wallet',
                'Register agent',
                'Set capabilities',
                'Begin attributing',
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="text-[10px] font-mono text-c5 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-c7 font-mono">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Final hatch */}
      <div className="border-t border-c2 overflow-hidden">
        <div className="section-hatch" />
      </div>
    </div>
  )
}
