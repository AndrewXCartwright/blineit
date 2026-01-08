import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, Building2, Landmark, Shield, TrendingUp, ChevronDown, ChevronUp, 
  Info, ArrowUp, ArrowDown, Check
} from 'lucide-react';
import { useLiquidityProgramSettings, useSecondaryListings, useSecondaryMarketSummary } from '@/hooks/useLiquidityProgram';
import { getDefaultFeeTiers, calculateLiquidityPayout } from '@/utils/liquidity-calculations';
import { useIsMobile } from '@/hooks/use-mobile';
import type { HoldingWithDetails } from './HoldingsTable';

interface HoldingDetailPanelProps {
  holding: HoldingWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HoldingDetailPanel = ({ holding, isOpen, onClose }: HoldingDetailPanelProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isFeeScheduleExpanded, setIsFeeScheduleExpanded] = useState(false);
  
  const { data: liquiditySettings } = useLiquidityProgramSettings(holding?.offeringId);
  const { data: secondaryListings = [] } = useSecondaryListings(holding?.offeringId);
  const marketSummary = useSecondaryMarketSummary(secondaryListings);

  if (!holding) return null;

  const hasLiquidity = liquiditySettings?.enabled ?? true;
  const feeTiers = liquiditySettings?.fee_tiers || getDefaultFeeTiers();
  
  // Calculate holding period
  const holdingStartDate = holding.holdingStartDate ? new Date(holding.holdingStartDate) : new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const holdingDays = Math.floor((Date.now() - holdingStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const holdingMonths = Math.floor(holdingDays / 30);
  
  // Calculate values
  const tokens = holding.tokens || 100;
  const tokenPrice = holding.tokenPrice || (holding.currentValue / tokens);
  const costBasisPerToken = holding.costBasis / tokens;
  
  // Calculate liquidity payout
  const liquidityCalc = calculateLiquidityPayout(tokens, tokenPrice, holdingMonths, feeTiers);
  
  // Get current fee tier
  const currentTier = feeTiers.find(tier => 
    holdingMonths >= tier.min_months && 
    (tier.max_months === null || holdingMonths < tier.max_months)
  ) || feeTiers[0];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleListSecondary = () => {
    onClose();
    navigate(`/portfolio/${holding.id}/list`);
  };

  const handleRequestLiquidity = () => {
    onClose();
    navigate(`/portfolio/${holding.id}/liquidity`);
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">{holding.name}</h2>
          <Badge variant="secondary" className="mt-1">
            {holding.type === 'property' ? 'Equity' : 'Debt'}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-24">
        {/* Your Position Card */}
        <div className="p-4 rounded-xl bg-secondary border border-border">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">YOUR POSITION</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Tokens Owned</p>
              <p className="font-semibold text-foreground">{tokens.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cost Basis</p>
              <p className="font-semibold text-foreground">{formatCurrency(costBasisPerToken)}/token</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Value</p>
              <p className="font-semibold text-foreground">{formatCurrency(tokenPrice)}/token</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="font-semibold text-foreground">{formatCurrency(holding.currentValue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unrealized P&L</p>
              <p className={`font-semibold ${holding.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)} ({holding.pnlPercent.toFixed(1)}%)
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Holding Period</p>
              <p className="font-semibold text-foreground">{holdingMonths} months</p>
            </div>
          </div>
        </div>

        {/* Price Comparison Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">PRICE COMPARISON</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Token Face Value</span>
              <span className="font-medium text-foreground">{formatCurrency(100)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Market Value</span>
              <span className="font-medium text-foreground">{formatCurrency(tokenPrice)}</span>
            </div>
            {marketSummary.totalListings > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Secondary Market Ask</span>
                <span className="font-medium text-foreground flex items-center gap-1">
                  {formatCurrency(marketSummary.lowestAsk)}
                  {marketSummary.lowestAsk > tokenPrice ? (
                    <ArrowUp className="h-3 w-3 text-success" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-destructive" />
                  )}
                </span>
              </div>
            )}
            {hasLiquidity && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Guaranteed Liquidity</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(tokenPrice * (1 - currentTier.fee_percent / 100))}
                  <span className="text-xs text-muted-foreground ml-1">(after {currentTier.fee_percent}% fee)</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Exit Options Card */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">EXIT OPTIONS</h3>
          
          {/* Secondary Market Option */}
          <button
            onClick={handleListSecondary}
            className="w-full p-4 rounded-xl bg-secondary border-2 border-border hover:border-success/50 hover:bg-secondary/80 transition-all text-left"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">List on Secondary Market</h4>
                <p className="text-sm text-muted-foreground mt-0.5">Set your own price</p>
                <p className="text-xs text-muted-foreground mt-1">Est. 5-30 days to sell</p>
                {marketSummary.totalListings > 0 && (
                  <p className="text-xs text-success mt-1">
                    Current lowest ask: {formatCurrency(marketSummary.lowestAsk)}
                  </p>
                )}
              </div>
            </div>
          </button>

          {/* Guaranteed Liquidity Option */}
          {hasLiquidity && (
            <button
              onClick={handleRequestLiquidity}
              className="w-full p-4 rounded-xl bg-blue-500/10 border-2 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/20 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Guaranteed Liquidity</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">Instant buyback</p>
                  <p className="text-xs text-muted-foreground mt-1">Funds in 3-5 business days</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Current fee: {currentTier.fee_percent}% ({formatCurrency(liquidityCalc.feeAmount)})
                  </p>
                  <p className="text-sm font-semibold text-success mt-1">
                    You receive: {formatCurrency(liquidityCalc.netPayout)}
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Fee Schedule Card */}
        {hasLiquidity && (
          <div className="rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setIsFeeScheduleExpanded(!isFeeScheduleExpanded)}
              className="w-full p-4 flex items-center justify-between bg-secondary hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium text-muted-foreground">LIQUIDITY FEE SCHEDULE</span>
              {isFeeScheduleExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {isFeeScheduleExpanded && (
              <div className="p-4 pt-0 bg-secondary">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  {feeTiers.map((tier, index) => {
                    const isCurrentTier = tier.min_months === currentTier.min_months;
                    return (
                      <div 
                        key={index}
                        className={`text-center p-3 rounded-lg border ${
                          isCurrentTier 
                            ? 'bg-blue-500/20 border-blue-500/40' 
                            : 'bg-background/50 border-border'
                        }`}
                      >
                        <p className="text-xs text-muted-foreground mb-1">
                          {tier.min_months}-{tier.max_months ? tier.max_months : '+'} mo
                        </p>
                        <p className="text-lg font-bold text-foreground">{tier.fee_percent}%</p>
                        {isCurrentTier && (
                          <p className="text-xs text-blue-500 mt-1">Current</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Info className="w-3.5 h-3.5" />
                  <span>Your holding: {holdingMonths} months ({currentTier.fee_percent}% tier)</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Actions - Sticky */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-success text-success hover:bg-success/10"
            onClick={handleListSecondary}
          >
            List on Secondary
          </Button>
          {hasLiquidity && (
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleRequestLiquidity}
            >
              Request Liquidity
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-full h-full max-h-full rounded-none p-4">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg p-4 overflow-hidden">
        {content}
      </SheetContent>
    </Sheet>
  );
};
