import { ethers } from 'ethers';
import DesignNFTABI from './abis/DesignNFT.json';
import AgentRegistryABI from './abis/AgentRegistry.json';
import AttributionValidatorABI from './abis/AttributionValidator.json';
import RoyaltyDistributionABI from './abis/RoyaltyDistribution.json';
import { getChainConfig } from './network-config';

type ContractName = 'designNFT' | 'agentRegistry' | 'attributionValidator' | 'royaltyDistribution';

export function getContractAddress(chainId: number, contractName: ContractName): string {
  const config = getChainConfig(chainId);
  if (!config) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }
  return config.contracts[contractName];
}

export function getDesignNFTContract(signerOrProvider: ethers.Signer | ethers.Provider, chainId: number) {
  const address = getContractAddress(chainId, 'designNFT');
  return new ethers.Contract(address, DesignNFTABI, signerOrProvider);
}

export function getAgentRegistryContract(signerOrProvider: ethers.Signer | ethers.Provider, chainId: number) {
  const address = getContractAddress(chainId, 'agentRegistry');
  return new ethers.Contract(address, AgentRegistryABI, signerOrProvider);
}

export function getAttributionContract(signerOrProvider: ethers.Signer | ethers.Provider, chainId: number) {
  const address = getContractAddress(chainId, 'attributionValidator');
  return new ethers.Contract(address, AttributionValidatorABI, signerOrProvider);
}

export function getRoyaltyContract(signerOrProvider: ethers.Signer | ethers.Provider, chainId: number) {
  const address = getContractAddress(chainId, 'royaltyDistribution');
  return new ethers.Contract(address, RoyaltyDistributionABI, signerOrProvider);
}

// Helper to format ETH values
export function formatEth(wei: bigint): string {
  return ethers.formatEther(wei);
}

// Helper to parse ETH values
export function parseEth(eth: string): bigint {
  return ethers.parseEther(eth);
}
