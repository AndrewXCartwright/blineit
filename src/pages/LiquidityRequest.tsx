import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Minus, Plus, Shield, AlertCircle, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  calculateLiquidityPayout, 
  getApplicableFeeTier, 
  calculateHoldingPeriod,
  getDefaultFeeTiers,
  canRedeemTokens,
  daysUntilEligible
} from "@/utils/liquidity-calculations";
import { useLiquidityProgramSettings, useSecondaryListings } from "@/hooks/useLiquidityProgram";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { FeeTier } from "@/types/liquidity";
import { addBusinessDays, format } from "date-fns";
import { useLiquidityNotifications } from "@/hooks/useLiquidityNotifications";

// Sample holding data for demo
const sampleHolding = {
  id: 'holding-1',
  offeringId: 'sample-1',
  propertyName: 'Sunbelt Tax Lien Fund - Arizona Portfolio',
  location: 'Phoenix, AZ',
  tokens: 50,
  tokenValue: 100,
  acquiredDate: new Date(Date.now() - 14 * 30 * 24 * 60 * 60 * 1000), // 14 months ago
  minHoldingDays: 30,
};

type SubmitStep = 'form' | 'submitting' | 'success' | 'error';

interface SubmissionResult {
  requestNumber: string;
  tokens: number;
  netPayout: number;
  estimatedCompletion: Date;
}

