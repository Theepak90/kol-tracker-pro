import logging
import re
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from dataclasses import dataclass
import asyncio

logger = logging.getLogger(__name__)

@dataclass
class KOLCriteria:
    """Criteria for identifying genuine KOLs"""
    min_followers: int = 1000  # Minimum subscriber/follower count
    min_engagement_rate: float = 2.0  # Minimum engagement rate %
    min_posts_per_week: float = 3.0  # Minimum posting frequency
    min_average_views: int = 500  # Minimum average views per post
    min_forward_ratio: float = 0.05  # Minimum forward/view ratio
    max_bot_probability: float = 0.3  # Maximum bot probability (30%)
    min_account_age_days: int = 90  # Minimum account age in days
    quality_content_threshold: float = 0.6  # Content quality score threshold

@dataclass
class KOLMetrics:
    """Metrics calculated for potential KOL"""
    user_id: int
    username: Optional[str]
    first_name: str
    last_name: Optional[str]
    is_admin: bool
    is_verified: bool
    follower_count: int
    recent_posts: List[Dict]
    engagement_rate: float
    avg_views: float
    avg_forwards: float
    forward_ratio: float
    posting_frequency: float
    content_quality_score: float
    bot_probability: float
    account_age_days: int
    influence_score: float
    qualifies_as_kol: bool
    specialty_tags: List[str]

