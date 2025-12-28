import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Listing {
  id: string;
  seller_id: string;
  item_type: 'property_token' | 'loan_token';
  item_id: string;
  token_quantity: number;
  price_per_token: number;
  total_price: number;
  min_purchase_quantity: number;
  status: 'active' | 'partially_filled' | 'filled' | 'cancelled' | 'expired';
  expires_at: string | null;
  filled_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface BuyOrder {
  id: string;
  buyer_id: string;
  item_type: 'property_token' | 'loan_token';
  item_id: string;
  token_quantity: number;
  max_price_per_token: number;
  status: 'active' | 'partially_filled' | 'filled' | 'cancelled' | 'expired';
  expires_at: string | null;
  filled_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Trade {
  id: string;
  listing_id: string | null;
  buy_order_id: string | null;
  seller_id: string;
  buyer_id: string;
  item_type: string;
  item_id: string;
  token_quantity: number;
  price_per_token: number;
  total_price: number;
  platform_fee: number;
  seller_receives: number;
  status: 'pending' | 'completed' | 'failed' | 'disputed';
  executed_at: string | null;
  created_at: string;
}

export function useListings(itemType?: string, itemId?: string) {
  return useQuery({
    queryKey: ['listings', itemType, itemId],
    queryFn: async () => {
      let query = supabase
        .from('listings')
        .select('*')
        .in('status', ['active', 'partially_filled'])
        .order('price_per_token', { ascending: true });

      if (itemType) query = query.eq('item_type', itemType);
      if (itemId) query = query.eq('item_id', itemId);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Listing[];
    },
  });
}

export function useMyListings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-listings', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Listing[];
    },
    enabled: !!user,
  });
}

export function useMyBuyOrders() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-buy-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('buy_orders')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as BuyOrder[];
    },
    enabled: !!user,
  });
}

export function useTrades() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['trades', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Trade[];
    },
    enabled: !!user,
  });
}

export function useOrderBook(itemType: string, itemId: string) {
  const { data: listings = [] } = useListings(itemType, itemId);
  
  const asks = listings
    .filter(l => l.status === 'active' || l.status === 'partially_filled')
    .map(l => ({
      price: l.price_per_token,
      quantity: l.token_quantity - l.filled_quantity,
      listingId: l.id,
    }))
    .sort((a, b) => a.price - b.price);

  const bestAsk = asks.length > 0 ? asks[0].price : null;
  const bestBid = null; // Simplified - would need buy orders for full order book

  return { asks, bids: [], bestAsk, bestBid, spread: bestAsk && bestBid ? bestAsk - bestBid : null };
}

export function useSecondaryMarket() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createListing = useMutation({
    mutationFn: async (params: {
      itemType: 'property_token' | 'loan_token';
      itemId: string;
      quantity: number;
      pricePerToken: number;
      minPurchase?: number;
      expiresAt?: string;
    }) => {
      const { data, error } = await supabase.rpc('create_listing', {
        p_item_type: params.itemType,
        p_item_id: params.itemId,
        p_quantity: params.quantity,
        p_price_per_token: params.pricePerToken,
        p_min_purchase: params.minPurchase || 1,
        p_expires_at: params.expiresAt || null,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string; listing_id?: string };
      if (!result.success) throw new Error(result.error || 'Failed to create listing');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-holdings'] });
      toast.success('Listing created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const cancelListing = useMutation({
    mutationFn: async (listingId: string) => {
      const { data, error } = await supabase.rpc('cancel_listing', {
        p_listing_id: listingId,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string };
      if (!result.success) throw new Error(result.error || 'Failed to cancel listing');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['user-holdings'] });
      toast.success('Listing cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const executeTrade = useMutation({
    mutationFn: async (params: { listingId: string; quantity: number }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.rpc('execute_market_trade', {
        p_listing_id: params.listingId,
        p_buyer_id: user.id,
        p_quantity: params.quantity,
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string; trade_id?: string; total_cost?: number };
      if (!result.success) throw new Error(result.error || 'Trade failed');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['user-holdings'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Trade executed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const createBuyOrder = useMutation({
    mutationFn: async (params: {
      itemType: 'property_token' | 'loan_token';
      itemId: string;
      quantity: number;
      maxPricePerToken: number;
      expiresAt?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('buy_orders')
        .insert({
          buyer_id: user.id,
          item_type: params.itemType,
          item_id: params.itemId,
          token_quantity: params.quantity,
          max_price_per_token: params.maxPricePerToken,
          expires_at: params.expiresAt || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-buy-orders'] });
      toast.success('Buy order created');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const cancelBuyOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('buy_orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-buy-orders'] });
      toast.success('Buy order cancelled');
    },
  });

  return {
    createListing,
    cancelListing,
    executeTrade,
    createBuyOrder,
    cancelBuyOrder,
  };
}

export function useMarketStats() {
  const { data: trades = [] } = useTrades();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTrades = trades.filter(t => new Date(t.created_at) >= today && t.status === 'completed');
  const volume24h = todayTrades.reduce((sum, t) => sum + t.total_price, 0);
  const tradeCount = todayTrades.length;
  
  return { volume24h, tradeCount };
}
