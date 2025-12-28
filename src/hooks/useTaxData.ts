import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface TaxDocument {
  id: string;
  user_id: string;
  tax_year: number;
  document_type: '1099-DIV' | '1099-INT' | '1099-MISC' | '1099-B' | 'tax_summary';
  status: 'pending' | 'generating' | 'ready' | 'error';
  file_url: string | null;
  generated_at: string | null;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TaxableEvent {
  id: string;
  user_id: string;
  tax_year: number;
  event_type: 'dividend' | 'interest' | 'capital_gain' | 'capital_loss' | 'prediction_winnings';
  event_date: string;
  description: string;
  item_type: 'property' | 'loan' | 'prediction';
  item_id: string;
  item_name: string;
  gross_amount: number;
  fees: number;
  net_amount: number;
  cost_basis: number | null;
  gain_loss: number | null;
  holding_period: 'short_term' | 'long_term' | null;
  created_at: string;
}

export interface TaxSettings {
  id: string;
  user_id: string;
  tax_id_type: 'ssn' | 'ein' | null;
  tax_id_last_four: string | null;
  tax_id_encrypted: string | null;
  filing_status: 'single' | 'married_joint' | 'married_separate' | 'head_of_household' | null;
  state: string | null;
  cost_basis_method: 'fifo' | 'lifo' | 'specific_id' | 'average';
  electronic_delivery: boolean;
  mail_paper_copies: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxSummary {
  dividends: number;
  qualifiedDividends: number;
  interest: number;
  predictionWinnings: number;
  capitalGains: number;
  capitalLosses: number;
  netCapitalGainLoss: number;
  totalIncome: number;
}

export function useTaxDocuments(taxYear: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tax-documents', user?.id, taxYear],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('tax_documents')
        .select('*')
        .eq('user_id', user.id)
        .eq('tax_year', taxYear)
        .order('document_type');

      if (error) throw error;
      return data as TaxDocument[];
    },
    enabled: !!user?.id,
  });
}

export function useTaxableEvents(taxYear: number, eventType?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['taxable-events', user?.id, taxYear, eventType],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('taxable_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('tax_year', taxYear)
        .order('event_date', { ascending: false });

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TaxableEvent[];
    },
    enabled: !!user?.id,
  });
}

export function useTaxSettings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tax-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('tax_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as TaxSettings | null;
    },
    enabled: !!user?.id,
  });
}

export function useTaxSummary(taxYear: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tax-summary', user?.id, taxYear],
    queryFn: async (): Promise<TaxSummary> => {
      if (!user?.id) {
        return {
          dividends: 0,
          qualifiedDividends: 0,
          interest: 0,
          predictionWinnings: 0,
          capitalGains: 0,
          capitalLosses: 0,
          netCapitalGainLoss: 0,
          totalIncome: 0,
        };
      }

      const { data, error } = await supabase
        .from('taxable_events')
        .select('event_type, net_amount, gain_loss')
        .eq('user_id', user.id)
        .eq('tax_year', taxYear);

      if (error) throw error;

      const events = data || [];
      
      const dividends = events
        .filter(e => e.event_type === 'dividend')
        .reduce((sum, e) => sum + Number(e.net_amount), 0);
      
      const interest = events
        .filter(e => e.event_type === 'interest')
        .reduce((sum, e) => sum + Number(e.net_amount), 0);
      
      const predictionWinnings = events
        .filter(e => e.event_type === 'prediction_winnings')
        .reduce((sum, e) => sum + Number(e.net_amount), 0);
      
      const capitalGains = events
        .filter(e => e.event_type === 'capital_gain')
        .reduce((sum, e) => sum + Number(e.gain_loss || 0), 0);
      
      const capitalLosses = events
        .filter(e => e.event_type === 'capital_loss')
        .reduce((sum, e) => sum + Math.abs(Number(e.gain_loss || 0)), 0);

      return {
        dividends,
        qualifiedDividends: dividends * 0.75, // Estimate
        interest,
        predictionWinnings,
        capitalGains,
        capitalLosses,
        netCapitalGainLoss: capitalGains - capitalLosses,
        totalIncome: dividends + interest + predictionWinnings + (capitalGains - capitalLosses),
      };
    },
    enabled: !!user?.id,
  });
}

export function useUpdateTaxSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<TaxSettings>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('tax_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('tax_settings')
          .update(settings)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tax_settings')
          .insert({ ...settings, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
      toast.success('Tax settings saved');
    },
    onError: () => {
      toast.error('Failed to save tax settings');
    },
  });
}

export function useGenerateTaxDocuments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taxYear: number) => {
      if (!user?.id) throw new Error('Not authenticated');

      const documentTypes = ['1099-DIV', '1099-INT', '1099-MISC', '1099-B', 'tax_summary'] as const;
      
      for (const docType of documentTypes) {
        // Check if document already exists
        const { data: existing } = await supabase
          .from('tax_documents')
          .select('id')
          .eq('user_id', user.id)
          .eq('tax_year', taxYear)
          .eq('document_type', docType)
          .single();

        if (!existing) {
          const { error } = await supabase
            .from('tax_documents')
            .insert({
              user_id: user.id,
              tax_year: taxYear,
              document_type: docType,
              status: 'generating',
            });
          if (error) throw error;
        }
      }

      // Simulate document generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update all documents to ready
      const { error } = await supabase
        .from('tax_documents')
        .update({ 
          status: 'ready', 
          generated_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('tax_year', taxYear);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-documents'] });
      toast.success('Tax documents generated successfully');
    },
    onError: () => {
      toast.error('Failed to generate tax documents');
    },
  });
}
