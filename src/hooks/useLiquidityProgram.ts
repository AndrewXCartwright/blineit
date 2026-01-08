import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  LiquidityProgramSettings, 
  SecondaryListing, 
  FeeTier,
  SecondaryMarketSummary 
} from '@/types/liquidity';
import { getDefaultFeeTiers } from '@/utils/liquidity-calculations';

export function useLiquidityProgramSettings(offeringId: string | undefined) {
  return useQuery({
    queryKey: ['liquidity-program-settings', offeringId],
    queryFn: async (): Promise<LiquidityProgramSettings | null> => {
      if (!offeringId) return null;
      
      const { data, error } = await supabase
        .from('liquidity_program_settings')
        .select('*')
        .eq('offering_id', offeringId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching liquidity settings:', error);
        return null;
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        offering_id: data.offering_id,
        enabled: data.enabled ?? true,
        fee_tiers: (data.fee_tiers as unknown as FeeTier[]) || getDefaultFeeTiers(),
        reserve_percent: Number(data.reserve_percent) || 5,
        reserve_balance: Number(data.reserve_balance) || 0,
        max_monthly_redemptions: data.max_monthly_redemptions,
        min_holding_days: data.min_holding_days ?? 30,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    },
    enabled: !!offeringId,
  });
}

export function useSecondaryListings(offeringId: string | undefined) {
  return useQuery({
    queryKey: ['secondary-listings', offeringId],
    queryFn: async (): Promise<SecondaryListing[]> => {
      if (!offeringId) return [];
      
      const { data, error } = await supabase
        .from('secondary_listings')
        .select('*')
        .eq('offering_id', offeringId)
        .eq('status', 'active')
        .order('price_per_token', { ascending: true });
      
      if (error) {
        console.error('Error fetching secondary listings:', error);
        return [];
      }
      
      return (data || []).map(listing => ({
        id: listing.id,
        listing_number: listing.listing_number || '',
        seller_id: listing.seller_id,
        offering_id: listing.offering_id,
        token_holding_id: listing.token_holding_id,
        property_id: listing.property_id,
        quantity: listing.quantity,
        price_per_token: Number(listing.price_per_token),
        original_token_price: Number(listing.original_token_price),
        price_change_percent: Number(listing.price_change_percent),
        status: listing.status as SecondaryListing['status'],
        listed_at: listing.listed_at,
        sold_at: listing.sold_at,
        buyer_id: listing.buyer_id,
        expires_at: listing.expires_at,
        created_at: listing.created_at,
        updated_at: listing.updated_at,
      }));
    },
    enabled: !!offeringId,
  });
}

export function useSecondaryMarketSummary(listings: SecondaryListing[]): SecondaryMarketSummary {
  if (!listings || listings.length === 0) {
    return {
      lowestAsk: 0,
      highestAsk: 0,
      averagePrice: 0,
      totalListings: 0,
      totalTokensListed: 0,
    };
  }
  
  const prices = listings.map(l => l.price_per_token);
  const totalTokens = listings.reduce((sum, l) => sum + l.quantity, 0);
  const totalValue = listings.reduce((sum, l) => sum + (l.quantity * l.price_per_token), 0);
  
  return {
    lowestAsk: Math.min(...prices),
    highestAsk: Math.max(...prices),
    averagePrice: totalTokens > 0 ? totalValue / totalTokens : 0,
    totalListings: listings.length,
    totalTokensListed: totalTokens,
  };
}
