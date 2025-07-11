import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { API_CONFIG } from '../config/api';
import { APIResponse } from '../types/api';

interface SentimentAnalysis {
  label: 'positive' | 'negative' | 'neutral';
  score: number;
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

interface PerformanceMetric {
  name: string;
  value: string;
}

interface PerformanceSummary {
  growth_rate: number;
  consistency_score: number;
  trend: 'upward' | 'stable' | 'downward';
  key_metrics: PerformanceMetric[];
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
  performance_summary: PerformanceSummary;
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

class AIAnalysisService {
  private readonly baseUrl: string;
  private readonly maxRetries: number = 2;
  private readonly retryDelay: number = 1000;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api`;
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && axios.isAxiosError(error)) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  async analyzeKOL(username: string, posts: KOLPost[]): Promise<KOLAnalysisResult> {
    try {
      const response = await this.retryRequest(() =>
        axios.post(`${this.baseUrl}/kols/${encodeURIComponent(username)}/analyze`, {
          posts,
          analysisType: 'comprehensive'
        })
      );

      return this.validateAndTransformAnalysis(response.data);
    } catch (error) {
      console.error('KOL analysis failed:', error);
      throw new Error('Failed to analyze KOL data. Please try again later.');
    }
  }

  private validateAndTransformAnalysis(data: any): KOLAnalysisResult {
    // Ensure all required fields are present with fallback values
    return {
      overall_sentiment: {
        label: data.overall_sentiment?.label || 'neutral',
        score: data.overall_sentiment?.score || 0
      },
      engagement_metrics: {
        average_views: data.engagement_metrics?.average_views || 0,
        average_forwards: data.engagement_metrics?.average_forwards || 0,
        engagement_rate: data.engagement_metrics?.engagement_rate || 0,
        viral_potential: data.engagement_metrics?.viral_potential || 0
      },
      content_analysis: {
        primary_topics: Array.isArray(data.content_analysis?.primary_topics) 
          ? data.content_analysis.primary_topics.map((topic: any) => ({
              label: topic.label || 'Unknown',
              confidence: topic.confidence || 0
            }))
          : [],
        sentiment_trend: data.content_analysis?.sentiment_trend || 'stable',
        posting_frequency: data.content_analysis?.posting_frequency || 0,
        content_quality_score: data.content_analysis?.content_quality_score || 0
      },
      influence_metrics: {
        overall_influence_score: data.influence_metrics?.overall_influence_score || 0,
        market_impact_potential: data.influence_metrics?.market_impact_potential || 'medium',
        credibility_score: data.influence_metrics?.credibility_score || 0,
        expertise_areas: Array.isArray(data.influence_metrics?.expertise_areas)
          ? data.influence_metrics.expertise_areas
          : []
      },
      risk_assessment: {
        overall_risk: data.risk_assessment?.overall_risk || 'medium',
        risk_factors: Array.isArray(data.risk_assessment?.risk_factors)
          ? data.risk_assessment.risk_factors
          : [],
        recommendations: Array.isArray(data.risk_assessment?.recommendations)
          ? data.risk_assessment.recommendations
          : []
      },
      key_insights: Array.isArray(data.key_insights) ? data.key_insights : [],
      performance_summary: {
        growth_rate: data.performance_summary?.growth_rate || 0,
        consistency_score: data.performance_summary?.consistency_score || 0,
        trend: data.performance_summary?.trend || 'stable',
        key_metrics: Array.isArray(data.performance_summary?.key_metrics)
          ? data.performance_summary.key_metrics.map((metric: any) => ({
              name: metric.name || 'Unknown',
              value: metric.value || '0'
            }))
          : []
      }
    };
  }

  // Helper method to calculate engagement metrics
  private calculateEngagementMetrics(posts: KOLPost[]) {
    if (!posts.length) return null;

    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0);
    const totalForwards = posts.reduce((sum, post) => sum + (post.forwards || 0), 0);

      return {
      average_views: totalViews / posts.length,
      average_forwards: totalForwards / posts.length,
      engagement_rate: (totalForwards / totalViews) * 100 || 0,
      viral_potential: Math.min(totalForwards / posts.length / 100, 1) * 100
    };
  }
}

export const aiAnalysisService = new AIAnalysisService();
export type { KOLAnalysisResult, KOLPost };