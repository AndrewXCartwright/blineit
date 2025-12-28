import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface AutoInvestPlan {
  id: string;
  user_id: string;
  name: string;
  status: 'active' | 'paused' | 'cancelled';
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  amount: number;
  funding_source: 'wallet' | 'linked_account';
  linked_account_id: string | null;
  insufficient_funds_action: 'skip' | 'partial' | 'pause';
  start_date: string;
  next_execution_date: string;
  last_execution_date: string | null;
  total_invested: number;
  total_executions: number;
  paused_at: string | null;
  pause_until: string | null;
  created_at: string;
  updated_at: string;
  allocations?: AutoInvestAllocation[];
}

export interface AutoInvestAllocation {
  id: string;
  plan_id: string;
  target_type: 'property' | 'loan' | 'category';
  target_id: string | null;
  category: string | null;
  allocation_percent: number;
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

export interface AutoInvestExecution {
  id: string;
  plan_id: string;
  user_id: string;
  execution_date: string;
  total_amount: number;
  actual_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  failure_reason: string | null;
  created_at: string;
  completed_at: string | null;
  details?: AutoInvestExecutionDetail[];
}

export interface AutoInvestExecutionDetail {
  id: string;
  execution_id: string;
  target_type: string;
  target_id: string;
  target_name: string;
  intended_amount: number;
  actual_amount: number;
  tokens_purchased: number;
  token_price: number;
  status: string;
  failure_reason: string | null;
  transaction_id: string | null;
  created_at: string;
}

export interface CreatePlanInput {
  name: string;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  amount: number;
  funding_source: 'wallet' | 'linked_account';
  linked_account_id?: string;
  insufficient_funds_action: 'skip' | 'partial' | 'pause';
  start_date: string;
  allocations: {
    target_type: 'property' | 'loan' | 'category';
    target_id?: string;
    category?: string;
    allocation_percent: number;
  }[];
}

export const useAutoInvestPlans = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['auto-invest-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('auto_invest_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AutoInvestPlan[];
    },
    enabled: !!user?.id,
  });
};

export const useAutoInvestPlan = (planId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['auto-invest-plan', planId],
    queryFn: async () => {
      if (!planId || !user?.id) return null;

      const { data: plan, error: planError } = await supabase
        .from('auto_invest_plans')
        .select('*')
        .eq('id', planId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (planError) throw planError;
      if (!plan) return null;

      const { data: allocations, error: allocError } = await supabase
        .from('auto_invest_allocations')
        .select('*')
        .eq('plan_id', planId);

      if (allocError) throw allocError;

      // Fetch property details for allocations
      const propertyIds = allocations
        ?.filter(a => a.target_type === 'property' && a.target_id)
        .map(a => a.target_id) || [];

      let properties: Record<string, any> = {};
      if (propertyIds.length > 0) {
        const { data: propData } = await supabase
          .from('properties')
          .select('id, name, city, state, apy, token_price')
          .in('id', propertyIds);
        
        if (propData) {
          properties = propData.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        }
      }

      const allocationsWithDetails = allocations?.map(a => ({
        ...a,
        property: a.target_id ? properties[a.target_id] : undefined,
      })) || [];

      return {
        ...plan,
        allocations: allocationsWithDetails,
      } as AutoInvestPlan;
    },
    enabled: !!planId && !!user?.id,
  });
};

export const useAutoInvestExecutions = (planId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['auto-invest-executions', planId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('auto_invest_executions')
        .select('*')
        .eq('user_id', user.id)
        .order('execution_date', { ascending: false });

      if (planId) {
        query = query.eq('plan_id', planId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AutoInvestExecution[];
    },
    enabled: !!user?.id,
  });
};

export const useAutoInvestExecution = (executionId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['auto-invest-execution', executionId],
    queryFn: async () => {
      if (!executionId || !user?.id) return null;

      const { data: execution, error: execError } = await supabase
        .from('auto_invest_executions')
        .select('*')
        .eq('id', executionId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (execError) throw execError;
      if (!execution) return null;

      const { data: details, error: detailsError } = await supabase
        .from('auto_invest_execution_details')
        .select('*')
        .eq('execution_id', executionId);

      if (detailsError) throw detailsError;

      return {
        ...execution,
        details: details || [],
      } as AutoInvestExecution;
    },
    enabled: !!executionId && !!user?.id,
  });
};

