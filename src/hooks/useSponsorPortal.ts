import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSponsor } from '@/hooks/useSponsor';

export interface SponsorStats {
  totalOfferings: number;
  totalRaised: number;
  totalInvestors: number;
  pendingPurchases: number;
}

export interface SponsorOffering {
  id: string;
  name: string;
  type: 'property' | 'factor_deal' | 'lien_deal' | 'safe_deal' | 'vc_fund' | 'pe_fund';
  status: string;
  target_raise: number;
  current_raised: number;
  investors: number;
  progress: number;
  created_at: string;
  digishares_sto_id: string | null;
  digishares_share_type_id: string | null;
}

export interface SponsorInvestment {
  id: string;
  investor_name: string;
  investor_email: string;
  investor_id: string;
  offering_name: string;
  offering_type: string;
  offering_id: string;
  amount: number;
  tokens: number;
  status: string;
  kyc_status: string;
  created_at: string;
  completed_at: string | null;
}

export interface SponsorInvestor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  country: string;
  kyc_status: string;
  is_accredited: boolean;
  total_invested: number;
  offerings_count: number;
}

export interface CapTableEntry {
  investor_id: string;
  investor_name: string;
  investor_email: string;
  tokens_owned: number;
  percent_ownership: number;
  amount_invested: number;
  investment_date: string;
}

