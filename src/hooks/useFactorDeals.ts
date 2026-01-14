import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface FactorDeal {
  id: string;
  title: string;
  company_name: string;
  invoice_amount: number;
  discount_rate: number;
  term_days: number;
  factor_type: string;
  risk_rating: string | null;
  status: string;
  min_investment: number;
  target_raise: number | null;
  current_raised: number;
  documents: Json;
  sponsor_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useFactorDeals() {
  const [deals, setDeals] = useState<FactorDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from("factor_deals")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setDeals([]);
    } else {
      setDeals(data || []);
    }
    setLoading(false);
  }, []);

  const getDeal = useCallback(async (id: string): Promise<FactorDeal | null> => {
    const { data, error: fetchError } = await supabase
      .from("factor_deals")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching factor deal:", fetchError);
      return null;
    }
    return data;
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    loading,
    error,
    refetch: fetchDeals,
    getDeal,
  };
}
