import React, { useState, useEffect } from 'react';
import { Search, Users, MessageCircle, TrendingUp, BarChart3, Brain, Clock, Link, Zap, AlertTriangle, Plus, Loader, Eye, Share } from 'lucide-react';

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
  discoveredFrom?: string;
}

interface Post {
  id: string;
  text: string;
  date: string;
  views: number;
  forwards: number;
  username: string;
  source?: string;
}

interface Analysis {
  username: string;
  sentiment: string;
  sentimentScore: number;
  engagement: number;
  influence: number;
  topics: Array<{ name: string; percentage: number }>;
  riskLevel: string;
  metrics: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
    avgViews: number;
    avgForwards: number;
    engagementRate: number;
  };
  generatedAt: string;
}

export default function KOLAnalyzer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'analysis'>('posts');
  const [kols, setKols] = useState<KOL[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [groupScanLoading, setGroupScanLoading] = useState(false);

  // Load initial KOLs
  useEffect(() => {
    loadKOLs();
  }, []);

  const loadKOLs = async () => {
    try {
      const response = await fetch('/api/kols');
      const data = await response.json();
      setKols(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading KOLs:', error);
      setKols([]);
    }
  };

  const addManualKOL = async () => {
    if (!manualUsername.trim()) return;
    
    setLoading(true);
    try {
      // Check if KOL already exists
      const existingKOL = kols.find(k => k.username.toLowerCase() === manualUsername.toLowerCase());
      if (existingKOL) {
        setSelectedKOL(existingKOL);
        await loadPostsForKOL(existingKOL.username);
        setManualUsername('');
        return;
      }

      // Create new KOL entry
      const newKOL: KOL = {
        id: `manual_${Date.now()}`,
        name: manualUsername,
        username: manualUsername,
        description: 'Manually added KOL',
        tags: ['Manual'],
        stats: { posts: 0, views: 0, forwards: 0 }
      };

      // Add to backend
      await fetch('/api/kols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramUsername: newKOL.username,
          name: newKOL.name,
          description: newKOL.description,
          tags: newKOL.tags
        })
      });

      setKols(prev => [newKOL, ...prev]);
      setSelectedKOL(newKOL);
      await loadPostsForKOL(newKOL.username);
      setManualUsername('');
    } catch (error) {
      console.error('Error adding manual KOL:', error);
    } finally {
      setLoading(false);
    }
  };

  const scanGroupForKOLs = async () => {
    if (!groupName.trim()) return;
    
    setGroupScanLoading(true);
    try {
      const response = await fetch(`/api/groups/${encodeURIComponent(groupName)}/kols`);
      const data = await response.json();
      
      if (data.success && data.kols.length > 0) {
        const newKOLs = data.kols.map((kol: any) => ({
          id: `group_${kol.id || Date.now()}_${Math.random()}`,
          name: kol.name || kol.username,
          username: kol.username,
          description: `Discovered from ${groupName}`,
          tags: ['Group Scan', groupName],
          stats: kol.stats || { posts: 0, views: 0, forwards: 0 },
          discoveredFrom: groupName
        }));
        
        setKols(prev => [...newKOLs, ...prev]);
        setGroupName('');
      } else {
        alert(data.message || 'No KOLs found in this group');
      }
    } catch (error) {
      console.error('Error scanning group:', error);
      alert('Error scanning group. Make sure the Telethon service is running.');
    } finally {
      setGroupScanLoading(false);
    }
  };

  const loadPostsForKOL = async (username: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/kols/${username}/posts?limit=20`);
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
      setAnalysis(null); // Clear previous analysis
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const performAIAnalysis = async () => {
    if (!selectedKOL || posts.length === 0) return;
    
    setAnalysisLoading(true);
    try {
      const response = await fetch(`/api/kols/${selectedKOL.username}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posts, analysisType: 'full' })
      });
      
      const analysisData = await response.json();
      setAnalysis(analysisData);
      setActiveTab('analysis');
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      alert('Error performing AI analysis');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const selectKOL = async (kol: KOL) => {
    setSelectedKOL(kol);
    await loadPostsForKOL(kol.username);
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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - KOL Management */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">KOL Analyzer</h1>
              <p className="text-gray-600 text-sm mb-6">Analyze Key Opinion Leaders</p>
              
              {/* Manual KOL Addition */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Add KOL Manually</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter username..."
                    value={manualUsername}
                    onChange={(e) => setManualUsername(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addManualKOL()}
                  />
                  <button
                    onClick={addManualKOL}
                    disabled={loading || !manualUsername.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader className="animate-spin" size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              </div>

              {/* Group Scanning */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Scan Telegram Group</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Group name or username..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && scanGroupForKOLs()}
                  />
                  <button
                    onClick={scanGroupForKOLs}
                    disabled={groupScanLoading || !groupName.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {groupScanLoading ? <Loader className="animate-spin" size={16} /> : <Search size={16} />}
                  </button>
                </div>
              </div>

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
                <div className="max-h-96 overflow-y-auto">
                  {filteredKOLs.length > 0 ? (
                    filteredKOLs.map(kol => (
                      <div
                        key={kol.id}
                        onClick={() => selectKOL(kol)}
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
                            {kol.discoveredFrom && (
                              <p className="text-xs text-blue-600">From: {kol.discoveredFrom}</p>
                            )}
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
                      <p className="text-sm">Add a username or scan a group</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Posts & Analysis */}
          <div className="lg:col-span-2">
            {selectedKOL ? (
              <div className="bg-white rounded-lg shadow-sm">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedKOL.name}</h2>
                      <p className="text-gray-600">@{selectedKOL.username}</p>
                      <p className="text-sm text-gray-500 mt-1">{selectedKOL.description}</p>
                    </div>
                    <button
                      onClick={performAIAnalysis}
                      disabled={analysisLoading || posts.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {analysisLoading ? (
                        <Loader className="animate-spin" size={16} />
                      ) : (
                        <Brain size={16} />
                      )}
                      AI Analysis
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('posts')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'posts'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <MessageCircle size={16} className="inline mr-2" />
                      Posts ({posts.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('analysis')}
                      className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'analysis'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <BarChart3 size={16} className="inline mr-2" />
                      Analysis {analysis && '✓'}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {activeTab === 'posts' ? (
                    <div>
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader className="animate-spin mr-2" size={24} />
                          <span>Loading posts...</span>
                        </div>
                      ) : posts.length > 0 ? (
                        <div className="space-y-4">
                          {posts.map(post => (
                            <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <Clock size={14} />
                                  {formatDate(post.date)}
                                  {post.source === 'mock' && (
                                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Demo</span>
                                  )}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Eye size={14} />
                                    {formatNumber(post.views)}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Share size={14} />
                                    {formatNumber(post.forwards)}
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-900 leading-relaxed">{post.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <MessageCircle size={48} className="mx-auto mb-4" />
                          <p className="text-lg">No posts found</p>
                          <p className="text-sm">This KOL doesn't have any recent posts</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {analysis ? (
                        <div className="space-y-6">
                          {/* Analysis Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Sentiment</span>
                                <TrendingUp size={16} className="text-gray-400" />
                              </div>
                              <div className={`text-sm px-2 py-1 rounded inline-block ${getSentimentColor(analysis.sentiment)}`}>
                                {analysis.sentiment} ({Math.round(analysis.sentimentScore * 100)}%)
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Influence Score</span>
                                <Zap size={16} className="text-gray-400" />
                              </div>
                              <div className="text-2xl font-bold text-blue-600">{analysis.influence}/100</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Risk Level</span>
                                <AlertTriangle size={16} className="text-gray-400" />
                              </div>
                              <div className={`text-sm px-2 py-1 rounded inline-block ${getRiskColor(analysis.riskLevel)}`}>
                                {analysis.riskLevel}
                              </div>
                            </div>
                          </div>

                          {/* Metrics */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{analysis.metrics.totalPosts}</div>
                                <div className="text-sm text-gray-600">Total Posts</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{formatNumber(analysis.metrics.totalViews)}</div>
                                <div className="text-sm text-gray-600">Total Views</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{formatNumber(analysis.metrics.avgViews)}</div>
                                <div className="text-sm text-gray-600">Avg Views/Post</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{analysis.metrics.engagementRate}%</div>
                                <div className="text-sm text-gray-600">Engagement Rate</div>
                              </div>
                            </div>
                          </div>

                          {/* Topics */}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Topics</h3>
                            <div className="space-y-3">
                              {analysis.topics.map(topic => (
                                <div key={topic.name} className="flex items-center">
                                  <div className="w-24 text-sm text-gray-600">{topic.name}</div>
                                  <div className="flex-1 mx-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${topic.percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <div className="w-12 text-sm text-gray-600 text-right">{topic.percentage}%</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 border-t pt-4">
                            Analysis generated on {formatDate(analysis.generatedAt)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Brain size={48} className="mx-auto mb-4" />
                          <p className="text-lg">No analysis available</p>
                          <p className="text-sm">Click "AI Analysis" to analyze this KOL's posts</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Users size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a KOL to Analyze</h3>
                <p className="text-gray-600">Choose a KOL from the list, add one manually, or scan a Telegram group to get started</p>
              </div>
            )}
          </div>
                            </div>
        </div>
      </div>
    );
  } 