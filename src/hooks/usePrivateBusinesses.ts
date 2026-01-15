import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PrivateBusiness {
  id: string;
  business_name: string;
  description: string | null;
  industry: string;
  business_type: 'revenue_share' | 'equity' | 'convertible_note' | 'profit_share';
  annual_revenue: number | null;
  years_in_operation: number | null;
  target_raise: number;
  current_raised: number;
  min_investment: number;
  projected_return: number | null;
  term_months: number | null;
  revenue_share_percentage: number | null;
  status: string;
  exemption_type: string;
  location_city: string | null;
  location_state: string | null;
  team: any[];
  documents: any[];
  sponsor_id: string | null;
  created_at: string;
  updated_at: string;
}

export function usePrivateBusinesses() {
  const [businesses, setBusinesses] = useState<PrivateBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from("private_businesses")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setBusinesses([]);
    } else {
      setBusinesses((data as unknown as PrivateBusiness[]) || []);
    }
    setLoading(false);
  }, []);

  const getBusiness = useCallback(async (id: string): Promise<PrivateBusiness | null> => {
    const { data, error: fetchError } = await supabase
      .from("private_businesses")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching private business:", fetchError);
      return null;
    }
    return data as unknown as PrivateBusiness;
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return {
    businesses,
    loading,
    error,
    refetch: fetchBusinesses,
    getBusiness,
  };
}
