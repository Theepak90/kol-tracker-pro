import React, { useState, useEffect } from 'react';
import { Search, Bot, Users, TrendingUp, Download, Activity, Clock, AlertTriangle, Info } from 'lucide-react';
import { useTelegramAuth } from '../contexts/TelegramAuthContext';
import TelegramAuth from './TelegramAuth';

interface ChannelData {
  title: string;
  username?: string;
  description?: string;
  about?: string; // Telethon returns 'about' field for description
  member_count?: number | null;
  participants_count?: number | null; // Telethon returns 'participants_count'
  message_count?: number;
  kol_count?: number;
  verified?: boolean;
  scam?: boolean;
  fake?: boolean;
  scan?: boolean;
  scanned_at?: string;
  // Enhanced data fields
  enhanced_data?: boolean;
  active_members?: number;
  admin_count?: number;
  bot_count?: number;
  recent_activity?: Array<{
    id: number;
    text: string;
    date: string;
    views?: number;
    forwards?: number;
    author?: string;
  }>;
  kol_details?: Array<{
    user_id: string | number;
    username?: string;
    first_name?: string;
    last_name?: string;
    is_admin: boolean;
    is_verified?: boolean;
    kol_type?: string;
    influence_score?: number;
    engagement_rate?: number;
    avg_views?: number;
    posting_frequency?: number;
    content_quality_score?: number;
    bot_probability?: number;
    specialty_tags?: string[];
    follower_count?: number;
    message_count?: number;
    crypto_signals?: number;
    leadership_indicators?: number;
    engagement_received?: number;
    wallet_mentions?: number;
    cross_platform_refs?: number;
  }>;
}

interface ScanResponse extends ChannelData {
  success?: boolean;
  channel_data?: ChannelData;
  error?: string;
  message?: string;
}

