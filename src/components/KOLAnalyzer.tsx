import React, { useState, useEffect } from 'react';
import { Search, Users, MessageCircle, TrendingUp, BarChart3, Brain, Clock, Link, Zap, AlertTriangle, Plus, Loader, Eye, Share, Activity, Wifi, WifiOff, DollarSign, LineChart, Hash, UserCheck, UserPlus, Globe, Calendar, Star, Target, Bookmark, Filter, BarChart2, Trash2, MessagesSquare, LogOut } from 'lucide-react';
import { TypewriterText } from './TypewriterText';
import { telegramService } from '../services/telegramService';
import { aiAnalysisService } from '../services/aiAnalysisService';
import type { KOLAnalysisResult } from '../services/aiAnalysisService';
import { apiService } from '../services/apiService';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useTelegramAuth } from '../contexts/TelegramAuthContext';
import TelegramAuth from './TelegramAuth';

interface VolumeData {
  timestamp: string;
  volume: number;
  price: number;
  token_address?: string;
  chain?: string;
}

interface TelegramChannelInfo {
  id: number;
  title: string;
  username?: string;
  participants_count: number;
  description?: string;
  verified: boolean;
  fake: boolean;
  scam: boolean;
  restricted: boolean;
  creator: boolean;
  admin_rights?: any;
  created_date?: string;
  megagroup: boolean;
  broadcast: boolean;
  public: boolean;
}

interface AdvancedStats {
  avg_posting_time: string;
  most_active_day: string;
  hashtag_usage: number;
  link_sharing_frequency: number;
  reply_engagement: number;
  forward_ratio: number;
  unique_viewers: number;
  subscriber_growth: number;
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
  sentiment_score?: number;
  engagement_rate?: number;
  volume_data?: VolumeData;
  replies?: number;
  reactions?: Record<string, number>;
  media_type?: 'photo' | 'video' | 'document' | 'sticker' | 'gif';
  hashtags?: string[];
  mentions?: string[];
  links?: string[];
  edit_date?: string;
  pinned?: boolean;
}

interface KOLStats {
  posts: number;
  views: number;
  forwards: number;
  total_volume?: number;
  average_sentiment?: number;
  peak_engagement?: number;
  advanced?: AdvancedStats;
}

interface APIKOLResponse {
  _id: string;
  displayName: string;
  telegramUsername: string;
  description?: string;
  tags: string[];
  stats?: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
    lastUpdated: Date;
  };
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
    advanced?: {
      avg_posting_time: string;
      most_active_day: string;
      hashtag_usage: number;
      link_sharing_frequency: number;
      reply_engagement: number;
      forward_ratio: number;
      unique_viewers: number;
      subscriber_growth: number;
    };
  };
  verification_status: 'verified' | 'unverified' | 'suspicious';
  influence_score: number;
  last_activity?: string;
  channel_info?: TelegramChannelInfo;
}

interface TelegramStatus {
  connected: boolean;
  lastCheck: string;
  uptime?: number;
  api_limits?: {
    requests_remaining: number;
    reset_time: string;
  };
}

interface TextClassification {
  label: string;
  confidence: number;
}

interface ContentAnalysis {
  primary_topics: TextClassification[];
  sentiment_trend: "improving" | "stable" | "declining";
  posting_frequency: number;
  content_quality_score: number;
}

interface PerformanceMetric {
  name: string;
  value: string;
}

interface PerformanceSummary {
  growth_rate: number;
  consistency_score: number;
  trend: 'upward' | 'stable' | 'downward';
  key_metrics: PerformanceMetric[];
}

interface CreateKOLData {
  displayName: string;
  telegramUsername: string;
  description: string;
  tags: string[];
  stats: {
    totalPosts: number;
    totalViews: number;
    totalForwards: number;
    total_volume: number;
    average_sentiment: number;
    peak_engagement: number;
  };
}

