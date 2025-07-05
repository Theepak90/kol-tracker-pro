import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Bot, Eye, MoreHorizontal, Loader2, Plus, Scan, User, Calendar, MessageCircle, TrendingUp, Network, Flag, ExternalLink } from 'lucide-react';
import { botDetectionService, BotDetectionResult, BotDetectionStats } from '../services/botDetectionService';
import { toast } from 'react-hot-toast';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Bot Detector
          </h1>
          <p className="text-gray-600 text-sm mt-1">Advanced AI-powered bot detection and analysis</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={isScanning || !searchTerm.trim()}
          className="mt-4 sm:mt-0 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2 min-w-[140px]"
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

      {/* Search Input */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Enter username (@username) or channel URL (t.me/channel)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">All Status</option>
            <option value="confirmed_bot">Confirmed Bots</option>
            <option value="suspicious">Suspicious</option>
            <option value="human">Verified Human</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-50 rounded-xl">
              <Bot size={24} className="text-red-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Confirmed Bots</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.confirmedBots}</p>
              <p className="text-gray-500 text-xs">
                {stats.totalScanned > 0 ? `${((stats.confirmedBots / stats.totalScanned) * 100).toFixed(1)}%` : 'No data'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-50 rounded-xl">
              <AlertTriangle size={24} className="text-amber-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Suspicious</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.suspicious}</p>
              <p className="text-gray-500 text-xs">
                {stats.totalScanned > 0 ? `${((stats.suspicious / stats.totalScanned) * 100).toFixed(1)}%` : 'No data'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-50 rounded-xl">
              <CheckCircle size={24} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Verified Human</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.verifiedHumans}</p>
              <p className="text-gray-500 text-xs">
                {stats.totalScanned > 0 ? `${((stats.verifiedHumans / stats.totalScanned) * 100).toFixed(1)}%` : 'No data'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Shield size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Detection Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.detectionRate.toFixed(1)}%</p>
              <p className="text-gray-500 text-xs">
                {stats.totalScanned} accounts scanned
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Filter */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Filter results by username..."
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Detection Results */}
      <div className="space-y-3">
        {isLoading && results.length === 0 ? (
          // Loading skeleton
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-12 w-12 bg-gray-200 rounded-xl animate-pulse" />
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredResults.length > 0 ? (
          // Results list
          filteredResults.map((result) => (
            <div key={result.userId} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <User size={24} className="text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">@{result.username}</h3>
                      {getStatusIcon(result.status)}
                    </div>
                    <p className="text-gray-600 text-sm">{result.displayName}</p>
                    <p className="text-gray-500 text-xs">Analyzed {formatDate(result.detectionDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(result.status)}`}>
                    {result.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`text-sm font-semibold ${getConfidenceColor(result.confidence)}`}>
                    {result.confidence.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Account Age</p>
                  <p className="font-semibold">{result.profileAnalysis.accountAge} days</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Messages</p>
                  <p className="font-semibold">{formatNumber(result.activityAnalysis.messageCount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Spam Score</p>
                  <p className={`font-semibold ${result.contentAnalysis.spamScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                    {result.contentAnalysis.spamScore.toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Followers</p>
                  <p className="font-semibold">{formatNumber(result.metrics.followers || 0)}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">{result.aiAnalysis.overview}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Activity: {result.activityAnalysis.activityPattern}</span>
                  <span>•</span>
                  <span>Network: {result.networkAnalysis.connectionPattern}</span>
                  {result.aiAnalysis.alternativeAccounts && (
                    <>
                      <span>•</span>
                      <span className="text-amber-600">Alt accounts detected</span>
                    </>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedResult(result);
                    setShowDetailModal(true);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View Details</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        ) : (
          // Empty state
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Bot size={24} className="text-gray-400" />
            </div>
            <h3 className="text-gray-900 font-medium">No Analysis Results</h3>
            <p className="text-gray-500 text-sm mt-1 mb-6">
              {searchTerm ? 'No results match your search criteria' : 'Enter a username or channel URL to start analyzing'}
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Examples:</p>
              <p>• @username</p>
              <p>• t.me/channelname</p>
              <p>• https://t.me/channelname</p>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <User size={24} className="text-gray-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">@{selectedResult.username}</h2>
                    <p className="text-gray-600">{selectedResult.displayName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* AI Analysis Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Analysis Overview</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedResult.aiAnalysis.overview}</p>
                </div>
              </div>

              {/* Key Indicators */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedResult.aiAnalysis.keyIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Factors</h3>
                <div className="space-y-2">
                  {selectedResult.aiAnalysis.riskFactors.map((factor, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Metrics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Detailed Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Analysis */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Profile Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Has Profile Photo:</span>
                        <span className={selectedResult.profileAnalysis.hasProfilePhoto ? 'text-green-600' : 'text-red-600'}>
                          {selectedResult.profileAnalysis.hasProfilePhoto ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bio Length:</span>
                        <span>{selectedResult.profileAnalysis.bioLength} chars</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Username Pattern:</span>
                        <span className={selectedResult.profileAnalysis.usernamePattern === 'suspicious' ? 'text-red-600' : 'text-green-600'}>
                          {selectedResult.profileAnalysis.usernamePattern}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Activity Analysis */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Activity Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Messages/Day:</span>
                        <span>{selectedResult.activityAnalysis.avgMessagesPerDay.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Seen:</span>
                        <span>{selectedResult.activityAnalysis.lastSeenDays} days ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Response Pattern:</span>
                        <span className={selectedResult.activityAnalysis.responseTimePattern === 'automated' ? 'text-red-600' : 'text-green-600'}>
                          {selectedResult.activityAnalysis.responseTimePattern}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Analysis */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Content Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Spam Score:</span>
                        <span className={selectedResult.contentAnalysis.spamScore > 50 ? 'text-red-600' : 'text-green-600'}>
                          {selectedResult.contentAnalysis.spamScore.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duplicate Content:</span>
                        <span className={selectedResult.contentAnalysis.duplicateContentRatio > 50 ? 'text-red-600' : 'text-green-600'}>
                          {selectedResult.contentAnalysis.duplicateContentRatio.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Topic Diversity:</span>
                        <span className={selectedResult.contentAnalysis.topicDiversity < 30 ? 'text-red-600' : 'text-green-600'}>
                          {selectedResult.contentAnalysis.topicDiversity.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Network Analysis */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Network Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mutual Connections:</span>
                        <span>{selectedResult.networkAnalysis.mutualConnections}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Suspicious Connections:</span>
                        <span className={selectedResult.networkAnalysis.suspiciousConnections > 5 ? 'text-red-600' : 'text-green-600'}>
                          {selectedResult.networkAnalysis.suspiciousConnections}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Connection Pattern:</span>
                        <span className={selectedResult.networkAnalysis.connectionPattern === 'artificial' ? 'text-red-600' : 'text-green-600'}>
                          {selectedResult.networkAnalysis.connectionPattern}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                <div className="space-y-2">
                  {selectedResult.aiAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                      <Flag className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Accounts */}
              {selectedResult.aiAnalysis.alternativeAccounts && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Potential Alternative Accounts</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedResult.aiAnalysis.alternativeAccounts.map((account, index) => (
                      <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
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