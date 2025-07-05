import React, { useState } from 'react';
import { Search, Users, Bot, TrendingUp, Calendar, AlertCircle, Loader2, MoreHorizontal, Plus, MessagesSquare, Download, Activity, Clock } from 'lucide-react';
import { scanChannel } from '../services/telegramService';
import { useChannelScanner } from '../contexts/ChannelScannerContext';

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
    // Remove any protocol and domain
    let username = input.replace(/^(?:https?:\/\/)?(?:t\.me\/|telegram\.me\/)?/, '');
    
    // Remove trailing slash and any additional path segments
    username = username.split('/')[0];
    
    // Remove @ if present
    username = username.replace(/^@/, '');
    
    // Validate username format
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
      // Extract and validate channel username
      const channelUsername = extractChannelUsername(scanURL);
      
      // Scan channel using Telethon service
      const result = await scanChannel(channelUsername);
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to scan channel');
      }

      setScanResult(result.data);
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
      // CSV Headers
      ['Channel Name', 'Total Members', 'Active Members', 'Bot Count', 'KOL Count', 'Scan Date'].join(','),
      // CSV Data
      [
        scanResult.title,
        scanResult.member_count,
        scanResult.active_members,
        scanResult.bot_count,
        scanResult.kol_count,
        new Date(scanResult.scanned_at).toLocaleString()
      ].join(',')
    ].join('\n');

    // Create blob and download
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
            Channel Scanner
          </h1>
          <p className="text-surface-600 text-sm mt-1">Analyze Telegram channels for bot activity and KOL presence</p>
        </div>
        {scanResult && (
          <button
            onClick={handleExport}
            className="mt-4 sm:mt-0 px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-xl transition-all duration-200 text-sm font-medium flex items-center space-x-2"
          >
            <Download size={16} />
            <span>Export Results</span>
          </button>
        )}
      </div>

      {/* Scan New Channel */}
      <div className="bg-white rounded-xl p-6 shadow-glow hover:shadow-glow-md transition-all duration-200">
        <h3 className="text-lg font-medium text-surface-900 mb-4">Scan New Channel</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            id="channel-url"
            name="channel-url"
            placeholder="Enter Telegram channel URL (t.me/channel) or username (@channel)"
            value={scanURL}
            onChange={(e) => setScanURL(e.target.value)}
            className="flex-1 px-4 py-2 bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm transition-shadow duration-200 hover:shadow-glow placeholder-surface-400"
          />
          <button
            onClick={handleScan}
            disabled={!scanURL || isScanning}
            className="px-6 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-surface-300 disabled:cursor-not-allowed text-white rounded-xl shadow-glow hover:shadow-glow-md transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2 min-w-[140px]"
          >
            {isScanning ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>Scan Channel</span>
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500">{error}</p>
        )}
      </div>

      {scanResult && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-blue-400 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-gray-500">Total Members</h3>
              <p className="text-2xl font-bold">{scanResult.member_count}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-green-400 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-gray-500">Active Members</h3>
              <p className="text-2xl font-bold">{scanResult.active_members}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-red-400 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
          </div>
              <h3 className="text-gray-500">Bot Count</h3>
              <p className="text-2xl font-bold">{scanResult.bot_count}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-purple-400 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-gray-500">KOL Count</h3>
              <p className="text-2xl font-bold">{scanResult.kol_count}</p>
          </div>
        </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
            <h2 className="text-xl font-semibold mb-4">Channel Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-500">Channel Name</h3>
                <p className="font-medium">{scanResult.title} {scanResult.username && `@${scanResult.username}`}</p>
            </div>
            <div>
                <h3 className="text-gray-500">Description</h3>
                <p className="text-sm">{scanResult.description || 'No description available'}</p>
            </div>
            <div>
                <h3 className="text-gray-500">Last Scanned</h3>
                <p className="text-sm">{new Date(scanResult.scanned_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

          {scanResult.kol_count > 0 && scanResult.kol_details && (
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
              <h2 className="text-xl font-semibold mb-4">KOL Details</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scanResult.kol_details.map((kol) => (
                      <tr key={kol.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{kol.user_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{kol.username || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {[kol.first_name, kol.last_name].filter(Boolean).join(' ') || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {kol.is_admin ? 'Admin' : 'Member'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
            </div>
          )}

          {scanResult.previous_scans && scanResult.previous_scans.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-xl font-semibold mb-4">Previous Scans</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bots</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KOLs</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scanResult.previous_scans.map((scan, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(scan.scanned_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scan.member_count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scan.active_members}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scan.bot_count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{scan.kol_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
        </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}