export const useAutoInvestStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['auto-invest-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: plans } = await supabase
        .from('auto_invest_plans')
        .select('status, amount, frequency, total_invested, total_executions')
        .eq('user_id', user.id);

      if (!plans) return null;

      const activePlans = plans.filter(p => p.status === 'active');
      const monthlyAmount = activePlans.reduce((sum, p) => {
        const multiplier = p.frequency === 'weekly' ? 4 : 
          p.frequency === 'biweekly' ? 2 : 
          p.frequency === 'quarterly' ? 0.33 : 1;
        return sum + (p.amount * multiplier);
      }, 0);

      return {
        activePlans: activePlans.length,
        monthlyAmount,
        totalInvested: plans.reduce((sum, p) => sum + p.total_invested, 0),
        totalExecutions: plans.reduce((sum, p) => sum + p.total_executions, 0),
      };
    },
    enabled: !!user?.id,
  });
};

export const useCreateAutoInvestPlan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePlanInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Calculate next execution date
      const startDate = new Date(input.start_date);
      
      // Create plan
      const { data: plan, error: planError } = await supabase
        .from('auto_invest_plans')
        .insert({
          user_id: user.id,
          name: input.name,
          frequency: input.frequency,
          amount: input.amount,
          funding_source: input.funding_source,
          linked_account_id: input.linked_account_id || null,
          insufficient_funds_action: input.insufficient_funds_action,
          start_date: input.start_date,
          next_execution_date: input.start_date,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Create allocations
      const allocations = input.allocations.map(a => ({
        plan_id: plan.id,
        target_type: a.target_type,
        target_id: a.target_id || null,
        category: a.category || null,
        allocation_percent: a.allocation_percent,
      }));

      const { error: allocError } = await supabase
        .from('auto_invest_allocations')
        .insert(allocations);

      if (allocError) throw allocError;

      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-invest-plans'] });
      queryClient.invalidateQueries({ queryKey: ['auto-invest-stats'] });
      toast({
        title: 'Plan Created',
        description: 'Your auto-invest plan has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create auto-invest plan.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateAutoInvestPlan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, updates }: { planId: string; updates: Partial<AutoInvestPlan> }) => {
      const { error } = await supabase
        .from('auto_invest_plans')
        .update(updates)
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-invest-plans'] });
      queryClient.invalidateQueries({ queryKey: ['auto-invest-plan'] });
      queryClient.invalidateQueries({ queryKey: ['auto-invest-stats'] });
      toast({
        title: 'Plan Updated',
        description: 'Your auto-invest plan has been updated.',
      });
    },
  });
};

export const usePausePlan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, pauseUntil }: { planId: string; pauseUntil?: string }) => {
      const { error } = await supabase
        .from('auto_invest_plans')
        .update({
          status: 'paused',
          paused_at: new Date().toISOString(),
          pause_until: pauseUntil || null,
        })
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-invest-plans'] });
      queryClient.invalidateQueries({ queryKey: ['auto-invest-plan'] });
      queryClient.invalidateQueries({ queryKey: ['auto-invest-stats'] });
      toast({
        title: 'Plan Paused',
        description: 'Your auto-invest plan has been paused.',
      });
    },
  });
};

export const useResumePlan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      // Calculate next execution date
      const today = new Date();
      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + 1);

      const { error } = await supabase
        .from('auto_invest_plans')
        .update({
          status: 'active',
          paused_at: null,
          pause_until: null,
          next_execution_date: nextDate.toISOString().split('T')[0],
        })
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-invest-plans'] });
      queryClient.invalidateQueries({ queryKey: ['auto-invest-plan'] });
      queryClient.invalidateQueries({ queryKey: ['auto-invest-stats'] });
      toast({
        title: 'Plan Resumed',
        description: 'Your auto-invest plan is now active.',
      });
    },
  });
};

export const useCancelPlan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('auto_invest_plans')
        .update({ status: 'cancelled' })
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-invest-plans'] });
      queryClient.invalidateQueries({ queryKey: ['auto-invest-plan'] });
      queryClient.invalidateQueries({ queryKey: ['auto-invest-stats'] });
      toast({
        title: 'Plan Cancelled',
        description: 'Your auto-invest plan has been cancelled.',
      });
    },
  });
};

export const useDeletePlan = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('auto_invest_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auto-invest-plans'] });
      queryClient.invalidateQueries({ queryKey: ['auto-invest-stats'] });
      toast({
        title: 'Plan Deleted',
        description: 'Your auto-invest plan has been deleted.',
      });
    },
  });
};
