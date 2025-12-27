import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";
import { z } from "zod";

export type AssetClass = "gold_commodities" | "private_business" | "startups_vc";

const emailSchema = z.string().email("Please enter a valid email address");

export interface WaitlistEntry {
  id: string;
  user_id: string | null;
  email: string;
  asset_class: AssetClass;
  created_at: string;
  notified: boolean;
  referral_code: string | null;
  referred_by: string | null;
}

export function useWaitlist(assetClass: AssetClass) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isOnWaitlist, setIsOnWaitlist] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if user is already on waitlist
  const checkWaitlistStatus = useCallback(async () => {
    setCheckingStatus(true);
    try {
      // Get total count for this asset class
      const { count: total, error: countError } = await supabase
        .from("waitlist")
        .select("*", { count: "exact", head: true })
        .eq("asset_class", assetClass);

      if (!countError && total !== null) {
        setTotalCount(total);
      }

      // Check if current user/email is on waitlist
      if (user?.email) {
        const { data, error } = await supabase
          .from("waitlist")
          .select("id, created_at")
          .eq("asset_class", assetClass)
          .eq("email", user.email)
          .maybeSingle();

        if (!error && data) {
          setIsOnWaitlist(true);
          
          // Get position in queue
          const { count: positionCount, error: posError } = await supabase
            .from("waitlist")
            .select("*", { count: "exact", head: true })
            .eq("asset_class", assetClass)
            .lte("created_at", data.created_at);

          if (!posError && positionCount !== null) {
            setPosition(positionCount);
          }
        } else {
          setIsOnWaitlist(false);
          setPosition(null);
        }
      }
    } catch (error) {
      console.error("Error checking waitlist status:", error);
    } finally {
      setCheckingStatus(false);
    }
  }, [assetClass, user?.email]);

  useEffect(() => {
    checkWaitlistStatus();
  }, [checkWaitlistStatus]);

  const joinWaitlist = async (email: string) => {
    // Validate email
    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({
        title: "Invalid Email",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return { success: false };
    }

    setLoading(true);
    try {
      // Generate a simple referral code
      const referralCode = `${assetClass.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const { error } = await supabase.from("waitlist").insert({
        email: email.toLowerCase().trim(),
        asset_class: assetClass,
        user_id: user?.id || null,
        referral_code: referralCode,
      });

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation - already on waitlist
          toast({
            title: "Already Registered",
            description: "This email is already on the waitlist for this asset class.",
          });
          setIsOnWaitlist(true);
          return { success: false, alreadyExists: true };
        }
        throw error;
      }

      toast({
        title: "🎉 You're on the list!",
        description: `We'll notify you at ${email} when this launches.`,
      });

      setIsOnWaitlist(true);
      setTotalCount((prev) => prev + 1);
      setPosition(totalCount + 1);

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Failed to Join",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = () => {
    return `${window.location.origin}/coming-soon/${assetClass}`;
  };

  const shareWaitlist = async () => {
    const shareUrl = getShareUrl();
    const shareText = "Check out this upcoming investment opportunity!";

    try {
      await navigator.share({
        title: "Join the Waitlist",
        text: shareText,
        url: shareUrl,
      });
    } catch {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      });
    }
  };

  return {
    loading,
    isOnWaitlist,
    position,
    totalCount,
    checkingStatus,
    joinWaitlist,
    shareWaitlist,
    getShareUrl,
    refetch: checkWaitlistStatus,
  };
}

export function useWaitlistCounts() {
  const [counts, setCounts] = useState<Record<AssetClass, number>>({
    gold_commodities: 0,
    private_business: 0,
    startups_vc: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    try {
      const assetClasses: AssetClass[] = ["gold_commodities", "private_business", "startups_vc"];
      const newCounts: Record<AssetClass, number> = {} as any;

      for (const ac of assetClasses) {
        const { count, error } = await supabase
          .from("waitlist")
          .select("*", { count: "exact", head: true })
          .eq("asset_class", ac);

        if (!error && count !== null) {
          newCounts[ac] = count;
        }
      }

      setCounts(newCounts);
    } catch (error) {
      console.error("Error fetching waitlist counts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return { counts, loading, refetch: fetchCounts };
}

export function useUserWaitlistStatus() {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<Record<AssetClass, boolean>>({
    gold_commodities: false,
    private_business: false,
    startups_vc: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("asset_class")
        .eq("email", user.email);

      if (!error && data) {
        const newStatuses: Record<AssetClass, boolean> = {
          gold_commodities: false,
          private_business: false,
          startups_vc: false,
        };

        data.forEach((entry) => {
          if (entry.asset_class in newStatuses) {
            newStatuses[entry.asset_class as AssetClass] = true;
          }
        });

        setStatuses(newStatuses);
      }
    } catch (error) {
      console.error("Error fetching user waitlist status:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  return { statuses, loading, refetch: fetchStatuses };
}
