'use client';

import { useState, useCallback } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { getAttributionContract } from '@/lib/contracts';
import type { Attribution } from '@/lib/types';

interface ContractAttribution {
  id: bigint;
  agent: string;
  designer: string;
  designId: bigint;
  usageType: string;
  royaltyAmount: bigint;
  timestamp: bigint;
}

function mapAttribution(raw: ContractAttribution): Attribution {
  return {
    id: Number(raw.id),
    agentAddress: raw.agent,
    designerAddress: raw.designer,
    designId: Number(raw.designId),
    usageType: raw.usageType,
    royaltyAmount: raw.royaltyAmount.toString(),
    timestamp: Number(raw.timestamp),
  };
}

export function useAttributionValidator() {
  const { signer, provider, chainId } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAttribution = useCallback(
    async (designId: number, usageType: string) => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAttributionContract(signer, chainId);
        const tx = await contract.validateAttribution(designId, usageType);
        await tx.wait();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to validate attribution';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  const getAttributionsByDesigner = useCallback(
    async (designerAddress: string): Promise<Attribution[]> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAttributionContract(signerOrProvider, chainId);
        const raw: ContractAttribution[] = await contract.getAttributionsByDesigner(designerAddress);
        return raw.map(mapAttribution);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch attributions by designer';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const getAttributionsByDesign = useCallback(
    async (designId: number): Promise<Attribution[]> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAttributionContract(signerOrProvider, chainId);
        const raw: ContractAttribution[] = await contract.getAttributionsByDesign(designId);
        return raw.map(mapAttribution);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch attributions by design';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const getAttributionsByAgent = useCallback(
    async (agentAddress: string): Promise<Attribution[]> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAttributionContract(signerOrProvider, chainId);
        const raw: ContractAttribution[] = await contract.getAttributionsByAgent(agentAddress);
        return raw.map(mapAttribution);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch attributions by agent';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const totalAttributions = useCallback(async (): Promise<number> => {
    const signerOrProvider = signer ?? provider;
    if (!signerOrProvider || !chainId) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getAttributionContract(signerOrProvider, chainId);
      const total: bigint = await contract.totalAttributions();
      return Number(total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch total attributions';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, provider, chainId]);

  return {
    validateAttribution,
    getAttributionsByDesigner,
    getAttributionsByDesign,
    getAttributionsByAgent,
    totalAttributions,
    loading,
    error,
  };
}
