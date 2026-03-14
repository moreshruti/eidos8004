export enum AgentType {
  CLIENT = 0,
  ARTIST = 1,
}

export interface Artifact {
  name: string;
  description: string;
  priceInWei: bigint;
  active: boolean;
}

export interface DesignMetadata {
  tokenId: number;
  artist: string;
  title: string;
  description: string;
  category: string;
  ipfsCid: string;
  tags: string[];
  thresholdPrice: bigint;
  createdAt: number;
  isPublic: boolean;
  tokenURI?: string;
}

export interface Agent {
  agentId: number;
  wallet: string;
  agentType: AgentType;
  name: string;
  description: string;
  capabilitiesURI: string;
  registeredAt: number;
  active: boolean;
  reputationScore?: number;
}

export interface Feedback {
  submitter: string;
  agentId: number;
  score: number;
  tag: string;
  uri: string;
  timestamp: number;
}

export interface ValidationRequest {
  agentId: number;
  requester: string;
  requestURI: string;
  fulfilled: boolean;
  responseURI: string;
  result: number;
  timestamp: number;
}

export interface Attribution {
  id: number;
  designId: number;
  clientAgent: string;
  artistAgent: string;
  artist: string;
  artifactIds: number[];
  totalPaid: string; // formatted ETH
  x402ProofHash: string;
  timestamp: number;
}

export interface ForumPost {
  id: number;
  author: string;
  content: string;
  tags: string[];
  parentId: number;
  createdAt: number;
  upvotes: number;
  downvotes: number;
  isActive: boolean;
}

export interface LiveEvent {
  id: number;
  eventType: string;
  actor: string;
  data: string;
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
