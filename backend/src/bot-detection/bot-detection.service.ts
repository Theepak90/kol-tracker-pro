import { Injectable } from '@nestjs/common';

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

@Injectable()
export class BotDetectionService {
  processAnalysis(telethonData: any): BotDetectionResult {
    // Extract relevant data from Telethon response
    const {
      member_count = 0,
      active_members = 0,
      bot_count = 0,
      username = 'unknown',
      title = 'Unknown Channel',
      description = '',
      kol_details = [],
    } = telethonData;

    // Calculate key metrics
    const activityRatio = member_count > 0 ? (active_members / member_count) * 100 : 0;
    const botRatio = active_members > 0 ? (bot_count / active_members) * 100 : 0;
    const kolRatio = active_members > 0 ? (kol_details.length / active_members) * 100 : 0;
    
    // Enhanced bot detection algorithm - Fixed for realistic activity patterns
    let botProbability = 0;
    let confidenceFactors: string[] = [];
    let riskFactors: string[] = [];
    
    // Realistic Activity Ratio Analysis - Adjusted for Telegram group norms
    // Large groups (5000+): 0.2-1% is normal, 1-3% is good, 3%+ is excellent
    // Medium groups (1000-5000): 0.5-2% is normal, 2-5% is good, 5%+ is excellent  
    // Small groups (<1000): 2-10% is normal, 10%+ is good
    
    let expectedMinActivity = 0.1; // Base minimum
    if (member_count >= 5000) {
      expectedMinActivity = 0.2; // 0.2% minimum for very large groups
    } else if (member_count >= 1000) {
      expectedMinActivity = 0.5; // 0.5% minimum for large groups
    } else if (member_count >= 100) {
      expectedMinActivity = 2.0; // 2% minimum for medium groups
    } else {
      expectedMinActivity = 5.0; // 5% minimum for small groups
    }
    
    if (activityRatio < expectedMinActivity * 0.3) { // Less than 30% of expected minimum
      botProbability += 0.4;
      confidenceFactors.push(`Extremely low activity ratio (${activityRatio.toFixed(2)}% vs expected ${expectedMinActivity}%+)`);
      riskFactors.push('Activity significantly below normal range for group size');
    } else if (activityRatio < expectedMinActivity * 0.6) { // Less than 60% of expected minimum
      botProbability += 0.2;
      confidenceFactors.push(`Very low activity ratio (${activityRatio.toFixed(2)}%)`);
      riskFactors.push('Activity below normal range');
    } else if (activityRatio < expectedMinActivity) {
      botProbability += 0.1;
      confidenceFactors.push(`Below average activity ratio (${activityRatio.toFixed(2)}%)`);
    }
    
    // Factor 2: Bot Ratio Analysis - More realistic  
    if (botRatio > 30) {
      botProbability += 0.3; // Moderate increase for high bot concentration
      riskFactors.push('Active member pool heavily contaminated with bots');
    }
    
    // Factor 3: Description Scam Detection - MAJOR UPGRADE
    const scamKeywords = [
      'guaranteed', 'guarantee', '100% win', '98% win', '1000x gains', '100x gains',
      'free money', 'no risk', 'send $', 'elon musk', 'personally endorses',
      'expires in', 'limited time', 'exclusive offer', 'vip access',
      'admin for', 'send money', 'wire transfer', 'guaranteed profits',
      'risk free', '🚀', 'get rich quick', 'instant wealth'
    ];
    
    const urgencyKeywords = [
      'expires', 'hurry', 'limited time', '24 hours', 'act now', 'don\'t miss'
    ];
    
    const guaranteeKeywords = [
      'guaranteed', 'guarantee', '100%', 'certain', 'promise', 'assured'
    ];
    
    const hasDescription = description && description.length > 20;
    if (hasDescription) {
      const lowerDesc = description.toLowerCase();
      const scamMatches = scamKeywords.filter(keyword => lowerDesc.includes(keyword));
      const urgencyMatches = urgencyKeywords.filter(keyword => lowerDesc.includes(keyword));
      const guaranteeMatches = guaranteeKeywords.filter(keyword => lowerDesc.includes(keyword));
      
      // Major scam indicators
      if (scamMatches.length >= 3) {
        botProbability += 0.6; // MAJOR red flag
        riskFactors.push(`Multiple scam keywords detected: ${scamMatches.join(', ')}`);
        confidenceFactors.push('High concentration of scam-related language');
      } else if (scamMatches.length >= 1) {
        botProbability += 0.3;
        riskFactors.push(`Scam indicators present: ${scamMatches.join(', ')}`);
      }
      
      // Urgency tactics
      if (urgencyMatches.length >= 2) {
        botProbability += 0.3;
        riskFactors.push('Uses high-pressure urgency tactics');
      }
      
      // Unrealistic guarantees  
      if (guaranteeMatches.length >= 2) {
        botProbability += 0.4;
        riskFactors.push('Makes unrealistic financial guarantees');
      }
      
      // Payment requests in description
      if (lowerDesc.includes('send $') || lowerDesc.includes('pay $') || lowerDesc.includes('wire ')) {
        botProbability += 0.7; // MASSIVE red flag
        riskFactors.push('Requests payment/money transfer in description');
      }
    }
    
    // Factor 4: Member Count vs Description Quality Analysis
    if (member_count > 10000 && activityRatio < 0.1) {
      botProbability += 0.3;
      confidenceFactors.push('Massive community with extremely low engagement');
      riskFactors.push('Possible artificial member inflation');
    } else if (member_count > 5000 && activityRatio < 0.15) {
      botProbability += 0.2;
      confidenceFactors.push('Very large community with very low engagement');
      riskFactors.push('Potential artificial member inflation');
    }
    
    // Factor 5: Profile completeness (basic check)
    if (!hasDescription) {
      botProbability += 0.1;
      confidenceFactors.push('Incomplete or minimal profile information');
    }
    
    // Factor 6: KOL presence analysis - More lenient
    if (kol_details.length === 0 && member_count > 2000 && activityRatio < 0.2) {
      botProbability += 0.1;
      confidenceFactors.push('No identified KOLs in large community with very low activity');
      riskFactors.push('Lack of genuine influencer presence combined with low activity');
    }
    
    // Factor 7: Positive signals (reduce bot probability)
    if (hasDescription && description.length > 50) {
      botProbability -= 0.1; // Good description reduces bot probability
    }
    if (kol_details.length > 0) {
      botProbability -= 0.1; // Presence of KOLs reduces bot probability
    }
    if (activityRatio > expectedMinActivity * 2) {
      botProbability -= 0.2; // High activity reduces bot probability
    }
    
    // Ensure probability stays within bounds
    botProbability = Math.max(0, Math.min(1, botProbability));
    
    // Determine confidence and status - More conservative thresholds
    let confidence = Math.min(botProbability * 100, 100);
    let status: 'confirmed_bot' | 'suspicious' | 'human' | 'unknown';
    
    if (confidence >= 90) {
      status = 'confirmed_bot';
    } else if (confidence >= 70) {
      status = 'suspicious';
    } else if (confidence <= 30) {
      status = 'human';
    } else {
      status = 'unknown';
    }
    
    // Override for extreme cases only - Much more conservative
    if (activityRatio < 0.05 && member_count > 10000 && botRatio > 30) {
      status = 'confirmed_bot';
      confidence = 95;
      riskFactors.push('Multiple severe red flags detected');
    }
    
    return {
      username: username,
      displayName: title || username,
      isBot: status === 'confirmed_bot',
      confidence: Math.round(confidence),
      status,
      detectionDate: new Date().toISOString(),
      
      profileAnalysis: {
        hasProfilePhoto: true, // Assume true for channels
        bioLength: description.length,
        hasVerifiedBadge: false,
        accountAge: 0,
        usernamePattern: this.analyzeUsernamePattern(username),
      },
      
      activityAnalysis: {
        messageCount: 0, // Not available in current data
        avgMessagesPerDay: 0,
        lastSeenDays: 0,
        activityPattern: activityRatio < 2 ? 'suspicious' : activityRatio < 5 ? 'inactive' : 'regular',
        timeZoneConsistency: activityRatio < 2 ? 30 : 70,
        responseTimePattern: activityRatio < 2 ? 'automated' : 'human',
      },
      
      contentAnalysis: {
        spamScore: Math.max(0, 100 - activityRatio * 10),
        duplicateContentRatio: 0, // Would need message analysis
        linkSpamRatio: 0,
        languageConsistency: 80,
        sentimentVariation: activityRatio < 2 ? 20 : 50,
        topicDiversity: Math.min(activityRatio * 5, 100),
      },
      
      networkAnalysis: {
        mutualConnections: active_members,
        suspiciousConnections: bot_count,
        networkCentrality: Math.min(activityRatio * 2, 100),
        clusteringCoefficient: Math.min(activityRatio * 3, 100),
        connectionPattern: botRatio > 15 ? 'artificial' : activityRatio < 3 ? 'mixed' : 'organic',
      },
      
      aiAnalysis: {
        overview: this.generateEnhancedOverview(status, activityRatio, botRatio, member_count, active_members, description, kol_details),
        keyIndicators: confidenceFactors,
        riskFactors: riskFactors,
        recommendations: this.generateEnhancedRecommendations(status, activityRatio, botRatio, member_count, description, kol_details),
      },
      
      metrics: {
        followers: member_count,
        following: 0,
        posts: 0,
        engagement: activityRatio,
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

  private calculateLinkSpamRatio(messages: any[]): number {
    const linkPattern = /(https?:\/\/[^\s]+)|(t\.me\/[^\s]+)/g;
    const messagesWithLinks = messages.filter((m: any) => m.text && m.text.match(linkPattern));
    return (messagesWithLinks.length / (messages.length || 1)) * 100;
  }

  private calculateTopicDiversity(messages: any[]): number {
    // Simple implementation - could be enhanced with NLP
    const uniqueWords = new Set(
      messages.flatMap((m: any) => 
        m.text ? m.text.toLowerCase()
          .split(/\s+/)
          .filter((w: string) => w.length > 3) : []
      )
    ).size;
    
    return Math.min((uniqueWords / (messages.length || 1)) * 100, 100);
  }

  private generateOverview(status: string, factors: string[]): string {
    switch (status) {
      case 'confirmed_bot':
        return `Analysis strongly indicates automated behavior based on ${factors.join(', ')}. High confidence in bot classification.`;
      case 'suspicious':
        return `Account shows some suspicious patterns including ${factors.join(', ')}. Further monitoring recommended.`;
      case 'human':
        return 'Analysis suggests natural human behavior with normal activity patterns and content diversity.';
      default:
        return 'Insufficient data for conclusive analysis. Additional monitoring required.';
    }
  }

  private generateRiskFactors(status: string, probability: number): string[] {
    const factors = [];
    
    if (status === 'confirmed_bot' || status === 'suspicious') {
      factors.push('Potential automated behavior detected');
      factors.push('May be part of coordinated activity');
      if (probability > 0.8) {
        factors.push('High risk of spam or manipulation');
      }
    }
    
    return factors;
  }

  private generateRecommendations(status: string): string[] {
    switch (status) {
      case 'confirmed_bot':
        return [
          'Monitor for coordinated behavior',
          'Consider restricting account access',
          'Flag for manual review',
        ];
      case 'suspicious':
        return [
          'Implement enhanced monitoring',
          'Review recent activity patterns',
          'Check for network connections',
        ];
      case 'human':
        return [
          'Continue normal monitoring',
          'No immediate action required',
        ];
      default:
        return [
          'Gather additional activity data',
          'Monitor for pattern emergence',
        ];
    }
  }

  private generateEnhancedOverview(status: string, activityRatio: number, botRatio: number, memberCount: number, activeMembers: number, description: string, kol_details: any[]): string {
    // Calculate expected activity for realistic comparison
    let expectedMinActivity = 0.1;
    if (memberCount >= 5000) {
      expectedMinActivity = 0.2;
    } else if (memberCount >= 1000) {
      expectedMinActivity = 0.5;
    } else if (memberCount >= 100) {
      expectedMinActivity = 2.0;
    } else {
      expectedMinActivity = 5.0;
    }

    const factors = [];
    
    // Activity analysis with realistic thresholds
    if (activityRatio < expectedMinActivity * 0.3) {
      factors.push(`Extremely low activity ratio (${activityRatio.toFixed(2)}% vs expected ${expectedMinActivity}%+)`);
    } else if (activityRatio < expectedMinActivity * 0.6) {
      factors.push(`Very low activity ratio (${activityRatio.toFixed(2)}%)`);
    } else if (activityRatio < expectedMinActivity) {
      factors.push(`Below average activity ratio (${activityRatio.toFixed(2)}%)`);
    } else if (activityRatio >= expectedMinActivity * 2) {
      factors.push(`Good activity ratio (${activityRatio.toFixed(2)}%)`);
    }
    
    // Bot concentration analysis
    if (botRatio > 30) {
      factors.push('Very high bot concentration in active members');
    } else if (botRatio > 20) {
      factors.push('High bot concentration in active members');
    } else if (botRatio > 10) {
      factors.push('Moderate bot presence in active members');
    } else if (botRatio <= 5) {
      factors.push('Low bot presence in active members');
    }
    
    // Scale analysis with realistic thresholds
    if (memberCount > 10000 && activityRatio < 0.1) {
      factors.push('Massive community with extremely low engagement');
    } else if (memberCount > 5000 && activityRatio < 0.15) {
      factors.push('Very large community with very low engagement');
    }
    
    // Profile completeness
    if (!description || description.length < 20) {
      factors.push('Incomplete or minimal profile information');
    } else if (description.length > 50) {
      factors.push('Well-documented community profile');
    }
    
    // KOL presence
    if (kol_details.length === 0 && memberCount > 2000 && activityRatio < 0.2) {
      factors.push('No identified KOLs in large community with very low activity');
    } else if (kol_details.length > 0) {
      factors.push(`${kol_details.length} KOL(s) identified`);
    }

    // Generate appropriate overview based on status
    switch (status) {
      case 'confirmed_bot':
        return `Analysis indicates likely artificial behavior. Key concerns: ${factors.filter(f => f.includes('Extremely') || f.includes('Very high') || f.includes('Massive')).join(', ')}. Manual review strongly recommended.`;
      case 'suspicious':
        return `Some concerning patterns detected: ${factors.filter(f => f.includes('Very low') || f.includes('High') || f.includes('large community')).join(', ')}. Further monitoring recommended.`;
      case 'human':
        const positiveFactors = factors.filter(f => f.includes('Good') || f.includes('Low bot') || f.includes('Well-documented') || f.includes('KOL'));
        return positiveFactors.length > 0 
          ? `Analysis suggests legitimate community. Positive indicators: ${positiveFactors.join(', ')}.`
          : 'Analysis suggests normal community behavior with standard activity patterns.';
      default:
        return `Mixed signals detected: ${factors.slice(0, 3).join(', ')}. Additional data needed for conclusive analysis.`;
    }
  }

  private generateEnhancedRecommendations(status: string, activityRatio: number, botRatio: number, memberCount: number, description: string, kol_details: any[]): string[] {
    const recommendations = [];
    if (activityRatio < 2.0) {
      recommendations.push('Monitor for coordinated behavior');
      recommendations.push('Consider restricting account access');
      recommendations.push('Flag for manual review');
    } else if (activityRatio < 5.0) {
      recommendations.push('Implement enhanced monitoring');
      recommendations.push('Review recent activity patterns');
      recommendations.push('Check for network connections');
    } else if (activityRatio < 10.0) {
      recommendations.push('Continue normal monitoring');
      recommendations.push('No immediate action required');
    }
    if (botRatio > 20) {
      recommendations.push('Monitor for coordinated behavior');
      recommendations.push('Consider restricting account access');
      recommendations.push('Flag for manual review');
    } else if (botRatio > 10) {
      recommendations.push('Implement enhanced monitoring');
      recommendations.push('Review recent activity patterns');
      recommendations.push('Check for network connections');
    }
    if (memberCount > 1000 && activityRatio < 3.0) {
      recommendations.push('Monitor for coordinated behavior');
      recommendations.push('Consider restricting account access');
      recommendations.push('Flag for manual review');
    }
    if (!description || description.length < 20) {
      recommendations.push('Gather additional profile data');
    }
    if (kol_details.length === 0 && memberCount > 500) {
      recommendations.push('Identify genuine influencer presence');
    }

    return recommendations;
  }
} 