import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, DollarSign, Activity, BarChart3, Users, Search, ExternalLink, MoreHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';
import { TypewriterText } from './TypewriterText';

interface VolumeData {
  time: string;
  volume: number;
  calls: number;
}

interface CallData {
  id: string;
  kol: string;
  token: string;
  callTime: string;
  volume1m: number;
  volume5m: number;
  priceChange: number;
  status: 'success' | 'moderate' | 'failed' | 'pending';
  confidence: number;
}

interface Stats {
  totalVolume: number;
  activeCalls: number;
  avgResponseTime: number;
  successRate: number;
}

export function VolumeTracker() {
  const [timeRange, setTimeRange] = useState('1h');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKOL, setSelectedKOL] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [recentCalls, setRecentCalls] = useState<CallData[]>([]);

  // Safe KOL list - always guaranteed to be an array
  const kols = ['all', 'CryptoGuru_X', 'TokenHunter', 'DeFiAlpha', 'ChainWatcher'];

  const generateVolumeData = (): VolumeData[] => {
    try {
      const data: VolumeData[] = [];
      const intervals = timeRange === '1h' ? 12 : timeRange === '4h' ? 16 : timeRange === '12h' ? 24 : 48;
      const intervalMinutes = timeRange === '1h' ? 5 : timeRange === '4h' ? 15 : timeRange === '12h' ? 30 : 30;

      for (let i = intervals; i >= 0; i--) {
        const time = new Date(Date.now() - (i * intervalMinutes * 60 * 1000));
        const baseVolume = selectedKOL === 'all' ? 2000000 : 800000;
        const randomMultiplier = 0.5 + Math.random() * 1.5;
        
        data.push({
          time: time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          volume: Math.floor(baseVolume * randomMultiplier),
          calls: Math.floor(2 + Math.random() * 8)
        });
      }
      return data;
    } catch (error) {
      console.error('Error generating volume data:', error);
      return [];
    }
  };

  const generateRecentCalls = (): CallData[] => {
    try {
      const tokens = ['PEPE', 'WOJAK', 'SHIB', 'DOGE', 'FLOKI', 'BONK', 'MEME', 'APE'];
      const kolNames = ['CryptoGuru_X', 'TokenHunter', 'DeFiAlpha', 'ChainWatcher'];
      const calls: CallData[] = [];

      for (let i = 0; i < 8; i++) {
        const kol = kolNames[Math.floor(Math.random() * kolNames.length)];
        const token = tokens[Math.floor(Math.random() * tokens.length)];
        const callTime = new Date(Date.now() - (i * 15 * 60 * 1000)).toISOString();
        
        const baseVolume = 500000 + Math.random() * 2000000;
        const priceChange = -20 + Math.random() * 250;
        
        let status: 'success' | 'moderate' | 'failed' | 'pending' = 'pending';
        if (i > 2) {
          if (priceChange > 100) status = 'success';
          else if (priceChange > 20) status = 'moderate';
          else status = 'failed';
        }

        calls.push({
          id: `call-${i}`,
          kol,
          token,
          callTime,
          volume1m: Math.floor(baseVolume * 0.3),
          volume5m: Math.floor(baseVolume * 0.7),
          priceChange,
          status,
          confidence: 60 + Math.random() * 35
        });
      }
      return calls;
    } catch (error) {
      console.error('Error generating recent calls:', error);
      return [];
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setVolumeData(generateVolumeData());
      setRecentCalls(generateRecentCalls());
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [timeRange, selectedKOL]);

  // Initialize data on component mount
  useEffect(() => {
    setVolumeData(generateVolumeData());
    setRecentCalls(generateRecentCalls());
  }, []);

  // Safe stats calculation with array validation
  const stats: Stats = {
    totalVolume: Array.isArray(volumeData) ? volumeData.reduce((sum, item) => sum + (item?.volume || 0), 0) : 0,
    activeCalls: Array.isArray(volumeData) ? volumeData.reduce((sum, item) => sum + (item?.calls || 0), 0) : 0,
    avgResponseTime: 2.3 + Math.random() * 1.5,
    successRate: 65 + Math.random() * 25
  };

  const formatVolume = (volume: number): string => {
    if (typeof volume !== 'number' || isNaN(volume)) return '$0';
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return 'Unknown';
    try {
      const time = new Date(timeString);
      const now = new Date();
      const diffMs = now.getTime() - time.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return `${Math.floor(diffMins / 1440)}d ago`;
    } catch (error) {
      return 'Unknown';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriceChangeColor = (change: number): string => {
    if (typeof change !== 'number' || isNaN(change)) return 'text-gray-500';
    if (change > 50) return 'text-emerald-600';
    if (change > 0) return 'text-emerald-500';
    return 'text-red-500';
  };

  // Safe filtering with array validation
  const filteredCalls = Array.isArray(recentCalls) ? recentCalls.filter(call => 
    call && call.kol && call.token &&
    (call.kol.toLowerCase().includes(searchTerm.toLowerCase()) ||
     call.token.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  // Safe chart data with validation
  const safeVolumeData = Array.isArray(volumeData) ? volumeData : [];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f620,transparent)]"></div>
      </div>

      <div className="relative max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
              <TypewriterText text="Volume Tracker" />
            </h1>
            <p className="text-gray-400 text-lg">
              Real-time trading volume and market activity insights
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { icon: TrendingUp, label: '24h Volume', value: formatVolume(stats.totalVolume), change: '+15.2%', isPositive: true },
              { icon: BarChart3, label: 'Active Pairs', value: stats.activeCalls, change: '+23', isPositive: true },
              { icon: DollarSign, label: 'Avg Trade Size', value: '$12.5K', change: '-5.8%', isPositive: false },
              { icon: Activity, label: 'Market Score', value: stats.successRate.toFixed(1) + '%', change: '+3', isPositive: true }
            ].map((stat, index) => (
              <div key={index} className="group relative bg-gray-900/50 backdrop-blur-xl p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <stat.icon className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                  <p className="text-2xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{stat.value}</p>
                  <div className={`flex items-center mt-2 ${stat.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stat.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    <span className="text-sm ml-1">{stat.change}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Trading Pairs */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-4">
                Top Trading Pairs
              </h3>
              <div className="space-y-4">
                {[
                  { pair: 'ETH/USDT', volume: '$425M', change: '+8.2%' },
                  { pair: 'BTC/USDT', volume: '$380M', change: '+5.1%' },
                  { pair: 'SOL/USDT', volume: '$245M', change: '+12.3%' }
                ].map((pair, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-400">{pair.pair}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-200 font-medium">{pair.volume}</span>
                      <span className="text-emerald-400 text-sm">{pair.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Volume Distribution */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400 mb-4">
                Volume Distribution
              </h3>
              <div className="space-y-4">
                {[
                  { type: 'Spot Trading', percentage: '65%', volume: '$1.82B' },
                  { type: 'Perpetual Futures', percentage: '25%', volume: '$700M' },
                  { type: 'Options', percentage: '10%', volume: '$280M' }
                ].map((dist, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">{dist.type}</span>
                      <span className="text-gray-200">{dist.percentage}</span>
                    </div>
                    <div className="text-sm text-gray-500 text-right">{dist.volume}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Activity */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
                Market Activity
              </h3>
              <div className="space-y-4">
                {[
                  { metric: 'Trade Frequency', value: '458 trades/min', trend: 'Above average' },
                  { metric: 'Liquidity Depth', value: '$125M (±2%)', trend: 'Stable' },
                  { metric: 'Volatility Index', value: '45.8', trend: 'Moderate' }
                ].map((activity, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">{activity.metric}</span>
                      <span className="text-gray-200">{activity.value}</span>
                    </div>
                    <div className="text-sm text-gray-500 text-right">{activity.trend}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400 mb-4">
                Recent Transactions
              </h3>
              <div className="space-y-4">
                {[
                  { type: 'buy', pair: 'ETH/USDT', amount: '125 ETH', value: '$245,750', time: '2 min ago' },
                  { type: 'sell', pair: 'BTC/USDT', amount: '3.8 BTC', value: '$182,400', time: '5 min ago' },
                  { type: 'buy', pair: 'SOL/USDT', amount: '2,500 SOL', value: '$98,750', time: '8 min ago' }
                ].map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-800 rounded-lg">
                        {tx.type === 'buy' ? (
                          <ArrowUpRight size={20} className="text-emerald-400" />
                        ) : (
                          <ArrowDownRight size={20} className="text-red-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-gray-200 font-medium">{tx.pair}</h4>
                        <p className="text-gray-500 text-sm">{tx.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-200">{tx.value}</p>
                      <p className="text-gray-500 text-sm">{tx.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 