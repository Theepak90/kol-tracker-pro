import React, { useState, useEffect } from 'react';
import { Trophy, Medal, TrendingUp, Users, Search, ArrowUpRight, ArrowDownRight, Star, Activity, Crown, Award, Target, Zap, Shield } from 'lucide-react';
import { leaderboardService, LeaderboardKOL, LeaderboardStats } from '../services/leaderboardService';
import { toast } from 'react-hot-toast';
import { TypewriterText } from './TypewriterText';

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
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardKOL[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('score');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');

  const specialties = ['all', 'DeFi', 'Memecoins', 'Layer 2', 'NFTs', 'Altcoins', 'Trading', 'Analytics'];

  useEffect(() => {
    loadData();
  }, [sortBy, filterSpecialty, timeRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const leaderboardData = leaderboardService.getLeaderboard(sortBy, filterSpecialty);
      const statsData = leaderboardService.getStats();
      
      setLeaderboardData(leaderboardData);
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    leaderboardService.refreshData();
    loadData();
    toast.success('Leaderboard data refreshed');
  };

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
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
              <TypewriterText text="KOL Leaderboard" />
            </h1>
            <p className="text-gray-400 text-lg">
              Top performing Key Opinion Leaders ranked by influence and impact
            </p>
          </div>

          {/* Controls */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search KOLs by name or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-gray-300 placeholder-gray-500 transition-all duration-300"
                />
              </div>
              
              <div className="flex gap-2">
                {['24h', '7d', '30d', 'All'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      timeRange === range
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { icon: Trophy, label: 'Top Performer', value: stats?.topPerformer || '@cryptomaster', change: '+3 ranks', isPositive: true },
              { icon: Users, label: 'Total KOLs', value: stats?.totalKOLs || '1,250', change: '+85 new', isPositive: true },
              { icon: Activity, label: 'Avg. Success Rate', value: `${stats?.avgWinRate || '76.5'}%`, change: '+2.3%', isPositive: true },
              { icon: TrendingUp, label: 'Total Volume', value: formatCurrency(stats?.avgVolume || 4200000000), change: '+12.8%', isPositive: true }
            ].map((stat, index) => (
              <div key={index} className="group relative bg-gray-900/50 backdrop-blur-xl p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <stat.icon className="w-8 h-8 text-amber-400 mb-4 group-hover:scale-110 transition-transform duration-300" />
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

          {/* Filters */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <div className="flex flex-wrap gap-4">
              {/* Sort By */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="w-full px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-gray-300 transition-all duration-300"
                >
                  <option value="score">Overall Score</option>
                  <option value="volume">Trading Volume</option>
                  <option value="followers">Followers</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>

              {/* Filter By Specialty */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-400 mb-2">Specialty</label>
                <select
                  value={filterSpecialty}
                  onChange={(e) => setFilterSpecialty(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 focus:border-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-gray-300 transition-all duration-300"
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

          {/* Leaderboard */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading leaderboard...</p>
              </div>
            ) : leaderboardData.length > 0 ? (
              leaderboardData.map((kol, index) => (
                <KOLCard key={kol.id} kol={kol} rank={index + 1} />
              ))
            ) : (
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-12 text-center">
                <Users size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-300 font-medium">No KOLs found</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or refresh the data</p>
                <button
                  onClick={handleRefresh}
                  className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
                >
                  Refresh Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;