import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Share2, Heart, MapPin, TrendingUp, Clock, DollarSign, 
  Shield, Droplets, ChevronDown, Check, Users, ArrowUp, ArrowDown,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useLiquidityProgramSettings, useSecondaryListings, useSecondaryMarketSummary } from "@/hooks/useLiquidityProgram";
import { calculateLiquidityPayout, getDefaultFeeTiers } from "@/utils/liquidity-calculations";
import { formatDistanceToNow } from "date-fns";

// Sample offering data for demo
const sampleOffering = {
  id: 'sample-1',
  name: 'Sunbelt Tax Lien Fund - Arizona Portfolio',
  location: 'Phoenix, AZ',
  propertyType: 'Tax Lien Portfolio',
  image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=400&fit=crop',
  targetApy: 12,
  holdPeriod: '6-36 months',
  minInvestment: 500,
  tokenPrice: 100,
  tokensAvailable: 1400,
  totalTokens: 4000,
  fundedAmount: 260000,
  goalAmount: 400000,
  status: 'open',
  liquidityEnabled: true,
};

// Sample secondary listings for demo
interface SampleListing {
  id: string;
  quantity: number;
  price_per_token: number;
  original_token_price: number;
  listed_at: string;
  seller_id: string;
}

const sampleSecondaryListings: SampleListing[] = [
  { id: '1', quantity: 25, price_per_token: 99.50, original_token_price: 100, listed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), seller_id: 'J' },
  { id: '2', quantity: 50, price_per_token: 98.00, original_token_price: 100, listed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), seller_id: 'M' },
  { id: '3', quantity: 10, price_per_token: 101.50, original_token_price: 100, listed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), seller_id: 'S' },
  { id: '4', quantity: 75, price_per_token: 97.50, original_token_price: 100, listed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), seller_id: 'A' },
];

