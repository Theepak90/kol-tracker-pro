import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Trophy, Loader2, Play, ArrowLeft, Zap, Crown, Star, Sparkles, Timer } from 'lucide-react';
import toast from 'react-hot-toast';
import SOLDepositModal from './SOLDepositModal';
import { transactionService } from '../services/transactionService';

interface JackpotGameProps {
  onBack: () => void;
}

const SLOT_SYMBOLS = ['💎', '🍀', '⭐', '🎰', '💰', '🔥', '⚡', '👑'];

export default function JackpotGame({ onBack }: JackpotGameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(0.05);
  const [jackpotAmount, setJackpotAmount] = useState(12.45);
  const [timeLeft, setTimeLeft] = useState(45);
  const [totalPlayers, setTotalPlayers] = useState(8);
  const [myChance, setMyChance] = useState(0);
  const [reelSymbols, setReelSymbols] = useState([
    ['💎', '🍀', '⭐'],
    ['🎰', '💰', '🔥'],
    ['⚡', '👑', '💎']
  ]);
  const [spinningReels, setSpinningReels] = useState([false, false, false]);
  const [showResult, setShowResult] = useState(false);
  const [gameResult, setGameResult] = useState<{winner: boolean, amount: number} | null>(null);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Mock players in the jackpot
  const players = [
    { id: 1, name: 'You', avatar: '👤', bet: betAmount, isUser: true },
    { id: 2, name: 'Bot Alpha', avatar: '🤖', bet: 0.1, isUser: false },
    { id: 3, name: 'Bot Beta', avatar: '🦾', bet: 0.2, isUser: false },
    { id: 4, name: 'Bot Gamma', avatar: '🔥', bet: 0.15, isUser: false },
    { id: 5, name: 'Bot Delta', avatar: '⚡', bet: 0.08, isUser: false },
  ];

  const totalJackpot = players.reduce((sum, player) => sum + player.bet, 0);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isSpinning) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSpinning) {
      startJackpotSpin();
    }
  }, [timeLeft, isSpinning]);

  // Calculate winning chance
  useEffect(() => {
    const totalBets = jackpotAmount;
    const chance = totalBets > 0 ? (betAmount / totalBets) * 100 : 0;
    setMyChance(Math.min(chance, 100));
  }, [betAmount, jackpotAmount]);

  const handleStartGame = () => {
    setShowDepositModal(true);
  };

  const handleDepositVerified = () => {
    setShowDepositModal(false);
    placeBet(); // Start the game after deposit
  };

  const placeBet = () => {
    if (betAmount > 0 && timeLeft > 0) {
      setJackpotAmount(prev => prev + betAmount);
      setTotalPlayers(prev => prev + 1);
    }
  };

  const startJackpotSpin = () => {
    setIsSpinning(true);
    setShowResult(false);
    setParticles([]);
    
    // Start spinning all reels
    setSpinningReels([true, true, true]);
    
    // Generate particles during spin
    const particleInterval = setInterval(() => {
      setParticles(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 150
        }
      ]);
    }, 150);

    // Stop reels one by one with delay
    setTimeout(() => {
      setSpinningReels(prev => [false, prev[1], prev[2]]);
      // Generate new symbols for first reel
      setReelSymbols(prev => [
        [SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
         SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
         SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]],
        prev[1],
        prev[2]
      ]);
    }, 1500);

    setTimeout(() => {
      setSpinningReels(prev => [prev[0], false, prev[2]]);
      // Generate new symbols for second reel
      setReelSymbols(prev => [
        prev[0],
        [SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
         SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
         SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]],
        prev[2]
      ]);
    }, 2500);

    setTimeout(() => {
      setSpinningReels(prev => [prev[0], prev[1], false]);
      // Generate new symbols for third reel
      setReelSymbols(prev => [
        prev[0],
        prev[1],
        [SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
         SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
         SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]]
      ]);
      
      clearInterval(particleInterval);
      
      // Determine winner (5% chance for user to win)
      const userWins = Math.random() < 0.05;
      const winAmount = userWins ? jackpotAmount * 0.95 : 0;
      
      setTimeout(() => {
        setGameResult({
          winner: userWins,
          amount: winAmount
        });
        setShowResult(true);
        setIsSpinning(false);
        
        // Reset for next round
        setTimeout(() => {
          setTimeLeft(60);
          setJackpotAmount(2.5);
          setTotalPlayers(3);
          setShowResult(false);
          setGameResult(null);
          setParticles([]);
        }, 5000);
      }, 1000);
    }, 3500);
  };

  // Clean up particles
  useEffect(() => {
    const cleanup = setInterval(() => {
      setParticles(prev => prev.filter(particle => Date.now() - particle.id < 3000));
    }, 100);
    return () => clearInterval(cleanup);
  }, []);

  const resetGame = () => {
    setGameResult(null);
    setSpinningReels([false, false, false]); // Stop spinning
    setShowResult(false);
    setParticles([]);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-500/10 to-yellow-500/10 rounded-full blur-3xl animate-spin-slow"></div>
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
            <Trophy className="text-yellow-400" size={32} />
            Mega Jackpot
          </h1>
          <div className="flex items-center gap-2 text-emerald-400">
            <Users size={20} />
            <span>{totalPlayers} players</span>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6">
        {/* Jackpot Display */}
        <div className="w-full max-w-4xl mb-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center">
            <div className="mb-4">
              <div className="text-6xl font-bold text-yellow-400 mb-2 animate-pulse">
                {jackpotAmount.toFixed(3)} SOL
              </div>
              <div className="text-xl text-gray-300">Current Jackpot</div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Timer className="text-red-400" size={24} />
              <span className="text-2xl font-bold text-red-400">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            
            {/* Your Chance */}
            <div className="bg-white/10 rounded-xl p-4">
              <div className="text-sm text-gray-300 mb-2">Your Winning Chance</div>
              <div className="text-2xl font-bold text-emerald-400">
                {myChance.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Slot Machine */}
        <div className="relative w-full max-w-4xl mb-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 p-8">
            <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-2xl p-6 border-4 border-yellow-400 shadow-2xl">
              {/* Slot Machine Header */}
              <div className="text-center mb-6">
                <div className="text-2xl font-bold text-yellow-100 mb-2">🎰 MEGA JACKPOT 🎰</div>
                <div className="flex justify-center gap-4 text-yellow-200">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-300"></div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse delay-700"></div>
                </div>
              </div>

              {/* Slot Reels */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {reelSymbols.map((reel, reelIndex) => (
                  <div key={reelIndex} className="relative">
                    <div className="bg-black/80 rounded-xl border-2 border-yellow-400 p-4 h-40 overflow-hidden">
                      <div className={`flex flex-col items-center justify-center h-full transition-all duration-300 ${
                        spinningReels[reelIndex] ? 'animate-spin-y' : ''
                      }`}>
                        {reel.map((symbol, symbolIndex) => (
                          <div
                            key={symbolIndex}
                            className={`text-4xl mb-2 ${symbolIndex === 1 ? 'text-yellow-400 scale-125' : 'text-gray-400'}`}
                          >
                            {symbol}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Reel spinning indicator */}
                    {spinningReels[reelIndex] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                        <Loader2 className="animate-spin text-yellow-400" size={32} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Slot Machine Base */}
              <div className="bg-gradient-to-b from-yellow-700 to-yellow-900 rounded-xl p-4 border-2 border-yellow-500">
                <div className="flex justify-center items-center gap-4">
                  <div className="w-16 h-16 bg-red-600 rounded-full border-4 border-red-400 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-100 font-bold">INSERT COIN</div>
                    <div className="text-yellow-200 text-sm">Good Luck!</div>
                  </div>
                  <div className="w-16 h-16 bg-green-600 rounded-full border-4 border-green-400 flex items-center justify-center">
                    <Play className="text-white" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Particles */}
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute pointer-events-none"
                style={{
                  left: particle.x,
                  top: particle.y,
                  animation: 'particle-float 3s ease-out forwards'
                }}
              >
                <Sparkles className="text-yellow-400" size={20} />
              </div>
            ))}

            {/* Result Overlay */}
            {showResult && gameResult && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl">
                <div className="text-center">
                  <div className="text-8xl mb-4">
                    {gameResult.winner ? '🎉' : '😔'}
                  </div>
                  <h2 className={`text-4xl font-bold mb-4 ${
                    gameResult.winner ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {gameResult.winner ? 'JACKPOT!' : 'Better Luck Next Time!'}
                  </h2>
                  {gameResult.winner && (
                    <div className="text-2xl text-emerald-400 mb-4">
                      You won {gameResult.amount.toFixed(3)} SOL!
                    </div>
                  )}
                  <div className="text-gray-300 mb-6">
                    {gameResult.winner 
                      ? 'Congratulations! You hit the jackpot!' 
                      : 'The jackpot continues to grow. Try again next round!'
                    }
                  </div>
                  <div className="text-sm text-gray-400">
                    Next round starts in {Math.max(0, 5 - Math.floor((Date.now() % 5000) / 1000))} seconds...
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Controls */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bet Controls */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="text-emerald-400" size={20} />
              Place Your Bet
            </h3>
            <div className="space-y-4">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0.05, parseFloat(e.target.value) || 0.05))}
                min="0.05"
                step="0.05"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter bet amount"
                disabled={isSpinning || timeLeft < 10}
              />
              <div className="flex gap-2">
                {[0.05, 0.1, 0.5, 1.0].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                    disabled={isSpinning || timeLeft < 10}
                  >
                    {amount} SOL
                  </button>
                ))}
              </div>
              <button
                onClick={placeBet}
                disabled={isSpinning || timeLeft < 10}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  isSpinning || timeLeft < 10
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:opacity-90 hover:scale-105'
                }`}
              >
                {timeLeft < 10 ? 'Round Starting...' : 'Place Bet'}
              </button>
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="text-purple-400" size={20} />
              Game Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Total Players:</span>
                <span className="text-white font-semibold">{totalPlayers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Your Bet:</span>
                <span className="text-emerald-400 font-semibold">{betAmount.toFixed(3)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Win Chance:</span>
                <span className="text-yellow-400 font-semibold">{myChance.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Potential Win:</span>
                <span className="text-purple-400 font-semibold">{(jackpotAmount * 0.95).toFixed(3)} SOL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SOL Deposit Modal */}
      <SOLDepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDepositVerified={handleDepositVerified}
        gameType="jackpot"
        betAmount={betAmount}
      />

      {/* Custom CSS */}
      <style>{`
        @keyframes spin-y {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        
        @keyframes particle-float {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.5);
          }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animate-spin-y {
          animation: spin-y 0.5s linear infinite;
        }
      `}</style>
    </div>
  );
} 