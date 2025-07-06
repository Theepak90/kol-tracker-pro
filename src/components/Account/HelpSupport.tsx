import React, { useState } from 'react';
import { HelpCircle, MessageCircle, Mail, ExternalLink, ChevronDown, ChevronUp, Search } from 'lucide-react';

export default function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I connect my Solana wallet?",
      answer: "Click the 'Connect Wallet' button in the top navigation bar. Choose your preferred wallet (Phantom, Solflare, or others) and follow the prompts to connect. Make sure you're on the Solana network."
    },
    {
      question: "What are the minimum and maximum bet amounts?",
      answer: "Minimum bets vary by game: Coinflip (0.05 SOL), Jackpot (0.1 SOL), KOL Battle (0.2 SOL). Maximum bets are set in your account settings and can be adjusted based on your preferences and risk tolerance."
    },
    {
      question: "How are winners determined in games?",
      answer: "Each game has its own mechanics: Coinflip uses verifiable random functions (VRF), Jackpot uses a provably fair random number generator, and KOL Battle outcomes are based on real market performance data."
    },
    {
      question: "What happens if I lose connection during a game?",
      answer: "Don't worry! Our system automatically saves your game state. If you disconnect, your funds remain secure in the escrow contract. Reconnect to continue your game or claim any winnings."
    },
    {
      question: "How do I withdraw my winnings?",
      answer: "Winnings are automatically sent to your connected Solana wallet after each successful game. For security, larger amounts may have a brief holding period. Check your wallet or transaction history for details."
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const supportChannels = [
    {
      name: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      action: "Start Chat",
      available: true
    },
    {
      name: "Email Support",
      description: "Response within 24 hours",
      icon: Mail,
      action: "Send Email",
      available: true
    },
    {
      name: "Documentation",
      description: "Detailed guides and tutorials",
      icon: ExternalLink,
      action: "View Docs",
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
            <HelpCircle size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Help & Support</h1>
          <p className="text-gray-400 text-lg">Get the assistance you need</p>
        </div>

        {/* Support Channels */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {supportChannels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <div key={index} className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Icon size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">{channel.name}</h3>
                    <p className="text-sm text-gray-400">{channel.description}</p>
                  </div>
                </div>
                <button className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg py-2 transition-colors duration-200">
                  {channel.action}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          {/* Search */}
          <div className="relative mb-8">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/30 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors duration-200"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <span className="font-medium">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* No Results */}
          {searchQuery && filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">No matching questions found.</p>
              <p className="text-sm text-gray-500 mt-2">Try different keywords or contact support for help.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 