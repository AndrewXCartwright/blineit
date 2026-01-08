import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, MapPin, TrendingUp, TrendingDown, Users, Building2, Calendar, 
  Percent, DollarSign, BarChart3, FileText, Home, Heart, Share2, 
  ChevronRight, ExternalLink, ArrowUpRight, ArrowDownRight, MessageCircle,
  Droplets, Shield, ChevronDown, ChevronUp, Check, Info, ShoppingCart, Tag
} from "lucide-react";
import { usePropertyGroup } from "@/hooks/useMessageGroups";
import { Skeleton } from "@/components/Skeleton";
import { CountUp } from "@/components/CountUp";
import { Sparkline } from "@/components/Sparkline";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { TokenTradeModal } from "@/components/TokenTradeModal";
import { CommunityDiscussion } from "@/components/community";
import { SponsorCard } from "@/components/SponsorCard";
import { useLiquidityProgramSettings, useSecondaryListings, useSecondaryMarketSummary } from "@/hooks/useLiquidityProgram";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  value: number;
  apy: number;
  token_price: number;
  total_tokens: number;
  holders: number;
  occupancy: number;
  units: number;
  year_built: number | null;
  category: string;
  description: string | null;
  image_url?: string;
  is_hot: boolean;
  sponsor_id?: string | null;
  offering_id?: string | null;
  tokens_sold?: number;
}

interface SponsorData {
  id: string;
  companyName: string;
  isVerified: boolean;
  yearsInBusiness: number;
  totalDeals: number;
  averageRating: number;
  reviewCount: number;
  totalCapitalRaised: number;
  averageIrr: number;
  bio: string;
  logoUrl?: string | null;
}

interface UserHolding {
  tokens: number;
  average_buy_price: number;
}

interface PredictionMarket {
  id: string;
  question: string;
  yes_price: number;
  no_price: number;
  expires_at: string;
  volume: number;
}

interface RecentTrade {
  id: string;
  type: "buy" | "sell";
  amount: number;
  tokens: number;
  price: number;
  time: string;
}

type TabType = "overview" | "marketplace" | "financials" | "documents" | "activity";
type MarketplaceSubTab = "primary" | "secondary";

// Owner Chat Button Component
function OwnerChatButton({ propertyId, propertyName }: { propertyId: string; propertyName: string }) {
  const navigate = useNavigate();
  const { groupId, loading } = usePropertyGroup(propertyId);
  
  if (loading) return null;
  
  return (
    <button
      onClick={() => groupId && navigate(`/messages/groups/${groupId}`)}
      className="w-full py-3 rounded-xl bg-accent/20 border border-accent/30 text-accent font-display font-semibold flex items-center justify-center gap-2 hover:bg-accent/30 transition-colors"
      disabled={!groupId}
    >
      <MessageCircle className="w-5 h-5" />
      Owner Chat
      <span className="text-sm font-normal text-muted-foreground">• Join the discussion</span>
    </button>
  );
}

