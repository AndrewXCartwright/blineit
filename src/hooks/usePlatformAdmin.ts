import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PlatformStats {
  totalOfferings: number;
  totalInvestors: number;
  totalRaised: number;
  pendingKYC: number;
}

interface Offering {
  id: string;
  name: string;
  type: 'Real Estate' | 'Factor' | 'Lien' | 'SAFE' | 'VC' | 'PE';
  sponsor_name: string;
  sponsor_id: string | null;
  status: string;
  total_raised: number;
  investors: number;
  created_at: string;
  digishares_sto_id: string | null;
}

interface Sponsor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string;
  offerings_count: number;
  total_raised: number;
  status: string;
  joined_date: string;
}

export function useIsPlatformAdmin() {
  const { user } = useAuth();
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPlatformAdmin() {
      if (!user) {
        setIsPlatformAdmin(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('is_platform_admin')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsPlatformAdmin(data?.is_platform_admin === true);
      setLoading(false);
    }

    checkPlatformAdmin();
  }, [user]);

  return { isPlatformAdmin, loading };
}

export function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalOfferings: 0,
    totalInvestors: 0,
    totalRaised: 0,
    pendingKYC: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Count offerings from all asset tables
        const [properties, factorDeals, lienDeals, safeDeals, vcFunds, peFunds] = await Promise.all([
          supabase.from('properties').select('id', { count: 'exact', head: true }),
          supabase.from('factor_deals').select('id', { count: 'exact', head: true }),
          supabase.from('lien_deals').select('id', { count: 'exact', head: true }),
          supabase.from('safe_deals').select('id', { count: 'exact', head: true }),
          supabase.from('vc_funds').select('id', { count: 'exact', head: true }),
          supabase.from('pe_funds').select('id', { count: 'exact', head: true }),
        ]);

        const totalOfferings = 
          (properties.count || 0) + 
          (factorDeals.count || 0) + 
          (lienDeals.count || 0) + 
          (safeDeals.count || 0) + 
          (vcFunds.count || 0) + 
          (peFunds.count || 0);

        // Count investors (users who have made investments)
        const { count: investorCount } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true });

        // Sum total raised from transactions
        const { data: transactionData } = await supabase
          .from('transactions')
          .select('amount')
          .in('type', ['buy_tokens', 'investment']);

        const totalRaised = transactionData?.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) || 0;

        // Count pending KYC
        const { count: pendingKYC } = await supabase
          .from('kyc_verifications')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');

        setStats({
          totalOfferings,
          totalInvestors: investorCount || 0,
          totalRaised,
          pendingKYC: pendingKYC || 0,
        });
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading };
}

