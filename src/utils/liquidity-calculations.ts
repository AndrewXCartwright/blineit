import type { FeeTier, LiquidityCalculation } from '@/types/liquidity';

/**
 * Calculate the holding period from a start date to now
 */
export function calculateHoldingPeriod(startDate: Date): { days: number; months: number } {
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  
  return { days, months };
}

/**
 * Get the applicable fee tier based on holding period in months
 */
export function getApplicableFeeTier(holdingMonths: number, tiers: FeeTier[]): FeeTier {
  // Sort tiers by min_months ascending to ensure correct matching
  const sortedTiers = [...tiers].sort((a, b) => a.min_months - b.min_months);
  
  for (const tier of sortedTiers) {
    const minMatch = holdingMonths >= tier.min_months;
    const maxMatch = tier.max_months === null || holdingMonths < tier.max_months;
    
    if (minMatch && maxMatch) {
      return tier;
    }
  }
  
  // Fallback to the last tier (should have max_months: null)
  return sortedTiers[sortedTiers.length - 1];
}

/**
 * Calculate the full liquidity payout details
 */
export function calculateLiquidityPayout(
  tokens: number,
  tokenValue: number,
  holdingMonths: number,
  tiers: FeeTier[]
): LiquidityCalculation {
  const applicableTier = getApplicableFeeTier(holdingMonths, tiers);
  const grossValue = tokens * tokenValue;
  const feePercent = applicableTier.fee_percent;
  const feeAmount = grossValue * (feePercent / 100);
  const netPayout = grossValue - feeAmount;
  
  return {
    tokens,
    tokenValue,
    grossValue,
    holdingDays: holdingMonths * 30, // Approximate
    holdingMonths,
    applicableTier,
    feePercent,
    feeAmount,
    netPayout,
  };
}

/**
 * Calculate the percentage change between current and original price
 */
export function calculatePriceChangePercent(currentPrice: number, originalPrice: number): number {
  if (originalPrice === 0) return 0;
  return ((currentPrice - originalPrice) / originalPrice) * 100;
}

/**
 * Format currency for display
 */
export function formatLiquidityCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatLiquidityPercent(percent: number): string {
  return `${percent.toFixed(1)}%`;
}

/**
 * Get default fee tiers
 */
export function getDefaultFeeTiers(): FeeTier[] {
  return [
    { min_months: 0, max_months: 12, fee_percent: 10 },
    { min_months: 12, max_months: 24, fee_percent: 7 },
    { min_months: 24, max_months: 36, fee_percent: 5 },
    { min_months: 36, max_months: null, fee_percent: 3 },
  ];
}

/**
 * Validate that tokens can be redeemed based on holding period
 */
export function canRedeemTokens(holdingDays: number, minHoldingDays: number): boolean {
  return holdingDays >= minHoldingDays;
}

/**
 * Calculate days until eligible for liquidity
 */
export function daysUntilEligible(holdingDays: number, minHoldingDays: number): number {
  return Math.max(0, minHoldingDays - holdingDays);
}
