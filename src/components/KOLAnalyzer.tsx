import React, { useState, useEffect } from 'react';
import { Search, Users, MessageCircle, TrendingUp, BarChart3, Brain, Clock, Link, Zap, AlertTriangle, Plus, Loader, Eye, Share, Activity, Wifi, WifiOff } from 'lucide-react';
import { TypewriterText } from './TypewriterText';

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
  channel_id?: number;
  channel_title?: string;
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

interface TelegramStatus {
  connected: boolean;
  lastCheck: string;
  uptime?: string;
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
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus>({
    connected: false,
    lastCheck: new Date().toISOString()
  });
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial KOLs and check Telegram status
  useEffect(() => {
    loadKOLs();
    checkTelegramStatus();
    
    // Check Telegram status every 30 seconds
    const statusInterval = setInterval(checkTelegramStatus, 30000);
    return () => clearInterval(statusInterval);
  }, []);

  const checkTelegramStatus = async () => {
    try {
      const response = await fetch('/api/telegram-status');
      if (response.ok) {
        const status = await response.json();
        setTelegramStatus({
          connected: true,
          lastCheck: new Date().toISOString(),
          uptime: status.uptime
        });
      } else {
        setTelegramStatus({
          connected: false,
          lastCheck: new Date().toISOString()
        });
      }
    } catch (error) {
      setTelegramStatus({
        connected: false,
        lastCheck: new Date().toISOString()
      });
    }
  };

  const loadKOLs = async () => {
    try {
      setError(null);
      const response = await fetch('/api/kols');
      const data = await response.json();
      
      // Transform data to match expected format
      const transformedKOLs = Array.isArray(data) ? data.map(kol => ({
        id: kol._id || kol.id || `kol_${Date.now()}_${Math.random()}`,
        name: kol.displayName || kol.name || kol.telegramUsername,
        username: kol.telegramUsername || kol.username,
        description: kol.description || 'No description available',
        tags: kol.tags || [],
      stats: {
          posts: kol.stats?.totalPosts || 0,
          views: kol.stats?.totalViews || 0,
          forwards: kol.stats?.totalForwards || 0
        },
        discoveredFrom: kol.discoveredFrom
      })) : [];
      
      setKols(transformedKOLs);
    } catch (error) {
      console.error('Error loading KOLs:', error);
      setError('Failed to load KOLs');
      setKols([]);
    }
  };

