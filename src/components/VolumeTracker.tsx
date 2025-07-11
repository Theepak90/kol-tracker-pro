import React, { useEffect, useState } from 'react';
import { TrendingUp, BarChart2, DollarSign, Activity, ArrowUp, ArrowDown, Users, TrendingDown, Clock, Zap, Bot, User, CheckCircle, AlertTriangle, Target, Wallet, MessageCircle, Calendar, Hash, Star, Eye, Share2 } from 'lucide-react';
import { TypewriterText } from './TypewriterText';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface PostVolumeData {
  postId: string;
  postTime: string;
  postText: string;
  volume1m: number;
  volume5m: number;
  volume10m: number;
  priceChange1m: number;
  priceChange5m: number;
  priceChange10m: number;
  topWallets: {
    address: string;
    volume: number;
    entryTime: string; // seconds after post
    isKnownWhale: boolean;
  }[];
}

interface EngagementAnalysis {
  realEngagement: number;
  botEngagement: number;
  engagementScore: number;
  botDetectionConfidence: number;
  realUsers: number;
  suspiciousBots: number;
  humanLikePatterns: number;
}

interface KOLProfile {
  id: string;
  name: string;
  handle: string;
  followers: number;
  avgEngagement: number;
  postingFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
    avgInterval: string;
    peakHours: string[];
    consistency: number;
  };
  volumeImpact: {
    avgImpact1m: number;
    avgImpact5m: number;
    avgImpact10m: number;
    successRate: number;
    totalCalls: number;
  };
  engagementAnalysis: EngagementAnalysis;
  recentPosts: PostVolumeData[];
  profileScore: number;
  verificationStatus: 'verified' | 'unverified' | 'suspicious';
  categories: string[];
}