export default function LiquidityRequest() {
  const { holdingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifyRequestSubmitted, notifyAdminNewRequest, showToast } = useLiquidityNotifications();
  
  const [tokenQuantity, setTokenQuantity] = useState(1);
  const [submitStep, setSubmitStep] = useState<SubmitStep>('form');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Use sample data for demo
  const holding = sampleHolding;
  
  // Fetch liquidity settings and secondary listings
  const { data: liquiditySettings } = useLiquidityProgramSettings(holding.offeringId);
  const { data: secondaryListings = [] } = useSecondaryListings(holding.offeringId);
  
  const feeTiers = (liquiditySettings?.fee_tiers || getDefaultFeeTiers()) as FeeTier[];
  const minHoldingDays = liquiditySettings?.min_holding_days || holding.minHoldingDays;
  
  // Calculate holding period
  const holdingPeriod = calculateHoldingPeriod(holding.acquiredDate);
  const isEligible = canRedeemTokens(holdingPeriod.days, minHoldingDays);
  const daysRemaining = daysUntilEligible(holdingPeriod.days, minHoldingDays);
  
  // Calculate payout based on current selection
  const payoutCalc = useMemo(() => {
    return calculateLiquidityPayout(
      tokenQuantity, 
      holding.tokenValue, 
      holdingPeriod.months, 
      feeTiers
    );
  }, [tokenQuantity, holding.tokenValue, holdingPeriod.months, feeTiers]);
  
  // Get current fee tier
  const currentTier = getApplicableFeeTier(holdingPeriod.months, feeTiers);
  
  // Get best secondary market ask
  const sortedListings = [...secondaryListings].sort((a, b) => a.price_per_token - b.price_per_token);
  const bestSecondaryAsk = sortedListings.length > 0 ? sortedListings[0].price_per_token : null;
  
  // Check if secondary is better value
  const liquidityValuePerToken = payoutCalc.netPayout / tokenQuantity;
  const secondaryIsBetter = bestSecondaryAsk !== null && bestSecondaryAsk > liquidityValuePerToken;
  
  const handleTokenChange = (delta: number) => {
    const newValue = Math.max(1, Math.min(holding.tokens, tokenQuantity + delta));
    setTokenQuantity(newValue);
  };
  
  const handleInputChange = (value: string) => {
    const num = parseInt(value) || 0;
    setTokenQuantity(Math.max(1, Math.min(holding.tokens, num)));
  };
  
  const handleSubmit = async () => {
    if (!isEligible) {
      setErrorMessage(`You must hold tokens for at least ${minHoldingDays} days before requesting liquidity.`);
      setSubmitStep('error');
      return;
    }
    
    // Check reserve balance (mock check for demo)
    const reserveBalance = liquiditySettings?.reserve_balance || 50000;
    if (payoutCalc.netPayout > reserveBalance) {
      setErrorMessage('Liquidity reserves are temporarily low. Please try again later or list on Secondary Market.');
      setSubmitStep('error');
      return;
    }
    
    setSubmitStep('submitting');
    
    try {
      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock request number
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const requestNumber = `LIQ-${year}-${randomNum}`;
      
      const estimatedCompletion = addBusinessDays(new Date(), 5);
      
      // Create mock request for notifications
      const mockRequest = {
        id: `request-${randomNum}`,
        request_number: requestNumber,
        investor_id: user?.id,
        offering_id: holding.offeringId,
        quantity: tokenQuantity,
        gross_value: payoutCalc.grossValue,
        fee_amount: payoutCalc.feeAmount,
        net_payout: payoutCalc.netPayout,
        status: 'pending' as const,
      };
      
      // Send notifications (fire and forget for demo)
      const investorEmail = user?.email || 'investor@example.com';
      notifyRequestSubmitted(mockRequest, investorEmail, holding.propertyName, user?.user_metadata?.full_name);
      notifyAdminNewRequest(
        mockRequest, 
        investorEmail, 
        user?.user_metadata?.full_name || 'Investor',
        holding.propertyName, 
        ['admin@blineit.com'] // In real app, fetch admin emails from DB
      );
      
      setSubmissionResult({
        requestNumber,
        tokens: tokenQuantity,
        netPayout: payoutCalc.netPayout,
        estimatedCompletion,
      });
      setSubmitStep('success');
      
      showToast('success', 'Liquidity request submitted!', 'You will receive email confirmation shortly.');
    } catch (error) {
      console.error('Error submitting liquidity request:', error);
      setErrorMessage('An error occurred while submitting your request. Please try again.');
      setSubmitStep('error');
    }
  };
  
  // Success Screen
  if (submitStep === 'success' && submissionResult) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-4">
            <h1 className="text-lg font-semibold text-foreground text-center">Request Submitted</h1>
          </div>
        </header>
        
        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
          {/* Success Icon */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Request Submitted!</h2>
            <p className="text-muted-foreground">
              Your liquidity request has been received and is being processed.
            </p>
          </div>
          
          {/* Summary Card */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Request ID</span>
                <span className="font-mono font-medium text-foreground">#{submissionResult.requestNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens Redeemed</span>
                <span className="font-medium text-foreground">{submissionResult.tokens}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount to Receive</span>
                <span className="font-bold text-green-500">${submissionResult.netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Completion</span>
                <span className="font-medium text-foreground">{format(submissionResult.estimatedCompletion, 'MMM d, yyyy')}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/assets')} 
              className="w-full bg-primary hover:bg-primary/90"
            >
              Back to Portfolio
            </Button>
            <button 
              onClick={() => navigate('/portfolio/analytics')}
              className="w-full text-center text-sm text-primary hover:underline"
            >
              View Request Status →
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Error Screen
  if (submitStep === 'error') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => setSubmitStep('form')} className="p-1">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Request Failed</h1>
          </div>
        </header>
        
        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Unable to Process</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={() => setSubmitStep('form')} 
              className="w-full"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(`/portfolio/${holdingId}/sell`)}
              className="w-full"
            >
              List on Secondary Market
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main Form
  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Request Liquidity</h1>
        </div>
      </header>
      
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Step 1: Property Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-1">{holding.propertyName}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {holding.location}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Token Value: <span className="text-foreground font-medium">${holding.tokenValue.toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>
        
        {/* Step 2: Token Selection */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Number of Tokens to Redeem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleTokenChange(-1)}
                disabled={tokenQuantity <= 1}
                className="h-12 w-12"
              >
                <Minus className="w-5 h-5" />
              </Button>
              <Input
                type="number"
                value={tokenQuantity}
                onChange={(e) => handleInputChange(e.target.value)}
                className="w-24 text-center text-2xl font-bold h-12"
                min={1}
                max={holding.tokens}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => handleTokenChange(1)}
                disabled={tokenQuantity >= holding.tokens}
                className="h-12 w-12"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Max: {holding.tokens} tokens
            </p>
          </CardContent>
        </Card>
        
        {/* Step 3: Redemption Summary */}
        <Card className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-blue-300">Redemption Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Token Value</span>
              <span className="text-foreground">{tokenQuantity} × ${holding.tokenValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Value</span>
              <span className="text-foreground">${payoutCalc.grossValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Liquidity Fee ({payoutCalc.feePercent}%)</span>
              <span className="text-red-400">-${payoutCalc.feeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-blue-500/30 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-medium text-foreground">You Receive</span>
                <span className="text-xl font-bold text-green-500">
                  ${payoutCalc.netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Step 4: Smart Nudge (conditional) */}
        {secondaryIsBetter && bestSecondaryAsk && (
          <Card className="bg-amber-900/20 border-amber-500/30">
            <CardContent className="p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">
                Consider listing on Secondary Market at ${bestSecondaryAsk.toFixed(2)}/token for potentially higher returns. Average sale time: 5-15 days.
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Step 5: Processing Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Processing Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <div className="w-0.5 h-8 bg-border" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Request Submitted</p>
                  <p className="text-sm text-muted-foreground">Instant confirmation</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                  <div className="w-0.5 h-8 bg-border" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Token Transfer</p>
                  <p className="text-sm text-muted-foreground">1-2 business days</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Funds Deposited</p>
                  <p className="text-sm text-muted-foreground">3-5 business days total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Fee Schedule Card */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              Liquidity Fee Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-4 gap-2">
              {feeTiers.map((tier, idx) => {
                const isCurrentTier = tier.min_months === currentTier.min_months;
                return (
                  <div 
                    key={idx} 
                    className={`rounded-lg p-2 text-center ${
                      isCurrentTier 
                        ? 'bg-blue-500/20 border border-blue-500/50' 
                        : 'bg-background/50'
                    }`}
                  >
                    <p className="text-xs text-muted-foreground mb-1">
                      {tier.min_months}-{tier.max_months || '∞'} mo
                    </p>
                    <p className={`text-lg font-bold ${isCurrentTier ? 'text-blue-400' : 'text-foreground'}`}>
                      {tier.fee_percent}%
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Your holding: {holdingPeriod.months} months
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto space-y-2">
          <Button 
            onClick={handleSubmit}
            disabled={!isEligible || submitStep === 'submitting'}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
          >
            {submitStep === 'submitting' ? (
              'Processing...'
            ) : !isEligible ? (
              `Available in ${daysRemaining} days`
            ) : (
              `Confirm Redemption • $${payoutCalc.netPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By confirming, you agree to the Liquidity Program terms
          </p>
        </div>
      </div>
    </div>
  );
}
