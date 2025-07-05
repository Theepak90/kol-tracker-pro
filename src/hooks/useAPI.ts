import { useState, useEffect } from 'react';
import { kolTrackerAPI } from '../services';
import { APIResponse } from '../types/api';

export function useChannelAnalysis(channelUsername: string | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!channelUsername) return;

    const analyzeChannel = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await kolTrackerAPI.analyzeChannel(channelUsername);
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to analyze channel');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    analyzeChannel();
  }, [channelUsername]);

  return { data, loading, error };
}

export function useKOLAnalysis(username: string | null, platform: 'telegram' | 'twitter' = 'telegram') {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const analyzeKOL = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await kolTrackerAPI.analyzeKOL(username, platform);
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to analyze KOL');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    analyzeKOL();
  }, [username, platform]);

  return { data, loading, error };
}

export function useRealTimeData() {
  const [volumeSpikes, setVolumeSpikes] = useState<any[]>([]);
  const [newCalls, setNewCalls] = useState<any[]>([]);
  const [botDetections, setBotDetections] = useState<any[]>([]);

  useEffect(() => {
    const handleVolumeSpike = (data: any) => {
      setVolumeSpikes(prev => [data, ...prev.slice(0, 9)]); // Keep last 10
    };

    const handleNewCall = (data: any) => {
      setNewCalls(prev => [data, ...prev.slice(0, 9)]);
    };

    const handleBotDetection = (data: any) => {
      setBotDetections(prev => [data, ...prev.slice(0, 9)]);
    };

    kolTrackerAPI.subscribeToVolumeSpikes(handleVolumeSpike);
    kolTrackerAPI.subscribeToNewCalls(handleNewCall);
    kolTrackerAPI.subscribeToBotDetection(handleBotDetection);

    return () => {
      // Cleanup subscriptions would go here
    };
  }, []);

  return { volumeSpikes, newCalls, botDetections };
}

export function useAPIStatus() {
  const [status, setStatus] = useState<Record<string, 'online' | 'offline' | 'error'>>({
    telegram: 'offline',
    blockchain: 'offline',
    ai: 'offline',
    social: 'offline',
    market: 'offline'
  });

  useEffect(() => {
    const checkAPIStatus = async () => {
      // This would ping each API to check status
      // For now, we'll simulate the status
      setStatus({
        telegram: 'online',
        blockchain: 'online',
        ai: 'online',
        social: 'online',
        market: 'online'
      });
    };

    checkAPIStatus();
    const interval = setInterval(checkAPIStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return status;
}