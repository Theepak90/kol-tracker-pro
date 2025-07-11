import React, { useState } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Clock, Target, Award, Zap, DollarSign } from 'lucide-react';

export default function Statistics() {
  const [timeframe, setTimeframe] = useState('all');

  // Mock data - in a real app this would come from an API
  const stats = {
    overview: {
      totalGames: 156,
      winRate: 58.3,
      totalWagered: 45.8,
      netProfit: 12.4,
      averageBet: 0.29,
      largestWin: 5.2,
      longestStreak: 8,
      quickestGame: '14s'
    },
    gameTypeStats: [
      { type: 'Coinflip', games: 82, winRate: 51.2, profit: 3.2 },
      { type: 'Jackpot', games: 45, winRate: 22.2, profit: -1.8 },
      { type: 'KOL Battle', games: 29, winRate: 65.5, profit: 11.0 }
    ],
    recentPerformance: [
      { date: '2024-03-15', games: 12, profit: 2.4 },
      { date: '2024-03-14', games: 15, profit: -1.2 },
      { date: '2024-03-13', games: 8, profit: 0.8 },
      { date: '2024-03-12', games: 10, profit: 1.5 },
      { date: '2024-03-11', games: 14, profit: -0.6 }
    ]
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
            <BarChart2 size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Statistics</h1>
          <p className="text-gray-400 text-lg">Detailed analysis of your gaming performance</p>
        </div>

        {/* Time Filter */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-900/50 backdrop-blur-xl rounded-xl p-1">
            {['24h', '7d', '30d', 'all'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  timeframe === period
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {period.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Win Rate</div>
                <div className="text-2xl font-bold text-purple-400">{stats.overview.winRate}%</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {stats.overview.totalGames} total games played
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Net Profit</div>
                <div className="text-2xl font-bold text-emerald-400">+{stats.overview.netProfit} SOL</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              {stats.overview.totalWagered} SOL wagered
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Award size={24} className="text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Largest Win</div>
                <div className="text-2xl font-bold text-blue-400">{stats.overview.largestWin} SOL</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Average bet: {stats.overview.averageBet} SOL
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Zap size={24} className="text-amber-400" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Win Streak</div>
                <div className="text-2xl font-bold text-amber-400">{stats.overview.longestStreak}</div>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Quickest game: {stats.overview.quickestGame}
            </div>
          </div>
        </div>

        {/* Game Type Performance */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-12">
          <h2 className="text-xl font-bold mb-6">Game Type Performance</h2>
          <div className="space-y-6">
            {stats.gameTypeStats.map((game) => (
              <div key={game.type} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{game.type}</span>
                    <span className={`font-medium ${game.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {game.profit > 0 ? '+' : ''}{game.profit} SOL
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${game.winRate}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-sm">
                    <span className="text-gray-400">{game.games} games</span>
                    <span className="text-gray-400">{game.winRate}% win rate</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Performance */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-bold mb-6">Recent Performance</h2>
          <div className="space-y-4">
            {stats.recentPerformance.map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    day.profit > 0 ? 'bg-emerald-400/20' : 'bg-red-400/20'
                  }`}>
                    {day.profit > 0 ? (
                      <TrendingUp size={20} className="text-emerald-400" />
                    ) : (
                      <TrendingDown size={20} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{new Date(day.date).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-400">{day.games} games played</div>
                  </div>
                </div>
                <div className={`font-medium ${day.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {day.profit > 0 ? '+' : ''}{day.profit} SOL
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 