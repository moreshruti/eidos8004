'use client';

import { useWeb3 } from '@/context/Web3Context';
import { Button } from './Button';

function NetworkBanner() {
  const { isConnected, isCorrectNetwork, switchNetwork } = useWeb3();

  if (!isConnected || isCorrectNetwork) return null;

  return (
    <div
      className={`
        sticky top-0 z-50 w-full
        bg-yellow-500/5 border-b border-yellow-500/20
        px-4 py-2.5
      `.trim()}
      role="alert"
    >
      <div className="mx-auto flex items-center justify-between gap-4 max-w-7xl">
        <p className="text-xs text-yellow-400/80">
          Wrong network detected. Please switch to Polygon Amoy.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={switchNetwork}
          className="shrink-0 border-yellow-500/20 text-yellow-400/80 hover:bg-yellow-500/10"
        >
          Switch Network
        </Button>
      </div>
    </div>
  );
}

export { NetworkBanner };
