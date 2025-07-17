import React, { useState, useEffect } from 'react';
import { Crown, Users, Trophy, Loader2, Play, ArrowLeft, Swords, Shield, Zap, Star, Target, Flame } from 'lucide-react';

interface KOLBattleGameProps {
  onBack: () => void;
}

interface KOL {
  id: string;
  name: string;
  avatar: string;
  followers: string;
  engagement: number;
  winRate: number;
  power: number;
  specialty: string;
  color: string;
}

const KOLS: KOL[] = [
  {
    id: '1',
    name: 'CryptoPunk Master',
    avatar: '👑',
    followers: '2.1M',
    engagement: 8.5,
    winRate: 78,
    power: 95,
    specialty: 'NFTs',
    color: 'purple'
  },
  {
    id: '2',
    name: 'DeFi Wizard',
    avatar: '🧙‍♂️',
    followers: '1.8M',
    engagement: 9.2,
    winRate: 82,
    power: 88,
    specialty: 'DeFi',
    color: 'blue'
  },
  {
    id: '3',
    name: 'Solana Samurai',
    avatar: '⚔️',
    followers: '1.5M',
    engagement: 7.8,
    winRate: 75,
    power: 92,
    specialty: 'Solana',
    color: 'green'
  },
  {
    id: '4',
    name: 'Meme Lord',
    avatar: '🚀',
    followers: '3.2M',
    engagement: 12.1,
    winRate: 69,
    power: 85,
    specialty: 'Memes',
    color: 'red'
  },
  {
    id: '5',
    name: 'AI Prophet',
    avatar: '🤖',
    followers: '950K',
    engagement: 6.9,
    winRate: 89,
    power: 91,
    specialty: 'AI/Tech',
    color: 'yellow'
  },
  {
    id: '6',
    name: 'Whale Tracker',
    avatar: '🐋',
    followers: '1.2M',
    engagement: 8.1,
    winRate: 84,
    power: 87,
    specialty: 'Analytics',
    color: 'teal'
  }
];

