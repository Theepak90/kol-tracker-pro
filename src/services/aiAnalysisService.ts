import { API_CONFIG } from '../config/api';
import { APIResponse } from '../types/api';

interface SentimentAnalysis {
  score: number; // -1 to 1
  magnitude: number; // 0 to +inf
  label: 'positive' | 'negative' | 'neutral';
}

interface TextClassification {
  label: string;
  confidence: number;
}

interface EntityAnalysis {
  name: string;
  type: string;
  salience: number;
  sentiment: SentimentAnalysis;
}

interface KOLPost {
  message_id: number;
  text: string;
  date: string;
  views: number | null;
  forwards: number | null;
  channel_id: number;
  channel_title: string;
}

interface PostAnalysis {
  sentiment: SentimentAnalysis;
  entities: EntityAnalysis[];
  topics: TextClassification[];
  engagement_score: number;
  influence_score: number;
  key_mentions: string[];
  risk_level: 'low' | 'medium' | 'high';
}

interface KOLAnalysisResult {
  overall_sentiment: SentimentAnalysis;
  engagement_metrics: {
    average_views: number;
    average_forwards: number;
    engagement_rate: number;
    viral_potential: number;
  };
  content_analysis: {
    primary_topics: TextClassification[];
    sentiment_trend: 'improving' | 'declining' | 'stable';
    posting_frequency: number;
    content_quality_score: number;
  };
  influence_metrics: {
    overall_influence_score: number;
    market_impact_potential: 'high' | 'medium' | 'low';
    credibility_score: number;
    expertise_areas: string[];
  };
  risk_assessment: {
    overall_risk: 'low' | 'medium' | 'high';
    risk_factors: string[];
    recommendations: string[];
  };
  key_insights: string[];
  performance_summary: string;
}

export interface AIAnalysis {
  overview: string;
  sentiment: {
    score: number; // -1 to 1
    label: 'Very Negative' | 'Negative' | 'Neutral' | 'Positive' | 'Very Positive';
    confidence: number;
  };
  engagement: {
    rate: number; // 0 to 100
    trend: 'increasing' | 'decreasing' | 'stable';
    avgViews: number;
    avgForwards: number;
  };
  influence: {
    score: number; // 0 to 100
    level: 'Low' | 'Medium' | 'High' | 'Very High';
    marketImpact: 'Minimal' | 'Moderate' | 'Significant' | 'Major';
  };
  topics: Array<{
    name: string;
    frequency: number; // 0 to 100
    sentiment: number; // -1 to 1
  }>;
  riskAssessment: {
    level: 'Low' | 'Medium' | 'High' | 'Critical';
    score: number; // 0 to 100
    factors: string[];
    recommendations: string[];
  };
  insights: string[];
}

interface UserPost {
  message_id: number;
  text: string;
  date: string;
  views: number | null;
  forwards: number | null;
  channel_id: number;
  channel_title: string;
}

export class AIAnalysisService {
  private generateDummyAnalysis(posts: UserPost[], username: string): AIAnalysis {
    // Calculate basic stats
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalForwards = posts.reduce((sum, post) => sum + (post.forwards || 0), 0);
    const avgViews = posts.length > 0 ? totalViews / posts.length : 0;
    const avgForwards = posts.length > 0 ? totalForwards / posts.length : 0;

    // Generate sentiment based on post content
    const sentimentScore = this.calculateSentimentFromPosts(posts);
    const sentimentLabel = this.getSentimentLabel(sentimentScore);

    // Generate engagement metrics
    const engagementRate = Math.min(100, (avgViews / 1000) * 10 + Math.random() * 20);
    const engagementTrend = this.determineEngagementTrend(posts);

    // Generate influence score
    const influenceScore = Math.min(100, (avgViews / 500) + (avgForwards / 50) + Math.random() * 30);
    const influenceLevel = this.getInfluenceLevel(influenceScore);
    const marketImpact = this.getMarketImpact(influenceScore);

    // Generate topics
    const topics = this.extractTopics(posts);

    // Generate risk assessment
    const riskAssessment = this.generateRiskAssessment(posts, sentimentScore, influenceScore);

    // Generate insights
    const insights = this.generateInsights(posts, sentimentScore, engagementRate, influenceScore);

    return {
      overview: `Analysis of ${posts.length} posts from @${username}. ${sentimentLabel.toLowerCase()} sentiment with ${engagementRate.toFixed(1)}% engagement rate. ${influenceLevel} influence in crypto community.`,
      sentiment: {
        score: sentimentScore,
        label: sentimentLabel,
        confidence: 0.75 + Math.random() * 0.2
      },
      engagement: {
        rate: engagementRate,
        trend: engagementTrend,
        avgViews: Math.round(avgViews),
        avgForwards: Math.round(avgForwards)
      },
      influence: {
        score: influenceScore,
        level: influenceLevel,
        marketImpact
      },
      topics,
      riskAssessment,
      insights
    };
  }

