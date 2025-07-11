import React, { useState } from 'react';
import { ArrowLeft, Trophy, Computer, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import SOLDepositModal from './SOLDepositModal';
import { transactionService } from '../services/transactionService';
import gaImg from '../ga.jpg';

interface KOLBattleGameProps {
  onBack: () => void;
}

export default function KOLBattleGame({ onBack }: KOLBattleGameProps) {
  const [betAmount, setBetAmount] = useState<number>(0.1);
  const [selectedKOL, setSelectedKOL] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<'up' | 'down' | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock KOLs
  const kols = [
    { 
      id: '1', 
      name: 'CryptoKing', 
      avatar: '👑',
      prediction: '+15.2%', 
      confidence: '85%', 
      multiplier: '2.5x',
      followers: '500K',
      winRate: '78%'
    },
    { 
      id: '2', 
      name: 'BlockchainGuru', 
      avatar: '🧙‍♂️',
      prediction: '+8.7%', 
      confidence: '92%', 
      multiplier: '1.8x',
      followers: '1.2M',
      winRate: '84%'
    },
    { 
      id: '3', 
      name: 'TokenWhisperer', 
      avatar: '🎯',
      prediction: '+25.1%', 
      confidence: '65%', 
      multiplier: '3.2x',
      followers: '750K',
      winRate: '72%'
    },
    { 
      id: '4', 
      name: 'DegenTrader', 
      avatar: '🔥',
      prediction: '+12.8%', 
      confidence: '88%', 
      multiplier: '2.1x',
      followers: '300K',
      winRate: '81%'
    }
  ];

  const selectedKOLData = kols.find(kol => kol.id === selectedKOL);

  const handleStartGame = () => {
    if (!selectedKOL || !selectedPrediction) {
      toast.error('Please select a KOL and prediction direction');
      return;
    }
    setShowDepositModal(true);
  };

  const handleDepositVerified = () => {
    setShowDepositModal(false);
    startKOLBattle();
  };

  const startKOLBattle = () => {
    setIsPlaying(true);
    setIsAnalyzing(true);
    setGameResult(null);

    // Simulate analysis period
    setTimeout(() => {
      setIsAnalyzing(false);
      
      // Get game outcome from transaction service (98% computer win rate)
      const outcome = transactionService.simulateGameOutcome('kol_predictor', betAmount);
      const actualMovement = outcome.gameDetails.actualMovement;
      const priceChange = outcome.gameDetails.priceChange;
      
      setGameResult({
        selectedKOL: selectedKOLData,
        userPrediction: selectedPrediction,
        actualMovement,
        priceChange,
        winner: outcome.winner,
        userWins: outcome.winner === 'user',
        payout: outcome.userPayout,
        correct: selectedPrediction === actualMovement
      });
      setIsPlaying(false);
    }, 5000); // 5 second analysis period
  };

  const resetGame = () => {
    setGameResult(null);
    setSelectedKOL(null);
    setSelectedPrediction(null);
  };

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: `url(${gaImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px) brightness(0.8)',
      }} />
      
      <div className="relative z-10">
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
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full mb-6">
              <Trophy size={48} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              KOL BATTLE ROYALE
            </h1>
                      <p className="text-xl text-gray-300 mb-4">Real KOL tracking • Live predictions • Expert analysis</p>
          </div>

          {!gameResult && !isPlaying && (
            <div className="max-w-6xl mx-auto">
              {/* Game Setup */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
                <h3 className="text-2xl font-bold mb-6 text-center text-white">Select KOL & Make Prediction</h3>
                
                {/* Bet Amount */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bet Amount (SOL)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      min="0.05"
                      step="0.05"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 text-center text-lg"
                      placeholder="0.1"
                    />
                  </div>
                  <div className="flex items-center justify-center space-x-2 mt-3">
                    <button 
                      onClick={() => setBetAmount(0.1)}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      0.1
                    </button>
                    <button 
                      onClick={() => setBetAmount(0.25)}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      0.25
                    </button>
                    <button 
                      onClick={() => setBetAmount(0.5)}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      0.5
                    </button>
                  </div>
                </div>

                {/* KOL Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-300 mb-4 text-center">Choose Your KOL</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {kols.map((kol) => (
                      <button
                        key={kol.id}
                        onClick={() => setSelectedKOL(kol.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedKOL === kol.id 
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400' 
                            : 'border-white/10 hover:border-white/30 text-gray-300 bg-black/50'
                        }`}
                      >
                        <div className="text-center mb-3">
                          <div className="text-3xl mb-2">{kol.avatar}</div>
                          <div className="font-bold text-white">{kol.name}</div>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>Prediction:</span>
                            <span className="text-green-400 font-semibold">{kol.prediction}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Confidence:</span>
                            <span className="font-semibold">{kol.confidence}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Multiplier:</span>
                            <span className="text-blue-400 font-semibold">{kol.multiplier}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Win Rate:</span>
                            <span className="text-purple-400 font-semibold">{kol.winRate}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prediction Direction */}
                {selectedKOL && (
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                      Will {selectedKOLData?.name}'s prediction be correct?
                    </label>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <button
                        onClick={() => setSelectedPrediction('up')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          selectedPrediction === 'up' 
                            ? 'border-green-500 bg-green-500/20 text-green-400' 
                            : 'border-gray-600 hover:border-gray-500 text-gray-300'
                        }`}
                      >
                        <TrendingUp size={32} className="mx-auto mb-2" />
                        <div className="font-semibold">CORRECT</div>
                        <div className="text-sm opacity-70">KOL will be right</div>
                      </button>
                      <button
                        onClick={() => setSelectedPrediction('down')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          selectedPrediction === 'down' 
                            ? 'border-red-500 bg-red-500/20 text-red-400' 
                            : 'border-gray-600 hover:border-gray-500 text-gray-300'
                        }`}
                      >
                        <TrendingDown size={32} className="mx-auto mb-2" />
                        <div className="font-semibold">WRONG</div>
                        <div className="text-sm opacity-70">KOL will be wrong</div>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStartGame}
                  disabled={!selectedKOL || !selectedPrediction || betAmount <= 0}
                  className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl font-bold text-lg transition-all"
                >
                  Deposit {betAmount} SOL & Start Battle
                </button>
              </div>
            </div>
          )}

          {/* Game Playing State */}
          {isPlaying && (
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-12">
                {isAnalyzing ? (
                  <>
                    <h3 className="text-2xl font-bold mb-8 text-white">Analyzing KOL Performance...</h3>
                    
                    <div className="mb-8">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-6xl animate-pulse">
                        {selectedKOLData?.avatar}
                      </div>
                      <div className="mt-4 text-xl font-bold text-white">
                        Tracking {selectedKOLData?.name}
                      </div>
                    </div>

                                         <div className="text-gray-300">
                       <p>Your bet: <span className="text-white font-semibold">{betAmount} SOL</span></p>
                       <p>Your prediction: <span className="font-semibold">
                         {selectedPrediction === 'up' ? 'KOL will be CORRECT' : 'KOL will be WRONG'}
                       </span></p>
                       <p className="text-sm mt-4 animate-pulse">Verifying with live market data...</p>
                     </div>
                  </>
                ) : (
                  <div className="text-white">Analysis complete! Results incoming...</div>
                )}
              </div>
            </div>
          )}

          {/* Game Result */}
          {gameResult && (
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-12">
                <div className="mb-8">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 flex items-center justify-center text-6xl">
                    {gameResult.selectedKOL.avatar}
                  </div>
                  <div className="mt-4 text-2xl font-bold text-white">
                    {gameResult.selectedKOL.name} Result
                  </div>
                  <div className="text-lg text-gray-300">
                    Actual Performance: <span className={`font-bold ${gameResult.actualMovement === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {gameResult.priceChange}
                    </span>
                  </div>
                </div>

                <div className={`text-center p-6 rounded-xl mb-6 ${gameResult.userWins ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
                                   <div className={`text-2xl font-bold mb-2 ${gameResult.userWins ? 'text-green-400' : 'text-red-400'}`}>
                   {gameResult.userWins ? '🎉 YOU WON!' : '😔 YOU LOST!'}
                 </div>
                  <div className="text-gray-300 mb-2">
                    KOL Prediction: <span className="font-semibold">{gameResult.selectedKOL.prediction}</span>
                  </div>
                  <div className="text-gray-300 mb-2">
                    KOL was: <span className={`font-semibold ${gameResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                      {gameResult.correct ? 'CORRECT' : 'WRONG'}
                    </span>
                  </div>
                  <div className="text-gray-300">
                    Your prediction: <span className="font-semibold">
                      {gameResult.userPrediction === 'up' ? 'KOL would be CORRECT' : 'KOL would be WRONG'}
                    </span>
                  </div>
                  {gameResult.userWins && (
                    <div className="mt-4 text-xl">
                      Payout: <span className="text-green-400 font-bold">{gameResult.payout.toFixed(4)} SOL</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={resetGame}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-8 rounded-xl font-semibold transition-all"
                >
                  Battle Again
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
          gameType="kol_predictor"
          betAmount={betAmount}
        />
      </div>
    </div>
  );
} 