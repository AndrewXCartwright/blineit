import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, MapPin, TrendingUp, Flame, Building2, Gem, Landmark, Clock, Percent } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/EmptyState";
import { LoanCard, type LoanData } from "@/components/LoanCard";
import { LoanTypeFilter, type LoanType } from "@/components/LoanTypeFilter";

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

// Mock loans data
const mockLoans: LoanData[] = [
  { id: "loan-1", name: "Loan-001", propertyName: "Sunset Apartments", loanType: "Bridge Loan", city: "Austin", state: "TX", loanAmount: 2400000, apy: 10.5, termMonths: 18, ltv: 65, fundedAmount: 1872000, minInvestment: 1000, isSecured: true, lienPosition: "1st" },
  { id: "loan-2", name: "Loan-002", propertyName: "Downtown Office Tower", loanType: "Construction", city: "Miami", state: "FL", loanAmount: 5200000, apy: 12.5, termMonths: 24, ltv: 70, fundedAmount: 2600000, minInvestment: 2500, isSecured: true, lienPosition: "1st" },
  { id: "loan-3", name: "Loan-003", propertyName: "Riverside Commons", loanType: "Stabilized", city: "Denver", state: "CO", loanAmount: 1800000, apy: 8.5, termMonths: 36, ltv: 55, fundedAmount: 1620000, minInvestment: 1000, isSecured: true, lienPosition: "1st" },
  { id: "loan-4", name: "Loan-004", propertyName: "Tech Park Plaza", loanType: "Mezzanine", city: "Seattle", state: "WA", loanAmount: 3500000, apy: 14.0, termMonths: 24, ltv: 75, fundedAmount: 1400000, minInvestment: 5000, isSecured: true, lienPosition: "2nd" },
  { id: "loan-5", name: "Loan-005", propertyName: "Harbor View Condos", loanType: "Bridge Loan", city: "San Diego", state: "CA", loanAmount: 4100000, apy: 11.0, termMonths: 12, ltv: 60, fundedAmount: 3690000, minInvestment: 1000, isSecured: true, lienPosition: "1st" },
];

export default function AssetsExplore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const investmentType = searchParams.get("type") || "equity";
  const assetClass = searchParams.get("class") || "all";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loanTypeFilter, setLoanTypeFilter] = useState<LoanType>("all");

  const isDebt = investmentType === "debt";
  const categoryLabel = categoryLabels[assetClass] || "All Assets";

  const fetchProperties = useCallback(async () => {
    const { data, error } = await supabase.from("properties").select("*");
    if (!error && data) {
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

  const filteredLoans = mockLoans.filter((loan) => {
    const matchesSearch = loan.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loan.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = loanTypeFilter === "all" || 
                        loan.loanType.toLowerCase().includes(loanTypeFilter);
    return matchesSearch && matchesType;
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
            <h1 className="font-display text-xl font-bold text-foreground">
              {isDebt ? "Debt Investments" : categoryLabel}
            </h1>
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
            placeholder={isDebt ? "Search loans..." : `Search ${categoryLabel.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </header>

      <PullToRefresh onRefresh={handleRefresh} className="h-[calc(100vh-200px)]">
        <main className="px-4 py-6 space-y-4">
          {/* Loan Type Filter for Debt */}
          {isDebt && (
            <LoanTypeFilter value={loanTypeFilter} onChange={setLoanTypeFilter} />
          )}

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
          ) : isDebt ? (
            /* Debt/Loan Cards */
            filteredLoans.length === 0 ? (
              <EmptyState
                icon={<Landmark className="w-12 h-12" />}
                title="No loans found"
                description="Try adjusting your search or filters."
                actionLabel="Clear Filters"
                onAction={() => { setSearchQuery(""); setLoanTypeFilter("all"); }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredLoans.map((loan, index) => (
                  <div key={loan.id} style={{ animationDelay: `${index * 0.05}s` }}>
                    <LoanCard 
                      loan={loan} 
                      onClick={() => navigate(`/loan/${loan.id}`)} 
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Equity Property Cards */
            filteredProperties.length === 0 ? (
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
                      <div className="flex-1 p-3">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-display font-semibold text-sm text-foreground leading-tight pr-2">
                            {property.name}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 flex-shrink-0">
                            EQUITY
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{property.city}, {property.state}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
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
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </main>
      </PullToRefresh>
    </div>
  );
}
