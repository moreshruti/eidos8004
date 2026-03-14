'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { getDesignRegistryContract } from '@/lib/contracts';
import type { DesignMetadata, Artifact } from '@/lib/types';

export function useDesignNFT() {
  const { signer, provider, chainId } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mintDesign = useCallback(
    async (
      title: string,
      description: string,
      category: string,
      ipfsCid: string,
      tags: string[],
      tokenURI: string,
    ): Promise<number> => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getDesignRegistryContract(signer, chainId);
        const tx = await contract.mintDesign(
          title,
          description,
          category,
          ipfsCid,
          tags,
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
        const contract = getDesignRegistryContract(provider, chainId);
        const [design, uri] = await Promise.all([
          contract.getDesign(tokenId),
          contract.tokenURI(tokenId),
        ]);

        return {
          tokenId,
          artist: design.artist,
          title: design.title,
          description: design.description,
          category: design.category,
          ipfsCid: design.ipfsCid,
          tags: [...design.tags],
          thresholdPrice: design.thresholdPrice,
          createdAt: Number(design.createdAt),
          isPublic: design.isPublic,
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
    async (address: string): Promise<number[]> => {
      if (!provider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getDesignRegistryContract(provider, chainId);
        const ids: bigint[] = await contract.getArtistDesigns(address);
        return ids.map(Number);
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
      const contract = getDesignRegistryContract(provider, chainId);
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

  const addArtifact = useCallback(
    async (
      designId: number,
      name: string,
      description: string,
      priceInWei: bigint,
    ): Promise<void> => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getDesignRegistryContract(signer, chainId);
        const tx = await contract.addArtifact(
          designId,
          name,
          description,
          priceInWei,
        );
        await tx.wait();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to add artifact';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  const getDesignArtifacts = useCallback(
    async (designId: number): Promise<Artifact[]> => {
      if (!provider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getDesignRegistryContract(provider, chainId);
        const artifacts = await contract.getDesignArtifacts(designId);
        return artifacts.map((a: Record<string, unknown>) => ({
          name: a.name as string,
          description: a.description as string,
          priceInWei: a.priceInWei as bigint,
          active: a.active as boolean,
        }));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch design artifacts';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [provider, chainId],
  );

  const calculateArtifactsCost = useCallback(
    async (designId: number, artifactIds: number[]): Promise<bigint> => {
      if (!provider || !chainId) {
        throw new Error('Provider not available');
      }

      try {
        const contract = getDesignRegistryContract(provider, chainId);
        const cost: bigint = await contract.calculateArtifactsCost(
          designId,
          artifactIds,
        );
        return cost;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to calculate artifacts cost';
        setError(message);
        throw err;
      }
    },
    [provider, chainId],
  );

  return {
    mintDesign,
    getDesign,
    getDesignerPortfolio,
    totalDesigns,
    addArtifact,
    getDesignArtifacts,
    calculateArtifactsCost,
    loading,
    error,
  };
}
