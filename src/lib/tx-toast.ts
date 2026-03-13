import toast from 'react-hot-toast';

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // ethers.js often puts the human-readable reason in `reason`
    const ethersError = error as Error & { reason?: string };
    return ethersError.reason || error.message;
  }
  if (typeof error === 'string') return error;
  return 'Transaction failed';
}

export async function withTxToast<T>(
  txPromise: Promise<T>,
  messages: { pending: string; success: string; error: string }
): Promise<T> {
  return toast.promise(txPromise, {
    loading: messages.pending,
    success: messages.success,
    error: (err: unknown) => {
      const detail = extractErrorMessage(err);
      return `${messages.error}: ${detail}`;
    },
  });
}
