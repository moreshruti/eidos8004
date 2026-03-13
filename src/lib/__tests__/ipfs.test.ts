import { test, expect, describe } from 'bun:test';
import { getIPFSUrl } from '../ipfs';

describe('getIPFSUrl', () => {
  test('returns a valid gateway URL for a plain CID', () => {
    const url = getIPFSUrl('QmX7bV3GKp2TJnKfHrRvKp3vR8cJ7HfVTZwKq8K9X5vH1a');
    expect(url).toBe(
      'https://gateway.pinata.cloud/ipfs/QmX7bV3GKp2TJnKfHrRvKp3vR8cJ7HfVTZwKq8K9X5vH1a',
    );
  });

  test('strips ipfs:// prefix before building the URL', () => {
    const url = getIPFSUrl('ipfs://QmX7bV3GKp2TJnKfHrRvKp3vR8cJ7HfVTZwKq8K9X5vH1a');
    expect(url).toBe(
      'https://gateway.pinata.cloud/ipfs/QmX7bV3GKp2TJnKfHrRvKp3vR8cJ7HfVTZwKq8K9X5vH1a',
    );
  });

  test('handles an empty string without throwing', () => {
    const url = getIPFSUrl('');
    expect(url).toBe('https://gateway.pinata.cloud/ipfs/');
  });

  test('preserves subpaths after the CID', () => {
    const url = getIPFSUrl('QmABC123/metadata.json');
    expect(url).toBe('https://gateway.pinata.cloud/ipfs/QmABC123/metadata.json');
  });

  test('strips ipfs:// even when a subpath follows', () => {
    const url = getIPFSUrl('ipfs://QmABC123/metadata.json');
    expect(url).toBe('https://gateway.pinata.cloud/ipfs/QmABC123/metadata.json');
  });
});
