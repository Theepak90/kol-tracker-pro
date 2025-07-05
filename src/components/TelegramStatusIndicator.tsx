import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { telegramService } from '../services/telegramService';

interface TelegramStatusIndicatorProps {
  className?: string;
}

export function TelegramStatusIndicator({ className = '' }: TelegramStatusIndicatorProps) {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkTelegramStatus = async () => {
    setStatus('checking');
    try {
      const isHealthy = await telegramService.checkHealth();
      setStatus(isHealthy ? 'connected' : 'disconnected');
      setLastChecked(new Date());
    } catch (error) {
      setStatus('disconnected');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkTelegramStatus();
    const interval = setInterval(checkTelegramStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'disconnected':
        return 'bg-red-50 border-red-200 text-red-700';
    }
  };

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border ${getStatusColor()} ${className}`}>
      <MessageSquare className="w-4 h-4" />
      <span className="text-sm font-medium">Telegram API:</span>
      {getStatusIcon()}
      <span className="text-sm font-medium">{getStatusText()}</span>
      {lastChecked && (
        <span className="text-xs opacity-75">
          ({lastChecked.toLocaleTimeString()})
        </span>
      )}
    </div>
  );
} 