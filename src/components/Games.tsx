import React, { useState, useEffect } from 'react';
import { Trophy, Gamepad2, Star, Coins, DollarSign, Loader2, ArrowLeft, Play, Users, Zap, Crown, Swords, MessageCircle, Send, Smile } from 'lucide-react';
import { websocketService, GameRoom, GameUpdate, Player } from '../services/websocketService';
import { useAuth } from '../contexts/AuthContext';
import blurBg from '../blur.jpg';
import gaImg from '../ga.jpg';

// Placeholder components for other games
function MegaJackpot({ onBack }: { onBack: () => void }) {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [currency, setCurrency] = useState<'SOL' | 'USDT'>('USDT');
  
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: `url(${gaImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px) brightness(0.8)',
      }} />
      
      <div className="relative z-10 max-w-6xl mx-auto p-8">
        <div className="flex items-center mb-8">
          <button onClick={onBack} className="flex items-center text-gray-300 hover:text-white transition-colors">
            <ArrowLeft size={24} className="mr-2" />
            Back to Games
          </button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full mb-6 animate-pulse">
            <DollarSign size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            MEGA JACKPOT
          </h1>
          <p className="text-xl text-gray-300 mb-8">Progressive pool battles • Massive payouts • Instant rewards</p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-6 text-center text-white">Current Jackpot Pool</h3>
            
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-purple-400 mb-2">$124,580</div>
              <div className="text-sm text-gray-400">12 players in current pool</div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Entry Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
                    min="50"
                    max="5000"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Coins size={20} className="text-purple-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'SOL' | 'USDT')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
                >
                  <option value="USDT">USDT</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 px-8 rounded-xl font-bold text-xl flex items-center justify-center transition-all transform hover:scale-105 shadow-lg">
              <Trophy size={24} className="mr-3" />
              JOIN POOL • {betAmount} {currency}
            </button>
            
            <div className="text-center mt-4 text-gray-400">
              Potential win: <span className="text-purple-400 font-bold">{betAmount * 100} {currency}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">100x</div>
            <div className="text-white/90">Max Multiplier</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-pink-400 mb-2">5 mins</div>
            <div className="text-white/90">Next Draw</div>
          </div>
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">89%</div>
            <div className="text-white/90">Pool Fill Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KOLBattleRoyale({ onBack }: { onBack: () => void }) {
  const [selectedKOL, setSelectedKOL] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(25);
  const [currency, setCurrency] = useState<'SOL' | 'USDT'>('USDT');

  const kols = [
    { id: '1', name: 'CryptoMaster', prediction: '+15%', confidence: '85%', odds: '2.5x' },
    { id: '2', name: 'BlockchainGuru', prediction: '+8%', confidence: '75%', odds: '1.8x' },
    { id: '3', name: 'TokenWhisperer', prediction: '+25%', confidence: '65%', odds: '3.2x' },
  ];

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: `url(${gaImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px) brightness(0.8)',
      }} />
      
      <div className="relative z-10 max-w-6xl mx-auto p-8">
        <div className="flex items-center mb-8">
          <button onClick={onBack} className="flex items-center text-gray-300 hover:text-white transition-colors">
            <ArrowLeft size={24} className="mr-2" />
            Back to Games
          </button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mb-6 animate-pulse">
            <Trophy size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
            KOL BATTLE ROYALE
          </h1>
          <p className="text-xl text-gray-300 mb-8">Predict KOL performance • Real-time tracking • Instant rewards</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {kols.map((kol) => (
            <div 
              key={kol.id}
              className={`bg-black/40 backdrop-blur-xl rounded-2xl p-6 border cursor-pointer transition-all ${
                selectedKOL === kol.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/30'
              }`}
              onClick={() => setSelectedKOL(kol.id)}
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">{kol.name}</h3>
                <div className="text-sm text-gray-400 mb-4">Prediction</div>
                <div className="text-3xl font-bold text-green-400 mb-4">{kol.prediction}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Confidence</div>
                    <div className="text-white font-bold">{kol.confidence}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Odds</div>
                    <div className="text-blue-400 font-bold">{kol.odds}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-6 text-center text-white">Place Your Bet</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Bet Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                    min="25"
                    max="2500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Coins size={20} className="text-blue-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'SOL' | 'USDT')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                >
                  <option value="USDT">USDT</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
            </div>

            <button 
              className={`w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 px-8 rounded-xl font-bold text-xl flex items-center justify-center transition-all transform hover:scale-105 shadow-lg ${
                !selectedKOL ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!selectedKOL}
            >
              <Trophy size={24} className="mr-3" />
              PLACE BET • {betAmount} {currency}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketMasterArena({ onBack }: { onBack: () => void }) {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [currency, setCurrency] = useState<'SOL' | 'USDT'>('USDT');

  const markets = [
    { id: '1', name: 'BTC/USD', trend: '+5.2%', volume: '$1.2B', volatility: 'High' },
    { id: '2', name: 'ETH/USD', trend: '+3.8%', volume: '$800M', volatility: 'Medium' },
    { id: '3', name: 'SOL/USD', trend: '+12.4%', volume: '$400M', volatility: 'Very High' },
  ];

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: `url(${gaImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px) brightness(0.8)',
      }} />
      
      <div className="relative z-10 max-w-6xl mx-auto p-8">
        <div className="flex items-center mb-8">
          <button onClick={onBack} className="flex items-center text-gray-300 hover:text-white transition-colors">
            <ArrowLeft size={24} className="mr-2" />
            Back to Games
          </button>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mb-6 animate-pulse">
            <Star size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            MARKET MASTER ARENA
          </h1>
          <p className="text-xl text-gray-300 mb-8">Trading showdown • Price prediction • High stakes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {markets.map((market) => (
            <div 
              key={market.id}
              className={`bg-black/40 backdrop-blur-xl rounded-2xl p-6 border cursor-pointer transition-all ${
                selectedMarket === market.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 hover:border-white/30'
              }`}
              onClick={() => setSelectedMarket(market.id)}
            >
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">{market.name}</h3>
                <div className="text-3xl font-bold text-green-400 mb-4">{market.trend}</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">24h Volume</div>
                    <div className="text-white font-bold">{market.volume}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Volatility</div>
                    <div className="text-emerald-400 font-bold">{market.volatility}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold mb-6 text-center text-white">Place Your Trade</h3>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Trade Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold"
                    min="100"
                    max="10000"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <Coins size={20} className="text-emerald-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'SOL' | 'USDT')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-semibold"
                >
                  <option value="USDT">USDT</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                className={`w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-xl flex items-center justify-center transition-all transform hover:scale-105 shadow-lg ${
                  !selectedMarket ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!selectedMarket}
              >
                LONG
              </button>
              <button 
                className={`w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-4 px-8 rounded-xl font-bold text-xl flex items-center justify-center transition-all transform hover:scale-105 shadow-lg ${
                  !selectedMarket ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!selectedMarket}
              >
                SHORT
              </button>
            </div>

            <div className="text-center text-gray-400">
              Leverage: <span className="text-emerald-400 font-bold">10x</span> • 
              Potential win: <span className="text-emerald-400 font-bold">{betAmount * 10} {currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Real-time multiplayer coinflip game
function MultiplayerCoinflip({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<'lobby' | 'matchmaking' | 'waiting' | 'countdown' | 'playing' | 'revealing' | 'finished'>('lobby');
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [betAmount, setBetAmount] = useState<number>(50);
  const [currency, setCurrency] = useState<'SOL' | 'USDT'>('USDT');
  const [userChoice, setUserChoice] = useState<'heads' | 'tails' | null>(null);
  const [opponentChoice, setOpponentChoice] = useState<'heads' | 'tails' | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [gameResult, setGameResult] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<GameRoom[]>([]);

  useEffect(() => {
    websocketService.connect();
    websocketService.onConnectionChange(setIsConnected);
    
    return () => {
      if (currentRoom) {
        websocketService.leaveGameRoom(currentRoom.id);
        websocketService.unsubscribeFromGame(currentRoom.id);
      }
    };
  }, []);

  useEffect(() => {
    if (currentRoom) {
      websocketService.subscribeToGame(currentRoom.id, handleGameUpdate);
    }
    return () => {
      if (currentRoom) {
        websocketService.unsubscribeFromGame(currentRoom.id);
      }
    };
  }, [currentRoom]);

  const handleGameUpdate = (update: GameUpdate) => {
    console.log('Game update:', update);
    
    switch (update.type) {
      case 'player_joined':
        setCurrentRoom(update.data.room);
        if (update.data.room.players.length === 2) {
          setGameState('countdown');
        }
        break;
      case 'countdown':
        setCountdown(update.data.count);
        if (update.data.count === 0) {
          setGameState('playing');
        }
        break;
      case 'game_started':
        setGameState('playing');
        break;
      case 'player_choice':
        // Don't reveal opponent's choice yet
        break;
      case 'game_result':
        setGameResult(update.data);
        setGameState('revealing');
        setTimeout(() => setGameState('finished'), 3000);
        break;
    }
  };

  const startQuickMatch = async () => {
    try {
      setGameState('matchmaking');
      const room = await websocketService.findQuickMatch('coinflip', betAmount, currency);
      setCurrentRoom(room);
      
      if (room.players.length === 2) {
        setGameState('countdown');
      } else {
        setGameState('waiting');
      }
    } catch (error) {
      console.error('Quick match failed:', error);
      setGameState('lobby');
    }
  };

  const makeChoice = (choice: 'heads' | 'tails') => {
    if (gameState !== 'playing' || !currentRoom) return;
    
    setUserChoice(choice);
    websocketService.makeGameChoice(currentRoom.id, choice);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !currentRoom) return;
    
    websocketService.sendChatMessage(currentRoom.id, chatInput);
    setChatInput('');
  };

  const sendEmote = (emote: string) => {
    if (!currentRoom) return;
    websocketService.sendEmote(currentRoom.id, emote);
  };

  const leaveGame = () => {
    if (currentRoom) {
      websocketService.leaveGameRoom(currentRoom.id);
      setCurrentRoom(null);
    }
    setGameState('lobby');
    setUserChoice(null);
    setOpponentChoice(null);
    setGameResult(null);
    setCountdown(0);
  };

  const getOpponent = (): Player | null => {
    if (!currentRoom || !user) return null;
    return currentRoom.players.find(p => p.id !== user._id) || null;
  };

  const opponent = getOpponent();

  // Lobby View
  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen relative">
        {/* Background Image with Blur */}
        <div 
          className="fixed inset-0 z-0" 
          style={{
            backgroundImage: `url(${gaImg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px) brightness(0.8)',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto p-8">
          <div className="flex items-center mb-8">
            <button onClick={onBack} className="flex items-center text-gray-300 hover:text-white transition-colors">
              <ArrowLeft size={24} className="mr-2" />
              Back to Games
            </button>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-6 animate-bounce">
              <Coins size={48} className="text-yellow-900" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              COINFLIP ARENA
            </h1>
            <p className="text-xl text-gray-300 mb-8">Real-time 1v1 battles • Double your crypto • Instant payouts</p>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                {isConnected ? 'Connected' : 'Connecting...'}
              </div>
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                {Array.from(websocketService['gameCallbacks'] || {}).length} online
              </div>
            </div>
          </div>

          {/* Bet Setup */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold mb-6 text-center">Setup Your Battle</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Bet Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg font-semibold"
                      min="10"
                      max="1000"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Coins size={20} className="text-yellow-500" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'SOL' | 'USDT')}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-lg font-semibold"
                  >
                    <option value="USDT">USDT</option>
                    <option value="SOL">SOL</option>
                  </select>
                </div>
              </div>

              <button
                onClick={startQuickMatch}
                disabled={!isConnected}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 px-8 rounded-xl font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all transform hover:scale-105 shadow-lg"
              >
                <Swords size={24} className="mr-3" />
                FIND OPPONENT • {betAmount} {currency}
              </button>
              
              <div className="text-center mt-4 text-gray-400">
                Potential win: <span className="text-yellow-400 font-bold">{betAmount * 1.8} {currency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Matchmaking View
  if (gameState === 'matchmaking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-32 h-32 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <Swords size={48} className="absolute inset-0 m-auto text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Finding Opponent...</h2>
          <p className="text-gray-300 mb-8">Searching for players with {betAmount} {currency} bet</p>
          <button
            onClick={leaveGame}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-colors"
          >
            Cancel Search
          </button>
        </div>
      </div>
    );
  }

  // Game Arena View
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Blur */}
      <div 
        className="fixed inset-0 z-0" 
        style={{
          backgroundImage: `url(${gaImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.8)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button onClick={leaveGame} className="flex items-center text-gray-300 hover:text-white transition-colors">
              <ArrowLeft size={20} className="mr-2" />
              Leave Game
            </button>
            <div className="h-6 w-px bg-gray-600"></div>
            <div className="text-sm text-gray-400">
              Room: {currentRoom?.id?.substring(0, 8)}...
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{betAmount} {currency}</div>
            <div className="text-sm text-gray-400">Prize Pool</div>
          </div>
        </div>

        {/* Players Arena */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Player 1 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Crown size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold">{user?.username || 'You'}</h3>
              <div className="text-sm text-gray-400 mb-4">Player 1</div>
              
              {gameState === 'playing' && (
                <div className="space-y-3">
                  <div className="text-sm text-gray-300 mb-3">Choose your side:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => makeChoice('heads')}
                      disabled={userChoice !== null}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        userChoice === 'heads' 
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">🪙</div>
                      <div className="text-sm font-bold">HEADS</div>
                    </button>
                    <button
                      onClick={() => makeChoice('tails')}
                      disabled={userChoice !== null}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        userChoice === 'tails' 
                          ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="text-sm font-bold">TAILS</div>
                    </button>
                  </div>
                  {userChoice && (
                    <div className="text-green-400 text-sm font-semibold animate-pulse">
                      ✓ Choice locked: {userChoice.toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Game Center */}
          <div className="flex flex-col items-center justify-center">
            {gameState === 'waiting' && (
              <div className="text-center">
                <div className="w-24 h-24 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-2xl font-bold mb-2">Waiting for opponent...</h3>
                <p className="text-gray-400">Game will start when both players join</p>
              </div>
            )}

            {gameState === 'countdown' && (
              <div className="text-center">
                <div className="text-8xl font-bold text-yellow-400 animate-bounce mb-4">
                  {countdown || 'GO!'}
                </div>
                <h3 className="text-2xl font-bold">Game Starting...</h3>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-6xl animate-spin mb-6">
                  🪙
                </div>
                <h3 className="text-2xl font-bold mb-2">Make Your Choice!</h3>
                <p className="text-gray-400">30 seconds remaining...</p>
              </div>
            )}

            {gameState === 'revealing' && gameResult && (
              <div className="text-center">
                <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-6xl mb-6 animate-pulse">
                  {gameResult.coinResult === 'heads' ? '🪙' : '⚡'}
                </div>
                <h3 className="text-3xl font-bold mb-2">
                  Result: {gameResult.coinResult.toUpperCase()}!
                </h3>
                {gameResult.winner && (
                  <div className={`text-xl font-semibold ${
                    gameResult.winner.id === user?._id ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {gameResult.winner.id === user?._id ? '🎉 You Won!' : '😔 You Lost!'}
                  </div>
                )}
              </div>
            )}

            {gameState === 'finished' && (
              <div className="text-center">
                <div className="text-6xl mb-4">
                  {gameResult?.winner?.id === user?._id ? '🏆' : '💔'}
                </div>
                <h3 className="text-2xl font-bold mb-4">Game Over!</h3>
                {gameResult?.winner?.id === user?._id && (
                  <div className="text-green-400 text-xl font-bold mb-4">
                    You won {gameResult.winner.payout} {currency}!
                  </div>
                )}
                <button
                  onClick={() => {
                    leaveGame();
                    onBack();
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-bold transition-all"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Player 2 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Gamepad2 size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold">{opponent?.username || 'Waiting...'}</h3>
              <div className="text-sm text-gray-400 mb-4">Player 2</div>
              
              {opponent && gameState === 'playing' && (
                <div className="text-center">
                  <div className="text-sm text-gray-300 mb-3">Opponent is choosing...</div>
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat & Emotes */}
        {currentRoom && opponent && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold">Chat & Emotes</h4>
              <div className="flex space-x-2">
                {['😀', '😎', '🔥', '💪', '😤', '😱'].map((emote) => (
                  <button
                    key={emote}
                    onClick={() => sendEmote(emote)}
                    className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xl"
                  >
                    {emote}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={100}
              />
              <button
                onClick={sendChatMessage}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Games component with modern game selection
export default function Games() {
  const { user } = useAuth();
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<string>('all');

  useEffect(() => {
    // Auto-connect to websocket when component mounts
    websocketService.connect();
    
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Render specific game
  switch (currentGame) {
    case 'coinflip':
      return <MultiplayerCoinflip onBack={() => setCurrentGame(null)} />;
    case 'jackpot':
      return <MegaJackpot onBack={() => setCurrentGame(null)} />;
    case 'kol_predictor':
      return <KOLBattleRoyale onBack={() => setCurrentGame(null)} />;
    case 'market_master':
      return <MarketMasterArena onBack={() => setCurrentGame(null)} />;
  }

  const games = [
    {
      id: 'coinflip',
      name: 'Coinflip Arena',
      description: 'Real-time 1v1 battles with instant crypto rewards',
      icon: Coins,
      status: 'LIVE',
      statusColor: 'bg-green-50 text-green-700 ring-green-600/20',
      minBet: '10 USDT',
      maxBet: '1,000 USDT',
      multiplier: '1.8x',
      players: 24,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'jackpot',
      name: 'Mega Jackpot',
      description: 'Progressive pool battles with massive payouts',
      icon: DollarSign,
      status: 'HOT',
      statusColor: 'bg-red-50 text-red-700 ring-red-600/20',
      minBet: '50 USDT',
      maxBet: '5,000 USDT',
      multiplier: '100x',
      players: 12,
      color: 'from-purple-400 to-pink-500'
    },
    {
      id: 'kol_predictor',
      name: 'KOL Battle Royale',
      description: 'Predict crypto influencer performance in real-time',
      icon: Trophy,
      status: 'LIVE',
      statusColor: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      minBet: '25 USDT',
      maxBet: '2,500 USDT',
      multiplier: '5x',
      players: 8,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'market_master',
      name: 'Market Master Arena',
      description: 'Ultimate trading skills showdown',
      icon: Star,
      status: 'BETA',
      statusColor: 'bg-purple-50 text-purple-700 ring-purple-600/20',
      minBet: '100 USDT',
      maxBet: '10,000 USDT',
      multiplier: '10x',
      players: 4,
      color: 'from-emerald-400 to-teal-500'
    },
    {
      id: 'bot_challenge',
      name: 'Bot Hunter',
      description: 'Hunt down trading bots and earn massive rewards',
      icon: Gamepad2,
      status: 'SOON',
      statusColor: 'bg-gray-50 text-gray-700 ring-gray-600/20',
      minBet: '---',
      maxBet: '---',
      multiplier: '---',
      players: 0,
      color: 'from-gray-400 to-gray-600'
    }
  ];

  // Main games lobby
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Blur */}
      <div 
        className="fixed inset-0 z-0" 
        style={{
          backgroundImage: `url(${currentGame ? gaImg : blurBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px) brightness(0.8)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-white">
              KOL NEXUS ARENA
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Real-time multiplayer crypto gaming • Battle players worldwide • Instant rewards
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-300">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live Gaming Platform
              </div>
              <div className="flex items-center">
                <Users size={16} className="mr-2" />
                48 Players Online
              </div>
              <div className="flex items-center">
                <Zap size={16} className="mr-2" />
                Instant Payouts
              </div>
            </div>
          </div>

          {/* Game Filter */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 border border-white/20">
              {['all', 'live', 'hot', 'new'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedGameType(filter)}
                  className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                    selectedGameType === filter
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {filter.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game) => {
              const Icon = game.icon;
              const isComingSoon = game.status === 'SOON';
              
              return (
                <div
                  key={game.id}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${game.color} p-1 transition-all duration-300 hover:scale-105 hover:rotate-1 ${
                    !isComingSoon ? 'cursor-pointer' : 'opacity-60'
                  }`}
                  onClick={() => !isComingSoon && setCurrentGame(game.id)}
                >
                  <div className="bg-black/40 backdrop-blur-xl rounded-xl p-6 h-full border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-3 bg-gradient-to-r ${game.color} rounded-xl shadow-lg`}>
                          <Icon size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white drop-shadow-lg">{game.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${game.statusColor} shadow-sm`}>
                              {game.status}
                            </span>
                            {!isComingSoon && (
                              <div className="flex items-center text-xs text-white/80">
                                <Users size={12} className="mr-1" />
                                {game.players} playing
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-white/90 mb-6 text-sm drop-shadow-md">{game.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">Min Bet</span>
                        <span className="font-medium text-white drop-shadow-md">{game.minBet}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">Max Bet</span>
                        <span className="font-medium text-white drop-shadow-md">{game.maxBet}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/80">Max Payout</span>
                        <span className={`font-medium text-white bg-gradient-to-r ${game.color} drop-shadow-lg`}>
                          {game.multiplier}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      className={`w-full rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                        isComingSoon
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : `bg-gradient-to-r ${game.color} text-white hover:shadow-lg transform hover:scale-105`
                      }`}
                      disabled={isComingSoon}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isComingSoon) setCurrentGame(game.id);
                      }}
                    >
                      {isComingSoon ? 'COMING SOON' : 'ENTER ARENA'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2 drop-shadow-lg">$12,450</div>
              <div className="text-white/90">Total Paid Out Today</div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2 drop-shadow-lg">156</div>
              <div className="text-white/90">Games Played Today</div>
            </div>
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2 drop-shadow-lg">89%</div>
              <div className="text-white/90">Win Rate Average</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 