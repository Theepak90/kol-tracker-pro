import React, { useState, useEffect } from 'react';
import { Trophy, Gamepad2, Star, Coins, DollarSign, Loader2, ArrowLeft, Play, Users, Zap, Crown, Swords, MessageCircle, Send, Smile, LayoutGrid, Wallet, Settings, BarChart2, History, HelpCircle, Wifi, WifiOff, AlertCircle, BookOpen, GraduationCap, Target, Shield, Gift, Info, ChevronRight, CheckCircle, X } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { realtimeGameService, GameRoom, GameUpdate, Player } from '../services/realtimeGameService';
import { useAuth } from '../contexts/AuthContext';
import blurBg from '../blur.jpg';
import gaImg from '../ga.jpg';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Tutorial Modal Component
function TutorialModal({ isOpen, onClose, gameType }: { isOpen: boolean; onClose: () => void; gameType: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const tutorials = {
    coinflip: {
      title: 'Coinflip Arena Tutorial',
      steps: [
        {
          title: 'Welcome to Coinflip Arena!',
          content: 'Learn the basics of our most popular game. It\'s simple: predict the coin flip outcome and win real crypto!',
          image: '🪙'
        },
        {
          title: 'How to Play',
          content: 'Choose your bet amount, select heads or tails, and wait for an opponent. The winner takes the pot minus a small fee.',
          image: '🎯'
        },
        {
          title: 'Beginner Tips',
          content: 'Start with small bets (0.01 SOL minimum for beginners). Practice mode is available with virtual coins!',
          image: '💡'
        },
        {
          title: 'Ready to Play?',
          content: 'Connect your wallet and start with practice mode. You\'ll get 100 virtual coins to learn with!',
          image: '🚀'
        }
      ]
    },
    jackpot: {
      title: 'Mega Jackpot Tutorial',
      steps: [
        {
          title: 'Welcome to Mega Jackpot!',
          content: 'A progressive pool game where multiple players compete for a growing jackpot. Higher bets = higher chances!',
          image: '💰'
        },
        {
          title: 'How It Works',
          content: 'Players place bets into a shared pool. Your winning chance is proportional to your bet size vs total pool.',
          image: '🎰'
        },
        {
          title: 'Timing is Key',
          content: 'Games start every 60 seconds. Watch the timer and place your bet before time runs out!',
          image: '⏰'
        },
        {
          title: 'Beginner Mode',
          content: 'Try our beginner pools with 0.05 SOL minimum bets. Perfect for learning the game mechanics!',
          image: '🎓'
        }
      ]
    },
    kol_predictor: {
      title: 'KOL Battle Royale Tutorial',
      steps: [
        {
          title: 'Welcome to KOL Battle!',
          content: 'Predict which crypto influencer will perform best. Use your knowledge of the crypto space to win!',
          image: '👑'
        },
        {
          title: 'How to Predict',
          content: 'Choose from top crypto influencers and predict their performance metrics over the next hour.',
          image: '📊'
        },
        {
          title: 'Scoring System',
          content: 'Points are awarded based on engagement, reach, and market impact. The highest scorer wins!',
          image: '🏆'
        },
        {
          title: 'Research Tools',
          content: 'Use our built-in analytics to research KOL performance before placing your bets.',
          image: '🔍'
        }
      ]
    }
  };

  const tutorial = tutorials[gameType as keyof typeof tutorials];
  if (!tutorial) return null;

  const currentTutorial = tutorial.steps[currentStep];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">{tutorial.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{currentTutorial.image}</div>
          <h4 className="text-lg font-semibold text-white mb-2">{currentTutorial.title}</h4>
          <p className="text-gray-300 text-sm leading-relaxed">{currentTutorial.content}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {tutorial.steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-purple-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < tutorial.steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Start Playing!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Beginner Welcome Modal
function BeginnerWelcomeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const welcomeSteps = [
    {
      title: 'Welcome to KOL Nexus Arena! 🎮',
      content: 'You\'re about to enter the most exciting crypto gaming platform. Let\'s get you started with everything you need to know!',
      icon: '🌟'
    },
    {
      title: 'New User Benefits 🎁',
      content: 'As a new player, you get: 100 practice coins, beginner tutorials, lower minimum bets, and 24/7 support!',
      icon: '🎁'
    },
    {
      title: 'Practice Mode Available 🎓',
      content: 'Try all games risk-free with virtual coins. Perfect for learning game mechanics before using real crypto!',
      icon: '🎓'
    },
    {
      title: 'Beginner-Friendly Limits 🛡️',
      content: 'Special low minimum bets: 0.01 SOL for coinflip, 0.05 SOL for jackpot. Start small and learn!',
      icon: '🛡️'
    },
    {
      title: 'Ready to Begin? 🚀',
      content: 'Connect your wallet or try practice mode first. Our tutorials will guide you through each game!',
      icon: '🚀'
    }
  ];

  const currentWelcome = welcomeSteps[currentStep];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{currentWelcome.icon}</div>
          <h3 className="text-2xl font-bold text-white mb-2">{currentWelcome.title}</h3>
          <p className="text-gray-300 leading-relaxed">{currentWelcome.content}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {welcomeSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-purple-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < welcomeSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-4 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  localStorage.setItem('kolnexus_welcome_shown', 'true');
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Let's Play!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// GamesSidebar Component
function GamesSidebar({ activeGame, onSelectGame }: { activeGame: string | null; onSelectGame: (game: string | null) => void }) {
  const navigate = useNavigate();
  const menuItems = [
    { id: null, name: 'Game Lobby', icon: LayoutGrid },
    { id: 'practice', name: 'Practice Mode', icon: GraduationCap, badge: 'NEW' },
    { id: 'coinflip', name: 'Coinflip Arena', icon: Coins },
    { id: 'jackpot', name: 'Mega Jackpot', icon: DollarSign },
    { id: 'kol_predictor', name: 'KOL Battle Royale', icon: Trophy },
    { id: 'market_master', name: 'Market Master', icon: Star },
  ];

  const bottomMenuItems = [
    { id: 'beginner_guide', name: 'Beginner Guide', icon: BookOpen, badge: 'HELP' },
    { id: 'wallet', name: 'My Wallet', icon: Wallet },
    { id: 'history', name: 'Game History', icon: History },
    { id: 'stats', name: 'Statistics', icon: BarChart2 },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'help', name: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-72 bg-black/95 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col">
      {/* Back Button */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20"
        >
          <ArrowLeft size={18} className="text-gray-400 group-hover:text-white transition-colors" />
          <span className="text-gray-400 group-hover:text-white font-medium transition-colors">Back to Dashboard</span>
        </button>
      </div>

      {/* Logo */}
      <div className="px-6 pt-20 pb-6 border-b border-white/10">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/25 to-pink-600/25 rounded-lg blur-lg"></div>
          <div className="relative bg-black/50 backdrop-blur-xl rounded-lg p-4 border border-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              KOL NEXUS
            </h2>
            <p className="text-sm text-gray-400">Gaming Arena</p>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto py-6 scrollbar-none">
        <div className="px-4 mb-8">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">Games</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeGame === item.id;
            return (
              <button
                key={item.name}
                onClick={() => onSelectGame(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white shadow-lg shadow-purple-500/20'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white hover:shadow-md'
                }`}
              >
                <Icon size={20} className={`${isActive ? 'text-white' : 'text-gray-400'} transition-colors duration-300`} />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                    item.badge === 'NEW' ? 'bg-emerald-400/20 text-emerald-400' : 'bg-blue-400/20 text-blue-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">Account</div>
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => onSelectGame(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all duration-300 ${
                  activeGame === item.id
                    ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white shadow-lg shadow-purple-500/20'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white hover:shadow-md'
                }`}
              >
                <Icon size={20} className={`${activeGame === item.id ? 'text-white' : 'text-gray-400'} transition-colors`} />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-blue-400/20 text-blue-400">
                    {item.badge}
                  </span>
                )}
                {activeGame === item.id && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Stats */}
      <div className="p-6 border-t border-white/10 bg-gradient-to-t from-black/50 to-transparent">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg blur-lg"></div>
          <div className="relative bg-black/30 backdrop-blur-xl rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Crown size={20} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Beginner</div>
                <div className="text-xs text-gray-400">New player bonuses active!</div>
              </div>
            </div>
            <div className="mt-3 w-full h-1.5 bg-black/50 rounded-full overflow-hidden">
              <div className="h-full w-1/4 bg-gradient-to-r from-purple-400 to-pink-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Practice Mode Component
function PracticeMode({ onBack }: { onBack: () => void }) {
  const [practiceCoins, setPracticeCoins] = useState(100);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const practiceGames = [
    {
      id: 'practice_coinflip',
      name: 'Practice Coinflip',
      description: 'Learn coinflip basics with virtual coins',
      icon: Coins,
      color: 'from-yellow-400 to-orange-500',
      minBet: 1,
      maxBet: 10
    },
    {
      id: 'practice_jackpot',
      name: 'Practice Jackpot',
      description: 'Try jackpot mechanics risk-free',
      icon: DollarSign,
      color: 'from-purple-400 to-pink-500',
      minBet: 5,
      maxBet: 25
    },
    {
      id: 'practice_kol',
      name: 'Practice KOL Battle',
      description: 'Learn KOL prediction without risk',
      icon: Trophy,
      color: 'from-blue-400 to-cyan-500',
      minBet: 3,
      maxBet: 15
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
            <div className="bg-black/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2">
                <Coins className="text-yellow-400" size={20} />
                <span className="text-white font-semibold">{practiceCoins} Practice Coins</span>
              </div>
            </div>
        </div>

          {/* Practice Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <div className="text-lg font-semibold text-white">{game.minBet} coins</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-sm text-gray-400">Max Bet</div>
                        <div className="text-lg font-semibold text-white">{game.maxBet} coins</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedGame(game.id)}
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
                <h3 className="text-lg font-semibold text-white mb-2">Interactive Tutorials</h3>
                <p className="text-gray-400 text-sm">Step-by-step guidance for each game</p>
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
                <h3 className="text-lg font-semibold text-white mb-2">Free Coins</h3>
                <p className="text-gray-400 text-sm">100 practice coins to get started</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder components for other games
function MegaJackpot({ onBack }: { onBack: () => void }) {
  const { connected: walletConnected } = useWallet();
  const [betAmount, setBetAmount] = useState<number>(0.05);
  const [isSpinning, setIsSpinning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(57);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [spinRotation, setSpinRotation] = useState(0);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [currentJackpotRoom, setCurrentJackpotRoom] = useState<GameRoom | null>(null);
  const [showBeginnerTips, setShowBeginnerTips] = useState(false);

  useEffect(() => {
    // Get or create jackpot room
    const jackpotGames = realtimeGameService.getActiveGames().filter(game => game.gameType === 'jackpot');
    if (jackpotGames.length > 0) {
      setCurrentJackpotRoom(jackpotGames[0]);
    }
  }, []);

  // Mock player data
  const players = [
    { id: 1, name: 'Waiting', avatar: '❓', bet: 0.000, isWaiting: true },
    { id: 2, name: 'Aayush', avatar: '😊', bet: 0.001, isWaiting: false },
    { id: 3, name: 'Ivanssss', avatar: '😄', bet: 0.200, isWaiting: false, isSelected: true },
    { id: 4, name: 'Hatoshy', avatar: '💀', bet: 0.050, isWaiting: false },
    { id: 5, name: 'Waiting', avatar: '❓', bet: 0.000, isWaiting: true },
  ];

  const jackpotValue = 0.251;
  const userWager = 0.000;
  const userChance = 0.00;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Start spinning when timer reaches 0
          startSpinning();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSpinning = () => {
    setIsSpinning(true);
    setSelectedPlayer(null);
    setSpinRotation(0);
    
    // Animate rotation
    let currentRotation = 0;
    const totalSpins = 5; // Number of full rotations
    const finalRotation = totalSpins * 360;
    
    const spinInterval = setInterval(() => {
      currentRotation += 15; // Increase rotation by 15 degrees each step
      setSpinRotation(currentRotation);
      
      if (currentRotation >= finalRotation) {
        clearInterval(spinInterval);
        
        // Select random winner (excluding waiting players)
        const activePlayers = players.filter(p => !p.isWaiting);
        const winner = activePlayers[Math.floor(Math.random() * activePlayers.length)];
        const winnerIndex = players.findIndex(p => p.id === winner.id);
        
        // Calculate final position to land on winner
        const anglePerCard = 360 / 5;
        const winnerAngle = winnerIndex * anglePerCard;
        const finalPosition = finalRotation + (360 - winnerAngle);
        
        setSpinRotation(finalPosition);
        
        setTimeout(() => {
          setSelectedPlayer(winnerIndex);
          setIsSpinning(false);
          // Reset timer
          setTimeRemaining(60);
        }, 500);
      }
    }, 50); // Faster animation (50ms intervals)
  };

  const handlePlaceBet = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (betAmount <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    if (isSpinning || isPlacingBet) {
      return;
    }

    try {
      setIsPlacingBet(true);
      
      if (!currentJackpotRoom) {
        // Create new jackpot room
        const wallet = { connected: walletConnected } as any;
        const gameRoom = await realtimeGameService.createGameWithWallet(
          'jackpot',
          betAmount,
          'SOL',
          wallet
        );
        setCurrentJackpotRoom(gameRoom);
      } else {
        // Place bet in existing room
        const wallet = { connected: walletConnected } as any;
        await realtimeGameService.placeBet(currentJackpotRoom.id, betAmount, wallet);
      }

      toast.success('Bet placed successfully!');
      // For demo, start spinning after bet
      startSpinning();
      
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error('Failed to place bet');
    } finally {
      setIsPlacingBet(false);
    }
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

      {/* JACKPOT Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <span className="text-2xl font-bold">JACKPOT</span>
              </div>
              <span className="text-gray-400">Winner takes all...</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Bet Amount ~$0</span>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                  step="0.001"
                />
                <button 
                  onClick={() => setBetAmount(prev => prev + 0.1)}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  +0.1
                </button>
                <button 
                  onClick={() => setBetAmount(prev => prev + 1)}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  +1
                </button>
                  </div>
              <button 
                onClick={handlePlaceBet}
                disabled={betAmount <= 0 || isSpinning || isPlacingBet || !walletConnected}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {isPlacingBet ? 'Placing Bet...' : isSpinning ? 'Spinning...' : 'Place Bet'}
              </button>
                </div>
              </div>
              </div>
            </div>

      {/* Main Game Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-8 mb-12">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border-2 border-purple-500 p-6 text-center shadow-lg shadow-purple-500/20">
            <div className="text-3xl font-bold text-white mb-2">
              <div className="flex items-center justify-center space-x-2">
                <Coins size={24} className="text-purple-400" />
                <span>{jackpotValue}</span>
              </div>
            </div>
            <div className="text-gray-400 font-medium">Jackpot Value</div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-white mb-2">
              <div className="flex items-center justify-center space-x-2">
                <Coins size={24} className="text-gray-400" />
                <span>{userWager.toFixed(3)}</span>
            </div>
          </div>
            <div className="text-gray-400 font-medium">Your Wager</div>
        </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-white mb-2">{userChance.toFixed(2)}%</div>
            <div className="text-gray-400 font-medium">Your Chance</div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-6 text-center shadow-lg">
            <div className={`text-3xl font-bold mb-2 ${timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {formatTime(timeRemaining)}
          </div>
            <div className="text-gray-400 font-medium">Time Remaining</div>
          </div>
        </div>

        {/* Winner Indicator */}
        <div className="flex justify-center mb-8">
          <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-b-[35px] border-b-purple-500 drop-shadow-lg"></div>
        </div>

        {/* Circular Player Cards Container */}
        <div className="relative w-[600px] h-[600px] mx-auto">
          {/* Center circle for visual reference */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-500 rounded-full z-10"></div>
          
          {/* Spinning container */}
          <div 
            className="absolute inset-0 transition-transform duration-500 ease-out"
            style={{
              transform: `rotate(${spinRotation}deg)`,
              transformOrigin: 'center'
            }}
          >
            {players.map((player, index) => {
              const isCurrentlySelected = selectedPlayer === index;
              const angle = (index * 360) / 5; // 72 degrees apart for 5 cards
              const radius = 220; // Distance from center
              
              // Calculate position on circle
              const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
              const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
              
              return (
                <div 
                  key={player.id}
                  className={`absolute w-40 h-48 transition-all duration-300 ${
                    isCurrentlySelected ? 'z-20' : 'z-10'
                  }`}
                  style={{
                    left: `calc(50% + ${x}px - 80px)`, // 80px is half the card width
                    top: `calc(50% + ${y}px - 96px)`,  // 96px is half the card height
                    transform: `rotate(${-spinRotation}deg) ${isCurrentlySelected ? 'scale(1.2)' : 'scale(1)'}`,
                    transformOrigin: 'center'
                  }}
                >
                  <div className={`relative bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-xl rounded-2xl border-2 p-4 text-center transition-all duration-300 shadow-xl h-full ${
                    player.isWaiting 
                      ? 'border-gray-600 shadow-gray-600/20' 
                      : isCurrentlySelected 
                        ? 'border-purple-500 bg-gradient-to-br from-purple-900/50 to-pink-900/50 shadow-purple-500/40' 
                        : 'border-gray-700 hover:border-gray-600 shadow-gray-700/20'
                  }`}>
                    
                    {/* Glow effect for selected card */}
                    {isCurrentlySelected && (
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 -z-10"></div>
                    )}
                    
                    <div className={`w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl transition-all duration-300 shadow-lg ${
                      player.isWaiting 
                        ? 'bg-gradient-to-br from-gray-700 to-gray-800 shadow-gray-700/50' 
                        : isCurrentlySelected 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white/20 shadow-purple-500/50 animate-pulse' 
                          : index === 1 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/50' 
                            : index === 3 
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/50' 
                              : 'bg-gradient-to-br from-gray-600 to-gray-700 shadow-gray-600/50'
                    }`}>
                      {player.avatar}
                    </div>
                    
                    <div className="text-lg font-bold text-white mb-2">{player.name}</div>
                    
                    <div className="flex items-center justify-center space-x-1 bg-black/20 rounded-lg p-2">
                      <Coins size={16} className="text-purple-400" />
                      <span className="text-sm font-bold text-white">{player.bet.toFixed(3)}</span>
                    </div>
                  </div>
                  
                  {isCurrentlySelected && !isSpinning && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Crown size={16} className="text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Winner Announcement */}
        {selectedPlayer !== null && !isSpinning && (
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 max-w-md mx-auto">
              <div className="text-2xl font-bold text-white mb-2">🎉 WINNER! 🎉</div>
              <div className="text-xl text-white">{players[selectedPlayer].name}</div>
              <div className="text-lg text-purple-100 mt-2">
                Wins {jackpotValue} SOL!
              </div>
            </div>
          </div>
        )}

        {/* Spinning Animation Overlay */}
        {isSpinning && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-40 h-40 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <div className="text-3xl font-bold text-white mb-2">Spinning the Wheel...</div>
              <div className="text-gray-400 text-lg">Determining the winner...</div>
            </div>
          </div>
        )}
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
              className={`w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 px-8 rounded-xl font-bold text-xl flex items-center justify-center gap-2 transition-all transform hover:scale-105 shadow-lg ${
                !selectedKOL ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!selectedKOL}
            >
              <Play size={18} />
              {!selectedKOL ? 'CONNECTING...' : 'ENTER ARENA'}
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
  const { connected: walletConnected, publicKey } = useWallet();
  const [betAmount, setBetAmount] = useState<number>(0.01);
  const [currency, setCurrency] = useState<'SOL' | 'USDT'>('SOL');
  const [sortBy, setSortBy] = useState<'High to Low' | 'Low to High'>('High to Low');
  const [filterBy, setFilterBy] = useState<'All' | 'Amount'>('All');
  const [activeGames, setActiveGames] = useState<GameRoom[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [showBeginnerTips, setShowBeginnerTips] = useState(false);

  useEffect(() => {
    // Get active coinflip games
    const games = realtimeGameService.getActiveGames().filter(game => game.gameType === 'coinflip');
    setActiveGames(games);
  }, []);

  const handleCreateGame = async () => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (betAmount <= 0) {
      toast.error('Please enter a valid bet amount');
      return;
    }

    try {
      setIsCreating(true);
      const wallet = { connected: walletConnected, publicKey } as any;
      const gameRoom = await realtimeGameService.createGameWithWallet(
        'coinflip',
        betAmount,
        currency,
        wallet
      );
      
      toast.success('Game created successfully!');
      
      // Subscribe to game updates
      realtimeGameService.subscribeToGame(gameRoom.id, (update) => {
        // Handle game updates
        if (update.type === 'player_joined') {
          toast.success('Player joined your game!');
        } else if (update.type === 'game_finished') {
          toast.success(update.data.winner.id === publicKey?.toString() ? 'You won!' : 'You lost!');
        }
      });

      // Refresh active games
      const updatedGames = realtimeGameService.getActiveGames().filter(game => game.gameType === 'coinflip');
      setActiveGames(updatedGames);
      
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    if (!walletConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsJoining(gameId);
      const wallet = { connected: walletConnected, publicKey } as any;
      const gameRoom = await realtimeGameService.joinGameWithWallet(gameId, wallet);
      
      toast.success('Joined game successfully!');
      
      // Subscribe to game updates
      realtimeGameService.subscribeToGame(gameRoom.id, (update) => {
        if (update.type === 'game_finished') {
          toast.success(update.data.winner.id === publicKey?.toString() ? 'You won!' : 'You lost!');
        }
      });

      // Refresh active games
      const updatedGames = realtimeGameService.getActiveGames().filter(game => game.gameType === 'coinflip');
      setActiveGames(updatedGames);
      
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
    } finally {
      setIsJoining(null);
    }
  };

  // Mock game data - in a real app this would come from an API
  const games = [
    {
      id: 1,
      player1: { username: 'vagg', avatar: '🎮', level: 9 },
      player2: { username: 'Waiting...', avatar: '⏳', level: 1 },
      amount: 0.2,
      currency: 'SOL',
      status: 'waiting'
    },
    {
      id: 2,
      player1: { username: 'i-ate-sol...', avatar: '🍕', level: 25 },
      player2: { username: 'Waiting...', avatar: '⏳', level: 1 },
      amount: 0.003,
      currency: 'SOL',
      status: 'waiting'
    },
    {
      id: 3,
      player1: { username: 'unhedg...', avatar: '🦔', level: 20 },
      player2: { username: 'Waiting...', avatar: '⏳', level: 1 },
      amount: 0.001,
      currency: 'SOL',
      status: 'waiting'
    },
    {
      id: 4,
      player1: { username: 'BREM_01', avatar: '🎯', level: 14 },
      player2: { username: 'Yunohik', avatar: '🎪', level: 7 },
      amount: 0.045,
      currency: 'SOL',
      status: 'joining',
      countdown: 30
    },
    {
      id: 5,
      player1: { username: 'mrq', avatar: '🎮', level: 2 },
      player2: { username: 'Pumpy', avatar: '🎃', level: 100 },
      amount: 0.084,
      currency: 'SOL',
      status: 'flipping'
    },
    {
      id: 6,
      player1: { username: 'Eddzus', avatar: '🎲', level: 8 },
      player2: { username: 'Pumpy', avatar: '🎃', level: 100 },
      amount: 0.8,
      currency: 'SOL',
      status: 'winner',
      winner: 'Pumpy'
    }
  ];

  const sortedGames = [...activeGames].sort((a, b) => {
    if (sortBy === 'High to Low') {
      return b.betAmount - a.betAmount;
    } else {
      return a.betAmount - b.betAmount;
    }
  });

  const getStatusBadge = (game: any) => {
    switch (game.status) {
      case 'waiting':
        return <span className="text-gray-400">Waiting...</span>;
      case 'joining':
        return <span className="text-blue-400">Joining {game.countdown}</span>;
      case 'flipping':
        return <span className="text-yellow-400">Flipping...</span>;
      case 'winner':
        return <span className="text-green-400 bg-green-400/20 px-2 py-1 rounded text-sm">Winner</span>;
      default:
        return null;
    }
  };

  const getJoinButton = (game: any) => {
    switch (game.status) {
      case 'waiting':
    return (
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
            Join
          </button>
        );
      case 'joining':
        return (
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
            Joining {game.countdown}
          </button>
        );
      case 'flipping':
        return (
          <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
            Flipping...
          </button>
        );
      case 'winner':
        return (
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
            Winner
          </button>
        );
      default:
        return null;
    }
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

      {/* COINFLIP Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Coins size={24} className="text-purple-400" />
                <span className="text-2xl font-bold">COINFLIP</span>
              </div>
              <span className="text-gray-400">The classic 50/50 game mode.</span>
          </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">Bet Amount ~$0</span>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
                <button className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors">
                  +0.1
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors">
                  +1
                </button>
                    </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Coins size={16} className="text-white" />
                  </div>
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                  <DollarSign size={16} className="text-white" />
                </div>
                </div>
              <button
                onClick={handleCreateGame}
                disabled={isCreating || !walletConnected}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Game'}
              </button>
              </div>
            </div>
          </div>
        </div>

      {/* Game List Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold">ALL GAMES</span>
              <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm">64</span>
          </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Payouts are settled in SOL</span>
        </div>
      </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'High to Low' | 'Low to High')}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="High to Low">High to Low</option>
                <option value="Low to High">Low to High</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">Amount</span>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as 'All' | 'Amount')}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="All">All</option>
                <option value="Amount">Amount</option>
              </select>
          </div>
          </div>
        </div>

        {/* Game List */}
        <div className="space-y-4">
          {sortedGames.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">No active games</div>
              <div className="text-gray-500">Create a game to start playing!</div>
              </div>
          ) : (
            sortedGames.map((game) => {
              const player1 = game.players[0];
              const player2 = game.players[1] || { username: 'Waiting...', avatar: '⏳', level: 1 };
              const isWaitingForPlayer = game.players.length === 1;
              
              return (
                <div key={game.id} className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      {/* Player 1 */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg">
                          {player1.avatar || '🎮'}
                  </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
                              {player1.level || 1}
                            </span>
                            <span className="font-semibold">{player1.username}</span>
                    </div>
            </div>
          </div>

                      {/* VS */}
                      <div className="flex items-center space-x-3">
                        <Swords size={20} className="text-gray-400" />
              </div>

                      {/* Player 2 */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-lg">
                          {player2.avatar || '⏳'}
                </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                              {player2.level || 1}
                            </span>
                            <span className="font-semibold">{player2.username}</span>
              </div>
                </div>
              </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Amount */}
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Coins size={16} className="text-purple-400" />
                          <span className="text-lg font-bold">{game.betAmount} {game.currency}</span>
                </div>
                  </div>

                      {/* Status */}
                      <div className="min-w-[120px] text-center">
                        {game.status === 'waiting' && <span className="text-gray-400">Waiting...</span>}
                        {game.status === 'playing' && <span className="text-yellow-400">Playing...</span>}
                        {game.status === 'finished' && <span className="text-green-400 bg-green-400/20 px-2 py-1 rounded text-sm">Finished</span>}
                </div>

                      {/* Action Button */}
                      <div className="flex items-center space-x-2">
                        {isWaitingForPlayer && (
                <button
                            onClick={() => handleJoinGame(game.id)}
                            disabled={isJoining === game.id || !walletConnected}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isJoining === game.id ? 'Joining...' : 'Join'}
                </button>
                        )}
                        {!isWaitingForPlayer && (
                          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                            Watch
                          </button>
                        )}
                        <button className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                          <Play size={16} className="text-white" />
                  </button>
              </div>
            </div>
            </div>
          </div>
              );
            })
        )}
        </div>
      </div>
    </div>
  );
}

// Import new components
import BeginnerGuide from './Account/BeginnerGuide';
import GameHistory from './Account/GameHistory';
import Statistics from './Account/Statistics';
import GameSettings from './Account/Settings';
import HelpSupport from './Account/HelpSupport';

// Main Games component with modern game selection
export default function Games() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeGames, setActiveGames] = useState<GameRoom[]>([]);
  const [onlineUsers, setOnlineUsers] = useState(48);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialGame, setTutorialGame] = useState('');
  const { user } = useAuth();
  const { connected: walletConnected } = useWallet();

  useEffect(() => {
    // Subscribe to connection changes
    const unsubscribe = realtimeGameService.onConnectionChange((connected) => {
      setIsConnected(connected);
      if (connected) {
        toast.success('Connected to game server');
      } else {
        toast.error('Disconnected from game server');
      }
    });

    // Get initial connection status
    const initiallyConnected = realtimeGameService.isConnected();
    setIsConnected(initiallyConnected);

    // If not connected, try to force a connection
    if (!initiallyConnected) {
      console.log('Not connected, attempting to connect...');
      setTimeout(() => {
        realtimeGameService.forceReconnect();
      }, 1000);
    }

    // Get active games
    const games = realtimeGameService.getActiveGames();
    setActiveGames(games);

    // Check if this is a new user
    const welcomeShown = localStorage.getItem('kolnexus_welcome_shown');
    if (!welcomeShown) {
      setShowWelcomeModal(true);
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleGameSelect = (gameId: string | null) => {
    if (gameId && gameId !== 'practice' && !walletConnected) {
      toast.error('Please connect your wallet to play games');
      return;
    }
    setActiveGame(gameId);
  };

  const handleTutorialClick = (gameType: string) => {
    setTutorialGame(gameType);
    setShowTutorial(true);
  };

  const renderGameContent = () => {
    switch (activeGame) {
      case 'practice':
        return <PracticeMode onBack={() => setActiveGame(null)} />;
    case 'coinflip':
        return <MultiplayerCoinflip onBack={() => setActiveGame(null)} />;
    case 'jackpot':
        return <MegaJackpot onBack={() => setActiveGame(null)} />;
    case 'kol_predictor':
        return <KOLBattleRoyale onBack={() => setActiveGame(null)} />;
    case 'market_master':
        return <MarketMasterArena onBack={() => setActiveGame(null)} />;
      // Add new account menu items
      case 'beginner_guide':
        return <BeginnerGuide />;
      case 'history':
        return <GameHistory />;
      case 'stats':
        return <Statistics />;
      case 'settings':
        return <GameSettings />;
      case 'help':
        return <HelpSupport />;
      default:
  return (
    <div className="min-h-screen relative">
            <div className="fixed inset-0 z-0" style={{
              backgroundImage: `url(${blurBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
              filter: 'blur(8px) brightness(0.4)',
            }} />
            
            <div className="relative z-10">
              {/* Hero Section */}
              <div className="text-center pt-12 pb-8">
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              KOL NEXUS ARENA
            </h1>
                <p className="text-xl text-gray-300 mb-8">
              Real-time multiplayer crypto gaming • Battle players worldwide • Instant rewards
            </p>
            
                {/* Stats */}
                <div className="flex justify-center gap-8 mb-12">
                  <div 
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full backdrop-blur-xl cursor-pointer hover:bg-white/10 transition-all duration-200"
                    onClick={() => {
                      if (!isConnected) {
                        console.log('Attempting to reconnect...');
                        realtimeGameService.testConnection();
                        realtimeGameService.forceReconnect();
                        toast.loading('Reconnecting...', { duration: 3000 });
                      } else {
                        realtimeGameService.testConnection();
                        toast.success('Connection is active!');
                      }
                    }}
                  >
                    {isConnected ? (
                      <>
                        <Wifi size={16} className="text-emerald-400" />
                        <span className="text-emerald-400">Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff size={16} className="text-red-400" />
                        <span className="text-red-400">Disconnected (Click to reconnect)</span>
                      </>
                    )}
              </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full backdrop-blur-xl">
                    <Users size={16} className="text-blue-400" />
                    <span className="text-blue-400">{onlineUsers} Players Online</span>
              </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full backdrop-blur-xl">
                    {walletConnected ? (
                      <>
                        <Wallet size={16} className="text-purple-400" />
                        <span className="text-purple-400">Wallet Connected</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} className="text-amber-400" />
                        <span className="text-amber-400">Connect Wallet</span>
                      </>
                    )}
              </div>
            </div>
          </div>

              {/* Game Grid */}
              <div className="max-w-[1800px] mx-auto px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Coinflip Arena */}
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600/50 to-orange-600/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="relative bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                          <Coins className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
                          <span className="text-xs font-medium text-emerald-400">LIVE</span>
                          <span className="text-xs font-medium text-gray-400 ml-2">24 playing</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Coinflip Arena</h3>
                      <p className="text-gray-400 text-sm mb-6">Real-time 1v1 battles with instant crypto rewards</p>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Min Bet</div>
                          <div className="text-lg font-semibold text-white">0.01 SOL</div>
                          <div className="text-xs text-emerald-400">Beginner Rate!</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Max Bet</div>
                          <div className="text-lg font-semibold text-white">10 SOL</div>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 mb-6">
                        <div className="text-sm text-gray-400">Max Payout</div>
                        <div className="text-lg font-semibold text-orange-400">1.8x</div>
                      </div>
                      <div className="space-y-2">
                <button
                          onClick={() => handleGameSelect('coinflip')}
                          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!isConnected}
                        >
                          <Play size={18} />
                          {!isConnected ? 'CONNECTING...' : 'ENTER ARENA'}
                </button>
                        <button
                          onClick={() => handleTutorialClick('coinflip')}
                          className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300"
                        >
                          <BookOpen size={16} />
                          Tutorial
                        </button>
                      </div>
            </div>
          </div>

                  {/* Mega Jackpot */}
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/50 to-pink-600/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="relative bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center">
                          <div className="px-2 py-1 rounded-full bg-red-400/20 text-red-400 text-xs font-medium">HOT</div>
                          <span className="text-xs font-medium text-gray-400 ml-2">12 playing</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Mega Jackpot</h3>
                      <p className="text-gray-400 text-sm mb-6">Progressive pool battles with massive payouts</p>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Min Bet</div>
                          <div className="text-lg font-semibold text-white">0.05 SOL</div>
                          <div className="text-xs text-emerald-400">Beginner Rate!</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Max Bet</div>
                          <div className="text-lg font-semibold text-white">50 SOL</div>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 mb-6">
                        <div className="text-sm text-gray-400">Max Payout</div>
                        <div className="text-lg font-semibold text-purple-400">100x</div>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleGameSelect('jackpot')}
                          className="w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!isConnected}
                        >
                          <Play size={18} />
                          {!isConnected ? 'CONNECTING...' : 'ENTER ARENA'}
                        </button>
                        <button
                          onClick={() => handleTutorialClick('jackpot')}
                          className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300"
                        >
                          <BookOpen size={16} />
                          Tutorial
                        </button>
                        </div>
                              </div>
                          </div>

                  {/* KOL Battle Royale */}
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/50 to-cyan-600/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="relative bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse mr-2"></div>
                          <span className="text-xs font-medium text-emerald-400">LIVE</span>
                          <span className="text-xs font-medium text-gray-400 ml-2">8 playing</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">KOL Battle Royale</h3>
                      <p className="text-gray-400 text-sm mb-6">Predict crypto influencer performance in real-time</p>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Min Bet</div>
                          <div className="text-lg font-semibold text-white">0.02 SOL</div>
                          <div className="text-xs text-emerald-400">Beginner Rate!</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Max Bet</div>
                          <div className="text-lg font-semibold text-white">25 SOL</div>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 mb-6">
                        <div className="text-sm text-gray-400">Max Payout</div>
                        <div className="text-lg font-semibold text-blue-400">5x</div>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleGameSelect('kol_predictor')}
                          className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={!isConnected}
                        >
                          <Play size={18} />
                          {!isConnected ? 'CONNECTING...' : 'ENTER ARENA'}
                        </button>
                        <button
                          onClick={() => handleTutorialClick('kol_predictor')}
                          className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all duration-300"
                        >
                          <BookOpen size={16} />
                          Tutorial
                        </button>
                        </div>
                      </div>
                    </div>
                    
                  {/* Market Master Arena */}
                  <div className="group relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/50 to-teal-600/50 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="relative bg-black/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300">
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                          <Star className="w-6 h-6 text-white" />
                      </div>
                        <div className="flex items-center">
                          <div className="px-2 py-1 rounded-full bg-purple-400/20 text-purple-400 text-xs font-medium">BETA</div>
                          <span className="text-xs font-medium text-gray-400 ml-2">4 playing</span>
                      </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Market Master Arena</h3>
                      <p className="text-gray-400 text-sm mb-6">Coming Soon</p>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Min Bet</div>
                          <div className="text-lg font-semibold text-white">TBA</div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="text-sm text-gray-400">Max Bet</div>
                          <div className="text-lg font-semibold text-white">TBA</div>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3 mb-6">
                        <div className="text-sm text-gray-400">Max Payout</div>
                        <div className="text-lg font-semibold text-emerald-400">TBA</div>
                      </div>
                      <button
                        onClick={() => setActiveGame('market_master')}
                        className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <Play size={18} />
                        COMING SOON
                      </button>
                    </div>
                  </div>
                      </div>
                    </div>
                    
              {/* New User Help Section */}
              <div className="mt-16 bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">New to Crypto Gaming?</h2>
                  <p className="text-gray-300 text-lg">We've got you covered! Start with our beginner-friendly features.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <GraduationCap size={32} className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Practice Mode</h3>
                    <p className="text-gray-400 mb-4">Learn all games risk-free with 100 virtual coins</p>
                    <button
                      onClick={() => setActiveGame('practice')}
                      className="px-6 py-2 bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-400 rounded-lg transition-colors"
                    >
                      Try Practice Mode
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <BookOpen size={32} className="text-white" />
                </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Interactive Tutorials</h3>
                    <p className="text-gray-400 mb-4">Step-by-step guides for each game</p>
                    <button
                      onClick={() => setShowWelcomeModal(true)}
                      className="px-6 py-2 bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 rounded-lg transition-colors"
                    >
                      View Tutorials
                    </button>
          </div>

                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield size={32} className="text-white" />
            </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Beginner Rates</h3>
                    <p className="text-gray-400 mb-4">Lower minimum bets starting from 0.01 SOL</p>
                    <button
                      onClick={() => toast.success('Beginner rates are already active!')}
                      className="px-6 py-2 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 rounded-lg transition-colors"
                    >
                      Already Active!
                    </button>
            </div>
            </div>
          </div>
        </div>
      </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <GamesSidebar activeGame={activeGame} onSelectGame={handleGameSelect} />
      <div className="pl-76 flex justify-center">
        <div className="w-full max-w-[1800px]">
          {renderGameContent()}
        </div>
      </div>
      
      {/* Modals */}
      <BeginnerWelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />
      <TutorialModal 
        isOpen={showTutorial} 
        onClose={() => setShowTutorial(false)} 
        gameType={tutorialGame}
      />
    </div>
  );
} 