let onMockFallbackUsed: (() => void) | null = null

export function setMockFallbackListener(cb: (() => void) | null): void {
  onMockFallbackUsed = cb
}

export async function withMockFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const result = await fn();
    // If result is an empty array, use fallback
    if (Array.isArray(result) && result.length === 0) {
      onMockFallbackUsed?.()
      return fallback;
    }
    return result;
  } catch {
    onMockFallbackUsed?.()
    return fallback;
  }
}
