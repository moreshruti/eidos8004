'use client';

import { useWeb3 } from '@/context/Web3Context';
import { Button } from './Button';
import { Wallet } from 'lucide-react';

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

  if (isConnected && address) {
    return (
      <div className={`flex items-center gap-2 ${className}`.trim()}>
        <span className="hidden sm:block text-xs text-zinc-500 font-mono tabular-nums">
          {formatBalance(balance)}
        </span>
        <button
          onClick={disconnectWallet}
          className="inline-flex items-center gap-2 h-8 px-3 bg-zinc-900 border border-zinc-700/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_1px_2px_0_rgba(0,0,0,0.5)] transition-all duration-100 hover:bg-zinc-800 active:bg-zinc-950 active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.4)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
          <span className="font-mono text-xs text-zinc-400">{truncateAddress(address)}</span>
        </button>
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={connectWallet}
      className={className}
    >
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
}

export { WalletButton };
