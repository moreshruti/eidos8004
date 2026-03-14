import { ethers } from 'ethers';
import DesignRegistryABI from './abis/DesignRegistry.json';
import AgentRegistryABI from './abis/AgentRegistry.json';
import AttributionPaymentABI from './abis/AttributionPayment.json';
import ReputationForumABI from './abis/ReputationForum.json';
import { getChainConfig } from './network-config';

type ContractName = 'designRegistry' | 'agentRegistry' | 'attributionPayment' | 'reputationForum';

export function getContractAddress(chainId: number, contractName: ContractName): string {
  const config = getChainConfig(chainId);
  if (!config) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }
  return config.contracts[contractName];
}

export function getDesignRegistryContract(signerOrProvider: ethers.Signer | ethers.Provider, chainId: number) {
  const address = getContractAddress(chainId, 'designRegistry');
  return new ethers.Contract(address, DesignRegistryABI, signerOrProvider);
}

export function getAgentRegistryContract(signerOrProvider: ethers.Signer | ethers.Provider, chainId: number) {
  const address = getContractAddress(chainId, 'agentRegistry');
  return new ethers.Contract(address, AgentRegistryABI, signerOrProvider);
}

export function getAttributionPaymentContract(signerOrProvider: ethers.Signer | ethers.Provider, chainId: number) {
  const address = getContractAddress(chainId, 'attributionPayment');
  return new ethers.Contract(address, AttributionPaymentABI, signerOrProvider);
}

export function getReputationForumContract(signerOrProvider: ethers.Signer | ethers.Provider, chainId: number) {
  const address = getContractAddress(chainId, 'reputationForum');
  return new ethers.Contract(address, ReputationForumABI, signerOrProvider);
}

// Helper to format ETH values
export function formatEth(wei: bigint): string {
  return ethers.formatEther(wei);
}

// Helper to parse ETH values
export function parseEth(eth: string): bigint {
  return ethers.parseEther(eth);
}
