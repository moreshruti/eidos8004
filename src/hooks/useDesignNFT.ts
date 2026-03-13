'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { getDesignNFTContract } from '@/lib/contracts';
import type { DesignMetadata } from '@/lib/types';

export function useDesignNFT() {
  const { signer, provider, chainId } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintDesign = useCallback(
    async (
      title: string,
      category: string,
      tags: string[],
      baseRoyaltyBps: number,
      isPublic: boolean,
      ipfsHash: string,
      tokenURI: string,
    ): Promise<number> => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getDesignNFTContract(signer, chainId);
        const tx = await contract.mintDesign(
          title,
          category,
          tags,
          baseRoyaltyBps,
          isPublic,
          ipfsHash,
          tokenURI,
        );
        const receipt = await tx.wait();

        const mintedEvent = receipt.logs
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
              parsed?.name === 'DesignMinted',
          );

        if (!mintedEvent) {
          throw new Error('DesignMinted event not found in transaction receipt');
        }

        const tokenId = Number(mintedEvent.args.tokenId);
        return tokenId;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to mint design';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  const getDesign = useCallback(
    async (tokenId: number): Promise<DesignMetadata> => {
      if (!provider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getDesignNFTContract(provider, chainId);
        const [design, uri] = await Promise.all([
          contract.getDesign(tokenId),
          contract.tokenURI(tokenId),
        ]);

        return {
          tokenId,
          title: design.title,
          category: design.category,
          tags: design.tags as string[],
          baseRoyaltyBps: Number(design.baseRoyaltyBps),
          isPublic: design.isPublic,
          ipfsHash: design.ipfsHash,
          creator: design.creator,
          createdAt: Number(design.createdAt),
          tokenURI: uri as string,
        };
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch design';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider, chainId],
  );

  const getDesignerPortfolio = useCallback(
    async (designerAddress: string): Promise<number[]> => {
      if (!provider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getDesignNFTContract(provider, chainId);
        const tokenIds: bigint[] = await contract.getDesignerPortfolio(
          designerAddress,
        );
        return tokenIds.map(Number);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch designer portfolio';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider, chainId],
  );

  const totalDesigns = useCallback(async (): Promise<number> => {
    if (!provider || !chainId) {
      throw new Error('Provider not available');
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getDesignNFTContract(provider, chainId);
      const total: bigint = await contract.totalDesigns();
      return Number(total);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch total designs';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [provider, chainId]);

  const updateDesignMetadata = useCallback(
    async (
      tokenId: number,
      title: string,
      category: string,
      isPublic: boolean,
    ): Promise<void> => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getDesignNFTContract(signer, chainId);
        const tx = await contract.updateDesignMetadata(
          tokenId,
          title,
          category,
          isPublic,
        );
        await tx.wait();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to update design metadata';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  return {
    mintDesign,
    getDesign,
    getDesignerPortfolio,
    totalDesigns,
    updateDesignMetadata,
    loading,
    error,
  };
}