export function useSponsorPortal() {
  const { user } = useAuth();
  const { sponsorProfile } = useSponsor();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SponsorStats>({
    totalOfferings: 0,
    totalRaised: 0,
    totalInvestors: 0,
    pendingPurchases: 0,
  });
  const [offerings, setOfferings] = useState<SponsorOffering[]>([]);
  const [investments, setInvestments] = useState<SponsorInvestment[]>([]);
  const [investors, setInvestors] = useState<SponsorInvestor[]>([]);
  const [recentActivity, setRecentActivity] = useState<SponsorInvestment[]>([]);

  const sponsorId = sponsorProfile?.id || user?.id;

  const fetchStats = async () => {
    if (!sponsorId) return;

    try {
      // Count offerings from all tables
      const [properties, factorDeals, lienDeals, safeDeals, vcFunds, peFunds] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact' }).eq('sponsor_id', sponsorId),
        supabase.from('factor_deals').select('id', { count: 'exact' }).eq('sponsor_id', sponsorId),
        supabase.from('lien_deals').select('id', { count: 'exact' }).eq('sponsor_id', sponsorId),
        supabase.from('safe_deals').select('id', { count: 'exact' }).eq('sponsor_id', sponsorId),
        supabase.from('vc_funds').select('id', { count: 'exact' }).eq('sponsor_id', sponsorId),
        supabase.from('pe_funds').select('id', { count: 'exact' }).eq('sponsor_id', sponsorId),
      ]);

      const totalOfferings = 
        (properties.count || 0) + 
        (factorDeals.count || 0) + 
        (lienDeals.count || 0) + 
        (safeDeals.count || 0) + 
        (vcFunds.count || 0) + 
        (peFunds.count || 0);

      // Get investments for sponsor's offerings
      const { data: investmentsData } = await supabase
        .from('investments')
        .select('*');

      const completedInvestments = investmentsData?.filter(i => i.status === 'completed') || [];
      const pendingInvestments = investmentsData?.filter(i => i.status === 'pending') || [];
      const uniqueInvestors = new Set(completedInvestments.map(i => i.user_id));

      setStats({
        totalOfferings,
        totalRaised: completedInvestments.reduce((sum, i) => sum + Number(i.amount || 0), 0),
        totalInvestors: uniqueInvestors.size,
        pendingPurchases: pendingInvestments.length,
      });
    } catch (error) {
      console.error('Error fetching sponsor stats:', error);
    }
  };

  const fetchOfferings = async () => {
    if (!sponsorId) return;

    try {
      const allOfferings: SponsorOffering[] = [];

      // Fetch from all 6 tables
      const [properties, factorDeals, lienDeals, safeDeals, vcFunds, peFunds] = await Promise.all([
        supabase.from('properties').select('*').eq('sponsor_id', sponsorId),
        supabase.from('factor_deals').select('*').eq('sponsor_id', sponsorId),
        supabase.from('lien_deals').select('*').eq('sponsor_id', sponsorId),
        supabase.from('safe_deals').select('*').eq('sponsor_id', sponsorId),
        supabase.from('vc_funds').select('*').eq('sponsor_id', sponsorId),
        supabase.from('pe_funds').select('*').eq('sponsor_id', sponsorId),
      ]);

      // Map properties - use type assertion for new columns
      properties.data?.forEach((p: any) => {
        const targetRaise = Number(p.value || 0);
        const currentRaised = 0;
        allOfferings.push({
          id: p.id,
          name: p.name,
          type: 'property',
          status: p.status || 'draft',
          target_raise: targetRaise,
          current_raised: currentRaised,
          investors: p.holders || 0,
          progress: targetRaise > 0 ? (currentRaised / targetRaise) * 100 : 0,
          created_at: p.created_at,
          digishares_sto_id: p.digishares_sto_id || null,
          digishares_share_type_id: p.digishares_share_type_id || null,
        });
      });

      // Map factor deals
      factorDeals.data?.forEach((d: any) => {
        const targetRaise = Number(d.target_raise || d.invoice_amount || 0);
        const currentRaised = Number(d.current_raised || 0);
        allOfferings.push({
          id: d.id,
          name: d.title,
          type: 'factor_deal',
          status: d.status || 'draft',
          target_raise: targetRaise,
          current_raised: currentRaised,
          investors: 0,
          progress: targetRaise > 0 ? (currentRaised / targetRaise) * 100 : 0,
          created_at: d.created_at,
          digishares_sto_id: d.digishares_sto_id || null,
          digishares_share_type_id: d.digishares_share_type_id || null,
        });
      });

      // Map lien deals
      lienDeals.data?.forEach((d: any) => {
        const targetRaise = Number(d.principal_amount || 0);
        const currentRaised = Number(d.current_raised || 0);
        allOfferings.push({
          id: d.id,
          name: d.title,
          type: 'lien_deal',
          status: d.status || 'draft',
          target_raise: targetRaise,
          current_raised: currentRaised,
          investors: 0,
          progress: targetRaise > 0 ? (currentRaised / targetRaise) * 100 : 0,
          created_at: d.created_at,
          digishares_sto_id: d.digishares_sto_id || null,
          digishares_share_type_id: d.digishares_share_type_id || null,
        });
      });

      // Map safe deals
      safeDeals.data?.forEach((d: any) => {
        const targetRaise = Number(d.target_raise || 0);
        const currentRaised = Number(d.current_raised || 0);
        allOfferings.push({
          id: d.id,
          name: d.company_name,
          type: 'safe_deal',
          status: d.status || 'draft',
          target_raise: targetRaise,
          current_raised: currentRaised,
          investors: 0,
          progress: targetRaise > 0 ? (currentRaised / targetRaise) * 100 : 0,
          created_at: d.created_at,
          digishares_sto_id: d.digishares_sto_id || null,
          digishares_share_type_id: d.digishares_share_type_id || null,
        });
      });

      // Map VC funds
      vcFunds.data?.forEach((d: any) => {
        const targetRaise = Number(d.target_raise || 0);
        const currentRaised = Number(d.current_raised || 0);
        allOfferings.push({
          id: d.id,
          name: d.fund_name,
          type: 'vc_fund',
          status: d.status || 'draft',
          target_raise: targetRaise,
          current_raised: currentRaised,
          investors: 0,
          progress: targetRaise > 0 ? (currentRaised / targetRaise) * 100 : 0,
          created_at: d.created_at,
          digishares_sto_id: d.digishares_sto_id || null,
          digishares_share_type_id: d.digishares_share_type_id || null,
        });
      });

      // Map PE funds
      peFunds.data?.forEach((d: any) => {
        const targetRaise = Number(d.target_raise || 0);
        const currentRaised = Number(d.current_raised || 0);
        allOfferings.push({
          id: d.id,
          name: d.fund_name,
          type: 'pe_fund',
          status: d.status || 'draft',
          target_raise: targetRaise,
          current_raised: currentRaised,
          investors: 0,
          progress: targetRaise > 0 ? (currentRaised / targetRaise) * 100 : 0,
          created_at: d.created_at,
          digishares_sto_id: d.digishares_sto_id || null,
          digishares_share_type_id: d.digishares_share_type_id || null,
        });
      });

      // Sort by created_at desc
      allOfferings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOfferings(allOfferings);
    } catch (error) {
      console.error('Error fetching offerings:', error);
    }
  };

  const fetchInvestments = async () => {
    if (!sponsorId) return;

    try {
      // Get all investments with investor profiles
      const { data: investmentsData } = await supabase
        .from('investments')
        .select(`
          *,
          profiles:user_id (
            name,
            email,
            kyc_status
          )
        `)
        .order('created_at', { ascending: false });

      if (investmentsData) {
        const mappedInvestments: SponsorInvestment[] = investmentsData.map((inv: any) => ({
          id: inv.id,
          investor_name: inv.profiles?.name || 'Unknown',
          investor_email: inv.profiles?.email || '',
          investor_id: inv.user_id,
          offering_name: inv.investment_type,
          offering_type: inv.investment_type,
          offering_id: inv.investment_id,
          amount: Number(inv.amount),
          tokens: Number(inv.tokens || 0),
          status: inv.status,
          kyc_status: inv.profiles?.kyc_status || 'not_started',
          created_at: inv.created_at,
          completed_at: inv.completed_at || null,
        }));
        setInvestments(mappedInvestments);
        setRecentActivity(mappedInvestments.slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
    }
  };

  const fetchInvestors = async () => {
    if (!sponsorId) return;

    try {
      // Get unique investors from investments
      const { data: investmentsData } = await supabase
        .from('investments')
        .select('*')
        .eq('status', 'completed');

      if (investmentsData) {
        const investorMap = new Map<string, SponsorInvestor>();

        for (const inv of investmentsData) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, name, email, kyc_status')
            .eq('user_id', inv.user_id)
            .single();

          const existingInvestor = investorMap.get(inv.user_id);

          if (existingInvestor) {
            existingInvestor.total_invested += Number(inv.amount);
            existingInvestor.offerings_count += 1;
          } else {
            investorMap.set(inv.user_id, {
              id: profile?.id || inv.user_id,
              user_id: inv.user_id,
              name: profile?.name || 'Unknown',
              email: profile?.email || '',
              country: (profile as any)?.country || 'USA',
              kyc_status: profile?.kyc_status || 'not_started',
              is_accredited: false,
              total_invested: Number(inv.amount),
              offerings_count: 1,
            });
          }
        }

        setInvestors(Array.from(investorMap.values()));
      }
    } catch (error) {
      console.error('Error fetching investors:', error);
    }
  };

  const getCapTable = async (offeringId: string, offeringType: string): Promise<CapTableEntry[]> => {
    try {
      const { data: investmentsData } = await supabase
        .from('investments')
        .select('*')
        .eq('investment_id', offeringId)
        .eq('investment_type', offeringType)
        .eq('status', 'completed');

      if (!investmentsData) return [];

      // Calculate total tokens for percentage
      const totalTokens = investmentsData.reduce((sum, inv) => sum + Number(inv.tokens || 0), 0);

      const entries: CapTableEntry[] = [];
      for (const inv of investmentsData) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('user_id', inv.user_id)
          .single();
        
        entries.push({
          investor_id: inv.user_id,
          investor_name: profile?.name || 'Unknown',
          investor_email: profile?.email || '',
          tokens_owned: Number(inv.tokens || 0),
          percent_ownership: totalTokens > 0 ? (Number(inv.tokens || 0) / totalTokens) * 100 : 0,
          amount_invested: Number(inv.amount),
          investment_date: inv.created_at,
        });
      }
      return entries;
    } catch (error) {
      console.error('Error fetching cap table:', error);
      return [];
    }
  };

  const approveInvestment = async (investmentId: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', investmentId);

      if (error) throw error;
      await fetchInvestments();
      return true;
    } catch (error) {
      console.error('Error approving investment:', error);
      return false;
    }
  };

  const rejectInvestment = async (investmentId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .update({
          status: 'rejected',
          status_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', investmentId);

      if (error) throw error;
      await fetchInvestments();
      return true;
    } catch (error) {
      console.error('Error rejecting investment:', error);
      return false;
    }
  };

  const activateOffering = async (offeringId: string, offeringType: string) => {
    try {
      // Use direct table updates based on type
      let error;
      if (offeringType === 'property') {
        ({ error } = await supabase.from('properties').update({ status: 'active' } as any).eq('id', offeringId));
      } else if (offeringType === 'factor_deal') {
        ({ error } = await supabase.from('factor_deals').update({ status: 'active' }).eq('id', offeringId));
      } else if (offeringType === 'lien_deal') {
        ({ error } = await supabase.from('lien_deals').update({ status: 'active' }).eq('id', offeringId));
      } else if (offeringType === 'safe_deal') {
        ({ error } = await supabase.from('safe_deals').update({ status: 'active' }).eq('id', offeringId));
      } else if (offeringType === 'vc_fund') {
        ({ error } = await supabase.from('vc_funds').update({ status: 'active' }).eq('id', offeringId));
      } else if (offeringType === 'pe_fund') {
        ({ error } = await supabase.from('pe_funds').update({ status: 'active' }).eq('id', offeringId));
      } else {
        return false;
      }

      if (error) throw error;
      await fetchOfferings();
      return true;
    } catch (error) {
      console.error('Error activating offering:', error);
      return false;
    }
  };

  useEffect(() => {
    if (sponsorId) {
      setLoading(true);
      Promise.all([
        fetchStats(),
        fetchOfferings(),
        fetchInvestments(),
        fetchInvestors(),
      ]).finally(() => setLoading(false));
    }
  }, [sponsorId]);

  return {
    loading,
    stats,
    offerings,
    investments,
    investors,
    recentActivity,
    fetchStats,
    fetchOfferings,
    fetchInvestments,
    fetchInvestors,
    getCapTable,
    approveInvestment,
    rejectInvestment,
    activateOffering,
  };
}
