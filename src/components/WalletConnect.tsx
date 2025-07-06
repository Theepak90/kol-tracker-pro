import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { realtimeGameService } from '../services/realtimeGameService';
import { Wallet, Eye, EyeOff } from 'lucide-react';

interface WalletConnectProps {
  showBalance?: boolean;
  className?: string;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ 
  showBalance = true, 
  className = '' 
}) => {
  const { connected, publicKey, wallet, disconnect } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [showAddress, setShowAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          setLoading(true);
          const walletBalance = await realtimeGameService.getWalletBalance(publicKey);
          setBalance(walletBalance);
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance(null);
        } finally {
          setLoading(false);
        }
      } else {
        setBalance(null);
      }
    };

    fetchBalance();
  }, [connected, publicKey]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      // You could add a toast notification here
    }
  };

  if (!connected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 !border-none !rounded-lg !px-4 !py-2 !text-white !font-medium hover:!from-purple-700 hover:!to-pink-700 transition-all duration-200" />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Wallet Info */}
      <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-purple-400" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <button
                onClick={copyAddress}
                className="text-sm text-gray-300 hover:text-white cursor-pointer"
                title="Click to copy address"
              >
                {showAddress 
                  ? publicKey?.toString() 
                  : formatAddress(publicKey?.toString() || '')
                }
              </button>
              <button
                onClick={() => setShowAddress(!showAddress)}
                className="text-gray-400 hover:text-white"
              >
                {showAddress ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            {showBalance && (
              <div className="text-xs text-gray-400">
                {loading ? (
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </div>
                ) : (
                  balance !== null ? `${balance.toFixed(4)} SOL` : 'Balance unavailable'
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Wallet Actions */}
      <div className="flex items-center gap-2">
        <WalletMultiButton className="!bg-gray-700 !border-gray-600 !rounded-lg !px-3 !py-2 !text-white !text-sm hover:!bg-gray-600 transition-all duration-200" />
      </div>
    </div>
  );
};

export default WalletConnect; 