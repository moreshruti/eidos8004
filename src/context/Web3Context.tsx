'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { ethers } from 'ethers';
import { isSupportedChain, SUPPORTED_CHAINS, type SupportedChainId } from '@/lib/network-config';

interface Web3State {
  address: string | null;
  chainId: number | null;
  balance: string;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

interface Web3ContextType extends Web3State {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (targetChainId?: SupportedChainId) => Promise<void>;
}

const initialState: Web3State = {
  address: null,
  chainId: null,
  balance: '0',
  isConnected: false,
  isCorrectNetwork: false,
  provider: null,
  signer: null,
};

const Web3Context = createContext<Web3ContextType>({
  ...initialState,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => {},
});

const DEFAULT_CHAIN_ID: SupportedChainId = 84532; // Base Sepolia

export function Web3Provider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Web3State>(initialState);

  const updateBalance = useCallback(async (provider: ethers.BrowserProvider, address: string) => {
    try {
      const balance = await provider.getBalance(address);
      setState((prev) => ({ ...prev, balance: ethers.formatEther(balance) }));
    } catch {
      // Balance fetch failed silently
    }
  }, []);

  const switchNetwork = useCallback(async (targetChainId: SupportedChainId = DEFAULT_CHAIN_ID) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    const hexChainId = `0x${targetChainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
    } catch (switchError: unknown) {
      const err = switchError as { code?: number };
      // Chain not added to MetaMask — add it
      if (err.code === 4902) {
        const chainConfig = SUPPORTED_CHAINS[targetChainId];
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: hexChainId,
              chainName: chainConfig.name,
              rpcUrls: [chainConfig.rpcUrl],
              blockExplorerUrls: chainConfig.blockExplorerUrl
                ? [chainConfig.blockExplorerUrl]
                : undefined,
              nativeCurrency: chainConfig.nativeCurrency,
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('No wallet detected');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const balance = await provider.getBalance(accounts[0]);

      setState({
        address: accounts[0],
        chainId,
        balance: ethers.formatEther(balance),
        isConnected: true,
        isCorrectNetwork: isSupportedChain(chainId),
        provider,
        signer,
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setState(initialState);
  }, []);

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (state.isConnected && state.provider) {
        setState((prev) => ({ ...prev, address: accounts[0] }));
        updateBalance(state.provider, accounts[0]);
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainIdHex = args[0] as string;
      const chainId = parseInt(chainIdHex, 16);
      setState((prev) => ({
        ...prev,
        chainId,
        isCorrectNetwork: isSupportedChain(chainId),
      }));
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
      window.ethereum?.removeListener('disconnect', handleDisconnect);
    };
  }, [state.isConnected, state.provider, disconnectWallet, updateBalance]);

  return (
    <Web3Context.Provider value={{ ...state, connectWallet, disconnectWallet, switchNetwork }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
