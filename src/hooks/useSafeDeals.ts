import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface SafeDeal {
  id: string;
  company_name: string;
  description: string | null;
  stage: string;
  industry: string | null;
  valuation_cap: number | null;
  discount_rate: number | null;
  has_mfn: boolean;
  has_pro_rata: boolean;
  target_raise: number;
  current_raised: number;
  status: string;
  min_investment: number;
  exemption_type: string;
  location_city: string | null;
  location_state: string | null;
  website_url: string | null;
  image_url: string | null;
  team: Json;
  documents: Json;
  sponsor_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useSafeDeals() {
  const [deals, setDeals] = useState<SafeDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from("safe_deals")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setDeals([]);
    } else {
      setDeals((data as unknown as SafeDeal[]) || []);
    }
    setLoading(false);
  }, []);

  const getDeal = useCallback(async (id: string): Promise<SafeDeal | null> => {
    const { data, error: fetchError } = await supabase
      .from("safe_deals")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching safe deal:", fetchError);
      return null;
    }
    return data as unknown as SafeDeal;
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
