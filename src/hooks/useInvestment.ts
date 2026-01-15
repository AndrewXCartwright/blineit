import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { syncInvestmentToDigiShares } from "@/services/digishares-sync";
export type InvestmentType = 'real_estate' | 'factor' | 'lien' | 'safe' | 'private_business';

export interface Investment {
  id: string;
  user_id: string;
  investment_type: InvestmentType;
  investment_id: string;
  amount: number;
  tokens: number;
  status: string;
  digishares_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestmentParams {
  investment_type: InvestmentType;
  investment_id: string;
  amount: number;
  tokens: number;
}

export function useInvestment() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInvestment = useCallback(async (params: CreateInvestmentParams): Promise<Investment | null> => {
    if (!user) {
      setError("Please sign in to invest");
      toast.error("Please sign in to invest");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("investments")
        .insert({
          user_id: user.id,
          investment_type: params.investment_type,
          investment_id: params.investment_id,
          amount: params.amount,
          tokens: params.tokens,
          status: "pending",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Investment error:", insertError);
        setError(insertError.message);
        toast.error("Failed to create investment. Please try again.");
        return null;
      }

      // TODO: Sync with DigiShares when integration is ready
      // For now, mark as completed
      const { data: updatedData, error: updateError } = await supabase
        .from("investments")
        .update({ status: "completed" })
        .eq("id", data.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        // Still return the pending investment
        return data as Investment;
      }

      const finalData = (updatedData || data) as Investment;

      // Sync to DigiShares (non-blocking)
      try {
        await syncInvestmentToDigiShares({
          id: finalData.id,
          investment_type: finalData.investment_type,
          investment_id: finalData.investment_id,
          amount: finalData.amount,
          user_id: finalData.user_id,
        });
      } catch (syncError) {
        console.error('DigiShares sync failed:', syncError);
        // Don't block the user - investment is still recorded
      }

      toast.success("Investment successful!");
      return finalData;
    } catch (err) {
      console.error("Investment error:", err);
      setError("An unexpected error occurred");
      toast.error("An unexpected error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getUserInvestments = useCallback(async (investmentType?: InvestmentType): Promise<Investment[]> => {
    if (!user) return [];

    let query = supabase
      .from("investments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (investmentType) {
      query = query.eq("investment_type", investmentType);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      console.error("Fetch investments error:", fetchError);
      return [];
    }

    return (data || []) as Investment[];
  }, [user]);

  const getInvestmentsByDeal = useCallback(async (investmentType: InvestmentType, investmentId: string): Promise<Investment[]> => {
    const { data, error: fetchError } = await supabase
      .from("investments")
      .select("*")
      .eq("investment_type", investmentType)
      .eq("investment_id", investmentId)
      .eq("status", "completed");

    if (fetchError) {
      console.error("Fetch deal investments error:", fetchError);
      return [];
    }

    return (data || []) as Investment[];
  }, []);

  return {
    loading,
    error,
    createInvestment,
    getUserInvestments,
    getInvestmentsByDeal,
  };
}
