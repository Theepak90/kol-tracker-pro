export interface BotDetectionResult {
  username: string;
  displayName: string;
  userId?: number;
  channelId?: number;
  isBot: boolean;
  confidence: number;
  status: 'confirmed_bot' | 'suspicious' | 'human' | 'unknown';
  detectionDate: string;
  
  // Profile Analysis
  profileAnalysis: {
    hasProfilePhoto: boolean;
    profilePhotoAge?: number; // days
    bioLength: number;
    bioLanguages: string[];
    hasVerifiedBadge: boolean;
    accountAge: number; // days
    usernamePattern: 'suspicious' | 'normal' | 'generated';
  };
  
  // Activity Analysis
  activityAnalysis: {
    messageCount: number;
    avgMessagesPerDay: number;
    lastSeenDays: number;
    activityPattern: 'regular' | 'burst' | 'inactive' | 'suspicious';
    timeZoneConsistency: number; // 0-100
    responseTimePattern: 'human' | 'automated' | 'mixed';
  };
  
  // Content Analysis
  contentAnalysis: {
    spamScore: number; // 0-100
    duplicateContentRatio: number; // 0-100
    linkSpamRatio: number; // 0-100
    languageConsistency: number; // 0-100
    sentimentVariation: number; // 0-100
    topicDiversity: number; // 0-100
  };
  
  // Network Analysis
  networkAnalysis: {
    mutualConnections: number;
    suspiciousConnections: number;
    networkCentrality: number; // 0-100
    clusteringCoefficient: number; // 0-100
    connectionPattern: 'organic' | 'artificial' | 'mixed';
  };
  
  // AI Analysis
  aiAnalysis: {
    overview: string;
    keyIndicators: string[];
    riskFactors: string[];
    recommendations: string[];
    alternativeAccounts?: string[];
  };
  
  // Metrics
  metrics: {
    followers?: number;
    following?: number;
    posts?: number;
    engagement?: number;
    reachability?: number;
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
  private generateBotDetectionResult(input: string): BotDetectionResult {
    // Simulate API delay and analysis
    const isChannel = input.startsWith('@') || input.includes('t.me/');
    const cleanUsername = input.replace('@', '').replace('t.me/', '');
    
    // Generate realistic bot detection data
    const confidence = 70 + Math.random() * 25;
    const accountAge = 30 + Math.random() * 1000;
    const messageCount = Math.floor(Math.random() * 5000);
    
    // Determine bot probability based on patterns
    const suspiciousPatterns = [
      /\d{8,}$/, // ends with many numbers
      /bot$/i,   // ends with 'bot'
      /^[a-z]+\d+$/i, // simple pattern like 'user123'
    ];
    
    const isSuspiciousUsername = suspiciousPatterns.some(pattern => pattern.test(cleanUsername));
    const hasHighActivity = messageCount > 1000;
    const isNewAccount = accountAge < 90;
    
    let status: 'confirmed_bot' | 'suspicious' | 'human' | 'unknown';
    let isBot = false;
    
    if (isSuspiciousUsername && hasHighActivity && isNewAccount) {
      status = 'confirmed_bot';
      isBot = true;
    } else if (isSuspiciousUsername || (hasHighActivity && isNewAccount)) {
      status = 'suspicious';
    } else if (confidence > 85 && !isSuspiciousUsername) {
      status = 'human';
    } else {
      status = 'unknown';
    }
    
    const spamScore = isBot ? 80 + Math.random() * 20 : Math.random() * 30;
    const duplicateRatio = isBot ? 60 + Math.random() * 40 : Math.random() * 20;
    
    return {
      username: cleanUsername,
      displayName: this.generateDisplayName(cleanUsername),
      userId: Math.floor(Math.random() * 1000000000),
      channelId: isChannel ? Math.floor(Math.random() * 1000000000) : undefined,
      isBot,
      confidence,
      status,
      detectionDate: new Date().toISOString(),
      
      profileAnalysis: {
        hasProfilePhoto: Math.random() > (isBot ? 0.7 : 0.3),
        profilePhotoAge: Math.floor(Math.random() * 365),
        bioLength: Math.floor(Math.random() * 200),
        bioLanguages: ['en', 'es', 'ru'][Math.floor(Math.random() * 3)] ? ['en'] : ['en', 'es'],
        hasVerifiedBadge: Math.random() > 0.95,
        accountAge,
        usernamePattern: isSuspiciousUsername ? 'suspicious' : Math.random() > 0.8 ? 'generated' : 'normal',
      },
      
      activityAnalysis: {
        messageCount,
        avgMessagesPerDay: messageCount / Math.max(accountAge, 1),
        lastSeenDays: Math.floor(Math.random() * 30),
        activityPattern: isBot ? 'burst' : ['regular', 'inactive'][Math.floor(Math.random() * 2)] as any,
        timeZoneConsistency: isBot ? 20 + Math.random() * 30 : 70 + Math.random() * 30,
        responseTimePattern: isBot ? 'automated' : Math.random() > 0.7 ? 'mixed' : 'human',
      },
      
      contentAnalysis: {
        spamScore,
        duplicateContentRatio: duplicateRatio,
        linkSpamRatio: isBot ? 40 + Math.random() * 40 : Math.random() * 15,
        languageConsistency: isBot ? 95 + Math.random() * 5 : 60 + Math.random() * 30,
        sentimentVariation: isBot ? 10 + Math.random() * 20 : 40 + Math.random() * 40,
        topicDiversity: isBot ? 10 + Math.random() * 30 : 50 + Math.random() * 50,
      },
      
      networkAnalysis: {
        mutualConnections: Math.floor(Math.random() * 100),
        suspiciousConnections: isBot ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * 5),
        networkCentrality: Math.floor(Math.random() * 100),
        clusteringCoefficient: isBot ? 20 + Math.random() * 30 : 40 + Math.random() * 40,
        connectionPattern: isBot ? 'artificial' : Math.random() > 0.7 ? 'mixed' : 'organic',
      },
      
      aiAnalysis: {
        overview: this.generateAIOverview(status, cleanUsername, isBot),
        keyIndicators: this.generateKeyIndicators(status, isBot),
        riskFactors: this.generateRiskFactors(status, isBot),
        recommendations: this.generateRecommendations(status, isBot),
        alternativeAccounts: isBot ? this.generateAlternativeAccounts(cleanUsername) : undefined,
      },
      
      metrics: {
        followers: Math.floor(Math.random() * 10000),
        following: Math.floor(Math.random() * 1000),
        posts: Math.floor(Math.random() * 500),
        engagement: Math.floor(Math.random() * 100),
        reachability: Math.floor(Math.random() * 100),
      },
    };
  }
  
  private generateDisplayName(username: string): string {
    const names = [
      'John Smith', 'Maria Garcia', 'Alex Johnson', 'Sarah Wilson',
      'Mike Brown', 'Anna Davis', 'Chris Miller', 'Emma Taylor',
      'Bot User', 'Automated Account', 'Spam Bot', 'Promo Bot'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }
  
  private generateAIOverview(status: string, username: string, isBot: boolean): string {
    if (status === 'confirmed_bot') {
      return `Analysis indicates that @${username} is highly likely to be an automated bot account. The account exhibits multiple characteristics typical of bot behavior including automated posting patterns, suspicious username structure, and unusual activity metrics. Recommend immediate flagging and monitoring.`;
    } else if (status === 'suspicious') {
      return `@${username} shows several indicators that warrant further investigation. While not definitively classified as a bot, the account displays some automated behaviors and patterns that deviate from typical human usage. Recommend continued monitoring and additional verification.`;
    } else if (status === 'human') {
      return `@${username} appears to be a legitimate human account based on natural activity patterns, diverse content creation, and consistent behavioral metrics. The account shows organic engagement and human-like interaction patterns with minimal automation indicators.`;
    } else {
      return `@${username} requires additional data for conclusive classification. Current analysis is inconclusive due to limited activity history or mixed behavioral signals. Recommend extended monitoring period for better assessment.`;
    }
  }
  
  private generateKeyIndicators(status: string, isBot: boolean): string[] {
    if (isBot) {
      return [
        'Automated posting schedule detected',
        'High message frequency with low engagement',
        'Repetitive content patterns identified',
        'Suspicious username structure',
        'Minimal profile customization',
        'Rapid response times suggesting automation'
      ];
    } else if (status === 'suspicious') {
      return [
        'Irregular activity patterns detected',
        'Some automated behaviors observed',
        'Mixed engagement metrics',
        'Partial profile information',
        'Moderate content diversity'
      ];
    } else {
      return [
        'Natural conversation patterns',
        'Diverse content creation',
        'Consistent timezone activity',
        'Organic engagement metrics',
        'Complete profile information',
        'Human-like response variations'
      ];
    }
  }
  
  private generateRiskFactors(status: string, isBot: boolean): string[] {
    if (isBot) {
      return [
        'High spam content probability',
        'Potential for coordinated inauthentic behavior',
        'May be part of larger bot network',
        'Could spread misinformation rapidly',
        'Artificially inflates engagement metrics'
      ];
    } else if (status === 'suspicious') {
      return [
        'Possible automation tools usage',
        'Inconsistent behavioral patterns',
        'Potential for policy violations',
        'May require manual verification'
      ];
    } else {
      return [
        'Low risk of automated behavior',
        'Minimal spam indicators',
        'Legitimate user engagement'
      ];
    }
  }
  
  private generateRecommendations(status: string, isBot: boolean): string[] {
    if (isBot) {
      return [
        'Flag account for immediate review',
        'Restrict posting capabilities',
        'Monitor for network connections',
        'Consider account suspension',
        'Alert channel administrators'
      ];
    } else if (status === 'suspicious') {
      return [
        'Implement enhanced monitoring',
        'Require additional verification',
        'Limit certain functionalities temporarily',
        'Schedule periodic re-evaluation'
      ];
    } else {
      return [
        'Continue normal monitoring',
        'No immediate action required',
        'Maintain current access levels',
        'Include in trusted user metrics'
      ];
    }
  }
  
  private generateAlternativeAccounts(username: string): string[] {
    const variations = [
      username + '_bot',
      username + '2',
      username + '_official',
      'real_' + username,
      username.replace(/\d+$/, '') + (Math.floor(Math.random() * 100) + 1)
    ];
    return variations.slice(0, Math.floor(Math.random() * 3) + 1);
  }
  
  async analyzeUser(username: string): Promise<BotDetectionResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    return this.generateBotDetectionResult(username);
  }
  
  async analyzeChannel(channelUrl: string): Promise<BotDetectionResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    return this.generateBotDetectionResult(channelUrl);
  }
  
  async batchAnalyze(usernames: string[]): Promise<BotDetectionResult[]> {
    const results: BotDetectionResult[] = [];
    
    for (const username of usernames) {
      const result = await this.analyzeUser(username);
      results.push(result);
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