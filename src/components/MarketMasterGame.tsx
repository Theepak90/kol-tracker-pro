import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Users, Trophy, Loader2, Play, ArrowLeft, LineChart, Activity, Target, Zap } from 'lucide-react';

interface MarketMasterGameProps {
  onBack: () => void;
}

interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingPair {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: string;
  icon: string;
}

const TRADING_PAIRS: TradingPair[] = [
  { symbol: 'SOL/USDT', name: 'Solana', price: 23.45, change24h: 8.2, volume: '1.2B', icon: '◎' },
  { symbol: 'BTC/USDT', name: 'Bitcoin', price: 43250.12, change24h: -2.1, volume: '2.8B', icon: '₿' },
  { symbol: 'ETH/USDT', name: 'Ethereum', price: 2650.85, change24h: 5.7, volume: '1.8B', icon: 'Ξ' },
  { symbol: 'BONK/USDT', name: 'Bonk', price: 0.000012, change24h: 15.3, volume: '450M', icon: '🐕' },
  { symbol: 'ORCA/USDT', name: 'Orca', price: 3.21, change24h: -4.2, volume: '85M', icon: '🐋' },
  { symbol: 'RAY/USDT', name: 'Raydium', price: 1.85, change24h: 12.1, volume: '120M', icon: '⚡' }
];

