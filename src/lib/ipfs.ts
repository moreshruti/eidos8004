/**
 * IPFS upload service via Pinata.
 *
 * Set NEXT_PUBLIC_PINATA_JWT to enable real uploads.
 * Without it, uploads are simulated with fake hashes (local dev fallback).
 */

import { PinataSDK } from 'pinata-web3';

export interface UploadResult {
  hash: string;
  url: string;
}

// ---------------------------------------------------------------------------
// SDK singleton (lazy-initialized)
// ---------------------------------------------------------------------------

let pinata: PinataSDK | null = null;

function getPinata(): PinataSDK | null {
  const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
  if (!jwt) return null;

  if (!pinata) {
    pinata = new PinataSDK({
      pinataJwt: jwt,
      pinataGateway: process.env.NEXT_PUBLIC_IPFS_GATEWAY,
    });
  }

  return pinata;
}

// ---------------------------------------------------------------------------
// Mock helpers (dev fallback when no JWT configured)
// ---------------------------------------------------------------------------

function generateMockHash(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let hash = 'Qm';
  for (let i = 0; i < 44; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Upload a file to IPFS via Pinata.
 * Falls back to a simulated upload when NEXT_PUBLIC_PINATA_JWT is not set.
 *
 * @example
 * ```ts
 * const result = await uploadToIPFS(file);
 * console.log(result.hash); // "QmXyz..."
 * console.log(result.url);  // "ipfs://QmXyz..."
 * ```
 */
export async function uploadToIPFS(file: File): Promise<UploadResult> {
  const sdk = getPinata();

  if (sdk) {
    const response = await sdk.upload.file(file);
    return {
      hash: response.IpfsHash,
      url: `ipfs://${response.IpfsHash}`,
    };
  }

  // Mock fallback for local dev
  if (process.env.NODE_ENV === 'development') {
    console.log('[IPFS Mock] Simulating file upload:', file.name);
  }
  await new Promise((resolve) => setTimeout(resolve, 1500));
  const hash = generateMockHash();
  return { hash, url: `ipfs://${hash}` };
}

/**
 * Upload JSON metadata to IPFS via Pinata.
 * Falls back to a simulated upload when NEXT_PUBLIC_PINATA_JWT is not set.
 */
export async function uploadMetadataToIPFS(
  metadata: Record<string, unknown>,
): Promise<UploadResult> {
  const sdk = getPinata();

  if (sdk) {
    const response = await sdk.upload.json(metadata);
    return {
      hash: response.IpfsHash,
      url: `ipfs://${response.IpfsHash}`,
    };
  }

  // Mock fallback for local dev
  if (process.env.NODE_ENV === 'development') {
    console.log('[IPFS Mock] Simulating metadata upload:', metadata);
  }
  await new Promise((resolve) => setTimeout(resolve, 800));
  const hash = generateMockHash();
  return { hash, url: `ipfs://${hash}` };
}

/**
 * Get the gateway URL for an IPFS hash.
 * Uses NEXT_PUBLIC_IPFS_GATEWAY when set, otherwise defaults to the Pinata
 * public gateway.
 */
export function getIPFSUrl(hash: string): string {
  const cleanHash = hash.replace('ipfs://', '');
  const gateway =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://gateway.pinata.cloud';

  // Normalize: strip trailing slash from gateway
  const base = gateway.replace(/\/+$/, '');
  return `${base}/ipfs/${cleanHash}`;
}
