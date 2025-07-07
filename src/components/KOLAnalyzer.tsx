import React, { useState, useEffect } from 'react';
import { Search, Users, MessageCircle, TrendingUp, BarChart3, Brain, Clock, Link, Zap, AlertTriangle, Plus, Loader, Eye, Share, Activity, Wifi, WifiOff, DollarSign, LineChart } from 'lucide-react';
import { TypewriterText } from './TypewriterText';
import { telegramService } from '../services/telegramService';
import { aiAnalysisService } from '../services/aiAnalysisService';
import type { KOLAnalysisResult } from '../services/aiAnalysisService';
import { apiService } from '../services/apiService';

interface VolumeData {
  timestamp: string;
  volume: number;
  price: number;
  token_address?: string;
  chain?: string;
}

interface EnhancedPost extends Post {
  volume_data?: VolumeData;
  sentiment_score?: number;
  engagement_rate?: number;
}

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
    total_volume?: number;
    average_sentiment?: number;
    peak_engagement?: number;
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
  source: string;
  channel_id: number;
  channel_title: string;
}

interface TelegramStatus {
  connected: boolean;
  lastCheck: string;
  uptime?: number;
}

export default function KOLAnalyzer() {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'analysis'>('posts');
  const [kols, setKols] = useState<KOL[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [analysis, setAnalysis] = useState<KOLAnalysisResult | null>(null);
  const [volumeData, setVolumeData] = useState<Record<string, VolumeData[]>>({});
  const [enhancedPosts, setEnhancedPosts] = useState<EnhancedPost[]>([]);
  const [activeView, setActiveView] = useState<'posts' | 'analysis' | 'volume'>('posts');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [groupScanLoading, setGroupScanLoading] = useState(false);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [volumeLoading, setVolumeLoading] = useState(false);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  
  // Telegram service status
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus>({
    connected: false,
    lastCheck: new Date().toISOString()
  });

  // Load initial KOLs and check Telegram status
  useEffect(() => {
    loadKOLs();
    checkTelegramStatus();
    
    // Check Telegram status every 5 minutes instead of 30 seconds to reduce errors
    const statusInterval = setInterval(checkTelegramStatus, 300000);
    return () => clearInterval(statusInterval);
  }, []);

  const checkTelegramStatus = async () => {
    try {
      setTelegramError(null);
      const status = await telegramService.checkStatus();
      setTelegramStatus({
        connected: status.connected,
        lastCheck: new Date().toISOString(),
        uptime: status.uptime
      });
      
      // Only show error if we haven't shown demo mode message
      if (!status.connected && !error?.includes('Demo Mode')) {
        setTelegramError('Telegram service unavailable - using demo data');
      }
    } catch (err) {
      // Silently handle connection errors when in demo mode
      console.log('Telegram service check - using demo mode');
      setTelegramStatus({
        connected: false,
        lastCheck: new Date().toISOString()
      });
      
      if (!error?.includes('Demo Mode')) {
        setTelegramError('Telegram service unavailable - using demo data');
      }
    }
  };

  const loadKOLs = async () => {
    try {
      setError(null);
      const data = await apiService.getKOLs();
      
      // Transform data to match expected format
      const transformedKOLs = Array.isArray(data) ? data.map((kol: any) => ({
        id: kol._id || `kol_${Date.now()}_${Math.random()}`,
        name: kol.displayName || kol.telegramUsername,
        username: kol.telegramUsername,
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
      
      // Check if backend is working
      const backendStatus = apiService.getConnectionStatus();
      if (!backendStatus) {
        setError('⚠️ Backend service is starting up. Some features may use demo data temporarily.');
      }
    } catch (error) {
      console.error('Error loading KOLs:', error);
      setError('Failed to connect to backend. Please check your connection.');
      setKols([]);
    }
  };

  const addManualKOL = async () => {
    if (!manualUsername.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (!telegramStatus.connected) {
      setError('Telegram service is not available. Please try again later.');
      return;
    }
    
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

      // Scan channel/user using Telethon service
      const channelInfo = await telegramService.scanChannel(manualUsername);
      
      // Create new KOL entry
      const response = await fetch('/api/kols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: channelInfo.title || manualUsername,
          telegramUsername: channelInfo.username || manualUsername.replace('@', ''),
          description: channelInfo.description || 'Telegram KOL',
          tags: ['Telegram'],
      stats: {
            totalPosts: 0,
            totalViews: channelInfo.member_count || 0,
            totalForwards: 0
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create KOL');
      }

      const newKOLData = await response.json();
      const newKOL: KOL = {
        id: newKOLData._id || `manual_${Date.now()}`,
        name: channelInfo.title || manualUsername,
        username: channelInfo.username || manualUsername.replace('@', ''),
        description: channelInfo.description || 'Telegram KOL',
        tags: ['Telegram'],
        stats: {
          posts: 0,
          views: channelInfo.member_count || 0,
          forwards: 0
        }
      };

      setKols(prev => [newKOL, ...prev]);
      setSelectedKOL(newKOL);
      await loadPostsForKOL(newKOL.username);
      setManualUsername('');
    } catch (error) {
      console.error('Error adding manual KOL:', error);
      setError(error instanceof Error ? error.message : 'Failed to add KOL. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const scanGroupForKOLs = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    
    if (!telegramStatus.connected) {
      setError('Telegram service is not available. Please try again later.');
      return;
    }
    
    setGroupScanLoading(true);
    setError(null);
    
    try {
      const channelInfo = await telegramService.scanChannel(groupName);
      
      if (channelInfo.kol_details.length > 0) {
        // Transform KOL details to our format
        const newKOLs = channelInfo.kol_details.map((kol: any) => ({
          id: `group_${kol.user_id || Math.random()}`,
          name: `${kol.first_name || 'Unknown'} ${kol.last_name || ''}`.trim(),
          username: kol.username || `user_${kol.user_id}`,
          description: `Found in ${groupName} ${kol.is_admin ? '(Admin)' : '(Member)'}`,
          tags: ['Group Member', ...(kol.is_admin ? ['Admin'] : [])],
          stats: {
            posts: 0,
            views: 0,
            forwards: 0
          },
          discoveredFrom: groupName
        }));
        
        setKols(prev => [...newKOLs, ...prev]);
        setGroupName('');
        setError(null);
      } else {
        setError('No KOLs found in this group');
      }
    } catch (error) {
      console.error('Error scanning group:', error);
      setError(error instanceof Error ? error.message : 'Failed to scan group. Please try again later.');
    } finally {
      setGroupScanLoading(false);
    }
  };

  const loadPostsForKOL = async (username: string) => {
    if (!username) return;
    
    setFetchingPosts(true);
    setError(null);
    
    try {
      // Use enhanced posts from telegram service
      const data = await telegramService.getEnhancedPosts(username);
      
      // Transform enhanced posts to regular posts format
      const transformedPosts = data.posts.map((post: any) => ({
        id: `${post.message_id}`,
        text: post.text,
        date: post.date,
        views: post.views || 0,
        forwards: post.forwards || 0,
        username: username,
        source: 'Telegram',
        channel_id: post.channel_id || 0,
        channel_title: post.channel_title || username
      }));
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts. Please try again later.');
      setPosts([]);
    } finally {
      setFetchingPosts(false);
    }
  };

  const performAIAnalysis = async () => {
    if (!selectedKOL || posts.length === 0) {
      setAnalysisError('No posts available for analysis');
      return;
    }
    
    setAnalysisLoading(true);
    setAnalysisError(null);
    
    try {
      const analysisResult = await aiAnalysisService.analyzeKOL(
        selectedKOL.username,
        posts.map(post => ({
          message_id: parseInt(post.id.split('_')[1]),
          text: post.text,
          date: post.date,
          views: post.views,
          forwards: post.forwards,
          channel_id: post.channel_id,
          channel_title: post.channel_title
        }))
      );
      
      setAnalysis(analysisResult);
      setActiveTab('analysis');
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to perform AI analysis. Please try again later.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const loadEnhancedPosts = async (username: string) => {
    if (!username) return;
    
    setFetchingPosts(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_TELETHON_SERVICE_URL}/enhanced-posts/${username}`);
      if (!response.ok) throw new Error('Failed to fetch enhanced posts');
      
      const data = await response.json();
      setEnhancedPosts(data.posts);
      
      // Update KOL stats with new data
      if (selectedKOL) {
        setSelectedKOL({
          ...selectedKOL,
          stats: {
            ...selectedKOL.stats,
            total_volume: data.total_volume,
            average_sentiment: data.average_sentiment,
            peak_engagement: data.peak_engagement
          }
        });
      }
    } catch (error) {
      console.error('Error loading enhanced posts:', error);
      setError('Failed to load enhanced posts');
    } finally {
      setFetchingPosts(false);
    }
  };

  const loadVolumeData = async (username: string) => {
    if (!username) return;
    
    setVolumeLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_TELETHON_SERVICE_URL}/track-volume/${username}`);
      if (!response.ok) throw new Error('Failed to fetch volume data');
      
      const data = await response.json();
      setVolumeData(data);
    } catch (error) {
      console.error('Error loading volume data:', error);
      setError('Failed to load volume data');
    } finally {
      setVolumeLoading(false);
    }
  };

  const selectKOL = async (kol: KOL) => {
    setSelectedKOL(kol);
    setActiveView('posts');
    await Promise.all([
      loadEnhancedPosts(kol.username),
      loadVolumeData(kol.username)
    ]);
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

  const renderVolumeView = () => {
    if (volumeLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading volume data...</span>
        </div>
      );
    }

    if (!Object.keys(volumeData).length) {
      return (
        <div className="text-center p-8 text-gray-500">
          No volume data available for this KOL
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {Object.entries(volumeData).map(([token, data]) => (
          <div key={token} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{token.substring(0, 8)}...</h3>
              <span className="text-sm text-gray-400">{data[0]?.chain}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded p-3">
                <div className="text-sm text-gray-400">Latest Price</div>
                <div className="text-lg">${data[data.length - 1]?.price.toFixed(4)}</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="text-sm text-gray-400">24h Volume</div>
                <div className="text-lg">${formatNumber(data[data.length - 1]?.volume)}</div>
              </div>
              <div className="bg-gray-700 rounded p-3">
                <div className="text-sm text-gray-400">Price Change</div>
                <div className="text-lg">
                  {calculatePriceChange(data)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const calculatePriceChange = (data: VolumeData[]): string => {
    if (data.length < 2) return '0.00';
    const oldPrice = data[0].price;
    const newPrice = data[data.length - 1].price;
    const change = ((newPrice - oldPrice) / oldPrice) * 100;
    return change.toFixed(2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333]">
        <div>
          <h1 className="text-2xl font-bold text-white">KOL Analyzer</h1>
          <TypewriterText 
            text="Discover and analyze Key Opinion Leaders in crypto communities"
            className="text-neutral-400 text-sm mt-1"
          />
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center space-x-4">
          {/* Demo Mode Banner */}
          {error?.includes('Demo Mode') && (
            <div className="flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-lg px-3 py-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-sm">Demo Mode</span>
            </div>
          )}
          
          {/* Telegram Status */}
          <div className="flex items-center space-x-2">
            {telegramStatus.connected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Telegram Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">Telegram Disconnected</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - KOL List */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search KOLs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#242424] border border-[#333] rounded-xl
                focus:outline-none focus:border-[#444] focus:ring-1 focus:ring-[#444]
                placeholder-neutral-500"
            />
          </div>

          {/* Add KOL Form */}
          <div className="bg-[#242424] rounded-xl p-4 border border-[#333]">
            <h3 className="text-sm font-medium mb-3">Add New KOL</h3>
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="@username"
                  value={manualUsername}
                  onChange={(e) => setManualUsername(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 bg-[#1c1c1c] border border-[#333] rounded-lg
                    focus:outline-none focus:border-[#444] focus:ring-1 focus:ring-[#444]
                    placeholder-neutral-500"
                  disabled={loading || !telegramStatus.connected}
                />
                <button
                  onClick={addManualKOL}
                  disabled={loading || !telegramStatus.connected || !manualUsername.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2
                    text-neutral-400 hover:text-white disabled:text-neutral-600
                    transition-colors duration-200"
                >
                  {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Group Scanner */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Scan group for KOLs"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full pl-4 pr-10 py-2 bg-[#1c1c1c] border border-[#333] rounded-lg
                    focus:outline-none focus:border-[#444] focus:ring-1 focus:ring-[#444]
                    placeholder-neutral-500"
                  disabled={groupScanLoading || !telegramStatus.connected}
                />
                <button
                  onClick={scanGroupForKOLs}
                  disabled={groupScanLoading || !telegramStatus.connected || !groupName.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2
                    text-neutral-400 hover:text-white disabled:text-neutral-600
                    transition-colors duration-200"
                >
                  {groupScanLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-3 text-sm text-red-400 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* KOL List */}
          <div className="space-y-2">
            {filteredKOLs.map(kol => (
              <button
                key={kol.id}
                onClick={() => selectKOL(kol)}
                className={`w-full p-3 rounded-xl border transition-all duration-200
                  ${selectedKOL?.id === kol.id
                    ? 'bg-[#242424] border-[#444] shadow-lg'
                    : 'bg-[#1c1c1c] border-[#333] hover:border-[#444]'
                  }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 text-left">
                    <h3 className="font-medium truncate">{kol.name}</h3>
                    <p className="text-sm text-neutral-400 truncate">@{kol.username}</p>
                  </div>
                  {kol.tags.includes('Admin') && (
                    <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-neutral-400">
                  <div>
                    <div className="font-medium text-neutral-300">{formatNumber(kol.stats.posts)}</div>
                    <div>Posts</div>
                  </div>
                  <div>
                    <div className="font-medium text-neutral-300">{formatNumber(kol.stats.views)}</div>
                    <div>Views</div>
                  </div>
                  <div>
                    <div className="font-medium text-neutral-300">{formatNumber(kol.stats.forwards)}</div>
                    <div>Forwards</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9">
          {selectedKOL ? (
            <div className="space-y-6">
              {/* KOL Header */}
              <div className="bg-[#242424] rounded-xl p-6 border border-[#333]">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedKOL.name}</h2>
                    <p className="text-neutral-400">@{selectedKOL.username}</p>
                    <p className="mt-2 text-sm text-neutral-300">{selectedKOL.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={refreshPosts}
                      disabled={fetchingPosts}
                      className="p-2 rounded-lg bg-[#1c1c1c] border border-[#333]
                        hover:border-[#444] transition-colors duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Activity className={`w-5 h-5 ${fetchingPosts ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-4">
                  {selectedKOL.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm bg-[#1c1c1c] text-neutral-300 rounded-full border border-[#333]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center space-x-4 border-b border-[#333] pb-4">
                <button
                  onClick={() => setActiveView('posts')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200
                    ${activeView === 'posts'
                      ? 'bg-[#242424] text-white'
                      : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Posts</span>
                </button>
                <button
                  onClick={() => setActiveView('analysis')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200
                    ${activeView === 'analysis'
                      ? 'bg-[#242424] text-white'
                      : 'text-neutral-400 hover:text-white'
                    }`}
                >
                  <Brain className="w-5 h-5" />
                  <span>Analysis</span>
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {activeView === 'posts' ? (
                  <>
                    {/* Posts List */}
                    {fetchingPosts ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 animate-spin text-neutral-400" />
                      </div>
                    ) : enhancedPosts.length > 0 ? (
                      <div className="space-y-4">
                        {enhancedPosts.map(post => (
                          <div
                            key={post.id}
                            className="bg-[#242424] rounded-xl p-4 border border-[#333]"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-neutral-400">{formatDate(post.date)}</span>
                              <div className="flex items-center space-x-4">
                                <span className="flex items-center">
                                  <Eye className="w-4 h-4 mr-1" />
                                  {formatNumber(post.views)}
                                </span>
                                <span className="flex items-center">
                                  <Share className="w-4 h-4 mr-1" />
                                  {formatNumber(post.forwards)}
                                </span>
                                {post.engagement_rate && (
                                  <span className="flex items-center">
                                    <Activity className="w-4 h-4 mr-1" />
                                    {post.engagement_rate.toFixed(2)}%
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-300">{post.text}</p>
                            {post.volume_data && (
                              <div className="mt-2 p-2 bg-gray-700 rounded">
                                <div className="flex items-center space-x-4">
                                  <span className="flex items-center">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    ${post.volume_data.price.toFixed(4)}
                                  </span>
                                  <span className="flex items-center">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    ${formatNumber(post.volume_data.volume)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-neutral-400">
                        No posts found
                      </div>
                    )}

                    {/* Analysis Button */}
                    {enhancedPosts.length > 0 && (
                      <div className="flex justify-center pt-4">
                        <button
                          onClick={performAIAnalysis}
                          disabled={analysisLoading}
                          className="flex items-center space-x-2 px-6 py-3 bg-blue-500
                            hover:bg-blue-600 rounded-xl transition-colors duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {analysisLoading ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin" />
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <Brain className="w-5 h-5" />
                              <span>Analyze Posts</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Analysis View */}
                    {analysisLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader className="w-8 h-8 animate-spin text-neutral-400" />
                        <p className="text-neutral-400">Analyzing KOL data...</p>
                      </div>
                    ) : analysis ? (
                      <div className="grid grid-cols-12 gap-6">
                        {/* Sentiment & Engagement */}
                        <div className="col-span-12 lg:col-span-6 space-y-6">
                          {/* Sentiment */}
                          <div className="bg-[#242424] rounded-xl p-6 border border-[#333]">
                            <h3 className="text-lg font-medium mb-4">Sentiment Analysis</h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span>Overall Sentiment</span>
                                <span className={`px-3 py-1 rounded-full text-sm
                                  ${analysis.overall_sentiment.label === 'positive'
                                    ? 'bg-green-500/20 text-green-400'
                                    : analysis.overall_sentiment.label === 'negative'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-neutral-500/20 text-neutral-400'
                                  }`}
                                >
                                  {analysis.overall_sentiment.label}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Sentiment Score</span>
                                <span>{(analysis.overall_sentiment.score * 100).toFixed(1)}%</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Trend</span>
                                <span className={`px-3 py-1 rounded-full text-sm
                                  ${analysis.content_analysis.sentiment_trend === 'improving'
                                    ? 'bg-green-500/20 text-green-400'
                                    : analysis.content_analysis.sentiment_trend === 'declining'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-neutral-500/20 text-neutral-400'
                                  }`}
                                >
                                  {analysis.content_analysis.sentiment_trend}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Engagement */}
                          <div className="bg-[#242424] rounded-xl p-6 border border-[#333]">
                            <h3 className="text-lg font-medium mb-4">Engagement Metrics</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-[#1c1c1c] rounded-lg">
                                <div className="text-sm text-neutral-400">Average Views</div>
                                <div className="text-xl font-medium mt-1">
                                  {formatNumber(analysis.engagement_metrics.average_views)}
                                </div>
                              </div>
                              <div className="p-4 bg-[#1c1c1c] rounded-lg">
                                <div className="text-sm text-neutral-400">Average Forwards</div>
                                <div className="text-xl font-medium mt-1">
                                  {formatNumber(analysis.engagement_metrics.average_forwards)}
                                </div>
                              </div>
                              <div className="p-4 bg-[#1c1c1c] rounded-lg">
                                <div className="text-sm text-neutral-400">Engagement Rate</div>
                                <div className="text-xl font-medium mt-1">
                                  {analysis.engagement_metrics.engagement_rate.toFixed(1)}%
                                </div>
                              </div>
                              <div className="p-4 bg-[#1c1c1c] rounded-lg">
                                <div className="text-sm text-neutral-400">Viral Potential</div>
                                <div className="text-xl font-medium mt-1">
                                  {analysis.engagement_metrics.viral_potential.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Topics & Influence */}
                        <div className="col-span-12 lg:col-span-6 space-y-6">
                          {/* Topics */}
                          <div className="bg-[#242424] rounded-xl p-6 border border-[#333]">
                            <h3 className="text-lg font-medium mb-4">Content Analysis</h3>
                            <div className="space-y-4">
                              {analysis.content_analysis.primary_topics.map((topic, index) => (
                                <div key={index} className="space-y-1">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>{topic.label}</span>
                                    <span>{(topic.confidence * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="h-2 bg-[#1c1c1c] rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ width: `${topic.confidence * 100}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Influence */}
                          <div className="bg-[#242424] rounded-xl p-6 border border-[#333]">
                            <h3 className="text-lg font-medium mb-4">Influence Analysis</h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span>Influence Score</span>
                                <span>{analysis.influence_metrics.overall_influence_score.toFixed(1)}%</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Market Impact</span>
                                <span className={`px-3 py-1 rounded-full text-sm
                                  ${analysis.influence_metrics.market_impact_potential === 'high'
                                    ? 'bg-green-500/20 text-green-400'
                                    : analysis.influence_metrics.market_impact_potential === 'low'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                  }`}
                                >
                                  {analysis.influence_metrics.market_impact_potential}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span>Credibility Score</span>
                                <span>{analysis.influence_metrics.credibility_score.toFixed(1)}%</span>
                              </div>
                              <div>
                                <div className="text-sm text-neutral-400 mb-2">Expertise Areas</div>
                                <div className="flex flex-wrap gap-2">
                                  {analysis.influence_metrics.expertise_areas.map((area, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 text-sm bg-[#1c1c1c] rounded-full"
                                    >
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Risk Assessment */}
                        <div className="col-span-12">
                          <div className="bg-[#242424] rounded-xl p-6 border border-[#333]">
                            <h3 className="text-lg font-medium mb-4">Risk Assessment</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div>
                                <div className="flex items-center justify-between mb-4">
                                  <span>Overall Risk Level</span>
                                  <span className={`px-3 py-1 rounded-full text-sm
                                    ${analysis.risk_assessment.overall_risk === 'low'
                                      ? 'bg-green-500/20 text-green-400'
                                      : analysis.risk_assessment.overall_risk === 'high'
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-yellow-500/20 text-yellow-400'
                                    }`}
                                  >
                                    {analysis.risk_assessment.overall_risk}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  <div className="text-sm text-neutral-400">Risk Factors</div>
                                  {analysis.risk_assessment.risk_factors.map((factor, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start space-x-2 text-sm"
                                    >
                                      <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                      <span>{factor}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-neutral-400 mb-2">Recommendations</div>
                                <div className="space-y-2">
                                  {analysis.risk_assessment.recommendations.map((rec, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start space-x-2 text-sm"
                                    >
                                      <Zap className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                      <span>{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Key Insights */}
                        <div className="col-span-12">
                          <div className="bg-[#242424] rounded-xl p-6 border border-[#333]">
                            <h3 className="text-lg font-medium mb-4">Key Insights</h3>
                            <div className="space-y-3">
                              {analysis.key_insights.map((insight, index) => (
                                <div
                                  key={index}
                                  className="flex items-start space-x-3 p-3 bg-[#1c1c1c] rounded-lg"
                                >
                                  <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                  <p>{insight}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-neutral-400">
                        {analysisError || 'No analysis available. Please analyze posts first.'}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
              <Users className="w-12 h-12 mb-4" />
              <p>Select a KOL to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}