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
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500">
              <TypewriterText text="Bot Detector" />
            </h1>
            <p className="text-gray-400 text-lg">
              Advanced AI-powered bot detection and analysis
            </p>
          </div>

          {/* Search Input */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Enter username (@username) or channel URL (t.me/channel)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-300 placeholder-gray-500 transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/0 via-orange-500/0 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              
              <button 
                onClick={handleScan}
                disabled={isScanning || !searchTerm.trim()}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-red-500/20 transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2 min-w-[140px]"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Scan size={16} />
                    <span>Analyze Account</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { icon: Bot, label: 'Confirmed Bots', value: stats.confirmedBots, percent: stats.totalScanned > 0 ? ((stats.confirmedBots / stats.totalScanned) * 100).toFixed(1) : 0, color: 'red' },
              { icon: AlertTriangle, label: 'Suspicious', value: stats.suspicious, percent: stats.totalScanned > 0 ? ((stats.suspicious / stats.totalScanned) * 100).toFixed(1) : 0, color: 'orange' },
              { icon: CheckCircle, label: 'Verified Human', value: stats.verifiedHumans, percent: stats.totalScanned > 0 ? ((stats.verifiedHumans / stats.totalScanned) * 100).toFixed(1) : 0, color: 'emerald' },
              { icon: Shield, label: 'Detection Rate', value: `${stats.detectionRate.toFixed(1)}%`, subtext: `${stats.totalScanned} accounts scanned`, color: 'blue' }
            ].map((stat, index) => (
              <div key={index} className="group relative bg-gray-900/50 backdrop-blur-xl p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-${stat.color}-500/10 via-${stat.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-4 group-hover:scale-110 transition-transform duration-300`} />
                  <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                  <p className="text-2xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.subtext || `${stat.percent}%`}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Results Filter */}
          {results.length > 0 && (
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Filter results by username..."
                      value={filterTerm}
                      onChange={(e) => setFilterTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-300 placeholder-gray-500 transition-all duration-300"
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="sm:w-48 px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20 text-gray-300 transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed_bot">Confirmed Bots</option>
                    <option value="suspicious">Suspicious</option>
                    <option value="human">Verified Human</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="space-y-4">
            {isLoading && results.length === 0 ? (
              // Loading skeleton
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-12 w-12 bg-gray-800 rounded-xl animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-24 bg-gray-800 rounded-xl animate-pulse" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-16 bg-gray-800 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-gray-800 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredResults.length > 0 ? (
              // Results list
              filteredResults.map((result) => (
                <div key={result.userId} className="group bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl bg-${getStatusColor(result.status)}/10`}>
                          {getStatusIcon(result.status)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-200">{result.username}</h3>
                          <p className="text-sm text-gray-400">{result.displayName}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                          {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Confidence</p>
                          <p className={`text-lg font-semibold ${getConfidenceColor(result.confidence)}`}>
                            {result.confidence.toFixed(0)}%
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedResult(result);
                            setShowDetailModal(true);
                          }}
                          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium flex items-center space-x-2 transition-colors duration-200"
                        >
                          <Eye size={16} />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-8 sm:p-12 text-center">
                <div className="w-16 h-16 bg-gray-800/50 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Bot size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-2">No Analysis Results</h3>
                <p className="text-gray-400 mb-8">
                  {searchTerm ? 'No results match your search criteria' : 'Enter a username or channel URL to start analyzing'}
                </p>
                <div className="text-sm text-gray-500 space-y-2">
                  <p className="font-medium text-gray-400">Examples:</p>
                  <p>• @username</p>
                  <p>• t.me/channelname</p>
                  <p>• https://t.me/channelname</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/90 rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-${getStatusColor(selectedResult.status)}/10`}>
                    {getStatusIcon(selectedResult.status)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-200">@{selectedResult.username}</h2>
                    <p className="text-gray-400">{selectedResult.displayName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* AI Analysis Overview */}
              <div>
                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-4">AI Analysis Overview</h3>
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                  <p className="text-gray-300">{selectedResult.aiAnalysis.overview}</p>
                </div>
              </div>

              {/* Key Indicators */}
              <div>
                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">Key Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedResult.aiAnalysis.keyIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-blue-900/20 rounded-xl border border-blue-900/30">
                      <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-4">Risk Factors</h3>
                <div className="space-y-2">
                  {selectedResult.aiAnalysis.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-red-900/20 rounded-xl border border-red-900/30">
                      <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-4">Detailed Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-200">Profile Analysis</h4>
                    <div className="space-y-3 text-sm bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Has Profile Photo:</span>
                        <span className={selectedResult.profileAnalysis.hasProfilePhoto ? 'text-emerald-400' : 'text-red-400'}>
                          {selectedResult.profileAnalysis.hasProfilePhoto ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bio Length:</span>
                        <span className="text-gray-300">{selectedResult.profileAnalysis.bioLength} chars</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Username Pattern:</span>
                        <span className={selectedResult.profileAnalysis.usernamePattern === 'suspicious' ? 'text-red-400' : 'text-emerald-400'}>
                          {selectedResult.profileAnalysis.usernamePattern}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-200">Activity Analysis</h4>
                    <div className="space-y-3 text-sm bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Messages/Day:</span>
                        <span className="text-gray-300">{selectedResult.activityAnalysis.avgMessagesPerDay.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last Seen:</span>
                        <span className="text-gray-300">{selectedResult.activityAnalysis.lastSeenDays} days ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Response Pattern:</span>
                        <span className={selectedResult.activityAnalysis.responseTimePattern === 'automated' ? 'text-red-400' : 'text-emerald-400'}>
                          {selectedResult.activityAnalysis.responseTimePattern}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-200">Content Analysis</h4>
                    <div className="space-y-3 text-sm bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Spam Score:</span>
                        <span className={selectedResult.contentAnalysis.spamScore > 50 ? 'text-red-400' : 'text-emerald-400'}>
                          {selectedResult.contentAnalysis.spamScore.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duplicate Content:</span>
                        <span className={selectedResult.contentAnalysis.duplicateContentRatio > 50 ? 'text-red-400' : 'text-emerald-400'}>
                          {selectedResult.contentAnalysis.duplicateContentRatio.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Topic Diversity:</span>
                        <span className={selectedResult.contentAnalysis.topicDiversity < 30 ? 'text-red-400' : 'text-emerald-400'}>
                          {selectedResult.contentAnalysis.topicDiversity.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Network Analysis */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-200">Network Analysis</h4>
                    <div className="space-y-3 text-sm bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Mutual Connections:</span>
                        <span className="text-gray-300">{selectedResult.networkAnalysis.mutualConnections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Suspicious Connections:</span>
                        <span className={selectedResult.networkAnalysis.suspiciousConnections > 5 ? 'text-red-400' : 'text-emerald-400'}>
                          {selectedResult.networkAnalysis.suspiciousConnections}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Connection Pattern:</span>
                        <span className={selectedResult.networkAnalysis.connectionPattern === 'artificial' ? 'text-red-400' : 'text-emerald-400'}>
                          {selectedResult.networkAnalysis.connectionPattern}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">Recommendations</h3>
                <div className="space-y-2">
                  {selectedResult.aiAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-blue-900/20 rounded-xl border border-blue-900/30">
                      <Flag className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Accounts */}
              {selectedResult.aiAnalysis.alternativeAccounts && (
                <div>
                  <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-4">Potential Alternative Accounts</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.aiAnalysis.alternativeAccounts.map((account, index) => (
                      <span key={index} className="px-3 py-1 bg-amber-900/20 text-amber-300 rounded-xl border border-amber-900/30 text-sm">
                        @{account}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}