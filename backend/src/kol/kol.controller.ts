import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { KOLService } from './kol.service';
import { KOLDocument } from '../schemas/kol.schema';
import axios from 'axios';

interface Post {
  text: string;
  views: number;
  forwards: number;
  date: string;
}

@Controller('kols')
export class KOLController {
  constructor(private readonly kolService: KOLService) {}

  @Post()
  async create(@Body() kolData: {
    displayName: string;
    telegramUsername: string;
    description?: string;
    tags?: string[];
  }): Promise<KOLDocument> {
    return this.kolService.create(kolData);
  }

  @Get()
  async findAll(): Promise<KOLDocument[]> {
    return this.kolService.findAll();
  }

  @Get(':username')
  async findOne(@Param('username') username: string): Promise<KOLDocument> {
    const kol = await this.kolService.findByUsername(username);
    if (!kol) {
      throw new NotFoundException(`KOL with username ${username} not found`);
    }
    return kol;
  }

  @Delete(':username')
  async remove(@Param('username') username: string): Promise<{ message: string }> {
    const deleted = await this.kolService.remove(username);
    if (!deleted) {
      throw new NotFoundException(`KOL with username ${username} not found`);
    }
    return { message: 'KOL deleted successfully' };
  }

  @Get('track-posts/:username')
  async trackPosts(@Param('username') username: string) {
    try {
      const response = await axios.get(`http://localhost:8000/track-posts/${username}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.detail || 'Failed to track user posts',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      throw new HttpException('Failed to track user posts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('search/:query')
  async searchKOLs(@Param('query') query: string): Promise<KOLDocument[]> {
    if (!query || query.trim().length === 0) {
      throw new HttpException('Search query cannot be empty', HttpStatus.BAD_REQUEST);
    }
    return this.kolService.searchKOLs(query);
  }

  @Get('top/:limit')
  async getTopKOLs(@Param('limit') limit: string): Promise<KOLDocument[]> {
    const limitNum = parseInt(limit) || 10;
    if (limitNum < 1 || limitNum > 100) {
      throw new HttpException('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST);
    }
    return this.kolService.getTopKOLsByViews(limitNum);
  }

  @Post('tags')
  async getKOLsByTags(@Body() body: { tags: string[] }): Promise<KOLDocument[]> {
    const { tags } = body;
    if (!Array.isArray(tags) || tags.length === 0) {
      throw new HttpException('Tags array is required and cannot be empty', HttpStatus.BAD_REQUEST);
    }
    return this.kolService.getKOLsByTags(tags);
  }

  @Put(':username/stats')
  async updateStats(
    @Param('username') username: string,
    @Body() stats: {
      totalPosts: number;
      totalViews: number;
      totalForwards: number;
    }
  ): Promise<KOLDocument> {
    const updatedKOL = await this.kolService.updateStats(username, stats);
    if (!updatedKOL) {
      throw new NotFoundException(`KOL with username ${username} not found`);
    }
    return updatedKOL;
  }

  private analyzeSentiment(text: string): { score: number; label: string } {
    // Simple sentiment analysis based on keyword matching
    const positiveWords = ['bullish', 'growth', 'profit', 'success', 'gain', 'up', 'high', 'good', 'great', 'excellent'];
    const negativeWords = ['bearish', 'loss', 'down', 'low', 'bad', 'poor', 'fail', 'risk', 'crash', 'dump'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    const normalizedScore = Math.tanh(score / 5); // Convert to range [-1, 1]
    return {
      score: normalizedScore,
      label: normalizedScore > 0.3 ? 'positive' : normalizedScore < -0.3 ? 'negative' : 'neutral'
    };
  }

  private analyzeTopics(posts: Post[]): { label: string; confidence: number }[] {
    const topics = new Map<string, { count: number; keywords: string[] }>();
    
    const topicKeywords = {
      'Crypto': ['bitcoin', 'eth', 'blockchain', 'crypto', 'token', 'defi', 'nft'],
      'Trading': ['trade', 'position', 'long', 'short', 'buy', 'sell', 'market', 'price'],
      'Technology': ['tech', 'platform', 'protocol', 'network', 'system', 'development'],
      'Investment': ['invest', 'portfolio', 'risk', 'return', 'fund', 'asset', 'allocation'],
      'Market Analysis': ['analysis', 'trend', 'pattern', 'indicator', 'chart', 'volume', 'momentum']
    };

    posts.forEach(post => {
      const words = post.text.toLowerCase().split(/\s+/);
      
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        const matchCount = words.filter(word => keywords.includes(word)).length;
        if (matchCount > 0) {
          const existing = topics.get(topic) || { count: 0, keywords: [] };
          existing.count += matchCount;
          topics.set(topic, existing);
        }
      });
    });

    return Array.from(topics.entries())
      .map(([topic, data]) => ({
        label: topic,
        confidence: Math.min(data.count / posts.length, 1)
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  private calculateEngagementTrends(posts: Post[]): { trend: 'improving' | 'declining' | 'stable'; change: number } {
    if (posts.length < 2) {
      return { trend: 'stable', change: 0 };
    }

    const recentPosts = posts.slice(0, Math.ceil(posts.length / 2));
    const olderPosts = posts.slice(Math.ceil(posts.length / 2));

    const recentEngagement = recentPosts.reduce((sum, post) => sum + (post.forwards / Math.max(post.views, 1)), 0) / recentPosts.length;
    const olderEngagement = olderPosts.reduce((sum, post) => sum + (post.forwards / Math.max(post.views, 1)), 0) / olderPosts.length;

    const change = ((recentEngagement - olderEngagement) / Math.max(olderEngagement, 0.001)) * 100;

    return {
      trend: change > 10 ? 'improving' : change < -10 ? 'declining' : 'stable',
      change: Math.round(change * 100) / 100
    };
  }

  private assessRisk(posts: Post[], engagement: any, trends: any): any {
    const riskFactors = [];
    let riskScore = 0;

    // Low engagement risk
    if (engagement.average_views < 100) {
      riskFactors.push('Very low audience reach');
      riskScore += 20;
    }

    // Declining trends
    if (trends.trend === 'declining') {
      riskFactors.push('Declining engagement trend');
      riskScore += 15;
    }

    // Spam indicators
    const avgTextLength = posts.reduce((sum, post) => sum + post.text.length, 0) / posts.length;
    if (avgTextLength < 50) {
      riskFactors.push('Very short post content');
      riskScore += 10;
    }

    // Irregular posting
    const dates = posts.map(post => new Date(post.date).getTime());
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      intervals.push(dates[i-1] - dates[i]);
    }
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    
    if (variance > avgInterval * 2) {
      riskFactors.push('Irregular posting pattern');
      riskScore += 5;
    }

    return {
      overall_risk: riskScore > 30 ? 'high' : riskScore > 15 ? 'medium' : 'low',
      risk_factors: riskFactors,
      recommendations: this.generateRecommendations(riskScore, riskFactors)
    };
  }

  private generateRecommendations(riskScore: number, riskFactors: string[]): string[] {
    const recommendations = [];

    if (riskFactors.includes('Very low audience reach')) {
      recommendations.push('Monitor audience growth trends before making investment decisions');
    }
    
    if (riskFactors.includes('Declining engagement trend')) {
      recommendations.push('Wait for engagement recovery before following calls');
    }
    
    if (riskFactors.includes('Very short post content')) {
      recommendations.push('Look for more detailed analysis and reasoning in posts');
    }
    
    if (riskFactors.includes('Irregular posting pattern')) {
      recommendations.push('Consider consistency when evaluating reliability');
    }

    if (riskScore < 15) {
      recommendations.push('Generally reliable for following investment insights');
    }

    return recommendations;
  }

  @Post(':username/analyze')
  async analyzeKOL(
    @Param('username') username: string,
    @Body() data: { posts: Post[], analysisType: string }
  ) {
    try {
      const posts = data.posts;
      const kol = await this.kolService.findByUsername(username);

      if (!kol) {
        throw new NotFoundException(`KOL with username ${username} not found`);
      }

      // Calculate engagement metrics
      const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
      const totalForwards = posts.reduce((sum, post) => sum + (post.forwards || 0), 0);
      const avgViews = totalViews / posts.length;
      const avgForwards = totalForwards / posts.length;
      const engagementRate = (totalForwards / totalViews) * 100 || 0;

      // Analyze sentiment for each post
      const sentiments = posts.map(post => this.analyzeSentiment(post.text));
      const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;

      // Analyze engagement trends
      const trends = this.calculateEngagementTrends(posts);

      // Analyze topics
      const topics = this.analyzeTopics(posts);

      // Calculate content quality score based on engagement and sentiment
      const contentQualityScore = (
        (engagementRate / 100) * 0.4 +
        ((avgSentiment + 1) / 2) * 0.3 +
        Math.min(avgViews / 10000, 1) * 0.3
      );

      // Assess risks
      const riskAssessment = this.assessRisk(posts, { average_views: avgViews }, { trend: trends.trend });

      return {
        overall_sentiment: {
          label: avgSentiment > 0.3 ? 'positive' : avgSentiment < -0.3 ? 'negative' : 'neutral',
          score: (avgSentiment + 1) / 2 // Convert from [-1,1] to [0,1]
        },
        engagement_metrics: {
          average_views: avgViews,
          average_forwards: avgForwards,
          engagement_rate: engagementRate,
          viral_potential: Math.min(avgForwards / avgViews * 100, 100)
        },
        content_analysis: {
          primary_topics: topics,
          sentiment_trend: trends.trend,
          posting_frequency: posts.length / (
            (new Date(Math.max(...posts.map(p => new Date(p.date).getTime()))).getTime() -
             new Date(Math.min(...posts.map(p => new Date(p.date).getTime()))).getTime()
            ) / (1000 * 60 * 60 * 24) || 1
          ),
          content_quality_score: contentQualityScore
        },
        influence_metrics: {
          overall_influence_score: Math.min(
            (engagementRate * 0.4 + contentQualityScore * 0.3 + (avgViews / 10000) * 0.3) * 100,
            100
          ),
          market_impact_potential: engagementRate > 15 ? 'high' : engagementRate > 5 ? 'medium' : 'low',
          credibility_score: contentQualityScore * 100,
          expertise_areas: topics.slice(0, 3).map(t => t.label)
        },
        risk_assessment: riskAssessment,
        key_insights: [
          `${trends.trend === 'improving' ? 'Growing' : trends.trend === 'declining' ? 'Declining' : 'Stable'} engagement trend`,
          `Strong focus on ${topics[0]?.label.toLowerCase() || 'various topics'}`,
          `${riskAssessment.overall_risk === 'low' ? 'Low-risk' : riskAssessment.overall_risk === 'medium' ? 'Moderate-risk' : 'High-risk'} profile`
        ],
        performance_summary: {
          strengths: this.identifyStrengths(engagementRate, contentQualityScore, trends),
          weaknesses: this.identifyWeaknesses(engagementRate, contentQualityScore, riskAssessment),
          overall_rating: this.calculateOverallRating(engagementRate, contentQualityScore, riskAssessment.overall_risk)
        }
      };
      
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException('Failed to analyze KOL', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private identifyStrengths(engagementRate: number, contentQuality: number, trends: any): string[] {
    const strengths = [];
    
    if (engagementRate > 10) strengths.push('High engagement rate');
    if (contentQuality > 0.7) strengths.push('High-quality content');
    if (trends.trend === 'improving') strengths.push('Growing influence');
    
    return strengths.length > 0 ? strengths : ['Consistent posting activity'];
  }

  private identifyWeaknesses(engagementRate: number, contentQuality: number, riskAssessment: any): string[] {
    const weaknesses = [];
    
    if (engagementRate < 2) weaknesses.push('Low engagement rate');
    if (contentQuality < 0.3) weaknesses.push('Content quality needs improvement');
    if (riskAssessment.overall_risk === 'high') weaknesses.push('High risk profile');
    
    return weaknesses;
  }

  private calculateOverallRating(engagementRate: number, contentQuality: number, riskLevel: string): string {
    const score = (engagementRate / 20) * 0.4 + contentQuality * 0.4 + (riskLevel === 'low' ? 0.2 : riskLevel === 'medium' ? 0.1 : 0);
    
    if (score > 0.8) return 'excellent';
    if (score > 0.6) return 'good';
    if (score > 0.4) return 'average';
    return 'below_average';
  }

  @Put(':username')
  async update(
    @Param('username') username: string,
    @Body() updateData: any
  ): Promise<KOLDocument> {
    const updatedKOL = await this.kolService.update(username, updateData);
    if (!updatedKOL) {
      throw new NotFoundException(`KOL with username ${username} not found`);
    }
    return updatedKOL;
  }
} 