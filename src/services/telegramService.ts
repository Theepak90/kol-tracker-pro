import { API_BASE_URL } from '../config/api';

interface KOLInfo {
  user_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
}

interface GroupScan {
  channel_id: number;
  title: string;
  username: string | null;
  description: string | null;
  member_count: number;
  active_members: number;
  bot_count: number;
  kol_count: number;
  kol_details: KOLInfo[];
  scanned_at: string;
}

interface ChannelInfo extends GroupScan {
  previous_scans?: GroupScan[];
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

interface UserPostsResponse {
  username: string;
  posts: UserPost[];
  total_posts: number;
  total_views: number;
  total_forwards: number;
}

interface APIResponse {
  success: boolean;
  data?: ChannelInfo;
  error?: string;
}

// Telethon service URL (running on port 8000)
const TELETHON_BASE_URL = 'http://localhost:8000';

export async function scanChannel(channelUrl: string): Promise<APIResponse> {
  try {
    // Extract channel username from URL or use as is
    const channelUsername = channelUrl.includes('t.me/') 
      ? channelUrl.split('t.me/')[1]
      : channelUrl.replace('@', '');

    const response = await fetch(`${TELETHON_BASE_URL}/scan/${channelUsername}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.detail || 'Failed to scan channel',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data as ChannelInfo,
    };
  } catch (error) {
    console.error('Scan error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to scan channel',
    };
  }
}

export const telegramService = {
  async trackUserPosts(username: string): Promise<UserPostsResponse> {
    try {
      const cleanUsername = username.replace('@', '');
      const response = await fetch(`${TELETHON_BASE_URL}/track-posts/${cleanUsername}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to track user posts');
      }

      const data = await response.json();
      
      // Transform the data to match our interface
      return {
        username: data.username,
        posts: data.posts.map((post: any) => ({
          message_id: post.message_id,
          text: post.text,
          date: post.date,
          views: post.views,
          forwards: post.forwards,
          channel_id: post.channel_id,
          channel_title: post.channel_title
        })),
        total_posts: data.total_posts,
        total_views: data.total_views,
        total_forwards: data.total_forwards
      };
    } catch (error) {
      console.error('Error tracking user posts:', error);
      throw error;
    }
  },

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${TELETHON_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Telethon service health check failed:', error);
      return false;
    }
  }
};