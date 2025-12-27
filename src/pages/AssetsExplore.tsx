import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, MapPin, TrendingUp, Flame, Building2, Gem, Landmark, Clock, Percent } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/EmptyState";

interface Property {
  id: string;
  name: string;
  city: string;
  state: string;
  value: number;
  apy: number;
  token_price: number;
  is_hot: boolean;
  category: string;
}

const categoryLabels: Record<string, string> = {
  "real-estate": "Real Estate",
  "commercial": "Commercial",
  "re-loans": "Real Estate Loans",
  "construction": "Construction Loans",
  "bridge": "Bridge Loans",
};

export default function AssetsExplore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const investmentType = searchParams.get("type") || "equity";
  const assetClass = searchParams.get("class") || "all";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const isDebt = investmentType === "debt";
  const categoryLabel = categoryLabels[assetClass] || "All Assets";

  const fetchProperties = useCallback(async () => {
    const { data, error } = await supabase.from("properties").select("*");
    if (!error && data) {
      // Filter based on asset class
      let filtered = data;
      if (assetClass === "commercial") {
        filtered = data.filter(p => p.category === "Commercial");
      } else if (assetClass === "real-estate" || assetClass === "re-loans") {
        filtered = data.filter(p => p.category === "Multifamily" || p.category === "Residential");
      }
      setProperties(filtered);
    }
    setLoading(false);
  }, [assetClass]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleRefresh = async () => {
    await fetchProperties();
  };

  const filteredProperties = properties.filter((property) => {
    return property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           property.city.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate("/assets")}
            className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-foreground">{categoryLabel}</h1>
            <div className="flex items-center gap-2 mt-1">
              {isDebt ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  <Landmark className="w-3 h-3" />
                  DEBT
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                  <Gem className="w-3 h-3" />
                  EQUITY
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Search ${categoryLabel.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </header>

      <PullToRefresh onRefresh={handleRefresh} className="h-[calc(100vh-200px)]">
        <main className="px-4 py-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-4">
                  <Skeleton className="h-20 mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-12 h-12" />}
              title="No assets found"
              description="Try adjusting your search to find what you're looking for."
              actionLabel="Clear Search"
              onAction={() => setSearchQuery("")}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProperties.map((property, index) => (
                <div
                  key={property.id}
                  onClick={() => navigate(`/property/${property.id}`)}
                  className="glass-card rounded-2xl overflow-hidden animate-fade-in interactive-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex">
                    {/* Property Image/Placeholder */}
                    <div className="w-28 h-28 gradient-primary relative flex-shrink-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-primary-foreground/20" />
                      </div>
                      {property.is_hot && (
                        <span className="absolute top-2 left-2 flex items-center gap-1 bg-accent/90 text-accent-foreground px-2 py-0.5 rounded-full text-[10px] font-medium">
                          <Flame className="w-3 h-3" />Hot
                        </span>
                      )}
                    </div>
                    
                    {/* Property Details */}
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-display font-semibold text-sm text-foreground leading-tight pr-2">
                          {property.name}
                        </h3>
                        {isDebt ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 flex-shrink-0">
                            DEBT
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 flex-shrink-0">
                            EQUITY
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{property.city}, {property.state}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {isDebt ? (
                          <>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-muted-foreground">Loan:</span>
                              <span className="font-semibold text-foreground">${(property.value / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Percent className="w-3 h-3 text-blue-400" />
                              <span className="font-semibold text-blue-400">{property.apy + 2}% APY</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              <span className="text-muted-foreground">24 mo term</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-muted-foreground">LTV:</span>
                              <span className="font-semibold text-foreground">65%</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-muted-foreground">Token:</span>
                              <span className="font-semibold text-foreground">${property.token_price}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <TrendingUp className="w-3 h-3 text-success" />
                              <span className="font-semibold text-success">{property.apy}% APY</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs col-span-2">
                              <span className="text-muted-foreground">Value:</span>
                              <span className="font-semibold text-foreground">${(property.value / 1000000).toFixed(1)}M</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </PullToRefresh>
    </div>
  );
}