export default function InvestmentDetail() {
  const { offeringId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary');
  const [liquidityExpanded, setLiquidityExpanded] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Fetch real data (falls back to sample if not found)
  const { data: liquiditySettings } = useLiquidityProgramSettings(offeringId);
  const { data: secondaryListings = [] } = useSecondaryListings(offeringId);
  
  // Use sample data for demo - normalize to common shape
  const offering = sampleOffering;
  const listings: SampleListing[] = secondaryListings.length > 0 
    ? secondaryListings.map(l => ({
        id: l.id,
        quantity: l.quantity,
        price_per_token: l.price_per_token,
        original_token_price: l.original_token_price,
        listed_at: l.listed_at,
        seller_id: l.seller_id,
      }))
    : sampleSecondaryListings;
  const feeTiers = liquiditySettings?.fee_tiers || getDefaultFeeTiers();
  
  // Calculate market summary
  const sortedByPrice = [...listings].sort((a, b) => a.price_per_token - b.price_per_token);
  const lowestAsk = sortedByPrice.length > 0 ? sortedByPrice[0].price_per_token : 0;
  const highestAsk = sortedByPrice.length > 0 ? sortedByPrice[sortedByPrice.length - 1].price_per_token : 0;
  const totalTokensListed = listings.reduce((sum, l) => sum + l.quantity, 0);
  const avgPrice = listings.reduce((sum, l) => sum + (l.quantity * l.price_per_token), 0) / (totalTokensListed || 1);
  
  const fundedPercent = (offering.fundedAmount / offering.goalAmount) * 100;
  const tokens = Math.floor(investmentAmount / offering.tokenPrice);
  
  // Calculate projected return
  const projectedReturn = investmentAmount * (offering.targetApy / 100) * 1.5; // 18 months
  const projectedTotal = investmentAmount + projectedReturn;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Image with Overlay */}
      <div className="relative h-56 md:h-72">
        <img 
          src={offering.image} 
          alt={offering.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            <button className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
            </button>
          </div>
        </div>
        
        {/* Badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          {offering.status === 'open' && (
            <Badge className="bg-green-500/90 text-white border-0">
              Open for Investment
            </Badge>
          )}
          {offering.liquidityEnabled && (
            <Badge className="bg-blue-500/90 text-white border-0 flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              Liquidity Guaranteed
            </Badge>
          )}
        </div>
      </div>
      
      {/* Property Info */}
      <div className="px-4 -mt-2">
        <h1 className="text-xl font-bold text-foreground mb-1">{offering.name}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {offering.location}
          </span>
          <span>{offering.propertyType}</span>
        </div>
        
        {/* Key Metrics */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <Card className="flex-shrink-0 min-w-[120px]">
            <CardContent className="p-3 text-center">
              <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-500">{offering.targetApy}%</p>
              <p className="text-xs text-muted-foreground">Target APY</p>
            </CardContent>
          </Card>
          <Card className="flex-shrink-0 min-w-[120px]">
            <CardContent className="p-3 text-center">
              <Clock className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{offering.holdPeriod}</p>
              <p className="text-xs text-muted-foreground">Hold Period</p>
            </CardContent>
          </Card>
          <Card className="flex-shrink-0 min-w-[120px]">
            <CardContent className="p-3 text-center">
              <DollarSign className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">${offering.minInvestment}</p>
              <p className="text-xs text-muted-foreground">Minimum</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-4 mt-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'primary' | 'secondary')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="primary">Primary Offering</TabsTrigger>
            <TabsTrigger value="secondary" className="flex items-center gap-2">
              Secondary Market
              {listings.length > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  {listings.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Primary Offering Tab */}
          <TabsContent value="primary" className="space-y-4 mt-4">
            {/* Funding Progress */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Funding Progress</span>
                  <span className="text-sm font-semibold text-foreground">{fundedPercent.toFixed(0)}%</span>
                </div>
                <Progress value={fundedPercent} className="h-2 mb-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-foreground font-medium">${(offering.fundedAmount / 1000).toFixed(0)}K raised</span>
                  <span className="text-muted-foreground">${(offering.goalAmount / 1000).toFixed(0)}K goal</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Token Details */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Token Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token Price</span>
                  <span className="font-medium">${offering.tokenPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tokens Available</span>
                  <span className="font-medium text-green-500">{offering.tokensAvailable.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Tokens</span>
                  <span className="font-medium">{offering.totalTokens.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Guaranteed Liquidity Program */}
            <Collapsible open={liquidityExpanded} onOpenChange={setLiquidityExpanded}>
              <Card className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border-blue-500/30">
                <CollapsibleTrigger className="w-full">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-500/20">
                        <Shield className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-foreground">Guaranteed Liquidity Program</h3>
                        <p className="text-sm text-muted-foreground">Exit anytime with guaranteed buyback</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${liquidityExpanded ? 'rotate-180' : ''}`} />
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 px-4 pb-4 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Unlike traditional real estate investments, you're never locked in. Request instant liquidity anytime for a small fee.
                    </p>
                    
                    {/* Fee Tiers Grid */}
                    <div className="grid grid-cols-4 gap-2">
                      {feeTiers.map((tier, idx) => (
                        <div key={idx} className="bg-background/50 rounded-lg p-2 text-center">
                          <p className="text-xs text-muted-foreground mb-1">
                            {tier.min_months}-{tier.max_months || '∞'} mo
                          </p>
                          <p className="text-lg font-bold text-blue-400">{tier.fee_percent}%</p>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Fee decreases the longer you hold
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
            
            {/* Investment Features */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Investment Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  'Monthly cash distributions',
                  'Pro-rata ownership rights',
                  'Full transparency & reporting',
                  'Secondary market trading',
                  'Guaranteed liquidity option',
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Investment Calculator */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Investment Calculator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Investment Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(Number(e.target.value) || 0)}
                      className="pl-8"
                      min={offering.minInvestment}
                      step={100}
                    />
                  </div>
                </div>
                
                <div className="bg-secondary/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tokens</span>
                    <span className="font-medium">{tokens}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Projected Return (18 mo)</span>
                    <span className="font-medium text-green-500">+${projectedReturn.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                    <span className="text-foreground font-medium">Projected Total</span>
                    <span className="font-bold text-foreground">${projectedTotal.toFixed(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Secondary Market Tab */}
          <TabsContent value="secondary" className="space-y-4 mt-4">
            {/* Market Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-500">${lowestAsk.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Lowest Ask</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">${avgPrice.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Average</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">${highestAsk.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Highest Ask</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Total Listed: {totalTokensListed} tokens
                </p>
              </CardContent>
            </Card>
            
            {/* Price Comparison */}
            {lowestAsk > 0 && (
              <Card className={`border ${lowestAsk < offering.tokenPrice ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-green-500/30' : 'bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Primary Price</p>
                      <p className="text-lg font-bold">${offering.tokenPrice.toFixed(2)}</p>
                    </div>
                    <div className="px-4 text-muted-foreground">vs</div>
                    <div className="text-center flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Best Secondary</p>
                      <p className={`text-lg font-bold ${lowestAsk < offering.tokenPrice ? 'text-green-400' : 'text-amber-400'}`}>
                        ${lowestAsk.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm text-center mt-3 ${lowestAsk < offering.tokenPrice ? 'text-green-400' : 'text-amber-400'}`}>
                    {lowestAsk < offering.tokenPrice 
                      ? `Save $${(offering.tokenPrice - lowestAsk).toFixed(2)}/token buying secondary!`
                      : `Premium of $${(lowestAsk - offering.tokenPrice).toFixed(2)}/token over primary`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
            
            {/* Available Listings */}
            <div>
              <h3 className="font-semibold mb-3">Available Listings</h3>
              <div className="space-y-2">
              {sortedByPrice.map((listing) => {
                  const price = listing.price_per_token;
                  const originalPrice = listing.original_token_price;
                  const daysAgo = Math.floor((Date.now() - new Date(listing.listed_at).getTime()) / (1000 * 60 * 60 * 24));
                  const sellerInitial = listing.seller_id.charAt(0).toUpperCase();
                  const priceChange = ((price - originalPrice) / originalPrice) * 100;
                  
                  return (
                    <Card key={listing.id} className="hover:bg-secondary/30 transition-colors cursor-pointer">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                            <Users className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{listing.quantity} tokens</p>
                            <p className="text-xs text-muted-foreground">
                              Seller: {sellerInitial}***n • {daysAgo}d ago
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${price.toFixed(2)}</p>
                          <p className={`text-xs flex items-center justify-end gap-0.5 ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {priceChange >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {Math.abs(priceChange).toFixed(1)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            
            {/* Liquidity Floor Note */}
            <Card className="bg-blue-900/20 border-blue-500/30">
              <CardContent className="p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">Liquidity Floor</p>
                  <p className="text-sm text-muted-foreground">
                    Can't find a buyer? Use Guaranteed Liquidity to exit at $90-97/token depending on hold period.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-sm border-t border-border">
        {activeTab === 'primary' ? (
          <Button 
            className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold py-6"
            disabled={investmentAmount < offering.minInvestment}
          >
            Invest Now • From ${offering.minInvestment}
          </Button>
        ) : (
          <Button 
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-600/90 hover:to-emerald-600/90 text-white font-semibold py-6"
            disabled={listings.length === 0}
          >
            Buy from Secondary Market
          </Button>
        )}
      </div>
    </div>
  );
}
