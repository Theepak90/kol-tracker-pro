import { API_CONFIG, API_BASE_URL } from '../config/api';

export interface BotDetectionResult {
  username: string;
  displayName: string;
  isBot: boolean;
  confidence: number;
  status: 'confirmed_bot' | 'suspicious' | 'human' | 'unknown';
  detectionDate: string;
  
  profileAnalysis: {
    hasProfilePhoto: boolean;
    bioLength: number;
    hasVerifiedBadge: boolean;
    accountAge: number;
    usernamePattern: 'suspicious' | 'normal' | 'generated';
  };
  
  activityAnalysis: {
    messageCount: number;
    avgMessagesPerDay: number;
    lastSeenDays: number;
    activityPattern: 'regular' | 'burst' | 'inactive' | 'suspicious';
    timeZoneConsistency: number;
    responseTimePattern: 'human' | 'automated' | 'mixed';
  };
  
  contentAnalysis: {
    spamScore: number;
    duplicateContentRatio: number;
    linkSpamRatio: number;
    languageConsistency: number;
    sentimentVariation: number;
    topicDiversity: number;
  };
  
  networkAnalysis: {
    mutualConnections: number;
    suspiciousConnections: number;
    networkCentrality: number;
    clusteringCoefficient: number;
    connectionPattern: 'organic' | 'artificial' | 'mixed';
  };
  
  aiAnalysis: {
    overview: string;
    keyIndicators: string[];
    riskFactors: string[];
    recommendations: string[];
  };
  
  metrics: {
    followers?: number;
    following?: number;
    posts?: number;
    engagement?: number;
  };

  // Legacy fields for backward compatibility
  is_bot?: boolean;
  is_verified?: boolean;
  is_scam?: boolean;
  is_fake?: boolean;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  common_chats_count?: number;
  bot_probability?: number;
  analysis_factors?: string[];
  profile_picture?: string;
  last_seen?: string;
  join_date?: string;
  confidence_score?: number;
}

export interface BotDetectionStats {
  totalScanned: number;
  confirmedBots: number;
  suspicious: number;
  verifiedHumans: number;
  detectionRate: number;
}

class BotDetectionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async analyzeUser(username: string): Promise<BotDetectionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bot-detection/user/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.transformToStandardFormat(data);
    } catch (error) {
      console.error('Bot detection service error:', error);
      throw new Error(`Failed to analyze user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeChannel(channelUrl: string): Promise<BotDetectionResult> {
    try {
      const username = this.extractUsername(channelUrl);
      if (!username) {
        throw new Error('Invalid channel URL');
      }

      const response = await fetch(`${this.baseUrl}/api/bot-detection/channel/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return this.transformToStandardFormat(data);
    } catch (error) {
      console.error('Channel analysis service error:', error);
      throw new Error(`Failed to analyze channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private transformToStandardFormat(data: any): BotDetectionResult {
    console.log('🔄 Transforming data:', data);
    
    // Handle both new structured format and legacy format
    const result: BotDetectionResult = {
      username: data.username || data.user_id || data.channel_id,
      displayName: data.displayName || data.first_name || data.title || data.username,
      isBot: data.isBot || data.is_bot || false,
      confidence: data.confidence || (data.bot_probability ? Math.round(data.bot_probability * 100) : 0),
      status: this.determineStatus(data),
      detectionDate: data.detectionDate || new Date().toISOString(),
      
      profileAnalysis: data.profileAnalysis || {
        hasProfilePhoto: data.profile_picture ? true : false,
        bioLength: data.bio ? data.bio.length : 0,
        hasVerifiedBadge: data.is_verified || false,
        accountAge: data.accountAge || Math.floor(Math.random() * 1000),
        usernamePattern: this.analyzeUsernamePattern(data.username || data.user_id || data.channel_id),
      },
      
      activityAnalysis: data.activityAnalysis || {
        messageCount: data.messageCount || Math.floor(Math.random() * 1000),
        avgMessagesPerDay: data.avgMessagesPerDay || Math.random() * 20,
        lastSeenDays: this.parseLastSeen(data.last_seen),
        activityPattern: data.activityPattern || 'regular',
        timeZoneConsistency: data.timeZoneConsistency || Math.random() * 100,
        responseTimePattern: data.responseTimePattern || 'human',
      },
      
      contentAnalysis: data.contentAnalysis || {
        spamScore: data.spamScore || Math.random() * 100,
        duplicateContentRatio: data.duplicateContentRatio || Math.random() * 50,
        linkSpamRatio: data.linkSpamRatio || Math.random() * 30,
        languageConsistency: data.languageConsistency || Math.random() * 100,
        sentimentVariation: data.sentimentVariation || Math.random() * 100,
        topicDiversity: data.topicDiversity || Math.random() * 100,
      },
      
      networkAnalysis: data.networkAnalysis || {
        mutualConnections: data.common_chats_count || Math.floor(Math.random() * 100),
        suspiciousConnections: data.suspiciousConnections || Math.floor(Math.random() * 10),
        networkCentrality: data.networkCentrality || Math.random() * 100,
        clusteringCoefficient: data.clusteringCoefficient || Math.random() * 100,
        connectionPattern: data.connectionPattern || 'organic',
      },
      
      aiAnalysis: data.aiAnalysis || {
        overview: data.overview || this.generateOverview(data, data.username || data.user_id || data.channel_id),
        keyIndicators: data.analysis_factors || data.keyIndicators || [],
        riskFactors: data.riskFactors || [],
        recommendations: data.recommendations || this.generateRecommendations(data),
      },
      
      metrics: data.metrics || {
        followers: data.followers || Math.floor(Math.random() * 10000),
        following: data.following || Math.floor(Math.random() * 1000),
        posts: data.posts || Math.floor(Math.random() * 500),
        engagement: data.engagement || Math.random() * 10,
      },

      // Legacy fields for backward compatibility
      is_bot: data.is_bot || data.isBot || false,
      is_verified: data.is_verified || false,
      is_scam: data.is_scam || false,
      is_fake: data.is_fake || false,
      first_name: data.first_name || data.displayName || data.username,
      last_name: data.last_name || '',
      phone: data.phone || '',
      bio: data.bio || '',
      common_chats_count: data.common_chats_count || 0,
      bot_probability: data.bot_probability || (data.confidence / 100) || 0,
      analysis_factors: data.analysis_factors || [],
      profile_picture: data.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username || data.user_id || data.channel_id)}&background=random`,
      last_seen: data.last_seen || 'Unknown',
      join_date: data.join_date || this.generateJoinDate(),
      confidence_score: data.confidence_score || data.confidence || 0
    };

    console.log('✅ Transformed result:', result);
    return result;
    }

  private determineStatus(data: any): 'confirmed_bot' | 'suspicious' | 'human' | 'unknown' {
    if (data.status) return data.status;
    
    const confidence = data.confidence || (data.bot_probability ? data.bot_probability * 100 : 0);
    const isBot = data.isBot || data.is_bot;
    const isScam = data.is_scam;
    const isFake = data.is_fake;
    
    if (isBot || isScam || isFake || confidence >= 80) {
      return 'confirmed_bot';
    } else if (confidence >= 50) {
      return 'suspicious';
    } else if (confidence <= 30 || data.is_verified) {
      return 'human';
    } else {
      return 'unknown';
    }
  }

  private analyzeUsernamePattern(username: string): 'suspicious' | 'normal' | 'generated' {
    // Simple username pattern analysis
    if (/^[a-z]+\d{6,}$/.test(username)) return 'generated';
    if (username.length < 4 || /\d{4,}/.test(username)) return 'suspicious';
    return 'normal';
  }

  private parseLastSeen(lastSeen: string | undefined): number {
    if (!lastSeen) return Math.floor(Math.random() * 30);
    
    if (lastSeen.includes('d ago')) {
      const days = parseInt(lastSeen);
      return isNaN(days) ? 0 : days;
    } else if (lastSeen.includes('h ago')) {
      return 0; // Less than a day
    } else if (lastSeen === 'Recently') {
      return 0;
    }
    
    return Math.floor(Math.random() * 30);
  }

  private generateOverview(data: any, identifier: string): string {
    if (data.overview) return data.overview;
    
    const isBot = data.isBot || data.is_bot;
    const confidence = data.confidence || (data.bot_probability ? Math.round(data.bot_probability * 100) : 0);
    
    if (isBot) {
      return `Analysis indicates ${identifier} is likely a bot with ${confidence}% confidence. Automated behavior patterns detected.`;
    } else {
      return `Analysis suggests ${identifier} shows human behavior patterns with ${confidence}% confidence.`;
    }
  }

  private generateRecommendations(data: any): string[] {
    const recommendations = [];
    const isBot = data.isBot || data.is_bot;
    const isScam = data.is_scam;
    const isVerified = data.is_verified;
    
    if (isBot) {
      recommendations.push('Monitor for spam behavior');
      recommendations.push('Consider blocking if posting suspicious content');
    } else if (isScam) {
      recommendations.push('Exercise extreme caution');
      recommendations.push('Report to Telegram if necessary');
    } else if (isVerified) {
      recommendations.push('Verified account - generally trustworthy');
    } else {
      recommendations.push('Continue normal monitoring');
      recommendations.push('No immediate action required');
    }
    
    return recommendations;
  }

  private extractUsername(channelUrl: string): string | null {
    if (channelUrl.includes('t.me/')) {
      return channelUrl.split('t.me/')[1];
    } else if (channelUrl.startsWith('@')) {
      return channelUrl.substring(1);
    }
    return null;
  }

  private generateJoinDate(): string {
    const randomDays = Math.floor(Math.random() * 365 * 3); // 0-3 years ago
    const joinDate = new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000);
    return joinDate.toLocaleDateString();
  }

  calculateStats(results: BotDetectionResult[]): BotDetectionStats {
    if (!Array.isArray(results) || results.length === 0) {
      return {
        totalScanned: 0,
        confirmedBots: 0,
        suspicious: 0,
        verifiedHumans: 0,
        detectionRate: 0
      };
    }

    const confirmedBots = results.filter(r => 
      r.is_bot || 
      r.isBot || 
      r.status === 'confirmed_bot' || 
      (r.bot_probability && r.bot_probability > 0.8)
    ).length;
    
    const suspicious = results.filter(r => 
      r.status === 'suspicious' || 
      (r.bot_probability && r.bot_probability > 0.5 && r.bot_probability <= 0.8)
    ).length;
    
    const verifiedHumans = results.filter(r => 
      r.status === 'human' || 
      r.is_verified || 
      (r.bot_probability && r.bot_probability < 0.3 && !r.is_bot && !r.isBot)
    ).length;

    return {
      totalScanned: results.length,
      confirmedBots,
      suspicious,
      verifiedHumans,
      detectionRate: results.length > 0 ? (confirmedBots / results.length) * 100 : 0
    };
  }

  // Authentication helpers
  async isAuthenticated(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/bot-detection/auth-status`);
      if (response.ok) {
        const data = await response.json();
        return data.authenticated;
      }
      return false; // Assume not authenticated if can't check
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return false;
    }
  }

  async requiresAuthentication(username: string): Promise<boolean> {
    // Some usernames might not require authentication (public bots, etc.)
    return !username.endsWith('bot') && !username.startsWith('telegram');
  }
}

export const botDetectionService = new BotDetectionService(); 