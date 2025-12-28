import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  badge_color: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
  requirement_config: Record<string, unknown>;
  is_hidden: boolean;
  is_active: boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
  notified: boolean;
  achievement?: Achievement;
}

export interface UserLevel {
  id: string;
  user_id: string;
  current_level: number;
  current_xp: number;
  total_xp: number;
  level_updated_at: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  challenge_type: string;
  requirement_type: string;
  requirement_value: number;
  reward_type: string;
  reward_value: number;
  starts_at: string;
  ends_at: string;
  max_participants: number | null;
  is_active: boolean;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
  reward_claimed: boolean;
  challenge?: Challenge;
}

export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  last_action_date: string | null;
}

// Demo data
const demoAchievements: Achievement[] = [
  { id: '1', slug: 'first_investment', name: 'First Investment', description: 'Make your first investment', category: 'investing', icon: '💰', badge_color: 'bronze', points: 100, requirement_type: 'count', requirement_value: 1, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '2', slug: 'getting_started', name: 'Getting Started', description: 'Invest $100 total', category: 'investing', icon: '🚀', badge_color: 'bronze', points: 50, requirement_type: 'amount', requirement_value: 100, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '3', slug: 'serious_investor', name: 'Serious Investor', description: 'Invest $1,000 total', category: 'investing', icon: '📈', badge_color: 'silver', points: 150, requirement_type: 'amount', requirement_value: 1000, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '4', slug: 'portfolio_builder', name: 'Portfolio Builder', description: 'Invest $10,000 total', category: 'investing', icon: '🏗️', badge_color: 'gold', points: 500, requirement_type: 'amount', requirement_value: 10000, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '5', slug: 'whale_status', name: 'Whale Status', description: 'Invest $100,000 total', category: 'investing', icon: '🐋', badge_color: 'diamond', points: 1000, requirement_type: 'amount', requirement_value: 100000, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '6', slug: 'diversified', name: 'Diversified', description: 'Own tokens in 10 different properties', category: 'investing', icon: '🎯', badge_color: 'gold', points: 250, requirement_type: 'count', requirement_value: 10, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '7', slug: 'first_dividend', name: 'First Dividend', description: 'Receive your first dividend', category: 'dividends', icon: '💵', badge_color: 'bronze', points: 100, requirement_type: 'count', requirement_value: 1, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '8', slug: 'passive_income', name: 'Passive Income', description: 'Receive $100 in dividends', category: 'dividends', icon: '💸', badge_color: 'silver', points: 150, requirement_type: 'amount', requirement_value: 100, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '9', slug: 'fortune_teller', name: 'Fortune Teller', description: 'Win your first prediction', category: 'predictions', icon: '🔮', badge_color: 'bronze', points: 100, requirement_type: 'count', requirement_value: 1, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '10', slug: 'on_a_roll', name: 'On a Roll', description: 'Win 3 predictions in a row', category: 'predictions', icon: '🎲', badge_color: 'silver', points: 200, requirement_type: 'streak', requirement_value: 3, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '11', slug: 'market_maker', name: 'Market Maker', description: 'Complete first secondary market trade', category: 'trading', icon: '📊', badge_color: 'bronze', points: 100, requirement_type: 'count', requirement_value: 1, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '12', slug: 'diamond_hands', name: 'Diamond Hands', description: 'Hold a position for 1 year', category: 'trading', icon: '💎', badge_color: 'platinum', points: 400, requirement_type: 'date', requirement_value: 365, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '13', slug: 'social_butterfly', name: 'Social Butterfly', description: 'Follow 10 investors', category: 'social', icon: '🦋', badge_color: 'bronze', points: 50, requirement_type: 'count', requirement_value: 10, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '14', slug: 'referral_rookie', name: 'Referral Rookie', description: 'Refer 1 friend', category: 'social', icon: '👥', badge_color: 'bronze', points: 100, requirement_type: 'count', requirement_value: 1, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '15', slug: 'referral_pro', name: 'Referral Pro', description: 'Refer 10 friends', category: 'social', icon: '🌟', badge_color: 'gold', points: 500, requirement_type: 'count', requirement_value: 10, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '16', slug: 'dedicated', name: 'Dedicated', description: '7-day login streak', category: 'streaks', icon: '🔥', badge_color: 'bronze', points: 100, requirement_type: 'streak', requirement_value: 7, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '17', slug: 'committed', name: 'Committed', description: '30-day login streak', category: 'streaks', icon: '⚡', badge_color: 'silver', points: 300, requirement_type: 'streak', requirement_value: 30, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '18', slug: 'obsessed', name: 'Obsessed', description: '100-day login streak', category: 'streaks', icon: '🏆', badge_color: 'gold', points: 750, requirement_type: 'streak', requirement_value: 100, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '19', slug: 'quick_learner', name: 'Quick Learner', description: 'Complete profile setup', category: 'learning', icon: '📚', badge_color: 'bronze', points: 50, requirement_type: 'count', requirement_value: 1, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '20', slug: 'kyc_complete', name: 'KYC Complete', description: 'Finish identity verification', category: 'learning', icon: '✅', badge_color: 'bronze', points: 100, requirement_type: 'count', requirement_value: 1, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '21', slug: 'security_first', name: 'Security First', description: 'Enable 2FA', category: 'learning', icon: '🔐', badge_color: 'bronze', points: 75, requirement_type: 'count', requirement_value: 1, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '22', slug: 'og_investor', name: 'OG Investor', description: 'Join in first year of platform', category: 'special', icon: '👑', badge_color: 'diamond', points: 500, requirement_type: 'date', requirement_value: 1, requirement_config: {}, is_hidden: false, is_active: true },
  { id: '23', slug: 'night_owl', name: 'Night Owl', description: 'Make investment after midnight', category: 'special', icon: '🦉', badge_color: 'bronze', points: 50, requirement_type: 'custom', requirement_value: 1, requirement_config: {}, is_hidden: true, is_active: true },
  { id: '24', slug: 'speed_demon', name: 'Speed Demon', description: 'Complete investment in under 30 seconds', category: 'special', icon: '⚡', badge_color: 'silver', points: 75, requirement_type: 'custom', requirement_value: 1, requirement_config: {}, is_hidden: true, is_active: true },
];

