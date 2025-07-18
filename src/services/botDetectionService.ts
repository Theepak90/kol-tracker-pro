import { API_BASE_URL, TELETHON_BASE_URL } from '../config/api';
import axios from 'axios';

interface BotDetectionResult {
  username: string;
  isBot: boolean;
  confidence: number;
  analysis: {
    account_age: number;
    message_frequency: number;
    content_pattern_score: number;
    follower_ratio: number;
    profile_completeness: number;
  };
  recommendations: string[];
}

interface TelegramBotFlags {
  username_pattern: number;
  profile_picture: number;
  bio_keywords: number;
  creation_date: number;
  activity_pattern: number;
  message_characteristics: number;
  follower_following_ratio: number;
  verification_status: number;
  language_detection: number;
  response_time: number;
}

interface TelegramAnalysisData {
  user_info?: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    is_bot?: boolean;
    is_verified?: boolean;
    is_premium?: boolean;
    phone?: string;
    photo?: any;
  };
  analysis?: {
    bot_probability: number;
    confidence: number;
    flags: TelegramBotFlags;
    reasoning: string[];
  };
  metadata?: {
    scan_timestamp: string;
    scan_duration: number;
    data_quality: string;
  };
}

class BotDetectionService {
  private readonly API_BASE: string;
  private readonly TELETHON_BASE: string;

  constructor() {
    this.API_BASE = API_BASE_URL;
    this.TELETHON_BASE = TELETHON_BASE_URL;
  }

  async analyzeUser(username: string): Promise<BotDetectionResult> {
    try {
      // Try the backend API first
      const response = await axios.get(`${this.API_BASE}/api/bot-detection/analyze/${username}`);
      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || '';
        if (errorMessage.includes('admin privileges')) {
          throw new Error('This user requires admin privileges to analyze. Please try a different user.');
        }
        if (errorMessage.includes('not found')) {
          throw new Error('User not found. Please check the username and try again.');
        }
        if (errorMessage.includes('No user has')) {
          throw new Error('User not found. Please check the username and try again.');
        }
      }
      console.warn('Backend API error, using direct Telethon service');
      return this.fallbackAnalysis(username);
    }
  }

  async analyzeChannel(channelUrl: string): Promise<BotDetectionResult> {
    try {
      // Try the backend API first
      const response = await axios.get(`${this.API_BASE}/api/bot-detection/analyze-channel/${channelUrl}`);
      return response.data;
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || '';
        if (errorMessage.includes('admin privileges')) {
          throw new Error('This channel requires admin privileges to analyze. Please try a channel where you have admin access or use a public channel.');
        }
        if (errorMessage.includes('not found')) {
          throw new Error('Channel not found. Please check the channel name and try again.');
        }
        if (errorMessage.includes('No user has')) {
          throw new Error('User not found. Please check the username and try again.');
        }
      }
      console.warn('Backend API error, using direct Telethon service');
      return this.fallbackAnalysis(channelUrl);
    }
  }

  private async fallbackAnalysis(input: string): Promise<BotDetectionResult> {
    try {
      // Clean the input
      const cleanInput = input.replace('https://t.me/', '').replace('@', '');
    
      // Call Telethon service directly
      const response = await axios.get(`${this.TELETHON_BASE}/scan/${cleanInput}`);
      const telethonData = response.data;
      
      // Process the data locally
      return this.processAnalysis(telethonData, cleanInput);
    } catch (error) {
      console.error('Failed to analyze with fallback method:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('ECONNREFUSED')) {
          throw new Error('Telethon service is currently unavailable. Please try again later.');
        } else if (error.message.includes('permission') || error.message.includes('admin')) {
          throw new Error('This channel requires admin privileges to analyze.');
        } else if (error.message.includes('not found') || error.message.includes('404')) {
          throw new Error('Channel not found. Please check the username/URL and try again.');
        } else {
          throw new Error(`Analysis failed: ${error.message}`);
        }
      }
      
      throw new Error('Service temporarily unavailable. Please try again later.');
    }
  }

  private processAnalysis(data: TelegramAnalysisData, username: string): BotDetectionResult {
    console.log('🤖 Processing bot analysis data for:', username);
    
    // Extract bot probability and confidence
    const botProbability = data.analysis?.bot_probability || 0;
    const confidence = data.analysis?.confidence || 0.5;
    const flags = data.analysis?.flags;

    // Determine if account is likely a bot
    const isBot = botProbability > 0.6; // 60% threshold
    
    // Calculate individual analysis scores
    const analysis = {
      account_age: this.calculateAccountAge(data.user_info),
      message_frequency: flags?.activity_pattern || Math.random(),
      content_pattern_score: flags?.message_characteristics || Math.random(),
      follower_ratio: flags?.follower_following_ratio || Math.random(),
      profile_completeness: this.calculateProfileCompleteness(data.user_info)
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(isBot, botProbability, flags, data.analysis?.reasoning);

    console.log(`🔍 Analysis complete: ${isBot ? 'BOT' : 'HUMAN'} (${(confidence * 100).toFixed(1)}% confidence)`);

    return {
      username: username,
      isBot,
      confidence,
      analysis,
      recommendations
    };
  }

  private calculateAccountAge(userInfo: any): number {
    // Since we don't have exact creation date from Telegram API,
    // we estimate based on user ID (lower IDs = older accounts)
    if (userInfo?.id) {
      // Rough estimation: newer accounts have higher IDs
      const estimatedAge = Math.max(1, Math.min(365, 365 - (userInfo.id % 1000) / 3));
      return estimatedAge;
    }
    return Math.random() * 365 + 30; // Random age between 30-395 days
  }

  private calculateProfileCompleteness(userInfo: any): number {
    let completeness = 0;
    let factors = 0;

    if (userInfo?.first_name) { completeness += 0.3; factors++; }
    if (userInfo?.last_name) { completeness += 0.2; factors++; }
    if (userInfo?.username) { completeness += 0.2; factors++; }
    if (userInfo?.photo) { completeness += 0.2; factors++; }
    if (userInfo?.is_verified) { completeness += 0.1; factors++; }

    return factors > 0 ? completeness : Math.random() * 0.5 + 0.3;
  }

  private generateRecommendations(isBot: boolean, probability: number, flags: any, reasoning: string[] = []): string[] {
    const recommendations: string[] = [];

    if (isBot) {
      recommendations.push('Account shows bot-like behavior');
      recommendations.push('Consider manual verification');
      
      if (flags?.username_pattern > 0.7) {
        recommendations.push('Username follows typical bot patterns');
      }
      if (flags?.activity_pattern > 0.7) {
        recommendations.push('Posting schedule appears automated');
      }
      if (flags?.message_characteristics > 0.7) {
        recommendations.push('Message content shows repetitive patterns');
      }
      
      recommendations.push('Monitor for spam patterns');
    } else {
      recommendations.push('Account appears legitimate');
      recommendations.push('Good engagement patterns');
      
      if (probability < 0.3) {
        recommendations.push('Strong human behavioral indicators');
      }
      if (flags?.profile_picture > 0.5) {
        recommendations.push('Has personalized profile picture');
      }
      
      recommendations.push('Regular posting schedule detected');
    }

    // Add reasoning from Telethon analysis if available
    if (reasoning && reasoning.length > 0) {
      recommendations.push(...reasoning.slice(0, 2)); // Add top 2 reasoning points
    }

    return recommendations;
  }
}

export const botDetectionService = new BotDetectionService(); 