import React, { useState, useEffect } from 'react';
import { Search, Users, MessageCircle, TrendingUp, BarChart3, Brain, Clock, Link, Zap, AlertTriangle, CheckCircle, X, Loader2, Plus, AtSign } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { telegramService } from '../services/telegramService';
import { aiAnalysisService } from '../services/aiAnalysisService';
import type { KOL } from '../services/apiService';
import type { AIAnalysis } from '../services/aiAnalysisService';

interface KOLFormData {
  displayName: string;
  telegramUsername: string;
  description: string;
  tags: string[];
}

interface UserPost {
  message_id: number;
  text: string;
  date: string;
  views: number | null;
  forwards: number | null;
  channel_id: number;
  channel_title: string;
}

export default function KOLAnalyzer() {
  // Basic state
  const [searchTerm, setSearchTerm] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  
  // Demo data for KOLs - ensuring it's always an array
  const demoKols: KOL[] = [
    {
      _id: "demo1",
      displayName: "Crypto Whale",
      telegramUsername: "cryptowhale",
      description: "Leading crypto analyst and trader with 5+ years experience",
      tags: ["crypto", "trading", "analysis"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalPosts: 152,
        totalViews: 1250000,
        totalForwards: 8500,
        lastUpdated: new Date().toISOString()
      }
    },
    {
      _id: "demo2",
      displayName: "DeFi Expert",
      telegramUsername: "defiexpert",
      description: "Decentralized finance specialist and yield farming expert",
      tags: ["defi", "yield", "protocols"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalPosts: 87,
        totalViews: 750000,
        totalForwards: 4200,
        lastUpdated: new Date().toISOString()
      }
    },
    {
      _id: "demo3",
      displayName: "NFT Collector",
      telegramUsername: "nftcollector",
      description: "NFT market analysis and trend prediction specialist",
      tags: ["nft", "collectibles", "art"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalPosts: 64,
        totalViews: 420000,
        totalForwards: 2100,
        lastUpdated: new Date().toISOString()
      }
    }
  ];

  // Demo posts
  const demoPosts: UserPost[] = [
    {
      message_id: 1001,
      text: "🚀 New gem alert! $PEPE showing strong momentum with 50M volume in the last hour. This could be the next 100x! Entry: $0.00001, Target: $0.0001",
      date: new Date().toISOString(),
      views: 45000,
      forwards: 1200,
      channel_id: 123456789,
      channel_title: "crypto_channel"
    },
    {
      message_id: 1002,
      text: "📈 Market update: BTC holding strong above $65K. Expecting a breakout to $70K soon. Alt season incoming? Time to accumulate quality altcoins.",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      views: 38000,
      forwards: 950,
      channel_id: 123456789,
      channel_title: "crypto_channel"
    },
    {
      message_id: 1003,
      text: "⚡ Quick scalp opportunity: $WOJAK forming a perfect cup and handle pattern. Entry: $0.0001, Target: $0.0003, Stop: $0.00008",
      date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      views: 32000,
      forwards: 780,
      channel_id: 123456789,
      channel_title: "crypto_channel"
    }
  ];

  // Demo AI analysis
  const demoAnalysis: AIAnalysis = {
    overview: "This KOL demonstrates strong engagement metrics with consistent growth in followers and post reach. Their content focuses primarily on cryptocurrency market analysis with an emphasis on altcoin opportunities and technical analysis.",
    sentiment: {
      label: "Positive",
      score: 0.75,
      confidence: 0.88
    },
    engagement: {
      rate: 8.2,
      trend: "increasing",
      avgViews: 42000,
      avgForwards: 950
    },
    influence: {
      score: 82,
      level: "High",
      marketImpact: "Significant"
    },
    topics: [
      { name: "Altcoins", frequency: 45, sentiment: 0.7 },
      { name: "Bitcoin", frequency: 30, sentiment: 0.8 },
      { name: "Trading", frequency: 15, sentiment: 0.6 },
      { name: "DeFi", frequency: 10, sentiment: 0.5 }
    ],
    riskAssessment: {
      level: "Medium",
      score: 60,
      factors: ["Occasional promotional content", "Some unverified claims"],
      recommendations: ["Verify all trading calls independently", "Monitor for potential conflicts of interest"]
    },
    insights: ["Strong technical analysis skills", "High community engagement", "Consistent posting schedule"]
  };

  // States with properly initialized data
  const [kols, setKols] = useState<KOL[]>(demoKols);
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(demoKols[0]);
  const [userPosts, setUserPosts] = useState<UserPost[]>(demoPosts);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>(demoAnalysis);

  // Initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setIsLoading(true);
        
        // Try to load KOLs from API
        const apiKols = await apiService.getKOLs();
        
        // If API returns data, use it; otherwise use demo data
        if (Array.isArray(apiKols) && apiKols.length > 0) {
          setKols(apiKols);
          setSelectedKOL(apiKols[0]);
        } else {
          // Use demo data - already set in state initialization
          console.log('Using demo data for KOLs');
        }
        
        // Simulate loading time
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Failed to initialize KOLAnalyzer:', error);
        setIsLoading(false);
        // Demo data is already set, no need to do anything
      }
    };
    
    initializeComponent();
  }, []);

  // Safe filtered KOLs with proper error handling
  const filteredKOLs = React.useMemo(() => {
    try {
      // Ensure kols is always an array
      const safeKols = Array.isArray(kols) ? kols : demoKols;
      
      if (!searchTerm) return safeKols;
      
      const searchLower = searchTerm.toLowerCase();
      return safeKols.filter(kol => {
        try {
          const displayName = kol.displayName || '';
          const username = kol.telegramUsername || '';
          return displayName.toLowerCase().includes(searchLower) || 
                 username.toLowerCase().includes(searchLower);
        } catch (error) {
          console.warn('Error filtering KOL:', kol, error);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in filteredKOLs:', error);
      return demoKols;
    }
  }, [kols, searchTerm]);

  // Handle KOL selection
  const handleSelectKOL = (kol: KOL) => {
    try {
      setSelectedKOL(kol);
      // In a real app, this would fetch posts for the selected KOL
      // For now, we'll just use the demo posts
    } catch (error) {
      console.error('Error selecting KOL:', error);
    }
  };

  // If there's an error, show a simple UI
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">We're having trouble loading the KOL Analyzer</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:space-x-8">
          {/* Left Panel */}
          <div className="lg:w-1/3 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KOL Analyzer
              </h1>
              <p className="text-gray-600 text-sm mt-1">Analyze and track Key Opinion Leaders</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search KOLs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* KOL List */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">KOLs ({filteredKOLs.length})</h2>
              
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-blue-500" size={24} />
                  </div>
                ) : filteredKOLs.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <Users size={32} className="mx-auto mb-3 text-gray-400" />
                    <p>No KOLs found</p>
                    <p className="text-sm mt-1">Try adjusting your search</p>
                  </div>
                ) : (
                  filteredKOLs.map(kol => (
                    <div
                      key={kol._id || kol.telegramUsername}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedKOL?.telegramUsername === kol.telegramUsername
                          ? 'bg-blue-50 border-blue-200 shadow-sm'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                      onClick={() => handleSelectKOL(kol)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{kol.displayName}</h3>
                          <p className="text-sm text-gray-500">@{kol.telegramUsername}</p>
                        </div>
                        {kol.stats && (
                          <div className="text-right text-sm text-gray-500">
                            <p className="font-medium">{kol.stats.totalPosts} posts</p>
                            <p>{(kol.stats.totalViews / 1000).toFixed(0)}K views</p>
                          </div>
                        )}
                      </div>
                      {kol.tags && kol.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {kol.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {kol.tags.length > 3 && (
                            <span className="text-xs text-gray-500">+{kol.tags.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:w-2/3 mt-6 lg:mt-0">
            <div className="bg-white rounded-lg shadow-sm h-full min-h-[600px]">
              {selectedKOL ? (
                <div className="h-full flex flex-col">
                  {/* KOL Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">{selectedKOL.displayName}</h2>
                        <div className="flex items-center space-x-2 text-gray-500 mt-2">
                          <Link size={16} />
                          <a
                            href={`https://t.me/${selectedKOL.telegramUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-500 transition-colors"
                          >
                            @{selectedKOL.telegramUsername}
                          </a>
                        </div>
                        {selectedKOL.description && (
                          <p className="mt-3 text-gray-600 leading-relaxed">{selectedKOL.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 ml-4">
                        {selectedKOL.stats && (
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xl font-bold text-gray-900">{selectedKOL.stats.totalPosts}</p>
                              <p className="text-sm text-gray-500">Posts</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xl font-bold text-gray-900">{(selectedKOL.stats.totalViews / 1000).toFixed(0)}K</p>
                              <p className="text-sm text-gray-500">Views</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xl font-bold text-gray-900">{(selectedKOL.stats.totalForwards / 1000).toFixed(1)}K</p>
                              <p className="text-sm text-gray-500">Forwards</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedKOL.tags && selectedKOL.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {selectedKOL.tags.map(tag => (
                          <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tabs */}
                  <div className="px-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActiveTab('posts')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'posts'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <MessageCircle size={16} />
                          <span>Posts ({userPosts.length})</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('analysis')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === 'analysis'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Brain size={16} />
                          <span>AI Analysis</span>
                          <CheckCircle size={16} className="text-green-500" />
                        </div>
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'posts' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-gray-900">Recent Posts</h3>
                          <span className="text-sm text-gray-500">Last 24 hours</span>
                        </div>
                        {isLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="animate-spin text-blue-500" size={32} />
                          </div>
                        ) : userPosts.length === 0 ? (
                          <div className="text-center text-gray-500 py-12">
                            <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-lg font-medium">No posts found</p>
                            <p className="text-sm mt-1">This KOL hasn't posted recently</p>
                          </div>
                        ) : (
                          userPosts.map(post => (
                            <div key={post.message_id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.text || 'No content'}</p>
                                  <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Clock size={14} className="mr-1" />
                                      {post.date ? new Date(post.date).toLocaleTimeString() : 'Unknown time'}
                                    </span>
                                    {post.views !== null && post.views !== undefined && (
                                      <span className="flex items-center">
                                        <TrendingUp size={14} className="mr-1" />
                                        {post.views.toLocaleString()} views
                                      </span>
                                    )}
                                    {post.forwards !== null && post.forwards !== undefined && (
                                      <span className="flex items-center">
                                        <MessageCircle size={14} className="mr-1" />
                                        {post.forwards.toLocaleString()} forwards
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'analysis' && aiAnalysis && (
                      <div className="space-y-6">
                        {/* Performance Summary */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                            Performance Summary
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {aiAnalysis.overview}
                          </p>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Sentiment</p>
                                <p className={`text-lg font-semibold ${
                                  aiAnalysis.sentiment.score > 0.2 ? 'text-green-600' : 
                                  aiAnalysis.sentiment.score < -0.2 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {aiAnalysis.sentiment.label}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Score: {aiAnalysis.sentiment.score.toFixed(2)}
                                </p>
                              </div>
                              <div className={`p-2 rounded-full ${
                                aiAnalysis.sentiment.score > 0.2 ? 'bg-green-100' : 
                                aiAnalysis.sentiment.score < -0.2 ? 'bg-red-100' : 'bg-gray-100'
                              }`}>
                                {aiAnalysis.sentiment.score > 0.2 ? 
                                  <TrendingUp className="h-5 w-5 text-green-600" /> :
                                  aiAnalysis.sentiment.score < -0.2 ?
                                  <TrendingUp className="h-5 w-5 text-red-600 rotate-180" /> :
                                  <BarChart3 className="h-5 w-5 text-gray-600" />
                                }
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Engagement Rate</p>
                                <p className="text-lg font-semibold text-blue-600">
                                  {aiAnalysis.engagement.rate.toFixed(1)}%
                                </p>
                                <p className="text-xs text-gray-400 capitalize">
                                  {aiAnalysis.engagement.trend}
                                </p>
                              </div>
                              <div className="p-2 rounded-full bg-blue-100">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Influence Score</p>
                                <p className="text-lg font-semibold text-purple-600">
                                  {aiAnalysis.influence.score.toFixed(0)}/100
                                </p>
                                <p className="text-xs text-gray-400">
                                  {aiAnalysis.influence.level}
                                </p>
                              </div>
                              <div className="p-2 rounded-full bg-purple-100">
                                <Zap className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Topics */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Topics</h3>
                          <div className="space-y-3">
                            {aiAnalysis.topics.map((topic, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                                <div className="flex items-center space-x-3">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                      style={{ width: `${topic.frequency}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-500 w-12 text-right">
                                    {topic.frequency}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Risk Assessment */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                          <div className="flex items-center space-x-3 mb-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              aiAnalysis.riskAssessment.level === 'Low' ? 'bg-green-100 text-green-700' :
                              aiAnalysis.riskAssessment.level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {aiAnalysis.riskAssessment.level} Risk
                            </span>
                          </div>
                          <ul className="space-y-2">
                            {aiAnalysis.riskAssessment.factors.map((factor, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <AlertTriangle size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Users size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Select a KOL to analyze</h3>
                    <p>Choose a KOL from the list to view their posts and analysis</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}