const demoUserAchievements: UserAchievement[] = [
  { id: '1', user_id: 'demo', achievement_id: '1', progress: 1, completed: true, completed_at: '2024-12-15T10:00:00Z', notified: true },
  { id: '2', user_id: 'demo', achievement_id: '2', progress: 100, completed: true, completed_at: '2024-12-16T10:00:00Z', notified: true },
  { id: '3', user_id: 'demo', achievement_id: '3', progress: 850, completed: false, completed_at: null, notified: false },
  { id: '4', user_id: 'demo', achievement_id: '6', progress: 7, completed: false, completed_at: null, notified: false },
  { id: '5', user_id: 'demo', achievement_id: '7', progress: 1, completed: true, completed_at: '2024-12-20T10:00:00Z', notified: true },
  { id: '6', user_id: 'demo', achievement_id: '16', progress: 7, completed: true, completed_at: '2024-12-25T10:00:00Z', notified: true },
  { id: '7', user_id: 'demo', achievement_id: '19', progress: 1, completed: true, completed_at: '2024-12-10T10:00:00Z', notified: true },
  { id: '8', user_id: 'demo', achievement_id: '20', progress: 1, completed: true, completed_at: '2024-12-12T10:00:00Z', notified: true },
  { id: '9', user_id: 'demo', achievement_id: '14', progress: 3, completed: true, completed_at: '2024-12-18T10:00:00Z', notified: true },
];

const demoChallenges: Challenge[] = [
  { id: '1', name: 'Daily Login', description: 'Log in to B-LINE-IT', challenge_type: 'daily', requirement_type: 'login', requirement_value: 1, reward_type: 'xp', reward_value: 25, starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 86400000).toISOString(), max_participants: null, is_active: true },
  { id: '2', name: 'Market Check', description: 'View 3 property details', challenge_type: 'daily', requirement_type: 'view_properties', requirement_value: 3, reward_type: 'xp', reward_value: 50, starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 86400000).toISOString(), max_participants: null, is_active: true },
  { id: '3', name: 'Social Share', description: 'Share a property on social media', challenge_type: 'daily', requirement_type: 'share', requirement_value: 1, reward_type: 'xp', reward_value: 75, starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 86400000).toISOString(), max_participants: null, is_active: true },
  { id: '4', name: 'Weekly Investor', description: 'Invest any amount this week', challenge_type: 'weekly', requirement_type: 'invest', requirement_value: 1, reward_type: 'xp', reward_value: 150, starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 604800000).toISOString(), max_participants: null, is_active: true },
  { id: '5', name: 'Comment Champion', description: 'Leave 5 comments on properties', challenge_type: 'weekly', requirement_type: 'comment', requirement_value: 5, reward_type: 'xp', reward_value: 100, starts_at: new Date().toISOString(), ends_at: new Date(Date.now() + 604800000).toISOString(), max_participants: null, is_active: true },
  { id: '6', name: 'January Investor', description: 'Invest $1,000+ in January', challenge_type: 'monthly', requirement_type: 'invest_amount', requirement_value: 1000, reward_type: 'xp', reward_value: 500, starts_at: '2025-01-01T00:00:00Z', ends_at: '2025-01-31T23:59:59Z', max_participants: null, is_active: true },
  { id: '7', name: 'New Year Challenge', description: 'Make an investment on Jan 1, 2025', challenge_type: 'special', requirement_type: 'invest_date', requirement_value: 1, reward_type: 'xp', reward_value: 250, starts_at: '2025-01-01T00:00:00Z', ends_at: '2025-01-02T00:00:00Z', max_participants: null, is_active: true },
];

