import React, { useState, useEffect } from 'react';
import { Coins, DollarSign, Users, Trophy, Loader2, Play, ArrowLeft, Hand, Sparkles, Zap } from 'lucide-react';

interface CoinflipGameProps {
  onBack: () => void;
}

export default function CoinflipGame({ onBack }: CoinflipGameProps) {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [betAmount, setBetAmount] = useState(0.01);
  const [showResult, setShowResult] = useState(false);
  const [coinRotation, setCoinRotation] = useState(0);
  const [handPosition, setHandPosition] = useState(0);
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number}>>([]);

  const flipCoin = () => {
    setIsFlipping(true);
    setResult(null);
    setShowResult(false);
    
    // Animate hand throwing coin
    const handAnimation = setInterval(() => {
      setHandPosition(prev => {
        if (prev >= 100) {
          clearInterval(handAnimation);
          return 100;
        }
        return prev + 5;
      });
    }, 30);

    // Animate coin spinning
    const coinAnimation = setInterval(() => {
      setCoinRotation(prev => prev + 45);
    }, 50);

    // Generate sparkles during flip
    const sparkleInterval = setInterval(() => {
      setSparkles(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 300 + 50,
          y: Math.random() * 200 + 100
        }
      ]);
    }, 100);

    // Simulate coin flip result after 3 seconds
    setTimeout(() => {
      clearInterval(coinAnimation);
      clearInterval(sparkleInterval);
      const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';
      setResult(flipResult);
      setIsFlipping(false);
      setShowResult(true);
      setHandPosition(0);
      setCoinRotation(0);
      setSparkles([]);
    }, 3000);
  };

  // Clean up sparkles
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSparkles(prev => prev.filter(sparkle => Date.now() - sparkle.id < 2000));
    }, 100);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-spin-slow"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
          >
            <ArrowLeft size={20} />
            <span className="text-white font-medium">Back to Games</span>
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Coins className="text-yellow-400" size={32} />
            Coinflip Arena
          </h1>
          <div className="flex items-center gap-2 text-emerald-400">
            <Users size={20} />
            <span>1,247 playing</span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        {/* Coin Flip Animation Area */}
        <div className="relative w-full max-w-4xl mb-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 p-8 min-h-[400px] flex items-center justify-center">
            
            {/* Hand Animation */}
            <div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-300"
              style={{ transform: `translateX(-50%) translateY(${handPosition}px)` }}
            >
              <div className="relative">
                <Hand 
                  size={80} 
                  className="text-amber-200 rotate-45 drop-shadow-lg"
                  style={{ filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))' }}
                />
                {isFlipping && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
                )}
              </div>
            </div>

            {/* Coin */}
            <div className="relative">
              <div 
                className={`w-32 h-32 rounded-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-2xl font-bold text-yellow-900 shadow-2xl transition-all duration-100 ${
                  isFlipping ? 'animate-bounce' : ''
                }`}
                style={{ 
                  transform: `rotateY(${coinRotation}deg)`,
                  boxShadow: '0 0 30px rgba(251, 191, 36, 0.6)'
                }}
              >
                {!isFlipping && result ? (
                  <div className="text-center">
                    <div className="text-sm font-semibold">
                      {result === 'heads' ? '👑' : '🦅'}
                    </div>
                    <div className="text-xs uppercase tracking-wide">
                      {result}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-sm font-semibold">
                      {selectedSide === 'heads' ? '👑' : '🦅'}
                    </div>
                    <div className="text-xs uppercase tracking-wide">
                      {selectedSide}
                    </div>
                  </div>
                )}
              </div>

              {/* Sparkles */}
              {sparkles.map(sparkle => (
                <div
                  key={sparkle.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: sparkle.x,
                    top: sparkle.y,
                    animation: 'sparkle 2s ease-out forwards'
                  }}
                >
                  <Sparkles className="text-yellow-400" size={16} />
                </div>
              ))}
            </div>

            {/* Result Display */}
            {showResult && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-3xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {result === selectedSide ? '🎉' : '😔'}
                  </div>
                  <h2 className={`text-3xl font-bold mb-2 ${
                    result === selectedSide ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {result === selectedSide ? 'You Won!' : 'You Lost!'}
                  </h2>
                  <p className="text-gray-300 mb-4">
                    The coin landed on <span className="font-semibold text-yellow-400">{result}</span>
                  </p>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setShowResult(false)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={onBack}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      Back to Games
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Controls */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bet Amount */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={20} />
              Bet Amount
            </h3>
            <div className="space-y-4">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Enter bet amount"
                disabled={isFlipping}
              />
              <div className="flex gap-2">
                {[0.01, 0.05, 0.1, 0.5].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                    disabled={isFlipping}
                  >
                    {amount} SOL
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Side Selection */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Coins className="text-yellow-400" size={20} />
              Choose Side
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedSide('heads')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedSide === 'heads'
                    ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
                disabled={isFlipping}
              >
                <div className="text-2xl mb-2">👑</div>
                <div className="text-sm font-semibold">HEADS</div>
              </button>
              <button
                onClick={() => setSelectedSide('tails')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedSide === 'tails'
                    ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
                disabled={isFlipping}
              >
                <div className="text-2xl mb-2">🦅</div>
                <div className="text-sm font-semibold">TAILS</div>
              </button>
            </div>
          </div>

          {/* Play Button */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="text-purple-400" size={20} />
              Ready to Play?
            </h3>
            <button
              onClick={flipCoin}
              disabled={isFlipping || showResult}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                isFlipping || showResult
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 hover:scale-105'
              }`}
            >
              {isFlipping ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Flipping...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Play size={20} />
                  Flip Coin
                </div>
              )}
            </button>
            <div className="mt-4 text-center text-sm text-gray-400">
              Potential Win: <span className="text-emerald-400 font-semibold">
                {(betAmount * 1.95).toFixed(3)} SOL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for sparkle animation */}
      <style>{`
        @keyframes sparkle {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-50px) scale(0.5);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
} 