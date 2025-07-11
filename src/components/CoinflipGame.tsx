import React, { useState } from 'react';
import { ArrowLeft, Coins, Computer } from 'lucide-react';
import toast from 'react-hot-toast';
import SOLDepositModal from './SOLDepositModal';
import { transactionService } from '../services/transactionService';

interface CoinflipGameProps {
  onBack: () => void;
}

export default function CoinflipGame({ onBack }: CoinflipGameProps) {
  const [betAmount, setBetAmount] = useState<number>(0.01);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails' | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinSide, setCoinSide] = useState<'heads' | 'tails'>('heads');
  const [flipRotation, setFlipRotation] = useState(0);

  const handleStartGame = () => {
    if (!selectedSide) {
      toast.error('Please select heads or tails');
      return;
    }
    setShowDepositModal(true);
  };

  const handleDepositVerified = () => {
    setShowDepositModal(false);
    startCoinflipGame();
  };

  const startCoinflipGame = () => {
    setIsPlaying(true);
    setIsFlipping(true);
    setGameResult(null);

    // Simulate coin flip animation
    let rotations = 0;
    const maxRotations = 10 + Math.random() * 10; // 10-20 rotations
    
    const flipInterval = setInterval(() => {
      rotations += 0.5;
      setFlipRotation(rotations * 180);
      setCoinSide(rotations % 1 === 0.5 ? 'tails' : 'heads');
      
      if (rotations >= maxRotations) {
        clearInterval(flipInterval);
        
        // Get game outcome from transaction service (98% computer win rate)
        const outcome = transactionService.simulateGameOutcome('coinflip', betAmount);
        const finalSide = outcome.gameDetails.result;
        
        setCoinSide(finalSide);
        setIsFlipping(false);
        
        setTimeout(() => {
          setGameResult({
            userChoice: selectedSide,
            result: finalSide,
            winner: outcome.winner,
            userWins: outcome.winner === 'user',
            payout: outcome.userPayout
          });
          setIsPlaying(false);
        }, 1000);
      }
    }, 150);
  };

  const resetGame = () => {
    setGameResult(null);
    setSelectedSide(null);
    setFlipRotation(0);
    setCoinSide('heads');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Games
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6">
            <Coins size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            COINFLIP ARENA
          </h1>
          <p className="text-xl text-gray-300 mb-4">Real-time 1v1 battles • Instant rewards • Pure adrenaline</p>
        </div>

        {!gameResult && !isPlaying && (
          <div className="max-w-2xl mx-auto">
            {/* Game Setup */}
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-8 mb-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Setup Your Coinflip</h3>
              
              {/* Bet Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bet Amount (SOL)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    min="0.001"
                    step="0.001"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 text-center text-lg"
                    placeholder="0.001"
                  />
                </div>
                <div className="flex items-center justify-center space-x-2 mt-3">
                  <button 
                    onClick={() => setBetAmount(0.01)}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    0.01
                  </button>
                  <button 
                    onClick={() => setBetAmount(0.05)}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    0.05
                  </button>
                  <button 
                    onClick={() => setBetAmount(0.1)}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    0.1
                  </button>
                </div>
              </div>

              {/* Side Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-4 text-center">Choose Your Side</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedSide('heads')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedSide === 'heads' 
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400' 
                        : 'border-gray-600 hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">👑</div>
                    <div className="font-semibold">HEADS</div>
                  </button>
                  <button
                    onClick={() => setSelectedSide('tails')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      selectedSide === 'tails' 
                        ? 'border-orange-500 bg-orange-500/20 text-orange-400' 
                        : 'border-gray-600 hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">🪙</div>
                    <div className="font-semibold">TAILS</div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleStartGame}
                disabled={!selectedSide || betAmount <= 0}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl font-bold text-lg transition-all"
              >
                Deposit {betAmount} SOL & Play
              </button>
            </div>
          </div>
        )}

        {/* Game Playing State */}
        {isPlaying && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-12">
              <h3 className="text-2xl font-bold mb-8">Coin is Flipping...</h3>
              
              <div className="mb-8">
                <div 
                  className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-6xl transition-transform duration-150"
                  style={{ transform: `rotateY(${flipRotation}deg)` }}
                >
                  {coinSide === 'heads' ? '👑' : '🪙'}
                </div>
              </div>

              <div className="text-gray-300">
                <p>Your choice: <span className="text-white font-semibold">{selectedSide?.toUpperCase()}</span></p>
                <p className="text-sm mt-2">Waiting for opponent...</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Result */}
        {gameResult && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-12">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-6xl">
                  {gameResult.result === 'heads' ? '👑' : '🪙'}
                </div>
                <div className="mt-4 text-2xl font-bold">
                  Result: {gameResult.result.toUpperCase()}
                </div>
              </div>

              <div className={`text-center p-6 rounded-xl ${gameResult.userWins ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
                <div className={`text-2xl font-bold mb-2 ${gameResult.userWins ? 'text-green-400' : 'text-red-400'}`}>
                  {gameResult.userWins ? '🎉 YOU WON!' : '😔 YOU LOST!'}
                </div>
                <div className="text-gray-300">
                  You chose: <span className="font-semibold">{gameResult.userChoice.toUpperCase()}</span>
                </div>
                <div className="text-gray-300">
                  Result: <span className="font-semibold">{gameResult.result.toUpperCase()}</span>
                </div>
                {gameResult.userWins && (
                  <div className="mt-4 text-xl">
                    Payout: <span className="text-green-400 font-bold">{gameResult.payout.toFixed(4)} SOL</span>
                  </div>
                )}
              </div>

              <button
                onClick={resetGame}
                className="mt-8 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-8 rounded-xl font-semibold transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SOL Deposit Modal */}
      <SOLDepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDepositVerified={handleDepositVerified}
        gameType="coinflip"
        betAmount={betAmount}
      />
    </div>
  );
} 