const ChannelScanner: React.FC = () => {
  const [channelUrl, setChannelUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ChannelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showTelegramAuth, setShowTelegramAuth] = useState(false);
  const { isAuthenticated } = useTelegramAuth();

  const handleScan = async () => {
    if (!channelUrl.trim()) {
      setError('Please enter a channel URL or username');
      return;
    }

    if (!isAuthenticated) {
      setShowTelegramAuth(true);
      return;
    }

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      // Extract channel identifier from URL
      let channelId = channelUrl.trim();
      if (channelId.includes('t.me/')) {
        channelId = channelId.split('t.me/')[1];
      }
      if (channelId.startsWith('@')) {
        channelId = channelId.substring(1);
      }

      const userId = localStorage.getItem('telegram_user_id');
      if (!userId) {
        setError('User ID not found. Please reconnect your Telegram account.');
        setShowTelegramAuth(true);
        return;
      }
       
      const telethonUrl = import.meta.env.VITE_TELETHON_SERVICE_URL || 'http://localhost:8000';
      console.log('🔗 Using Telethon URL:', telethonUrl);
      console.log('📡 Scanning channel:', channelId, 'with user ID:', userId);
       
      const response = await fetch(`${telethonUrl}/scan/${channelId}?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: ScanResponse = await response.json();
      console.log('📋 Scan response:', data);

      // Handle both new Telethon direct response and old wrapped response
      if (response.ok && (data.title || (data.success && data.channel_data))) {
        let channelData = data.title ? data : data.channel_data!;
        
        // Normalize Telethon response fields
        const normalizedData: ChannelData = {
          ...channelData,
          // Use 'about' field as description if description is not available
          description: channelData.description || channelData.about || '',
          // Use 'participants_count' as member_count if member_count is not available  
          member_count: channelData.member_count ?? channelData.participants_count ?? null,
          // Add timestamp if not present
          scanned_at: channelData.scanned_at || new Date().toISOString(),
        };
        
        console.log('✅ Scan successful!', normalizedData);
        setScanResult(normalizedData);
      } else {
        console.error('❌ Scan failed:', data);
        setError(data.error || data.message || 'Failed to scan channel');
      }
    } catch (err) {
      console.error('🚨 Network/Scan error:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Service unavailable'}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleExport = () => {
    if (!scanResult) return;
    
    const exportData = {
      channel: scanResult.title,
      username: scanResult.username,
      description: scanResult.description,
      member_count: scanResult.member_count,
      kol_count: scanResult.kol_count,
      kol_details: scanResult.kol_details,
      exported_at: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scanResult.title || 'channel'}_analysis.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTelegramAuthSuccess = () => {
    setShowTelegramAuth(false);
    // Automatically trigger scan after successful auth
    if (channelUrl.trim()) {
      handleScan();
    }
  };

  const handleRetry = () => {
    setError(null);
    setScanResult(null);
    if (channelUrl.trim()) {
      handleScan();
    }
  };

  // Early return for error state
  if (error) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb" style={{ animationDelay: '-2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb" style={{ animationDelay: '-4s' }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/30 via-purple-500/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/20 via-cyan-500/5 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="container mx-auto px-6 py-12 max-w-2xl text-center">
            <div className="bg-red-900/20 backdrop-blur-xl rounded-2xl border border-red-500/50 p-8">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Scan Failed</h2>
              <p className="text-red-300 mb-6">{error}</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setError(null)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleRetry}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Ultra-Modern Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb" style={{ animationDelay: '-2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse floating-orb" style={{ animationDelay: '-4s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        {/* Radial Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/30 via-purple-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-cyan-500/20 via-cyan-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-16 space-y-8">
            <div className="relative">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                  CHANNEL
                </span>
              </h1>
              <h2 className="text-4xl md:text-6xl font-black text-white/90 -mt-4">
                SCANNER
              </h2>
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 blur-2xl -z-10"></div>
            </div>

            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Analyze Telegram channels with <span className="text-cyan-400 font-semibold">real-time intelligence</span> and 
              discover Key Opinion Leaders through <span className="text-purple-400 font-semibold">advanced scanning</span>
            </p>

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-50"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-full px-8 py-3 border border-slate-600/50">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
                    <span className="text-slate-300">Real-time Telegram Analysis Powered by Telethon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scanner Interface */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative bg-slate-800/40 backdrop-blur-2xl rounded-2xl border border-blue-500/20 p-6 shadow-2xl">
                <div className="flex items-center justify-center">
                  {!isAuthenticated ? (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                        <Info className="w-5 h-5 text-blue-400" />
                        <span className="text-blue-300 font-medium">Connect Telegram to start scanning</span>
                      </div>
                      <button
                        onClick={() => setShowTelegramAuth(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                      >
                        Connect Telegram
                      </button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-4 gap-6 items-end w-full">
                      <div className="md:col-span-3 relative group">
                        <input
                          type="text"
                          placeholder="Enter channel URL or @username"
                          value={channelUrl}
                          onChange={(e) => setChannelUrl(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                          className="w-full px-6 py-4 bg-slate-900/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300"
                        />
                      </div>
                      <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className="relative overflow-hidden px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 disabled:scale-100 group"
                      >
                        <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        <div className="relative flex items-center justify-center gap-3">
                          {isScanning ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              <span>Scanning...</span>
                            </>
                          ) : (
                            <>
                              <Search className="w-5 h-5" />
                              <span>Scan Channel</span>
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-600/30">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full mt-2"></div>
                  <p className="text-slate-300 text-sm">
                    Telegram authentication is required to access channel data and perform KOL analysis.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-xl blur"></div>
                <div className="relative bg-red-900/40 backdrop-blur-sm border border-red-500/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-300 font-medium">Scan Error</p>
                      <p className="text-red-200 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mt-6 relative">
                <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur"></div>
                <div className="relative bg-orange-900/40 backdrop-blur-sm border border-orange-500/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-orange-300 font-medium">Authentication Required</p>
                      <p className="text-orange-200 text-sm mt-1">
                        Please connect your Telegram account to start scanning channels and analyzing KOL data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {scanResult && (() => {
            // Use enhanced data if available, otherwise fall back to calculating from messages
            const activeMembers = scanResult.enhanced_data 
              ? (scanResult.active_members || 0)
              : (scanResult.recent_activity 
                  ? new Set(scanResult.recent_activity.map(msg => msg.author).filter(Boolean)).size
                  : 0);
            
            // Get KOL count with better detection
            const kolCount = scanResult.kol_count || (scanResult.kol_details ? scanResult.kol_details.length : 0);
            
            // Enhanced stats with new data
            const statsData = [
              { 
                icon: Users, 
                label: 'Total Members', 
                value: scanResult.member_count !== null && scanResult.member_count !== undefined 
                  ? scanResult.member_count.toLocaleString() 
                  : 'Private Channel', 
                color: 'from-blue-500 to-cyan-500', 
                bg: 'from-blue-500/20 to-cyan-500/20' 
              },
              { 
                icon: Activity, 
                label: scanResult.enhanced_data ? 'Active Members' : 'Subscribers', 
                value: scanResult.enhanced_data 
                  ? (activeMembers > 0 
                      ? `${activeMembers.toLocaleString()} Active` 
                      : (scanResult.member_count && scanResult.member_count > 0 
                          ? `${scanResult.member_count.toLocaleString()} Subscribers`
                          : 'No Data Available'))
                  : (scanResult.member_count && scanResult.member_count > 0 
                      ? `${scanResult.member_count.toLocaleString()} Subscribers`
                      : (activeMembers > 0 ? `${activeMembers} Active` : 'No Data Available')), 
                color: 'from-emerald-500 to-teal-500', 
                bg: 'from-emerald-500/20 to-teal-500/20' 
              },
              { 
                icon: Bot, 
                label: scanResult.enhanced_data ? 'Admins & Bots' : 'Recent Messages', 
                value: scanResult.enhanced_data 
                  ? ((scanResult.admin_count || 0) > 0 || (scanResult.bot_count || 0) > 0
                      ? `${scanResult.admin_count || 0} Admins, ${scanResult.bot_count || 0} Bots`
                      : 'No Admin Data')
                  : (scanResult.recent_activity && scanResult.recent_activity.length > 0 
                      ? `${scanResult.recent_activity.length} Messages` 
                      : 'No Messages'), 
                color: 'from-amber-500 to-orange-500', 
                bg: 'from-amber-500/20 to-orange-500/20' 
              },
              { 
                icon: TrendingUp, 
                label: 'KOL Detected', 
                value: kolCount > 0 
                  ? `${kolCount} KOLs Found` 
                  : 'No KOLs Detected', 
                color: kolCount > 0 
                  ? 'from-purple-500 to-violet-500' 
                  : 'from-gray-500 to-slate-500', 
                bg: kolCount > 0 
                  ? 'from-purple-500/20 to-violet-500/20' 
                  : 'from-gray-500/20 to-slate-500/20' 
              }
            ];

            return (
              <div className="space-y-8 animate-fadeIn">
                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statsData.map((stat, index) => (
                    <div key={index} className="group relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} rounded-2xl blur opacity-60 group-hover:opacity-80 transition-opacity duration-500`}></div>
                      <div className="relative bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                              {stat.value}
                            </div>
                          </div>
                        </div>
                        <h3 className="text-slate-300 text-sm font-medium">{stat.label}</h3>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Channel Information */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
                  <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                        Channel Intelligence
                      </h2>
                      <button
                        onClick={handleExport}
                        className="relative overflow-hidden px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 rounded-xl font-medium text-white transition-all duration-300 group"
                      >
                        <div className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                        <div className="relative flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          <span>Export Data</span>
                        </div>
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-slate-400 text-sm font-medium mb-2">Channel Identity</h3>
                          <p className="text-xl font-semibold text-white flex items-center gap-2">
                            {scanResult.title} 
                            {scanResult.username && (
                              <span className="text-slate-400 font-normal">@{scanResult.username}</span>
                            )}
                            {scanResult.verified && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">✓ Verified</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-slate-400 text-sm font-medium mb-2">Channel Description</h3>
                          <p className="text-slate-300 leading-relaxed">
                            {scanResult.description && scanResult.description.trim() 
                              ? scanResult.description 
                              : 'No description available - This channel has not provided a public description'}
                          </p>
                          {(scanResult.scam || scanResult.fake) && (
                            <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded-lg">
                              <p className="text-red-300 text-sm font-medium">
                                ⚠ Warning: This channel has been flagged as {scanResult.scam ? 'scam' : 'fake'} by Telegram
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-slate-400 text-sm font-medium mb-2">Scan Information</h3>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-300">
                              <Clock className="w-4 h-4 text-cyan-400" />
                              <span>{scanResult.scanned_at ? new Date(scanResult.scanned_at).toLocaleString() : 'Just now'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-sm">Real-time data from Telegram API</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-slate-400 text-sm font-medium mb-2">Analysis Depth</h3>
                          <div className="space-y-2">
                            <div className="text-slate-300">
                              {scanResult.enhanced_data 
                                ? "🔍 Enhanced scan with detailed member analysis" 
                                : "📊 Basic scan with message analysis"}
                            </div>
                            {scanResult.enhanced_data && (
                              <div className="flex items-center gap-2 text-emerald-400">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                <span className="text-sm font-medium">Enhanced data available</span>
                              </div>
                            )}
                            {!scanResult.enhanced_data && (
                              <div className="text-xs text-slate-400">
                                Limited to public channel data and recent messages
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real Message Activity */}
                {scanResult.recent_activity && scanResult.recent_activity.length > 0 && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 rounded-2xl blur-xl"></div>
                    <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                          Real-Time Channel Activity
                        </h2>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span className="text-emerald-300 text-sm font-medium">Live Data</span>
                        </div>
                      </div>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {scanResult.recent_activity.slice(0, 10).map((message, index: number) => (
                          <div key={message.id || index} className="bg-slate-900/40 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                <span className="text-xs text-slate-400 font-mono">
                                  {message.id ? `ID: ${message.id}` : `Message ${index + 1}`}
                                </span>
                                {message.author && (
                                  <span className="text-xs text-emerald-400">@{message.author}</span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400">
                                {message.date ? new Date(message.date).toLocaleString() : 'Recent'}
                              </span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">
                              {message.text && message.text.length > 0 
                                ? (message.text.substring(0, 200) + (message.text.length > 200 ? '...' : ''))
                                : 'No text content'}
                            </p>
                            {(message.views || message.forwards) && (
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                {message.views && <span>👁️ {message.views.toLocaleString()} views</span>}
                                {message.forwards && <span>🔄 {message.forwards.toLocaleString()} forwards</span>}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-center">
                        <span className="text-sm text-slate-400">
                          Showing {Math.min(10, scanResult.recent_activity.length)} of {scanResult.recent_activity.length} recent messages
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* KOL Details */}
                {(scanResult.kol_count && scanResult.kol_count > 0) && scanResult.kol_details && scanResult.kol_details.length > 0 ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>
                    <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-8">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-6">
                        Key Opinion Leaders
                      </h2>
                      <div className="overflow-hidden rounded-xl">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-slate-900/60 backdrop-blur-sm">
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">KOL Identity</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Influence Score</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Content Quality</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Activity Metrics</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Specialties</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                              {scanResult.kol_details.map((kol, index) => (
                                <tr key={kol.user_id} className="group hover:bg-slate-700/30 transition-all duration-200">
                                  {/* KOL Identity */}
                                  <td className="px-4 py-4 text-sm">
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-cyan-400 font-medium">
                                          {kol.username ? `@${kol.username}` : 'No username'}
                                        </span>
                                        {kol.is_verified && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                            ✓ Verified
                                          </span>
                                        )}
                                        {kol.is_admin && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                            👑 Admin
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-slate-300 text-sm">
                                        {[kol.first_name, kol.last_name].filter(Boolean).join(' ') || 'N/A'}
                                      </span>
                                      {kol.follower_count && kol.follower_count > 0 && (
                                        <span className="text-slate-400 text-xs">
                                          {kol.follower_count.toLocaleString()} followers
                                        </span>
                                      )}
                                      {kol.bot_probability && kol.bot_probability > 0.3 && (
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                                          ⚠️ High Bot Risk
                                        </span>
                                      )}
                                      <span className="text-slate-500 font-mono text-xs">ID: {kol.user_id}</span>
                                    </div>
                                  </td>

                                  {/* Influence Score */}
                                  <td className="px-4 py-4 text-sm">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-2xl font-bold ${
                                          (kol.influence_score || 0) >= 50 ? 'text-emerald-400' :
                                          (kol.influence_score || 0) >= 25 ? 'text-yellow-400' : 'text-blue-400'
                                        }`}>
                                          {kol.influence_score || 0}
                                        </span>
                                        <div className={`w-2 h-2 rounded-full ${
                                          (kol.influence_score || 0) >= 50 ? 'bg-emerald-400' :
                                          (kol.influence_score || 0) >= 25 ? 'bg-yellow-400' : 'bg-blue-400'
                                        }`}></div>
                                      </div>
                                      <span className="text-xs text-slate-400">
                                        {(kol.influence_score || 0) >= 50 ? 'High Influence' :
                                         (kol.influence_score || 0) >= 25 ? 'Moderate Influence' : 'Growing Influence'}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Content Quality */}
                                  <td className="px-4 py-4 text-sm">
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center gap-2">
                                        <div className={`w-12 h-2 rounded-full overflow-hidden ${
                                          (kol.content_quality_score || 0) >= 0.7 ? 'bg-emerald-500/20' :
                                          (kol.content_quality_score || 0) >= 0.5 ? 'bg-yellow-500/20' : 'bg-red-500/20'
                                        }`}>
                                          <div 
                                            className={`h-full transition-all duration-300 ${
                                              (kol.content_quality_score || 0) >= 0.7 ? 'bg-emerald-500' :
                                              (kol.content_quality_score || 0) >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${(kol.content_quality_score || 0) * 100}%` }}
                                          />
                                        </div>
                                        <span className={`text-xs font-medium ${
                                          (kol.content_quality_score || 0) >= 0.7 ? 'text-emerald-400' :
                                          (kol.content_quality_score || 0) >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                          {((kol.content_quality_score || 0) * 100).toFixed(0)}%
                                        </span>
                                      </div>
                                      <span className="text-xs text-slate-400">
                                        {(kol.content_quality_score || 0) >= 0.7 ? 'High Quality' :
                                         (kol.content_quality_score || 0) >= 0.5 ? 'Good Quality' : 'Basic Content'}
                                      </span>
                                      {kol.engagement_rate && kol.engagement_rate > 0 && (
                                        <span className="text-xs text-cyan-400">
                                          {kol.engagement_rate.toFixed(1)}% engagement
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Activity Metrics */}
                                  <td className="px-4 py-4 text-sm">
                                    <div className="flex flex-col gap-1">
                                      {kol.posting_frequency && kol.posting_frequency > 0 && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-emerald-300">📝 {kol.posting_frequency.toFixed(1)}</span>
                                          <span className="text-xs text-slate-400">posts/week</span>
                                        </div>
                                      )}
                                      {kol.avg_views && kol.avg_views > 0 && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-cyan-300">👁️ {kol.avg_views.toLocaleString()}</span>
                                          <span className="text-xs text-slate-400">avg views</span>
                                        </div>
                                      )}
                                      {kol.message_count && kol.message_count > 0 && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-blue-300">💬 {kol.message_count}</span>
                                          <span className="text-xs text-slate-400">total posts</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Specialties */}
                                  <td className="px-4 py-4 text-sm">
                                    <div className="flex flex-col gap-1">
                                      {kol.specialty_tags && kol.specialty_tags.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {kol.specialty_tags.slice(0, 3).map((tag, tagIndex) => (
                                            <span 
                                              key={tagIndex}
                                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30"
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                          {kol.specialty_tags.length > 3 && (
                                            <span className="text-xs text-slate-400">
                                              +{kol.specialty_tags.length - 3} more
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <div className="flex flex-col gap-1">
                                          {(kol.crypto_signals || 0) > 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-300 border border-orange-500/30">
                                              📈 {kol.crypto_signals} signals
                                            </span>
                                          )}
                                          {(kol.wallet_mentions || 0) > 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-300 border border-green-500/30">
                                              💰 {kol.wallet_mentions} wallets
                                            </span>
                                          )}
                                          {(!kol.crypto_signals && !kol.wallet_mentions) && (
                                            <span className="text-xs text-slate-400">General Content</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        {/* Enhanced KOL Analysis Summary */}
                        <div className="mt-6 p-4 bg-slate-900/40 rounded-xl border border-slate-700/50">
                          <h3 className="text-sm font-semibold text-slate-300 mb-2">🔍 Advanced KOL Detection Insights</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
                            <div>
                              <strong className="text-emerald-300">Real Influence Analysis:</strong> Multi-factor scoring based on posting frequency, engagement rates, and content quality (min 50% quality threshold)
                            </div>
                            <div>
                              <strong className="text-purple-300">Bot Detection:</strong> Advanced filtering removes fake accounts (max 40% bot probability) ensuring only genuine influencers are detected
                            </div>
                            <div>
                              <strong className="text-cyan-300">Content Specialization:</strong> AI analysis identifies expertise areas (Bitcoin, DeFi, NFT, Trading) based on actual message content and patterns
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <p className="text-xs text-slate-500">
                              ⚡ Enhanced detection requires: 2+ posts/week, 300+ avg views, 1.5%+ engagement rate, and human-verified content quality
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 via-gray-500/10 to-slate-500/10 rounded-2xl blur-xl"></div>
                    <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-600/50 p-8">
                      <div className="text-center py-8">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-slate-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-300 mb-2">No KOLs Detected</h3>
                            <p className="text-slate-400 text-sm">
                              This channel doesn't provide Key Opinion Leader data or they haven't been identified yet.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
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
};

export default ChannelScanner;