import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrackRecord {
  fund: string;
  vintage: number;
  tvpi: number;
  irr: number;
  moic?: number;
  dpi?: number;
}

interface TeamMember {
  name: string;
  title: string;
  bio?: string;
  image_url?: string;
  linkedin_url?: string;
}

interface PortfolioCompany {
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  status?: string;
  acquisition_date?: string;
  sector?: string;
}

export interface PEFund {
  id: string;
  fund_name: string;
  fund_manager: string;
  gp_name: string;
  description: string | null;
  strategy: string | null;
  thesis: string | null;
  target_fund_size: number;
  current_raised: number;
  min_investment: number;
  management_fee: number;
  carried_interest: number;
  preferred_return: number;
  fund_term_years: number;
  investment_period_years: number;
  vintage_year: number | null;
  fund_stage: string | null;
  target_company_size: string | null;
  geographic_focus: string | null;
  target_sectors: string[];
  track_record: TrackRecord[];
  team: TeamMember[];
  portfolio_companies: PortfolioCompany[];
  status: string;
  exemption_type: string;
  image_url: string | null;
  location_city: string | null;
  location_state: string | null;
  documents: any[];
  created_at: string;
  updated_at: string;
}

export function usePEFunds() {
  const [funds, setFunds] = useState<PEFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("pe_funds")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      // Parse JSONB fields
      const parsedFunds = (data || []).map(fund => ({
        ...fund,
        target_sectors: Array.isArray(fund.target_sectors) ? fund.target_sectors as unknown as string[] : [],
        track_record: Array.isArray(fund.track_record) ? fund.track_record as unknown as TrackRecord[] : [],
        team: Array.isArray(fund.team) ? fund.team as unknown as TeamMember[] : [],
        portfolio_companies: Array.isArray(fund.portfolio_companies) ? fund.portfolio_companies as unknown as PortfolioCompany[] : [],
        documents: Array.isArray(fund.documents) ? fund.documents : [],
      })) as PEFund[];
      
      setFunds(parsedFunds);
    } catch (err) {
      console.error("Error fetching PE funds:", err);
      setError("Failed to load PE funds");
    } finally {
      setLoading(false);
    }
  };

  return { funds, loading, error, refetch: fetchFunds };
}

export function usePEFund(id: string | undefined) {
  const [fund, setFund] = useState<PEFund | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetchFund();
  }, [id]);

  const fetchFund = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from("pe_funds")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      
      // Parse JSONB fields
      const parsedFund = {
        ...data,
        target_sectors: Array.isArray(data.target_sectors) ? data.target_sectors as unknown as string[] : [],
        track_record: Array.isArray(data.track_record) ? data.track_record as unknown as TrackRecord[] : [],
        team: Array.isArray(data.team) ? data.team as unknown as TeamMember[] : [],
        portfolio_companies: Array.isArray(data.portfolio_companies) ? data.portfolio_companies as unknown as PortfolioCompany[] : [],
        documents: Array.isArray(data.documents) ? data.documents : [],
      } as PEFund;
      
      setFund(parsedFund);
    } catch (err) {
      console.error("Error fetching PE fund:", err);
      setError("Failed to load fund details");
    } finally {
      setLoading(false);
    }
  };

  return { fund, loading, error, refetch: fetchFund };
}
