import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface ReferralTier {
  id: string;
  tier_name: string;
  tier_level: number;
  min_referrals: number;
  commission_rate: number;
  bonus_per_referral: number;
  badge_icon: string;
  badge_color: string;
  perks: string[];
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  period: string;
  period_start: string;
  period_end: string;
  referral_count: number;
  total_invested_by_referrals: number;
  commission_earned: number;
  rank: number;
  profile?: {
    display_name: string;
    avatar_url: string;
    referral_tier: string;
  };
}

export interface ReferralMilestone {
  id: string;
  user_id: string;
  milestone_type: string;
  milestone_value: number;
  milestone_name: string;
  reward_type: string;
  reward_value: number;
  reward_description: string;
  achieved_at: string | null;
  claimed_at: string | null;
}

export interface ReferralContest {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  prize_pool: number;
  prizes: { place: number; amount: number; label: string }[];
  status: string;
  winner_ids: string[] | null;
  rules: string[];
}

export interface UserReferralStats {
  total_referrals: number;
  qualified_referrals: number;
  pending_referrals: number;
  total_invested_by_referrals: number;
  commission_earned: number;
  current_tier: ReferralTier | null;
  next_tier: ReferralTier | null;
  referrals_to_next_tier: number;
  current_rank: number | null;
}

export const useReferralTiers = () => {
  return useQuery({
    queryKey: ["referral-tiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_tiers")
        .select("*")
        .order("tier_level", { ascending: true });

      if (error) throw error;
      return data.map((tier) => ({
        ...tier,
        perks: typeof tier.perks === "string" ? JSON.parse(tier.perks) : tier.perks,
      })) as ReferralTier[];
    },
  });
};

export const useLeaderboard = (period: "weekly" | "monthly" | "all_time" = "monthly") => {
  return useQuery({
    queryKey: ["referral-leaderboard", period],
    queryFn: async () => {
      const now = new Date();
      let periodStart: Date;
      let periodEnd: Date;

      if (period === "weekly") {
        const dayOfWeek = now.getDay();
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - dayOfWeek);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 6);
        periodEnd.setHours(23, 59, 59, 999);
      } else if (period === "monthly") {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else {
        periodStart = new Date(2020, 0, 1);
        periodEnd = new Date(2030, 11, 31);
      }

      const { data, error } = await supabase
        .from("referral_leaderboard")
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url,
            referral_tier
          )
        `)
        .eq("period", period)
        .gte("period_start", periodStart.toISOString().split("T")[0])
        .lte("period_end", periodEnd.toISOString().split("T")[0])
        .order("rank", { ascending: true })
        .limit(50);

      if (error) throw error;
      
      // Transform the nested profile data
      return (data || []).map((entry) => ({
        ...entry,
        profile: Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles,
      })) as LeaderboardEntry[];
    },
  });
};

export const useUserReferralStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-referral-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      // Get user profile with referral data
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("total_referrals, qualified_referrals, referral_tier, referral_tier_level, referral_commission_earned, referral_earnings")
        .eq("user_id", user.id)
        .single();

      if (profileError) throw profileError;

      // Get referrals
      const { data: referrals, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id);

      if (referralsError) throw referralsError;

      // Get all tiers
      const { data: tiers, error: tiersError } = await supabase
        .from("referral_tiers")
        .select("*")
        .order("tier_level", { ascending: true });

      if (tiersError) throw tiersError;

      const parsedTiers = tiers.map((tier) => ({
        ...tier,
        perks: typeof tier.perks === "string" ? JSON.parse(tier.perks) : tier.perks,
      })) as ReferralTier[];

      const totalReferrals = referrals?.length || 0;
      const qualifiedReferrals = referrals?.filter((r) => r.status === "qualified").length || 0;
      const pendingReferrals = referrals?.filter((r) => r.status === "pending" || r.status === "signed_up").length || 0;
      const totalInvested = referrals?.reduce((sum, r) => sum + (Number(r.total_invested) || 0), 0) || 0;

      // Find current and next tier
      const currentTier = parsedTiers.find((t) => t.tier_level === (profile?.referral_tier_level || 1)) || parsedTiers[0];
      const nextTierIndex = parsedTiers.findIndex((t) => t.tier_level === currentTier.tier_level) + 1;
      const nextTier = nextTierIndex < parsedTiers.length ? parsedTiers[nextTierIndex] : null;
      const referralsToNextTier = nextTier ? Math.max(0, nextTier.min_referrals - qualifiedReferrals) : 0;

      // Get current rank from leaderboard
      const { data: leaderboardEntry } = await supabase
        .from("referral_leaderboard")
        .select("rank")
        .eq("user_id", user.id)
        .eq("period", "monthly")
        .single();

      return {
        total_referrals: totalReferrals,
        qualified_referrals: qualifiedReferrals,
        pending_referrals: pendingReferrals,
        total_invested_by_referrals: totalInvested,
        commission_earned: Number(profile?.referral_commission_earned || profile?.referral_earnings || 0),
        current_tier: currentTier,
        next_tier: nextTier,
        referrals_to_next_tier: referralsToNextTier,
        current_rank: leaderboardEntry?.rank || null,
      } as UserReferralStats;
    },
    enabled: !!user?.id,
  });
};

export const useReferralMilestones = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referral-milestones", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("referral_milestones")
        .select("*")
        .eq("user_id", user.id)
        .order("milestone_value", { ascending: true });

      if (error) throw error;
      return data as ReferralMilestone[];
    },
    enabled: !!user?.id,
  });
};

export const useActiveContests = () => {
  return useQuery({
    queryKey: ["referral-contests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_contests")
        .select("*")
        .in("status", ["upcoming", "active"])
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data.map((contest) => ({
        ...contest,
        prizes: typeof contest.prizes === "string" ? JSON.parse(contest.prizes) : contest.prizes,
        rules: typeof contest.rules === "string" ? JSON.parse(contest.rules) : contest.rules,
      })) as ReferralContest[];
    },
  });
};

export const useClaimMilestone = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (milestoneId: string) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("referral_milestones")
        .update({ claimed_at: new Date().toISOString() })
        .eq("id", milestoneId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      // Add reward to wallet
      const milestone = data as ReferralMilestone;
      if (milestone.reward_type === "bonus_cash" && milestone.reward_value > 0) {
        await supabase.rpc("credit_referral_reward", {
          p_user_id: user.id,
          p_referral_id: milestoneId,
          p_reward_type: "milestone_bonus",
          p_amount: milestone.reward_value,
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-milestones"] });
      queryClient.invalidateQueries({ queryKey: ["user-referral-stats"] });
      toast({
        title: "Milestone Claimed!",
        description: "Your reward has been added to your wallet.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to claim milestone reward.",
        variant: "destructive",
      });
    },
  });
};

export const useUserReferrals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-referrals-detailed", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("referrals")
        .select(`
          *,
          referred_profile:referred_user_id (
            display_name,
            avatar_url
          )
        `)
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
};
