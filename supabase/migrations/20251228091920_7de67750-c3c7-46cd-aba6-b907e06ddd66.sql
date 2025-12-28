-- Create referral_tiers table
CREATE TABLE public.referral_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier_name TEXT NOT NULL,
  tier_level INTEGER NOT NULL UNIQUE,
  min_referrals INTEGER NOT NULL DEFAULT 0,
  commission_rate DECIMAL NOT NULL DEFAULT 0.05,
  bonus_per_referral DECIMAL NOT NULL DEFAULT 10,
  badge_icon TEXT NOT NULL,
  badge_color TEXT NOT NULL,
  perks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_leaderboard table
CREATE TABLE public.referral_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  referral_count INTEGER NOT NULL DEFAULT 0,
  total_invested_by_referrals DECIMAL NOT NULL DEFAULT 0,
  commission_earned DECIMAL NOT NULL DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_milestones table
CREATE TABLE public.referral_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL,
  milestone_value INTEGER NOT NULL,
  milestone_name TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value DECIMAL NOT NULL DEFAULT 0,
  reward_description TEXT,
  achieved_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_contests table
CREATE TABLE public.referral_contests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  prize_pool DECIMAL NOT NULL DEFAULT 0,
  prizes JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'upcoming',
  winner_ids JSONB,
  rules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to referrals table
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS tier_at_referral TEXT,
ADD COLUMN IF NOT EXISTS bonus_earned DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_rate_applied DECIMAL DEFAULT 0.05;

-- Add referral_tier to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS referral_tier TEXT DEFAULT 'Bronze',
ADD COLUMN IF NOT EXISTS referral_tier_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS qualified_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referral_commission_earned DECIMAL DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.referral_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_contests ENABLE ROW LEVEL SECURITY;

-- Referral tiers policies (read-only for all users)
CREATE POLICY "Anyone can view referral tiers" ON public.referral_tiers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage referral tiers" ON public.referral_tiers
  FOR ALL USING (is_admin());

-- Referral leaderboard policies
CREATE POLICY "Anyone can view leaderboard" ON public.referral_leaderboard
  FOR SELECT USING (true);

CREATE POLICY "System can insert leaderboard entries" ON public.referral_leaderboard
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update leaderboard entries" ON public.referral_leaderboard
  FOR UPDATE USING (true);

-- Referral milestones policies
CREATE POLICY "Users can view their own milestones" ON public.referral_milestones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own milestones" ON public.referral_milestones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all milestones" ON public.referral_milestones
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage milestones" ON public.referral_milestones
  FOR ALL USING (is_admin());

-- Referral contests policies
CREATE POLICY "Anyone can view active contests" ON public.referral_contests
  FOR SELECT USING (status IN ('upcoming', 'active', 'ended'));

CREATE POLICY "Admins can manage contests" ON public.referral_contests
  FOR ALL USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_referral_leaderboard_period ON public.referral_leaderboard(period, period_start, period_end);
CREATE INDEX idx_referral_leaderboard_user ON public.referral_leaderboard(user_id);
CREATE INDEX idx_referral_leaderboard_rank ON public.referral_leaderboard(rank);
CREATE INDEX idx_referral_milestones_user ON public.referral_milestones(user_id);
CREATE INDEX idx_referral_contests_status ON public.referral_contests(status);
CREATE INDEX idx_referral_contests_dates ON public.referral_contests(start_date, end_date);

-- Insert default tiers
INSERT INTO public.referral_tiers (tier_name, tier_level, min_referrals, commission_rate, bonus_per_referral, badge_icon, badge_color, perks) VALUES
('Bronze', 1, 0, 0.05, 10, '🥉', '#CD7F32', '["5% commission on referral investments", "$10 bonus per qualified referral", "Standard support"]'),
('Silver', 2, 5, 0.07, 15, '🥈', '#C0C0C0', '["7% commission on referral investments", "$15 bonus per qualified referral", "Early access to new properties", "Silver badge on profile"]'),
('Gold', 3, 15, 0.10, 20, '🥇', '#FFD700', '["10% commission on referral investments", "$20 bonus per qualified referral", "Priority support", "Exclusive Gold investor events", "Gold badge on profile"]'),
('Platinum', 4, 30, 0.12, 30, '💎', '#E5E4E2', '["12% commission on referral investments", "$30 bonus per qualified referral", "Dedicated account manager", "First access to premium properties", "Platinum badge on profile", "Reduced platform fees (0.5%)"]'),
('Diamond', 5, 50, 0.15, 50, '👑', '#B9F2FF', '["15% commission on referral investments", "$50 bonus per qualified referral", "VIP support hotline", "Exclusive Diamond properties", "Diamond badge on profile", "Zero platform fees", "Annual Diamond retreat invitation"]');

-- Create trigger for updated_at
CREATE TRIGGER update_referral_leaderboard_updated_at
  BEFORE UPDATE ON public.referral_leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();