export default function KOLBattleGame({ onBack }: KOLBattleGameProps) {
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(null);
  const [betAmount, setBetAmount] = useState(0.1);
  const [isBattling, setIsBattling] = useState(false);
  const [battlePhase, setBattlePhase] = useState<'selecting' | 'fighting' | 'result'>('selecting');
  const [opponent, setOpponent] = useState<KOL | null>(null);
  const [battleResult, setBattleResult] = useState<{winner: KOL, userWins: boolean, payout: number} | null>(null);
  const [battleEffects, setBattleEffects] = useState<Array<{id: number, x: number, y: number, type: string}>>([]);
  const [kolHealth, setKolHealth] = useState({user: 100, opponent: 100});
  const [battleRound, setBattleRound] = useState(0);

  const startBattle = () => {
    if (!selectedKOL) return;
    
    // Select random opponent
    const availableOpponents = KOLS.filter(kol => kol.id !== selectedKOL.id);
    const randomOpponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
    
    setOpponent(randomOpponent);
    setBattlePhase('fighting');
    setIsBattling(true);
    setKolHealth({user: 100, opponent: 100});
    setBattleRound(0);
    setBattleResult(null);
    setBattleEffects([]);
    
    // Start battle animation
    simulateBattle(selectedKOL, randomOpponent);
  };

  const simulateBattle = (userKOL: KOL, opponentKOL: KOL) => {
    let userHP = 100;
    let opponentHP = 100;
    let round = 0;
    
    const battleInterval = setInterval(() => {
      round++;
      setBattleRound(round);
      
      // Generate battle effects
      setBattleEffects(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 150,
          type: Math.random() > 0.5 ? 'explosion' : 'spark'
        }
      ]);
      
      // Calculate damage based on KOL power and randomness
      const userDamage = Math.floor(Math.random() * (userKOL.power / 5)) + 5;
      const opponentDamage = Math.floor(Math.random() * (opponentKOL.power / 5)) + 5;
      
      // Apply damage
      opponentHP = Math.max(0, opponentHP - userDamage);
      userHP = Math.max(0, userHP - opponentDamage);
      
      setKolHealth({user: userHP, opponent: opponentHP});
      
      // Check for winner
      if (userHP <= 0 || opponentHP <= 0) {
        clearInterval(battleInterval);
        
        setTimeout(() => {
          const userWins = userHP > opponentHP;
          const winner = userWins ? userKOL : opponentKOL;
          const payout = userWins ? betAmount * 1.8 : 0;
          
          setBattleResult({
            winner,
            userWins,
            payout
          });
          
          setBattlePhase('result');
          setIsBattling(false);
          setBattleEffects([]);
        }, 1000);
      }
    }, 1500);
  };

  const resetBattle = () => {
    setBattlePhase('selecting');
    setSelectedKOL(null);
    setOpponent(null);
    setBattleResult(null);
    setBattleEffects([]);
    setKolHealth({user: 100, opponent: 100});
    setBattleRound(0);
  };

  // Clean up battle effects
  useEffect(() => {
    const cleanup = setInterval(() => {
      setBattleEffects(prev => prev.filter(effect => Date.now() - effect.id < 2000));
    }, 100);
    return () => clearInterval(cleanup);
  }, []);

  const getColorClass = (color: string) => {
    const colors = {
      purple: 'from-purple-500 to-purple-700',
      blue: 'from-blue-500 to-blue-700',
      green: 'from-green-500 to-green-700',
      red: 'from-red-500 to-red-700',
      yellow: 'from-yellow-500 to-yellow-700',
      teal: 'from-teal-500 to-teal-700'
    };
    return colors[color as keyof typeof colors] || 'from-gray-500 to-gray-700';
  };

  const handleStartGame = () => {
    if (!selectedKOL) {
      return;
    }
    startBattle();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-spin-slow"></div>
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
            <Crown className="text-yellow-400" size={32} />
            KOL Battle Arena
          </h1>
          <div className="flex items-center gap-2 text-emerald-400">
            <Users size={20} />
            <span>Battle Royale</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6">
        {battlePhase === 'selecting' && (
          <div className="max-w-6xl mx-auto">
            {/* KOL Selection */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Choose Your KOL Champion</h2>
              <p className="text-gray-300">Select a KOL to represent you in battle</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {KOLS.map(kol => (
                <div
                  key={kol.id}
                  onClick={() => setSelectedKOL(kol)}
                  className={`bg-black/40 backdrop-blur-xl rounded-2xl border-2 p-6 cursor-pointer transition-all hover:scale-105 ${
                    selectedKOL?.id === kol.id 
                      ? `border-${kol.color}-400 bg-${kol.color}-500/20` 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">{kol.avatar}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{kol.name}</h3>
                    <div className="text-sm text-gray-300 mb-4">{kol.specialty}</div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Followers:</span>
                        <span className="text-white font-semibold">{kol.followers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Engagement:</span>
                        <span className="text-emerald-400 font-semibold">{kol.engagement}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Win Rate:</span>
                        <span className="text-yellow-400 font-semibold">{kol.winRate}%</span>
                      </div>
                      
                      {/* Power Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Power</span>
                          <span className="text-white font-semibold">{kol.power}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${getColorClass(kol.color)}`}
                            style={{ width: `${kol.power}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bet Controls */}
            {selectedKOL && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 text-center">Battle Setup</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Bet Amount (SOL)</label>
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                        min="0.1"
                        step="0.1"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      <div className="flex gap-2 mt-2">
                        {[0.1, 0.5, 1.0, 2.0].map(amount => (
                          <button
                            key={amount}
                            onClick={() => setBetAmount(amount)}
                            className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
                          >
                            {amount}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center">
                      <div className="text-center mb-4">
                        <div className="text-sm text-gray-300">Potential Payout</div>
                        <div className="text-2xl font-bold text-emerald-400">
                          {(betAmount * 1.8).toFixed(2)} SOL
                        </div>
                      </div>
                      
                      <button
                        onClick={handleStartGame}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Swords size={20} />
                          Enter Battle
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {battlePhase === 'fighting' && selectedKOL && opponent && (
          <div className="max-w-6xl mx-auto">
            {/* Battle Arena */}
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 p-8 mb-8">
              {/* Arena Header */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">⚔️ BATTLE ARENA ⚔️</h2>
                <div className="text-yellow-400 font-semibold">Round {battleRound}</div>
              </div>

              {/* Battle Field */}
              <div className="relative bg-gradient-to-b from-red-900/30 to-purple-900/30 rounded-2xl p-8 min-h-[400px] border-2 border-red-500/30">
                {/* Battle Effects */}
                {battleEffects.map(effect => (
                  <div
                    key={effect.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: effect.x,
                      top: effect.y,
                      animation: 'battle-effect 2s ease-out forwards'
                    }}
                  >
                    {effect.type === 'explosion' ? (
                      <div className="text-4xl">💥</div>
                    ) : (
                      <Zap className="text-yellow-400" size={32} />
                    )}
                  </div>
                ))}

                {/* Fighters */}
                <div className="flex justify-between items-center h-full">
                  {/* User KOL */}
                  <div className="text-center">
                    <div className="relative">
                      <div className={`text-8xl mb-4 ${isBattling ? 'animate-bounce' : ''}`}>
                        {selectedKOL.avatar}
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <Shield className="text-blue-400" size={24} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{selectedKOL.name}</h3>
                    <div className="text-sm text-gray-300 mb-2">Your Champion</div>
                    
                    {/* Health Bar */}
                    <div className="w-32 mx-auto">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">HP</span>
                        <span className="text-white">{kolHealth.user}/100</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                          style={{ width: `${kolHealth.user}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* VS */}
                  <div className="text-center">
                    <div className="text-6xl font-bold text-red-400 mb-4 animate-pulse">VS</div>
                    <div className="flex justify-center space-x-2">
                      <Target className="text-red-400 animate-spin" size={24} />
                      <Flame className="text-orange-400 animate-pulse" size={24} />
                      <Target className="text-red-400 animate-spin" size={24} />
                    </div>
                  </div>

                  {/* Opponent KOL */}
                  <div className="text-center">
                    <div className="relative">
                      <div className={`text-8xl mb-4 ${isBattling ? 'animate-bounce' : ''}`}>
                        {opponent.avatar}
                      </div>
                      <div className="absolute -top-2 -left-2">
                        <Shield className="text-red-400" size={24} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{opponent.name}</h3>
                    <div className="text-sm text-gray-300 mb-2">Opponent</div>
                    
                    {/* Health Bar */}
                    <div className="w-32 mx-auto">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">HP</span>
                        <span className="text-white">{kolHealth.opponent}/100</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                          style={{ width: `${kolHealth.opponent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Battle Status */}
            <div className="text-center">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Loader2 className="animate-spin text-yellow-400" size={24} />
                  <span className="text-white font-semibold">Battle in Progress...</span>
                </div>
                <div className="text-gray-300">
                  {battleRound > 0 && `Round ${battleRound} - The battle intensifies!`}
                </div>
              </div>
            </div>
          </div>
        )}

        {battlePhase === 'result' && battleResult && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/20 p-12">
              <div className="text-8xl mb-6">
                {battleResult.userWins ? '🏆' : '💀'}
              </div>
              
              <h2 className={`text-4xl font-bold mb-4 ${
                battleResult.userWins ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {battleResult.userWins ? 'VICTORY!' : 'DEFEAT!'}
              </h2>
              
              <div className="text-2xl text-white mb-6">
                {battleResult.winner.name} Wins!
              </div>
              
              {battleResult.userWins && (
                <div className="text-xl text-emerald-400 mb-6">
                  You earned {battleResult.payout.toFixed(3)} SOL!
                </div>
              )}
              
              <div className="text-gray-300 mb-8">
                {battleResult.userWins 
                  ? 'Your KOL dominated the arena! Well chosen, champion!'
                  : 'A valiant effort, but the opponent was stronger this time.'
                }
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetBattle}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  Battle Again
                </button>
                <button
                  onClick={onBack}
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors"
                >
                  Back to Games
                </button>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Custom CSS */}
      <style>{`
        @keyframes battle-effect {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(2);
          }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
} 