export const VolumeTracker: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1m' | '5m' | '10m'>('1m');
  const [selectedKOL, setSelectedKOL] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'wallets' | 'engagement' | 'profile'>('overview');

  const [kolProfiles] = useState<KOLProfile[]>([
    {
      id: 'kol1',
      name: 'Crypto Alpha King',
      handle: '@cryptoalpha',
      followers: 250000,
      avgEngagement: 12.5,
      postingFrequency: {
        daily: 3.2,
        weekly: 22,
        monthly: 96,
        avgInterval: '7.5 hours',
        peakHours: ['09:00', '14:00', '20:00'],
        consistency: 87
      },
      volumeImpact: {
        avgImpact1m: 15.2,
        avgImpact5m: 8.7,
        avgImpact10m: 4.3,
        successRate: 72,
        totalCalls: 45
      },
      engagementAnalysis: {
        realEngagement: 78,
        botEngagement: 22,
        engagementScore: 8.7,
        botDetectionConfidence: 92,
        realUsers: 195000,
        suspiciousBots: 55000,
        humanLikePatterns: 85
      },
      recentPosts: [
        {
          postId: 'post1',
          postTime: '2024-01-15T14:30:00Z',
          postText: 'BREAKING: Major whale accumulation in $SOL - volume spike incoming! 🚀',
          volume1m: 2500000,
          volume5m: 8900000,
          volume10m: 15600000,
          priceChange1m: 4.2,
          priceChange5m: 7.8,
          priceChange10m: 12.1,
          topWallets: [
            { address: '0x1a2b...3c4d', volume: 1200000, entryTime: '45s', isKnownWhale: true },
            { address: '0x5e6f...7g8h', volume: 850000, entryTime: '1m 20s', isKnownWhale: false },
            { address: '0x9i0j...1k2l', volume: 650000, entryTime: '2m 15s', isKnownWhale: true }
          ]
        },
        {
          postId: 'post2',
          postTime: '2024-01-15T11:15:00Z',
          postText: 'Technical analysis shows strong support at $95. Time to accumulate? 📈',
          volume1m: 1800000,
          volume5m: 5200000,
          volume10m: 9800000,
          priceChange1m: 2.1,
          priceChange5m: 3.9,
          priceChange10m: 6.2,
          topWallets: [
            { address: '0x2b3c...4d5e', volume: 980000, entryTime: '1m 5s', isKnownWhale: true },
            { address: '0x6f7g...8h9i', volume: 720000, entryTime: '2m 30s', isKnownWhale: false }
          ]
        }
      ],
      profileScore: 92,
      verificationStatus: 'verified',
      categories: ['Technical Analysis', 'Altcoins', 'DeFi']
    },
    {
      id: 'kol2',
      name: 'DeFi Detective',
      handle: '@defidetective',
      followers: 180000,
      avgEngagement: 9.8,
      postingFrequency: {
        daily: 2.8,
        weekly: 19,
        monthly: 84,
        avgInterval: '8.6 hours',
        peakHours: ['08:00', '16:00', '22:00'],
        consistency: 79
      },
      volumeImpact: {
        avgImpact1m: 12.8,
        avgImpact5m: 6.4,
        avgImpact10m: 3.1,
        successRate: 68,
        totalCalls: 38
      },
      engagementAnalysis: {
        realEngagement: 82,
        botEngagement: 18,
        engagementScore: 9.1,
        botDetectionConfidence: 88,
        realUsers: 147600,
        suspiciousBots: 32400,
        humanLikePatterns: 89
      },
      recentPosts: [
        {
          postId: 'post3',
          postTime: '2024-01-15T16:45:00Z',
          postText: 'New yield farming opportunity on @Uniswap - APY looks promising! 🌾',
          volume1m: 1900000,
          volume5m: 6100000,
          volume10m: 11200000,
          priceChange1m: 3.4,
          priceChange5m: 5.7,
          priceChange10m: 8.9,
          topWallets: [
            { address: '0x3c4d...5e6f', volume: 1100000, entryTime: '1m 15s', isKnownWhale: true },
            { address: '0x7g8h...9i0j', volume: 800000, entryTime: '2m 45s', isKnownWhale: false }
          ]
        }
      ],
      profileScore: 88,
      verificationStatus: 'verified',
      categories: ['DeFi', 'Yield Farming', 'Research']
    }
  ]);

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Volume Stats by Timeframe */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['1m', '5m', '10m'].map((timeframe) => {
          const totalVolume = kolProfiles.reduce((sum, kol) => 
            sum + kol.recentPosts.reduce((postSum, post) => 
              postSum + (timeframe === '1m' ? post.volume1m : 
                        timeframe === '5m' ? post.volume5m : post.volume10m), 0), 0);

  return (
            <div key={timeframe} className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-300 group-hover:text-white transition-colors duration-300">
                    {timeframe} Volume Impact
                  </h3>
                  <TrendingUp className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
                  ${(totalVolume / 1000000).toFixed(2)}M
                </div>
                <div className="text-sm text-gray-400">Total volume tracked</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* KOL Performance Summary */}
      <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Top Performing KOLs
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {kolProfiles.map((kol) => (
            <div 
              key={kol.id} 
              className="group bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedKOL(kol.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {kol.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors duration-300">
                      {kol.name}
                    </h3>
                    <p className="text-sm text-gray-400">{kol.handle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">{kol.profileScore}</div>
                  <div className="text-xs text-gray-500">Score</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-sm font-medium text-green-400">
                    {kol.volumeImpact.avgImpact1m}%
                  </div>
                  <div className="text-xs text-gray-500">1m Impact</div>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-sm font-medium text-blue-400">
                    {kol.volumeImpact.successRate}%
                  </div>
                  <div className="text-xs text-gray-500">Success Rate</div>
                </div>
                <div className="text-center p-3 bg-gray-900/50 rounded-lg">
                  <div className="text-sm font-medium text-purple-400">
                    {(kol.followers / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-gray-500">Followers</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

    const renderPostAnalysis = () => (
    <div className="p-8 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Post Volume Analysis
        </h2>
        <p className="text-gray-400">Analyze volume impact and price movements from KOL posts</p>
      </div>

      {kolProfiles.map(kol => (
        <div key={kol.id} className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {kol.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">{kol.name}</h3>
                <p className="text-gray-400">{kol.handle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {kol.verificationStatus === 'verified' && (
                <div className="flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-sm">Verified</span>
                </div>
              )}
              <div className="bg-purple-500/10 px-3 py-1 rounded-full">
                <span className="text-purple-400 font-bold">{kol.profileScore}/100</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {kol.recentPosts.map(post => (
              <div key={post.postId} className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/20 hover:border-gray-600/30 transition-all duration-300">
                <div className="mb-4">
                  <p className="text-white text-lg leading-relaxed mb-3">{post.postText}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.postTime).toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center group/card hover:bg-gray-800/70 transition-all duration-300">
                    <div className="text-2xl font-bold text-green-400 mb-1">${(post.volume1m / 1000000).toFixed(1)}M</div>
                    <div className="text-sm text-gray-400 mb-2">1 Minute Volume</div>
                    <div className={`text-sm font-medium flex items-center justify-center gap-1 ${
                      post.priceChange1m > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {post.priceChange1m > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(post.priceChange1m)}%
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center group/card hover:bg-gray-800/70 transition-all duration-300">
                    <div className="text-2xl font-bold text-blue-400 mb-1">${(post.volume5m / 1000000).toFixed(1)}M</div>
                    <div className="text-sm text-gray-400 mb-2">5 Minute Volume</div>
                    <div className={`text-sm font-medium flex items-center justify-center gap-1 ${
                      post.priceChange5m > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {post.priceChange5m > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(post.priceChange5m)}%
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4 text-center group/card hover:bg-gray-800/70 transition-all duration-300">
                    <div className="text-2xl font-bold text-purple-400 mb-1">${(post.volume10m / 1000000).toFixed(1)}M</div>
                    <div className="text-sm text-gray-400 mb-2">10 Minute Volume</div>
                    <div className={`text-sm font-medium flex items-center justify-center gap-1 ${
                      post.priceChange10m > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {post.priceChange10m > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(post.priceChange10m)}%
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700/30 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Wallet className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400 font-medium">Top Wallet Entries</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.topWallets.slice(0, 3).map((wallet, idx) => (
                      <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all duration-300 ${
                        wallet.isKnownWhale 
                          ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500/20' 
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${wallet.isKnownWhale ? 'bg-orange-400' : 'bg-blue-400'}`} />
                        <span className="font-mono">{wallet.address}</span>
                        <span className="text-xs opacity-75">+{wallet.entryTime}</span>
                        {wallet.isKnownWhale && (
                          <Star className="w-3 h-3" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

    const renderEngagementAnalysis = () => (
    <div className="p-8 space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Engagement Analysis
        </h2>
        <p className="text-gray-400">Analyze real vs bot engagement patterns and authenticity</p>
          </div>

      {kolProfiles.map(kol => (
        <div key={kol.id} className="group bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl rounded-2xl p-8 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                {kol.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">{kol.name}</h3>
                <p className="text-gray-400 text-lg">Engagement Analysis</p>
                    </div>
                  </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-red-500/10 px-4 py-2 rounded-xl">
                <Bot className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">{kol.engagementAnalysis.botEngagement}% Bots</span>
              </div>
              <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-xl">
                <Users className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">{kol.engagementAnalysis.realEngagement}% Real</span>
              </div>
              </div>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Real vs Bot Engagement */}
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/20">
              <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Real vs Bot Engagement
              </h4>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-medium">Real Users</span>
                    <span className="text-green-400 font-bold text-lg">{kol.engagementAnalysis.realEngagement}%</span>
                  </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-3 bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000"
                      style={{ width: `${kol.engagementAnalysis.realEngagement}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-medium">Bot Activity</span>
                    <span className="text-red-400 font-bold text-lg">{kol.engagementAnalysis.botEngagement}%</span>
                    </div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-3 bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-1000"
                      style={{ width: `${kol.engagementAnalysis.botEngagement}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Metrics */}
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/20">
              <h4 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                Engagement Metrics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{kol.engagementAnalysis.engagementScore}</div>
                  <div className="text-sm text-gray-400">Score /10</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{kol.engagementAnalysis.botDetectionConfidence}%</div>
                  <div className="text-sm text-gray-400">Confidence</div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">{(kol.engagementAnalysis.realUsers / 1000).toFixed(1)}K</div>
                  <div className="text-sm text-gray-400">Real Users</div>
                    </div>
                <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-400 mb-1">{(kol.engagementAnalysis.suspiciousBots / 1000).toFixed(1)}K</div>
                  <div className="text-sm text-gray-400">Suspicious</div>
                  </div>
              </div>
            </div>
          </div>

          {/* Human-like Patterns */}
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-6 border border-gray-700/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-semibold text-lg">Human-like Patterns</span>
              </div>
              <span className="text-emerald-400 font-bold text-xl">{kol.engagementAnalysis.humanLikePatterns}%</span>
            </div>
            <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000"
                style={{ width: `${kol.engagementAnalysis.humanLikePatterns}%` }}
              />
            </div>
            <div className="mt-3 text-sm text-gray-400">
              Higher scores indicate more authentic, human-like engagement patterns
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderKOLProfile = () => (
    <div className="space-y-6">
      {kolProfiles.map(kol => (
        <div key={kol.id} className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white">{kol.name}</h3>
                  {kol.verificationStatus === 'verified' && (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                <p className="text-gray-400">{kol.handle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{(kol.followers / 1000).toFixed(1)}K followers</span>
                </div>
                      </div>
                    </div>
                    <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{kol.profileScore}/100</span>
              </div>
              <p className="text-xs text-gray-400">Profile Score</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Posting Frequency */}
            <div className="bg-gray-900/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Posting Frequency
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily</span>
                  <span className="text-cyan-400">{kol.postingFrequency.daily} posts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weekly</span>
                  <span className="text-cyan-400">{kol.postingFrequency.weekly} posts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Interval</span>
                  <span className="text-cyan-400">{kol.postingFrequency.avgInterval}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Consistency</span>
                  <span className="text-green-400">{kol.postingFrequency.consistency}%</span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1">Peak Hours</p>
                <div className="flex gap-1">
                  {kol.postingFrequency.peakHours.map((hour, idx) => (
                    <span key={idx} className="text-xs bg-cyan-500/10 px-2 py-1 rounded text-cyan-400">
                      {hour}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Volume Impact */}
            <div className="bg-gray-900/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Volume Impact
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">1m Impact</span>
                  <span className="text-purple-400">{kol.volumeImpact.avgImpact1m}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">5m Impact</span>
                  <span className="text-purple-400">{kol.volumeImpact.avgImpact5m}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">10m Impact</span>
                  <span className="text-purple-400">{kol.volumeImpact.avgImpact10m}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Success Rate</span>
                  <span className="text-green-400">{kol.volumeImpact.successRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Calls</span>
                  <span className="text-white">{kol.volumeImpact.totalCalls}</span>
                </div>
              </div>
            </div>

            {/* Categories & Metrics */}
            <div className="bg-gray-900/50 rounded-xl p-4">
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Hash className="w-4 h-4 text-emerald-400" />
                Categories & Metrics
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-1">
                    {kol.categories.map((category, idx) => (
                      <span key={idx} className="text-xs bg-emerald-500/10 px-2 py-1 rounded text-emerald-400">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Avg Engagement</span>
                    <span className="text-emerald-400">{kol.avgEngagement}%</span>
                    </div>
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div 
                      className="h-2 bg-emerald-400 rounded-full"
                      style={{ width: `${kol.avgEngagement * 5}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#10b98120,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_80%_300px,#3b82f620,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_300px_at_20%_500px,#8b5cf620,transparent)]"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              <TypewriterText text="Volume Tracker" />
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Monitor real-time trading volume impact from KOL posts and analyze market movements
            </p>
          </div>

          {/* Enhanced Controls */}
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              {/* Timeframe Selector */}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 font-medium">Timeframe:</span>
                <div className="flex bg-gray-800/50 rounded-xl p-1">
                  {(['1m', '5m', '10m'] as const).map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedTimeframe === timeframe
                          ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      {timeframe}
                    </button>
                  ))}
                </div>
              </div>

              {/* KOL Selector */}
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 font-medium">KOL:</span>
                <select
                  value={selectedKOL}
                  onChange={(e) => setSelectedKOL(e.target.value)}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300"
                >
                  <option value="all">All KOLs</option>
                  {kolProfiles.map((kol) => (
                    <option key={kol.id} value={kol.id}>
                      {kol.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-gray-800/50 rounded-xl p-1">
                {[
                  { key: 'overview', label: 'Overview', icon: BarChart2 },
                  { key: 'posts', label: 'Posts', icon: MessageCircle },
                  { key: 'wallets', label: 'Wallets', icon: Wallet },
                  { key: 'engagement', label: 'Engagement', icon: Activity },
                  { key: 'profile', label: 'Profile', icon: User }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      activeTab === tab.key
                        ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Content Area */}
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 min-h-[600px]">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'posts' && renderPostAnalysis()}
            {activeTab === 'wallets' && <div className="p-8 text-center text-gray-400">Wallet analysis coming soon...</div>}
            {activeTab === 'engagement' && renderEngagementAnalysis()}
            {activeTab === 'profile' && renderKOLProfile()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeTracker; 