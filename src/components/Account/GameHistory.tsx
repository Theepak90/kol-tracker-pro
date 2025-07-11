import React, { useState } from 'react';
import { History, ChevronDown, Search, Filter, ArrowUp, ArrowDown, Trophy, X } from 'lucide-react';

export default function GameHistory() {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in a real app this would come from an API
  const games = [
    {
      id: 1,
      type: 'Coinflip',
      opponent: 'CryptoKing',
      amount: 0.5,
      currency: 'SOL',
      outcome: 'win',
      date: '2024-03-15T14:30:00',
      profit: 0.48
    },
    {
      id: 2,
      type: 'Jackpot',
      opponent: '-',
      amount: 0.2,
      currency: 'SOL',
      outcome: 'loss',
      date: '2024-03-15T13:15:00',
      profit: -0.2
    },
    {
      id: 3,
      type: 'KOL Battle',
      opponent: 'BlockMaster',
      amount: 1.0,
      currency: 'SOL',
      outcome: 'win',
      date: '2024-03-15T12:00:00',
      profit: 0.95
    },
    {
      id: 4,
      type: 'Coinflip',
      opponent: 'SolWarrior',
      amount: 0.3,
      currency: 'SOL',
      outcome: 'loss',
      date: '2024-03-15T11:45:00',
      profit: -0.3
    }
  ];

  const filteredGames = games.filter(game => {
    if (filter !== 'all' && game.outcome !== filter) return false;
    if (searchQuery && !game.opponent.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'highest') return b.amount - a.amount;
    return a.amount - b.amount;
  });

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6">
            <History size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Game History</h1>
          <p className="text-gray-400 text-lg">Track your gaming performance and outcomes</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <div className="text-sm text-gray-400 mb-2">Total Games</div>
            <div className="text-3xl font-bold">{games.length}</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <div className="text-sm text-gray-400 mb-2">Win Rate</div>
            <div className="text-3xl font-bold text-emerald-400">
              {((games.filter(g => g.outcome === 'win').length / games.length) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <div className="text-sm text-gray-400 mb-2">Total Wagered</div>
            <div className="text-3xl font-bold">
              {games.reduce((acc, game) => acc + game.amount, 0).toFixed(2)} SOL
            </div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
            <div className="text-sm text-gray-400 mb-2">Net Profit</div>
            <div className={`text-3xl font-bold ${games.reduce((acc, game) => acc + game.profit, 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {games.reduce((acc, game) => acc + game.profit, 0).toFixed(2)} SOL
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by opponent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900/50 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Games</option>
              <option value="win">Wins Only</option>
              <option value="loss">Losses Only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
          <div className="text-sm text-gray-400">
            Showing {filteredGames.length} of {games.length} games
          </div>
        </div>

        {/* Game List */}
        <div className="space-y-4">
          {sortedGames.map((game) => (
            <div key={game.id} className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    game.outcome === 'win' ? 'bg-emerald-400/20' : 'bg-red-400/20'
                  }`}>
                    {game.outcome === 'win' ? (
                      <Trophy size={24} className="text-emerald-400" />
                    ) : (
                      <X size={24} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{game.type}</div>
                    <div className="text-sm text-gray-400">vs {game.opponent}</div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Wagered</div>
                    <div className="font-semibold">{game.amount} {game.currency}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Profit</div>
                    <div className={`font-semibold ${game.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {game.profit > 0 ? '+' : ''}{game.profit} {game.currency}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Date</div>
                    <div className="font-semibold">
                      {new Date(game.date).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 