  private calculateSentimentFromPosts(posts: UserPost[]): number {
    const positiveKeywords = ['bullish', 'moon', 'pump', 'buy', 'long', 'profit', 'gains', 'rocket', '🚀', '💎', '📈'];
    const negativeKeywords = ['bearish', 'dump', 'sell', 'short', 'loss', 'crash', 'risk', 'warning', '⚠️', '📉', '💸'];
    
    let sentiment = 0;
    let totalWords = 0;

    posts.forEach(post => {
      const text = post.text.toLowerCase();
      const words = text.split(/\s+/);
      totalWords += words.length;

      positiveKeywords.forEach(keyword => {
        if (text.includes(keyword)) sentiment += 1;
      });

      negativeKeywords.forEach(keyword => {
        if (text.includes(keyword)) sentiment -= 1;
      });
    });

    // Normalize sentiment between -1 and 1
    const normalizedSentiment = totalWords > 0 ? Math.max(-1, Math.min(1, sentiment / (totalWords / 10))) : 0;
    return normalizedSentiment;
  }

  private getSentimentLabel(score: number): 'Very Negative' | 'Negative' | 'Neutral' | 'Positive' | 'Very Positive' {
    if (score <= -0.6) return 'Very Negative';
    if (score <= -0.2) return 'Negative';
    if (score <= 0.2) return 'Neutral';
    if (score <= 0.6) return 'Positive';
    return 'Very Positive';
  }

