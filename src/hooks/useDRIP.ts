import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DRIPSettings {
  id: string;
  user_id: string;
  is_enabled: boolean;
  drip_type: string;
  reinvest_equity_dividends: boolean;
  reinvest_debt_interest: boolean;
  reinvest_prediction_winnings: boolean;
  minimum_reinvest_amount: number;
  drip_balance: number;
  created_at: string;
  updated_at: string;
}

export interface DRIPPropertySettings {
  id: string;
  user_id: string;
  property_id: string;
  is_enabled: boolean;
  reinvest_to: string;
  custom_property_id: string | null;
  created_at: string;
  property?: {
    id: string;
    name: string;
    city: string;
    state: string;
    apy: number;
    token_price: number;
  };
}

export interface DRIPTransaction {
  id: string;
  user_id: string;
  source_type: string;
  source_id: string;
  source_amount: number;
  reinvest_property_id: string;
  tokens_purchased: number;
  token_price: number;
  reinvest_amount: number;
  remainder_to_balance: number;
  status: string;
  executed_at: string | null;
  created_at: string;
  property?: {
    id: string;
    name: string;
  };
}

export interface DRIPSummary {
  id: string;
  user_id: string;
  period: string;
  period_start: string;
  total_reinvested: number;
  tokens_acquired: number;
  estimated_extra_value: number;
  created_at: string;
}

export function useDRIPSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['drip-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('drip_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as DRIPSettings | null;
    },
    enabled: !!user?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<DRIPSettings>) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      if (settings) {
        const { error } = await supabase
          .from('drip_settings')
          .update(updates as any)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('drip_settings')
          .insert({ user_id: user.id, ...updates } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drip-settings'] });
      toast.success('DRIP settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update DRIP settings');
      console.error(error);
    },
  });

  const toggleDRIP = async (enabled: boolean) => {
    await updateSettings.mutateAsync({ is_enabled: enabled });
  };

  return {
    settings,
    isLoading,
    updateSettings: updateSettings.mutateAsync,
    toggleDRIP,
    isUpdating: updateSettings.isPending,
  };
}

export function useDRIPPropertySettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: propertySettings, isLoading } = useQuery({
    queryKey: ['drip-property-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('drip_property_settings')
        .select(`
          *,
          property:properties!drip_property_settings_property_id_fkey(id, name, city, state, apy, token_price)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as unknown as DRIPPropertySettings[];
    },
    enabled: !!user?.id,
  });

  const updatePropertySettings = useMutation({
    mutationFn: async ({ propertyId, updates }: { propertyId: string; updates: Partial<DRIPPropertySettings> }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const existing = propertySettings?.find(p => p.property_id === propertyId);
      
      if (existing) {
        const { error } = await supabase
          .from('drip_property_settings')
          .update(updates as any)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('drip_property_settings')
          .insert({ user_id: user.id, property_id: propertyId, ...updates } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drip-property-settings'] });
      toast.success('Property DRIP settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update property DRIP settings');
      console.error(error);
    },
  });

  return {
    propertySettings,
    isLoading,
    updatePropertySettings: updatePropertySettings.mutateAsync,
    isUpdating: updatePropertySettings.isPending,
  };
}

export function useDRIPTransactions(limit?: number) {
  const { user } = useAuth();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['drip-transactions', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('drip_transactions')
        .select(`
          *,
          property:properties!reinvest_property_id(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as DRIPTransaction[];
    },
    enabled: !!user?.id,
  });

  return {
    transactions,
    isLoading,
  };
}

export function useDRIPSummary() {
  const { user } = useAuth();

  const { data: summary, isLoading } = useQuery({
    queryKey: ['drip-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('drip_summary')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', 'all_time')
        .maybeSingle();
      
      if (error) throw error;
      return data as DRIPSummary | null;
    },
    enabled: !!user?.id,
  });

  return {
    summary,
    isLoading,
  };
}

export function useDRIPStats() {
  const { settings } = useDRIPSettings();
  const { transactions } = useDRIPTransactions();
  const { summary } = useDRIPSummary();

  const stats = {
    totalReinvested: summary?.total_reinvested || transactions?.reduce((sum, t) => sum + t.reinvest_amount, 0) || 0,
    tokensAcquired: summary?.tokens_acquired || transactions?.reduce((sum, t) => sum + t.tokens_purchased, 0) || 0,
    currentValue: 0,
    extraEarned: summary?.estimated_extra_value || 0,
    dripBalance: settings?.drip_balance || 0,
  };

  // Calculate current value based on transactions
  if (transactions && transactions.length > 0) {
    // Group by property and get current token prices
    const tokensByProperty: Record<string, number> = {};
    transactions.forEach(t => {
      tokensByProperty[t.reinvest_property_id] = (tokensByProperty[t.reinvest_property_id] || 0) + t.tokens_purchased;
    });
    
    // For now, estimate current value using the last known token price
    stats.currentValue = transactions.reduce((sum, t) => {
      const tokens = t.tokens_purchased;
      const currentPrice = t.token_price * 1.02; // Assume 2% appreciation for demo
      return sum + (tokens * currentPrice);
    }, 0);
    
    stats.extraEarned = stats.currentValue - stats.totalReinvested;
  }

  return stats;
}

export function useSimulateDRIP() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { settings } = useDRIPSettings();

  const simulateDividend = useMutation({
    mutationFn: async ({ propertyId, propertyName, amount, tokenPrice }: { 
      propertyId: string; 
      propertyName: string;
      amount: number; 
      tokenPrice: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (!settings?.is_enabled) throw new Error('DRIP is not enabled');
      
      const tokens = amount / tokenPrice;
      const remainder = 0;
      
      const { error } = await supabase
        .from('drip_transactions')
        .insert({
          user_id: user.id,
          source_type: 'dividend',
          source_id: propertyId,
          source_amount: amount,
          reinvest_property_id: propertyId,
          tokens_purchased: tokens,
          token_price: tokenPrice,
          reinvest_amount: amount,
          remainder_to_balance: remainder,
          status: 'completed',
          executed_at: new Date().toISOString(),
        } as any);
      
      if (error) throw error;
      
      return { tokens, propertyName, amount };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['drip-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['drip-summary'] });
      toast.success(`🔄 $${data.amount.toFixed(2)} dividend reinvested → ${data.tokens.toFixed(4)} ${data.propertyName} tokens`);
    },
    onError: (error) => {
      toast.error('Failed to simulate DRIP');
      console.error(error);
    },
  });

  return {
    simulateDividend: simulateDividend.mutateAsync,
    isSimulating: simulateDividend.isPending,
  };
}
