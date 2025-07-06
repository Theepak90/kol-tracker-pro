import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3, Users, TrendingUp, Shield, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronRight, Loader2, MessagesSquare, Bot, Search, Trophy, Gamepad2, ArrowRight, LogIn, UserPlus, Zap, Target, Globe, Star, Sparkles, Rocket, Eye, MessageCircle, Hash, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { TelegramUsageGuide } from './TelegramUsageGuide';
import { TypewriterText } from './TypewriterText';

interface DashboardStats {
  totalKOLs: number;
  activeChannels: number;
  detectedBots: number;
  totalVolume: number;
  timestamp: string;
}

interface KOLData {
  username: string;
  followers: number;
  successRate: number;
  totalCalls: number;
  avgVolume: number;
}

interface ChannelData {
  name: string;
  members: number;
  bots: number;
  kols: number;
  volume24h: number;
}

export default function Dashboard() {
  console.log('Dashboard component loaded');
  
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  console.log('Dashboard rendering - isAuthenticated:', isAuthenticated);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simple test to ensure component renders
  if (typeof isAuthenticated === 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Auth Context Loading...</h1>
          <p className="text-gray-400">Waiting for authentication context to initialize</p>
        </div>
      </div>
    );
  }

  // Fallback to ensure something renders
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6c5dd3] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleScanChannels = () => {
    navigate('/channel-scanner');
  };

  const generateDashboardStats = (): DashboardStats => {
    return {
      totalKOLs: 150,
      activeChannels: 45,
      detectedBots: 23,
      totalVolume: 1250000,
      timestamp: new Date().toISOString()
    };
  };

  const generateTopKOLs = (): KOLData[] => {
    return [
      {
        username: "crypto_whale",
        followers: 50000,
        successRate: 85,
        totalCalls: 120,
        avgVolume: 500000
      },
      {
        username: "defi_guru",
        followers: 35000,
        successRate: 78,
        totalCalls: 95,
        avgVolume: 350000
      },
      {
        username: "nft_master",
        followers: 28000,
        successRate: 82,
        totalCalls: 75,
        avgVolume: 280000
      }
    ];
  };

  const generateChannelStats = (): ChannelData[] => {
    return [];
  };

  const handleExportReport = () => {
    const stats = generateDashboardStats();
    const kols = generateTopKOLs();
    const channels = generateChannelStats();

    const csvContent = [
      ['Dashboard Overview Report'],
      ['Generated at:', new Date().toLocaleString()],
      [''],
      
      ['Summary Statistics'],
      ['Metric', 'Value'],
      ['Total KOLs', stats.totalKOLs],
      ['Active Channels', stats.activeChannels],
      ['Detected Bots', stats.detectedBots],
      ['Total Volume', `$${stats.totalVolume.toLocaleString()}`],
      [''],

      ['Top KOLs'],
      ['Username', 'Followers', 'Success Rate', 'Total Calls', 'Average Volume'],
      ...kols.map(kol => [
        kol.username,
        kol.followers.toLocaleString(),
        `${kol.successRate}%`,
        kol.totalCalls,
        `$${kol.avgVolume.toLocaleString()}`
      ]),
      [''],

      ['Channel Statistics'],
      ['Channel Name', 'Members', 'Bots', 'KOLs', '24h Volume'],
      ...channels.map(channel => [
        channel.name,
        channel.members.toLocaleString(),
        channel.bots.toLocaleString(),
        channel.kols.toLocaleString(),
        `$${channel.volume24h.toLocaleString()}`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] blur-3xl opacity-10 rounded-full"></div>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-[#6c5dd3] to-[#8d7ff0] bg-clip-text text-transparent mb-6">
                  <TypewriterText 
                    text="Welcome to KOL Nexus"
                    speed={150}
                    className="bg-gradient-to-r from-white via-[#6c5dd3] to-[#8d7ff0] bg-clip-text text-transparent"
                  />
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Your all-in-one platform for tracking and analyzing Key Opinion Leaders in the crypto space. 
                  Discover insights, monitor trends, and stay ahead of the market.
                </p>
                <div className="flex justify-center gap-4 mb-8">
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-[subtle-bounce_2s_infinite] hover:animate-none"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6c5dd3] via-[#8d7ff0] to-[#6c5dd3] rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-[border-animation_2s_linear_infinite] blur-sm"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#6c5dd3] via-[#8d7ff0] to-[#6c5dd3] rounded-[16px] opacity-30 group-hover:opacity-50 transition-all duration-500 animate-[border-animation_2s_linear_infinite] blur"></div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] opacity-100 group-hover:opacity-90 transition-all duration-500"></div>
                    <div className="relative flex items-center">
                      <UserPlus className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:tracking-wider transition-all duration-300">Get Started Free</span>
                    </div>
                  </Link>
                  <Link
                    to="/login"
                    className="group relative inline-flex items-center px-8 py-4 bg-[#1f1f1f]/80 backdrop-blur-sm text-white font-semibold rounded-2xl border border-[#2f2f2f] hover:border-[#6c5dd3] hover:bg-[#2f2f2f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#6c5dd3] via-[#8d7ff0] to-[#6c5dd3] rounded-2xl opacity-0 group-hover:opacity-10 transition-all duration-500 blur-sm"></div>
                    <div className="relative flex items-center">
                      <LogIn className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:tracking-wider transition-all duration-300">Sign In</span>
                    </div>
                  </Link>
                </div>
                <div className="flex justify-center items-center gap-8 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>Real-time Analytics</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Secure & Reliable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>Lightning Fast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="feature-box group bg-[#1f1f1f] p-8 rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300">
              <div className="content">
                <div className="icon-container w-16 h-16 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">KOL Analysis</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Track and analyze influential crypto personalities and their market impact with advanced metrics and insights.
                </p>
                <Link
                  to="/kol-analyzer"
                  className="inline-flex items-center text-[#6c5dd3] hover:text-[#8d7ff0] font-semibold group-hover:translate-x-1 transition-transform duration-300"
                >
                  Explore Features <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="feature-box group bg-[#1f1f1f] p-8 rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300">
              <div className="content">
                <div className="icon-container w-16 h-16 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Volume Tracking</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Monitor trading volumes and market movements in real-time with comprehensive analytics and alerts.
                </p>
                <Link
                  to="/volume-tracker"
                  className="inline-flex items-center text-[#6c5dd3] hover:text-[#8d7ff0] font-semibold group-hover:translate-x-1 transition-transform duration-300"
                >
                  Explore Features <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="feature-box group bg-[#1f1f1f] p-8 rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300">
              <div className="content">
                <div className="icon-container w-16 h-16 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Bot Detection</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Identify and filter out automated trading activities with AI-powered detection algorithms.
                </p>
                <Link
                  to="/bot-detector"
                  className="inline-flex items-center text-[#6c5dd3] hover:text-[#8d7ff0] font-semibold group-hover:translate-x-1 transition-transform duration-300"
                >
                  Detect Bots <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="feature-box group bg-[#1f1f1f] p-8 rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300">
              <div className="content">
                <div className="icon-container w-16 h-16 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Channel Scanner</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Discover and analyze crypto-focused channels and communities with deep insights and metrics.
                </p>
                <Link
                  to="/channel-scanner"
                  className="inline-flex items-center text-[#6c5dd3] hover:text-[#8d7ff0] font-semibold group-hover:translate-x-1 transition-transform duration-300"
                >
                  Scan Channels <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="feature-box group bg-[#1f1f1f] p-8 rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300">
              <div className="content">
                <div className="icon-container w-16 h-16 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Leaderboard</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Track top performers and success rates across the platform with comprehensive rankings.
                </p>
                <Link
                  to="/leaderboard"
                  className="inline-flex items-center text-[#6c5dd3] hover:text-[#8d7ff0] font-semibold group-hover:translate-x-1 transition-transform duration-300"
                >
                  View Rankings <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="feature-box group bg-[#1f1f1f] p-8 rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300">
              <div className="content">
                <div className="icon-container w-16 h-16 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Gamepad2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Interactive Games</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Engage with the community through interactive crypto games and prediction challenges.
                </p>
                <Link
                  to="/games"
                  className="inline-flex items-center text-[#6c5dd3] hover:text-[#8d7ff0] font-semibold group-hover:translate-x-1 transition-transform duration-300"
                >
                  Play Games <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-3xl p-12 text-white network-pattern relative">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl mb-8 opacity-90">Join thousands of traders and analysts already using KOL Nexus</p>
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-[#1f1f1f] text-[#6c5dd3] font-semibold rounded-2xl hover:bg-[#2f2f2f] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Start Your Journey
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated dashboard view
  const stats = generateDashboardStats();
  const topKOLs = generateTopKOLs();

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#6c5dd3] bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-gray-400 mt-1">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} • {currentTime.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={handleExportReport}
              className="px-6 py-3 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] text-white font-semibold rounded-xl hover:from-[#5a4ec0] hover:to-[#7b6de0] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-[#1f1f1f] p-6 rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7 text-white" />
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">150</h3>
            <p className="text-gray-400 mb-4">Total KOLs</p>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-semibold">12%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>

          <div className="group bg-[#1f1f1f] p-6 rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-7 w-7 text-white" />
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">45</h3>
            <p className="text-gray-400 mb-4">Active Channels</p>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-semibold">8%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>

          <div className="group bg-[#1f1f1f] p-6 rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">23</h3>
            <p className="text-gray-400 mb-4">Detected Bots</p>
            <div className="flex items-center text-sm">
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-500 font-semibold">5%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>

          <div className="group bg-[#1f1f1f] p-6 rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">$1.25M</h3>
            <p className="text-gray-400 mb-4">Total Volume</p>
            <div className="flex items-center text-sm">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-semibold">15%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>
        </div>

        {/* Telegram Integration Guide */}
        <div className="mb-8">
          <TelegramUsageGuide />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={handleScanChannels}
            className="group flex items-center justify-between p-6 bg-[#1f1f1f] rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Scan Channels</h3>
                <p className="text-gray-400">Analyze new groups</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#6c5dd3] group-hover:translate-x-1 transition-all duration-300" />
          </button>

          <Link
            to="/kol-analyzer"
            className="group flex items-center justify-between p-6 bg-[#1f1f1f] rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">KOL Analysis</h3>
                <p className="text-gray-400">Track influencers</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#6c5dd3] group-hover:translate-x-1 transition-all duration-300" />
          </Link>

          <Link
            to="/bot-detector"
            className="group flex items-center justify-between p-6 bg-[#1f1f1f] rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Bot Detection</h3>
                <p className="text-gray-400">Identify automation</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#6c5dd3] group-hover:translate-x-1 transition-all duration-300" />
          </Link>

          <Link
            to="/volume-tracker"
            className="group flex items-center justify-between p-6 bg-[#1f1f1f] rounded-2xl shadow-lg border border-[#2f2f2f] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white">Volume Tracking</h3>
                <p className="text-gray-400">Monitor trades</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#6c5dd3] group-hover:translate-x-1 transition-all duration-300" />
          </Link>
        </div>

        {/* Top KOLs */}
        <div className="bg-[#1f1f1f] rounded-2xl shadow-lg border border-[#2f2f2f] overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Top KOLs</h2>
              <Link
                to="/leaderboard"
                className="text-[#6c5dd3] hover:text-[#8d7ff0] font-semibold text-sm flex items-center"
              >
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <p className="text-gray-400 text-sm mt-1">Performance overview of leading influencers</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Followers</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Success Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Calls</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topKOLs.map((kol, index) => (
                  <tr key={kol.username} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">{kol.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{kol.username}</div>
                          <div className="text-sm text-gray-500">#{index + 1} Ranked</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{kol.followers.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-semibold text-green-600">{kol.successRate}%</div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] h-2 rounded-full" 
                            style={{ width: `${kol.successRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{kol.totalCalls}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">${kol.avgVolume.toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}