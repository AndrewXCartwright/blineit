import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Search, ArrowLeft, MapPin, TrendingUp, Flame, Building2, Gem, Landmark, BadgeCheck, ChevronDown, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";
import { PullToRefresh } from "@/components/PullToRefresh";
import { EmptyState } from "@/components/EmptyState";
import { LoanCard } from "@/components/LoanCard";
import { LoanTypeFilter, type LoanType } from "@/components/LoanTypeFilter";
import { useLoans, type Loan } from "@/hooks/useLoanData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
interface SponsorInfo {
  id: string;
  company_name: string;
  company_logo_url: string | null;
  verification_status: string;
}
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
  image_url?: string;
  sponsor_id?: string | null;
  sponsor?: SponsorInfo | null;
}
const categoryLabels: Record<string, string> = {
  "real-estate": "Real Estate",
  "commercial": "Commercial",
  "re-loans": "Real Estate Loans",
  "construction": "Construction Loans",
  "bridge": "Bridge Loans"
};

// Convert Loan to LoanCard format
const loanToCardData = (loan: Loan) => ({
  id: loan.id,
  name: loan.name,
  propertyName: loan.name.split(" - ")[0],
  loanType: loan.name.split(" - ")[1] || loan.loan_type,
  city: loan.city,
  state: loan.state,
  loanAmount: Number(loan.loan_amount),
  apy: Number(loan.apy),
  termMonths: loan.term_months,
  ltv: Number(loan.ltv_ratio),
  fundedAmount: Number(loan.amount_funded),
  minInvestment: Number(loan.min_investment),
  isSecured: loan.loan_position !== "mezzanine",
  lienPosition: loan.loan_position === "1st_lien" ? "1st" as const : loan.loan_position === "2nd_lien" ? "2nd" as const : "mezzanine" as const,
  imageUrl: loan.image_url || undefined
});
export default function AssetsExplore() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const investmentType = searchParams.get("type") || "equity";
  const assetClass = searchParams.get("class") || "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [loanTypeFilter, setLoanTypeFilter] = useState<LoanType>("all");
  const [sponsors, setSponsors] = useState<SponsorInfo[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<string | null>(null);
  const {
    loans,
    loading: loansLoading,
    refetch: refetchLoans
  } = useLoans();
  const isDebt = investmentType === "debt";
  const categoryLabel = categoryLabels[assetClass] || "All Assets";
  const fetchSponsors = useCallback(async () => {
    const {
      data,
      error
    } = await supabase.from("sponsor_profiles").select("id, company_name, company_logo_url, verification_status").eq("verification_status", "verified").order("company_name");
    if (!error && data) {
      setSponsors(data as unknown as SponsorInfo[]);
    }
  }, []);
  const fetchProperties = useCallback(async () => {
    // First fetch properties
    const {
      data,
      error
    } = await supabase.from("properties").select("*");
    if (!error && data) {
      // Get unique sponsor IDs
      const sponsorIds = [...new Set(data.filter(p => p.sponsor_id).map(p => p.sponsor_id))];

      // Fetch sponsor details for these properties
      let sponsorMap: Record<string, SponsorInfo> = {};
      if (sponsorIds.length > 0) {
        const {
          data: sponsorData
        } = await supabase.from("sponsor_profiles").select("id, company_name, company_logo_url, verification_status").in("id", sponsorIds);
        if (sponsorData) {
          sponsorMap = Object.fromEntries((sponsorData as unknown as SponsorInfo[]).map(s => [s.id, s]));
        }
      }

      // Merge sponsor info with properties
      let filtered = data.map(p => ({
        ...p,
        sponsor: p.sponsor_id ? sponsorMap[p.sponsor_id] || null : null
      }));

      // Apply category filter
      if (assetClass === "commercial") {
        filtered = filtered.filter(p => p.category === "Commercial");
      } else if (assetClass === "real-estate" || assetClass === "re-loans") {
        filtered = filtered.filter(p => p.category === "Multifamily" || p.category === "Residential");
      }
      setProperties(filtered);
    }
    setPropertiesLoading(false);
  }, [assetClass]);
  useEffect(() => {
    fetchProperties();
    fetchSponsors();
  }, [fetchProperties, fetchSponsors]);
  const handleRefresh = async () => {
    if (isDebt) {
      await refetchLoans();
    } else {
      await fetchProperties();
    }
  };
  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) || property.city.toLowerCase().includes(searchQuery.toLowerCase()) || property.sponsor?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const matchesSponsor = !selectedSponsor || property.sponsor_id === selectedSponsor;
    return matchesSearch && matchesSponsor;
  });
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.name.toLowerCase().includes(searchQuery.toLowerCase()) || loan.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = loanTypeFilter === "all" || loan.loan_type === loanTypeFilter;
    return matchesSearch && matchesType;
  });
  const loading = isDebt ? loansLoading : propertiesLoading;
  const selectedSponsorName = sponsors.find(s => s.id === selectedSponsor)?.company_name;
  return <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate("/assets")} className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-foreground">
              {isDebt ? "Debt Investments" : categoryLabel}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {isDebt ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  <Landmark className="w-3 h-3" />
                  DEBT
                </span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                  <Gem className="w-3 h-3" />
                  EQUITY
                </span>}
            </div>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" placeholder={isDebt ? "Search loans..." : `Search properties or sponsors...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
        </div>
      </header>

      <PullToRefresh onRefresh={handleRefresh} className="h-[calc(100vh-200px)]">
        <main className="px-4 py-6 space-y-4">
          {/* Filters */}
          {isDebt ? <LoanTypeFilter value={loanTypeFilter} onChange={setLoanTypeFilter} /> : <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {/* Sponsor Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedSponsor ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                    <Building2 className="w-4 h-4" />
                    {selectedSponsorName || "All Sponsors"}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                  <DropdownMenuItem onClick={() => setSelectedSponsor(null)}>
                    All Sponsors
                  </DropdownMenuItem>
                  {sponsors.map(sponsor => <DropdownMenuItem key={sponsor.id} onClick={() => setSelectedSponsor(sponsor.id)} className="flex items-center gap-2">
                      {sponsor.company_logo_url ? <img src={sponsor.company_logo_url} alt={sponsor.company_name} className="w-5 h-5 rounded-full object-cover" /> : <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {sponsor.company_name.charAt(0)}
                        </div>}
                      <span>{sponsor.company_name}</span>
                      {sponsor.verification_status === 'verified' && <BadgeCheck className="w-3 h-3 text-primary" />}
                    </DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Clear filter button */}
              {selectedSponsor && <button onClick={() => setSelectedSponsor(null)} className="flex items-center gap-1 px-2 py-2 rounded-full bg-destructive/20 text-destructive text-sm">
                  <X className="w-3 h-3" />
                </button>}
            </div>}

          {loading ? <div className="grid grid-cols-1 gap-4">
              {Array.from({
            length: 4
          }).map((_, i) => <div key={i} className="glass-card rounded-2xl p-4">
                  <Skeleton className="h-20 mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>)}
            </div> : isDebt ? (/* Debt/Loan Cards */
        filteredLoans.length === 0 ? <EmptyState icon={<Landmark className="w-12 h-12" />} title="No loans found" description="Try adjusting your search or filters." actionLabel="Clear Filters" onAction={() => {
          setSearchQuery("");
          setLoanTypeFilter("all");
        }} /> : <div className="grid grid-cols-1 gap-4">
                {filteredLoans.map((loan, index) => <div key={loan.id} style={{
            animationDelay: `${index * 0.05}s`
          }}>
                    <LoanCard loan={loanToCardData(loan)} onClick={() => navigate(`/loan/${loan.id}`)} />
                  </div>)}
              </div>) : (/* Equity Property Cards */
        filteredProperties.length === 0 ? <EmptyState icon={<Building2 className="w-12 h-12" />} title="No assets found" description="Try adjusting your search to find what you're looking for." actionLabel="Clear Filters" onAction={() => {
          setSearchQuery("");
          setSelectedSponsor(null);
        }} /> : <div className="grid grid-cols-1 gap-4">
                {filteredProperties.map((property, index) => <div key={property.id} onClick={() => navigate(`/property/${property.id}`)} className="glass-card rounded-2xl overflow-hidden animate-fade-in interactive-card cursor-pointer" style={{
            animationDelay: `${index * 0.05}s`
          }}>
                    <div className="flex">
                      <div className="w-28 h-28 relative flex-shrink-0 overflow-hidden">
                        {property.image_url ? <img src={property.image_url} alt={property.name} className="w-full h-full object-cover" /> : <div className="w-full h-full gradient-primary flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-primary-foreground/20" />
                          </div>}
                        {property.is_hot && <span className="absolute top-2 left-2 flex items-center gap-1 bg-accent/90 text-accent-foreground px-2 py-0.5 rounded-full text-[10px] font-medium">
                            <Flame className="w-3 h-3" />Hot
                          </span>}
                        {/* Sponsor Logo Overlay */}
                        {property.sponsor && <Link to={`/sponsors/${property.sponsor.id}`} onClick={e => e.stopPropagation()} className="absolute bottom-2 right-2">
                            {property.sponsor.company_logo_url ? <img src={property.sponsor.company_logo_url} alt={property.sponsor.company_name} className="w-7 h-7 rounded-full border-2 border-background object-cover bg-background" /> : <div className="w-7 h-7 rounded-full border-2 border-background bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                                {property.sponsor.company_name.charAt(0)}
                              </div>}
                          </Link>}
                      </div>
                      <div className="flex-1 p-3">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-display font-semibold text-foreground leading-tight pr-2 text-lg">
                            {property.name}
                          </h3>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 flex-shrink-0">
                            EQUITY
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <MapPin className="w-3 h-3" />
                          <span>{property.city}, {property.state}</span>
                        </div>
                        {/* Sponsor Name */}
                        {property.sponsor && <Link to={`/sponsors/${property.sponsor.id}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 text-[10px] text-primary hover:underline mb-2">
                            <span className="truncate text-sm">By {property.sponsor.company_name}</span>
                            {property.sponsor.verification_status === 'verified' && <BadgeCheck className="w-3 h-3 flex-shrink-0" />}
                          </Link>}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-muted-foreground text-base">Token:</span>
                            <span className="font-semibold text-foreground">${property.token_price}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <TrendingUp className="w-3 h-3 text-success" />
                            <span className="font-semibold text-success text-lg">{property.apy}% APY</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs col-span-2">
                            <span className="text-muted-foreground">Value:</span>
                            <span className="font-semibold text-foreground">${(property.value / 1000000).toFixed(1)}M</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>)}
        </main>
      </PullToRefresh>
    </div>;
}