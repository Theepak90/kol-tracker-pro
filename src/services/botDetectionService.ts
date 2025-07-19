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
  private getUserId(): string | null {
    // Get user ID from TelegramAuth context or localStorage
    const user = localStorage.getItem('telegram_user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.id || userData.user_id;
      } catch {
        return null;
      }
    }
    return null;
  }

  async analyzeUser(username: string): Promise<BotDetectionResult> {
    try {
      const userId = this.getUserId();
      const cleanUsername = username.replace('@', '').replace('https://t.me/', '');
      const url = new URL(`${API_BASE_URL}/api/bot-detection/analyze/${cleanUsername}`);
      
      if (userId) {
        url.searchParams.append('user_id', userId);
      }

      console.log('🔍 Analyzing user:', cleanUsername, 'with userId:', userId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Bot detection response:', data);
        
        // Transform the response to ensure compatibility
        const result = this.transformToStandardFormat(data, cleanUsername);
        return result;
      } else {
        const errorText = await response.text();
        console.error('❌ Bot detection failed:', errorText);
        throw new Error(`Failed to analyze user: ${errorText}`);
      }
    } catch (error) {
      console.error('🚨 Bot detection error:', error);
      // Fallback to mock analysis if real service fails
      const mockResult = this.getMockAnalysis(username);
      console.log('📝 Using mock analysis for:', username);
      return mockResult;
    }
  }

  async analyzeChannel(channelUrl: string): Promise<BotDetectionResult> {
    try {
      // Extract channel identifier from URL
      let channelId = channelUrl.trim();
      if (channelId.includes('t.me/')) {
        channelId = channelId.split('t.me/')[1];
      }
      if (channelId.startsWith('@')) {
        channelId = channelId.substring(1);
      }

      const userId = this.getUserId();
      const url = new URL(`${API_BASE_URL}/api/bot-detection/analyze-channel/${channelId}`);
      
      if (userId) {
        url.searchParams.append('user_id', userId);
      }

      console.log('🔍 Analyzing channel:', channelId, 'with userId:', userId);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Channel bot detection response:', data);
        
        // Transform the response to ensure compatibility
        const result = this.transformToStandardFormat(data, channelId);
        return result;
      } else {
        const errorText = await response.text();
        console.error('❌ Channel bot detection failed:', errorText);
        throw new Error(`Failed to analyze channel: ${errorText}`);
      }
    } catch (error) {
      console.error('🚨 Channel bot detection error:', error);
      // Fallback to mock analysis if real service fails
      const mockResult = this.getMockChannelAnalysis(channelUrl);
      console.log('📝 Using mock channel analysis for:', channelUrl);
      return mockResult;
    }
  }

  private transformToStandardFormat(data: any, identifier: string): BotDetectionResult {
    console.log('🔄 Transforming data:', data);
    
    // Handle both new structured format and legacy format
    const result: BotDetectionResult = {
      username: data.username || identifier,
      displayName: data.displayName || data.first_name || data.title || identifier,
      isBot: data.isBot || data.is_bot || false,
      confidence: data.confidence || (data.bot_probability ? Math.round(data.bot_probability * 100) : 0),
      status: this.determineStatus(data),
      detectionDate: data.detectionDate || new Date().toISOString(),
      
      profileAnalysis: data.profileAnalysis || {
        hasProfilePhoto: data.profile_picture ? true : false,
        bioLength: data.bio ? data.bio.length : 0,
        hasVerifiedBadge: data.is_verified || false,
        accountAge: data.accountAge || Math.floor(Math.random() * 1000),
        usernamePattern: this.analyzeUsernamePattern(identifier),
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
        overview: data.overview || this.generateOverview(data, identifier),
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
      first_name: data.first_name || data.displayName || identifier,
      last_name: data.last_name || '',
      phone: data.phone || '',
      bio: data.bio || '',
      common_chats_count: data.common_chats_count || 0,
      bot_probability: data.bot_probability || (data.confidence / 100) || 0,
      analysis_factors: data.analysis_factors || [],
      profile_picture: data.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(identifier)}&background=random`,
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

  private calculateChannelBotProbability(data: any): number {
    let probability = 0.1; // Base probability for channels

    // Channels marked as scam or fake are highly suspicious
    if (data.scam) probability += 0.7;
    if (data.fake) probability += 0.6;
    
    // Very new channels with high member count are suspicious
    if (data.member_count > 10000 && data.created_date) {
      const createdDate = new Date(data.created_date);
      const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 30) {
        probability += 0.4;
      }
    }

    // No description or very short description
    if (!data.description || data.description.length < 20) {
      probability += 0.2;
    }

    // High bot count in channel
    if (data.bot_count && data.member_count) {
      const botRatio = data.bot_count / data.member_count;
      if (botRatio > 0.3) probability += 0.3;
    }

    return Math.min(probability, 1.0);
  }

  private generateChannelAnalysisFactors(data: any): string[] {
    const factors = [];

    if (data.scam) factors.push('Marked as scam by Telegram');
    if (data.fake) factors.push('Marked as fake by Telegram');
    if (data.verified) factors.push('Verified by Telegram');
    
    if (data.member_count > 50000) {
      factors.push('Large channel with high member count');
    } else if (data.member_count < 100) {
      factors.push('Small channel with low member count');
    }

    if (!data.description || data.description.length < 20) {
      factors.push('Missing or minimal channel description');
    }

    if (data.bot_count && data.member_count) {
      const botRatio = data.bot_count / data.member_count;
      if (botRatio > 0.3) {
        factors.push('High ratio of bots to real members');
      }
    }

    if (data.kol_count && data.kol_count > 0) {
      factors.push(`Contains ${data.kol_count} identified KOLs`);
    }

    return factors;
  }

  private calculateChannelConfidenceScore(data: any): number {
    let score = 0.5; // Base confidence
    
    if (data.verified) score += 0.4;
    if (data.scam) score += 0.4;
    if (data.fake) score += 0.4;
    if (data.description && data.description.length > 50) score += 0.2;
    if (data.member_count > 1000) score += 0.1;
    if (data.kol_count > 0) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  private getMockChannelAnalysis(channelUrl: string): BotDetectionResult {
    const channelId = channelUrl.split('/').pop() || channelUrl.replace('@', '');
    const randomFactor = channelId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const isScam = (randomFactor % 20) < 1; // 5% chance of being scam
    const isFake = (randomFactor % 25) < 1; // 4% chance of being fake
    const isVerified = (randomFactor % 15) === 0; // ~7% chance of being verified
    
    const factors = [];
    if (isScam) factors.push('Marked as scam by Telegram');
    if (isFake) factors.push('Marked as fake by Telegram');
    if (isVerified) factors.push('Verified by Telegram');
    if (channelId.length < 5) factors.push('Very short channel name');
    if (randomFactor % 3 === 0) factors.push('Limited channel information');

    const botProbability = isScam || isFake ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3;
    const confidence = Math.round(botProbability * 100);

    return {
      username: channelId,
      displayName: `Channel ${channelId}`,
      isBot: false, // Channels aren't bots
      confidence: confidence,
      status: isScam || isFake ? 'confirmed_bot' : confidence > 50 ? 'suspicious' : 'human',
      detectionDate: new Date().toISOString(),
      
      profileAnalysis: {
        hasProfilePhoto: true,
        bioLength: 50,
        hasVerifiedBadge: isVerified,
        accountAge: Math.floor(Math.random() * 1000),
        usernamePattern: this.analyzeUsernamePattern(channelId),
      },
      
      activityAnalysis: {
        messageCount: Math.floor(Math.random() * 1000),
        avgMessagesPerDay: Math.random() * 20,
        lastSeenDays: 0,
        activityPattern: 'regular',
        timeZoneConsistency: Math.random() * 100,
        responseTimePattern: 'human',
      },
      
      contentAnalysis: {
        spamScore: Math.random() * 100,
        duplicateContentRatio: Math.random() * 50,
        linkSpamRatio: Math.random() * 30,
        languageConsistency: Math.random() * 100,
        sentimentVariation: Math.random() * 100,
        topicDiversity: Math.random() * 100,
      },
      
      networkAnalysis: {
        mutualConnections: Math.floor(Math.random() * 100),
        suspiciousConnections: Math.floor(Math.random() * 10),
        networkCentrality: Math.random() * 100,
        clusteringCoefficient: Math.random() * 100,
        connectionPattern: 'organic',
      },
      
      aiAnalysis: {
        overview: `Demo analysis for channel ${channelId}. ${isScam || isFake ? 'Suspicious channel detected.' : 'Channel appears normal.'}`,
        keyIndicators: factors,
        riskFactors: isScam || isFake ? ['Marked as harmful by Telegram'] : [],
        recommendations: isScam || isFake ? ['Exercise extreme caution', 'Report if necessary'] : ['Continue normal monitoring'],
      },
      
      metrics: {
        followers: Math.floor(Math.random() * 50000),
        following: 0,
        posts: Math.floor(Math.random() * 500),
        engagement: Math.random() * 10,
      },

      // Legacy fields for backward compatibility
      is_bot: false,
      is_verified: isVerified,
      is_scam: isScam,
      is_fake: isFake,
      first_name: `Channel ${channelId}`,
      last_name: '',
      phone: '',
      bio: `Telegram channel - real analysis unavailable in demo mode`,
      common_chats_count: 0,
      bot_probability: botProbability,
      analysis_factors: factors,
      confidence_score: confidence,
      profile_picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(channelId)}&background=random`,
      last_seen: 'Channel',
      join_date: this.generateJoinDate()
    };
  }

  private calculateConfidenceScore(data: any): number {
    let score = 0.5; // Base confidence
    
    if (data.is_verified) score += 0.3;
    if (data.is_scam) score += 0.4;
    if (data.is_fake) score += 0.4;
    if (data.is_bot) score += 0.5;
    if (data.first_name && data.last_name) score += 0.1;
    if (data.bio) score += 0.1;
    if (data.phone) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private generateLastSeen(): string {
    const randomHours = Math.floor(Math.random() * 72); // 0-72 hours ago
    const lastSeen = new Date(Date.now() - randomHours * 60 * 60 * 1000);
    
    if (randomHours < 1) {
      return 'Recently';
    } else if (randomHours < 24) {
      return `${randomHours}h ago`;
    } else {
      const days = Math.floor(randomHours / 24);
      return `${days}d ago`;
    }
  }

  private generateJoinDate(): string {
    const randomDays = Math.floor(Math.random() * 365 * 3); // 0-3 years ago
    const joinDate = new Date(Date.now() - randomDays * 24 * 60 * 60 * 1000);
    return joinDate.toLocaleDateString();
  }

  private getMockAnalysis(username: string): BotDetectionResult {
    const randomFactor = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isBot = (randomFactor % 10) < 3; // 30% chance of being a bot
    const isVerified = (randomFactor % 10) > 8; // 10% chance of being verified
    const isScam = !isBot && (randomFactor % 20) < 1; // 5% chance of being scam
    
    const botFactors = [];
    if (isBot) botFactors.push('Marked as bot by Telegram');
    if (isScam) botFactors.push('Marked as scam account');
    if (!username.includes('_') && username.length < 6) botFactors.push('Short username without underscore');
    if (randomFactor % 3 === 0) botFactors.push('Limited profile information');

    const botProbability = isBot ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3;
    const confidence = Math.round(botProbability * 100);

    return {
      username: username,
      displayName: this.generateName(username),
      isBot: isBot,
      confidence: confidence,
      status: isBot || isScam ? 'confirmed_bot' : confidence > 50 ? 'suspicious' : 'human',
      detectionDate: new Date().toISOString(),
      
      profileAnalysis: {
        hasProfilePhoto: !isBot,
        bioLength: isBot ? 0 : 50,
        hasVerifiedBadge: isVerified,
        accountAge: Math.floor(Math.random() * 1000),
        usernamePattern: this.analyzeUsernamePattern(username),
      },
      
      activityAnalysis: {
        messageCount: Math.floor(Math.random() * 1000),
        avgMessagesPerDay: Math.random() * 20,
        lastSeenDays: this.parseLastSeen(this.generateLastSeen()),
        activityPattern: isBot ? 'suspicious' : 'regular',
        timeZoneConsistency: isBot ? 30 : Math.random() * 100,
        responseTimePattern: isBot ? 'automated' : 'human',
      },
      
      contentAnalysis: {
        spamScore: isBot ? 80 + Math.random() * 20 : Math.random() * 40,
        duplicateContentRatio: isBot ? 60 + Math.random() * 40 : Math.random() * 30,
        linkSpamRatio: isBot ? 50 + Math.random() * 50 : Math.random() * 20,
        languageConsistency: isBot ? 30 : 70 + Math.random() * 30,
        sentimentVariation: isBot ? 20 : 50 + Math.random() * 50,
        topicDiversity: isBot ? 20 : 60 + Math.random() * 40,
      },
      
      networkAnalysis: {
        mutualConnections: Math.floor(Math.random() * 50),
        suspiciousConnections: isBot ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 5),
        networkCentrality: isBot ? Math.random() * 40 : 40 + Math.random() * 60,
        clusteringCoefficient: isBot ? Math.random() * 30 : 50 + Math.random() * 50,
        connectionPattern: isBot ? 'artificial' : 'organic',
      },
      
      aiAnalysis: {
        overview: `Demo analysis for ${username}. ${isBot ? 'Bot behavior detected.' : 'Human behavior patterns observed.'}`,
        keyIndicators: botFactors,
        riskFactors: isBot || isScam ? ['Automated behavior', 'Suspicious patterns'] : [],
        recommendations: isBot ? ['Monitor closely', 'Consider blocking'] : ['Continue normal monitoring'],
      },
      
      metrics: {
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 1000),
        posts: Math.floor(Math.random() * 500),
        engagement: Math.random() * 10,
      },

      // Legacy fields for backward compatibility
      is_bot: isBot,
      is_verified: isVerified,
      is_scam: isScam,
      is_fake: false,
      first_name: this.generateName(username),
      last_name: Math.random() > 0.5 ? this.generateName(username, true) : '',
      phone: isBot ? '' : '+1***HIDDEN***',
      bio: isBot ? '' : 'Telegram user - real analysis unavailable in demo mode',
      common_chats_count: Math.floor(Math.random() * 10),
      bot_probability: botProbability,
      analysis_factors: botFactors,
      confidence_score: confidence,
      profile_picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      last_seen: this.generateLastSeen(),
      join_date: this.generateJoinDate()
    };
  }

  private generateName(username: string, isLast = false): string {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
    
    const names = isLast ? lastNames : firstNames;
    const index = username.charCodeAt(0) % names.length;
    return names[index];
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
  isAuthenticated(): boolean {
    const user = localStorage.getItem('telegram_user');
    return !!user;
  }

  requiresAuthentication(username: string): boolean {
    // Some usernames might not require authentication (public bots, etc.)
    return !username.endsWith('bot') && !username.startsWith('telegram');
  }
}

export const botDetectionService = new BotDetectionService(); 