import React, { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, Users, Search, ArrowUpRight, ArrowDownRight, Star, Activity, Crown, Award, Target, Zap, Shield, Calendar, Filter, ArrowUpDown, BarChart3, TrendingDown, ChevronRight } from 'lucide-react';
import { leaderboardService, LeaderboardKOL, LeaderboardStats } from '../services/leaderboardService';
import { toast } from 'react-hot-toast';
import { TypewriterText } from './TypewriterText';

interface SimpleKOL {
  id: string;
  name: string;
  handle: string;
  score: number;
  totalVolume: number;
  influenceScore: number;
  growth: number;
  category: string;
}

const mockData: Record<string, SimpleKOL[]> = {
  '1d': [
    { id: '1', name: 'CryptoKing', handle: '@cryptoking', score: 95, totalVolume: 2500000, influenceScore: 89, growth: 15, category: 'Trading' },
    { id: '2', name: 'DeFiMaster', handle: '@defimaster', score: 92, totalVolume: 1800000, influenceScore: 85, growth: 12, category: 'DeFi' },
    { id: '3', name: 'NFTGuru', handle: '@nftguru', score: 88, totalVolume: 1200000, influenceScore: 82, growth: 8, category: 'NFT' },
  ],
  '7d': [
    { id: '1', name: 'CryptoAlpha', handle: '@cryptoalpha', score: 97, totalVolume: 15000000, influenceScore: 94, growth: 25, category: 'Trading' },
    { id: '2', name: 'Web3Wizard', handle: '@web3wizard', score: 94, totalVolume: 12000000, influenceScore: 91, growth: 18, category: 'Tech' },
    { id: '3', name: 'GameFiLord', handle: '@gamefilord', score: 91, totalVolume: 8500000, influenceScore: 87, growth: 22, category: 'GameFi' },
    { id: '4', name: 'DeFiSage', handle: '@defisage', score: 89, totalVolume: 7200000, influenceScore: 85, growth: 16, category: 'DeFi' },
    { id: '5', name: 'MetaTrader', handle: '@metatrader', score: 86, totalVolume: 6800000, influenceScore: 83, growth: 14, category: 'Trading' },
  ],
  '30d': [
    { id: '1', name: 'CryptoProphet', handle: '@cryptoprophet', score: 98, totalVolume: 45000000, influenceScore: 96, growth: 35, category: 'Trading' },
    { id: '2', name: 'BlockchainBoss', handle: '@blockchainboss', score: 95, totalVolume: 38000000, influenceScore: 93, growth: 28, category: 'Tech' },
    { id: '3', name: 'TokenTitan', handle: '@tokentitan', score: 93, totalVolume: 32000000, influenceScore: 90, growth: 24, category: 'DeFi' },
    { id: '4', name: 'NFTNinja', handle: '@nftninja', score: 90, totalVolume: 28000000, influenceScore: 88, growth: 20, category: 'NFT' },
    { id: '5', name: 'DeFiDragon', handle: '@defidragon', score: 88, totalVolume: 25000000, influenceScore: 86, growth: 18, category: 'DeFi' },
    { id: '6', name: 'GameFiGod', handle: '@gamefigod', score: 85, totalVolume: 22000000, influenceScore: 84, growth: 16, category: 'GameFi' },
  ],
  'all': [
    { id: '1', name: 'CryptoLegend', handle: '@cryptolegend', score: 99, totalVolume: 125000000, influenceScore: 98, growth: 45, category: 'Trading' },
    { id: '2', name: 'Web3Emperor', handle: '@web3emperor', score: 97, totalVolume: 98000000, influenceScore: 95, growth: 38, category: 'Tech' },
    { id: '3', name: 'DeFiDeity', handle: '@defideity', score: 95, totalVolume: 85000000, influenceScore: 92, growth: 32, category: 'DeFi' },
    { id: '4', name: 'NFTOracle', handle: '@nftoracle', score: 93, totalVolume: 78000000, influenceScore: 90, growth: 28, category: 'NFT' },
    { id: '5', name: 'GameFiMaster', handle: '@gamefimaster', score: 91, totalVolume: 72000000, influenceScore: 88, growth: 25, category: 'GameFi' },
    { id: '6', name: 'MetaVerse', handle: '@metaverse', score: 89, totalVolume: 68000000, influenceScore: 86, growth: 22, category: 'Tech' },
    { id: '7', name: 'TokenWizard', handle: '@tokenwizard', score: 87, totalVolume: 65000000, influenceScore: 84, growth: 20, category: 'Trading' },
    { id: '8', name: 'CryptoSensei', handle: '@cryptosensei', score: 85, totalVolume: 62000000, influenceScore: 82, growth: 18, category: 'DeFi' },
  ]
};

