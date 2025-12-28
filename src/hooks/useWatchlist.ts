import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  user_id: string;
  item_type: 'property' | 'loan' | 'prediction';
  item_id: string;
  notes: string | null;
  target_price: number | null;
  added_price: number;
  position: number;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  item_type: 'property' | 'loan' | 'prediction';
  item_id: string;
  alert_type: 'price_above' | 'price_below' | 'price_change_percent' | 'apy_above' | 'apy_below' | 'funding_above' | 'odds_above' | 'odds_below';
  threshold_value: number;
  is_active: boolean;
  is_recurring: boolean;
  last_triggered_at: string | null;
  trigger_count: number;
  created_at: string;
}

export interface AlertHistory {
  id: string;
  alert_id: string;
  user_id: string;
  item_type: string;
  item_id: string;
  alert_type: string;
  threshold_value: number;
  actual_value: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useWatchlists() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: watchlists = [], isLoading } = useQuery({
    queryKey: ['watchlists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Watchlist[];
    },
    enabled: !!user,
  });

  const createWatchlist = useMutation({
    mutationFn: async ({ name, description, isDefault }: { name: string; description?: string; isDefault?: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      
      if (isDefault) {
        await supabase
          .from('watchlists')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }
      
      const { data, error } = await supabase
        .from('watchlists')
        .insert({
          user_id: user.id,
          name,
          description: description || null,
          is_default: isDefault || false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast({ title: 'Watchlist created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create watchlist', description: error.message, variant: 'destructive' });
    },
  });

  const updateWatchlist = useMutation({
    mutationFn: async ({ id, name, description, isDefault }: { id: string; name?: string; description?: string; isDefault?: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      
      if (isDefault) {
        await supabase
          .from('watchlists')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }
      
      const updates: Partial<Watchlist> = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (isDefault !== undefined) updates.is_default = isDefault;
      
      const { error } = await supabase
        .from('watchlists')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast({ title: 'Watchlist updated' });
    },
  });

  const deleteWatchlist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast({ title: 'Watchlist deleted' });
    },
  });

  const ensureDefaultWatchlist = async () => {
    if (!user) return null;
    const { data, error } = await supabase.rpc('ensure_default_watchlist', { p_user_id: user.id });
    if (error) throw error;
    queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    return data;
  };

  return {
    watchlists,
    isLoading,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    ensureDefaultWatchlist,
  };
}

export function useWatchlistItems(watchlistId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['watchlist-items', watchlistId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('watchlist_items')
        .select('*')
        .eq('user_id', user.id)
        .order('position', { ascending: true });
      
      if (watchlistId) {
        query = query.eq('watchlist_id', watchlistId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as WatchlistItem[];
    },
    enabled: !!user,
  });

  const addItem = useMutation({
    mutationFn: async ({
      watchlistId,
      itemType,
      itemId,
      addedPrice,
      notes,
      targetPrice,
    }: {
      watchlistId: string;
      itemType: 'property' | 'loan' | 'prediction';
      itemId: string;
      addedPrice: number;
      notes?: string;
      targetPrice?: number;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('watchlist_items')
        .insert({
          watchlist_id: watchlistId,
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
          added_price: addedPrice,
          notes: notes || null,
          target_price: targetPrice || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist-items'] });
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast({ title: 'Added to watchlist' });
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast({ title: 'Already in watchlist', variant: 'destructive' });
      } else {
        toast({ title: 'Failed to add', description: error.message, variant: 'destructive' });
      }
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, notes, targetPrice }: { id: string; notes?: string; targetPrice?: number | null }) => {
      const updates: Partial<WatchlistItem> = {};
      if (notes !== undefined) updates.notes = notes;
      if (targetPrice !== undefined) updates.target_price = targetPrice;
      
      const { error } = await supabase
        .from('watchlist_items')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist-items'] });
      toast({ title: 'Item updated' });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist-items'] });
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
      toast({ title: 'Removed from watchlist' });
    },
  });

  return {
    items,
    isLoading,
    addItem,
    updateItem,
    removeItem,
  };
}

export function useIsInWatchlist(itemType: 'property' | 'loan' | 'prediction', itemId: string) {
  const { user } = useAuth();

  const { data: isInWatchlist = false, isLoading } = useQuery({
    queryKey: ['is-in-watchlist', itemType, itemId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!itemId,
  });

  return { isInWatchlist, isLoading };
}

export function usePriceAlerts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['price-alerts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('price_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PriceAlert[];
    },
    enabled: !!user,
  });

  const createAlert = useMutation({
    mutationFn: async ({
      itemType,
      itemId,
      alertType,
      thresholdValue,
      isRecurring,
    }: {
      itemType: 'property' | 'loan' | 'prediction';
      itemId: string;
      alertType: PriceAlert['alert_type'];
      thresholdValue: number;
      isRecurring?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('price_alerts')
        .insert({
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
          alert_type: alertType,
          threshold_value: thresholdValue,
          is_recurring: isRecurring || false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      toast({ title: 'Alert created' });
    },
    onError: (error: Error) => {
      toast({ title: 'Failed to create alert', description: error.message, variant: 'destructive' });
    },
  });

  const updateAlert = useMutation({
    mutationFn: async ({ id, isActive, thresholdValue }: { id: string; isActive?: boolean; thresholdValue?: number }) => {
      const updates: Partial<PriceAlert> = {};
      if (isActive !== undefined) updates.is_active = isActive;
      if (thresholdValue !== undefined) updates.threshold_value = thresholdValue;
      
      const { error } = await supabase
        .from('price_alerts')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      toast({ title: 'Alert updated' });
    },
  });

  const deleteAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('price_alerts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['price-alerts'] });
      toast({ title: 'Alert deleted' });
    },
  });

  return {
    alerts,
    isLoading,
    createAlert,
    updateAlert,
    deleteAlert,
  };
}

export function useAlertHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ['alert-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('alert_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as AlertHistory[];
    },
    enabled: !!user,
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alert_history')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert-history'] });
    },
  });

  return {
    history,
    isLoading,
    markAsRead,
  };
}
