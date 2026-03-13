'use client';

import { useState, useCallback } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { getAgentRegistryContract } from '@/lib/contracts';
import type { Agent } from '@/lib/types';

interface UseAgentRegistryReturn {
  registerAgent: (
    name: string,
    description: string,
    capabilities: string[],
    agentCardURI: string,
  ) => Promise<void>;
  getAgent: (agentAddress: string) => Promise<Agent>;
  isRegisteredAgent: (agentAddress: string) => Promise<boolean>;
  totalAgents: () => Promise<number>;
  getAllAgents: () => Promise<Agent[]>;
  loading: boolean;
  error: string | null;
}

function parseAgentStruct(agentAddress: string, raw: unknown[]): Agent {
  return {
    address: agentAddress,
    name: raw[0] as string,
    description: raw[1] as string,
    wallet: raw[2] as string,
    capabilities: raw[3] as string[],
    agentCardURI: raw[4] as string,
    trustScore: Number(raw[5]),
    isActive: raw[6] as boolean,
    registeredAt: Number(raw[7]),
  };
}

export function useAgentRegistry(): UseAgentRegistryReturn {
  const { signer, provider, chainId } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = useCallback(() => {
    const signerOrProvider = signer ?? provider;
    if (!signerOrProvider || !chainId) {
      throw new Error('Wallet not connected');
    }
    return getAgentRegistryContract(signerOrProvider, chainId);
  }, [signer, provider, chainId]);

  const registerAgent = useCallback(
    async (
      name: string,
      description: string,
      capabilities: string[],
      agentCardURI: string,
    ): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const contract = getContract();
        const tx = await contract.registerAgent(name, description, capabilities, agentCardURI);
        await tx.wait();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to register agent';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getContract],
  );

  const getAgent = useCallback(
    async (agentAddress: string): Promise<Agent> => {
      setLoading(true);
      setError(null);
      try {
        const contract = getContract();
        const raw = await contract.getAgent(agentAddress);
        return parseAgentStruct(agentAddress, raw);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch agent';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getContract],
  );

  const isRegisteredAgent = useCallback(
    async (agentAddress: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const contract = getContract();
        return (await contract.isRegisteredAgent(agentAddress)) as boolean;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to check registration';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getContract],
  );

  const totalAgents = useCallback(async (): Promise<number> => {
    setLoading(true);
    setError(null);
    try {
      const contract = getContract();
      const count = await contract.totalAgents();
      return Number(count);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch total agents';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  const getAllAgents = useCallback(async (): Promise<Agent[]> => {
    setLoading(true);
    setError(null);
    try {
      const contract = getContract();
      const count = Number(await contract.totalAgents());
      const agents: Agent[] = [];

      for (let i = 0; i < count; i++) {
        const agentAddress = (await contract.getAgentAtIndex(i)) as string;
        const raw = await contract.getAgent(agentAddress);
        agents.push(parseAgentStruct(agentAddress, raw));
      }

      return agents;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch all agents';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getContract]);

  return {
    registerAgent,
    getAgent,
    isRegisteredAgent,
    totalAgents,
    getAllAgents,
    loading,
    error,
  };
}
