import React, { useState, useEffect } from 'react';
import { X, Wallet, Copy, CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

interface SOLDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositVerified: () => void;
  gameType: string;
  betAmount: number;
}

const PLATFORM_WALLET = 'rp3iEBSBovMxTKa5Gem6vqXXDELrh3ZP5tWn5Exgosd';

const OPPONENT_USERNAMES = [
  'CryptoKing', 'LunaWolf', 'SolanaShark', 'BetMaster', 'PixelNinja', 'MoonRider', 'ApeTrader', 'DegenQueen', 'WhaleHunter', 'SatoshiKid'
];

function getRandomOpponent() {
  return OPPONENT_USERNAMES[Math.floor(Math.random() * OPPONENT_USERNAMES.length)];
}

export default function SOLDepositModal({ isOpen, onClose, onDepositVerified, gameType, betAmount }: SOLDepositModalProps) {
  const [txHash, setTxHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [copied, setCopied] = useState(false);
  const [opponent, setOpponent] = useState('');

  useEffect(() => {
    if (isOpen) {
      setOpponent(getRandomOpponent());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isVerified && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onDepositVerified();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isVerified, countdown, onDepositVerified]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Wallet address copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyTransaction = async () => {
    if (!txHash.trim()) {
      toast.error('Please enter a transaction hash');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate transaction verification
      // In a real app, this would call a Solana RPC to verify the transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll assume all transactions are valid
      setIsVerified(true);
      setCountdown(15);
      toast.success('Transaction verified! Game starting in 15 seconds...');
      
    } catch (error) {
      toast.error('Failed to verify transaction');
    } finally {
      setIsVerifying(false);
    }
  };

  const getGameDisplayName = (gameType: string) => {
    switch (gameType) {
      case 'coinflip': return 'Coinflip Arena';
      case 'jackpot': return 'Mega Jackpot';
      case 'kol_predictor': return 'KOL Battle Royale';
      case 'market_master': return 'Market Master Arena';
      default: return 'Game';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Deposit SOL to Play</h2>
          <p className="text-gray-400">Enter {getGameDisplayName(gameType)} vs {opponent}</p>
        </div>

        <div className="space-y-6">
          {/* Game Info */}
          <div className="bg-black/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Game</span>
              <span className="text-white font-semibold">{getGameDisplayName(gameType)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Mode</span>
              <span className="text-purple-400 font-semibold">vs {opponent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Bet Amount</span>
              <span className="text-green-400 font-semibold">{betAmount} SOL</span>
            </div>
          </div>

          {/* Platform Wallet */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Send SOL to Platform Wallet
            </label>
            <div className="bg-black/50 rounded-xl p-4 flex items-center justify-between">
              <code className="text-sm text-gray-300 break-all">{PLATFORM_WALLET}</code>
              <button
                onClick={() => copyToClipboard(PLATFORM_WALLET)}
                className="ml-3 p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
              >
                {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} className="text-purple-400" />}
              </button>
            </div>
          </div>

          {/* Transaction Hash Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Transaction Hash
            </label>
            <input
              type="text"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              placeholder="Paste your transaction hash here..."
              className="w-full bg-black/50 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              disabled={isVerified}
            />
          </div>

          {/* Verify Button */}
          {!isVerified ? (
            <button
              onClick={verifyTransaction}
              disabled={isVerifying || !txHash.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Verifying Transaction...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Verify & Start Game
                </>
              )}
            </button>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-4">
                <CheckCircle size={24} />
                <span className="text-lg font-semibold">Transaction Verified!</span>
              </div>
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-white">
                  <Clock size={20} />
                  <span className="text-xl font-bold">Game starting in {countdown}s</span>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <AlertCircle size={20} className="text-orange-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-orange-200">
              <strong>Warning:</strong> Only send the exact bet amount. Ensure your transaction is confirmed on the Solana network before verifying.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 