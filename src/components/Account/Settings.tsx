import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Wallet, Volume2, Monitor, Moon, Sun, DollarSign, Lock } from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    gameResults: true,
    specialEvents: true,
    newFeatures: false,
    marketUpdates: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    sound: true,
    animations: true,
    quickBet: false
  });

  const [limits, setLimits] = useState({
    dailyLimit: 5,
    maxBet: 2,
    cooldown: 15
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'theme') {
      setPreferences(prev => ({
        ...prev,
        theme: prev.theme === 'dark' ? 'light' : 'dark'
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const updateLimit = (key: keyof typeof limits, value: number) => {
    setLimits(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mb-6">
            <SettingsIcon size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Settings</h1>
          <p className="text-gray-400 text-lg">Customize your gaming experience</p>
        </div>

        {/* Notifications */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Bell size={24} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Notifications</h2>
              <p className="text-sm text-gray-400">Manage your alert preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <button
                  onClick={() => toggleNotification(key as keyof typeof notifications)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    value ? 'bg-purple-500' : 'bg-gray-700'
                  } relative`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                    value ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Monitor size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Preferences</h2>
              <p className="text-sm text-gray-400">Customize your interface</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Theme</span>
              <button
                onClick={() => togglePreference('theme')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg"
              >
                {preferences.theme === 'dark' ? (
                  <>
                    <Moon size={16} className="text-purple-400" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun size={16} className="text-amber-400" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Sound Effects</span>
              <button
                onClick={() => togglePreference('sound')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  preferences.sound ? 'bg-blue-500' : 'bg-gray-700'
                } relative`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                  preferences.sound ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Animations</span>
              <button
                onClick={() => togglePreference('animations')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  preferences.animations ? 'bg-blue-500' : 'bg-gray-700'
                } relative`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                  preferences.animations ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Quick Bet Mode</span>
              <button
                onClick={() => togglePreference('quickBet')}
                className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  preferences.quickBet ? 'bg-blue-500' : 'bg-gray-700'
                } relative`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                  preferences.quickBet ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Betting Limits */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Betting Limits</h2>
              <p className="text-sm text-gray-400">Set your gaming boundaries</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Daily Limit (SOL)
              </label>
              <input
                type="number"
                value={limits.dailyLimit}
                onChange={(e) => updateLimit('dailyLimit', parseFloat(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Maximum Single Bet (SOL)
              </label>
              <input
                type="number"
                value={limits.maxBet}
                onChange={(e) => updateLimit('maxBet', parseFloat(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                min="0"
                step="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Cooldown Period (minutes)
              </label>
              <input
                type="number"
                value={limits.cooldown}
                onChange={(e) => updateLimit('cooldown', parseInt(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                min="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 