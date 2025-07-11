import React, { useState } from 'react';
import { ArrowLeft, Star, Computer, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import SOLDepositModal from './SOLDepositModal';
import { transactionService } from '../services/transactionService';
import gaImg from '../ga.jpg';

interface MarketMasterGameProps {
  onBack: () => void;
}

export default function MarketMasterGame({ onBack }: MarketMasterGameProps) {
  const [betAmount, setBetAmount] = useState<number>(0.2);
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'bullish' | 'bearish' | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock markets
  const markets = [
    { 
      id: '1', 
      name: 'BTC/USD', 
      symbol: '₿',
      currentPrice: '$43,250',
      trend: '+5.2%', 
      volume: '$1.2B', 
      volatility: 'High',
      prediction: 'Bullish momentum expected'
    },
    { 
      id: '2', 
      name: 'ETH/USD', 
      symbol: 'Ξ',
      currentPrice: '$2,650',
      trend: '+3.8%', 
      volume: '$800M', 
      volatility: 'Medium',
      prediction: 'Consolidation phase'
    },
    { 
      id: '3', 
      name: 'SOL/USD', 
      symbol: '◎',
      currentPrice: '$98.50',
      trend: '+12.4%', 
      volume: '$400M', 
      volatility: 'Very High',
      prediction: 'High growth potential'
    },
    { 
      id: '4', 
      name: 'AVAX/USD', 
      symbol: '🔺',
      currentPrice: '$45.20',
      trend: '+8.1%', 
      volume: '$150M', 
      volatility: 'High',
      prediction: 'Emerging opportunities'
    }
  ];

  const selectedMarketData = markets.find(market => market.id === selectedMarket);

  const handleStartGame = () => {
    if (!selectedMarket || !selectedDirection) {
      toast.error('Please select a market and direction');
      return;
    }
    setShowDepositModal(true);
  };

  const handleDepositVerified = () => {
    setShowDepositModal(false);
    startMarketGame();
  };

  const startMarketGame = () => {
    setIsPlaying(true);
    setIsAnalyzing(true);
    setGameResult(null);

    // Simulate market analysis period
    setTimeout(() => {
      setIsAnalyzing(false);
      
      // Get game outcome from transaction service (98% computer win rate)
      const outcome = transactionService.simulateGameOutcome('market_master', betAmount);
      const actualOutcome = outcome.gameDetails.actualOutcome;
      const priceMovement = outcome.gameDetails.priceMovement;
      
      setGameResult({
        selectedMarket: selectedMarketData,
        userPrediction: selectedDirection,
        actualOutcome,
        priceMovement,
        winner: outcome.winner,
        userWins: outcome.winner === 'user',
        payout: outcome.userPayout,
        correct: selectedDirection === actualOutcome
      });
      setIsPlaying(false);
    }, 6000); // 6 second analysis period
  };

  const resetGame = () => {
    setGameResult(null);
    setSelectedMarket(null);
    setSelectedDirection(null);
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
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mb-6">
              <Star size={48} className="text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              MARKET MASTER ARENA
            </h1>
                      <p className="text-xl text-gray-300 mb-4">Live market analysis • Real-time trading • Professional insights</p>
          </div>

          {!gameResult && !isPlaying && (
            <div className="max-w-6xl mx-auto">
              {/* Game Setup */}
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
                <h3 className="text-2xl font-bold mb-6 text-center text-white">Predict Market Movement</h3>
                
                {/* Bet Amount */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bet Amount (SOL)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      min="0.1"
                      step="0.1"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 text-center text-lg"
                      placeholder="0.2"
                    />
                  </div>
                  <div className="flex items-center justify-center space-x-2 mt-3">
                    <button 
                      onClick={() => setBetAmount(0.2)}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      0.2
                    </button>
                    <button 
                      onClick={() => setBetAmount(0.5)}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      0.5
                    </button>
                    <button 
                      onClick={() => setBetAmount(1.0)}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      1.0
                    </button>
                  </div>
                </div>

                {/* Market Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-300 mb-4 text-center">Choose Your Market</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {markets.map((market) => (
                      <button
                        key={market.id}
                        onClick={() => setSelectedMarket(market.id)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedMarket === market.id 
                            ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' 
                            : 'border-white/10 hover:border-white/30 text-gray-300 bg-black/50'
                        }`}
                      >
                        <div className="text-center mb-3">
                          <div className="text-3xl mb-2">{market.symbol}</div>
                          <div className="font-bold text-white">{market.name}</div>
                          <div className="text-sm text-gray-400">{market.currentPrice}</div>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span>24h Change:</span>
                            <span className="text-green-400 font-semibold">{market.trend}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Volume:</span>
                            <span className="font-semibold">{market.volume}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Volatility:</span>
                            <span className="text-orange-400 font-semibold">{market.volatility}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Market Prediction */}
                {selectedMarket && (
                  <div className="mb-8">
                    <div className="bg-black/50 rounded-xl p-4 mb-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-400">Market Analysis</div>
                        <div className="text-white font-semibold">{selectedMarketData?.prediction}</div>
                      </div>
                    </div>
                    
                    <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                      Predict next hour movement for {selectedMarketData?.name}
                    </label>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <button
                        onClick={() => setSelectedDirection('bullish')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          selectedDirection === 'bullish' 
                            ? 'border-green-500 bg-green-500/20 text-green-400' 
                            : 'border-gray-600 hover:border-gray-500 text-gray-300'
                        }`}
                      >
                        <TrendingUp size={32} className="mx-auto mb-2" />
                        <div className="font-semibold">BULLISH</div>
                        <div className="text-sm opacity-70">Price will increase</div>
                      </button>
                      <button
                        onClick={() => setSelectedDirection('bearish')}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          selectedDirection === 'bearish' 
                            ? 'border-red-500 bg-red-500/20 text-red-400' 
                            : 'border-gray-600 hover:border-gray-500 text-gray-300'
                        }`}
                      >
                        <TrendingDown size={32} className="mx-auto mb-2" />
                        <div className="font-semibold">BEARISH</div>
                        <div className="text-sm opacity-70">Price will decrease</div>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleStartGame}
                  disabled={!selectedMarket || !selectedDirection || betAmount <= 0}
                  className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl font-bold text-lg transition-all"
                >
                  Deposit {betAmount} SOL & Trade
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
                    <h3 className="text-2xl font-bold mb-8 text-white">Analyzing Market Conditions...</h3>
                    
                    <div className="mb-8">
                      <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-6xl animate-pulse">
                        {selectedMarketData?.symbol}
                      </div>
                      <div className="mt-4 text-xl font-bold text-white">
                        {selectedMarketData?.name}
                      </div>
                      <div className="text-lg text-gray-300">
                        Current: {selectedMarketData?.currentPrice}
                      </div>
                    </div>

                                         <div className="text-gray-300">
                       <p>Your bet: <span className="text-white font-semibold">{betAmount} SOL</span></p>
                       <p>Your prediction: <span className="font-semibold">
                         {selectedDirection?.toUpperCase()}
                       </span></p>
                       <p className="text-sm mt-4 animate-pulse">Processing live market data...</p>
                     </div>
                  </>
                ) : (
                  <div className="text-white">Market analysis complete! Results incoming...</div>
                )}
              </div>
            </div>
          )}

          {/* Game Result */}
          {gameResult && (
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-12">
                <div className="mb-8">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-6xl">
                    {gameResult.selectedMarket.symbol}
                  </div>
                  <div className="mt-4 text-2xl font-bold text-white">
                    {gameResult.selectedMarket.name} Result
                  </div>
                  <div className="text-lg text-gray-300">
                    Price Movement: <span className={`font-bold ${gameResult.priceMovement.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {gameResult.priceMovement}
                    </span>
                  </div>
                </div>

                <div className={`text-center p-6 rounded-xl mb-6 ${gameResult.userWins ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
                                   <div className={`text-2xl font-bold mb-2 ${gameResult.userWins ? 'text-green-400' : 'text-red-400'}`}>
                   {gameResult.userWins ? '🎉 YOU WON!' : '😔 YOU LOST!'}
                 </div>
                  <div className="text-gray-300 mb-2">
                    Market moved: <span className={`font-semibold ${gameResult.actualOutcome === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
                      {gameResult.actualOutcome.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-gray-300 mb-2">
                    Your prediction: <span className="font-semibold">
                      {gameResult.userPrediction.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-gray-300">
                    Result: <span className={`font-semibold ${gameResult.correct ? 'text-green-400' : 'text-red-400'}`}>
                      {gameResult.correct ? 'CORRECT' : 'INCORRECT'}
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
                  Trade Again
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
          gameType="market_master"
          betAmount={betAmount}
        />
      </div>
    </div>
  );
} 