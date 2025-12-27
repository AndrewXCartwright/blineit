import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, MapPin, TrendingUp, TrendingDown, Users, Building2, Calendar, Percent, DollarSign, BarChart3, FileText, Home } from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { CountUp } from "@/components/CountUp";
import { useAuth } from "@/hooks/useAuth";

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

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [holding, setHolding] = useState<UserHolding | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "financials" | "documents">("overview");

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        setProperty(data);
      }

      if (user) {
        const { data: holdingData } = await supabase
          .from("user_holdings")
          .select("tokens, average_buy_price")
          .eq("property_id", id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (holdingData) {
          setHolding(holdingData);
        }
      }

      setLoading(false);
    };

    fetchProperty();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <div className="h-48 w-full">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
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

  const priceChange = 5.2; // Mock price change
  const holdingValue = holding ? holding.tokens * property.token_price : 0;
  const holdingPnL = holding 
    ? ((property.token_price - holding.average_buy_price) / holding.average_buy_price) * 100 
    : 0;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Image */}
      <div className="h-56 gradient-primary relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 rounded-full glass-card hover:bg-secondary/80 transition-colors z-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {property.is_hot && (
          <span className="absolute top-4 right-4 flex items-center gap-1 bg-accent/90 text-accent-foreground px-3 py-1 rounded-full text-sm font-medium z-10">
            🔥 Hot
          </span>
        )}
      </div>

      <main className="px-4 -mt-16 relative z-10 space-y-6">
        {/* Property Info */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {property.name}
              </h1>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span>{property.address}, {property.city}, {property.state}</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
              {property.category}
            </span>
          </div>

          {/* Token Price */}
          <div className="flex items-end gap-3">
            <span className="font-display text-3xl font-bold text-foreground">
              $<CountUp end={property.token_price} decimals={2} />
            </span>
            <span className={`flex items-center gap-1 text-sm font-medium ${
              priceChange >= 0 ? "text-success" : "text-destructive"
            }`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {priceChange >= 0 ? "+" : ""}{priceChange}%
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox icon={<DollarSign className="w-4 h-4" />} label="Value" value={`$${(property.value / 1000000).toFixed(1)}M`} />
          <StatBox icon={<Percent className="w-4 h-4" />} label="APY" value={`${property.apy}%`} highlight />
          <StatBox icon={<Users className="w-4 h-4" />} label="Holders" value={property.holders.toString()} />
          <StatBox icon={<BarChart3 className="w-4 h-4" />} label="Occupancy" value={`${property.occupancy}%`} />
          <StatBox icon={<Building2 className="w-4 h-4" />} label="Units" value={property.units.toString()} />
          <StatBox icon={<Calendar className="w-4 h-4" />} label="Year Built" value={property.year_built?.toString() || "N/A"} />
        </div>

        {/* User Position */}
        {holding && (
          <div className="glass-card rounded-2xl p-5 border-2 border-primary/30 animate-fade-in">
            <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Your Position
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Tokens Owned</p>
                <p className="font-display font-bold text-lg text-foreground">
                  <CountUp end={holding.tokens} />
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Value</p>
                <p className="font-display font-bold text-lg text-foreground">
                  $<CountUp end={holdingValue} decimals={2} />
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Buy Price</p>
                <p className="font-semibold text-foreground">${holding.average_buy_price}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">P&L</p>
                <p className={`font-semibold flex items-center gap-1 ${
                  holdingPnL >= 0 ? "text-success" : "text-destructive"
                }`}>
                  {holdingPnL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {holdingPnL >= 0 ? "+" : ""}{holdingPnL.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(["overview", "financials", "documents"] as const).map((tab) => (
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
                  `${property.name} is a premium ${property.category.toLowerCase()} property located in ${property.city}, ${property.state}. Built in ${property.year_built || "N/A"}, this property features ${property.units} units with a current occupancy rate of ${property.occupancy}%. The property offers an attractive ${property.apy}% APY for token holders.`}
              </p>
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground mb-2">Key Highlights</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Total market value: ${(property.value).toLocaleString()}</li>
                  <li>• Total tokens: {property.total_tokens.toLocaleString()}</li>
                  <li>• Current token holders: {property.holders}</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "financials" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Financial Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Annual Yield</span>
                  <span className="font-semibold text-success">{property.apy}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Property Value</span>
                  <span className="font-semibold text-foreground">${property.value.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Token Price</span>
                  <span className="font-semibold text-foreground">${property.token_price}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-semibold text-foreground">${(property.token_price * property.total_tokens).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Occupancy Rate</span>
                  <span className="font-semibold text-foreground">{property.occupancy}%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Documents</h3>
              <div className="space-y-3">
                {["Property Deed", "Financial Statements", "Inspection Report", "Insurance Certificate"].map((doc) => (
                  <button
                    key={doc}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors text-left"
                  >
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-foreground">{doc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="py-4 rounded-xl gradient-bull text-bull-foreground font-display font-bold text-lg transition-all hover:opacity-90 glow-bull">
            Buy Tokens
          </button>
          <button className="py-4 rounded-xl bg-secondary border border-border text-foreground font-display font-bold text-lg transition-all hover:bg-secondary/80">
            Sell Tokens
          </button>
        </div>
      </main>
    </div>
  );
}

function StatBox({ icon, label, value, highlight = false }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`glass-card rounded-xl p-3 text-center animate-fade-in ${highlight ? "border-success/30" : ""}`}>
      <div className={`mx-auto mb-1 ${highlight ? "text-success" : "text-primary"}`}>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`font-display font-bold text-sm ${highlight ? "text-success" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
