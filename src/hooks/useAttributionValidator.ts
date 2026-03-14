'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { getAttributionPaymentContract, formatEth, parseEth } from '@/lib/contracts';
import type { Attribution } from '@/lib/types';

function mapAttribution(id: number, raw: Record<string, unknown>): Attribution {
  return {
    id,
    designId: Number(raw.designId),
    clientAgent: raw.clientAgent as string,
    artistAgent: raw.artistAgent as string,
    artist: raw.artist as string,
    artifactIds: (raw.artifactIds as bigint[]).map((aid: bigint) => Number(aid)),
    totalPaid: formatEth(raw.totalPaid as bigint),
    x402ProofHash: raw.x402ProofHash as string,
    timestamp: Number(raw.timestamp),
  };
}

export function useAttributionValidator() {
  const { signer, provider, chainId } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payForArtifacts = useCallback(
    async (
      designId: number,
      artifactIds: number[],
      x402ProofHash: string,
      ethValue: string,
    ): Promise<number> => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAttributionPaymentContract(signer, chainId);
        const tx = await contract.payForArtifacts(
          designId,
          artifactIds,
          x402ProofHash,
          { value: parseEth(ethValue) },
        );
        const receipt = await tx.wait();

        const paidEvent = receipt.logs
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
              parsed?.name === 'AttributionPaid',
          );

        if (!paidEvent) {
          throw new Error(
            'AttributionPaid event not found in transaction receipt',
          );
        }

        return Number(paidEvent.args.attributionId);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to pay for artifacts';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  const getAttribution = useCallback(
    async (id: number): Promise<Attribution> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAttributionPaymentContract(
          signerOrProvider,
          chainId,
        );
        const attr = await contract.getAttribution(id);
        return mapAttribution(id, attr);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch attribution';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const getAttributionsByDesigner = useCallback(
    async (artist: string): Promise<Attribution[]> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAttributionPaymentContract(
          signerOrProvider,
          chainId,
        );
        const ids: bigint[] = await contract.getArtistAttributions(artist);
        const attributions = await Promise.all(
          ids.map(async (attrId: bigint) => {
            const attr = await contract.getAttribution(Number(attrId));
            return mapAttribution(Number(attrId), attr);
          }),
        );
        return attributions;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch attributions by designer';
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
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAttributionPaymentContract(
          signerOrProvider,
          chainId,
        );
        const ids: bigint[] =
          await contract.getDesignAttributionHistory(designId);
        const attributions = await Promise.all(
          ids.map(async (attrId: bigint) => {
            const attr = await contract.getAttribution(Number(attrId));
            return mapAttribution(Number(attrId), attr);
          }),
        );
        return attributions;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch attributions by design';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const getAttributionsByAgent = useCallback(
    async (clientAddress: string): Promise<Attribution[]> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getAttributionPaymentContract(
          signerOrProvider,
          chainId,
        );
        const ids: bigint[] =
          await contract.getClientAttributions(clientAddress);
        const attributions = await Promise.all(
          ids.map(async (attrId: bigint) => {
            const attr = await contract.getAttribution(Number(attrId));
            return mapAttribution(Number(attrId), attr);
          }),
        );
        return attributions;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch attributions by agent';
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
      throw new Error('Provider not available');
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getAttributionPaymentContract(
        signerOrProvider,
        chainId,
      );
      const stats = await contract.getStats();
      return Number(stats[2]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch total attributions';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, provider, chainId]);

  const totalDistributed = useCallback(async (): Promise<string> => {
    const signerOrProvider = signer ?? provider;
    if (!signerOrProvider || !chainId) {
      throw new Error('Provider not available');
    }

    setLoading(true);
    setError(null);

    try {
      const contract = getAttributionPaymentContract(
        signerOrProvider,
        chainId,
      );
      const stats = await contract.getStats();
      return formatEth(stats[1]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to fetch total distributed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [signer, provider, chainId]);

  return {
    payForArtifacts,
    getAttribution,
    getAttributionsByDesigner,
    getAttributionsByDesign,
    getAttributionsByAgent,
    totalAttributions,
    totalDistributed,
    loading,
    error,
  };
}
