export interface FeeTier {
  min_months: number;
  max_months: number | null;
  fee_percent: number;
}

export interface LiquidityProgramSettings {
  id: string;
  offering_id: string;
  enabled: boolean;
  fee_tiers: FeeTier[];
  reserve_percent: number;
  reserve_balance: number;
  max_monthly_redemptions: number | null;
  min_holding_days: number;
  created_at: string;
  updated_at: string;
}

export interface LiquidityRequest {
  id: string;
  request_number: string;
  investor_id: string;
  offering_id: string;
  token_holding_id: string | null;
  property_id: string | null;
  quantity: number;
  token_value_at_request: number;
  holding_start_date: string;
  holding_period_days: number;
  fee_tier_applied: FeeTier;
  fee_percent_applied: number;
  gross_value: number;
  fee_amount: number;
  net_payout: number;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'denied' | 'cancelled';
  denial_reason: string | null;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  processed_at: string | null;
  completed_at: string | null;
  payout_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface SecondaryListing {
  id: string;
  listing_number: string;
  seller_id: string;
  offering_id: string;
  token_holding_id: string | null;
  property_id: string | null;
  quantity: number;
  price_per_token: number;
  original_token_price: number;
  price_change_percent: number;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
  listed_at: string;
  sold_at: string | null;
  buyer_id: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// Computed types for UI
export interface LiquidityCalculation {
  tokens: number;
  tokenValue: number;
  grossValue: number;
  holdingDays: number;
  holdingMonths: number;
  applicableTier: FeeTier;
  feePercent: number;
  feeAmount: number;
  netPayout: number;
}

export interface SecondaryMarketSummary {
  lowestAsk: number;
  highestAsk: number;
  averagePrice: number;
  totalListings: number;
  totalTokensListed: number;
}
