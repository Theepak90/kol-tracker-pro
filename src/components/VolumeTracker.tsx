import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, DollarSign, Activity, BarChart3, Users, Search, ExternalLink, MoreHorizontal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip } from 'recharts';

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

  // Demo data
  const kols = ['all', 'CryptoGuru_X', 'TokenHunter', 'DeFiAlpha', 'ChainWatcher'];

  const generateVolumeData = (): VolumeData[] => {
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
  };

  const generateRecentCalls = (): CallData[] => {
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
  };

  const [volumeData, setVolumeData] = useState<VolumeData[]>(generateVolumeData());
  const [recentCalls, setRecentCalls] = useState<CallData[]>(generateRecentCalls());

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setVolumeData(generateVolumeData());
      setRecentCalls(generateRecentCalls());
      setIsLoading(false);
    }, 500);
  }, [timeRange, selectedKOL]);

  const stats: Stats = {
    totalVolume: volumeData.reduce((sum, item) => sum + item.volume, 0),
    activeCalls: volumeData.reduce((sum, item) => sum + item.calls, 0),
    avgResponseTime: 2.3 + Math.random() * 1.5,
    successRate: 65 + Math.random() * 25
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(1)}B`;
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`;
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  const formatTime = (timeString: string): string => {
    const time = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
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
    if (change > 50) return 'text-emerald-600';
    if (change > 0) return 'text-emerald-500';
    return 'text-red-500';
  };

  const filteredCalls = recentCalls.filter(call => 
    call.kol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.token.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Volume Tracker</h1>
            <p className="text-gray-600 text-sm mt-1">Monitor volume spikes and call effectiveness in real-time</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            {['1h', '4h', '12h', '24h'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search calls by KOL or token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedKOL}
              onChange={(e) => setSelectedKOL(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {kols.map((kol) => (
                <option key={kol} value={kol}>
                  {kol === 'all' ? 'All KOLs' : kol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <DollarSign size={24} className="text-blue-500" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Volume</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatVolume(stats.totalVolume)}
                </p>
                <p className="text-gray-500 text-xs">Last {timeRange}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Activity size={24} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Calls</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeCalls}</p>
                <p className="text-gray-500 text-xs">Signals tracked</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-50 rounded-xl">
                <Clock size={24} className="text-amber-500" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Avg Response Time</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.avgResponseTime.toFixed(1)}m
                </p>
                <p className="text-gray-500 text-xs">Market reaction</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <TrendingUp size={24} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Success Rate</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.successRate.toFixed(0)}%
                </p>
                <p className="text-gray-500 text-xs">Profitable calls</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Volume Over Time</h3>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} tickFormatter={formatVolume} />
                  <Tooltip formatter={(value: number) => [formatVolume(value), 'Volume']} />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Calls vs Volume</h3>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="calls" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Recent Calls</h3>
              <p className="text-gray-500 text-sm">Latest trading signals and their performance</p>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={16} />
            </button>
          </div>
          
          {filteredCalls.length > 0 ? (
            <div className="space-y-4">
              {filteredCalls.map((call) => (
                <div key={call.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{call.kol}</span>
                      </div>
                      <div className="text-gray-400">•</div>
                      <span className="font-semibold text-blue-600">${call.token}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(call.status)}`}>
                        {call.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(call.callTime)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">1m Volume</p>
                      <p className="font-semibold">{formatVolume(call.volume1m)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">5m Volume</p>
                      <p className="font-semibold">{formatVolume(call.volume5m)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Price Change</p>
                      <p className={`font-semibold ${getPriceChangeColor(call.priceChange)}`}>
                        {call.priceChange > 0 ? '+' : ''}{call.priceChange.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="font-semibold">{call.confidence.toFixed(0)}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Signal strength: <span className="font-medium text-emerald-600">Strong</span>
                    </div>
                    <button className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                      <span>View Details</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Clock size={32} className="text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No Recent Calls</p>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm ? 'No calls match your search' : 'Trading signals will appear here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 