type SortBy = 'score' | 'volume' | 'followers' | 'engagement';

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'diamond': return <Crown className="w-5 h-5 text-blue-400" />;
    case 'platinum': return <Trophy className="w-5 h-5 text-gray-400" />;
    case 'gold': return <Medal className="w-5 h-5 text-yellow-400" />;
    case 'silver': return <Award className="w-5 h-5 text-gray-300" />;
    case 'bronze': return <Star className="w-5 h-5 text-amber-600" />;
    default: return <Star className="w-5 h-5 text-gray-400" />;
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'diamond': return 'bg-gradient-to-r from-blue-500 to-purple-500';
    case 'platinum': return 'bg-gradient-to-r from-gray-400 to-gray-600';
    case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500';
    case 'bronze': return 'bg-gradient-to-r from-amber-600 to-amber-800';
    default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
  }
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(amount);
};

const TrendIndicator = ({ change, trend }: { change: number; trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'stable') return <span className="text-gray-400">—</span>;
  
  const isPositive = change > 0;
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
  const colorClass = isPositive ? 'text-emerald-400' : 'text-red-400';
  
  return (
    <div className={`flex items-center ${colorClass}`}>
      <Icon className="w-4 h-4" />
      <span className="text-xs ml-1">{Math.abs(change)}</span>
    </div>
  );
};