const demoUserChallenges: UserChallenge[] = [
  { id: '1', user_id: 'demo', challenge_id: '1', progress: 1, completed: true, completed_at: new Date().toISOString(), reward_claimed: true },
  { id: '2', user_id: 'demo', challenge_id: '2', progress: 1, completed: false, completed_at: null, reward_claimed: false },
  { id: '3', user_id: 'demo', challenge_id: '3', progress: 0, completed: false, completed_at: null, reward_claimed: false },
  { id: '4', user_id: 'demo', challenge_id: '4', progress: 350, completed: false, completed_at: null, reward_claimed: false },
  { id: '5', user_id: 'demo', challenge_id: '5', progress: 2, completed: false, completed_at: null, reward_claimed: false },
  { id: '6', user_id: 'demo', challenge_id: '6', progress: 450, completed: false, completed_at: null, reward_claimed: false },
];

const demoStreaks: UserStreak[] = [
  { id: '1', user_id: 'demo', streak_type: 'daily_login', current_streak: 7, longest_streak: 23, last_action_date: new Date().toISOString().split('T')[0] },
  { id: '2', user_id: 'demo', streak_type: 'weekly_invest', current_streak: 4, longest_streak: 8, last_action_date: new Date().toISOString().split('T')[0] },
  { id: '3', user_id: 'demo', streak_type: 'dividend_collect', current_streak: 12, longest_streak: 12, last_action_date: new Date().toISOString().split('T')[0] },
];

const demoUserLevel: UserLevel = {
  id: '1',
  user_id: 'demo',
  current_level: 12,
  current_xp: 2450,
  total_xp: 12450,
  level_updated_at: new Date().toISOString(),
};

// Level thresholds
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Newcomer' },
  { level: 2, xp: 100, title: 'Newcomer' },
  { level: 3, xp: 200, title: 'Newcomer' },
  { level: 4, xp: 350, title: 'Newcomer' },
  { level: 5, xp: 500, title: 'Beginner Investor' },
  { level: 6, xp: 750, title: 'Beginner Investor' },
  { level: 7, xp: 1000, title: 'Beginner Investor' },
  { level: 8, xp: 1350, title: 'Beginner Investor' },
  { level: 9, xp: 1700, title: 'Beginner Investor' },
  { level: 10, xp: 2000, title: 'Active Investor' },
  { level: 11, xp: 2500, title: 'Active Investor' },
  { level: 12, xp: 3000, title: 'Active Investor' },
  { level: 13, xp: 3500, title: 'Active Investor' },
  { level: 14, xp: 4250, title: 'Active Investor' },
  { level: 15, xp: 5000, title: 'Experienced Investor' },
  { level: 16, xp: 6000, title: 'Experienced Investor' },
  { level: 17, xp: 7000, title: 'Experienced Investor' },
  { level: 18, xp: 8250, title: 'Experienced Investor' },
  { level: 19, xp: 9500, title: 'Experienced Investor' },
  { level: 20, xp: 10000, title: 'Silver Investor' },
  { level: 25, xp: 17500, title: 'Gold Investor' },
  { level: 30, xp: 27500, title: 'Platinum Investor' },
  { level: 35, xp: 40000, title: 'Diamond Investor' },
  { level: 40, xp: 55000, title: 'Elite Investor' },
  { level: 45, xp: 75000, title: 'Master Investor' },
  { level: 50, xp: 100000, title: 'Legend' },
];

export function getLevelInfo(level: number) {
  const currentThreshold = LEVEL_THRESHOLDS.find(t => t.level === level) || LEVEL_THRESHOLDS[0];
  const nextThreshold = LEVEL_THRESHOLDS.find(t => t.level > level) || currentThreshold;
  return { current: currentThreshold, next: nextThreshold };
}

export function useAchievements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      if (!user) return demoAchievements;
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true);
      
      if (error || !data?.length) return demoAchievements;
      return data as Achievement[];
    },
  });
}

