import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, TrendingDown, Trophy, Star, Crown, Medal, Award, ArrowUp, ArrowDown, Minus, ExternalLink, Activity, Target, Zap, Shield } from 'lucide-react';
import { leaderboardService, LeaderboardKOL, LeaderboardStats } from '../services/leaderboardService';
import { toast } from 'react-hot-toast';

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
  if (trend === 'stable') return <Minus className="w-4 h-4 text-gray-400" />;
  
  const isPositive = change > 0;
  const Icon = isPositive ? ArrowUp : ArrowDown;
  const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
  
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
    <div className="bg-white rounded-xl shadow-glow hover:shadow-glow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-surface-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={kol.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${kol.displayName}`}
                alt={kol.displayName}
                className="w-12 h-12 rounded-full"
              />
              {kol.verified && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-surface-900">{kol.displayName}</h3>
                <div className={`px-2 py-1 rounded-full text-xs text-white ${getTierColor(kol.tier)}`}>
                  {getTierIcon(kol.tier)}
                </div>
              </div>
              <p className="text-sm text-surface-600">@{kol.telegramUsername}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-surface-900">{getRankBadge(rank)}</div>
            <div className="flex items-center space-x-1">
              <TrendIndicator change={kol.trends.scoreChange} trend={kol.trends.trend} />
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-surface-900">{kol.overallScore}</div>
            <div className="text-xs text-surface-600">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">{kol.tradingPerformance.winRate}%</div>
            <div className="text-xs text-surface-600">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">{formatNumber(kol.influenceMetrics.followers)}</div>
            <div className="text-xs text-surface-600">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">{formatCurrency(kol.tradingPerformance.totalVolume)}</div>
            <div className="text-xs text-surface-600">Volume</div>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-3">
          {kol.specialty.map((spec, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-brand-50 text-brand-600 text-xs rounded-full"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {kol.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-surface-100 text-surface-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="border-t border-surface-100 bg-surface-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trading Performance */}
            <div>
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-1" />
                Trading Performance
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-600">Total Calls:</span>
                  <span className="font-medium">{kol.tradingPerformance.totalCalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Successful:</span>
                  <span className="font-medium text-green-600">{kol.tradingPerformance.successfulCalls}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Avg Volume:</span>
                  <span className="font-medium">{formatCurrency(kol.tradingPerformance.avgVolume)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Best Call:</span>
                  <span className="font-medium text-green-600">
                    {kol.tradingPerformance.bestCall.token} +{kol.tradingPerformance.bestCall.gain}%
                  </span>
                </div>
              </div>
            </div>

            {/* Influence Metrics */}
            <div>
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Influence Metrics
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-600">Avg Views:</span>
                  <span className="font-medium">{formatNumber(kol.influenceMetrics.avgViews)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Engagement:</span>
                  <span className="font-medium">{kol.influenceMetrics.engagementRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Credibility:</span>
                  <span className="font-medium">{kol.influenceMetrics.credibilityScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Market Impact:</span>
                  <span className={`font-medium capitalize ${
                    kol.influenceMetrics.marketImpact === 'high' ? 'text-red-600' :
                    kol.influenceMetrics.marketImpact === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {kol.influenceMetrics.marketImpact}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Metrics */}
            <div>
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center">
                <Activity className="w-4 h-4 mr-1" />
                Activity Metrics
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-600">Posts (30d):</span>
                  <span className="font-medium">{kol.activityMetrics.postsLast30Days}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Avg/Day:</span>
                  <span className="font-medium">{kol.activityMetrics.avgPostsPerDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Consistency:</span>
                  <span className="font-medium">{kol.activityMetrics.consistency}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Response Time:</span>
                  <span className="font-medium">{kol.activityMetrics.responseTime}h</span>
                </div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div>
              <h4 className="font-semibold text-surface-900 mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-1" />
                Risk Assessment
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-600">Overall Risk:</span>
                  <span className={`font-medium capitalize ${
                    kol.riskAssessment.overallRisk === 'low' ? 'text-green-600' :
                    kol.riskAssessment.overallRisk === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {kol.riskAssessment.overallRisk}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Risk Score:</span>
                  <span className="font-medium">{kol.riskAssessment.riskScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Reliability:</span>
                  <span className="font-medium">{kol.riskAssessment.reliability}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-600">Joined:</span>
                  <span className="font-medium">{kol.joinedDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Factors */}
          {kol.riskAssessment.riskFactors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-surface-900 mb-2">Risk Factors</h4>
              <div className="flex flex-wrap gap-1">
                {kol.riskAssessment.riskFactors.map((factor, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full"
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

export default function Leaderboard() {
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [kols, setKols] = useState<LeaderboardKOL[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);

  const specialties = ['all', 'DeFi', 'Memecoins', 'Layer 2', 'NFTs', 'Altcoins', 'Trading', 'Analytics'];

  useEffect(() => {
    loadData();
  }, [sortBy, filterSpecialty]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const leaderboardData = leaderboardService.getLeaderboard(sortBy, filterSpecialty);
      const statsData = leaderboardService.getStats();
      
      setKols(leaderboardData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    leaderboardService.refreshData();
    loadData();
    toast.success('Leaderboard data refreshed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
            KOL Leaderboard
          </h1>
          <p className="text-surface-600 text-sm mt-1">Top performing KOLs ranked by comprehensive metrics</p>
        </div>
        <button
          onClick={handleRefresh}
          className="mt-4 sm:mt-0 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
        >
          Refresh Data
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-glow hover:shadow-glow-md transition-all duration-200">
        <div className="flex flex-wrap gap-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-surface-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
            >
              <option value="score">Overall Score</option>
              <option value="volume">Trading Volume</option>
              <option value="followers">Followers</option>
              <option value="engagement">Engagement</option>
            </select>
          </div>

          {/* Filter By Specialty */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Specialty</label>
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-surface-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty === 'all' ? 'All Specialties' : specialty}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-glow hover:shadow-glow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-brand-50 rounded-xl">
              <Users size={24} className="text-brand-500" />
            </div>
            <div>
              <p className="text-surface-600 text-sm">Total KOLs</p>
                <p className="text-2xl font-semibold text-surface-900">{stats.totalKOLs}</p>
                <p className="text-surface-500 text-xs">Top Performer: {stats.topPerformer}</p>
              </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-glow hover:shadow-glow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <TrendingUp size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-surface-600 text-sm">Avg Win Rate</p>
                <p className="text-2xl font-semibold text-surface-900">{stats.avgWinRate}%</p>
                <p className="text-surface-500 text-xs">Biggest Gainer: {stats.biggestGainer}</p>
              </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-glow hover:shadow-glow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-cyan-50 rounded-xl">
              <TrendingUp size={24} className="text-cyan-500" />
            </div>
            <div>
              <p className="text-surface-600 text-sm">Avg Volume</p>
                <p className="text-2xl font-semibold text-surface-900">{formatCurrency(stats.avgVolume)}</p>
                <p className="text-surface-500 text-xs">Most Consistent: {stats.mostConsistent}</p>
              </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-glow hover:shadow-glow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-50 rounded-xl">
                <Star size={24} className="text-purple-500" />
            </div>
            <div>
              <p className="text-surface-600 text-sm">Avg Score</p>
                <p className="text-2xl font-semibold text-surface-900">{stats.avgScore}</p>
                <p className="text-surface-500 text-xs">Avg Engagement: {stats.avgEngagement}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
            <p className="text-surface-600 mt-2">Loading leaderboard...</p>
      </div>
        ) : kols.length > 0 ? (
          kols.map((kol, index) => (
            <KOLCard key={kol.id} kol={kol} rank={index + 1} />
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-glow hover:shadow-glow-md transition-all duration-200 p-12 text-center">
            <Users size={32} className="text-surface-400 mx-auto mb-3" />
            <p className="text-surface-600 font-medium">No KOLs found</p>
            <p className="text-surface-500 text-sm mt-1">Try adjusting your filters or refresh the data</p>
        </div>
        )}
      </div>
    </div>
  );
}