class AdvancedKOLDetector:
    """Advanced KOL detection system with sophisticated filtering"""
    
    def __init__(self, criteria: KOLCriteria = None):
        self.criteria = criteria or KOLCriteria()
        
    async def analyze_potential_kols(self, client, channel, participants: List[Any]) -> List[KOLMetrics]:
        """Analyze a list of participants to identify genuine KOLs"""
        kol_candidates = []
        
        logger.info(f"Analyzing {len(participants)} participants for KOL potential")
        
        for participant in participants:
            try:
                metrics = await self._analyze_single_user(client, channel, participant)
                if metrics and metrics.qualifies_as_kol:
                    kol_candidates.append(metrics)
                    logger.info(f"Found KOL candidate: {metrics.username or metrics.first_name} (Score: {metrics.influence_score:.2f})")
                
            except Exception as e:
                logger.warning(f"Error analyzing participant {getattr(participant, 'user_id', 'unknown')}: {e}")
                continue
        
        # Sort by influence score (highest first)
        kol_candidates.sort(key=lambda x: x.influence_score, reverse=True)
        
        logger.info(f"Identified {len(kol_candidates)} genuine KOLs from {len(participants)} participants")
        return kol_candidates
    
    async def _analyze_single_user(self, client, channel, participant) -> Optional[KOLMetrics]:
        """Analyze a single user for KOL potential"""
        try:
            user_id = getattr(participant, 'user_id', None)
            if not user_id:
                return None
                
            # Get user entity
            user = await client.get_entity(user_id)
            
            # Skip bots (unless they're sophisticated bots that act as KOLs)
            if getattr(user, 'bot', False):
                # Only consider verified bots or bots with high engagement
                if not getattr(user, 'verified', False):
                    return None
            
            # Get user's recent messages in this channel
            recent_posts = await self._get_user_recent_posts(client, channel, user_id)
            
            # Calculate all metrics
            metrics = await self._calculate_user_metrics(user, participant, recent_posts)
            
            # Determine if user qualifies as KOL
            metrics.qualifies_as_kol = self._evaluate_kol_criteria(metrics)
            
            return metrics
            
        except Exception as e:
            logger.warning(f"Error analyzing user {user_id}: {e}")
            return None
    
    async def _get_user_recent_posts(self, client, channel, user_id: int, limit: int = 50) -> List[Dict]:
        """Get recent posts by user in the channel"""
        try:
            # Get recent messages from the channel
            messages = await client.get_messages(channel, limit=200)  # Get more to find user's posts
            
            user_posts = []
            for msg in messages:
                if msg.from_id and hasattr(msg.from_id, 'user_id') and msg.from_id.user_id == user_id:
                    if msg.message:  # Only count messages with content
                        post_data = {
                            'id': msg.id,
                            'date': msg.date,
                            'text': msg.message,
                            'views': getattr(msg, 'views', 0),
                            'forwards': getattr(msg, 'forwards', 0),
                            'replies': getattr(msg, 'replies', {}).get('replies', 0) if hasattr(msg, 'replies') else 0,
                            'reactions': len(getattr(msg, 'reactions', {}).get('results', [])) if hasattr(msg, 'reactions') else 0,
                            'length': len(msg.message)
                        }
                        user_posts.append(post_data)
                
                if len(user_posts) >= limit:
                    break
                    
            return user_posts[:limit]
            
        except Exception as e:
            logger.warning(f"Error getting posts for user {user_id}: {e}")
            return []
    
    async def _calculate_user_metrics(self, user, participant, recent_posts: List[Dict]) -> KOLMetrics:
        """Calculate comprehensive metrics for a user"""
        
        # Basic user info
        user_id = user.id
        username = getattr(user, 'username', None)
        first_name = getattr(user, 'first_name', '')
        last_name = getattr(user, 'last_name', None)
        is_admin = getattr(participant, 'admin_rights', None) is not None
        is_verified = getattr(user, 'verified', False)
        
        # Follower count (approximate based on user type)
        follower_count = 0
        if hasattr(user, 'participants_count'):
            follower_count = user.participants_count
        elif is_verified:
            follower_count = 5000  # Assume verified users have decent following
        elif username:
            follower_count = 1000  # Users with username likely have some following
        
        # Calculate posting metrics
        if not recent_posts:
            # If no posts, this user is likely not a KOL
            return KOLMetrics(
                user_id=user_id,
                username=username,
                first_name=first_name,
                last_name=last_name,
                is_admin=is_admin,
                is_verified=is_verified,
                follower_count=follower_count,
                recent_posts=recent_posts,
                engagement_rate=0.0,
                avg_views=0.0,
                avg_forwards=0.0,
                forward_ratio=0.0,
                posting_frequency=0.0,
                content_quality_score=0.0,
                bot_probability=0.8,  # High bot probability if no posts
                account_age_days=0,
                influence_score=0.0,
                qualifies_as_kol=False,
                specialty_tags=[]
            )
        
        # Calculate engagement metrics
        total_views = sum(post['views'] for post in recent_posts)
        total_forwards = sum(post['forwards'] for post in recent_posts)
        total_reactions = sum(post['reactions'] for post in recent_posts)
        total_replies = sum(post['replies'] for post in recent_posts)
        
        avg_views = total_views / len(recent_posts) if recent_posts else 0
        avg_forwards = total_forwards / len(recent_posts) if recent_posts else 0
        forward_ratio = total_forwards / max(total_views, 1)
        
        # Calculate engagement rate (forwards + reactions + replies) / views
        total_engagement = total_forwards + total_reactions + total_replies
        engagement_rate = (total_engagement / max(total_views, 1)) * 100
        
        # Calculate posting frequency (posts per week)
        if len(recent_posts) >= 2:
            time_span = recent_posts[0]['date'] - recent_posts[-1]['date']
            days_span = max(time_span.days, 1)
            posting_frequency = (len(recent_posts) / days_span) * 7
        else:
            posting_frequency = 0.0
            
        # Calculate content quality score
        content_quality_score = self._calculate_content_quality(recent_posts)
        
        # Calculate bot probability
        bot_probability = self._calculate_bot_probability(user, recent_posts)
        
        # Estimate account age (simplified)
        account_age_days = 365  # Default assumption
        if hasattr(user, 'date') and user.date:
            account_age_days = (datetime.now() - user.date.replace(tzinfo=None)).days
        
        # Calculate overall influence score
        influence_score = self._calculate_influence_score(
            avg_views, engagement_rate, posting_frequency, 
            content_quality_score, is_verified, is_admin, follower_count
        )
        
        # Determine specialty tags
        specialty_tags = self._determine_specialties(recent_posts)
        
        return KOLMetrics(
            user_id=user_id,
            username=username,
            first_name=first_name,
            last_name=last_name,
            is_admin=is_admin,
            is_verified=is_verified,
            follower_count=follower_count,
            recent_posts=recent_posts,
            engagement_rate=engagement_rate,
            avg_views=avg_views,
            avg_forwards=avg_forwards,
            forward_ratio=forward_ratio,
            posting_frequency=posting_frequency,
            content_quality_score=content_quality_score,
            bot_probability=bot_probability,
            account_age_days=account_age_days,
            influence_score=influence_score,
            qualifies_as_kol=False,  # Will be set by _evaluate_kol_criteria
            specialty_tags=specialty_tags
        )
    
    def _calculate_content_quality(self, posts: List[Dict]) -> float:
        """Calculate content quality score based on post analysis"""
        if not posts:
            return 0.0
            
        quality_factors = []
        
        for post in posts:
            text = post['text']
            length = post['length']
            views = post['views']
            
            # Length factor (not too short, not too long)
            length_score = 1.0
            if length < 50:
                length_score = 0.3  # Too short
            elif length > 1000:
                length_score = 0.7  # Very long posts get slight penalty
            elif 100 <= length <= 500:
                length_score = 1.0  # Ideal length
                
            # Content sophistication
            sophistication_score = 0.5
            
            # Check for URLs, hashtags, mentions (indicates engagement)
            if '#' in text:
                sophistication_score += 0.1
            if '@' in text:
                sophistication_score += 0.1
            if 'http' in text or 'www' in text:
                sophistication_score += 0.1
                
            # Check for crypto/trading keywords
            crypto_keywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'defi', 'nft', 'token', 'coin', 'trading', 'market', 'price', 'pump', 'analysis']
            crypto_mentions = sum(1 for keyword in crypto_keywords if keyword in text.lower())
            if crypto_mentions > 0:
                sophistication_score += 0.2
                
            # Avoid spam indicators
            spam_indicators = ['🚀' * 3, '💎' * 3, 'URGENT', 'LIMITED TIME', 'GUARANTEE']
            spam_count = sum(1 for indicator in spam_indicators if indicator in text)
            if spam_count > 0:
                sophistication_score -= 0.3
                
            # Views factor (higher views indicate quality content)
            views_factor = min(views / 1000, 1.0)  # Cap at 1000 views
            
            post_quality = (length_score * 0.4 + sophistication_score * 0.4 + views_factor * 0.2)
            quality_factors.append(max(0.0, min(1.0, post_quality)))
            
        return sum(quality_factors) / len(quality_factors)
    
    def _calculate_bot_probability(self, user, posts: List[Dict]) -> float:
        """Calculate probability that user is a bot"""
        bot_score = 0.0
        
        # Check username patterns
        username = getattr(user, 'username', '')
        if username:
            # Random number patterns suggest bot
            if re.search(r'\d{4,}', username):
                bot_score += 0.3
            # Very long usernames with random characters
            if len(username) > 15 and re.search(r'[a-z]{8,}[0-9]{3,}', username):
                bot_score += 0.2
                
        # Check posting patterns
        if posts:
            # Very frequent posting (more than 20 posts per day) suggests bot
            if len(posts) >= 20:
                time_span = posts[0]['date'] - posts[-1]['date']
                if time_span.days <= 1:
                    bot_score += 0.4
                    
            # Check for repetitive content
            texts = [post['text'][:100] for post in posts]  # First 100 chars
            unique_texts = set(texts)
            if len(unique_texts) < len(texts) * 0.5:  # Less than 50% unique content
                bot_score += 0.3
                
        # Verified users are less likely to be bots
        if getattr(user, 'verified', False):
            bot_score -= 0.3
            
        # Users with profile photos are less likely to be bots
        if hasattr(user, 'photo') and user.photo:
            bot_score -= 0.2
            
        return max(0.0, min(1.0, bot_score))
    
    def _calculate_influence_score(self, avg_views: float, engagement_rate: float, 
                                 posting_frequency: float, content_quality: float,
                                 is_verified: bool, is_admin: bool, follower_count: int) -> float:
        """Calculate overall influence score"""
        
        # Normalize metrics to 0-1 scale
        views_score = min(avg_views / 10000, 1.0)  # Cap at 10k views
        engagement_score = min(engagement_rate / 20, 1.0)  # Cap at 20% engagement
        frequency_score = min(posting_frequency / 10, 1.0)  # Cap at 10 posts per week
        followers_score = min(follower_count / 50000, 1.0)  # Cap at 50k followers
        
        # Weighted combination
        base_score = (
            views_score * 0.25 +
            engagement_score * 0.25 + 
            frequency_score * 0.15 +
            content_quality * 0.20 +
            followers_score * 0.15
        )
        
        # Bonus factors
        if is_verified:
            base_score += 0.1
        if is_admin:
            base_score += 0.05
            
        return min(base_score, 1.0) * 100  # Convert to 0-100 scale
    
    def _determine_specialties(self, posts: List[Dict]) -> List[str]:
        """Determine user's specialty areas based on post content"""
        if not posts:
            return []
            
        all_text = ' '.join(post['text'].lower() for post in posts)
        
        specialties = []
        
        # Crypto categories
        if any(word in all_text for word in ['bitcoin', 'btc', 'cryptocurrency', 'blockchain']):
            specialties.append('Bitcoin')
        if any(word in all_text for word in ['ethereum', 'eth', 'defi', 'smart contract']):
            specialties.append('DeFi')
        if any(word in all_text for word in ['nft', 'opensea', 'rare', 'collectible']):
            specialties.append('NFT')
        if any(word in all_text for word in ['trading', 'chart', 'technical analysis', 'ta']):
            specialties.append('Trading')
        if any(word in all_text for word in ['altcoin', 'gem', 'moonshot', 'small cap']):
            specialties.append('Altcoins')
        if any(word in all_text for word in ['market', 'news', 'analysis', 'report']):
            specialties.append('Market Analysis')
            
        return specialties[:3]  # Return top 3 specialties
    
    def _evaluate_kol_criteria(self, metrics: KOLMetrics) -> bool:
        """Evaluate if user meets KOL criteria"""
        
        # Must have some recent posts
        if len(metrics.recent_posts) == 0:
            return False
            
        # Check all criteria
        criteria_met = 0
        total_criteria = 0
        
        # Follower count (relaxed for Telegram)
        total_criteria += 1
        if metrics.follower_count >= self.criteria.min_followers or metrics.is_verified or metrics.is_admin:
            criteria_met += 1
            
        # Engagement rate
        total_criteria += 1
        if metrics.engagement_rate >= self.criteria.min_engagement_rate:
            criteria_met += 1
            
        # Posting frequency
        total_criteria += 1
        if metrics.posting_frequency >= self.criteria.min_posts_per_week:
            criteria_met += 1
            
        # Average views
        total_criteria += 1
        if metrics.avg_views >= self.criteria.min_average_views:
            criteria_met += 1
            
        # Forward ratio
        total_criteria += 1
        if metrics.forward_ratio >= self.criteria.min_forward_ratio:
            criteria_met += 1
            
        # Bot probability (must be low)
        total_criteria += 1
        if metrics.bot_probability <= self.criteria.max_bot_probability:
            criteria_met += 1
            
        # Content quality
        total_criteria += 1
        if metrics.content_quality_score >= self.criteria.quality_content_threshold:
            criteria_met += 1
            
        # Must meet at least 60% of criteria OR be verified/admin with good metrics
        meets_threshold = criteria_met >= (total_criteria * 0.6)
        
        # Special cases for verified users or admins
        if (metrics.is_verified or metrics.is_admin) and metrics.influence_score >= 30:
            meets_threshold = True
            
        # High influence score can override some criteria
        if metrics.influence_score >= 70:
            meets_threshold = True
            
        return meets_threshold 