export default function MarketMasterGame({ onBack }: MarketMasterGameProps) {
  const [selectedPair, setSelectedPair] = useState<TradingPair>(TRADING_PAIRS[0]);
  const [prediction, setPrediction] = useState<'up' | 'down' | null>(null);
  const [betAmount, setBetAmount] = useState(0.1);
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h'>('5m');
  const [isTrading, setIsTrading] = useState(false);
  const [gameResult, setGameResult] = useState<{winner: boolean, payout: number, actualChange: number} | null>(null);
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(selectedPair.price);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [marketActivity, setMarketActivity] = useState<Array<{id: number, type: 'buy' | 'sell', amount: number}>>([]);

  // Generate initial candlestick data
  useEffect(() => {
    const generateCandlesticks = () => {
      const data: CandlestickData[] = [];
      let basePrice = selectedPair.price;
      
      for (let i = 20; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60000).toLocaleTimeString();
        const open = basePrice;
        const volatility = basePrice * 0.02; // 2% volatility
        const high = open + Math.random() * volatility;
        const low = open - Math.random() * volatility;
        const close = low + Math.random() * (high - low);
        const volume = Math.random() * 1000000;
        
        data.push({ time, open, high, low, close, volume });
        basePrice = close;
      }
      
      setCandlestickData(data);
      setCurrentPrice(basePrice);
      setPriceHistory(data.map(d => d.close));
    };

    generateCandlesticks();
  }, [selectedPair]);

  // Simulate real-time price updates
  useEffect(() => {
    if (!isTrading) return;

    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        const change = (Math.random() - 0.5) * prev * 0.005; // 0.5% max change
        const newPrice = Math.max(0, prev + change);
        
        setPriceHistory(history => [...history.slice(-19), newPrice]);
        
        // Add market activity
        setMarketActivity(activity => [
          ...activity.slice(-9),
          {
            id: Date.now(),
            type: Math.random() > 0.5 ? 'buy' : 'sell',
            amount: Math.random() * 10000
          }
        ]);
        
        return newPrice;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTrading]);

  const startTrade = () => {
    if (!prediction) return;
    
    setIsTrading(true);
    setGameResult(null);
    setMarketActivity([]);
    
    const initialPrice = currentPrice;
    
    // Simulate trade for 10 seconds
    setTimeout(() => {
      const finalPrice = currentPrice;
      const actualChange = ((finalPrice - initialPrice) / initialPrice) * 100;
      const predictedCorrectly = 
        (prediction === 'up' && actualChange > 0) || 
        (prediction === 'down' && actualChange < 0);
      
      const payout = predictedCorrectly ? betAmount * 1.85 : 0;
      
      setGameResult({
        winner: predictedCorrectly,
        payout,
        actualChange
      });
      
      setIsTrading(false);
    }, 10000);
  };

  const resetTrade = () => {
    setGameResult(null);
    setPrediction(null);
    setMarketActivity([]);
  };

  const renderCandlestick = (candle: CandlestickData, index: number) => {
    const isGreen = candle.close > candle.open;
    const bodyHeight = Math.abs(candle.close - candle.open) * 100;
    const wickTop = candle.high - Math.max(candle.open, candle.close);
    const wickBottom = Math.min(candle.open, candle.close) - candle.low;
    
    return (
      <div key={index} className="flex flex-col items-center h-20 justify-center">
        {/* Upper wick */}
        <div 
          className={`w-0.5 ${isGreen ? 'bg-green-400' : 'bg-red-400'}`}
          style={{ height: `${wickTop * 100}px` }}
        />
        {/* Body */}
        <div 
          className={`w-3 ${isGreen ? 'bg-green-400' : 'bg-red-400'} border ${isGreen ? 'border-green-400' : 'border-red-400'}`}
          style={{ height: `${Math.max(2, bodyHeight)}px` }}
        />
        {/* Lower wick */}
        <div 
          className={`w-0.5 ${isGreen ? 'bg-green-400' : 'bg-red-400'}`}
          style={{ height: `${wickBottom * 100}px` }}
        />
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-full blur-3xl animate-spin-slow"></div>
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
            <BarChart3 className="text-emerald-400" size={32} />
            Market Master
          </h1>
          <div className="flex items-center gap-2 text-emerald-400">
            <Activity size={20} />
            <span>Live Trading</span>
          </div>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="relative z-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Trading Chart */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{selectedPair.icon}</div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedPair.symbol}</h3>
                    <div className="text-sm text-gray-300">{selectedPair.name}</div>
                  </div>
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-white">
                      ${currentPrice.toFixed(selectedPair.symbol.includes('BONK') ? 8 : 2)}
                    </div>
                    <div className={`text-sm flex items-center gap-1 ${
                      selectedPair.change24h > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedPair.change24h > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      {selectedPair.change24h > 0 ? '+' : ''}{selectedPair.change24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                {/* Timeframe Selector */}
                <div className="flex gap-2">
                  {(['1m', '5m', '15m', '1h'] as const).map(tf => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        timeframe === tf 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Chart */}
              <div className="bg-black/60 rounded-xl p-4 mb-4">
                <div className="h-64 flex items-end justify-between gap-1">
                  {candlestickData.map((candle, index) => renderCandlestick(candle, index))}
                </div>
                
                {/* Price Line Chart */}
                <div className="mt-4 h-16 relative">
                  <svg className="w-full h-full">
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      points={priceHistory.map((price, index) => 
                        `${(index / (priceHistory.length - 1)) * 100}%,${100 - ((price - Math.min(...priceHistory)) / (Math.max(...priceHistory) - Math.min(...priceHistory))) * 100}%`
                      ).join(' ')}
                    />
                  </svg>
                </div>
              </div>

              {/* Volume Bars */}
              <div className="h-12 flex items-end gap-1">
                {candlestickData.map((candle, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-gray-600 rounded-t"
                    style={{ 
                      height: `${(candle.volume / Math.max(...candlestickData.map(c => c.volume))) * 100}%`,
                      minHeight: '2px'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Market Selection */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="text-emerald-400" size={20} />
                Select Market
              </h3>
              <div className="space-y-2">
                {TRADING_PAIRS.map(pair => (
                  <button
                    key={pair.symbol}
                    onClick={() => setSelectedPair(pair)}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      selectedPair.symbol === pair.symbol
                        ? 'border-emerald-400 bg-emerald-500/20'
                        : 'border-white/20 bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{pair.icon}</span>
                        <div>
                          <div className="text-white font-semibold">{pair.symbol}</div>
                          <div className="text-sm text-gray-300">{pair.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          ${pair.price.toFixed(pair.symbol.includes('BONK') ? 8 : 2)}
                        </div>
                        <div className={`text-sm ${pair.change24h > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {pair.change24h > 0 ? '+' : ''}{pair.change24h.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trading Controls */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign className="text-emerald-400" size={20} />
                Place Trade
              </h3>
              
              {/* Bet Amount */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300 mb-2">Bet Amount (SOL)</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  min="0.1"
                  step="0.1"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  disabled={isTrading}
                />
                <div className="flex gap-2 mt-2">
                  {[0.1, 0.5, 1.0, 2.0].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
                      disabled={isTrading}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prediction Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setPrediction('up')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    prediction === 'up'
                      ? 'border-green-400 bg-green-500/20 text-green-400'
                      : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                  }`}
                  disabled={isTrading}
                >
                  <TrendingUp size={24} className="mx-auto mb-2" />
                  <div className="font-semibold">LONG</div>
                  <div className="text-xs opacity-70">Price will go UP</div>
                </button>
                <button
                  onClick={() => setPrediction('down')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    prediction === 'down'
                      ? 'border-red-400 bg-red-500/20 text-red-400'
                      : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                  }`}
                  disabled={isTrading}
                >
                  <TrendingDown size={24} className="mx-auto mb-2" />
                  <div className="font-semibold">SHORT</div>
                  <div className="text-xs opacity-70">Price will go DOWN</div>
                </button>
              </div>

              {/* Trade Button */}
              <button
                onClick={startTrade}
                disabled={!prediction || isTrading}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  !prediction || isTrading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:opacity-90'
                }`}
              >
                {isTrading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    Trading...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Play size={20} />
                    Execute Trade
                  </div>
                )}
              </button>

              {prediction && !isTrading && (
                <div className="mt-4 text-center text-sm text-gray-300">
                  Potential Payout: <span className="text-emerald-400 font-semibold">
                    {(betAmount * 1.85).toFixed(3)} SOL
                  </span>
                </div>
              )}
            </div>

            {/* Market Activity */}
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity className="text-emerald-400" size={20} />
                Live Activity
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {marketActivity.map(activity => (
                  <div key={activity.id} className="flex items-center justify-between text-sm">
                    <div className={`flex items-center gap-2 ${
                      activity.type === 'buy' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'buy' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      {activity.type.toUpperCase()}
                    </div>
                    <div className="text-gray-300">
                      ${activity.amount.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Game Result Modal */}
        {gameResult && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 p-8 max-w-md w-full text-center">
              <div className="text-6xl mb-4">
                {gameResult.winner ? '🎉' : '📉'}
              </div>
              
              <h2 className={`text-3xl font-bold mb-4 ${
                gameResult.winner ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {gameResult.winner ? 'Profit!' : 'Loss!'}
              </h2>
              
              <div className="text-gray-300 mb-4">
                Price moved {gameResult.actualChange > 0 ? 'UP' : 'DOWN'} by{' '}
                <span className={`font-semibold ${
                  gameResult.actualChange > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {Math.abs(gameResult.actualChange).toFixed(2)}%
                </span>
              </div>
              
              {gameResult.winner && (
                <div className="text-xl text-emerald-400 mb-6">
                  You earned {gameResult.payout.toFixed(3)} SOL!
                </div>
              )}
              
              <div className="flex gap-4">
                <button
                  onClick={resetTrade}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  Trade Again
                </button>
                <button
                  onClick={onBack}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors"
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