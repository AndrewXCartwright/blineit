import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface Referral {
  id: string;
  referrer_id: string;
  referred_email: string;
  referred_user_id: string | null;
  status: string;
  total_invested: number;
  qualified_at: string | null;
  reward_paid: boolean;
  created_at: string;
}

interface ReferralStats {
  invited: number;
  signedUp: number;
  qualified: number;
}

export function useReferrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch referral code from profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("referral_code")
          .eq("user_id", user.id)
          .single();

        if (profile?.referral_code) {
          setReferralCode(profile.referral_code);
        }

        // Fetch referrals
        const { data: referralsData } = await supabase
          .from("referrals")
          .select("*")
          .eq("referrer_id", user.id)
          .order("created_at", { ascending: false });

        if (referralsData) {
          setReferrals(referralsData as Referral[]);
        }
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const stats: ReferralStats = {
    invited: referrals.length,
    signedUp: referrals.filter(r => r.status === "signed_up" || r.status === "qualified").length,
    qualified: referrals.filter(r => r.status === "qualified").length,
  };

  const getReferralLink = () => {
    if (!referralCode) return "";
    return `${window.location.origin}/auth?ref=${referralCode}`;
  };

  const copyReferralLink = async () => {
    const link = getReferralLink();
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      toast.success("Referral link copied!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareReferral = async () => {
    const link = getReferralLink();
    if (!link) return;

    const shareData = {
      title: "Join me on PropPredict!",
      text: "Invest in real estate and predict property markets. Sign up with my link and get started!",
      url: link,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // User cancelled or error
        copyReferralLink();
      }
    } else {
      copyReferralLink();
    }
  };

  const inviteFriend = async (email: string) => {
    if (!user) return { error: "Not authenticated" };

    try {
      const { error } = await supabase.from("referrals").insert({
        referrer_id: user.id,
        referred_email: email,
        status: "invited",
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This email has already been invited");
        } else {
          toast.error("Failed to send invite");
        }
        return { error: error.message };
      }

      toast.success(`Invite sent to ${email}`);
      
      // Refresh referrals
      const { data: referralsData } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (referralsData) {
        setReferrals(referralsData as Referral[]);
      }

      return { error: null };
    } catch (error) {
      return { error: "Failed to send invite" };
    }
  };

  return {
    referrals,
    referralCode,
    stats,
    loading,
    getReferralLink,
    copyReferralLink,
    shareReferral,
    inviteFriend,
  };
}
