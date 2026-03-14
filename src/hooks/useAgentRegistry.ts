'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { getAgentRegistryContract } from '@/lib/contracts';
import type { Agent, Feedback } from '@/lib/types';

export function useAgentRegistry() {
  const { signer, provider, chainId } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerAgent = useCallback(
    async (
      agentType: number,
      name: string,
      description: string,
      capabilitiesURI: string,
      tokenURI: string,
    ): Promise<number> => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAgentRegistryContract(signer, chainId);
        const tx = await contract.registerAgent(
          agentType,
          name,
          description,
          capabilitiesURI,
          tokenURI,
        );
        const receipt = await tx.wait();

        const registeredEvent = receipt.logs
          .map((log: ethers.Log) => {
            try {
              return contract.interface.parseLog({
                topics: log.topics as string[],
                data: log.data,
              });
            } catch {
              return null;
            }
          })
          .find(
            (parsed: ethers.LogDescription | null) =>
              parsed?.name === 'AgentRegistered',
          );

        if (!registeredEvent) {
          throw new Error(
            'AgentRegistered event not found in transaction receipt',
          );
        }

        return Number(registeredEvent.args.agentId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to register agent';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  const getAgent = useCallback(
    async (agentId: number): Promise<Agent> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAgentRegistryContract(signerOrProvider, chainId);
        const agent = await contract.getAgent(agentId);
        const reputationScore = await contract
          .getReputationScore(agentId)
          .catch(() => BigInt(0));

        return {
          agentId,
          wallet: agent.wallet,
          agentType: Number(agent.agentType),
          name: agent.name,
          description: agent.description,
          capabilitiesURI: agent.capabilitiesURI,
          registeredAt: Number(agent.registeredAt),
          active: agent.active,
          reputationScore: Number(reputationScore),
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch agent';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const getAgentByWallet = useCallback(
    async (wallet: string): Promise<Agent> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAgentRegistryContract(signerOrProvider, chainId);
        const agent = await contract.getAgentByWallet(wallet);
        const agentId = Number(await contract.walletToAgentId(wallet));
        const reputationScore = await contract
          .getReputationScore(agentId)
          .catch(() => BigInt(0));

        return {
          agentId,
          wallet: agent.wallet,
          agentType: Number(agent.agentType),
          name: agent.name,
          description: agent.description,
          capabilitiesURI: agent.capabilitiesURI,
          registeredAt: Number(agent.registeredAt),
          active: agent.active,
          reputationScore: Number(reputationScore),
        };
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch agent by wallet';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const isRegisteredAgent = useCallback(
    async (walletAddress: string): Promise<boolean> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAgentRegistryContract(signerOrProvider, chainId);
        return (await contract.isRegisteredAgent(walletAddress)) as boolean;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to check registration';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const totalAgents = useCallback(async (): Promise<number> => {
    const signerOrProvider = signer ?? provider;
    if (!signerOrProvider || !chainId) {
      throw new Error('Provider not available');
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getAgentRegistryContract(signerOrProvider, chainId);
      const count = await contract.totalAgents();
      return Number(count);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch total agents';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, provider, chainId]);

  const getAllAgents = useCallback(async (): Promise<Agent[]> => {
    const signerOrProvider = signer ?? provider;
    if (!signerOrProvider || !chainId) {
      throw new Error('Provider not available');
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getAgentRegistryContract(signerOrProvider, chainId);
      const count = Number(await contract.totalAgents());
      const agents: Agent[] = [];

      for (let i = 1; i <= count; i++) {
        try {
          const agent = await contract.getAgent(i);
          const reputationScore = await contract
            .getReputationScore(i)
            .catch(() => BigInt(0));

          agents.push({
            agentId: i,
            wallet: agent.wallet,
            agentType: Number(agent.agentType),
            name: agent.name,
            description: agent.description,
            capabilitiesURI: agent.capabilitiesURI,
            registeredAt: Number(agent.registeredAt),
            active: agent.active,
            reputationScore: Number(reputationScore),
          });
        } catch {
          // Skip agents that fail to load (e.g. burned tokens)
        }
      }

      return agents;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch all agents';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, provider, chainId]);

  const submitFeedback = useCallback(
    async (
      agentId: number,
      score: number,
      tag: string,
      uri: string,
    ): Promise<void> => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAgentRegistryContract(signer, chainId);
        const tx = await contract.submitFeedback(agentId, score, tag, uri);
        await tx.wait();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to submit feedback';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  const getReputationScore = useCallback(
    async (agentId: number): Promise<number> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      try {
        const contract = getAgentRegistryContract(signerOrProvider, chainId);
        const score = await contract.getReputationScore(agentId);
        return Number(score);
      } catch {
        return 0;
      }
    },
    [signer, provider, chainId],
  );

  const getAgentFeedbacks = useCallback(
    async (agentId: number): Promise<Feedback[]> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAgentRegistryContract(signerOrProvider, chainId);
        const feedbacks = await contract.getAgentFeedbacks(agentId);
        return feedbacks.map((f: Record<string, unknown>) => ({
          submitter: f.submitter as string,
          agentId: Number(f.agentId),
          score: Number(f.score),
          tag: f.tag as string,
          uri: f.uri as string,
          timestamp: Number(f.timestamp),
        }));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch agent feedbacks';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  return {
    registerAgent,
    getAgent,
    getAgentByWallet,
    isRegisteredAgent,
    totalAgents,
    getAllAgents,
    submitFeedback,
    getReputationScore,
    getAgentFeedbacks,
    loading,
    error,
  };
}
