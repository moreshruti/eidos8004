export interface DesignMetadata {
  tokenId: number;
  title: string;
  category: string;
  tags: string[];
  baseRoyaltyBps: number;
  isPublic: boolean;
  ipfsHash: string;
  creator: string;
  createdAt: number;
  tokenURI?: string;
}

export interface Agent {
  address: string;
  name: string;
  description: string;
  wallet: string;
  capabilities: string[];
  agentCardURI: string;
  trustScore: number;
  isActive: boolean;
  registeredAt: number;
}

export interface Attribution {
  id: number;
  agentAddress: string;
  designerAddress: string;
  designId: number;
  usageType: string;
  royaltyAmount: string;
  timestamp: number;
}

export interface DesignerMetrics {
  totalEarned: string;
  totalAttributions: number;
  activeDesigns: number;
  uniqueAgents: number;
  monthlyEarnings: { month: string; amount: number }[];
}

export type WalletState = {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
};
