'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/context/Web3Context';
import { getReputationForumContract } from '@/lib/contracts';
import type { ForumPost, LiveEvent } from '@/lib/types';

function mapPost(raw: Record<string, unknown>): ForumPost {
  return {
    id: Number(raw.id),
    author: raw.author as string,
    content: raw.content as string,
    tags: [...(raw.tags as string[])],
    parentId: Number(raw.parentId),
    createdAt: Number(raw.createdAt),
    upvotes: Number(raw.upvotes),
    downvotes: Number(raw.downvotes),
    isActive: raw.isActive as boolean,
  };
}

function mapEvent(raw: Record<string, unknown>): LiveEvent {
  return {
    id: Number(raw.id),
    eventType: raw.eventType as string,
    actor: raw.actor as string,
    data: raw.data as string,
    timestamp: Number(raw.timestamp),
  };
}

export function useReputationForum() {
  const { signer, provider, chainId } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPost = useCallback(
    async (content: string, tags: string[]): Promise<number> => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getReputationForumContract(signer, chainId);
        const tx = await contract.createPost(content, tags);
        const receipt = await tx.wait();

        const postEvent = receipt.logs
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
              parsed?.name === 'PostCreated',
          );

        if (!postEvent) {
          throw new Error(
            'PostCreated event not found in transaction receipt',
          );
        }

        return Number(postEvent.args.postId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create post';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  const reply = useCallback(
    async (parentId: number, content: string): Promise<number> => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getReputationForumContract(signer, chainId);
        const tx = await contract.reply(parentId, content);
        const receipt = await tx.wait();

        const postEvent = receipt.logs
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
              parsed?.name === 'PostCreated',
          );

        if (!postEvent) {
          throw new Error(
            'PostCreated event not found in transaction receipt',
          );
        }

        return Number(postEvent.args.postId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to reply to post';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  const vote = useCallback(
    async (postId: number, isUpvote: boolean): Promise<void> => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getReputationForumContract(signer, chainId);
        const tx = await contract.vote(postId, isUpvote);
        await tx.wait();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to vote on post';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  const removePost = useCallback(
    async (postId: number): Promise<void> => {
      if (!signer || !chainId) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getReputationForumContract(signer, chainId);
        const tx = await contract.removePost(postId);
        await tx.wait();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to remove post';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, chainId],
  );

  const getPost = useCallback(
    async (postId: number): Promise<ForumPost> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getReputationForumContract(
          signerOrProvider,
          chainId,
        );
        const post = await contract.getPost(postId);
        return mapPost(post);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch post';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const getRecentPosts = useCallback(
    async (count: number): Promise<ForumPost[]> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getReputationForumContract(
          signerOrProvider,
          chainId,
        );
        const posts = await contract.getRecentPosts(count);
        return posts.map((p: Record<string, unknown>) => mapPost(p));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch recent posts';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const getRecentEvents = useCallback(
    async (count: number): Promise<LiveEvent[]> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getReputationForumContract(
          signerOrProvider,
          chainId,
        );
        const events = await contract.getRecentEvents(count);
        return events.map((e: Record<string, unknown>) => mapEvent(e));
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch recent events';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const getUserPosts = useCallback(
    async (user: string): Promise<ForumPost[]> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getReputationForumContract(
          signerOrProvider,
          chainId,
        );
        const postIds: bigint[] = await contract.getUserPosts(user);
        const posts = await Promise.all(
          postIds.map(async (id: bigint) => {
            const post = await contract.getPost(Number(id));
            return mapPost(post);
          }),
        );
        return posts;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch user posts';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  const getPostReplies = useCallback(
    async (postId: number): Promise<ForumPost[]> => {
      const signerOrProvider = signer ?? provider;
      if (!signerOrProvider || !chainId) {
        throw new Error('Provider not available');
      }

      setLoading(true);
      setError(null);

      try {
        const contract = getReputationForumContract(
          signerOrProvider,
          chainId,
        );
        const replyIds: bigint[] = await contract.getPostReplies(postId);
        const replies = await Promise.all(
          replyIds.map(async (id: bigint) => {
            const post = await contract.getPost(Number(id));
            return mapPost(post);
          }),
        );
        return replies;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to fetch post replies';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signer, provider, chainId],
  );

  return {
    createPost,
    reply,
    vote,
    removePost,
    getPost,
    getRecentPosts,
    getRecentEvents,
    getUserPosts,
    getPostReplies,
    loading,
    error,
  };
}
