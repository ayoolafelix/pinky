'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { usePinkyStore } from '@/lib/store';
import { useCallback, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function useWalletConnection() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setWalletConnected } = usePinkyStore();

  const connect = useCallback(async () => {
    return;
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      setWalletConnected(true, publicKey.toBase58());
    }
  }, [connected, publicKey, setWalletConnected]);

  return { connected, publicKey, disconnect };
}

export default function WalletButton() {
  const { connected, publicKey } = useWallet();
  const { setWalletConnected, walletConnected } = usePinkyStore();

  useEffect(() => {
    if (connected && publicKey) {
      setWalletConnected(true, publicKey.toBase58());
    }
  }, [connected, publicKey, setWalletConnected]);

  if (!connected && !walletConnected) {
    return (
      <WalletMultiButton 
        className="wallet-button"
        style={{
          background: 'linear-gradient(135deg, var(--accent-primary), #006644)',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 20px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#000',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      />
    );
  }

  return (
    <WalletMultiButton 
      className="wallet-button"
      style={{
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        cursor: 'pointer',
        fontFamily: 'monospace',
      }}
    />
  );
}