export default function KOLAnalyzer() {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [inputType, setInputType] = useState<'username' | 'channel'>('username');
  const [groupName, setGroupName] = useState('');
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'analysis' | 'volume'>('posts');
  const [kols, setKols] = useState<KOL[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [analysis, setAnalysis] = useState<KOLAnalysisResult | null>(null);
  const [volumeData, setVolumeData] = useState<Record<string, VolumeData[]>>({});
  const [enhancedPosts, setEnhancedPosts] = useState<Post[]>([]);
  const [activeView, setActiveView] = useState<'posts' | 'analysis' | 'volume' | 'insights'>('posts');
  const [filterType, setFilterType] = useState<'all' | 'verified' | 'high-influence' | 'recent'>('all');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [groupScanLoading, setGroupScanLoading] = useState(false);
  const [fetchingPosts, setFetchingPosts] = useState(false);
  const [volumeLoading, setVolumeLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  
  // Error handling
  const [error, setError] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [telegramError, setTelegramError] = useState<string | null>(null);
  
  // Telegram service status
  const [telegramStatus, setTelegramStatus] = useState<TelegramStatus>({
    connected: false,
    lastCheck: new Date().toISOString()
  });

  // Add a new state for deleted KOL IDs
  const [deletedKOLs, setDeletedKOLs] = useState<Set<string>>(new Set());

  // Telegram Auth state
  const [showTelegramAuth, setShowTelegramAuth] = useState(false);
  
  // Telegram Auth hooks
  const { 
    user: telegramUser, 
    isAuthenticated: isTelegramAuthenticated, 
    login: telegramLogin, 
    logout: telegramLogout 
  } = useTelegramAuth();

  const handleTelegramAuthSuccess = (userInfo: any) => {
    telegramLogin(userInfo, userInfo.session_id || '');
    setShowTelegramAuth(false);
  };

  // Load initial KOLs and check Telegram status
  useEffect(() => {
    loadKOLs();
    checkTelegramStatus();
    
    // Check Telegram status every 5 minutes instead of 30 seconds to reduce errors
    const statusInterval = setInterval(checkTelegramStatus, 300000);
    return () => clearInterval(statusInterval);
  }, []); // Run once on mount

  // Reload KOLs when deletedKOLs changes
  useEffect(() => {
    if (deletedKOLs.size > 0) {
      loadKOLs();
    }
  }, [deletedKOLs]);

  const checkTelegramStatus = async () => {
    try {
      setTelegramError(null);
      const status = await telegramService.checkStatus();
      setTelegramStatus({
        connected: status.connected,
        lastCheck: new Date().toISOString(),
        uptime: Number(status.uptime) || 0
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
      setLoading(true);
      setError(null);
      
      // Use real Telethon data only - no fallbacks or demo data
      console.log('📊 Loading KOLs using real Telethon data...');
      const telegramChannels = await telegramService.getKOLChannels();
      
      // Transform Telethon response to component format with ONLY real data
      const transformedKOLs: KOL[] = telegramChannels.map((channel: any, index: number) => ({
        id: `channel_${channel.username || index}`,
        name: channel.title || channel.username,
        username: channel.username || `channel_${index}`,
        description: channel.description || 'Real data from Telegram',
        tags: ['crypto', 'trading', 'telegram'],
        stats: {
          posts: channel.message_count || 0,
          views: channel.recent_activity?.reduce((sum: number, msg: any) => sum + (Number(msg.views) || 0), 0) || 0,
          forwards: channel.recent_activity?.reduce((sum: number, msg: any) => sum + (Number(msg.forwards) || 0), 0) || 0,
          total_volume: 0, // Real volume data would come from additional analysis
          average_sentiment: 0, // Would require sentiment analysis
          peak_engagement: channel.recent_activity?.reduce((max: number, msg: any) => Math.max(max, Number(msg.views) || 0), 0) || 0,
          advanced: {
            avg_posting_time: "Unknown",
            most_active_day: "Unknown", 
            hashtag_usage: 0,
            link_sharing_frequency: 0,
            reply_engagement: 0,
            forward_ratio: 0,
            unique_viewers: channel.member_count || 0,
            subscriber_growth: 0
          }
        },
        verification_status: channel.verified ? 'verified' as const : 'unverified' as const,
        influence_score: Math.min(100, Math.floor((channel.member_count || 0) / 1000)),
        last_activity: channel.recent_activity?.[0]?.date || new Date().toISOString(),
        channel_info: {
          id: index,
          title: channel.title || channel.username,
          username: channel.username || `channel_${index}`,
          participants_count: channel.member_count || 0,
          description: channel.description || '',
          verified: channel.verified || false,
          fake: channel.fake || false,
          scam: channel.scam || false,
          restricted: false,
          creator: false,
          megagroup: true,
          broadcast: false,
          public: true
        }
      }));
      
      // Filter out any deleted KOLs
      const filteredKOLs = transformedKOLs.filter(kol => !deletedKOLs.has(kol.username));
      
      if (filteredKOLs.length === 0) {
        throw new Error('No valid KOL data received from Telegram');
      }
      
      setKols(filteredKOLs);
      console.log(`✅ Loaded ${filteredKOLs.length} real KOLs from Telegram`);
      
    } catch (err) {
      console.error('Failed to load KOLs:', err);
      setError(`❌ Failed to load KOLs: ${err instanceof Error ? err.message : 'Unknown error'}. Please ensure Telegram is connected and authenticated.`);
      setKols([]);
    } finally {
      setLoading(false);
    }
  };

  const addManualKOL = async () => {
    if (!manualInput.trim()) {
      setError('Please enter a username or channel link');
      return;
    }
    
    if (!telegramStatus.connected) {
      setError('Telegram service is not available. Please try again later.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Clean up input - remove @ symbol and extract username from channel link if needed
      const cleanInput = manualInput.trim().replace('@', '');
      const username = inputType === 'channel' ? 
        cleanInput.split('/').pop() || cleanInput : 
        cleanInput;

      // Check if KOL already exists (both in frontend state and backend)
      const existingKOL = kols.find(k => k.username.toLowerCase() === username.toLowerCase());
      if (existingKOL) {
        setSelectedKOL(existingKOL);
        await loadPostsForKOL(existingKOL.username);
        setManualInput('');
        setError(null);
        return;
      }

      // Also check backend to avoid conflicts
      try {
        const backendKOLs = await apiService.getKOLs();
        const backendKOL = backendKOLs.find((k: any) => k.telegramUsername.toLowerCase() === username.toLowerCase());
        if (backendKOL) {
          // KOL exists in backend but not in frontend - add it to frontend
          const transformedKOL: KOL = {
            id: backendKOL._id,
            name: backendKOL.displayName,
            username: backendKOL.telegramUsername,
            description: backendKOL.description || 'No description available',
            tags: backendKOL.tags || [],
            stats: {
              posts: backendKOL.stats?.totalPosts || 0,
              views: backendKOL.stats?.totalViews || 0,
              forwards: backendKOL.stats?.totalForwards || 0,
              total_volume: 0,
              average_sentiment: 0,
              peak_engagement: 0,
              advanced: {
                avg_posting_time: "12:00",
                most_active_day: "Monday",
                hashtag_usage: 0,
                link_sharing_frequency: 0,
                reply_engagement: 0,
                forward_ratio: 0,
                unique_viewers: 0,
                subscriber_growth: 0
              }
            },
            verification_status: 'unverified' as const,
            influence_score: 0,
            last_activity: new Date().toISOString(),
            channel_info: {
              id: 0,
              title: backendKOL.displayName,
              username: backendKOL.telegramUsername,
              participants_count: 0,
              description: backendKOL.description || '',
              verified: false,
              fake: false,
              scam: false,
              restricted: false,
              creator: false,
              megagroup: true,
              broadcast: false,
              public: true
            }
          };
          
          setKols(prev => [...prev, transformedKOL]);
          setSelectedKOL(transformedKOL);
          await loadPostsForKOL(transformedKOL.username);
          setManualInput('');
          setError(null);
          return;
        }
      } catch (backendError) {
        console.log('Could not check backend for existing KOL:', backendError);
      }

      // Scan channel/user using Telethon service
      const channelInfo = await telegramService.scanChannel(username);
      
      // Create new KOL entry using apiService
      const newKOLData: CreateKOLData = {
        displayName: channelInfo.title || username,
        telegramUsername: channelInfo.username || username,
          description: channelInfo.description || 'Telegram KOL',
          tags: ['Telegram'],
      stats: {
            totalPosts: 0,
            totalViews: channelInfo.member_count || 0,
          totalForwards: 0,
          total_volume: 0,
          average_sentiment: 0,
          peak_engagement: 0
          }
      };

      const createdKOL = await apiService.createKOL(newKOLData);

      // Add to local state
      const newKOL: KOL = {
        id: createdKOL._id,
        name: createdKOL.displayName,
        username: createdKOL.telegramUsername,
        description: createdKOL.description,
        tags: createdKOL.tags,
        stats: {
          posts: 0,
          views: channelInfo.member_count || 0,
          forwards: 0,
          total_volume: 0,
          average_sentiment: 0,
          peak_engagement: 0,
          advanced: {
            avg_posting_time: "12:00",
            most_active_day: "Monday",
            hashtag_usage: Math.floor(Math.random() * 100),
            link_sharing_frequency: Math.floor(Math.random() * 100),
            reply_engagement: Math.floor(Math.random() * 100),
            forward_ratio: Math.random(),
            unique_viewers: Math.floor(Math.random() * 10000),
            subscriber_growth: Math.random() * 20 - 10
          }
        },
        verification_status: Math.random() > 0.7 ? 'verified' : 'unverified',
        influence_score: Math.floor(Math.random() * 100),
        last_activity: new Date().toISOString(),
        channel_info: {
          id: parseInt(createdKOL._id.slice(-6), 16),
          title: createdKOL.displayName,
          username: createdKOL.telegramUsername,
          participants_count: Math.floor(Math.random() * 10000),
          description: createdKOL.description || '',
          verified: Math.random() > 0.7,
          fake: false,
          scam: false,
          restricted: false,
          creator: false,
          megagroup: true,
          broadcast: false,
          public: true
        }
      };

      setKols(prev => [...prev, newKOL]);
      setSelectedKOL(newKOL);
      setManualInput('');
      await loadPostsForKOL(newKOL.username);
      
    } catch (error) {
      console.error('Error adding KOL:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('409') || errorMessage.includes('Conflict') || errorMessage.includes('already exists')) {
        // Handle 409 conflict - KOL already exists
        setError('This KOL already exists in the database. Refreshing KOL list...');
        // Refresh the KOL list to show the existing one
        await loadKOLs();
        setManualInput('');
      } else if (errorMessage.includes('Backend service is not available')) {
        setError('❌ Backend service is not available. Cannot create KOL with real-time data.');
      } else {
        setError(`❌ Failed to add KOL: ${errorMessage}`);
      }
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
      
      if (channelInfo.kol_details && channelInfo.kol_details.length > 0) {
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
            forwards: 0,
            total_volume: 0,
            average_sentiment: 0,
            peak_engagement: 0,
            advanced: {
              avg_posting_time: "12:00",
              most_active_day: "Monday",
              hashtag_usage: 0,
              link_sharing_frequency: 0,
              reply_engagement: 0,
              forward_ratio: 0,
              unique_viewers: 0,
              subscriber_growth: 0
            }
          },
          verification_status: 'unverified' as const,
          influence_score: 0,
          last_activity: new Date().toISOString(),
          channel_info: {
            id: kol.user_id || 0,
            title: `${kol.first_name || 'Unknown'} ${kol.last_name || ''}`.trim(),
            username: kol.username,
            participants_count: 0,
            description: '',
            verified: false,
            fake: false,
            scam: false,
            restricted: false,
            creator: false,
            megagroup: false,
            broadcast: false,
            public: false
          }
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
      if (!telegramStatus.connected) {
        throw new Error('Telegram service is not connected. Please connect your Telegram account first.');
      }
      
      // Use enhanced posts from telegram service only
      const data = await telegramService.getEnhancedPosts(username);
      
      // Transform enhanced posts to our format
      const enhancedPostsData = Array.isArray(data.posts) ? data.posts.map((post: any) => ({
        id: post.message_id?.toString() || `post_${Date.now()}_${Math.random()}`,
        text: post.text || '',
        date: post.date,
        views: post.views || 0,
        forwards: post.forwards || 0,
        username: username,
        source: 'Telegram',
        channel_id: post.channel_id || 0,
        channel_title: post.channel_title || username,
        engagement_rate: post.engagement_rate || (post.views > 0 ? ((post.forwards || 0) / post.views) * 100 : 0),
        sentiment_score: post.sentiment_score || 0.5,
        volume_data: post.volume_data
      })) : [];
      
      setEnhancedPosts(enhancedPostsData);
      setPosts(enhancedPostsData);
      
      // Update KOL stats with real data
      if (selectedKOL && enhancedPostsData.length > 0) {
        const avgSentiment = enhancedPostsData.reduce((sum, post) => sum + (post.sentiment_score || 0.5), 0) / enhancedPostsData.length;
        const maxEngagement = Math.max(...enhancedPostsData.map(post => post.engagement_rate || 0));
        const totalVolume = enhancedPostsData.reduce((sum, post) => sum + (post.volume_data?.volume || 0), 0);
        
        setSelectedKOL({
          ...selectedKOL,
          stats: {
            ...selectedKOL.stats,
            posts: enhancedPostsData.length,
            views: enhancedPostsData.reduce((sum, post) => sum + (post.views || 0), 0),
            forwards: enhancedPostsData.reduce((sum, post) => sum + (post.forwards || 0), 0),
            total_volume: totalVolume,
            average_sentiment: avgSentiment,
            peak_engagement: maxEngagement
          }
        });

        // Also perform AI analysis automatically when posts are loaded
        await performAIAnalysis();
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts. Using demo data.');
      // Load demo data as fallback
      const demoData = Array.from({ length: 3 }).map((_, i) => ({
        id: `demo_${i}`,
        text: `Demo post ${i + 1}. This is sample content. #crypto #analysis`,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        views: Math.floor(1000 + Math.random() * 9000),
        forwards: Math.floor(100 + Math.random() * 900),
        username: username,
        source: 'Demo',
        channel_id: 0,
        channel_title: username,
        engagement_rate: 5 + Math.random() * 15,
        sentiment_score: 0.5 + Math.random() * 0.5,
        volume_data: {
          volume: Math.floor(100000 + Math.random() * 900000),
          price: 0.1 + Math.random() * 0.9,
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
        }
      }));
      setEnhancedPosts(demoData);
      setPosts(demoData);
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
      if (!telegramStatus.connected) {
        throw new Error('Telegram service is not connected. Please connect your Telegram account first.');
      }
      
      if (posts.length === 0) {
        throw new Error('No posts available for analysis. Please load posts first.');
      }
      
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
      setActiveView('analysis');
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to perform analysis. Please ensure Telegram is connected and try again.');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const loadEnhancedPosts = async (username: string) => {
    if (!username) return;
    
    setFetchingPosts(true);
    setError(null);
    
    try {
      // Use telegramService to get enhanced posts
      const data = await telegramService.getEnhancedPosts(username);
      const posts = data.posts;
      
      // Transform enhanced posts to our format
      const enhancedPostsData = Array.isArray(posts) ? posts.map((post: any) => ({
        id: post.message_id?.toString() || `post_${Date.now()}_${Math.random()}`,
        message_id: post.message_id || 0,
        text: post.text || '',
        date: post.date,
        views: post.views || 0,
        forwards: post.forwards || 0,
        username: username,
        source: 'Telegram',
        channel_id: post.channel_id || 0,
        channel_title: post.channel_title || username,
        engagement_rate: post.engagement_rate || (post.views > 0 ? ((post.forwards || 0) / post.views) * 100 : 0),
        sentiment_score: post.sentiment_score || 0.5,
        volume_data: post.volume_data
      })) : [];
      
      setEnhancedPosts(enhancedPostsData);
      
      // Update KOL stats with real data
      if (selectedKOL && enhancedPostsData.length > 0) {
        const avgSentiment = enhancedPostsData.reduce((sum, post) => sum + (post.sentiment_score || 0.5), 0) / enhancedPostsData.length;
        const maxEngagement = Math.max(...enhancedPostsData.map(post => post.engagement_rate || 0));
        
        setSelectedKOL({
          ...selectedKOL,
          stats: {
            ...selectedKOL.stats,
            posts: enhancedPostsData.length,
            views: enhancedPostsData.reduce((sum, post) => sum + (post.views || 0), 0),
            forwards: enhancedPostsData.reduce((sum, post) => sum + (post.forwards || 0), 0),
            total_volume: 0,
            average_sentiment: avgSentiment,
            peak_engagement: maxEngagement
          }
        });
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts from backend');
      setEnhancedPosts([]); // Set empty array instead of keeping old data
    } finally {
      setFetchingPosts(false);
    }
  };

  const loadVolumeData = async (username: string) => {
    if (!username) return;
    
    setVolumeLoading(true);
    try {
      // Volume data is not currently implemented in backend
      // Set empty data for now to prevent errors
      setVolumeData({});
    } catch (error) {
      console.error('Error loading volume data:', error);
      setVolumeData({});
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
  const filteredKOLs = kols.filter(kol => {
    const matchesSearch = kol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         kol.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filterType) {
      case 'verified':
        return kol.verification_status === 'verified';
      case 'high-influence':
        return (kol.influence_score || 0) > 70;
      case 'recent':
        const lastActivity = new Date(kol.last_activity || Date.now());
        const dayAgo = new Date(Date.now() - 86400000);
        return lastActivity > dayAgo;
      default:
        return true;
    }
  });

  const formatNumber = (num: number): string => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (value: string): string => {
    if (!value) return 'Unknown';
    try {
      const date = new Date(value);
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

  const getSentimentLabel = (score: number): string => {
    if (score >= 0.7) return 'Very Positive';
    if (score >= 0.6) return 'Positive';
    if (score >= 0.4) return 'Neutral';
    if (score >= 0.3) return 'Negative';
    return 'Very Negative';
  };

  const getSentimentColor = (score: number): string => {
    if (score >= 0.7) return 'text-green-400';
    if (score >= 0.6) return 'text-green-300';
    if (score >= 0.4) return 'text-gray-300';
    if (score >= 0.3) return 'text-red-300';
    return 'text-red-400';
  };

  const getSentimentBarColor = (score: number): string => {
    if (score >= 0.7) return 'bg-green-500';
    if (score >= 0.6) return 'bg-green-400';
    if (score >= 0.4) return 'bg-yellow-400';
    if (score >= 0.3) return 'bg-red-400';
    return 'bg-red-500';
  };

  const renderVolumeView = () => {
    if (!selectedKOL) {
      return (
        <div className="text-center p-8">
          <BarChart3 className="w-12 h-12 mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">Select a KOL to view volume analysis</p>
        </div>
      );
    }

    const volumeData = posts
      .filter(post => post.volume_data)
      .map(post => ({
        timestamp: new Date(post.volume_data!.timestamp).getTime(),
        volume: post.volume_data!.volume,
        price: post.volume_data!.price,
        text: post.text.substring(0, 50) + '...'
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    const totalVolume = volumeData.reduce((sum, data) => sum + data.volume, 0);
    const averageVolume = totalVolume / (volumeData.length || 1);
    const peakVolume = Math.max(...volumeData.map(data => data.volume));
    const priceImpact = volumeData.reduce((sum, data) => sum + data.price, 0) / (volumeData.length || 1);

    return (
      <div className="space-y-6">
        {/* Volume Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Volume</h3>
            <p className="text-2xl font-bold text-white">${formatNumber(totalVolume)}</p>
            <p className="text-sm text-gray-500 mt-1">Across all posts</p>
            </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Average Volume</h3>
            <p className="text-2xl font-bold text-white">${formatNumber(averageVolume)}</p>
            <p className="text-sm text-gray-500 mt-1">Per post</p>
              </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Peak Volume</h3>
            <p className="text-2xl font-bold text-white">${formatNumber(peakVolume)}</p>
            <p className="text-sm text-gray-500 mt-1">Highest single post</p>
              </div>
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Price Impact</h3>
            <p className={`text-2xl font-bold ${priceImpact > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceImpact > 0 ? '+' : ''}{(priceImpact * 100).toFixed(2)}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Average across posts</p>
                </div>
              </div>

        {/* Volume Chart */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Volume Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="timestamp" 
                  type="number"
                  domain={['auto', 'auto']}
                  tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
                  stroke="#9CA3AF"
                />
                <YAxis 
                  yAxisId="volume"
                  orientation="left"
                  tickFormatter={(value) => `$${formatNumber(value)}`}
                  stroke="#9CA3AF"
                />
                <YAxis 
                  yAxisId="price"
                  orientation="right"
                  tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                  stroke="#9CA3AF"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-lg">
                          <p className="text-gray-400">
                            {new Date(payload[0].payload.timestamp).toLocaleString()}
                          </p>
                          <p className="text-blue-400">
                            Volume: ${formatNumber(payload[0].payload.volume)}
                          </p>
                          <p className={payload[0].payload.price > 0 ? 'text-green-400' : 'text-red-400'}>
                            Price Impact: {(payload[0].payload.price * 100).toFixed(2)}%
                          </p>
                          <p className="text-gray-400 text-sm mt-2">{payload[0].payload.text}</p>
            </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  yAxisId="volume"
                  type="monotone"
                  dataKey="volume"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', r: 4 }}
                  name="Volume"
                />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="price"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                  name="Price Impact"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Analysis Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Post Volume Analysis</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Volume</th>
                  <th className="pb-3">Price Impact</th>
                  <th className="pb-3">Post Preview</th>
                </tr>
              </thead>
              <tbody>
                {posts
                  .filter(post => post.volume_data)
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(post => (
                    <tr key={post.id} className="border-b border-gray-700">
                      <td className="py-3 text-gray-300">
                        {new Date(post.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-gray-300">
                        ${formatNumber(post.volume_data!.volume)}
                      </td>
                      <td className={`py-3 ${post.volume_data!.price > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {post.volume_data!.price > 0 ? '+' : ''}{(post.volume_data!.price * 100).toFixed(2)}%
                      </td>
                      <td className="py-3 text-gray-300">
                        {post.text.substring(0, 50)}...
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
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

  const renderKOLCard = (kol: KOL) => (
    <div 
      className="bg-[#0F1225] rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10"
      onClick={() => selectKOL(kol)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            {kol.name}
          </h3>
          <p className="text-gray-400 text-sm">@{kol.username}</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-[#1A1E35] rounded-lg px-3 py-1">
            <span className="text-sm font-medium text-purple-400">
              Influence {kol.influence_score || 0}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-[#0A0B1A] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-cyan-400">{kol.stats.views.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Views</p>
        </div>
        <div className="bg-[#0A0B1A] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">{kol.stats.posts.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Posts</p>
        </div>
        <div className="bg-[#0A0B1A] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-indigo-400">{kol.stats.forwards.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Forwards</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {kol.tags.map((tag, index) => (
          <span 
            key={index}
            className="text-xs bg-[#1A1E35] text-gray-300 rounded-full px-3 py-1"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );

  const renderPostsView = () => (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <div 
          key={index}
          className="bg-[#0F1225] rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full p-2">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">{formatDate(post.date)}</p>
              </div>
            </div>
        <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{post.views.toLocaleString()}</span>
            </div>
              <div className="flex items-center space-x-1">
                <Share className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">{post.forwards.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-gray-200 leading-relaxed">{post.text}</p>
          </div>
          {post.sentiment_score !== undefined && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
          <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Sentiment:</span>
                <span 
                  className={`text-sm font-medium ${getSentimentColor(post.sentiment_score)}`}
                >
                  {getSentimentLabel(post.sentiment_score)}
                </span>
              </div>
              {post.engagement_rate && (
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Engagement:</span>
                  <span className="text-sm font-medium text-cyan-400">
                    {(post.engagement_rate * 100).toFixed(1)}%
                  </span>
                </div>
            )}
          </div>
          )}
        </div>
      ))}
      </div>
  );

  const renderAnalysisView = () => {
    if (analysisLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
            <p className="text-gray-400">Analyzing KOL data with AI...</p>
          </div>
        </div>
      );
    }

    if (!analysis) {
      return (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No analysis available. Click the button below to analyze this KOL's posts.</p>
                <button
            onClick={performAIAnalysis}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white rounded-lg hover:from-cyan-500/30 hover:to-purple-500/30 transition-all duration-300 border border-purple-500/20 hover:border-purple-500/40"
          >
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span>Analyze Posts</span>
            </div>
                </button>
              </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0F1225] rounded-xl p-6 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-medium text-gray-200">Sentiment Analysis</h3>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              {(analysis.overall_sentiment.score * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Overall {analysis.overall_sentiment.label} sentiment
            </p>
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                style={{ width: `${analysis.overall_sentiment.score * 100}%` }}
              />
              </div>
            </div>

          <div className="bg-[#0F1225] rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-medium text-gray-200">Engagement Metrics</h3>
              </div>
            <div className="text-3xl font-bold text-purple-400">
              {analysis.engagement_metrics.engagement_rate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Average engagement rate
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-800/50 rounded-lg p-2">
                <p className="text-sm text-gray-400">Avg Views</p>
                <p className="text-lg font-medium text-white">{formatNumber(analysis.engagement_metrics.average_views)}</p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-2">
                <p className="text-sm text-gray-400">Avg Forwards</p>
                <p className="text-lg font-medium text-white">{formatNumber(analysis.engagement_metrics.average_forwards)}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0F1225] rounded-xl p-6 border border-gray-800 hover:border-emerald-500/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-medium text-gray-200">Market Impact</h3>
                  </div>
            <div className="text-3xl font-bold text-emerald-400 capitalize">
              {analysis.influence_metrics.market_impact_potential}
                </div>
            <p className="text-sm text-gray-400 mt-2">
              Market influence potential
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400"
                  style={{ width: `${analysis.influence_metrics.overall_influence_score}%` }}
                />
                  </div>
              <span className="text-sm text-gray-400">{analysis.influence_metrics.overall_influence_score}%</span>
                  </div>
                  </div>
                </div>

        {/* Content Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0F1225] rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-cyan-400" />
              Content Analysis
            </h3>
            <div className="space-y-4">
              {analysis.content_analysis.primary_topics.map((topic, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{topic.label}</span>
                    <span className="text-cyan-400">{(topic.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      style={{ width: `${topic.confidence * 100}%` }}
                    />
                  </div>
                </div>
            ))}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-sm text-gray-400">Posting Frequency</p>
                  <p className="text-lg font-medium text-white">{analysis.content_analysis.posting_frequency.toFixed(1)}/day</p>
          </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-sm text-gray-400">Quality Score</p>
                  <p className="text-lg font-medium text-white">{(analysis.content_analysis.content_quality_score * 100).toFixed(1)}%</p>
        </div>
                  </div>
                  </div>
                </div>

          <div className="bg-[#0F1225] rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-purple-400" />
              Risk Assessment
            </h3>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Overall Risk Level</span>
                <span className={`text-sm font-medium ${
                  analysis.risk_assessment.overall_risk === 'low' ? 'text-emerald-400' :
                  analysis.risk_assessment.overall_risk === 'medium' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {analysis.risk_assessment.overall_risk.toUpperCase()}
                    </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    analysis.risk_assessment.overall_risk === 'low' ? 'bg-emerald-400' :
                    analysis.risk_assessment.overall_risk === 'medium' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}
                  style={{ width: analysis.risk_assessment.overall_risk === 'low' ? '33%' :
                          analysis.risk_assessment.overall_risk === 'medium' ? '66%' : '100%' }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Risk Factors</h4>
                <ul className="space-y-1">
                  {analysis.risk_assessment.risk_factors.map((factor, index) => (
                    <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      {factor}
                    </li>
                  ))}
                </ul>
                </div>
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {analysis.risk_assessment.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
              </div>

        {/* Performance Summary */}
        <div className="bg-[#0F1225] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Growth Rate</span>
                <span className="text-emerald-400">+{analysis.performance_summary.growth_rate.toFixed(1)}%</span>
                      </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400"
                  style={{ width: `${Math.min(analysis.performance_summary.growth_rate, 100)}%` }}
                />
              </div>
            </div>
            <div>
                            <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Consistency</span>
                <span className="text-purple-400">{analysis.performance_summary.consistency_score.toFixed(1)}%</span>
                              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-400"
                  style={{ width: `${analysis.performance_summary.consistency_score}%` }}
                />
                            </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Trend</span>
                <span className={`capitalize ${
                  analysis.performance_summary.trend === 'upward' ? 'text-emerald-400' :
                  analysis.performance_summary.trend === 'stable' ? 'text-blue-400' :
                  'text-red-400'
                }`}>
                  {analysis.performance_summary.trend}
                                  </span>
                                </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    analysis.performance_summary.trend === 'upward' ? 'bg-emerald-400' :
                    analysis.performance_summary.trend === 'stable' ? 'bg-blue-400' :
                    'bg-red-400'
                  }`}
                  style={{ width: '100%' }}
                />
                              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {analysis.performance_summary.key_metrics.map((metric, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm text-gray-400">{metric.name}</p>
                <p className="text-lg font-medium text-white">{metric.value}</p>
                          </div>
                        ))}
                      </div>
                      </div>
      </div>
    );
  };

  const renderTelegramInsights = () => {
    if (!selectedKOL?.channel_info) return null;

    return (
      <div className="space-y-6">
        {/* Channel Information Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Channel Information
            </h3>
            {selectedKOL.channel_info.verified && (
              <div className="flex items-center gap-1 text-emerald-400">
                <UserCheck className="w-4 h-4" />
                <span className="text-sm">Verified</span>
                      </div>
                    )}
                      </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Participants</span>
                              </div>
              <div className="text-2xl font-bold text-white">
                {selectedKOL.channel_info.participants_count.toLocaleString()}
                              </div>
              <div className="text-sm text-emerald-400">
                +{selectedKOL.stats.advanced?.subscriber_growth.toFixed(1)}% this month
                              </div>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Influence Score</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {selectedKOL.influence_score}/100
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                  style={{ width: `${selectedKOL.influence_score}%` }}
                />
                            </div>
                          </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-gray-400">Last Activity</span>
                                </div>
              <div className="text-lg font-semibold text-white">
                {selectedKOL.last_activity ? 
                  new Date(selectedKOL.last_activity).toLocaleDateString() : 
                  'Unknown'
                }
                              </div>
              <div className="text-sm text-gray-400">
                {selectedKOL.stats.advanced?.most_active_day} is most active
                                </div>
                              </div>
                                </div>
                              </div>

        {/* Engagement Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Engagement Metrics
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Forward Ratio</span>
                                     <span className="text-emerald-400">{((selectedKOL.stats.advanced?.forward_ratio || 0) * 100).toFixed(1)}%</span>
                                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div 
                    className="h-2 bg-emerald-400 rounded-full"
                    style={{ width: `${(selectedKOL.stats.advanced?.forward_ratio || 0) * 100}%` }}
                  />
                              </div>
                            </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Reply Engagement</span>
                  <span className="text-blue-400">{selectedKOL.stats.advanced?.reply_engagement}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full">
                  <div 
                    className="h-2 bg-blue-400 rounded-full"
                    style={{ width: `${selectedKOL.stats.advanced?.reply_engagement}%` }}
                  />
                          </div>
                        </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Hashtag Usage</span>
                  <span className="text-purple-400">{selectedKOL.stats.advanced?.hashtag_usage}%</span>
                                  </div>
                <div className="h-2 bg-gray-700 rounded-full">
                                    <div
                    className="h-2 bg-purple-400 rounded-full"
                    style={{ width: `${selectedKOL.stats.advanced?.hashtag_usage}%` }}
                                    />
                                  </div>
                                </div>
                            </div>
                          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Content Analysis
            </h4>
                            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Avg. Posting Time</span>
                <span className="text-cyan-400 font-medium">{selectedKOL.stats.advanced?.avg_posting_time}</span>
                              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Link Sharing</span>
                <span className="text-yellow-400 font-medium">{selectedKOL.stats.advanced?.link_sharing_frequency}%</span>
                              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <span className="text-gray-300">Unique Viewers</span>
                <span className="text-emerald-400 font-medium">{selectedKOL.stats.advanced?.unique_viewers.toLocaleString()}</span>
                              </div>
                                </div>
                              </div>
                            </div>
                          </div>
    );
  };

  // Function to delete a KOL
  const handleDelete = async (username: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking delete
    
    if (!window.confirm('Are you sure you want to delete this KOL? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(username);
      await apiService.deleteKOL(username);

      // Add to deleted KOLs set
      setDeletedKOLs(prev => new Set([...prev, username]));
      
      // Remove the KOL from the local state
      setKols(prevKols => prevKols.filter(kol => kol.username !== username));
      
      // Store deleted KOL in localStorage for persistence
      const deletedKOLsList = JSON.parse(localStorage.getItem('deletedKOLs') || '[]');
      localStorage.setItem('deletedKOLs', JSON.stringify([...deletedKOLsList, username]));
      
      setError(null);
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete KOL. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Load deleted KOLs from localStorage on mount
  useEffect(() => {
    const deletedKOLsList = JSON.parse(localStorage.getItem('deletedKOLs') || '[]');
    setDeletedKOLs(new Set(deletedKOLsList));
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">
      {/* Ultra-Modern Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb" style={{ animationDelay: '-4s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        {/* Radial Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-indigo-500/30 via-indigo-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-emerald-500/20 via-emerald-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Ultra-Modern Header */}
          <div className="text-center mb-16 space-y-8">
            <div className="relative">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-indigo-400 via-purple-500 to-emerald-400 bg-clip-text text-transparent">
                  <TypewriterText text="KOL" />
                                </span>
              </h1>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mt-2">
                <span className="bg-gradient-to-r from-emerald-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent">
                  Analyzer
                </span>
              </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-20 blur-2xl -z-10"></div>
                              </div>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
              Track and analyze <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-500 font-semibold">key opinion leaders</span> with advanced intelligence and real-time insights
            </p>
                              </div>

          {/* Enhanced Status & Controls Bar */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-2xl rounded-2xl border border-slate-600/50 p-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                {/* Enhanced Telegram Status */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur"></div>
                  <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-3">
                      <div className={`relative w-3 h-3 rounded-full ${telegramStatus.connected ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {telegramStatus.connected && (
                          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {telegramStatus.connected ? (
                          <Wifi className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${telegramStatus.connected ? 'text-emerald-400' : 'text-red-400'}`}>
                          {telegramStatus.connected ? 'Service Connected' : 'Service Disconnected'}
                                    </span>
                                </div>
                              </div>
                  </div>
                </div>
                
                {/* Enhanced Filter Options */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl blur"></div>
                  <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-3">
                      <Filter className="w-4 h-4 text-slate-400" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="bg-transparent text-white text-sm focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="bg-slate-800">All KOLs</option>
                        <option value="verified" className="bg-slate-800">Verified Only</option>
                        <option value="high-influence" className="bg-slate-800">High Influence</option>
                        <option value="recent" className="bg-slate-800">Recently Active</option>
                      </select>
                            </div>
                          </div>
                        </div>

                {/* Telegram Auth Section */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur"></div>
                  <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50">
                    {isTelegramAuthenticated ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-blue-400">
                            {telegramUser?.first_name || 'Connected'}
                                    </span>
                                </div>
                        <button
                          onClick={() => telegramLogout()}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                          title="Disconnect Telegram"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                              </div>
                    ) : (
                      <button
                        onClick={() => setShowTelegramAuth(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg border border-blue-500/30 hover:border-blue-500/50 transition-all duration-200"
                      >
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-blue-400">Connect Telegram</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* KOL Count Display */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur"></div>
                  <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-600/50">
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-indigo-400" />
                      <span className="text-slate-300">Tracking </span>
                      <span className="text-white font-bold">{filteredKOLs.length}</span>
                      <span className="text-slate-300"> of </span>
                      <span className="text-white font-bold">{kols.length}</span>
                      <span className="text-slate-300"> KOLs</span>
                    </div>
                  </div>
                </div>
                            </div>
                          </div>
                        </div>

          {/* Ultra-Modern Add KOL Interface */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-slate-600/50 p-8 md:p-12 shadow-2xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-emerald-500/5"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-2xl">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    Add New KOL
                  </h3>
                </div>

                <div className="space-y-6">
                  {/* Input Type Selector */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setInputType('username')}
                      className={`relative overflow-hidden px-6 py-3 rounded-2xl font-medium transition-all duration-300 group ${
                        inputType === 'username' 
                          ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/25' 
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 border border-slate-600'
                      }`}
                    >
                      {inputType === 'username' && (
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      )}
                      <div className="relative flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Username
                      </div>
                    </button>
                    <button
                      onClick={() => setInputType('channel')}
                      className={`relative overflow-hidden px-6 py-3 rounded-2xl font-medium transition-all duration-300 group ${
                        inputType === 'channel' 
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25' 
                          : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 border border-slate-600'
                      }`}
                    >
                      {inputType === 'channel' && (
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      )}
                      <div className="relative flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        Channel
                      </div>
                    </button>
                  </div>

                  {/* Input Field */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 rounded-2xl blur opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                    <div className="relative flex">
                      <input
                        type="text"
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        placeholder={inputType === 'username' ? '@username' : 't.me/channel_name'}
                        className="flex-1 px-6 py-4 bg-slate-900/60 backdrop-blur-sm border border-slate-600/50 rounded-l-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 text-lg"
                      />
                      <button
                        onClick={addManualKOL}
                        disabled={loading || !manualInput.trim()}
                        className="relative overflow-hidden px-8 py-4 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 rounded-r-2xl font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
                      >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <div className="relative flex items-center gap-3">
                          {loading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <Plus className="w-5 h-5" />
                          )}
                          <span>Add KOL</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Enhanced Error Display */}
                  {error && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500/20 rounded-xl blur"></div>
                      <div className="relative bg-red-900/40 backdrop-blur-sm border border-red-500/50 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                          <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Ultra-Modern KOL Grid */}
          {kols.length > 0 && (
            <div className="space-y-8">
              {/* Section Header */}
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-indigo-400 to-emerald-500 bg-clip-text text-transparent">
                    Tracked KOLs
                                  </span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Monitor and analyze key opinion leaders with real-time insights
                </p>
                                </div>

              {/* Enhanced KOL Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredKOLs.map((kol, index) => (
                  <div
                    key={kol.id}
                    onClick={() => setSelectedKOL(kol)}
                    className="group cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative">
                      {/* Card Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-emerald-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                      
                      {/* Main Card */}
                      <div className="relative bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-slate-600/50 p-8 transition-all duration-500 group-hover:border-slate-500/70 group-hover:transform group-hover:scale-[1.02] shadow-2xl">
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="relative z-10">
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-emerald-300 transition-all duration-300">
                                  {kol.name}
                                </h3>
                                {kol.verification_status === 'verified' && (
                                  <div className="flex items-center bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                                    <UserCheck className="w-4 h-4 text-emerald-400" />
                                    </div>
                                )}
                                </div>
                              <p className="text-slate-400 text-sm font-medium">@{kol.username}</p>
                              </div>
                            
                            <button
                              onClick={(e) => handleDelete(kol.username, e)}
                              className="relative overflow-hidden p-3 rounded-2xl bg-slate-700/50 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 group/delete"
                              disabled={deleteLoading === kol.username}
                            >
                              <div className="absolute inset-0 bg-red-500/20 transform scale-0 group-hover/delete:scale-100 transition-transform duration-300 rounded-2xl"></div>
                              <div className="relative">
                                {deleteLoading === kol.username ? (
                                  <Loader className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                                    </div>
                            </button>
                                </div>

                          {/* Influence Score */}
                          {kol.influence_score && (
                            <div className="flex items-center gap-3 mb-6">
                              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 rounded-2xl border border-purple-500/30">
                                <Star className="w-4 h-4 text-purple-400" />
                                <span className="text-purple-300 font-semibold">{kol.influence_score}</span>
                                <span className="text-purple-400 text-sm">Influence</span>
                              </div>
                            </div>
                          )}

                          {/* Enhanced Stats Grid */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-60"></div>
                              <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-700/50">
                                <div className="text-cyan-400 font-bold text-xl mb-1">
                                  {formatNumber(kol.stats.posts)}
                                </div>
                                <div className="text-slate-400 text-xs font-medium">Posts</div>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-60"></div>
                              <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-700/50">
                                <div className="text-emerald-400 font-bold text-xl mb-1">
                                  {formatNumber(kol.stats.views)}
                                </div>
                                <div className="text-slate-400 text-xs font-medium">Views</div>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-60"></div>
                              <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 text-center border border-slate-700/50">
                                <div className="text-purple-400 font-bold text-xl mb-1">
                                  {formatNumber(kol.stats.forwards)}
                                </div>
                                <div className="text-slate-400 text-xs font-medium">Shares</div>
                              </div>
                          </div>
                        </div>

                          {/* Last Activity */}
                          {kol.last_activity && (
                            <div className="mt-6 flex items-center gap-2 text-slate-400 text-sm">
                              <Clock className="w-4 h-4" />
                              <span>Active {formatDate(kol.last_activity)}</span>
                                </div>
                          )}

                          {/* Hover Effect Overlay */}
                          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                ))}
              </div>
                      </div>
                    )}

          {/* Selected KOL Details */}
          {selectedKOL && (
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-slate-600/50 p-8 shadow-2xl">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-emerald-500/5"></div>
                
                <div className="relative z-10">
                  {/* Selected KOL Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                        {selectedKOL.name}
                      </h2>
                      <p className="text-slate-400">@{selectedKOL.username}</p>
                    </div>
                    <button
                      onClick={() => setSelectedKOL(null)}
                      className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-2xl transition-colors duration-300"
                    >
                      <Activity className="w-6 h-6 text-slate-400" />
                    </button>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex gap-2 mb-8">
                    {[
                      { id: 'posts', label: 'Posts', icon: MessagesSquare },
                      { id: 'analysis', label: 'Analysis', icon: Brain },
                      { id: 'volume', label: 'Volume', icon: BarChart3 }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative overflow-hidden px-6 py-3 rounded-2xl font-medium transition-all duration-300 group ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-lg'
                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
                        }`}
                      >
                        {activeTab === tab.id && (
                          <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        )}
                        <div className="relative flex items-center gap-2">
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
              </div>
                      </button>
                    ))}
            </div>

                  {/* Tab Content */}
                  <div className="min-h-[400px]">
                    {activeTab === 'posts' && renderPostsView()}
                    {activeTab === 'analysis' && renderAnalysisView()}
                    {activeTab === 'volume' && renderVolumeView()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Telegram Auth Modal */}
      {showTelegramAuth && (
        <TelegramAuth 
          onAuthSuccess={handleTelegramAuthSuccess}
          onClose={() => setShowTelegramAuth(false)} 
        />
      )}
    </div>
  );
}