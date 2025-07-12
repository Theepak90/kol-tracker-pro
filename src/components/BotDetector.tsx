import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Bot, Eye, MoreHorizontal, Loader2, Plus, Scan, User, Calendar, MessageCircle, TrendingUp, Network, Flag, ExternalLink } from 'lucide-react';
import { botDetectionService, BotDetectionResult, BotDetectionStats } from '../services/botDetectionService';
import { toast } from 'react-hot-toast';
import { TypewriterText } from './TypewriterText';

export function BotDetector() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<BotDetectionResult[]>([]);
  const [stats, setStats] = useState<BotDetectionStats>({
    totalScanned: 0,
    confirmedBots: 0,
    suspicious: 0,
    verifiedHumans: 0,
    detectionRate: 0
  });
  const [selectedResult, setSelectedResult] = useState<BotDetectionResult | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    // Update stats whenever results change
    if (Array.isArray(results) && results.length > 0) {
      const newStats = botDetectionService.calculateStats(results);
      setStats(newStats);
    }
  }, [results]);

  const handleScan = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a username or channel to scan');
      return;
    }

    setIsScanning(true);
    setIsLoading(true);

    try {
      let result: BotDetectionResult;
      
      if (searchTerm.includes('t.me/') || searchTerm.startsWith('@')) {
        result = await botDetectionService.analyzeChannel(searchTerm);
        toast.success('Channel analysis completed!');
      } else {
        result = await botDetectionService.analyzeUser(searchTerm);
        toast.success('User analysis completed!');
      }

      setResults(prev => Array.isArray(prev) ? [result, ...prev] : [result]);
      setSearchTerm('');
      
    } catch (error) {
      console.error('Bot detection failed:', error);
      toast.error('Failed to analyze the account. Please try again.');
    } finally {
      setIsScanning(false);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed_bot': return 'bg-red-100 text-red-700 border-red-200';
      case 'suspicious': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'human': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed_bot': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'suspicious': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'human': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default: return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-emerald-600';
    if (confidence >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const filteredResults = (Array.isArray(results) ? results : []).filter(result => {
    const matchesSearch = !filterTerm || 
      result.username.toLowerCase().includes(filterTerm.toLowerCase()) ||
      result.displayName.toLowerCase().includes(filterTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || result.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 overflow-hidden">
      {/* Ultra-Modern Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-400 to-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb" style={{animationDelay: '-2s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb" style={{animationDelay: '-4s'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb" style={{animationDelay: '-6s'}}></div>
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444410_1px,transparent_1px),linear-gradient(to_bottom,#ef444410_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        
        {/* Radial Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-red-500/30 via-orange-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-radial from-yellow-500/20 via-red-500/15 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 space-y-8">
          {/* Enhanced Header with Split Text and Advanced Animations */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="space-y-4">
              <h1 className="text-7xl md:text-8xl lg:text-9xl font-black tracking-tight">
                <span className="block bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-gradient-x">
                  <TypewriterText text="BOT" />
                </span>
                <span className="block bg-gradient-to-r from-yellow-400 via-red-400 to-orange-400 bg-clip-text text-transparent animate-gradient-x" style={{animationDelay: '0.5s'}}>
                  DETECTOR
                </span>
            </h1>
              <div className="h-1 w-32 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full shadow-lg shadow-red-500/50"></div>
            </div>
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
              Advanced AI-powered bot detection and analysis with military-grade precision
            </p>
          </div>

          {/* Enhanced Search Input with Advanced Glass Morphism */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-black/20 backdrop-blur-2xl rounded-2xl border border-red-500/20 p-2 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative group/input">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400 z-10" size={20} />
                <input
                  type="text"
                  placeholder="Enter username (@username) or channel URL (t.me/channel)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                      className="w-full pl-12 pr-6 py-4 bg-black/30 backdrop-blur-sm rounded-xl border border-red-500/30 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-white placeholder-gray-400 transition-all duration-300 text-lg group-hover/input:border-red-400/50"
                />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/0 via-orange-500/0 to-yellow-500/0 opacity-0 group-hover/input:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              
              <button 
                onClick={handleScan}
                disabled={isScanning || !searchTerm.trim()}
                    className="group/btn relative px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl shadow-2xl shadow-red-500/30 transition-all duration-300 text-lg font-semibold flex items-center justify-center space-x-3 min-w-[180px] overflow-hidden"
              >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                    <div className="relative z-10 flex items-center space-x-3">
                {isScanning ? (
                  <>
                          <Loader2 className="animate-spin" size={20} />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                          <Scan size={20} />
                    <span>Analyze Account</span>
                  </>
                )}
                    </div>
              </button>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Overview with Advanced Glass Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              { icon: Bot, label: 'Confirmed Bots', value: stats.confirmedBots, percent: stats.totalScanned > 0 ? ((stats.confirmedBots / stats.totalScanned) * 100).toFixed(1) : 0, gradient: 'from-red-500 to-red-600', bgGradient: 'from-red-500/10 to-red-600/5' },
              { icon: AlertTriangle, label: 'Suspicious', value: stats.suspicious, percent: stats.totalScanned > 0 ? ((stats.suspicious / stats.totalScanned) * 100).toFixed(1) : 0, gradient: 'from-amber-500 to-orange-600', bgGradient: 'from-amber-500/10 to-orange-600/5' },
              { icon: CheckCircle, label: 'Verified Human', value: stats.verifiedHumans, percent: stats.totalScanned > 0 ? ((stats.verifiedHumans / stats.totalScanned) * 100).toFixed(1) : 0, gradient: 'from-emerald-500 to-green-600', bgGradient: 'from-emerald-500/10 to-green-600/5' },
              { icon: Shield, label: 'Detection Rate', value: `${stats.detectionRate.toFixed(1)}%`, subtext: `${stats.totalScanned} accounts scanned`, gradient: 'from-blue-500 to-cyan-600', bgGradient: 'from-blue-500/10 to-cyan-600/5' }
            ].map((stat, index) => (
              <div key={index} className="group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl`}></div>
                <div className="relative bg-black/20 backdrop-blur-2xl p-8 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
                <div className="relative">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-2xl mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-2 uppercase tracking-wider">{stat.label}</h3>
                    <p className={`text-4xl font-black mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">{stat.subtext || `${stat.percent}%`}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Results Filter with Glass Morphism */}
          {results.length > 0 && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-black/20 backdrop-blur-2xl rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="relative flex-1 group/filter">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-400" size={18} />
                    <input
                      type="text"
                      placeholder="Filter results by username..."
                      value={filterTerm}
                      onChange={(e) => setFilterTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-black/30 backdrop-blur-sm rounded-xl border border-red-500/30 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-white placeholder-gray-400 transition-all duration-300"
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                      className="sm:w-52 px-4 py-3 bg-black/30 backdrop-blur-sm rounded-xl border border-red-500/30 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 text-white transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed_bot">Confirmed Bots</option>
                    <option value="suspicious">Suspicious</option>
                    <option value="human">Verified Human</option>
                  </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Results List */}
          <div className="space-y-6">
            {isLoading && results.length === 0 ? (
              // Enhanced Loading skeleton
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur-xl opacity-50"></div>
                <div className="relative bg-black/20 backdrop-blur-2xl rounded-2xl border border-white/10 p-8">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="h-16 w-16 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl animate-pulse" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 w-40 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg animate-pulse" />
                      <div className="h-4 w-32 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg animate-pulse" />
                    </div>
                    <div className="h-10 w-32 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl animate-pulse" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <div className="h-4 w-20 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg animate-pulse" />
                        <div className="h-5 w-24 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-lg animate-pulse" />
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            ) : filteredResults.length > 0 ? (
              // Enhanced Results list
              filteredResults.map((result, index) => (
                <div key={`${result.username}-${index}`} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative bg-black/20 backdrop-blur-2xl rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 group-hover:transform group-hover:scale-[1.02]">
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="flex items-center space-x-6">
                          <div className={`p-4 rounded-2xl ${getStatusColor(result.status)} bg-opacity-20 backdrop-blur-sm`}>
                          {getStatusIcon(result.status)}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">{result.username}</h3>
                            <p className="text-gray-400 font-medium">{result.displayName}</p>
                        </div>
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-sm ${getStatusColor(result.status)}`}>
                          {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                        </span>
                      </div>
                        <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Confidence</p>
                            <p className={`text-2xl font-black ${getConfidenceColor(result.confidence)}`}>
                            {result.confidence.toFixed(0)}%
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedResult(result);
                            setShowDetailModal(true);
                          }}
                            className="group/btn relative px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 backdrop-blur-sm rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all duration-300 border border-red-500/30 hover:border-red-400/50 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                            <div className="relative z-10 flex items-center space-x-2">
                          <Eye size={16} />
                          <span>View Details</span>
                            </div>
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Enhanced Empty state
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-orange-500/5 rounded-2xl blur-xl"></div>
                <div className="relative bg-black/20 backdrop-blur-2xl rounded-2xl border border-white/10 p-12 sm:p-16 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500">
                    <Bot size={48} className="text-red-400" />
                </div>
                  <h3 className="text-2xl font-bold text-white mb-3">No Analysis Results</h3>
                  <p className="text-gray-400 mb-10 text-lg">
                  {searchTerm ? 'No results match your search criteria' : 'Enter a username or channel URL to start analyzing'}
                </p>
                  <div className="text-sm text-gray-500 space-y-3 max-w-md mx-auto">
                    <p className="font-semibold text-gray-400 text-base">Examples:</p>
                    <div className="space-y-2">
                      <p className="font-mono bg-black/30 rounded-lg px-4 py-2">• @username</p>
                      <p className="font-mono bg-black/30 rounded-lg px-4 py-2">• t.me/channelname</p>
                      <p className="font-mono bg-black/30 rounded-lg px-4 py-2">• https://t.me/channelname</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Detail Modal with Ultra-Modern Styling */}
      {showDetailModal && selectedResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
          <div className="relative max-w-6xl max-h-[95vh] overflow-hidden">
            {/* Modal Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-yellow-500/20 rounded-3xl blur-2xl opacity-60"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-red-600/10 via-transparent to-orange-600/10 rounded-3xl"></div>
            
            {/* Modal Content */}
            <div className="relative bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/20 overflow-y-auto max-h-[95vh]">
              {/* Enhanced Header */}
              <div className="relative p-8 border-b border-white/10">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className={`p-4 rounded-2xl ${getStatusColor(selectedResult.status)} bg-opacity-30 backdrop-blur-sm shadow-2xl`}>
                    {getStatusIcon(selectedResult.status)}
                  </div>
                  <div>
                      <h2 className="text-3xl font-black text-white mb-2">@{selectedResult.username}</h2>
                      <p className="text-gray-300 text-lg font-medium">{selectedResult.displayName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                    className="group relative p-3 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm rounded-2xl text-red-400 hover:text-red-300 transition-all duration-300 border border-red-500/30 hover:border-red-400/50"
                >
                    <XCircle size={28} />
                </button>
              </div>
            </div>

              <div className="p-8 space-y-10">
                {/* Enhanced AI Analysis Overview */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative">
                    <h3 className="text-2xl font-black mb-6">
                      <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">AI Analysis Overview</span>
                    </h3>
                    <div className="bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20 hover:border-red-400/30 transition-all duration-300">
                      <p className="text-gray-200 text-lg leading-relaxed">{selectedResult.aiAnalysis.overview}</p>
                    </div>
                </div>
              </div>

                {/* Enhanced Key Indicators */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative">
                    <h3 className="text-2xl font-black mb-6">
                      <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Key Indicators</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedResult.aiAnalysis.keyIndicators.map((indicator, index) => (
                        <div key={index} className="group/indicator relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover/indicator:opacity-100 transition-all duration-300"></div>
                          <div className="relative flex items-center space-x-3 p-4 bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                            <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-200 font-medium">{indicator}</span>
                          </div>
                    </div>
                  ))}
                    </div>
                </div>
              </div>

                {/* Enhanced Risk Factors */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative">
                    <h3 className="text-2xl font-black mb-6">
                      <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Risk Factors</span>
                    </h3>
                    <div className="space-y-3">
                  {selectedResult.aiAnalysis.riskFactors.map((factor, index) => (
                        <div key={index} className="group/risk relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-xl opacity-0 group-hover/risk:opacity-100 transition-all duration-300"></div>
                          <div className="relative flex items-center space-x-3 p-4 bg-red-900/20 backdrop-blur-sm rounded-xl border border-red-500/20 hover:border-red-400/30 transition-all duration-300">
                            <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                            <span className="text-gray-200 font-medium">{factor}</span>
                          </div>
                    </div>
                  ))}
                    </div>
                </div>
              </div>

                {/* Enhanced Detailed Metrics */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative">
                    <h3 className="text-2xl font-black mb-6">
                      <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Detailed Analysis</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Enhanced Profile Analysis */}
                  <div className="space-y-4">
                        <h4 className="font-bold text-white text-lg">Profile Analysis</h4>
                        <div className="space-y-4 bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Has Profile Photo:</span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${selectedResult.profileAnalysis.hasProfilePhoto ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {selectedResult.profileAnalysis.hasProfilePhoto ? 'Yes' : 'No'}
                        </span>
                      </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Bio Length:</span>
                            <span className="text-white font-bold">{selectedResult.profileAnalysis.bioLength} chars</span>
                      </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Username Pattern:</span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${selectedResult.profileAnalysis.usernamePattern === 'suspicious' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {selectedResult.profileAnalysis.usernamePattern}
                        </span>
                      </div>
                    </div>
                  </div>

                      {/* Enhanced Activity Analysis */}
                  <div className="space-y-4">
                        <h4 className="font-bold text-white text-lg">Activity Analysis</h4>
                        <div className="space-y-4 bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Messages/Day:</span>
                            <span className="text-white font-bold">{selectedResult.activityAnalysis.avgMessagesPerDay.toFixed(1)}</span>
                      </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Last Seen:</span>
                            <span className="text-white font-bold">{selectedResult.activityAnalysis.lastSeenDays} days ago</span>
                      </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Response Pattern:</span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${selectedResult.activityAnalysis.responseTimePattern === 'automated' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {selectedResult.activityAnalysis.responseTimePattern}
                        </span>
                      </div>
                    </div>
                  </div>

                      {/* Enhanced Content Analysis */}
                  <div className="space-y-4">
                        <h4 className="font-bold text-white text-lg">Content Analysis</h4>
                        <div className="space-y-4 bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Spam Score:</span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${selectedResult.contentAnalysis.spamScore > 50 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {selectedResult.contentAnalysis.spamScore.toFixed(0)}%
                        </span>
                      </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Duplicate Content:</span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${selectedResult.contentAnalysis.duplicateContentRatio > 50 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {selectedResult.contentAnalysis.duplicateContentRatio.toFixed(0)}%
                        </span>
                      </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Topic Diversity:</span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${selectedResult.contentAnalysis.topicDiversity < 30 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {selectedResult.contentAnalysis.topicDiversity.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                      {/* Enhanced Network Analysis */}
                  <div className="space-y-4">
                        <h4 className="font-bold text-white text-lg">Network Analysis</h4>
                        <div className="space-y-4 bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/20">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Mutual Connections:</span>
                            <span className="text-white font-bold">{selectedResult.networkAnalysis.mutualConnections}</span>
                      </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Suspicious Connections:</span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${selectedResult.networkAnalysis.suspiciousConnections > 5 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {selectedResult.networkAnalysis.suspiciousConnections}
                        </span>
                      </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Connection Pattern:</span>
                            <span className={`px-3 py-1 rounded-lg text-sm font-bold ${selectedResult.networkAnalysis.connectionPattern === 'artificial' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {selectedResult.networkAnalysis.connectionPattern}
                        </span>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                {/* Enhanced Recommendations */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative">
                    <h3 className="text-2xl font-black mb-6">
                      <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Recommendations</span>
                    </h3>
                    <div className="space-y-3">
                  {selectedResult.aiAnalysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="group/rec relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl opacity-0 group-hover/rec:opacity-100 transition-all duration-300"></div>
                          <div className="relative flex items-center space-x-3 p-4 bg-blue-900/20 backdrop-blur-sm rounded-xl border border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                            <Flag className="h-5 w-5 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-200 font-medium">{recommendation}</span>
                          </div>
                    </div>
                  ))}
                    </div>
                </div>
              </div>

                {/* Enhanced Performance Metrics */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative">
                    <h3 className="text-2xl font-black mb-6">
                      <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Performance Metrics</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {[
                        { label: 'Followers', value: selectedResult.metrics.followers || 0, gradient: 'from-blue-500 to-cyan-500' },
                        { label: 'Posts', value: selectedResult.metrics.posts || 0, gradient: 'from-purple-500 to-pink-500' },
                        { label: 'Engagement', value: `${selectedResult.metrics.engagement?.toFixed(1) || 0}%`, gradient: 'from-emerald-500 to-teal-500' },
                        { label: 'Days Old', value: selectedResult.profileAnalysis.accountAge, gradient: 'from-amber-500 to-orange-500' }
                      ].map((metric, index) => (
                        <div key={index} className="group/metric relative overflow-hidden">
                          <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5 rounded-2xl group-hover/metric:opacity-10 transition-all duration-300`}></div>
                          <div className="relative bg-black/30 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 text-center group-hover/metric:transform group-hover/metric:scale-105">
                            <p className={`text-3xl font-black mb-2 bg-gradient-to-r ${metric.gradient} bg-clip-text text-transparent`}>
                              {metric.value}
                            </p>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{metric.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}