import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface LienDeal {
  id: string;
  title: string;
  property_address: string;
  property_city: string | null;
  property_state: string | null;
  lien_position: string;
  principal_amount: number;
  interest_rate: number;
  term_months: number;
  collateral_value: number;
  ltv_ratio: number | null;
  status: string;
  min_investment: number;
  documents: Json;
  sponsor_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useLienDeals() {
  const [deals, setDeals] = useState<LienDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from("lien_deals")
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

  const getDeal = useCallback(async (id: string): Promise<LienDeal | null> => {
    const { data, error: fetchError } = await supabase
      .from("lien_deals")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching lien deal:", fetchError);
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
