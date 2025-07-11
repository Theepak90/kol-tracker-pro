import React, { useState } from 'react';
import { ArrowLeft, DollarSign, Computer, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import SOLDepositModal from './SOLDepositModal';
import { transactionService } from '../services/transactionService';

interface JackpotGameProps {
  onBack: () => void;
}

export default function JackpotGame({ onBack }: JackpotGameProps) {
  const [betAmount, setBetAmount] = useState<number>(0.05);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState<any>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [selectedWinner, setSelectedWinner] = useState<number | null>(null);

  // Mock players in the jackpot
  const players = [
    { id: 1, name: 'You', avatar: '👤', bet: betAmount, isUser: true },
    { id: 2, name: 'Bot Alpha', avatar: '🤖', bet: 0.1, isUser: false },
    { id: 3, name: 'Bot Beta', avatar: '🦾', bet: 0.2, isUser: false },
    { id: 4, name: 'Bot Gamma', avatar: '🔥', bet: 0.15, isUser: false },
    { id: 5, name: 'Bot Delta', avatar: '⚡', bet: 0.08, isUser: false },
  ];

  const totalJackpot = players.reduce((sum, player) => sum + player.bet, 0);

  const handleStartGame = () => {
    setShowDepositModal(true);
  };

  const handleDepositVerified = () => {
    setShowDepositModal(false);
    startJackpotGame();
  };

  const startJackpotGame = () => {
    setIsPlaying(true);
    setIsSpinning(true);
    setGameResult(null);
    setSelectedWinner(null);

    // Simulate spinning wheel animation
    let rotations = 0;
    const maxRotations = 8 + Math.random() * 8; // 8-16 rotations
    
    const spinInterval = setInterval(() => {
      rotations += 0.3;
      setSpinRotation(rotations * 360);
      
      if (rotations >= maxRotations) {
        clearInterval(spinInterval);
        
        // Get game outcome from transaction service (98% computer win rate)
        const outcome = transactionService.simulateGameOutcome('jackpot', betAmount);
        const winnerPosition = outcome.gameDetails.userPosition;
        
        // Calculate final position to land on winner
        const anglePerCard = 360 / players.length;
        const winnerAngle = (winnerPosition - 1) * anglePerCard;
        const finalPosition = rotations * 360 + (360 - winnerAngle);
        
        setSpinRotation(finalPosition);
        setIsSpinning(false);
        
        setTimeout(() => {
          setSelectedWinner(winnerPosition - 1);
          setGameResult({
            winner: outcome.winner,
            userWins: outcome.winner === 'user',
            payout: outcome.userPayout,
            winnerPlayer: players[winnerPosition - 1],
            totalJackpot: totalJackpot
          });
          setIsPlaying(false);
        }, 1000);
      }
    }, 100);
  };

  const resetGame = () => {
    setGameResult(null);
    setSpinRotation(0);
    setSelectedWinner(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Navigation */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <button 
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Games
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mb-6">
            <DollarSign size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            MEGA JACKPOT
          </h1>
          <p className="text-xl text-gray-300 mb-4">Multiplayer jackpot • Progressive pool • Winner takes all</p>
        </div>

        {!gameResult && !isPlaying && (
          <div className="max-w-4xl mx-auto">
            {/* Game Setup */}
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-8 mb-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Enter the Jackpot</h3>
              
              {/* Bet Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Bet Amount (SOL)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    min="0.01"
                    step="0.01"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 text-center text-lg"
                    placeholder="0.05"
                  />
                </div>
                <div className="flex items-center justify-center space-x-2 mt-3">
                  <button 
                    onClick={() => setBetAmount(0.05)}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    0.05
                  </button>
                  <button 
                    onClick={() => setBetAmount(0.1)}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    0.1
                  </button>
                  <button 
                    onClick={() => setBetAmount(0.25)}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    0.25
                  </button>
                </div>
              </div>

              {/* Current Jackpot Preview */}
              <div className="bg-black/50 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-400">Total Jackpot Pool</div>
                  <div className="text-3xl font-bold text-purple-400">{(totalJackpot + betAmount - players[0].bet).toFixed(3)} SOL</div>
                </div>
                
                <div className="grid grid-cols-5 gap-2 text-center text-sm">
                  {players.map((player, index) => (
                    <div key={player.id} className={`p-2 rounded-lg ${player.isUser ? 'bg-purple-500/20 border border-purple-500' : 'bg-gray-700/50'}`}>
                      <div className="text-lg">{player.avatar}</div>
                      <div className="font-semibold truncate">{player.isUser ? 'You' : player.name}</div>
                      <div className="text-xs text-gray-400">{player.isUser ? betAmount.toFixed(3) : player.bet.toFixed(3)} SOL</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartGame}
                disabled={betAmount <= 0}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl font-bold text-lg transition-all"
              >
                Deposit {betAmount} SOL & Join Jackpot
              </button>
            </div>
          </div>
        )}

        {/* Game Playing State */}
        {isPlaying && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-12">
              <h3 className="text-2xl font-bold mb-8">Spinning for Winner...</h3>
              
              <div className="mb-8">
                <div className="w-80 h-80 mx-auto relative">
                  {/* Spinning wheel */}
                  <div 
                    className="w-full h-full rounded-full border-4 border-purple-500 relative overflow-hidden transition-transform duration-100"
                    style={{ transform: `rotate(${spinRotation}deg)` }}
                  >
                    {players.map((player, index) => {
                      const angle = (360 / players.length) * index;
                      const isSelected = selectedWinner === index;
                      return (
                        <div
                          key={player.id}
                          className={`absolute w-full h-full flex items-center justify-center ${isSelected ? 'bg-yellow-400/30' : ''}`}
                          style={{
                            transform: `rotate(${angle}deg)`,
                            clipPath: 'polygon(50% 50%, 50% 0%, 70% 0%, 70% 50%)'
                          }}
                        >
                          <div className={`text-2xl ${player.isUser ? 'text-purple-300' : 'text-white'}`}>
                            {player.avatar}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Pointer */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-400"></div>
                  </div>
                </div>
              </div>

              <div className="text-gray-300">
                <p>Total Jackpot: <span className="text-white font-semibold">{totalJackpot.toFixed(3)} SOL</span></p>
                <p className="text-sm mt-2">5 players competing for the jackpot</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Result */}
        {gameResult && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700 p-12">
              <div className="mb-8">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-6xl">
                  {gameResult.winnerPlayer.avatar}
                </div>
                <div className="mt-4 text-2xl font-bold">
                  Winner: {gameResult.winnerPlayer.name}
                </div>
              </div>

              <div className={`text-center p-6 rounded-xl ${gameResult.userWins ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'}`}>
                <div className={`text-2xl font-bold mb-2 ${gameResult.userWins ? 'text-green-400' : 'text-red-400'}`}>
                  {gameResult.userWins ? '🎉 YOU WON THE JACKPOT!' : '😔 ANOTHER PLAYER WINS!'}
                </div>
                <div className="text-gray-300 mb-2">
                  Total Pool: <span className="font-semibold">{gameResult.totalJackpot.toFixed(3)} SOL</span>
                </div>
                {gameResult.userWins ? (
                  <div className="text-xl">
                    Your Payout: <span className="text-green-400 font-bold">{gameResult.payout.toFixed(4)} SOL</span>
                  </div>
                ) : (
                  <div className="text-gray-300">
                    Winner takes: <span className="font-semibold">{gameResult.totalJackpot.toFixed(3)} SOL</span>
                  </div>
                )}
              </div>

              <button
                onClick={resetGame}
                className="mt-8 w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-8 rounded-xl font-semibold transition-all"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SOL Deposit Modal */}
      <SOLDepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDepositVerified={handleDepositVerified}
        gameType="jackpot"
        betAmount={betAmount}
      />
    </div>
  );
} 