import React, { useState, useEffect } from 'react';
import { Search, User, TrendingUp, MessageCircle, Clock, ExternalLink, Star, MoreHorizontal, Loader2, Plus, X, Link, AtSign, Brain, BarChart3, AlertTriangle, CheckCircle, TrendingDown, Users, Eye, Forward, Bot, Zap } from 'lucide-react';
import { telegramService } from '../services/telegramService';
import { apiService, KOL } from '../services/apiService';
import { aiAnalysisService, AIAnalysis } from '../services/aiAnalysisService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();
  const [kols, setKols] = useState<KOL[]>([]);
  const [selectedKOL, setSelectedKOL] = useState<KOL | null>(null);
  const [isLoadingKOLs, setIsLoadingKOLs] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userPosts, setUserPosts] = useState<UserPost[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [formData, setFormData] = useState<KOLFormData>({
    displayName: '',
    telegramUsername: '',
    description: '',
    tags: []
  });
  const [isAddingKOL, setIsAddingKOL] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState<'posts' | 'analysis'>('posts');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKOL, setNewKOL] = useState<KOLFormData>({
    telegramUsername: '',
    displayName: '',
    description: '',
    tags: [],
  });
  const [hasError, setHasError] = useState(false);
  const [componentError, setComponentError] = useState<string | null>(null);

  // Error boundary for this component
  const handleError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    setComponentError(`Error in ${context}: ${error.message || 'Unknown error'}`);
    setHasError(true);
  };

  // Safe state setters
  const safeSetKols = (newKols: KOL[] | ((prev: KOL[]) => KOL[])) => {
    try {
      if (typeof newKols === 'function') {
        setKols(prev => {
          const result = newKols(Array.isArray(prev) ? prev : []);
          return Array.isArray(result) ? result : [];
        });
      } else {
        setKols(Array.isArray(newKols) ? newKols : []);
      }
    } catch (error) {
      handleError(error, 'safeSetKols');
      setKols([]);
    }
  };

  const safeSetUserPosts = (newPosts: UserPost[] | ((prev: UserPost[]) => UserPost[])) => {
    try {
      if (typeof newPosts === 'function') {
        setUserPosts(prev => {
          const result = newPosts(Array.isArray(prev) ? prev : []);
          return Array.isArray(result) ? result : [];
        });
      } else {
        setUserPosts(Array.isArray(newPosts) ? newPosts : []);
      }
    } catch (error) {
      handleError(error, 'safeSetUserPosts');
      setUserPosts([]);
    }
  };

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setHasError(false);
        await loadKOLs();
      } catch (error) {
        console.error('Failed to initialize KOL Analyzer:', error);
        setHasError(true);
        toast.error('Failed to initialize component, using demo data');
        // Set fallback demo data
        setKols([
          {
            _id: "demo1",
            displayName: "Crypto Whale",
            telegramUsername: "cryptowhale",
            description: "Leading crypto analyst and trader",
            tags: ["crypto", "trading", "analysis"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: "demo2",
            displayName: "DeFi Expert",
            telegramUsername: "defiexpert",
            description: "Decentralized finance specialist",
            tags: ["defi", "yield", "protocols"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]);
      }
    };
    
    initializeComponent();
  }, []);

  const loadKOLs = async () => {
    try {
      setIsLoadingKOLs(true);
      const kols = await apiService.getKOLs();
      // Ensure we always have an array and each KOL has proper tags
      const validKols = Array.isArray(kols) ? kols.map(kol => ({
        ...kol,
        tags: Array.isArray(kol.tags) ? kol.tags : []
      })) : [];
      safeSetKols(validKols);
    } catch (error) {
      console.error('Failed to load KOLs:', error);
      toast.error('Failed to load KOLs, using demo data');
      // Set fallback demo data
      setKols([
        {
          _id: "demo1",
          displayName: "Crypto Whale",
          telegramUsername: "cryptowhale",
          description: "Leading crypto analyst and trader",
          tags: ["crypto", "trading", "analysis"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: "demo2",
          displayName: "DeFi Expert",
          telegramUsername: "defiexpert",
          description: "Decentralized finance specialist",
          tags: ["defi", "yield", "protocols"],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoadingKOLs(false);
    }
  };

  const handleAddKOL = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAddingKOL(true);
      const newKOL = await apiService.createKOL(formData);
      safeSetKols(prevKols => [...prevKols, newKOL]);
      setFormData({
        displayName: '',
        telegramUsername: '',
        description: '',
        tags: []
      });
      toast.success('KOL added successfully');
      
      // Load posts for the new KOL
      await loadKOLPosts(newKOL);
      setSelectedKOL(newKOL);
    } catch (error) {
      console.error('Failed to add KOL:', error);
      toast.error('Failed to add KOL');
    } finally {
      setIsAddingKOL(false);
    }
  };

  const loadKOLPosts = async (kol: KOL) => {
    if (!kol || !kol.telegramUsername) {
      console.error('Invalid KOL data provided');
      toast.error('Invalid KOL selected');
      return;
    }

    try {
      setIsLoadingPosts(true);
      
      // First check if Telethon service is available
      let isHealthy = false;
      try {
        isHealthy = await telegramService.checkHealth();
      } catch (healthError) {
        console.warn('Health check failed:', healthError);
        isHealthy = false;
      }
      
      if (!isHealthy) {
        console.warn('Telethon service is not available, using demo data');
        // Use demo data for testing
        const demoResponse = generateDemoPostsData(kol.telegramUsername);
        safeSetUserPosts(demoResponse.posts);
        
        // Update KOL stats
        const updatedKOL = {
          ...kol,
          stats: {
            totalPosts: demoResponse.total_posts,
            totalViews: demoResponse.total_views,
            totalForwards: demoResponse.total_forwards,
            lastUpdated: new Date().toISOString()
          }
        };
        
        // Update the KOL in the list safely
        safeSetKols(prevKols => Array.isArray(prevKols) ? 
          prevKols.map(k => k.telegramUsername === kol.telegramUsername ? updatedKOL : k) : 
          [updatedKOL]
        );
        setSelectedKOL(updatedKOL);
        
        // Save updated stats to backend
        try {
          await apiService.updateKOL(kol.telegramUsername, updatedKOL);
        } catch (error) {
          console.warn('Failed to save demo stats to backend:', error);
        }
        
        toast.success('Demo data loaded for testing (Telethon service unavailable)');
        return;
      }
      
      const response = await telegramService.trackUserPosts(kol.telegramUsername);
      safeSetUserPosts(response.posts);
      
      // Update KOL stats
      const updatedKOL = {
        ...kol,
        stats: {
          totalPosts: response.total_posts,
          totalViews: response.total_views,
          totalForwards: response.total_forwards,
          lastUpdated: new Date().toISOString()
        }
      };
      
      // Update the KOL in the list safely
      safeSetKols(prevKols => Array.isArray(prevKols) ? 
        prevKols.map(k => k.telegramUsername === kol.telegramUsername ? updatedKOL : k) : 
        [updatedKOL]
      );
      setSelectedKOL(updatedKOL);
      
      // Save updated stats to backend
      await apiService.updateKOL(kol.telegramUsername, updatedKOL);
    } catch (error) {
      console.error('Failed to load KOL posts:', error);
      
      // Fallback to demo data
      console.warn('Using demo data as fallback');
      const demoResponse = generateDemoPostsData(kol.telegramUsername);
      safeSetUserPosts(demoResponse.posts);
      
      // Update KOL stats with demo data
      const updatedKOL = {
        ...kol,
        stats: {
          totalPosts: demoResponse.total_posts,
          totalViews: demoResponse.total_views,
          totalForwards: demoResponse.total_forwards,
          lastUpdated: new Date().toISOString()
        }
      };
      
      safeSetKols(prevKols => Array.isArray(prevKols) ? 
        prevKols.map(k => k.telegramUsername === kol.telegramUsername ? updatedKOL : k) : 
        [updatedKOL]
      );
      setSelectedKOL(updatedKOL);
      
      toast.error('Failed to load real posts, using demo data for testing');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Generate demo posts data for testing
  const generateDemoPostsData = (username: string) => {
    const posts: UserPost[] = [];
    const now = new Date();
    
    const demoTexts = [
      `🚀 New gem alert! $PEPE showing strong momentum with 50M volume in the last hour. This could be the next 100x!`,
      `📈 Market update: BTC holding strong above $65K. Expecting a breakout to $70K soon. Alt season incoming?`,
      `⚡ Quick scalp opportunity: $WOJAK forming a perfect cup and handle pattern. Entry: $0.0001, Target: $0.0003`,
      `🔥 DeFi play: New yield farming pool launched on Uniswap. 200% APY for the first week. DYOR!`,
      `💎 Diamond hands needed: $SHIB accumulation phase complete. Next stop: moon! 🌙`,
      `📊 Technical analysis: RSI oversold on most alts. Perfect buying opportunity for patient investors.`,
      `🎯 Trade update: $DOGE call from yesterday hit 150% profit. Taking profits and moving stop to breakeven.`,
      `⚠️ Risk management reminder: Never invest more than you can afford to lose. Crypto is volatile!`,
      `🏆 Portfolio update: Up 300% this month thanks to careful position sizing and risk management.`,
      `🔍 Research note: New L2 solution launching next week. Could be the next big infrastructure play.`
    ];

    for (let i = 0; i < 15; i++) {
      const postDate = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000)); // Every 2 hours
      const text = demoTexts[Math.floor(Math.random() * demoTexts.length)];
      const views = Math.floor(1000 + Math.random() * 50000);
      const forwards = Math.floor(views * 0.1 * Math.random());
      
      posts.push({
        message_id: 1000 + i,
        text,
        date: postDate.toISOString(),
        views,
        forwards,
        channel_id: 123456789,
        channel_title: `${username}_channel`
      });
    }

    const total_views = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const total_forwards = posts.reduce((sum, post) => sum + (post.forwards || 0), 0);

    return {
      username,
      posts,
      total_posts: posts.length,
      total_views,
      total_forwards
    };
  };

  const handleAnalyzeKOL = async () => {
    if (!selectedKOL || userPosts.length === 0) {
      toast.error('No KOL selected or no posts available for analysis');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Use the new dummy AI analysis service
      const analysis = await aiAnalysisService.analyzeKOLPosts(userPosts, selectedKOL.telegramUsername);
      
      setAiAnalysis(analysis);
      setActiveTab('analysis');
      toast.success('AI analysis completed successfully!');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Failed to analyze KOL posts');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectKOL = async (kol: KOL) => {
    setSelectedKOL(kol);
    setAiAnalysis(null);
    setActiveTab('posts');
    await loadKOLPosts(kol);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Enhanced filteredKOLs with multiple safety layers
  const filteredKOLs = React.useMemo(() => {
    try {
      // Ensure kols is always an array
      const safeKols = Array.isArray(kols) ? kols : [];
      
      if (!searchTerm || searchTerm.trim() === '') {
        return safeKols;
      }
      
      const searchLower = searchTerm.toLowerCase();
      
      return safeKols.filter(kol => {
        try {
          // Multiple safety checks for each property
          const displayNameMatch = kol?.displayName && typeof kol.displayName === 'string' 
            ? kol.displayName.toLowerCase().includes(searchLower) 
            : false;
            
          const usernameMatch = kol?.telegramUsername && typeof kol.telegramUsername === 'string'
            ? kol.telegramUsername.toLowerCase().includes(searchLower)
            : false;
            
          const tagsMatch = Array.isArray(kol?.tags) && kol.tags.length > 0
            ? kol.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchLower))
            : false;
            
          return displayNameMatch || usernameMatch || tagsMatch;
        } catch (filterError) {
          console.warn('Error filtering KOL:', kol, filterError);
          return false;
        }
      });
    } catch (error) {
      console.error('Error in filteredKOLs calculation:', error);
      return Array.isArray(kols) ? kols : [];
    }
  }, [kols, searchTerm]);

  const renderAIAnalysis = () => {
    if (!aiAnalysis) return null;

    return (
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

        {/* Content Analysis */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Analysis</h3>
          
          {/* Primary Topics */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Primary Topics</h4>
            <div className="space-y-2">
              {aiAnalysis.topics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{topic.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${topic.frequency}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-10">
                      {topic.frequency.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Average Views</p>
              <p className="text-lg font-semibold text-gray-900">
                {aiAnalysis.engagement.avgViews.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Forwards</p>
              <p className="text-lg font-semibold text-gray-900">
                {aiAnalysis.engagement.avgForwards.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
            Risk Assessment
          </h3>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Risk Level</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                aiAnalysis.riskAssessment.level === 'Critical' ? 'bg-red-100 text-red-800' :
                aiAnalysis.riskAssessment.level === 'High' ? 'bg-orange-100 text-orange-800' :
                aiAnalysis.riskAssessment.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {aiAnalysis.riskAssessment.level}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  aiAnalysis.riskAssessment.level === 'Critical' ? 'bg-red-600' :
                  aiAnalysis.riskAssessment.level === 'High' ? 'bg-orange-600' :
                  aiAnalysis.riskAssessment.level === 'Medium' ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${aiAnalysis.riskAssessment.score}%` }}
              ></div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Factors</h4>
            <ul className="space-y-1">
              {aiAnalysis.riskAssessment.factors.map((factor, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations</h4>
            <ul className="space-y-1">
              {aiAnalysis.riskAssessment.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <ul className="space-y-3">
            {aiAnalysis.insights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-xs font-medium">{index + 1}</span>
                </div>
                <p className="text-sm text-gray-700">{insight}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  // If there's a component error, show error UI
  if (componentError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Component Error</h2>
          <p className="text-gray-600 mb-4">{componentError}</p>
          <button
            onClick={() => {
              setComponentError(null);
              setHasError(false);
              window.location.reload();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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

            {/* Add KOL Button */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>Add New KOL</span>
              </button>
            </div>

            {/* Add KOL Form */}
            {showAddForm && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <form onSubmit={handleAddKOL} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telegram Username
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.telegramUsername}
                      onChange={(e) => setFormData({...formData, telegramUsername: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Display Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Brief description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Add tag..."
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(formData.tags) ? formData.tags : []).map(tag => (
                        <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-blue-600"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isAddingKOL}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAddingKOL ? 'Adding...' : 'Add KOL'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* KOL List */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">KOLs ({(Array.isArray(kols) ? kols : []).length})</h2>
              
              <div className="space-y-4">
                {isLoadingKOLs ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="animate-spin" size={24} />
                  </div>
                ) : (Array.isArray(filteredKOLs) ? filteredKOLs : []).length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No KOLs found
                  </div>
                ) : (
                  (Array.isArray(filteredKOLs) ? filteredKOLs : []).map(kol => {
                    try {
                      return (
                        <div
                          key={kol.telegramUsername}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedKOL?.telegramUsername === kol.telegramUsername
                              ? 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectKOL(kol)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{kol.displayName}</h3>
                              <p className="text-sm text-gray-500">@{kol.telegramUsername}</p>
                            </div>
                            {kol.stats && (
                              <div className="text-right text-sm text-gray-500">
                                <p>{kol.stats.totalPosts} posts</p>
                                <p>{kol.stats.totalViews} views</p>
                              </div>
                            )}
                          </div>
                          {Array.isArray(kol.tags) && kol.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {kol.tags.map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    } catch (error) {
                      console.error('Error rendering KOL:', kol, error);
                      return null;
                    }
                  })
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
                      <div>
                        <h2 className="text-2xl font-bold">{selectedKOL.displayName}</h2>
                        <div className="flex items-center space-x-2 text-gray-500 mt-1">
                          <Link size={16} />
                          <a
                            href={`https://t.me/${selectedKOL.telegramUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-500"
                          >
                            @{selectedKOL.telegramUsername}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {selectedKOL.stats && (
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold">{selectedKOL.stats.totalPosts}</p>
                              <p className="text-sm text-gray-500">Posts</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{selectedKOL.stats.totalViews}</p>
                              <p className="text-sm text-gray-500">Views</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold">{selectedKOL.stats.totalForwards}</p>
                              <p className="text-sm text-gray-500">Forwards</p>
                            </div>
                          </div>
                        )}
                        <button
                          onClick={handleAnalyzeKOL}
                          disabled={isAnalyzing || (Array.isArray(userPosts) ? userPosts : []).length === 0}
                          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Brain size={20} />
                          <span>{isAnalyzing ? 'Analyzing...' : 'AI Analysis'}</span>
                          {isAnalyzing && <Loader2 className="animate-spin" size={16} />}
                        </button>
                      </div>
                    </div>
                    {selectedKOL.description && (
                      <p className="mt-4 text-gray-600">{selectedKOL.description}</p>
                    )}
                    {Array.isArray(selectedKOL.tags) && selectedKOL.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {selectedKOL.tags.map(tag => (
                          <span key={tag} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
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
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'posts'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <MessageCircle size={16} />
                          <span>Posts ({(Array.isArray(userPosts) ? userPosts : []).length})</span>
                        </div>
                      </button>
                      <button
                        onClick={() => setActiveTab('analysis')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'analysis'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <BarChart3 size={16} />
                          <span>AI Analysis</span>
                          {aiAnalysis && <CheckCircle size={16} className="text-green-500" />}
                        </div>
                      </button>
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'posts' && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Recent Posts</h3>
                        {isLoadingPosts ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin" size={32} />
                          </div>
                        ) : (!Array.isArray(userPosts) || userPosts.length === 0) ? (
                          <div className="text-center text-gray-500 py-8">
                            No posts found
                          </div>
                        ) : (
                          (Array.isArray(userPosts) ? userPosts : [])
                            .filter(post => {
                              try {
                                return post && typeof post === 'object' && post.message_id;
                              } catch (error) {
                                console.error('Error filtering post:', post, error);
                                return false;
                              }
                            })
                            .map(post => {
                              try {
                                return (
                                  <div key={post.message_id} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-gray-800 whitespace-pre-wrap">{post.text || 'No content'}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                          <span className="flex items-center">
                                            <Clock size={16} className="mr-1" />
                                            {post.date ? new Date(post.date).toLocaleDateString() : 'Unknown date'}
                                          </span>
                                          {post.views !== null && post.views !== undefined && (
                                            <span className="flex items-center">
                                              <TrendingUp size={16} className="mr-1" />
                                              {post.views} views
                                            </span>
                                          )}
                                          {post.forwards !== null && post.forwards !== undefined && (
                                            <span className="flex items-center">
                                              <MessageCircle size={16} className="mr-1" />
                                              {post.forwards} forwards
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              } catch (error) {
                                console.error('Error rendering post:', post, error);
                                return null;
                              }
                            })
                        )}
                      </div>
                    )}

                    {activeTab === 'analysis' && (
                      <div className="space-y-6">
                        {!aiAnalysis ? (
                          <div className="text-center py-8">
                            <Brain size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No AI Analysis Available</h3>
                            <p className="text-gray-500 mb-4">Click the "AI Analysis" button to analyze this KOL's posts</p>
                            <button
                              onClick={handleAnalyzeKOL}
                              disabled={isAnalyzing || (Array.isArray(userPosts) ? userPosts : []).length === 0}
                              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                            >
                              <Brain size={20} />
                              <span>{isAnalyzing ? 'Analyzing...' : 'Start AI Analysis'}</span>
                              {isAnalyzing && <Loader2 className="animate-spin" size={16} />}
                            </button>
                          </div>
                        ) : (
                          renderAIAnalysis()
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Users size={48} className="mx-auto mb-4" />
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