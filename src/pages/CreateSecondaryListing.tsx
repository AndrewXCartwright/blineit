import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, MapPin, Minus, Plus, DollarSign, TrendingUp, 
  TrendingDown, Clock, Check, AlertCircle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  calculateLiquidityPayout, 
  getDefaultFeeTiers,
  calculateHoldingPeriod
} from "@/utils/liquidity-calculations";
import { useSecondaryListings, useLiquidityProgramSettings } from "@/hooks/useLiquidityProgram";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { FeeTier } from "@/types/liquidity";

// Sample holding data for demo
const sampleHolding = {
  id: 'holding-1',
  offeringId: 'sample-1',
  propertyName: 'Sunbelt Tax Lien Fund - Arizona Portfolio',
  location: 'Phoenix, AZ',
  tokens: 50,
  listedTokens: 0, // tokens already listed
  tokenValue: 100,
  acquiredDate: new Date(Date.now() - 14 * 30 * 24 * 60 * 60 * 1000), // 14 months ago
};

type SubmitStep = 'form' | 'submitting' | 'success' | 'error';

interface SubmissionResult {
  listingNumber: string;
  tokens: number;
  pricePerToken: number;
  totalValue: number;
}

export default function CreateSecondaryListing() {
  const { holdingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const holding = sampleHolding;
  const availableTokens = holding.tokens - holding.listedTokens;
  
  const [tokenQuantity, setTokenQuantity] = useState(1);
  const [pricePerToken, setPricePerToken] = useState(holding.tokenValue);
  const [submitStep, setSubmitStep] = useState<SubmitStep>('form');
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Fetch market data
  const { data: secondaryListings = [] } = useSecondaryListings(holding.offeringId);
  const { data: liquiditySettings } = useLiquidityProgramSettings(holding.offeringId);
  
  const feeTiers = (liquiditySettings?.fee_tiers || getDefaultFeeTiers()) as FeeTier[];
  const holdingPeriod = calculateHoldingPeriod(holding.acquiredDate);
  
  // Calculate market stats
  const activeListings = secondaryListings.filter(l => l.status === 'active');
  const sortedByPrice = [...activeListings].sort((a, b) => a.price_per_token - b.price_per_token);
  const lowestAsk = sortedByPrice.length > 0 ? sortedByPrice[0].price_per_token : null;
  const highestAsk = sortedByPrice.length > 0 ? sortedByPrice[sortedByPrice.length - 1].price_per_token : null;
  const avgPrice = activeListings.length > 0 
    ? activeListings.reduce((sum, l) => sum + l.price_per_token, 0) / activeListings.length
    : holding.tokenValue;
  
  // Suggested price range
  const suggestedMin = Math.round((lowestAsk || holding.tokenValue * 0.98) * 100) / 100;
  const suggestedMax = Math.round((highestAsk || holding.tokenValue * 1.05) * 100) / 100;
  
  // Calculate listing value
  const totalListingValue = tokenQuantity * pricePerToken;
  const platformFeePercent = 1; // 1% platform fee
  const platformFee = totalListingValue * (platformFeePercent / 100);
  const netAfterFee = totalListingValue - platformFee;
  
  // Calculate guaranteed liquidity comparison
  const liquidityCalc = useMemo(() => {
    return calculateLiquidityPayout(
      tokenQuantity, 
      holding.tokenValue, 
      holdingPeriod.months, 
      feeTiers
    );
  }, [tokenQuantity, holding.tokenValue, holdingPeriod.months, feeTiers]);
  
  const differenceFromLiquidity = netAfterFee - liquidityCalc.netPayout;
  
  // Price position analysis
  const pricePosition = useMemo(() => {
    if (!lowestAsk || !highestAsk) return 'market';
    if (pricePerToken < lowestAsk) return 'lowest';
    if (pricePerToken <= avgPrice) return 'below-avg';
    if (pricePerToken <= highestAsk) return 'above-avg';
    return 'highest';
  }, [pricePerToken, lowestAsk, highestAsk, avgPrice]);
  
  // Estimated days to sell
  const estimatedDays = useMemo(() => {
    switch (pricePosition) {
      case 'lowest': return '3-7';
      case 'below-avg': return '5-15';
      case 'market': return '5-15';
      case 'above-avg': return '15-30';
      case 'highest': return '30+';
      default: return '5-15';
    }
  }, [pricePosition]);
  
  const handleTokenChange = (delta: number) => {
    const newValue = Math.max(1, Math.min(availableTokens, tokenQuantity + delta));
    setTokenQuantity(newValue);
  };
  
  const handleTokenInputChange = (value: string) => {
    const num = parseInt(value) || 0;
    setTokenQuantity(Math.max(1, Math.min(availableTokens, num)));
  };
  
  const handlePriceChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setPricePerToken(Math.max(0.01, num));
  };
  
  const handleSubmit = async () => {
    if (tokenQuantity < 1 || tokenQuantity > availableTokens) {
      setErrorMessage('Invalid token quantity.');
      setSubmitStep('error');
      return;
    }
    
    if (pricePerToken < 1) {
      setErrorMessage('Price per token must be at least $1.00.');
      setSubmitStep('error');
      return;
    }
    
    setSubmitStep('submitting');
    
    try {
      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock listing number
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const listingNumber = `SEC-${year}-${randomNum}`;
      
      setSubmissionResult({
        listingNumber,
        tokens: tokenQuantity,
        pricePerToken,
        totalValue: totalListingValue,
      });
      setSubmitStep('success');
      
      toast.success('Listing created successfully!');
    } catch (error) {
      console.error('Error creating listing:', error);
      setErrorMessage('An error occurred while creating your listing. Please try again.');
      setSubmitStep('error');
    }
  };
  
  // Success Screen
  if (submitStep === 'success' && submissionResult) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-4">
            <h1 className="text-lg font-semibold text-foreground text-center">Listing Created</h1>
          </div>
        </header>
        
        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Listing Created!</h2>
            <p className="text-muted-foreground">
              Your tokens are now listed on the Secondary Market.
            </p>
          </div>
          
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Listing ID</span>
                <span className="font-mono font-medium text-foreground">#{submissionResult.listingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens Listed</span>
                <span className="font-medium text-foreground">{submissionResult.tokens}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asking Price</span>
                <span className="font-medium text-foreground">${submissionResult.pricePerToken.toFixed(2)}/token</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-bold text-green-500">${submissionResult.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/market/orders')} 
              className="w-full bg-primary hover:bg-primary/90"
            >
              View My Listings
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/assets')}
              className="w-full"
            >
              Back to Portfolio
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Error Screen
  if (submitStep === 'error') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-slate-900 border-b border-border">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            <button onClick={() => setSubmitStep('form')} className="p-1">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Listing Failed</h1>
          </div>
        </header>
        
        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Unable to Create Listing</h2>
            <p className="text-muted-foreground">{errorMessage}</p>
          </div>
          
          <Button 
            onClick={() => setSubmitStep('form')} 
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  // Main Form
  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-10 bg-slate-900 border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">List on Secondary Market</h1>
        </div>
      </header>
      
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Step 1: Property Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-foreground mb-1">{holding.propertyName}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
              <MapPin className="w-3 h-3" />
              {holding.location}
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available to List</span>
              <span className="font-medium text-green-500">{availableTokens} tokens</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Step 2: Listing Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Listing Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quantity Input */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tokens to List</label>
              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleTokenChange(-1)}
                  disabled={tokenQuantity <= 1}
                  className="h-10 w-10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={tokenQuantity}
                  onChange={(e) => handleTokenInputChange(e.target.value)}
                  className="w-20 text-center text-xl font-bold h-10"
                  min={1}
                  max={availableTokens}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleTokenChange(1)}
                  disabled={tokenQuantity >= availableTokens}
                  className="h-10 w-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-1">
                Max: {availableTokens} tokens
              </p>
            </div>
            
            {/* Price Input */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Price per Token</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  value={pricePerToken}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="pl-8 text-lg font-semibold"
                  step={0.5}
                  min={1}
                />
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Original price:</span>
                  <span className="text-foreground">${holding.tokenValue.toFixed(2)}</span>
                </div>
                {lowestAsk && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current lowest ask:</span>
                    <span className="text-green-500">${lowestAsk.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Suggested range:</span>
                  <span className="text-foreground">${suggestedMin.toFixed(0)} - ${suggestedMax.toFixed(0)}</span>
                </div>
              </div>
            </div>
            
            {/* Price Position Visual */}
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Your Price Position</span>
                <Badge variant={pricePosition === 'lowest' || pricePosition === 'below-avg' ? 'default' : 'secondary'}>
                  {pricePosition === 'lowest' && 'Lowest'}
                  {pricePosition === 'below-avg' && 'Below Avg'}
                  {pricePosition === 'market' && 'At Market'}
                  {pricePosition === 'above-avg' && 'Above Avg'}
                  {pricePosition === 'highest' && 'Highest'}
                </Badge>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`absolute h-full rounded-full transition-all ${
                    pricePosition === 'lowest' || pricePosition === 'below-avg' 
                      ? 'bg-green-500' 
                      : pricePosition === 'above-avg' || pricePosition === 'highest'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                  }`}
                  style={{ 
                    width: `${Math.min(100, Math.max(10, ((pricePerToken - (lowestAsk || 95)) / ((highestAsk || 105) - (lowestAsk || 95))) * 100))}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>${lowestAsk?.toFixed(0) || '95'}</span>
                <span>${highestAsk?.toFixed(0) || '105'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Step 3: Listing Summary */}
        <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-green-300">Listing Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tokens</span>
              <span className="text-foreground">{tokenQuantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per Token</span>
              <span className="text-foreground">${pricePerToken.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Listing Value</span>
              <span className="font-medium text-foreground">${totalListingValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee ({platformFeePercent}%)</span>
              <span className="text-red-400">-${platformFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-green-500/30 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-medium text-foreground">You Receive</span>
                <span className="text-lg font-bold text-green-500">
                  ${netAfterFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            {/* Comparison with Guaranteed Liquidity */}
            <div className="bg-background/50 rounded-lg p-3 mt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">vs. Guaranteed Liquidity:</span>
                <span className="text-muted-foreground">${liquidityCalc.netPayout.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Difference:</span>
                <span className={`font-medium flex items-center gap-1 ${differenceFromLiquidity >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                  {differenceFromLiquidity >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {differenceFromLiquidity >= 0 ? '+' : ''}${differenceFromLiquidity.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Step 4: Expected Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Expected Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Estimated time to sell:</span>
              <Badge variant="outline" className="text-foreground">
                ~{estimatedDays} days
              </Badge>
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">At or below market:</span>
                <span className="text-green-500">~5-15 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Above market:</span>
                <span className="text-amber-500">15-30+ days</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>Lower prices typically sell faster. You can adjust your price anytime.</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="max-w-lg mx-auto space-y-2">
          <Button 
            onClick={handleSubmit}
            disabled={submitStep === 'submitting' || tokenQuantity < 1}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
          >
            {submitStep === 'submitting' ? (
              'Creating Listing...'
            ) : (
              `List Tokens for Sale`
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            You can cancel or modify your listing anytime
          </p>
        </div>
      </div>
    </div>
  );
}
