import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Active Trackers', value: '24', change: '+12%', icon: '📊' },
    { label: 'Total Volume', value: '$2.4M', change: '+8.2%', icon: '💰' },
    { label: 'Success Rate', value: '87%', change: '+5.1%', icon: '🎯' },
    { label: 'Active Games', value: '156', change: '+23%', icon: '🎮' }
  ];

  const features = [
    {
      title: 'KOL Analyzer',
      description: 'Track and analyze Key Opinion Leaders with advanced metrics and real-time insights',
      icon: '🔍',
      link: '/kol-analyzer',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Volume Tracker',
      description: 'Monitor trading volumes and market movements across multiple exchanges',
      icon: '📈',
      link: '/volume-tracker',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Channel Scanner',
      description: 'Scan Telegram channels for market signals and trading opportunities',
      icon: '📡',
      link: '/channel-scanner',
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      title: 'Bot Detector',
      description: 'Detect and analyze bot activity to identify market manipulation',
      icon: '🤖',
      link: '/bot-detector',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      title: 'Games',
      description: 'Test your skills with real-time trading games and competitions',
      icon: '🎮',
      link: '/games',
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      title: 'Leaderboard',
      description: 'See top performers and track your ranking among other traders',
      icon: '🏆',
      link: '/leaderboard',
      gradient: 'from-indigo-500 to-blue-500'
    }
  ];

              return (
    <div className="min-h-screen font-mono relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10"></div>
        <div className="responsive-container py-16 relative">
          <div className="text-center mb-16">
            <h1 className="heading-1 gradient-text mb-6 animate-pulse">
              Welcome to KOL Tracker Pro
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your ultimate platform for tracking, analyzing, and optimizing crypto investments with 
              <span className="text-blue-400 font-semibold"> real-time KOL insights</span> and 
              <span className="text-purple-400 font-semibold"> advanced market intelligence</span>.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <button className="btn-primary transform hover:scale-105 transition-transform duration-200">
                Get Started
              </button>
              <button className="btn-ghost transform hover:scale-105 transition-transform duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="responsive-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group card hover:shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-2 transition-all duration-300"
            >
            <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{stat.icon}</span>
                <span className="text-sm text-green-400 font-semibold">{stat.change}</span>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">{stat.value}</h3>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
          </div>

        {/* Feature Grid */}
        <div className="mb-16">
          <h2 className="heading-2 text-center mb-12 text-white">
            Powerful Tools at Your Fingertips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group block"
              >
                <div className="card h-full relative overflow-hidden transform hover:-translate-y-2 hover:shadow-2xl transition-all duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <span className="text-4xl mr-4">{feature.icon}</span>
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
              </div>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-blue-400 group-hover:text-blue-300 transition-colors duration-200">
                      <span className="text-sm font-semibold">Explore</span>
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
            </div>
            </div>
          </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-gradient-to-r from-gray-800/80 to-gray-900/80 border-gray-700 backdrop-blur-sm">
          <div className="text-center">
            <h3 className="heading-3 text-white mb-6">Ready to Start Trading?</h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of traders who are already using KOL Tracker Pro to make informed decisions 
              and maximize their crypto investments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/games" className="btn-primary transform hover:scale-105 transition-transform duration-200">
                🎮 Start Gaming
          </Link>
              <Link to="/kol-analyzer" className="btn-secondary transform hover:scale-105 transition-transform duration-200">
                📊 Analyze KOLs
          </Link>
              <Link to="/channel-scanner" className="btn-ghost transform hover:scale-105 transition-transform duration-200">
                📡 Scan Channels
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;