export function usePlatformOfferings(filters?: {
  type?: string;
  status?: string;
  sponsorId?: string;
}) {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOfferings() {
      try {
        const allOfferings: Offering[] = [];

        // Fetch properties (no status column - use is_hot as proxy)
        if (!filters?.type || filters.type === 'real_estate') {
          const { data: properties } = await supabase
            .from('properties')
            .select('id, name, sponsor_id, is_hot, holders, created_at');
          
          properties?.forEach(p => {
            allOfferings.push({
              id: p.id,
              name: p.name,
              type: 'Real Estate',
              sponsor_name: 'N/A',
              sponsor_id: p.sponsor_id,
              status: p.is_hot ? 'active' : 'closed',
              total_raised: 0,
              investors: p.holders || 0,
              created_at: p.created_at,
              digishares_sto_id: null,
            });
          });
        }

        // Fetch factor deals
        if (!filters?.type || filters.type === 'factor') {
          const { data: factorDeals } = await supabase
            .from('factor_deals')
            .select('id, title, sponsor_id, status, current_raised, created_at');
          
          factorDeals?.forEach(f => {
            allOfferings.push({
              id: f.id,
              name: f.title,
              type: 'Factor',
              sponsor_name: 'N/A',
              sponsor_id: f.sponsor_id,
              status: f.status || 'active',
              total_raised: f.current_raised || 0,
              investors: 0,
              created_at: f.created_at || '',
              digishares_sto_id: null,
            });
          });
        }

        // Fetch lien deals (no current_raised column - use principal_amount)
        if (!filters?.type || filters.type === 'lien') {
          const { data: lienDeals } = await supabase
            .from('lien_deals')
            .select('id, title, sponsor_id, status, principal_amount, created_at');
          
          lienDeals?.forEach(l => {
            allOfferings.push({
              id: l.id,
              name: l.title,
              type: 'Lien',
              sponsor_name: 'N/A',
              sponsor_id: l.sponsor_id,
              status: l.status || 'active',
              total_raised: l.principal_amount || 0,
              investors: 0,
              created_at: l.created_at || '',
              digishares_sto_id: null,
            });
          });
        }

        // Fetch SAFE deals
        if (!filters?.type || filters.type === 'safe') {
          const { data: safeDeals } = await supabase
            .from('safe_deals')
            .select('id, company_name, sponsor_id, status, current_raised, created_at');
          
          safeDeals?.forEach(s => {
            allOfferings.push({
              id: s.id,
              name: s.company_name,
              type: 'SAFE',
              sponsor_name: 'N/A',
              sponsor_id: s.sponsor_id,
              status: s.status || 'active',
              total_raised: s.current_raised || 0,
              investors: 0,
              created_at: s.created_at || '',
              digishares_sto_id: null,
            });
          });
        }

        // Fetch VC funds (fund_name instead of name)
        if (!filters?.type || filters.type === 'vc') {
          const { data: vcFunds } = await supabase
            .from('vc_funds')
            .select('id, fund_name, status, current_raised, created_at');
          
          vcFunds?.forEach(v => {
            allOfferings.push({
              id: v.id,
              name: v.fund_name,
              type: 'VC',
              sponsor_name: 'N/A',
              sponsor_id: null,
              status: v.status || 'active',
              total_raised: v.current_raised || 0,
              investors: 0,
              created_at: v.created_at || '',
              digishares_sto_id: null,
            });
          });
        }

        // Fetch PE funds (fund_name instead of name)
        if (!filters?.type || filters.type === 'pe') {
          const { data: peFunds } = await supabase
            .from('pe_funds')
            .select('id, fund_name, status, current_raised, created_at');
          
          peFunds?.forEach(pe => {
            allOfferings.push({
              id: pe.id,
              name: pe.fund_name,
              type: 'PE',
              sponsor_name: 'N/A',
              sponsor_id: null,
              status: pe.status || 'active',
              total_raised: pe.current_raised || 0,
              investors: 0,
              created_at: pe.created_at || '',
              digishares_sto_id: null,
            });
          });
        }

        // Check DigiShares sync status
        const { data: syncRecords } = await supabase
          .from('digishares_sync')
          .select('investment_id, investment_type, digishares_sto_id');

        // Map sync status to offerings
        allOfferings.forEach(offering => {
          const syncRecord = syncRecords?.find(
            s => s.investment_id === offering.id
          );
          if (syncRecord) {
            offering.digishares_sto_id = syncRecord.digishares_sto_id;
          }
        });

        // Apply status filter
        let filtered = allOfferings;
        if (filters?.status) {
          filtered = filtered.filter(o => o.status === filters.status);
        }
        if (filters?.sponsorId) {
          filtered = filtered.filter(o => o.sponsor_id === filters.sponsorId);
        }

        // Sort by created date
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setOfferings(filtered);
      } catch (error) {
        console.error('Error fetching offerings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOfferings();
  }, [filters?.type, filters?.status, filters?.sponsorId]);

  return { offerings, loading };
}

export function usePlatformSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchSponsors() {
    try {
      // Get sponsor profiles (verification_status instead of status)
      const { data: sponsorProfiles } = await supabase
        .from('sponsor_profiles')
        .select('id, user_id, company_name, verification_status, created_at');

      if (!sponsorProfiles) {
        setSponsors([]);
        return;
      }

      // Get user details for each sponsor
      const sponsorList: Sponsor[] = [];
      for (const sp of sponsorProfiles) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, email')
          .eq('user_id', sp.user_id)
          .maybeSingle();

        // Count offerings for this sponsor
        const [properties, factorDeals, lienDeals, safeDeals] = await Promise.all([
          supabase.from('properties').select('id', { count: 'exact', head: true }).eq('sponsor_id', sp.id),
          supabase.from('factor_deals').select('id', { count: 'exact', head: true }).eq('sponsor_id', sp.id),
          supabase.from('lien_deals').select('id', { count: 'exact', head: true }).eq('sponsor_id', sp.id),
          supabase.from('safe_deals').select('id', { count: 'exact', head: true }).eq('sponsor_id', sp.id),
        ]);

        const offeringsCount = 
          (properties.count || 0) + 
          (factorDeals.count || 0) + 
          (lienDeals.count || 0) + 
          (safeDeals.count || 0);

        sponsorList.push({
          id: sp.id,
          user_id: sp.user_id,
          name: profile?.name || 'Unknown',
          email: profile?.email || '',
          company: sp.company_name || '',
          offerings_count: offeringsCount,
          total_raised: 0, // Would need to sum from all offering tables
          status: sp.verification_status || 'pending',
          joined_date: sp.created_at,
        });
      }

      setSponsors(sponsorList);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  }

  async function disableSponsor(sponsorId: string) {
    const { error } = await supabase
      .from('sponsor_profiles')
      .update({ verification_status: 'rejected' })
      .eq('id', sponsorId);

    if (!error) {
      fetchSponsors();
    }
    return { error };
  }

  useEffect(() => {
    fetchSponsors();
  }, []);

  return { sponsors, loading, refetch: fetchSponsors, disableSponsor };
}
