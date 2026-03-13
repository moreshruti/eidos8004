import { test, expect, describe } from 'bun:test';
import { withMockFallback } from '../mock-fallback';

describe('withMockFallback', () => {
  test('returns real data when the async function succeeds', async () => {
    const result = await withMockFallback(async () => 'real-data', 'fallback');
    expect(result).toBe('real-data');
  });

  test('returns fallback when the async function throws', async () => {
    const result = await withMockFallback(async () => {
      throw new Error('network error');
    }, 'fallback');
    expect(result).toBe('fallback');
  });

  test('returns fallback when the function returns an empty array', async () => {
    const result = await withMockFallback(async () => [], ['default-item']);
    expect(result).toEqual(['default-item']);
  });

  test('returns the real array when it is non-empty', async () => {
    const result = await withMockFallback(async () => [1, 2, 3], [99]);
    expect(result).toEqual([1, 2, 3]);
  });

  test('returns non-array falsy values as-is (does not treat them as empty)', async () => {
    const result = await withMockFallback(async () => 0, 42);
    expect(result).toBe(0);
  });

  test('returns null from the function without falling back', async () => {
    const result = await withMockFallback(async () => null, 'fallback');
    expect(result).toBeNull();
  });
});
