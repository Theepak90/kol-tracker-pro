import React, { useState, useEffect } from 'react';
import { ArrowLeft, Coins, DollarSign, Trophy, Star, Play, Shield, GraduationCap, Target, Gift, RefreshCw, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { practiceService } from '../services/practiceService';
import toast from 'react-hot-toast';
import blurBg from '../blur.jpg';

interface PracticeGame {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  minBet: number;
  maxBet: number;
  gameType: string;
}

interface PracticeGameModalProps {
  game: PracticeGame;
  onClose: () => void;
  onUpdateBalance: () => void;
}

function PracticeGameModal({ game, onClose, onUpdateBalance }: PracticeGameModalProps) {
  const [betAmount, setBetAmount] = useState(game.minBet);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const currentBalance = practiceService.getSOLBalance();

  const handlePlayGame = async () => {
    if (!practiceService.canAffordBet(betAmount, 'SOL')) {
      toast.error(`Insufficient balance! You need ${betAmount} SOL to play.`);
      return;
    }

    if (game.gameType === 'coinflip' && !selectedChoice) {
      toast.error('Please select heads or tails first!');
      return;
    }

    setIsPlaying(true);
    setGameResult(null);

    // Simulate game delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = practiceService.simulatePracticeGameOutcome(game.gameType, betAmount, 'SOL');
    
    if (result) {
      setGameResult(result);
      practiceService.updatePracticeStats(game.gameType, result.winner === 'user', result.userPayout);
      onUpdateBalance();
      
      if (result.winner === 'user') {
        toast.success(`🎉 You won ${result.userPayout.toFixed(3)} SOL!`);
      } else {
        toast.error(`😔 You lost ${betAmount} SOL. Better luck next time!`);
      }
    } else {
      toast.error('Game failed to start. Please try again.');
    }

    setIsPlaying(false);
  };

  const resetGame = () => {
    setGameResult(null);
    setSelectedChoice(null);
    setBetAmount(game.minBet);
  };

  const renderGameInterface = () => {
    const Icon = game.icon;
    
    switch (game.gameType) {
      case 'coinflip':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center`}>
                <Icon className="w-16 h-16 text-white" />
              </div>
              {gameResult && (
                <div className="text-lg font-semibold text-white mb-4">
                  Result: {gameResult.gameDetails.result.toUpperCase()}
                  {gameResult.winner === 'user' ? ' 🎉' : ' 😔'}
                </div>
              )}
            </div>
            
            {!gameResult && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedChoice('heads')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedChoice === 'heads' 
                      ? 'border-yellow-400 bg-yellow-400/20' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="text-4xl mb-2">🪙</div>
                  <div className="text-white font-medium">HEADS</div>
                </button>
                <button
                  onClick={() => setSelectedChoice('tails')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedChoice === 'tails' 
                      ? 'border-yellow-400 bg-yellow-400/20' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-white font-medium">TAILS</div>
                </button>
              </div>
            )}
          </div>
        );

      case 'jackpot':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center`}>
                <Icon className="w-16 h-16 text-white" />
              </div>
              {gameResult && (
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-white">
                    Position: #{gameResult.gameDetails.userPosition}
                    {gameResult.winner === 'user' ? ' 🏆 WINNER!' : ''}
                  </div>
                  <div className="text-sm text-gray-400">
                    Total Players: {gameResult.gameDetails.totalPlayers}
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-black/30 rounded-xl p-4">
              <div className="text-center text-white">
                <div className="text-sm text-gray-400 mb-1">Jackpot Value</div>
                <div className="text-2xl font-bold text-purple-400">
                  {gameResult ? gameResult.gameDetails.jackpotValue.toFixed(2) : (Math.random() * 50 + 10).toFixed(2)} SOL
                </div>
              </div>
            </div>
          </div>
        );

      case 'kol_predictor':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center`}>
                <Icon className="w-16 h-16 text-white" />
              </div>
              {gameResult && (
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-white">
                    KOL: {gameResult.gameDetails.kolName}
                  </div>
                  <div className="text-sm text-gray-400">
                    Your Prediction: {gameResult.gameDetails.userPrediction.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-400">
                    Actual: {gameResult.gameDetails.actualMovement.toUpperCase()} ({gameResult.gameDetails.priceChange})
                  </div>
                  <div className={`text-lg font-bold ${gameResult.winner === 'user' ? 'text-green-400' : 'text-red-400'}`}>
                    {gameResult.winner === 'user' ? '🎉 CORRECT!' : '😔 WRONG!'}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'market_master':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r ${game.color} flex items-center justify-center`}>
                <Icon className="w-16 h-16 text-white" />
              </div>
              {gameResult && (
                <div className="space-y-2">
                  <div className="text-lg font-semibold text-white">
                    Market: {gameResult.gameDetails.market}
                  </div>
                  <div className="text-sm text-gray-400">
                    Your Prediction: {gameResult.gameDetails.userPrediction.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-400">
                    Actual: {gameResult.gameDetails.actualOutcome.toUpperCase()} ({gameResult.gameDetails.priceMovement})
                  </div>
                  <div className={`text-lg font-bold ${gameResult.winner === 'user' ? 'text-green-400' : 'text-red-400'}`}>
                    {gameResult.winner === 'user' ? '🎉 CORRECT!' : '😔 WRONG!'}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{game.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {renderGameInterface()}

        <div className="mt-8 space-y-4">
          {/* Bet Amount */}
          <div className="bg-black/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">Bet Amount</span>
              <span className="text-gray-400">{currentBalance.toFixed(3)} SOL available</span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={game.minBet}
                max={Math.min(game.maxBet, currentBalance)}
                step="0.1"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="flex-1 bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white"
                disabled={isPlaying || gameResult}
              />
              <span className="text-white self-center">SOL</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!gameResult ? (
              <button
                onClick={handlePlayGame}
                disabled={isPlaying || betAmount < game.minBet || betAmount > currentBalance}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                  isPlaying 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : `bg-gradient-to-r ${game.color} hover:opacity-90`
                } text-white`}
              >
                {isPlaying ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Playing...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    PLAY NOW
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={resetGame}
                className="flex-1 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:opacity-90 transition-all"
              >
                <RefreshCw size={18} />
                PLAY AGAIN
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PracticeMode({ onBack }: { onBack: () => void }) {
  const [practiceBalance, setPracticeBalance] = useState(practiceService.getPracticeBalance());
  const [selectedGame, setSelectedGame] = useState<PracticeGame | null>(null);
  const [showDailyBonus, setShowDailyBonus] = useState(practiceService.isDailyBonusAvailable());
  const [stats, setStats] = useState(practiceService.getPracticeStats());

  // Update balance periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setPracticeBalance(practiceService.getPracticeBalance());
      setShowDailyBonus(practiceService.isDailyBonusAvailable());
      setStats(practiceService.getPracticeStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClaimDailyBonus = () => {
    const result = practiceService.claimDailyBonus();
    if (result.claimed) {
      setPracticeBalance(practiceService.getPracticeBalance());
      setShowDailyBonus(false);
      toast.success(`Claimed ${result.amount} SOL daily bonus! 🎁`);
    } else {
      const nextClaim = new Date(result.nextClaimTime!);
      toast.error(`Daily bonus already claimed. Next available: ${nextClaim.toLocaleTimeString()}`);
    }
  };

  const handleResetBalance = () => {
    practiceService.resetBalance();
    setPracticeBalance(practiceService.getPracticeBalance());
    toast.success('Practice balance reset to 100 SOL! 🔄');
  };

  const updateBalance = () => {
    setPracticeBalance(practiceService.getPracticeBalance());
    setStats(practiceService.getPracticeStats());
  };

  const practiceGames: PracticeGame[] = [
    {
      id: 'practice_coinflip',
      name: 'Practice Coinflip',
      description: 'Learn coinflip basics with virtual coins',
      icon: Coins,
      color: 'from-yellow-400 to-orange-500',
      minBet: 0.1,
      maxBet: 10,
      gameType: 'coinflip'
    },
    {
      id: 'practice_jackpot',
      name: 'Practice Jackpot',
      description: 'Try jackpot mechanics risk-free',
      icon: DollarSign,
      color: 'from-purple-400 to-pink-500',
      minBet: 0.5,
      maxBet: 25,
      gameType: 'jackpot'
    },
    {
      id: 'practice_kol',
      name: 'Practice KOL Battle',
      description: 'Master KOL prediction strategies',
      icon: Trophy,
      color: 'from-blue-400 to-cyan-500',
      minBet: 0.3,
      maxBet: 15,
      gameType: 'kol_predictor'
    },
    {
      id: 'practice_market',
      name: 'Practice Market Master',
      description: 'Learn market prediction skills',
      icon: Star,
      color: 'from-green-400 to-emerald-500',
      minBet: 0.2,
      maxBet: 20,
      gameType: 'market_master'
    }
  ];
  
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: `url(${blurBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px) brightness(0.3)',
      }} />
      
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Practice Mode</h1>
                <p className="text-gray-400">Learn without risk using virtual coins</p>
              </div>
            </div>
            
            {/* Balance and Actions */}
            <div className="flex gap-4">
              <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="text-yellow-400" size={20} />
                  <span className="text-white font-semibold">{practiceBalance.solBalance.toFixed(3)} SOL</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="text-green-400" size={16} />
                  <span className="text-gray-300 text-sm">{practiceBalance.usdtBalance.toFixed(0)} USDT</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {showDailyBonus && (
                  <button
                    onClick={handleClaimDailyBonus}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2"
                  >
                    <Gift size={16} />
                    Daily Bonus
                  </button>
                )}
                
                <button
                  onClick={handleResetBalance}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Reset Balance
                </button>
              </div>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="text-blue-400" size={20} />
                <span className="text-white font-medium">Games Played</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-green-400" size={20} />
                <span className="text-white font-medium">Total Winnings</span>
              </div>
              <div className="text-2xl font-bold text-green-400">{stats.totalWinnings.toFixed(2)} SOL</div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="text-purple-400" size={20} />
                <span className="text-white font-medium">Win Rate</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">{stats.winRate.toFixed(1)}%</div>
            </div>
            
            <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="text-yellow-400" size={20} />
                <span className="text-white font-medium">Favorite Game</span>
              </div>
              <div className="text-lg font-bold text-yellow-400 capitalize">{stats.favoriteGame}</div>
            </div>
          </div>

          {/* Per-Game Win Ratios */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 mt-4">
            {practiceGames.map(pg => {
              const gs = stats.gameStats[pg.gameType] || { played: 0, wins: 0, winRate: 0 };
              return (
                <div key={pg.id} className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <pg.icon className="text-yellow-300" size={20} />
                    <span className="text-white font-medium">{pg.name}</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">Played: {gs.played}</div>
                  <div className="text-sm text-gray-400 mb-1">Wins: {gs.wins}</div>
                  <div className="text-lg font-bold text-emerald-400">{gs.winRate.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>

          {/* Practice Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {practiceGames.map((game) => {
              const Icon = game.icon;
              return (
                <div key={game.id} className="group relative">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${game.color} opacity-20 rounded-2xl blur-lg group-hover:opacity-40 transition-opacity`}></div>
                  <div className="relative bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="px-3 py-1 bg-emerald-400/20 text-emerald-400 text-xs rounded-full font-medium">
                        PRACTICE
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                    <p className="text-gray-400 text-sm mb-6">{game.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Min Bet</div>
                        <div className="text-lg font-semibold text-white">{game.minBet} SOL</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Max Bet</div>
                        <div className="text-lg font-semibold text-white">{game.maxBet} SOL</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedGame(game)}
                      className={`w-full bg-gradient-to-r ${game.color} text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105`}
                    >
                      <Play size={18} />
                      PRACTICE NOW
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Practice Benefits */}
          <div className="mt-12 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Practice Mode Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Risk-Free Learning</h3>
                <p className="text-gray-400 text-sm">Learn game mechanics without risking real money</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Better Win Rates</h3>
                <p className="text-gray-400 text-sm">40% win rate for learning vs 2% in real games</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Strategy Development</h3>
                <p className="text-gray-400 text-sm">Test different strategies and approaches</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Gift size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Daily Bonuses</h3>
                <p className="text-gray-400 text-sm">Get 10 SOL daily practice bonus</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Modal */}
      {selectedGame && (
        <PracticeGameModal 
          game={selectedGame} 
          onClose={() => setSelectedGame(null)}
          onUpdateBalance={updateBalance}
        />
      )}
    </div>
  );
} 