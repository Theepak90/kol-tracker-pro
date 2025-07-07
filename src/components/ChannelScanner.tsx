import React, { useState } from 'react';
import { Search, Users, Bot, TrendingUp, Calendar, AlertCircle, Loader2, MoreHorizontal, Plus, MessagesSquare, Download, Activity, Clock } from 'lucide-react';
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
  const { scanResult, setScanResult, isScanning, setIsScanning, error, setError } = useChannelScanner();

  const extractChannelUsername = (input: string): string => {
    let username = input.replace(/^(?:https?:\/\/)?(?:t\.me\/|telegram\.me\/)?/, '');
    username = username.split('/')[0];
    username = username.replace(/^@/, '');
    
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(username)) {
      throw new Error('Invalid channel username format. Username should be 5-32 characters and contain only letters, numbers, and underscores.');
    }
    
    return username;
  };

  const handleScan = async () => {
    if (!scanURL) return;
    
    setIsScanning(true);
    setError(null);

    try {
      const channelUsername = extractChannelUsername(scanURL);
      const result = await telegramService.scanChannel(channelUsername);
      
      // Transform the result to match the expected format
      const transformedResult = {
        channel_id: 0,
        title: result.title,
        username: result.username,
        description: result.description,
        member_count: result.member_count,
        active_members: Math.floor(result.member_count * 0.1), // Estimate 10% active
        bot_count: 0,
        kol_count: result.kol_details?.length || 0,
        kol_details: result.kol_details?.map(kol => ({
          ...kol,
          last_name: kol.last_name || null
        })) || [],
        scanned_at: new Date().toISOString()
      };

      setScanResult(transformedResult);
      setScanURL('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while scanning');
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

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f620,transparent)]"></div>
      </div>

      <div className="relative space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            <TypewriterText text="Channel Scanner" />
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Analyze Telegram channels for bot activity and KOL presence with advanced metrics
          </p>
        </div>

        {/* Scan New Channel */}
        <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-[0_0_15px_rgba(0,0,0,0.2)] group hover:border-gray-700 transition-all duration-300">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative">
            <h3 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Scan New Channel
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative group/input">
                <input
                  type="text"
                  value={scanURL}
                  onChange={(e) => setScanURL(e.target.value)}
                  placeholder="Enter Telegram channel URL (t.me/channel) or username (@channel)"
                  className="w-full px-4 py-3 bg-gray-800/50 rounded-xl border border-gray-700 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-300 placeholder-gray-500 transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 opacity-0 group-hover/input:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              <button
                onClick={handleScan}
                disabled={!scanURL || isScanning}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-medium text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 min-w-[160px] flex items-center justify-center gap-2 group/button"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} className="group-hover/button:scale-110 transition-transform duration-300" />
                    <span>Scan Channel</span>
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
                <AlertCircle size={18} />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {scanResult && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: Users, label: 'Total Members', value: scanResult.member_count, color: 'blue' },
                { icon: Activity, label: 'Active Members', value: scanResult.active_members, color: 'green' },
                { icon: Bot, label: 'Bot Count', value: scanResult.bot_count, color: 'red' },
                { icon: TrendingUp, label: 'KOL Count', value: scanResult.kol_count, color: 'purple' }
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

            {/* Channel Information */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Channel Information
                </h2>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 flex items-center gap-2 transition-all duration-300 group"
                >
                  <Download size={16} className="group-hover:scale-110 transition-transform duration-300" />
                  <span>Export Results</span>
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Channel Name</h3>
                  <p className="text-lg font-medium">{scanResult.title} {scanResult.username && `@${scanResult.username}`}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Description</h3>
                  <p className="text-gray-300">{scanResult.description || 'No description available'}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Last Scanned</h3>
                  <p className="text-gray-300 flex items-center gap-2">
                    <Clock size={16} />
                    {new Date(scanResult.scanned_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* KOL Details */}
            {scanResult.kol_count > 0 && scanResult.kol_details && (
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 border border-gray-800 hover:border-gray-700 transition-all duration-300">
                <h2 className="text-xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  KOL Details
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {scanResult.kol_details.map((kol) => (
                        <tr key={kol.user_id} className="group hover:bg-gray-800/30 transition-colors duration-200">
                          <td className="px-6 py-4 text-sm">{kol.user_id}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">{kol.username || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {[kol.first_name, kol.last_name].filter(Boolean).join(' ') || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${kol.is_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                              {kol.is_admin ? 'Admin' : 'Member'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}