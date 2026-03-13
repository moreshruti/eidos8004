'use client';

import type { ReactNode } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { Card } from './Card';
import { Button } from './Button';
import { Wallet } from 'lucide-react';

interface WalletGateProps {
  children: ReactNode;
  message?: string;
}

function WalletGate({ children, message }: WalletGateProps) {
  const { isConnected, connectWallet } = useWeb3();

  if (isConnected) {
    return <>{children}</>;
  }

  return (
    <Card className="max-w-md mx-auto text-center">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-12 h-12 bg-c2 border border-c3 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-c7" />
        </div>
        <p className="text-sm text-c8 leading-relaxed">
          {message || 'Connect your wallet to continue'}
        </p>
        <Button variant="primary" size="md" onClick={connectWallet}>
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </Button>
      </div>
    </Card>
  );
}

export { WalletGate };
export type { WalletGateProps };
