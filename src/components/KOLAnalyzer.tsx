import React, { useState } from 'react';
import { Search, Users, MessageCircle, TrendingUp, BarChart3, Brain, Clock, Link, Zap, AlertTriangle } from 'lucide-react';

interface KOL {
  id: string;
  name: string;
  username: string;
  description: string;
  tags: string[];
  stats: {
    posts: number;
    views: number;
    forwards: number;
  };
}

interface Post {
  id: string;
  text: string;
  date: string;
  views: number;
  forwards: number;
}

interface Analysis {
  sentiment: string;
  sentimentScore: number;
  engagement: number;
  influence: number;
  topics: Array<{ name: string; percentage: number }>;
  riskLevel: string;
}

export default function KOLAnalyzer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'analysis'>('posts');

  // Demo data - ensuring arrays are always defined
  const kols: KOL[] = [
    {
      id: '1',
      name: 'Crypto Whale',
      username: 'cryptowhale',
      description: 'Professional crypto analyst with 5+ years of experience in market analysis and trading strategies.',
      tags: ['Crypto', 'Trading', 'Analysis'],
      stats: { posts: 150, views: 125000, forwards: 8500 }
    },
    {
      id: '2',
      name: 'DeFi Expert',
      username: 'defiexpert',
      description: 'Decentralized finance specialist focusing on yield farming and protocol analysis.',
      tags: ['DeFi', 'Yield', 'Protocols'],
      stats: { posts: 89, views: 75000, forwards: 4200 }
    },
    {
      id: '3',
      name: 'NFT Collector',
      username: 'nftcollector',
      description: 'NFT market analysis and trend prediction specialist with insider knowledge.',
      tags: ['NFT', 'Art', 'Collectibles'],
      stats: { posts: 64, views: 42000, forwards: 2100 }
    },
    {
      id: '4',
      name: 'Chain Analyst',
      username: 'chainanalyst',
      description: 'On-chain data analysis expert providing insights into whale movements.',
      tags: ['OnChain', 'Analytics', 'Data'],
      stats: { posts: 112, views: 98000, forwards: 6300 }
    }
  ];

  const posts: Post[] = [
    {
      id: '1',
      text: '🚀 New gem alert! $PEPE showing strong momentum with 50M volume in the last hour. This could be the next 100x! Entry: $0.00001, Target: $0.0001',
      date: new Date().toISOString(),
      views: 45000,
      forwards: 1200
    },
    {
      id: '2',
      text: '📈 Market update: BTC holding strong above $65K. Expecting a breakout to $70K soon. Alt season incoming? Time to accumulate quality altcoins.',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      views: 38000,
      forwards: 950
    },
    {
      id: '3',
      text: '⚡ Quick scalp opportunity: $WOJAK forming a perfect cup and handle pattern. Entry: $0.0001, Target: $0.0003, Stop: $0.00008',
      date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      views: 32000,
      forwards: 780
    }
  ];

  const analysis: Analysis = {
    sentiment: 'Positive',
    sentimentScore: 0.75,
    engagement: 8.2,
    influence: 82,
    topics: [
      { name: 'Altcoins', percentage: 45 },
      { name: 'Bitcoin', percentage: 30 },
      { name: 'Trading', percentage: 15 },
      { name: 'DeFi', percentage: 10 }
    ],
    riskLevel: 'Medium'
  };

  // Safe filtering with array validation
  const filteredKOLs = Array.isArray(kols) ? kols.filter(kol =>
    kol && kol.name && kol.username &&
    (kol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     kol.username.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  const formatNumber = (num: number): string => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - KOL List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">KOL Analyzer</h1>
              <p className="text-gray-600 text-sm mb-6">Analyze Key Opinion Leaders</p>
              
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search KOLs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* KOL List */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">KOLs ({filteredKOLs.length})</h3>
                {filteredKOLs.length > 0 ? (
                  filteredKOLs.map(kol => (
                    <div
                      key={kol.id}
                      onClick={() => setSelectedKOL(kol)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedKOL?.id === kol.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{kol.name}</h4>
                          <p className="text-sm text-gray-500">@{kol.username}</p>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <div>{kol.stats?.posts || 0} posts</div>
                          <div>{formatNumber(kol.stats?.views || 0)} views</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(kol.tags) && kol.tags.map(tag => (
                          <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={32} className="mx-auto mb-2" />
                    <p>No KOLs found</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {selectedKOL ? (
                <>
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedKOL.name}</h2>
                        <div className="flex items-center mt-2 text-gray-500">
                          <Link size={16} className="mr-2" />
                          <span>@{selectedKOL.username}</span>
                        </div>
                        <p className="text-gray-600 mt-3">{selectedKOL.description}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xl font-bold text-gray-900">{selectedKOL.stats?.posts || 0}</div>
                          <div className="text-sm text-gray-500">Posts</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xl font-bold text-gray-900">{formatNumber(selectedKOL.stats?.views || 0)}</div>
                          <div className="text-sm text-gray-500">Views</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xl font-bold text-gray-900">{formatNumber(selectedKOL.stats?.forwards || 0)}</div>
                          <div className="text-sm text-gray-500">Forwards</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {Array.isArray(selectedKOL.tags) && selectedKOL.tags.map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="px-6 border-b border-gray-200">
                    <div className="flex space-x-8">
                      <button
                        onClick={() => setActiveTab('posts')}
                        className={`py-3 border-b-2 font-medium text-sm ${
                          activeTab === 'posts'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <MessageCircle size={16} />
                          <span>Posts ({Array.isArray(posts) ? posts.length : 0})</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('analysis')}
                        className={`py-3 border-b-2 font-medium text-sm ${
                          activeTab === 'analysis'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Brain size={16} />
                          <span>AI Analysis</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === 'posts' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Posts</h3>
                        {Array.isArray(posts) && posts.length > 0 ? (
                          posts.map(post => (
                            <div key={post.id} className="bg-gray-50 rounded-lg p-4 border">
                              <p className="text-gray-800 mb-3">{post.text}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Clock size={14} className="mr-1" />
                                  {formatDate(post.date)}
                                </div>
                                <div className="flex items-center">
                                  <TrendingUp size={14} className="mr-1" />
                                  {formatNumber(post.views)} views
                                </div>
                                <div className="flex items-center">
                                  <MessageCircle size={14} className="mr-1" />
                                  {formatNumber(post.forwards)} forwards
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <MessageCircle size={32} className="mx-auto mb-2" />
                            <p>No posts available</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'analysis' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">AI Analysis</h3>
                        
                        {/* Overview */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-gray-900 mb-2">Performance Summary</h4>
                          <p className="text-gray-700">
                            This KOL demonstrates strong engagement metrics with consistent growth in followers and post reach. 
                            Their content focuses primarily on cryptocurrency market analysis with emphasis on altcoin opportunities.
                          </p>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Sentiment</p>
                                <p className="text-lg font-semibold text-green-600">{analysis.sentiment}</p>
                                <p className="text-xs text-gray-400">Score: {analysis.sentimentScore?.toFixed(2) || '0.00'}</p>
                              </div>
                              <div className="p-2 bg-green-100 rounded-full">
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Engagement Rate</p>
                                <p className="text-lg font-semibold text-blue-600">{analysis.engagement || 0}%</p>
                                <p className="text-xs text-gray-400">Increasing</p>
                              </div>
                              <div className="p-2 bg-blue-100 rounded-full">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-lg border">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">Influence Score</p>
                                <p className="text-lg font-semibold text-purple-600">{analysis.influence || 0}/100</p>
                                <p className="text-xs text-gray-400">High</p>
                              </div>
                              <div className="p-2 bg-purple-100 rounded-full">
                                <Zap className="h-5 w-5 text-purple-600" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Topics */}
                        <div className="bg-white p-6 rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-4">Primary Topics</h4>
                          <div className="space-y-3">
                            {Array.isArray(analysis.topics) && analysis.topics.length > 0 ? (
                              analysis.topics.map((topic, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-700">{topic.name}</span>
                                  <div className="flex items-center space-x-3">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full" 
                                        style={{ width: `${topic.percentage || 0}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-500 w-12 text-right">{topic.percentage || 0}%</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                <p>No topic data available</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Risk Assessment */}
                        <div className="bg-white p-6 rounded-lg border">
                          <h4 className="font-semibold text-gray-900 mb-4">Risk Assessment</h4>
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                              {analysis.riskLevel || 'Unknown'} Risk
                            </span>
                          </div>
                          <ul className="space-y-2">
                            <li className="flex items-start space-x-2">
                              <AlertTriangle size={16} className="text-yellow-500 mt-0.5" />
                              <span className="text-sm text-gray-600">Occasional promotional content</span>
                            </li>
                            <li className="flex items-start space-x-2">
                              <AlertTriangle size={16} className="text-yellow-500 mt-0.5" />
                              <span className="text-sm text-gray-600">Some unverified claims</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center">
                  <Users size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a KOL to analyze</h3>
                  <p className="text-gray-600">Choose a KOL from the list to view their posts and analysis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 