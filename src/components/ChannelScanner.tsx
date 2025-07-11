import React, { useState } from 'react';
import { Search, Users, Bot, TrendingUp, Calendar, AlertCircle, Loader2, MoreHorizontal, Plus, MessagesSquare, Download, Activity, Clock, Wifi, WifiOff } from 'lucide-react';
import { telegramService } from '../services/telegramService';
import { useChannelScanner } from '../contexts/ChannelScannerContext';
import { TypewriterText } from './TypewriterText';

interface KOLInfo {
  user_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
}

interface GroupScan {
  channel_id: number;
  title: string;
  username: string | null;
  description: string | null;
  member_count: number;
  active_members: number;
  bot_count: number;
  kol_count: number;
  kol_details: KOLInfo[];
  scanned_at: string;
}

interface ChannelInfo extends GroupScan {
  previous_scans?: GroupScan[];
}

interface APIResponse {
  success: boolean;
  data?: ChannelInfo;
  error?: string;
}

export function ChannelScanner() {
  const [scanURL, setScanURL] = useState('');
  const [serviceStatus, setServiceStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const { scanResult, setScanResult, isScanning, setIsScanning, error, setError } = useChannelScanner();

  // Check service status on component mount
  React.useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = async () => {
    setServiceStatus('checking');
    try {
      const status = await telegramService.checkStatus();
      setServiceStatus(status.connected ? 'online' : 'offline');
    } catch (err) {
      setServiceStatus('offline');
    }
  };

  const extractChannelUsername = (input: string): string => {
    let username = input.trim();
    
    // Remove protocol and domain
    username = username.replace(/^(?:https?:\/\/)?(?:t\.me\/|telegram\.me\/)?/, '');
    
    // Remove @ symbol if present
    username = username.replace(/^@/, '');
    
    // Handle join links and extract channel name
    username = username.split('?')[0]; // Remove query parameters
    username = username.split('/')[0]; // Take only the username part
    
    // More flexible validation - allow 3-32 characters including hyphens
    if (!username || username.length < 3 || username.length > 32) {
      throw new Error('Invalid channel username. Username should be 3-32 characters long.');
    }
    
    // Allow letters, numbers, underscores and hyphens
    if (!/^[a-zA-Z0-9_\-]+$/.test(username)) {
      throw new Error('Invalid channel username format. Username can only contain letters, numbers, underscores, and hyphens.');
    }
    
    return username;
  };

  const handleScan = async () => {
    if (!scanURL) return;
    
    setIsScanning(true);
    setError(null);

    try {
      // First check service status
      const status = await telegramService.checkStatus();
      if (!status.connected) {
        throw new Error('Telegram service is currently unavailable. Please wait for the service to reconnect and try again.');
      }

      const channelUsername = extractChannelUsername(scanURL);
      const result = await telegramService.scanChannel(channelUsername);
      
      // Transform the result to match the expected format
      const transformedResult = {
        channel_id: 0,
        title: result.title,
        username: result.username,
        description: result.description,
        member_count: result.member_count,
        active_members: result.active_members || Math.floor(result.member_count * 0.1),
        bot_count: result.bot_count || 0,
        kol_count: result.kol_details?.length || 0,
        kol_details: result.kol_details?.map((kol: any) => ({
          ...kol,
          last_name: kol.last_name || null
        })) || [],
        scanned_at: new Date().toISOString()
      };

      setScanResult(transformedResult);
      setScanURL('');
      setServiceStatus('online');
    } catch (err) {
      console.error('Channel scan error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('service is currently unavailable') || 
          errorMessage.includes('unavailable') ||
          errorMessage.includes('not connected')) {
        setError('🔌 Service Unavailable: The Telegram scanning service is currently offline. Our team is working to restore it. Please try again in a few minutes.');
        setServiceStatus('offline');
      } else if (errorMessage.includes('admin privileges') || 
                 errorMessage.includes('permissions') ||
                 errorMessage.includes('access denied') ||
                 errorMessage.includes('status 500')) {
        setError('❌ Access Denied: This channel requires admin privileges to scan. Only public channels or channels where you have admin rights can be analyzed for real-time data.');
      } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        setError('❌ Channel Not Found: The specified channel does not exist or is not accessible. Please check the channel name and try again.');
      } else if (errorMessage.includes('timeout') || 
                 errorMessage.includes('30 seconds') ||
                 errorMessage.includes('AbortError')) {
        setError('⏱️ Request Timeout: The channel scan took longer than expected (30+ seconds). This can happen with large channels or due to Telegram API rate limits. Please wait a moment and try again.');
      } else if (errorMessage.includes('flood') || 
                 errorMessage.includes('rate limit') ||
                 errorMessage.includes('FLOOD_WAIT')) {
        setError('⚠️ Rate Limited: Telegram API is temporarily limiting requests due to high traffic. Please wait 5-10 minutes before trying again.');
      } else if (errorMessage.includes('Invalid channel username')) {
        setError(`❌ ${errorMessage}`);
      } else {
        setError(`❌ Scan Failed: ${errorMessage}. If this persists, please check that the channel is public and accessible.`);
      }
      setScanResult(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleExport = () => {
    if (!scanResult) return;

    const csvContent = [
      ['Channel Name', 'Total Members', 'Active Members', 'Bot Count', 'KOL Count', 'Scan Date'].join(','),
      [
        scanResult.title,
        scanResult.member_count,
        scanResult.active_members,
        scanResult.bot_count,
        scanResult.kol_count,
        new Date(scanResult.scanned_at).toLocaleString()
      ].join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `channel_scan_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ServiceStatusIndicator = () => (
    <div className="flex items-center gap-2 text-sm">
      {serviceStatus === 'checking' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
          <span className="text-yellow-400">Checking service...</span>
        </>
      ) : serviceStatus === 'online' ? (
        <>
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Service Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-400" />
          <span className="text-red-400">Service Offline</span>
          <button 
            onClick={checkServiceStatus}
            className="ml-2 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
          >
            Retry
          </button>
        </>
      )}
    </div>
  );

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
          {/* Ultra-Modern Header */}
          <div className="text-center mb-16 space-y-8">
            <div className="relative">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  <TypewriterText text="Channel" />
                </span>
              </h1>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight mt-2">
                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Scanner
                </span>
          </h1>
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-20 blur-2xl -z-10"></div>
        </div>

            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-light">
              Harness the power of advanced analytics to scan Telegram channels with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-semibold">real-time intelligence</span>
            </p>
            
            {/* Enhanced Service Status */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-50"></div>
                <ServiceStatusIndicator />
              </div>
            </div>
          </div>

          {/* Ultra-Modern Scan Interface */}
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>
            <div className="relative bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-slate-600/50 p-8 md:p-12 shadow-2xl">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">
                    Initiate Channel Scan
            </h3>
                </div>

                <div className="grid md:grid-cols-4 gap-6 items-end">
                  <div className="md:col-span-3 relative group">
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Channel URL or Username
                    </label>
                    <div className="relative">
                <input
                  type="text"
                  value={scanURL}
                  onChange={(e) => setScanURL(e.target.value)}
                        placeholder="t.me/channel or @username"
                        disabled={serviceStatus === 'offline'}
                        className="w-full px-6 py-4 bg-slate-900/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-all duration-500 pointer-events-none"></div>
                    </div>
              </div>
                  
              <button
                onClick={handleScan}
                    disabled={!scanURL || isScanning || serviceStatus === 'offline'}
                    className="relative overflow-hidden px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-2xl font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 group"
              >
                    <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    <div className="relative flex items-center justify-center gap-3">
                {isScanning ? (
                  <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Scanning...</span>
                  </>
                      ) : serviceStatus === 'offline' ? (
                        <>
                          <WifiOff className="w-5 h-5" />
                          <span>Offline</span>
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

                {/* Enhanced Help Text */}
                <div className="mt-6 p-4 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-600/30">
                  <p className="text-sm text-slate-300 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
                    <strong>Pro Tip:</strong> Real-time scanning works best with public channels. Large channels may take up to 30 seconds for comprehensive analysis.
                  </p>
                </div>

                {/* Enhanced Error Display */}
            {error && (
                  <div className="mt-6 relative">
                    <div className="absolute inset-0 bg-red-500/20 rounded-xl blur"></div>
                    <div className="relative bg-red-900/40 backdrop-blur-sm border border-red-500/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Offline Notice */}
                {serviceStatus === 'offline' && (
                  <div className="mt-6 relative">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-xl blur"></div>
                    <div className="relative bg-orange-900/40 backdrop-blur-sm border border-orange-500/50 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <WifiOff className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-orange-300 font-medium">Service Temporarily Offline</p>
                          <p className="text-orange-400/80 text-sm mt-1">The scanning service is currently unavailable. Our systems are working to restore connectivity.</p>
                        </div>
                      </div>
                    </div>
              </div>
            )}
              </div>
          </div>
        </div>

          {/* Ultra-Modern Results Display */}
        {scanResult && (
          <div className="space-y-8 animate-fadeIn">
              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Users, label: 'Total Members', value: scanResult.member_count.toLocaleString(), color: 'from-blue-500 to-cyan-500', bg: 'from-blue-500/20 to-cyan-500/20' },
                  { icon: Activity, label: 'Active Members', value: scanResult.active_members.toLocaleString(), color: 'from-emerald-500 to-teal-500', bg: 'from-emerald-500/20 to-teal-500/20' },
                  { icon: Bot, label: 'Bot Count', value: scanResult.bot_count.toString(), color: 'from-red-500 to-pink-500', bg: 'from-red-500/20 to-pink-500/20' },
                  { icon: TrendingUp, label: 'KOL Count', value: scanResult.kol_count.toString(), color: 'from-purple-500 to-violet-500', bg: 'from-purple-500/20 to-violet-500/20' }
              ].map((stat, index) => (
                  <div key={index} className="group relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} rounded-2xl blur opacity-60 group-hover:opacity-80 transition-opacity duration-500`}></div>
                    <div className="relative bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl border border-slate-600/50 hover:border-slate-500/70 transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 bg-gradient-to-br ${stat.color} rounded-xl shadow-lg`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className={`text-right`}>
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
                        <p className="text-xl font-semibold text-white">
                          {scanResult.title} 
                          {scanResult.username && (
                            <span className="text-slate-400 font-normal ml-2">@{scanResult.username}</span>
                          )}
                        </p>
                </div>
                <div>
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Description</h3>
                        <p className="text-slate-300 leading-relaxed">
                          {scanResult.description || 'No description available'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Scan Timestamp</h3>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Clock className="w-4 h-4 text-cyan-400" />
                          <span>{new Date(scanResult.scanned_at).toLocaleString()}</span>
                        </div>
                </div>
                <div>
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Analysis Depth</h3>
                        <div className="text-slate-300">
                          Comprehensive scan with real-time data extraction
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

              {/* Enhanced KOL Details */}
            {scanResult.kol_count > 0 && scanResult.kol_details && (
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
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">User ID</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Authority Level</th>
                      </tr>
                    </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            {scanResult.kol_details.map((kol, index) => (
                              <tr key={kol.user_id} className="group hover:bg-slate-700/30 transition-all duration-200">
                                <td className="px-6 py-4 text-sm text-slate-300 font-mono">{kol.user_id}</td>
                                <td className="px-6 py-4 text-sm">
                                  <span className="text-cyan-400 font-medium">
                                    {kol.username || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-300">
                                  {[kol.first_name, kol.last_name].filter(Boolean).join(' ') || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                                    kol.is_admin 
                                      ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30' 
                                      : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30'
                                  }`}>
                                    {kol.is_admin ? 'Administrator' : 'Member'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                      </div>
                    </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}