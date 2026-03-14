'use client';

import { useState } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { Button } from './Button';
import { Wallet } from 'lucide-react';
import toast from 'react-hot-toast';

interface WalletButtonProps {
  className?: string;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBalance(balance: string): string {
  const num = parseFloat(balance);
  if (num === 0) return '0 ETH';
  if (num < 0.001) return '<0.001 ETH';
  return `${num.toFixed(3)} ETH`;
}

function WalletButton({ className = '' }: WalletButtonProps) {
  const { isConnected, address, balance, connectWallet, disconnectWallet } = useWeb3();
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectWallet();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      if (!message.includes('rejected')) {
        toast.error(message);
      }
    } finally {
      setConnecting(false);
    }
  };

  if (isConnected && address) {
    return (
      <div className={`flex items-center gap-2 ${className}`.trim()}>
        <span className="hidden sm:block text-xs text-c5 font-mono tabular-nums">
          {formatBalance(balance)}
        </span>
        <button
          onClick={disconnectWallet}
          className="inline-flex items-center gap-2 h-8 px-3 bg-c2 border border-c3 transition-all duration-100 hover:bg-c3 active:bg-c1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
          <span className="font-mono text-xs text-c7">{truncateAddress(address)}</span>
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleConnect}
      loading={connecting}
      className={className}
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
}

export { WalletButton };
