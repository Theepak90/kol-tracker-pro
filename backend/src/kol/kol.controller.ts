import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { KOLService } from './kol.service';
import { KOL } from '../schemas/kol.schema';
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
  }): Promise<KOL> {
    return this.kolService.create(kolData);
  }

  @Get()
  async findAll(): Promise<KOL[]> {
    return this.kolService.findAll();
  }

  @Get(':username')
  async findOne(@Param('username') username: string): Promise<KOL> {
    return this.kolService.findByUsername(username);
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
      const text = post.text.toLowerCase();
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        const matchCount = keywords.filter(keyword => text.includes(keyword)).length;
        if (matchCount > 0) {
          const existing = topics.get(topic) || { count: 0, keywords: [] };
          topics.set(topic, {
            count: existing.count + matchCount,
            keywords: [...new Set([...existing.keywords, ...keywords.filter(k => text.includes(k))])]
          });
        }
      });
    });

    const totalMatches = Array.from(topics.values()).reduce((sum, { count }) => sum + count, 0);
    
    return Array.from(topics.entries())
      .map(([label, { count, keywords }]) => ({
        label,
        confidence: count / (totalMatches || 1)
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  private calculateEngagementTrends(posts: Post[]) {
    const sortedPosts = [...posts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const periods = Math.min(4, Math.floor(posts.length / 5));
    const chunks = Array.from({ length: periods }, (_, i) => {
      const start = Math.floor((i * posts.length) / periods);
      const end = Math.floor(((i + 1) * posts.length) / periods);
      return sortedPosts.slice(start, end);
    });

    const trends = chunks.map(chunk => {
      const avgViews = chunk.reduce((sum, post) => sum + (post.views || 0), 0) / chunk.length;
      const avgForwards = chunk.reduce((sum, post) => sum + (post.forwards || 0), 0) / chunk.length;
      return { avgViews, avgForwards };
    });

    const viewsTrend = trends[trends.length - 1].avgViews / (trends[0].avgViews || 1);
    const forwardsTrend = trends[trends.length - 1].avgForwards / (trends[0].avgForwards || 1);
    
    return {
      trend: viewsTrend > 1.1 && forwardsTrend > 1.1 ? 'improving' :
             viewsTrend < 0.9 && forwardsTrend < 0.9 ? 'declining' : 'stable',
      growth_rate: ((viewsTrend + forwardsTrend) / 2 - 1) * 100
    };
  }

  private assessRisk(posts: Post[], engagementMetrics: any, sentimentAnalysis: any) {
    const riskFactors = [];
    const recommendations = [];
    let riskScore = 0;

    // Check engagement volatility
    const views = posts.map(p => p.views || 0);
    const viewsStdDev = Math.sqrt(
      views.reduce((sum, v) => sum + Math.pow(v - engagementMetrics.average_views, 2), 0) / views.length
    );
    const volatility = viewsStdDev / engagementMetrics.average_views;

    if (volatility > 1) {
      riskFactors.push('High volatility in engagement rates');
      recommendations.push('Monitor engagement stability');
      riskScore += 0.3;
    }

    // Check sentiment stability
    if (sentimentAnalysis.trend === 'declining') {
      riskFactors.push('Declining sentiment trend');
      recommendations.push('Analyze causes of sentiment decline');
      riskScore += 0.3;
    }

    // Check posting patterns
    const timeBetweenPosts = posts
      .map(p => new Date(p.date).getTime())
      .sort((a, b) => b - a)
      .reduce((acc, time, i, arr) => {
        if (i === 0) return acc;
        return [...acc, time - arr[i - 1]];
      }, []);

    const avgTimeBetweenPosts = timeBetweenPosts.reduce((a, b) => a + b, 0) / timeBetweenPosts.length;
    const timeStdDev = Math.sqrt(
      timeBetweenPosts.reduce((sum, t) => sum + Math.pow(t - avgTimeBetweenPosts, 2), 0) / timeBetweenPosts.length
    );

    if (timeStdDev / avgTimeBetweenPosts > 0.5) {
      riskFactors.push('Irregular posting pattern');
      recommendations.push('Maintain consistent posting schedule');
      riskScore += 0.2;
    }

    return {
      overall_risk: riskScore > 0.6 ? 'high' : riskScore > 0.3 ? 'medium' : 'low',
      risk_factors: riskFactors,
      recommendations: recommendations
    };
  }

  @Post(':username/analyze')
  async analyzeKOL(
    @Param('username') username: string,
    @Body() data: { posts: Post[], analysisType: string }
  ) {
    try {
      const posts = data.posts;
      const kol = await this.kolService.findByUsername(username);

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
          growth_rate: trends.growth_rate,
          consistency_score: (1 - (riskAssessment.risk_factors.length / 5)) * 100,
          trend: trends.trend === 'improving' ? 'upward' : trends.trend === 'declining' ? 'downward' : 'stable',
          key_metrics: [
            { name: 'Engagement Growth', value: `${trends.growth_rate.toFixed(1)}%` },
            { name: 'Content Quality', value: `${(contentQualityScore * 100).toFixed(1)}%` },
            { name: 'Risk Level', value: riskAssessment.overall_risk.toUpperCase() }
          ]
        }
      };
    } catch (error) {
      console.error('Analysis error:', error);
      throw new HttpException(
        'Failed to analyze KOL data',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':username')
  async update(
    @Param('username') username: string,
    @Body() updateData: Partial<KOL>
  ): Promise<KOL> {
    return this.kolService.update(username, updateData);
  }

  @Delete(':username')
  async delete(@Param('username') username: string): Promise<boolean> {
    return this.kolService.delete(username);
  }
} 