import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, DollarSign, Activity, BarChart3, Eye, MoreHorizontal, Loader2, Users, Filter, Search, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, Legend } from 'recharts';
import { apiService, KOL } from '../services/apiService';
import { toast } from 'react-hot-toast';

interface VolumeData {
  time: string;
  volume: number;
  calls: number;
  timestamp: number;
}

interface CallData {
  id: string;
  kol: string;
  token: string;
  callTime: string;
  volume1m: number;
  volume5m: number;
  volume15m: number;
  volume1h: number;
  priceChange: number;
  volumeChange: number;
  status: 'success' | 'moderate' | 'failed' | 'pending';
  confidence: number;
  marketCap?: number;
}

export function VolumeTracker() {
  const [timeRange, setTimeRange] = useState('1h');
  const [isLoading, setIsLoading] = useState(false);
  const [kols, setKols] = useState<KOL[]>([]);
  const [selectedKOL, setSelectedKOL] = useState<string>('all');
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [recentCalls, setRecentCalls] = useState<CallData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalVolume: 0,
    activeCalls: 0,
    avgResponseTime: 0,
    successRate: 0
  });

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await loadKOLs();
        generateVolumeData();
        generateRecentCalls();
      } catch (error) {
        console.error('Failed to initialize VolumeTracker:', error);
        toast.error('Failed to load data, using demo data');
        // Set fallback data
        setKols([]);
        generateVolumeData();
        generateRecentCalls();
      }
    };
    
    initializeComponent();
  }, []);

  useEffect(() => {
    try {
      generateVolumeData();
      generateRecentCalls();
    } catch (error) {
      console.error('Failed to update data:', error);
      toast.error('Failed to update data');
    }
  }, [timeRange, selectedKOL]);

  const loadKOLs = async () => {
    try {
      const response = await apiService.getKOLs();
      // Ensure we always have an array
      setKols(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Failed to load KOLs:', error);
      // Set empty array as fallback
      setKols([]);
    }
  };

  const generateVolumeData = () => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const now = new Date();
      const data: VolumeData[] = [];
      const intervals = timeRange === '1h' ? 12 : timeRange === '4h' ? 16 : timeRange === '12h' ? 24 : 48;
      const intervalMinutes = timeRange === '1h' ? 5 : timeRange === '4h' ? 15 : timeRange === '12h' ? 30 : 30;

      for (let i = intervals; i >= 0; i--) {
        const time = new Date(now.getTime() - (i * intervalMinutes * 60 * 1000));
        const baseVolume = selectedKOL === 'all' ? 2000000 : 800000;
        const randomMultiplier = 0.5 + Math.random() * 1.5;
        const kolMultiplier = selectedKOL !== 'all' ? 0.7 + Math.random() * 0.6 : 1;
        
        data.push({
          time: time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          volume: Math.floor(baseVolume * randomMultiplier * kolMultiplier),
          calls: Math.floor(2 + Math.random() * 8),
          timestamp: time.getTime()
        });
      }

      setVolumeData(data);
      
      // Calculate stats
      const totalVol = data.reduce((sum, item) => sum + item.volume, 0);
      const totalCalls = data.reduce((sum, item) => sum + item.calls, 0);
      const successfulCalls = Math.floor(totalCalls * (0.6 + Math.random() * 0.3));
      
      setStats({
        totalVolume: totalVol,
        activeCalls: totalCalls,
        avgResponseTime: 2.3 + Math.random() * 1.5,
        successRate: (successfulCalls / totalCalls) * 100
      });
      
      setIsLoading(false);
    }, 1000);
  };

  const generateRecentCalls = () => {
    const tokens = ['PEPE', 'WOJAK', 'SHIB', 'DOGE', 'FLOKI', 'BONK', 'MEME', 'APE', 'SATS', 'ORDI'];
    const calls: CallData[] = [];
    
    const safeKols = Array.isArray(kols) ? kols : [];
    const filteredKOLs = selectedKOL === 'all' ? safeKols : safeKols.filter(k => k.telegramUsername === selectedKOL);
    const kolsToUse = filteredKOLs.length > 0 ? filteredKOLs : [
      { _id: 'demo1', telegramUsername: 'CryptoGuru_X', displayName: 'Crypto Guru X', description: '', tags: [], createdAt: '', updatedAt: '' },
      { _id: 'demo2', telegramUsername: 'TokenHunter', displayName: 'Token Hunter', description: '', tags: [], createdAt: '', updatedAt: '' },
      { _id: 'demo3', telegramUsername: 'DeFiAlpha', displayName: 'DeFi Alpha', description: '', tags: [], createdAt: '', updatedAt: '' },
      { _id: 'demo4', telegramUsername: 'ChainWatcher', displayName: 'Chain Watcher', description: '', tags: [], createdAt: '', updatedAt: '' }
    ];

    for (let i = 0; i < 8; i++) {
      const kol = kolsToUse[Math.floor(Math.random() * kolsToUse.length)];
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      const callTime = new Date(Date.now() - (i * 15 * 60 * 1000)).toISOString();
      
      const baseVolume = 500000 + Math.random() * 2000000;
      const priceChange = -20 + Math.random() * 250;
      const volumeChange = 50 + Math.random() * 400;
      
      let status: 'success' | 'moderate' | 'failed' | 'pending' = 'pending';
      if (i > 2) {
        if (priceChange > 100) status = 'success';
        else if (priceChange > 20) status = 'moderate';
        else status = 'failed';
      }

      calls.push({
        id: `call-${i}`,
        kol: kol.displayName || kol.telegramUsername,
        token,
        callTime,
        volume1m: Math.floor(baseVolume * 0.3),
        volume5m: Math.floor(baseVolume * 0.7),
        volume15m: Math.floor(baseVolume),
        volume1h: Math.floor(baseVolume * 1.5),
        priceChange,
        volumeChange,
        status,
        confidence: 60 + Math.random() * 35,
        marketCap: 1000000 + Math.random() * 50000000
      });
    }

    setRecentCalls(calls);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(1)}B`;
    }
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 50) return 'text-emerald-600';
    if (change > 0) return 'text-emerald-500';
    return 'text-red-500';
  };

  const filteredCalls = (Array.isArray(recentCalls) ? recentCalls : []).filter(call => 
    call.kol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.token.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Volume Tracker
          </h1>
          <p className="text-gray-600 text-sm mt-1">Monitor volume spikes and call effectiveness in real-time</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          {['1h', '4h', '12h', '24h'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                timeRange === range
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            value={selectedKOL}
            onChange={(e) => setSelectedKOL(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All KOLs</option>
            {kols.map((kol) => (
              <option key={kol.telegramUsername} value={kol.telegramUsername}>
                {kol.displayName || kol.telegramUsername}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <DollarSign size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Volume</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : formatVolume(stats.totalVolume)}
              </p>
              <p className="text-gray-500 text-xs">Last {timeRange}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <Activity size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Active Calls</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.activeCalls}
              </p>
              <p className="text-gray-500 text-xs">Signals tracked</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Clock size={24} className="text-amber-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Avg Response Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats.avgResponseTime.toFixed(1)}m`}
              </p>
              <p className="text-gray-500 text-xs">Market reaction</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <TrendingUp size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats.successRate.toFixed(0)}%`}
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
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (Array.isArray(volumeData) && volumeData.length > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => formatVolume(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatVolume(value), 'Volume']}
                    labelStyle={{ color: '#666' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <BarChart3 size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No Volume Data</p>
                <p className="text-gray-500 text-sm mt-1">Start tracking to see volume trends</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Calls vs Volume</h3>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreHorizontal size={16} />
            </button>
          </div>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (Array.isArray(volumeData) && volumeData.length > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip />
                  <Bar dataKey="calls" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl">
              <div className="text-center">
                <Activity size={32} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No Call Data</p>
                <p className="text-gray-500 text-sm mt-1">Track calls to see volume correlation</p>
              </div>
            </div>
          )}
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
        
        {(Array.isArray(filteredCalls) && filteredCalls.length > 0) ? (
          <div className="space-y-4">
            {filteredCalls.map((call) => (
              <div key={call.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
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
                    Volume Change: <span className="font-medium text-emerald-600">+{call.volumeChange.toFixed(0)}%</span>
                    {call.marketCap && (
                      <span className="ml-3">
                        Market Cap: <span className="font-medium">{formatVolume(call.marketCap)}</span>
                      </span>
                    )}
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
  );
}