  private determineEngagementTrend(posts: UserPost[]): 'increasing' | 'decreasing' | 'stable' {
    if (posts.length < 3) return 'stable';
    
    const recent = posts.slice(0, Math.floor(posts.length / 2));
    const older = posts.slice(Math.floor(posts.length / 2));
    
    const recentAvg = recent.reduce((sum, post) => sum + (post.views || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, post) => sum + (post.views || 0), 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private getInfluenceLevel(score: number): 'Low' | 'Medium' | 'High' | 'Very High' {
    if (score >= 80) return 'Very High';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  }

  private getMarketImpact(score: number): 'Minimal' | 'Moderate' | 'Significant' | 'Major' {
    if (score >= 80) return 'Major';
    if (score >= 60) return 'Significant';
    if (score >= 40) return 'Moderate';
    return 'Minimal';
  }

  private extractTopics(posts: UserPost[]): Array<{ name: string; frequency: number; sentiment: number }> {
    const cryptoTopics = [
      { name: 'Bitcoin', keywords: ['bitcoin', 'btc', '$btc'] },
      { name: 'Ethereum', keywords: ['ethereum', 'eth', '$eth'] },
      { name: 'DeFi', keywords: ['defi', 'decentralized', 'uniswap', 'compound'] },
      { name: 'NFTs', keywords: ['nft', 'opensea', 'art', 'collectible'] },
      { name: 'Altcoins', keywords: ['altcoin', 'sol', 'ada', 'dot', 'matic'] },
      { name: 'Trading', keywords: ['trading', 'chart', 'technical', 'analysis'] },
      { name: 'Market Analysis', keywords: ['market', 'price', 'prediction', 'forecast'] },
      { name: 'Technology', keywords: ['blockchain', 'smart contract', 'layer 2', 'scaling'] }
    ];

    const allText = posts.map(post => post.text.toLowerCase()).join(' ');
    
    return cryptoTopics
      .map(topic => {
        const frequency = topic.keywords.reduce((count, keyword) => {
          const matches = (allText.match(new RegExp(keyword, 'g')) || []).length;
          return count + matches;
        }, 0);
        
        const normalizedFrequency = Math.min(100, (frequency / posts.length) * 20);
        
        // Generate sentiment for this topic
        const sentiment = (Math.random() - 0.5) * 2; // -1 to 1

      return {
          name: topic.name,
          frequency: normalizedFrequency,
          sentiment
        };
      })
      .filter(topic => topic.frequency > 0)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 6);
  }

  private generateRiskAssessment(posts: UserPost[], sentimentScore: number, influenceScore: number): {
    level: 'Low' | 'Medium' | 'High' | 'Critical';
    score: number;
    factors: string[];
    recommendations: string[];
  } {
    const riskFactors = [];
    let riskScore = 0;

    // Check for extreme sentiment
    if (Math.abs(sentimentScore) > 0.7) {
      riskFactors.push('Extreme sentiment bias detected');
      riskScore += 20;
    }

    // Check for high influence without balance
    if (influenceScore > 70 && Math.abs(sentimentScore) > 0.5) {
      riskFactors.push('High influence with strong directional bias');
      riskScore += 25;
    }

    // Check for pump/dump language
    const allText = posts.map(post => post.text.toLowerCase()).join(' ');
    if (allText.includes('moon') || allText.includes('pump') || allText.includes('dump')) {
      riskFactors.push('Potential market manipulation language');
      riskScore += 15;
    }

    // Check for frequency of posts
    if (posts.length > 20) {
      riskFactors.push('High posting frequency - potential spam');
      riskScore += 10;
    }

    // Add random factors for demo
    const randomFactors = [
      'Unverified market predictions',
      'Lack of risk disclaimers',
      'Promoting speculative investments',
      'Limited fundamental analysis'
    ];
    
    if (Math.random() > 0.5) {
      riskFactors.push(randomFactors[Math.floor(Math.random() * randomFactors.length)]);
      riskScore += Math.random() * 15;
    }

    const level = riskScore >= 70 ? 'Critical' : riskScore >= 50 ? 'High' : riskScore >= 30 ? 'Medium' : 'Low';

    const recommendations = [
      'Verify information from multiple sources',
      'Consider the KOL\'s track record and expertise',
      'Be aware of potential conflicts of interest',
      'Apply proper risk management principles',
      'Don\'t invest more than you can afford to lose'
    ];

      return {
      level,
      score: Math.min(100, riskScore),
      factors: riskFactors.length > 0 ? riskFactors : ['No significant risk factors identified'],
      recommendations: recommendations.slice(0, 3 + Math.floor(Math.random() * 3))
    };
  }

  private generateInsights(posts: UserPost[], sentimentScore: number, engagementRate: number, influenceScore: number): string[] {
    const insights = [];

    // Sentiment insights
    if (sentimentScore > 0.5) {
      insights.push('Strong bullish sentiment may indicate overconfidence in market conditions');
    } else if (sentimentScore < -0.5) {
      insights.push('Bearish sentiment could signal caution or potential buying opportunities');
    } else {
      insights.push('Balanced sentiment suggests measured approach to market analysis');
    }

    // Engagement insights
    if (engagementRate > 70) {
      insights.push('High engagement rate indicates strong community following and content relevance');
    } else if (engagementRate < 30) {
      insights.push('Lower engagement suggests content may not be resonating with audience');
    }

    // Influence insights
    if (influenceScore > 70) {
      insights.push('High influence score suggests significant market impact potential');
    }

    // Content insights
    const allText = posts.map(post => post.text.toLowerCase()).join(' ');
    if (allText.includes('technical') || allText.includes('analysis')) {
      insights.push('Focus on technical analysis indicates data-driven approach');
    }
    if (allText.includes('fundamental') || allText.includes('adoption')) {
      insights.push('Emphasis on fundamentals suggests long-term investment perspective');
    }

    // Timing insights
    insights.push('Recent posting activity shows consistent engagement with community');

    return insights.slice(0, 4); // Return top 4 insights
  }

  async analyzeKOLPosts(posts: UserPost[], username: string): Promise<AIAnalysis> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    return this.generateDummyAnalysis(posts, username);
  }
}

export const aiAnalysisService = new AIAnalysisService();
export type { KOLAnalysisResult, PostAnalysis, KOLPost };