export type SupportedChainId = 31337 | 80002 | 84532;

interface ContractAddresses {
  designRegistry: string;
  agentRegistry: string;
  attributionPayment: string;
  reputationForum: string;
}

interface ChainConfig {
  name: string;
  rpcUrl: string;
  contracts: ContractAddresses;
  blockExplorerUrl?: string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const SUPPORTED_CHAINS: Record<SupportedChainId, ChainConfig> = {
  31337: {
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    contracts: {
      designRegistry: process.env.NEXT_PUBLIC_DESIGN_REGISTRY_ADDRESS || ZERO_ADDRESS,
      agentRegistry: process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || ZERO_ADDRESS,
      attributionPayment: process.env.NEXT_PUBLIC_ATTRIBUTION_PAYMENT_ADDRESS || ZERO_ADDRESS,
      reputationForum: process.env.NEXT_PUBLIC_REPUTATION_FORUM_ADDRESS || ZERO_ADDRESS,
    },
  },
  80002: {
    name: 'Polygon Amoy',
    rpcUrl: process.env.NEXT_PUBLIC_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
    contracts: {
      designRegistry: process.env.NEXT_PUBLIC_DESIGN_REGISTRY_ADDRESS || ZERO_ADDRESS,
      agentRegistry: process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || ZERO_ADDRESS,
      attributionPayment: process.env.NEXT_PUBLIC_ATTRIBUTION_PAYMENT_ADDRESS || ZERO_ADDRESS,
      reputationForum: process.env.NEXT_PUBLIC_REPUTATION_FORUM_ADDRESS || ZERO_ADDRESS,
    },
    blockExplorerUrl: 'https://amoy.polygonscan.com',
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18,
    },
  },
  84532: {
    name: 'Base Sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org',
    contracts: {
      designRegistry: process.env.NEXT_PUBLIC_DESIGN_REGISTRY_ADDRESS || ZERO_ADDRESS,
      agentRegistry: process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS || ZERO_ADDRESS,
      attributionPayment: process.env.NEXT_PUBLIC_ATTRIBUTION_PAYMENT_ADDRESS || ZERO_ADDRESS,
      reputationForum: process.env.NEXT_PUBLIC_REPUTATION_FORUM_ADDRESS || ZERO_ADDRESS,
    },
    blockExplorerUrl: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

export function getChainConfig(chainId: number): ChainConfig | undefined {
  return SUPPORTED_CHAINS[chainId as SupportedChainId];
}

export function isSupportedChain(chainId: number): chainId is SupportedChainId {
  return chainId in SUPPORTED_CHAINS;
}
