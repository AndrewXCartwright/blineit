import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, MapPin, TrendingUp, TrendingDown, Users, Building2, Calendar, 
  Percent, DollarSign, BarChart3, FileText, Home, Heart, Share2, 
  ChevronRight, ExternalLink, ArrowUpRight, ArrowDownRight 
} from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { CountUp } from "@/components/CountUp";
import { Sparkline } from "@/components/Sparkline";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { TokenTradeModal } from "@/components/TokenTradeModal";

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
  is_hot: boolean;
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

type TabType = "overview" | "financials" | "documents" | "activity";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [holding, setHolding] = useState<UserHolding | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeModalMode, setTradeModalMode] = useState<"buy" | "sell">("buy");

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
    setTradeModalMode("sell");
    setIsTradeModalOpen(true);
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
          <p className="text-muted-foreground mb-4">Property not found</p>
          <button
            onClick={() => navigate("/explore")}
            className="text-primary hover:underline"
          >
            Back to Explore
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

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Image */}
      <div className="h-64 relative overflow-hidden">
        {/* Gradient background with building icon */}
        <div className="absolute inset-0 gradient-primary flex items-center justify-center">
          <Building2 className="w-24 h-24 text-primary-foreground/30" />
        </div>
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

        {property.is_hot && (
          <span className="absolute bottom-20 right-4 flex items-center gap-1 bg-accent/90 text-accent-foreground px-3 py-1.5 rounded-full text-sm font-semibold z-10">
            🔥 Hot Property
          </span>
        )}
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
              <p className="text-xs text-muted-foreground mb-1">Token Price</p>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-4xl font-bold text-foreground">
                  $<CountUp end={property.token_price} decimals={2} />
                </span>
                <span className={`flex items-center gap-1 text-sm font-semibold ${
                  priceChange >= 0 ? "text-success" : "text-destructive"
                }`}>
                  {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {priceChange >= 0 ? "+" : ""}{priceChange}% (30d)
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
          <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Total Value" value={`$${(property.value / 1000000).toFixed(1)}M`} />
          <MetricCard icon={<Percent className="w-4 h-4" />} label="APY" value={`${property.apy}%`} highlight="success" />
          <MetricCard icon={<Users className="w-4 h-4" />} label="Token Holders" value={property.holders.toLocaleString()} />
          <MetricCard icon={<BarChart3 className="w-4 h-4" />} label="Occupancy" value={`${property.occupancy}%`} />
          <MetricCard icon={<Building2 className="w-4 h-4" />} label="Units" value={property.units.toString()} />
          <MetricCard icon={<Calendar className="w-4 h-4" />} label="Year Built" value={property.year_built?.toString() || "N/A"} />
        </div>

        {/* Your Position Card */}
        {holding && (
          <div className="glass-card rounded-2xl p-5 border-2 border-accent/40 animate-fade-in">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-accent" />
              Your Position
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Tokens Owned</p>
                <p className="font-display font-bold text-xl text-foreground">
                  <CountUp end={holding.tokens} />
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Avg Cost</p>
                <p className="font-display font-bold text-xl text-foreground">
                  ${holding.average_buy_price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Current Value</p>
                <p className="font-display font-bold text-xl text-foreground">
                  ${holdingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Profit</p>
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={handleOpenBuyModal}
            className="flex-1 py-4 rounded-xl gradient-primary text-primary-foreground font-display font-bold text-lg transition-all hover:opacity-90 glow-primary"
          >
            Buy Tokens
          </button>
          <button 
            onClick={handleOpenSellModal}
            className="flex-1 py-4 rounded-xl bg-secondary border-2 border-border text-foreground font-display font-bold text-lg transition-all hover:bg-muted"
          >
            Sell
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {(["overview", "financials", "documents", "activity"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">About this Property</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {property.description || 
                  `${property.name} is a premium ${property.category.toLowerCase()} property located in the heart of ${property.city}, ${property.state}. Built in ${property.year_built || "N/A"}, this property features ${property.units} units with an exceptional occupancy rate of ${property.occupancy}%. The property offers an attractive ${property.apy}% APY for token holders, making it an ideal investment opportunity for those seeking steady rental income and long-term appreciation.`}
              </p>
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">Key Highlights</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Total market value: ${property.value.toLocaleString()}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Total tokens: {property.total_tokens.toLocaleString()}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Current token holders: {property.holders.toLocaleString()}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Property managed by professional REIT operator
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "financials" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Financial Overview</h3>
              <div className="space-y-3">
                <FinancialRow label="Annual Rental Income" value={`$${annualIncome.toLocaleString()}`} />
                <FinancialRow label="Operating Expenses" value={`-$${annualExpenses.toLocaleString()}`} negative />
                <div className="border-t border-border pt-3">
                  <FinancialRow label="Net Operating Income (NOI)" value={`$${noi.toLocaleString()}`} highlight />
                </div>
                <div className="border-t border-border pt-3 space-y-3">
                  <FinancialRow label="Property Value" value={`$${property.value.toLocaleString()}`} />
                  <FinancialRow label="Token Price" value={`$${property.token_price.toFixed(2)}`} />
                  <FinancialRow label="Market Cap" value={`$${(property.token_price * property.total_tokens).toLocaleString()}`} />
                  <FinancialRow label="Annual Yield (APY)" value={`${property.apy}%`} success />
                  <FinancialRow label="Occupancy Rate" value={`${property.occupancy}%`} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Documents</h3>
              <div className="space-y-2">
                {[
                  { name: "Property Deed", type: "PDF" },
                  { name: "Q4 2024 Financial Statements", type: "PDF" },
                  { name: "Property Inspection Report", type: "PDF" },
                  { name: "Insurance Certificate", type: "PDF" },
                  { name: "Token Offering Memorandum", type: "PDF" },
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
              <h3 className="font-display font-semibold text-foreground">Recent Trades</h3>
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
                        {trade.type === "buy" ? "Bought" : "Sold"} {trade.tokens} tokens
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
              <h3 className="font-display font-semibold text-foreground">🎯 Related Predictions</h3>
              <Link to="/predict" className="text-sm text-primary font-medium flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
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
                      <span className="text-bull font-semibold">YES: {market.yes_price}¢</span>
                      <span className="text-bear font-semibold">NO: {market.no_price}¢</span>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg gradient-gold text-accent-foreground text-sm font-semibold whitespace-nowrap">
                    Bet Now →
                  </button>
                </Link>
              ))}
            </div>
          </div>
        )}
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
