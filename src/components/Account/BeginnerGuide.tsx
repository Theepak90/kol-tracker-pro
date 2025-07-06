import React from 'react';
import { BookOpen, Star, Shield, Gift, Info, ChevronRight, CheckCircle } from 'lucide-react';

export default function BeginnerGuide() {
  const sections = [
    {
      title: "Getting Started",
      icon: Star,
      items: [
        "Create your account",
        "Connect your Solana wallet",
        "Understand game mechanics",
        "Learn about rewards"
      ],
      completed: true
    },
    {
      title: "Safety First",
      icon: Shield,
      items: [
        "Enable 2FA security",
        "Set betting limits",
        "Understand risk management",
        "Review terms of service"
      ],
      completed: false
    },
    {
      title: "Rewards & Bonuses",
      icon: Gift,
      items: [
        "Daily login rewards",
        "Achievement system",
        "Referral program",
        "Special events"
      ],
      completed: false
    },
    {
      title: "Advanced Features",
      icon: Info,
      items: [
        "Game statistics",
        "Leaderboard rankings",
        "Tournament participation",
        "VIP benefits"
      ],
      completed: false
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Beginner's Guide</h1>
          <p className="text-gray-400 text-lg">Master the basics and become a pro player</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-sm font-medium text-purple-400">25% Complete</span>
          </div>
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="w-1/4 h-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{section.title}</h3>
                    {section.completed && (
                      <div className="flex items-center text-sm text-emerald-400 mt-1">
                        <CheckCircle size={14} className="mr-1" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-gray-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center p-3 bg-black/30 rounded-lg"
                    >
                      <div className={`w-2 h-2 rounded-full mr-3 ${section.completed ? 'bg-emerald-400' : 'bg-gray-600'}`} />
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 