// Exit Options Modal Component
function ExitOptionsModal({ 
  isOpen, 
  onClose, 
  propertyId,
  hasLiquidity,
  onListSecondary,
  onRequestLiquidity
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  propertyId: string;
  hasLiquidity: boolean;
  onListSecondary: () => void;
  onRequestLiquidity: () => void;
}) {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Exit Options
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <button
            onClick={() => {
              onClose();
              navigate(`/portfolio/${propertyId}/list`);
            }}
            className="w-full p-4 rounded-xl border-2 border-border bg-secondary hover:bg-muted transition-colors text-left"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">List on Secondary Market</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Set your own price and sell to other investors. You control the terms.
                </p>
              </div>
            </div>
          </button>

          {hasLiquidity && (
            <button
              onClick={() => {
                onClose();
                navigate(`/portfolio/${propertyId}/liquidity`);
              }}
              className="w-full p-4 rounded-xl border-2 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Request Guaranteed Liquidity</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Instant exit at guaranteed buyback price. Small fee applies based on holding period.
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Liquidity Program Card Component
function LiquidityProgramCard({ 
  feeTiers, 
  isExpanded, 
  onToggle 
}: { 
  feeTiers: { min_months: number; max_months: number | null; fee_percent: number }[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-purple-500/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-blue-500/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20">
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-foreground">Guaranteed Liquidity Program</h4>
            <p className="text-sm text-muted-foreground">Exit anytime with guaranteed buyback</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Unlike traditional real estate investments, you're never locked in. Request instant liquidity anytime for a small fee.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {feeTiers.map((tier, index) => (
              <div key={index} className="text-center p-3 rounded-lg bg-background/50 border border-border">
                <p className="text-xs text-muted-foreground mb-1">
                  {tier.min_months}-{tier.max_months ? tier.max_months : '+'} mo
                </p>
                <p className="text-lg font-bold text-foreground">{tier.fee_percent}%</p>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-3.5 h-3.5" />
            <span>Fee decreases the longer you hold</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Investment Features Card Component
function InvestmentFeaturesCard({ hasLiquidity }: { hasLiquidity: boolean }) {
  const features = [
    "Monthly cash distributions",
    "Pro-rata ownership rights",
    "Full transparency & reporting",
    "Secondary market trading",
    ...(hasLiquidity ? ["Guaranteed liquidity option"] : []),
  ];

  return (
    <div className="glass-card rounded-xl p-4">
      <h4 className="font-semibold text-foreground mb-3">Investment Features</h4>
      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <Check className="w-4 h-4 text-success flex-shrink-0" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Secondary Listing Card Component
function SecondaryListingCard({ 
  listing, 
  primaryPrice,
  onBuy 
}: { 
  listing: { 
    id: string; 
    quantity: number; 
    price_per_token: number; 
    price_change_percent: number;
    listed_at: string;
    seller_id: string;
  };
  primaryPrice: number;
  onBuy: (listingId: string) => void;
}) {
  const savings = primaryPrice - listing.price_per_token;
  const savingsPercent = (savings / primaryPrice) * 100;

  // Anonymize seller ID
  const anonymizedSeller = listing.seller_id.substring(0, 1).toUpperCase() + "***" + listing.seller_id.substring(listing.seller_id.length - 1);

  return (
    <div className="p-4 rounded-xl bg-secondary border border-border">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-foreground">{listing.quantity} tokens</p>
          <p className="text-xs text-muted-foreground">Seller: {anonymizedSeller}</p>
        </div>
        <button
          onClick={() => onBuy(listing.id)}
          className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Buy
        </button>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-semibold text-foreground">${listing.price_per_token.toFixed(2)}</span>
          <span className="text-muted-foreground">/token</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className={listing.price_change_percent >= 0 ? "text-success" : "text-destructive"}>
            {listing.price_change_percent >= 0 ? "+" : ""}{listing.price_change_percent.toFixed(1)}%
          </span>
          <span>{formatDistanceToNow(new Date(listing.listed_at), { addSuffix: false })} ago</span>
        </div>
      </div>
      {savings > 0 && (
        <div className="mt-2 text-xs text-success">
          Save ${savings.toFixed(2)} ({savingsPercent.toFixed(1)}% below primary)
        </div>
      )}
    </div>
  );
}

export default function PropertyDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [sponsor, setSponsor] = useState<SponsorData | null>(null);
  const [holding, setHolding] = useState<UserHolding | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [marketplaceSubTab, setMarketplaceSubTab] = useState<MarketplaceSubTab>("primary");
  const [isFavorite, setIsFavorite] = useState(false);
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeModalMode, setTradeModalMode] = useState<"buy" | "sell">("buy");
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isLiquidityExpanded, setIsLiquidityExpanded] = useState(false);

  // Fetch liquidity program settings
  const offeringId = property?.offering_id || id;
  const { data: liquiditySettings } = useLiquidityProgramSettings(offeringId);
  const { data: secondaryListings = [] } = useSecondaryListings(offeringId);
  const marketSummary = useSecondaryMarketSummary(secondaryListings);

  const hasLiquidityProgram = liquiditySettings?.enabled ?? false;
  const feeTiers = liquiditySettings?.fee_tiers || [
    { min_months: 0, max_months: 12, fee_percent: 10 },
    { min_months: 12, max_months: 24, fee_percent: 7 },
    { min_months: 24, max_months: 36, fee_percent: 5 },
    { min_months: 36, max_months: null, fee_percent: 3 },
  ];

  // Mock price history data
  const priceHistory = [118, 119, 120, 119.5, 121, 122, 120.5, 123, 124, 124.5, 123.8, 124.5];
  
  // Mock recent trades
  const recentTrades: RecentTrade[] = [
    { id: "1", type: "buy", amount: 1250, tokens: 10, price: 125, time: "2 min ago" },
    { id: "2", type: "sell", amount: 2480, tokens: 20, price: 124, time: "15 min ago" },
    { id: "3", type: "buy", amount: 620, tokens: 5, price: 124, time: "1 hour ago" },
    { id: "4", type: "buy", amount: 3720, tokens: 30, price: 124, time: "2 hours ago" },
    { id: "5", type: "sell", amount: 1240, tokens: 10, price: 124, time: "4 hours ago" },
  ];

  const fetchData = useCallback(async () => {
    if (!id) return;

    // Fetch property
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      setProperty(data);
      
      // Fetch sponsor data if property has sponsor_id
      if (data.sponsor_id) {
        const { data: sponsorData } = await supabase
          .from("sponsor_profiles")
          .select("*")
          .eq("id", data.sponsor_id)
          .single();
        
        if (sponsorData) {
          // Get review count separately
          const { count } = await supabase
            .from("sponsor_reviews")
            .select("*", { count: 'exact', head: true })
            .eq("sponsor_id", data.sponsor_id);
          
          setSponsor({
            id: sponsorData.id,
            companyName: sponsorData.company_name,
            isVerified: sponsorData.verification_status === 'verified',
            yearsInBusiness: sponsorData.years_in_business || 0,
            totalDeals: sponsorData.deals_completed || 0,
            averageRating: 4.5,
            reviewCount: count || 0,
            totalCapitalRaised: sponsorData.total_assets_managed || 0,
            averageIrr: sponsorData.average_irr || 0,
            bio: sponsorData.bio || '',
            logoUrl: sponsorData.company_logo_url,
          });
        }
      }
    }

    // Fetch user holdings
    if (user) {
      const { data: holdingData } = await supabase
        .from("user_holdings")
        .select("tokens, average_buy_price")
        .eq("property_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (holdingData) {
        setHolding(holdingData);
      } else {
        setHolding(null);
      }
    }

    // Fetch related prediction markets
    const { data: marketsData } = await supabase
      .from("prediction_markets")
      .select("*")
      .eq("property_id", id)
      .eq("is_resolved", false)
      .limit(3);

    if (marketsData) {
      setMarkets(marketsData);
    }

    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenBuyModal = () => {
    setTradeModalMode("buy");
    setIsTradeModalOpen(true);
  };

  const handleOpenSellModal = () => {
    if (holding && holding.tokens > 0) {
      setIsExitModalOpen(true);
    } else {
      setTradeModalMode("sell");
      setIsTradeModalOpen(true);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: property?.name,
        text: `Check out ${property?.name} on SquareFoot`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Property link copied to clipboard",
      });
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Property removed from your watchlist" : "Property added to your watchlist",
    });
  };

  const handleBuySecondaryListing = (listingId: string) => {
    navigate(`/market/${id}?listing=${listingId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <div className="h-56 w-full">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 rounded-xl" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{t('property.notFound')}</p>
          <button
            onClick={() => navigate("/explore")}
            className="text-primary hover:underline"
          >
            {t('property.backToExplore')}
          </button>
        </div>
      </div>
    );
  }

  const priceChange = 5.2; // Mock 30-day price change
  const holdingValue = holding ? holding.tokens * property.token_price : 0;
  const holdingCost = holding ? holding.tokens * holding.average_buy_price : 0;
  const holdingProfit = holdingValue - holdingCost;
  const holdingPnL = holding 
    ? ((property.token_price - holding.average_buy_price) / holding.average_buy_price) * 100 
    : 0;

  // Mock financials
  const annualIncome = Math.round(property.value * 0.08);
  const annualExpenses = Math.round(annualIncome * 0.35);
  const noi = annualIncome - annualExpenses;

  // Primary offering data
  const tokensSold = property.tokens_sold || Math.round(property.total_tokens * 0.72);
  const tokensAvailable = property.total_tokens - tokensSold;
  const fundingProgress = (tokensSold / property.total_tokens) * 100;
  const fundingGoal = property.total_tokens * property.token_price;
  const fundingRaised = tokensSold * property.token_price;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Image */}
      <div className="h-64 relative overflow-hidden">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={`${property.name} property photo`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 gradient-primary flex items-center justify-center">
            <Building2 className="w-24 h-24 text-primary-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full glass-card hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleFavorite}
              className={`p-2.5 rounded-full glass-card hover:bg-secondary/80 transition-colors ${
                isFavorite ? "text-destructive" : "text-foreground"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full glass-card hover:bg-secondary/80 transition-colors"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Badges - Bottom right of hero */}
        <div className="absolute bottom-20 right-4 flex flex-col gap-2 z-10">
          <span className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
            <Droplets className="w-4 h-4" />
            Liquidity Guaranteed
          </span>
          {property.is_hot && (
            <span className="flex items-center gap-1 bg-accent/90 text-accent-foreground px-3 py-1.5 rounded-full text-sm font-semibold">
              🔥 {t('property.hotProperty')}
            </span>
          )}
        </div>
      </div>

      <main className="px-4 -mt-12 relative z-10 space-y-5">
        {/* Property Header */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
              {property.name}
            </h1>
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold whitespace-nowrap">
              {property.category}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{property.address}, {property.city}, {property.state}</span>
          </div>
        </div>

        {/* Token Price Card */}
        <div className="glass-card rounded-2xl p-5 border-2 border-primary/40 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('property.tokenPrice')}</p>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold text-foreground">
                  $<CountUp end={property.token_price} decimals={2} />
                </span>
                <span className={`flex items-center gap-1 text-sm font-semibold ${
                  priceChange >= 0 ? "text-success" : "text-destructive"
                }`}>
                  {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {priceChange >= 0 ? "+" : ""}{priceChange}% {t('property.priceChange30d')}
                </span>
              </div>
            </div>
            <div className="w-24">
              <Sparkline data={priceHistory} width={96} height={40} />
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard icon={<DollarSign className="w-4 h-4" />} label={t('property.totalValue')} value={`$${(property.value / 1000000).toFixed(1)}M`} />
          <MetricCard icon={<Percent className="w-4 h-4" />} label={t('property.apy')} value={`${property.apy}%`} highlight="success" />
          <MetricCard icon={<Users className="w-4 h-4" />} label={t('property.tokenHolders')} value={property.holders.toLocaleString()} />
          <MetricCard icon={<BarChart3 className="w-4 h-4" />} label={t('property.occupancy')} value={`${property.occupancy}%`} />
          <MetricCard icon={<Building2 className="w-4 h-4" />} label={t('property.units')} value={property.units.toString()} />
          <MetricCard icon={<Calendar className="w-4 h-4" />} label={t('property.yearBuilt')} value={property.year_built?.toString() || "N/A"} />
        </div>

        {/* Your Position Card */}
        {holding && (
          <div className="glass-card rounded-2xl p-5 border-2 border-accent/40 animate-fade-in">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-accent" />
              {t('property.yourPosition')}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t('property.tokensOwned')}</p>
                <p className="font-display font-bold text-xl text-foreground">
                  <CountUp end={holding.tokens} />
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t('property.avgCost')}</p>
                <p className="font-display font-bold text-xl text-foreground">
                  ${holding.average_buy_price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t('property.currentValue')}</p>
                <p className="font-display font-bold text-xl text-foreground">
                  ${holdingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{t('property.profit')}</p>
                <p className={`font-display font-bold text-xl flex items-center gap-1 ${
                  holdingPnL >= 0 ? "text-success" : "text-destructive"
                }`}>
                  {holdingPnL >= 0 ? "+" : ""}{`$${Math.abs(holdingProfit).toLocaleString()}`}
                  <span className="text-sm font-semibold">
                    ({holdingPnL >= 0 ? "+" : ""}{holdingPnL.toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meet the Sponsor */}
        {sponsor && (
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Meet the Sponsor
            </h3>
            <SponsorCard 
              sponsor={sponsor}
              propertyName={property.name}
              dealId={id}
              hasInvested={!!holding}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={handleOpenBuyModal}
            className="flex-1 py-4 rounded-xl gradient-primary text-primary-foreground font-display font-bold text-lg transition-all hover:opacity-90 glow-primary"
          >
            {t('property.buyTokens')}
          </button>
          <button 
            onClick={handleOpenSellModal}
            className="flex-1 py-4 rounded-xl bg-secondary border-2 border-border text-foreground font-display font-bold text-lg transition-all hover:bg-muted"
          >
            {t('property.sell')}
          </button>
        </div>

        {/* Owner Chat Button */}
        {holding && (
          <OwnerChatButton propertyId={id!} propertyName={property?.name || ''} />
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {(["overview", "marketplace", "financials", "documents", "activity"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "marketplace" ? "Marketplace" : t(`property.${tab}`)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-display font-semibold text-foreground">{t('property.aboutProperty')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mt-2">
                  {property.description || 
                    `${property.name} is a premium ${property.category.toLowerCase()} property located in the heart of ${property.city}, ${property.state}. Built in ${property.year_built || "N/A"}, this property features ${property.units} units with an exceptional occupancy rate of ${property.occupancy}%. The property offers an attractive ${property.apy}% APY for token holders, making it an ideal investment opportunity for those seeking steady rental income and long-term appreciation.`}
                </p>
              </div>
              
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">{t('property.keyHighlights')}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t('property.totalMarketValue')}: ${property.value.toLocaleString()}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t('property.totalTokens')}: {property.total_tokens.toLocaleString()}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t('property.currentTokenHolders')}: {property.holders.toLocaleString()}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {t('property.professionallyManaged')}
                  </li>
                  {hasLiquidityProgram && (
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Guaranteed liquidity program available
                    </li>
                  )}
                  {secondaryListings.length > 0 && (
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                      Active secondary market ({secondaryListings.length} listings)
                    </li>
                  )}
                </ul>
              </div>

              {/* Guaranteed Liquidity Program Card */}
              <LiquidityProgramCard
                feeTiers={feeTiers}
                isExpanded={isLiquidityExpanded}
                onToggle={() => setIsLiquidityExpanded(!isLiquidityExpanded)}
              />

              {/* Investment Features Card */}
              <InvestmentFeaturesCard hasLiquidity={true} />
            </div>
          )}

          {activeTab === "marketplace" && (
            <div className="space-y-5">
              {/* Sub-tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMarketplaceSubTab("primary")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    marketplaceSubTab === "primary"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Primary Offering
                </button>
                <button
                  onClick={() => setMarketplaceSubTab("secondary")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    marketplaceSubTab === "secondary"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Secondary Market
                  {secondaryListings.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full bg-success/20 text-success text-xs">
                      {secondaryListings.length}
                    </span>
                  )}
                </button>
              </div>

              {marketplaceSubTab === "primary" && (
                <div className="space-y-4">
                  {/* Funding Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-semibold text-foreground">{fundingProgress.toFixed(0)}%</span>
                    </div>
                    <Progress value={fundingProgress} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${fundingRaised.toLocaleString()} raised</span>
                      <span>${fundingGoal.toLocaleString()} goal</span>
                    </div>
                  </div>

                  {/* Token Availability */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Available</p>
                      <p className="font-bold text-success">{tokensAvailable.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary text-center">
                      <p className="text-xs text-muted-foreground mb-1">Token Price</p>
                      <p className="font-bold text-foreground">${property.token_price.toFixed(2)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary text-center">
                      <p className="text-xs text-muted-foreground mb-1">Total Tokens</p>
                      <p className="font-bold text-foreground">{property.total_tokens.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Buy CTA */}
                  <button
                    onClick={handleOpenBuyModal}
                    className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                  >
                    Buy Tokens
                  </button>
                </div>
              )}

              {marketplaceSubTab === "secondary" && (
                <div className="space-y-4">
                  {secondaryListings.length > 0 ? (
                    <>
                      {/* Market Summary */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Lowest Ask</p>
                          <p className="font-bold text-success">${marketSummary.lowestAsk.toFixed(2)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-secondary text-center">
                          <p className="text-xs text-muted-foreground mb-1">Avg Price</p>
                          <p className="font-bold text-foreground">${marketSummary.averagePrice.toFixed(2)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Highest Ask</p>
                          <p className="font-bold text-destructive">${marketSummary.highestAsk.toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Price Comparison */}
                      {marketSummary.lowestAsk < property.token_price && (
                        <div className="p-4 rounded-xl border-2 border-success/40 bg-success/5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Primary Price</p>
                              <p className="font-semibold text-foreground">${property.token_price.toFixed(2)}</p>
                            </div>
                            <div className="text-2xl">→</div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Best Secondary</p>
                              <p className="font-bold text-success">${marketSummary.lowestAsk.toFixed(2)}</p>
                            </div>
                          </div>
                          <p className="text-sm text-success mt-2">
                            Save ${(property.token_price - marketSummary.lowestAsk).toFixed(2)} per token!
                          </p>
                        </div>
                      )}

                      {/* Listings */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-foreground">
                          Available Listings ({secondaryListings.length})
                        </h4>
                        {secondaryListings.map((listing) => (
                          <SecondaryListingCard
                            key={listing.id}
                            listing={listing}
                            primaryPrice={property.token_price}
                            onBuy={handleBuySecondaryListing}
                          />
                        ))}
                      </div>

                      {/* Liquidity Floor Note */}
                      {hasLiquidityProgram && (
                        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                          <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-foreground">Liquidity Floor</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Can't find a buyer? Use Guaranteed Liquidity to exit at ${(property.token_price * 0.9).toFixed(2)}-${property.token_price.toFixed(2)}/token
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-2">No secondary listings available</p>
                      <p className="text-sm text-muted-foreground">
                        Be the first to list your tokens for sale
                      </p>
                      {holding && holding.tokens > 0 && (
                        <button
                          onClick={() => navigate(`/portfolio/${id}/list`)}
                          className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                        >
                          List Your Tokens
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "financials" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">{t('property.financialOverview')}</h3>
              <div className="space-y-3">
                <FinancialRow label={t('property.annualRentalIncome')} value={`$${annualIncome.toLocaleString()}`} />
                <FinancialRow label={t('property.operatingExpenses')} value={`-$${annualExpenses.toLocaleString()}`} negative />
                <div className="border-t border-border pt-3">
                  <FinancialRow label={t('property.netOperatingIncome')} value={`$${noi.toLocaleString()}`} highlight />
                </div>
                <div className="border-t border-border pt-3 space-y-3">
                  <FinancialRow label={t('property.propertyValue')} value={`$${property.value.toLocaleString()}`} />
                  <FinancialRow label={t('property.tokenPrice')} value={`$${property.token_price.toFixed(2)}`} />
                  <FinancialRow label={t('property.marketCap')} value={`$${(property.token_price * property.total_tokens).toLocaleString()}`} />
                  <FinancialRow label={t('property.annualYield')} value={`${property.apy}%`} success />
                  <FinancialRow label={t('property.occupancyRate')} value={`${property.occupancy}%`} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">{t('common.documents')}</h3>
              <div className="space-y-2">
                {[
                  { name: t('property.propertyDeed'), type: "PDF" },
                  { name: t('property.financialStatements'), type: "PDF" },
                  { name: t('property.inspectionReport'), type: "PDF" },
                  { name: t('property.insuranceCertificate'), type: "PDF" },
                  { name: t('property.offeringMemorandum'), type: "PDF" },
                ].map((doc) => (
                  <button
                    key={doc.name}
                    className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary hover:bg-muted transition-colors text-left group"
                  >
                    <div className="p-2 rounded-lg bg-primary/20">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="text-foreground font-medium">{doc.name}</span>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">{t('property.recentTrades')}</h3>
              <div className="space-y-2">
                {recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
                  >
                    <div className={`p-2 rounded-lg ${
                      trade.type === "buy" ? "bg-success/20" : "bg-destructive/20"
                    }`}>
                      {trade.type === "buy" ? (
                        <ArrowUpRight className="w-4 h-4 text-success" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {trade.type === "buy" ? t('property.bought') : t('property.sold')} {trade.tokens} {t('property.tokens')}
                      </p>
                      <p className="text-xs text-muted-foreground">{trade.time}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        trade.type === "buy" ? "text-success" : "text-destructive"
                      }`}>
                        {trade.type === "buy" ? "+" : "-"}${trade.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">@${trade.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Predictions */}
        {markets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">🎯 {t('property.relatedPredictions')}</h3>
              <Link to="/predict" className="text-sm text-primary font-medium flex items-center gap-1">
                {t('common.viewAll')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {markets.map((market) => (
                <Link
                  key={market.id}
                  to="/predict"
                  className="glass-card rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors block"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{market.question}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="text-bull font-semibold">{t('predictions.yes')}: {market.yes_price}¢</span>
                      <span className="text-bear font-semibold">{t('predictions.no')}: {market.no_price}¢</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg gradient-gold text-accent-foreground text-sm font-semibold whitespace-nowrap">
                    {t('property.betNow')} →
                  </button>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Community Discussion */}
        <div className="mt-8 pt-8 border-t border-border">
          <CommunityDiscussion propertyId={id} />
        </div>
      </main>

      {/* Trade Modal */}
      {property && (
        <TokenTradeModal
          isOpen={isTradeModalOpen}
          onClose={() => setIsTradeModalOpen(false)}
          propertyId={property.id}
          propertyName={property.name}
          tokenPrice={property.token_price}
          initialMode={tradeModalMode}
          userTokens={holding?.tokens || 0}
          onSuccess={fetchData}
        />
      )}

      {/* Exit Options Modal */}
      <ExitOptionsModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        propertyId={id!}
        hasLiquidity={hasLiquidityProgram}
        onListSecondary={() => navigate(`/portfolio/${id}/list`)}
        onRequestLiquidity={() => navigate(`/portfolio/${id}/liquidity`)}
      />
    </div>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  highlight 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  highlight?: "success" | "accent";
}) {
  return (
    <div className={`glass-card rounded-xl p-3 text-center animate-fade-in ${
      highlight === "success" ? "border-success/30" : highlight === "accent" ? "border-accent/30" : ""
    }`}>
      <div className={`mx-auto mb-1.5 ${
        highlight === "success" ? "text-success" : highlight === "accent" ? "text-accent" : "text-primary"
      }`}>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`font-display font-bold text-sm ${
        highlight === "success" ? "text-success" : "text-foreground"
      }`}>{value}</p>
    </div>
  );
}

function FinancialRow({ 
  label, 
  value, 
  negative = false,
  highlight = false,
  success = false,
}: { 
  label: string; 
  value: string; 
  negative?: boolean;
  highlight?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className={`text-sm ${highlight ? "text-foreground font-medium" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span className={`font-semibold text-sm ${
        negative ? "text-destructive" : 
        success ? "text-success" : 
        highlight ? "text-foreground" : 
        "text-foreground"
      }`}>
        {value}
      </span>
    </div>
  );
}
