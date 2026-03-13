'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { getRoyaltyContract, formatEth } from '@/lib/contracts';

export function useRoyaltyDistribution() {
  const { signer, provider, chainId } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const depositRoyalty = useCallback(
    async (designId: number, ethAmount: string) => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getRoyaltyContract(signer, chainId);
        const value = ethers.parseEther(ethAmount);
        const tx = await contract.depositRoyalty(designId, { value });
        await tx.wait();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to deposit royalty';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  const claimRoyalties = useCallback(async () => {
    if (!signer || !chainId) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getRoyaltyContract(signer, chainId);
      const tx = await contract.claimRoyalties();
      await tx.wait();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to claim royalties';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, chainId]);

  const getRoyaltyBalance = useCallback(
    async (designerAddress: string): Promise<string> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getRoyaltyContract(signerOrProvider, chainId);
        const balance: bigint = await contract.getRoyaltyBalance(designerAddress);
        return formatEth(balance);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to fetch royalty balance';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const totalDistributed = useCallback(async (): Promise<string> => {
    const signerOrProvider = signer ?? provider;
    if (!signerOrProvider || !chainId) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getRoyaltyContract(signerOrProvider, chainId);
      const total: bigint = await contract.totalDistributed();
      return formatEth(total);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch total distributed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, provider, chainId]);

  return {
    depositRoyalty,
    claimRoyalties,
    getRoyaltyBalance,
    totalDistributed,
    loading,
    error,
  };
}