export function useUserAchievements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) {
        return demoUserAchievements.map(ua => ({
          ...ua,
          achievement: demoAchievements.find(a => a.id === ua.achievement_id),
        }));
      }
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', user.id);
      
      if (error || !data?.length) {
        return demoUserAchievements.map(ua => ({
          ...ua,
          achievement: demoAchievements.find(a => a.id === ua.achievement_id),
        }));
      }
      return data as UserAchievement[];
    },
  });
}

export function useUserLevel() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-level', user?.id],
    queryFn: async () => {
      if (!user) return demoUserLevel;
      
      const { data, error } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error || !data) return demoUserLevel;
      return data as UserLevel;
    },
  });
}

export function useChallenges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      if (!user) return demoChallenges;
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .gte('ends_at', new Date().toISOString());
      
      if (error || !data?.length) return demoChallenges;
      return data as Challenge[];
    },
  });
}

export function useUserChallenges() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-challenges', user?.id],
    queryFn: async () => {
      if (!user) {
        return demoUserChallenges.map(uc => ({
          ...uc,
          challenge: demoChallenges.find(c => c.id === uc.challenge_id),
        }));
      }
      
      const { data, error } = await supabase
        .from('user_challenges')
        .select('*, challenge:challenges(*)')
        .eq('user_id', user.id);
      
      if (error || !data?.length) {
        return demoUserChallenges.map(uc => ({
          ...uc,
          challenge: demoChallenges.find(c => c.id === uc.challenge_id),
        }));
      }
      return data as UserChallenge[];
    },
  });
}

export function useUserStreaks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-streaks', user?.id],
    queryFn: async () => {
      if (!user) return demoStreaks;
      
      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id);
      
      if (error || !data?.length) return demoStreaks;
      return data as UserStreak[];
    },
  });
}

export function useLeaderboard(type: 'xp' | 'investors' | 'referrals' | 'predictions' = 'xp') {
  return useQuery({
    queryKey: ['leaderboard', type],
    queryFn: async () => {
      // Demo leaderboard data
      return [
        { rank: 1, user_id: '1', display_name: 'CryptoKing', level: 47, total_xp: 89450, avatar_url: null },
        { rank: 2, user_id: '2', display_name: 'InvestorPro', level: 45, total_xp: 78230, avatar_url: null },
        { rank: 3, user_id: '3', display_name: 'TokenMaster', level: 43, total_xp: 71890, avatar_url: null },
        { rank: 4, user_id: '4', display_name: 'WealthBuilder', level: 41, total_xp: 65450, avatar_url: null },
        { rank: 5, user_id: '5', display_name: 'PropertyPro', level: 39, total_xp: 58200, avatar_url: null },
        { rank: 6, user_id: '6', display_name: 'RealEstateGuru', level: 37, total_xp: 52100, avatar_url: null },
        { rank: 7, user_id: '7', display_name: 'TokenTrader', level: 35, total_xp: 46800, avatar_url: null },
        { rank: 8, user_id: '8', display_name: 'DividendKing', level: 33, total_xp: 41500, avatar_url: null },
        { rank: 9, user_id: '9', display_name: 'SmartInvestor', level: 31, total_xp: 36900, avatar_url: null },
        { rank: 10, user_id: '10', display_name: 'AssetBuilder', level: 29, total_xp: 32400, avatar_url: null },
      ];
    },
  });
}

export function useXPHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['xp-history', user?.id],
    queryFn: async () => {
      // Demo XP history
      return [
        { id: '1', type: 'daily_login', description: 'Daily Login', xp: 25, created_at: new Date().toISOString() },
        { id: '2', type: 'achievement', description: 'Achievement: First Dividend', xp: 100, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', type: 'challenge', description: 'Weekly Challenge Progress', xp: 50, created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '4', type: 'achievement', description: 'Achievement: Diversified', xp: 250, created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: '5', type: 'level_up', description: 'Level Up: 11 → 12', xp: 150, created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: '6', type: 'achievement', description: 'Achievement: Dedicated', xp: 100, created_at: new Date(Date.now() - 259200000).toISOString() },
        { id: '7', type: 'challenge', description: 'Daily Challenge Complete', xp: 75, created_at: new Date(Date.now() - 345600000).toISOString() },
        { id: '8', type: 'referral', description: 'Referral Bonus', xp: 100, created_at: new Date(Date.now() - 432000000).toISOString() },
      ];
    },
  });
}

export function useClaimReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (challengeId: string) => {
      // Demo: just update local state
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['user-level'] });
    },
  });
}