  const addManualKOL = async () => {
    if (!manualUsername.trim()) return;
    
    setLoading(true);
    setError(null);
    
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
      const response = await fetch('/api/kols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: manualUsername,
          telegramUsername: manualUsername.replace('@', ''),
          description: 'Manually added KOL',
          tags: ['Manual']
        })
      });

      if (response.ok) {
        const newKOLData = await response.json();
        const newKOL: KOL = {
          id: newKOLData._id || `manual_${Date.now()}`,
          name: newKOLData.displayName || manualUsername,
          username: newKOLData.telegramUsername || manualUsername,
          description: newKOLData.description || 'Manually added KOL',
          tags: newKOLData.tags || ['Manual'],
          stats: newKOLData.stats || { posts: 0, views: 0, forwards: 0 }
        };

        setKols(prev => [newKOL, ...prev]);
        setSelectedKOL(newKOL);
        await loadPostsForKOL(newKOL.username);
        setManualUsername('');
      } else {
        throw new Error('Failed to create KOL');
      }
    } catch (error) {
      console.error('Error adding manual KOL:', error);
      setError('Failed to add KOL');
    } finally {
      setLoading(false);
    }
  };

  const scanGroupForKOLs = async () => {
    if (!groupName.trim()) return;
    
    setGroupScanLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/groups/${encodeURIComponent(groupName)}/kols`);
      const data = await response.json();
      
      if (data.success && data.kols.length > 0) {
        const newKOLs = data.kols.map((kol: any) => ({
          id: `group_${kol.user_id || Date.now()}_${Math.random()}`,
          name: kol.first_name || kol.username,
          username: kol.username,
          description: `KOL discovered from ${groupName}${kol.is_admin ? ' (Admin)' : ''}`,
          tags: ['Group Scan', groupName, ...(kol.is_admin ? ['Admin'] : [])],
          stats: { posts: 0, views: 0, forwards: 0 },
          discoveredFrom: groupName
        }));
        
        setKols(prev => [...newKOLs, ...prev]);
        setGroupName('');
        setError(null);
      } else {
        setError(data.message || 'No KOLs found in this group');
      }
    } catch (error) {
      console.error('Error scanning group:', error);
      setError('Error scanning group. Make sure the Telethon service is running.');
    } finally {
      setGroupScanLoading(false);
    }
  };

  const loadPostsForKOL = async (username: string) => {
    setFetchingPosts(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/kols/${encodeURIComponent(username)}/posts?limit=20`);
      const data = await response.json();

      // Transform posts data
      const transformedPosts = Array.isArray(data) ? data.map(post => ({
        id: post.id || post.message_id || `post_${Date.now()}_${Math.random()}`,
        text: post.text || 'No content',
        date: post.date || new Date().toISOString(),
        views: post.views || 0,
        forwards: post.forwards || 0,
        username: post.username || username,
        source: post.source || 'telegram',
        channel_id: post.channel_id,
        channel_title: post.channel_title
      })) : [];
      
      setPosts(transformedPosts);
      setAnalysis(null); // Clear previous analysis
      
      // Auto-update KOL stats
      if (transformedPosts.length > 0) {
        const totalViews = transformedPosts.reduce((sum, post) => sum + post.views, 0);
        const totalForwards = transformedPosts.reduce((sum, post) => sum + post.forwards, 0);
        
        setKols(prev => prev.map(kol => 
          kol.username === username 
            ? {
                ...kol,
                stats: {
                  posts: transformedPosts.length,
                  views: totalViews,
                  forwards: totalForwards
                }
              }
            : kol
        ));
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
      setPosts([]);
    } finally {
      setFetchingPosts(false);
    }
  };

  const performAIAnalysis = async () => {
    if (!selectedKOL || posts.length === 0) return;
    
    setAnalysisLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/kols/${encodeURIComponent(selectedKOL.username)}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          posts: posts.map(post => ({
            id: post.id,
            text: post.text,
            date: post.date,
            views: post.views,
            forwards: post.forwards
          })), 
          analysisType: 'comprehensive' 
        })
      });
      
      if (response.ok) {
        const analysisData = await response.json();
        setAnalysis(analysisData);
        setActiveTab('analysis');
      } else {
        throw new Error('Analysis failed');
        }
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      setError('Failed to perform AI analysis');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const selectKOL = async (kol: KOL) => {
    setSelectedKOL(kol);
    await loadPostsForKOL(kol.username);
  };

  const refreshPosts = async () => {
    if (selectedKOL) {
      await loadPostsForKOL(selectedKOL.username);
    }
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
      if (diffHours < 24 * 7) return `${Math.floor(diffHours / 24)}d ago`;
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
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
              <TypewriterText text="KOL Analyzer" />
              </h1>
            <p className="text-gray-400 text-lg">
              Advanced analytics and insights for Key Opinion Leaders
            </p>
            </div>

          {/* Search Input */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Enter KOL username or channel URL..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-300 placeholder-gray-500 transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              
              <button 
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300 text-sm font-medium flex items-center justify-center space-x-2 min-w-[140px]"
              >
                <Search size={16} />
                <span>Analyze KOL</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[
              { icon: Users, label: 'Total Followers', value: '2.5M', color: 'blue' },
              { icon: MessageCircle, label: 'Engagement Rate', value: '8.2%', color: 'purple' },
              { icon: TrendingUp, label: 'Growth Rate', value: '+12.5%', color: 'pink' },
              { icon: Activity, label: 'Activity Score', value: '92', color: 'indigo' }
            ].map((stat, index) => (
              <div key={index} className="group relative bg-gray-900/50 backdrop-blur-xl p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-${stat.color}-500/10 via-${stat.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-4 group-hover:scale-110 transition-transform duration-300`} />
                  <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                  <p className="text-2xl font-bold mt-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{stat.value}</p>
                        </div>
                      </div>
            ))}
                            </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Engagement Metrics */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                Engagement Metrics
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Likes per Post', value: '15.2K', change: '+5.2%' },
                  { label: 'Comments per Post', value: '2.8K', change: '+3.1%' },
                  { label: 'Shares per Post', value: '4.5K', change: '+7.8%' }
                ].map((metric, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-400">{metric.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-200 font-medium">{metric.value}</span>
                      <span className="text-emerald-400 text-sm">{metric.change}</span>
                    </div>
                  </div>
                ))}
                            </div>
                          </div>

            {/* Audience Demographics */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                Audience Demographics
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Age Range', value: '18-34 (65%)', secondary: '35-54 (35%)' },
                  { label: 'Gender', value: 'Male (58%)', secondary: 'Female (42%)' },
                  { label: 'Top Locations', value: 'US (40%)', secondary: 'UK (25%), CA (15%)' }
                ].map((demo, index) => (
                  <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                      <span className="text-gray-400">{demo.label}</span>
                      <span className="text-gray-200">{demo.value}</span>
                              </div>
                    <div className="text-sm text-gray-500 text-right">{demo.secondary}</div>
                              </div>
                ))}
                            </div>
                          </div>

            {/* Content Analysis */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-400 mb-4">
                Content Analysis
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Post Frequency', value: '2.5 posts/day', trend: 'Consistent' },
                  { label: 'Best Posting Time', value: '3 PM - 6 PM', trend: 'Peak engagement' },
                  { label: 'Content Type', value: 'Video (60%)', trend: 'Photos (40%)' }
                ].map((content, index) => (
                  <div key={index} className="space-y-1">
                            <div className="flex items-center justify-between">
                      <span className="text-gray-400">{content.label}</span>
                      <span className="text-gray-200">{content.value}</span>
                              </div>
                    <div className="text-sm text-gray-500 text-right">{content.trend}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

          {/* Recent Activity */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  { type: 'post', title: 'New Product Launch', engagement: '25.6K likes', time: '2 hours ago' },
                  { type: 'story', title: 'Behind the Scenes', engagement: '15.2K views', time: '5 hours ago' },
                  { type: 'live', title: 'Q&A Session', engagement: '8.9K viewers', time: '1 day ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-800 rounded-lg">
                        {activity.type === 'post' ? <MessageCircle size={20} className="text-blue-400" /> :
                         activity.type === 'story' ? <Clock size={20} className="text-purple-400" /> :
                         <Wifi size={20} className="text-pink-400" />}
                      </div>
                      <div>
                        <h4 className="text-gray-200 font-medium">{activity.title}</h4>
                        <p className="text-gray-500 text-sm">{activity.time}</p>
                  </div>
                </div>
                    <span className="text-gray-400">{activity.engagement}</span>
                  </div>
                ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}