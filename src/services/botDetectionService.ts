import axios from 'axios';

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
}

export interface BotDetectionStats {
  totalScanned: number;
  confirmedBots: number;
  suspicious: number;
  verifiedHumans: number;
  detectionRate: number;
  lastScanDate?: string;
}

class BotDetectionService {
  private readonly API_BASE = 'http://localhost:3000/api/bot-detection';
  private readonly TELETHON_BASE = 'http://localhost:8000';

  async analyzeUser(username: string): Promise<BotDetectionResult> {
    try {
      // Try the backend API first
      const response = await axios.get(`${this.API_BASE}/analyze/${username}`);
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
      const response = await axios.get(`${this.API_BASE}/analyze-channel/${channelUrl}`);
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

  private processAnalysis(telethonData: any, username: string): BotDetectionResult {
    // Extract relevant data from Telethon response
    const {
      member_count = 0,
      active_members = 0,
      bot_count = 0,
      kol_count = 0,
      kol_details = [],
      previous_scans = []
    } = telethonData;

    // Calculate metrics
    const botRatio = bot_count / (active_members || 1);
    const kolRatio = kol_count / (active_members || 1);
    const activityRatio = active_members / (member_count || 1);
    
    // Determine bot probability based on channel characteristics
    let botProbability = 0;
    let confidenceFactors: string[] = [];
    
    // Factor 1: Very low activity ratio suggests artificial inflation
    if (activityRatio < 0.02 && member_count > 500) {
      botProbability += 0.5;
      confidenceFactors.push(`Extremely low activity ratio (${(activityRatio * 100).toFixed(1)}%)`);
    } else if (activityRatio < 0.05 && member_count > 100) {
      botProbability += 0.3;
      confidenceFactors.push(`Low activity ratio (${(activityRatio * 100).toFixed(1)}%)`);
    }
    
    // Factor 2: High bot ratio in active members
    if (botRatio > 0.2) {
      botProbability += 0.3;
      confidenceFactors.push(`High bot concentration (${bot_count}/${active_members} active members)`);
    } else if (botRatio > 0.1) {
      botProbability += 0.15;
      confidenceFactors.push(`Moderate bot presence detected`);
    }
    
    // Factor 3: Very low KOL ratio might indicate artificial community
    if (kolRatio < 0.05 && active_members > 10) {
      botProbability += 0.15;
      confidenceFactors.push(`Very low KOL participation rate`);
    }
    
    // Factor 4: Username pattern analysis
    const usernamePattern = this.analyzeUsernamePattern(username);
    if (usernamePattern === 'suspicious') {
      botProbability += 0.2;
      confidenceFactors.push('Suspicious username pattern');
    }
    
    // Factor 5: Large member count with minimal engagement suggests bot farms
    if (member_count > 1000 && active_members < 50) {
      botProbability += 0.2;
      confidenceFactors.push('Large group with minimal genuine engagement');
    }
    
    // Determine status with more nuanced thresholds
    let status: 'confirmed_bot' | 'suspicious' | 'human' | 'unknown';
    if (botProbability > 0.8) {
      status = 'confirmed_bot';
    } else if (botProbability > 0.5) {
      status = 'suspicious';
    } else if (botProbability < 0.3 && activityRatio > 0.1) {
      status = 'human';
    } else {
      status = 'unknown';
    }
    
    // Calculate spam score based on the analysis
    const spamScore = Math.min(botProbability * 100, 95);
    
    return {
      username,
      displayName: telethonData.title || username,
      isBot: status === 'confirmed_bot',
      confidence: Math.min(botProbability * 100, 100),
      status,
      detectionDate: new Date().toISOString(),
      
      profileAnalysis: {
        hasProfilePhoto: true, // Assume channels have photos
        bioLength: telethonData.description?.length || 0,
        hasVerifiedBadge: false,
        accountAge: this.estimateAccountAge(previous_scans),
        usernamePattern,
      },
      
      activityAnalysis: {
        messageCount: 0, // Would need message data
        avgMessagesPerDay: 0,
        lastSeenDays: 0,
        activityPattern: activityRatio < 0.03 ? 'inactive' : activityRatio > 0.1 ? 'regular' : 'suspicious',
        timeZoneConsistency: activityRatio < 0.05 ? 40 : 70,
        responseTimePattern: activityRatio < 0.05 ? 'mixed' : 'human',
      },
      
      contentAnalysis: {
        spamScore,
        duplicateContentRatio: botProbability * 60,
        linkSpamRatio: botProbability * 40,
        languageConsistency: 100 - (botProbability * 20),
        sentimentVariation: 100 - (botProbability * 30),
        topicDiversity: Math.max(40, 100 - (botProbability * 40)),
      },
      
      networkAnalysis: {
        mutualConnections: active_members,
        suspiciousConnections: bot_count,
        networkCentrality: Math.max(20, 80 - (botProbability * 40)),
        clusteringCoefficient: Math.max(30, 70 - (botProbability * 30)),
        connectionPattern: botRatio > 0.2 ? 'artificial' : activityRatio < 0.05 ? 'mixed' : 'organic',
      },
      
      aiAnalysis: {
        overview: this.generateOverview(status, confidenceFactors, telethonData, {
          activityRatio,
          botRatio,
          memberCount: member_count,
          activeMembers: active_members
        }),
        keyIndicators: confidenceFactors,
        riskFactors: this.generateRiskFactors(status, botProbability, activityRatio),
        recommendations: this.generateRecommendations(status, activityRatio),
      },
      
      metrics: {
        followers: member_count,
        following: 0,
        posts: 0,
        engagement: (active_members / (member_count || 1)) * 100,
      },
    };
  }
  
  private analyzeUsernamePattern(username: string): 'suspicious' | 'normal' | 'generated' {
    const suspiciousPatterns = [
      /\d{8,}$/, // ends with many numbers
      /bot$/i,   // ends with 'bot'
      /^[a-z]+\d+$/i, // simple pattern like 'user123'
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(username))) {
      return 'suspicious';
    }
    
    const generatedPatterns = [
      /^[a-z0-9]{8,}$/i, // random looking string
      /[A-Z0-9]{10,}/,   // uppercase with numbers
    ];
    
    if (generatedPatterns.some(pattern => pattern.test(username))) {
      return 'generated';
    }
    
    return 'normal';
  }

  private estimateAccountAge(previousScans: any[]): number {
    if (previousScans.length === 0) return 0;
    
    const oldestScan = previousScans[previousScans.length - 1];
    const scanDate = new Date(oldestScan.scanned_at);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - scanDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(daysDiff, 0);
  }
  
  private generateOverview(status: string, factors: string[], telethonData: any, metrics: { activityRatio: number, botRatio: number, memberCount: number, activeMembers: number }): string {
    const channelName = telethonData.title || telethonData.username || 'Channel';
    const { activityRatio, botRatio, memberCount, activeMembers } = metrics;
    
    switch (status) {
      case 'confirmed_bot':
        return `Analysis of ${channelName} reveals significant artificial behavior patterns. With ${memberCount} members but only ${activeMembers} active (${(activityRatio * 100).toFixed(1)}% activity rate), this suggests extensive bot inflation. Key concerns: ${factors.join(', ')}.`;
      case 'suspicious':
        return `${channelName} shows concerning engagement patterns that warrant investigation. The channel has ${memberCount} members with ${activeMembers} active users (${(activityRatio * 100).toFixed(1)}% activity rate). Warning signs include: ${factors.join(', ')}.`;
      case 'human':
        return `${channelName} appears to be a legitimate community with healthy engagement. The ${memberCount} members show good activity levels with ${activeMembers} active participants (${(activityRatio * 100).toFixed(1)}% activity rate).`;
      default:
        return `Analysis of ${channelName} is inconclusive. The channel has ${memberCount} members with ${activeMembers} active (${(activityRatio * 100).toFixed(1)}% activity rate). Additional monitoring recommended to determine authenticity.`;
    }
  }
  
  private generateRiskFactors(status: string, probability: number, activityRatio: number): string[] {
    const factors = [];
    
    if (status === 'confirmed_bot' || status === 'suspicious') {
      factors.push('Potential artificial community inflation');
      factors.push('May be used for coordinated inauthentic behavior');
      if (probability > 0.8) {
        factors.push('High risk of spam or manipulation activities');
      }
    }

    if (activityRatio < 0.05) {
      factors.push('Extremely low activity ratio suggests bot farms');
    }
    
    if (activityRatio < 0.02) {
      factors.push('Critical engagement deficit indicates artificial membership');
    }
    
    return factors;
  }
  
  private generateRecommendations(status: string, activityRatio: number): string[] {
    switch (status) {
      case 'confirmed_bot':
        return [
          'Avoid engaging with this community',
          'High risk of scams and fraudulent activity',
          'Report to platform administrators',
          'Do not trust financial advice from this channel',
        ];
      case 'suspicious':
      return [
          'Exercise extreme caution when engaging',
          'Verify all information independently',
          'Monitor for coordinated posting patterns',
          'Be wary of investment opportunities shared here',
      ];
      case 'human':
      return [
          'Community appears legitimate for engagement',
          'Continue normal participation with standard caution',
          'Monitor community health over time',
      ];
      default:
      return [
          'Gather more activity data before trusting',
          'Monitor community engagement patterns',
          'Verify legitimacy through multiple sources',
          activityRatio < 0.05 ? 'High caution recommended due to low activity' : 'Standard verification recommended',
        ];
    }
  }
  
  async batchAnalyze(usernames: string[]): Promise<BotDetectionResult[]> {
    const results: BotDetectionResult[] = [];
    
    for (const username of usernames) {
      try {
      const result = await this.analyzeUser(username);
      results.push(result);
      } catch (error) {
        console.error(`Failed to analyze ${username}:`, error);
      }
    }
    
    return results;
  }
  
  calculateStats(results: BotDetectionResult[]): BotDetectionStats {
    const totalScanned = results.length;
    const confirmedBots = results.filter(r => r.status === 'confirmed_bot').length;
    const suspicious = results.filter(r => r.status === 'suspicious').length;
    const verifiedHumans = results.filter(r => r.status === 'human').length;
    const detectionRate = totalScanned > 0 ? ((confirmedBots + suspicious) / totalScanned) * 100 : 0;
    
    return {
      totalScanned,
      confirmedBots,
      suspicious,
      verifiedHumans,
      detectionRate,
      lastScanDate: new Date().toISOString(),
    };
  }
}

export const botDetectionService = new BotDetectionService(); 