const KOLCard = ({ kol, rank }: { kol: LeaderboardKOL; rank: number }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={kol.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${kol.displayName}`}
                alt={kol.displayName}
                className="w-14 h-14 rounded-xl bg-gray-800 p-1 group-hover:scale-105 transition-transform duration-300"
              />
              {kol.verified && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-200">{kol.displayName}</h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(kol.tier)} text-white`}>
                  <div className="flex items-center space-x-1">
                    {getTierIcon(kol.tier)}
                    <span>{kol.tier}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-400">@{kol.telegramUsername}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500">{getRankBadge(rank)}</div>
            <div className="flex items-center space-x-1 justify-end">
              <TrendIndicator change={kol.trends.scoreChange} trend={kol.trends.trend} />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-lg font-semibold text-white">{kol.overallScore}</div>
            <div className="text-xs text-gray-400">Overall Score</div>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-lg font-semibold text-emerald-400">{kol.tradingPerformance.winRate}%</div>
            <div className="text-xs text-gray-400">Win Rate</div>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-lg font-semibold text-amber-400">{formatNumber(kol.influenceMetrics.followers)}</div>
            <div className="text-xs text-gray-400">Followers</div>
          </div>
          <div className="text-center p-3 bg-gray-800/50 rounded-lg">
            <div className="text-lg font-semibold text-orange-400">{formatCurrency(kol.tradingPerformance.totalVolume)}</div>
            <div className="text-xs text-gray-400">Volume</div>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {kol.specialty.map((spec, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full border border-amber-500/20"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {kol.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-800/50 text-gray-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="border-t border-gray-800 bg-gray-900/30 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trading Performance */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <h4 className="font-semibold text-gray-200 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-amber-400" />
                Trading Performance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Calls:</span>
                  <span className="font-medium text-gray-200">{kol.tradingPerformance.totalCalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Successful:</span>
                  <span className="font-medium text-emerald-400">{kol.tradingPerformance.successfulCalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Volume:</span>
                  <span className="font-medium text-gray-200">{formatCurrency(kol.tradingPerformance.avgVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Best Call:</span>
                  <span className="font-medium text-emerald-400">
                    {kol.tradingPerformance.bestCall.token} +{kol.tradingPerformance.bestCall.gain}%
                  </span>
                </div>
              </div>
            </div>

            {/* Influence Metrics */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <h4 className="font-semibold text-gray-200 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-amber-400" />
                Influence Metrics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Views:</span>
                  <span className="font-medium text-gray-200">{formatNumber(kol.influenceMetrics.avgViews)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Engagement:</span>
                  <span className="font-medium text-gray-200">{kol.influenceMetrics.engagementRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Credibility:</span>
                  <span className="font-medium text-gray-200">{kol.influenceMetrics.credibilityScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Market Impact:</span>
                  <span className={`font-medium capitalize ${
                    kol.influenceMetrics.marketImpact === 'high' ? 'text-red-400' :
                    kol.influenceMetrics.marketImpact === 'medium' ? 'text-amber-400' :
                    'text-emerald-400'
                  }`}>
                    {kol.influenceMetrics.marketImpact}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Metrics */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <h4 className="font-semibold text-gray-200 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-amber-400" />
                Activity Metrics
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Posts (30d):</span>
                  <span className="font-medium text-gray-200">{kol.activityMetrics.postsLast30Days}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg/Day:</span>
                  <span className="font-medium text-gray-200">{kol.activityMetrics.avgPostsPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Consistency:</span>
                  <span className="font-medium text-gray-200">{kol.activityMetrics.consistency}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Response Time:</span>
                  <span className="font-medium text-gray-200">{kol.activityMetrics.responseTime}h</span>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <h4 className="font-semibold text-gray-200 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-amber-400" />
                Risk Assessment
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Overall Risk:</span>
                  <span className={`font-medium capitalize ${
                    kol.riskAssessment.overallRisk === 'low' ? 'text-emerald-400' :
                    kol.riskAssessment.overallRisk === 'medium' ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {kol.riskAssessment.overallRisk}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Score:</span>
                  <span className="font-medium text-gray-200">{kol.riskAssessment.riskScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reliability:</span>
                  <span className="font-medium text-gray-200">{kol.riskAssessment.reliability}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Joined:</span>
                  <span className="font-medium text-gray-200">{kol.joinedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {kol.riskAssessment.riskFactors.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-200 mb-3">Risk Factors</h4>
              <div className="flex flex-wrap gap-2">
                {kol.riskAssessment.riskFactors.map((factor, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded-full border border-red-500/20"
                  >
                    {factor}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function Leaderboard() {
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d' | 'all'>('7d');
  const [category, setCategory] = useState<'all' | 'volume' | 'influence' | 'growth' | 'engagement'>('all');
  const [sortBy, setSortBy] = useState<'score' | 'volume' | 'influence' | 'growth'>('score');

  const leaderboardData = mockData[timeframe] || [];
  const filteredData = category === 'all' ? leaderboardData : leaderboardData.filter((kol: SimpleKOL) => kol.category === category);
  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'volume':
        return b.totalVolume - a.totalVolume;
      case 'influence':
        return b.influenceScore - a.influenceScore;
      case 'growth':
        return b.growth - a.growth;
      default:
        return b.score - a.score;
    }
  });

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) {
      return `${(num / 1_000_000_000).toFixed(1)}B`;
    } else if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`;
    } else if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (position === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <div className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{position}</div>;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 20) return 'text-emerald-400';
    if (growth > 0) return 'text-green-400';
    if (growth > -10) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getCategoryColor = (cat: string) => {
    const colors = {
      'Trading': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'DeFi': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'NFT': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'GameFi': 'bg-green-500/10 text-green-400 border-green-500/20',
      'Tech': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    };
    return colors[cat as keyof typeof colors] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,#fbbf2420,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_400px_at_80%_300px,#8b5cf620,transparent)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_20%_500px,#3b82f620,transparent)]"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-full blur-xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-xl animate-float-medium"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-r from-blue-400/10 to-cyan-500/10 rounded-full blur-xl animate-float-fast"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              <TypewriterText text="Leaderboard" />
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Discover and track the most influential KOLs across different categories and timeframes
            </p>
          </div>

          {/* Enhanced Controls */}
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30 mb-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Timeframe Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Timeframe
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['1d', '7d', '30d', 'all'] as const).map((period) => (
                  <button
                      key={period}
                      onClick={() => setTimeframe(period)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        timeframe === period
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg transform scale-105'
                          : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                      {period === 'all' ? 'All Time' : period.toUpperCase()}
                  </button>
                ))}
            </div>
          </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300"
                >
                  <option value="all">All Categories</option>
                  <option value="volume">Volume Leaders</option>
                  <option value="influence">Top Influencers</option>
                  <option value="growth">Rising Stars</option>
                  <option value="engagement">Engagement Kings</option>
                </select>
          </div>

              {/* Sort By */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all duration-300"
                >
                  <option value="score">Overall Score</option>
                  <option value="volume">Total Volume</option>
                  <option value="influence">Influence Score</option>
                  <option value="growth">Growth Rate</option>
                </select>
              </div>

              {/* Stats Summary */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Quick Stats
                </label>
                <div className="bg-gray-800/50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Total KOLs:</span>
                    <span className="text-white font-medium">{sortedData.length}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Avg Score:</span>
                    <span className="text-white font-medium">
                      {sortedData.length > 0 ? (sortedData.reduce((acc, kol) => acc + kol.score, 0) / sortedData.length).toFixed(1) : '0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Leaderboard */}
          <div className="space-y-4">
            {sortedData.length > 0 ? (
              sortedData.map((kol, index) => (
                <div
                  key={kol.id}
                  className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:transform hover:scale-[1.02] ${
                    index < 3
                      ? 'bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 border-2 border-yellow-500/20 shadow-2xl shadow-yellow-500/10'
                      : 'bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30'
                  } backdrop-blur-xl hover:border-gray-600/50`}
                >
                  {/* Rank Background Effect */}
                  {index < 3 && (
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  )}
                  
                  <div className="relative p-6">
                    <div className="flex items-center gap-6">
                      {/* Position & Trophy */}
                      <div className="flex flex-col items-center space-y-2">
                        {getPositionIcon(index + 1)}
                        <span className="text-sm font-medium text-gray-400">#{index + 1}</span>
                      </div>

                      {/* KOL Avatar & Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl ${
                            index < 3
                              ? 'bg-gradient-to-br from-yellow-500 to-orange-600'
                              : 'bg-gradient-to-br from-gray-600 to-gray-700'
                          }`}>
                            {kol.name.charAt(0)}
                          </div>
                          {index < 3 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Star className="w-3 h-3 text-gray-900" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-xl font-bold truncate ${
                              index < 3 ? 'text-yellow-300' : 'text-white'
                            } group-hover:text-yellow-400 transition-colors duration-300`}>
                              {kol.name}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(kol.category)}`}>
                              {kol.category}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm">{kol.handle}</p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="hidden md:grid grid-cols-4 gap-6 text-center">
                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-yellow-400">{kol.score}</div>
                          <div className="text-xs text-gray-400">Score</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-blue-400">${formatNumber(kol.totalVolume)}</div>
                          <div className="text-xs text-gray-400">Volume</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-lg font-semibold text-purple-400">{kol.influenceScore}</div>
                          <div className="text-xs text-gray-400">Influence</div>
                        </div>
                        <div className="space-y-1">
                          <div className={`text-lg font-semibold flex items-center justify-center gap-1 ${getGrowthColor(kol.growth)}`}>
                            {kol.growth > 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {kol.growth > 0 ? '+' : ''}{kol.growth}%
                          </div>
                          <div className="text-xs text-gray-400">Growth</div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-gray-300 group-hover:translate-x-1 transition-all duration-300" />
                    </div>

                    {/* Mobile Stats */}
                    <div className="md:hidden mt-4 grid grid-cols-4 gap-4 text-center pt-4 border-t border-gray-700/30">
                      <div>
                        <div className="text-lg font-bold text-yellow-400">{kol.score}</div>
                        <div className="text-xs text-gray-400">Score</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-blue-400">${formatNumber(kol.totalVolume)}</div>
                        <div className="text-xs text-gray-400">Volume</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-purple-400">{kol.influenceScore}</div>
                        <div className="text-xs text-gray-400">Influence</div>
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${getGrowthColor(kol.growth)}`}>
                          {kol.growth > 0 ? '+' : ''}{kol.growth}%
                        </div>
                        <div className="text-xs text-gray-400">Growth</div>
                      </div>
                    </div>
                  </div>
              </div>
              ))
            ) : (
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 p-16 text-center">
                <div className="w-20 h-20 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-300 mb-4">No Data Available</h3>
                <p className="text-gray-400 text-lg">
                  No KOLs found for the selected timeframe and category combination.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;