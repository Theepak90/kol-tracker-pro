import React from 'react';
import { Info, Users, Search, AlertCircle, CheckCircle } from 'lucide-react';

export function TelegramUsageGuide() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50 shadow-sm">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-blue-500 rounded-lg p-2">
          <Info className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900">Telegram Integration Guide</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">✅ Telegram API Connected</h4>
            <p className="text-sm text-gray-600">Your Telegram API credentials are active and working!</p>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
          <Search className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">How to Scan Channels</h4>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              <li>• Enter channel URL: <code className="bg-gray-100 px-2 py-1 rounded">t.me/channel_name</code></li>
              <li>• Or use username: <code className="bg-gray-100 px-2 py-1 rounded">@channel_name</code></li>
              <li>• Or just the name: <code className="bg-gray-100 px-2 py-1 rounded">channel_name</code></li>
            </ul>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg">
          <Users className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">What You Can Analyze</h4>
            <ul className="text-sm text-gray-600 mt-1 space-y-1">
              <li>• Total and active member counts</li>
              <li>• Bot detection and counting</li>
              <li>• KOL (Key Opinion Leader) identification</li>
              <li>• Channel engagement metrics</li>
              <li>• User post tracking</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-900">Access Permissions</h4>
            <p className="text-sm text-amber-700">
              Some channels may require admin access or be private. Public channels and channels you're a member of work best.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg">
          <h4 className="font-medium mb-2">🚀 Ready to Start!</h4>
          <p className="text-sm opacity-90">
            Your Telegram API is configured and ready. Start scanning channels to discover KOLs, analyze engagement, and detect bots!
          </p>
        </div>
      </div>
    </div>
  );
} 