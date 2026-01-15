import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Rocket, 
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { PullToRefresh } from "@/components/PullToRefresh";
import { SafeDealCard } from "@/components/safe/SafeDealCard";
import { useSafeDeals } from "@/hooks/useSafeDeals";

const stages = [
  { value: "all", label: "All Stages" },
  { value: "angel", label: "Angel" },
  { value: "pre_seed", label: "Pre-Seed" },
  { value: "seed", label: "Seed" },
  { value: "series_a", label: "Series A" },
  { value: "series_b_plus", label: "Series B+" },
];

const industries = [
  "All",
  "AI/Machine Learning",
  "FinTech",
  "HealthTech",
  "CleanTech",
  "EdTech",
  "AgTech",
  "Sustainability",
  "SaaS",
  "Consumer",
];

export default function StartupListing() {
  const navigate = useNavigate();
  const { deals, loading, refetch } = useSafeDeals();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch = 
      deal.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.location_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = 
      selectedStage === "all" || 
      deal.stage === selectedStage ||
      (selectedStage === "series_b_plus" && ['series_b', 'series_c', 'growth'].includes(deal.stage));
    
    const matchesIndustry = 
      selectedIndustry === "All" || 
      deal.industry === selectedIndustry;
    
    return matchesSearch && matchesStage && matchesIndustry;
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const clearFilters = () => {
    setSelectedStage("all");
    setSelectedIndustry("All");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedStage !== "all" || selectedIndustry !== "All" || searchQuery;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/assets")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">Startups & VC</h1>
            <p className="text-xs text-muted-foreground">Invest in early-stage companies</p>
          </div>
          <Button 
            variant={showFilters ? "default" : "outline"} 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search startups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Stage Filter Chips */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {stages.map((stage) => (
              <button
                key={stage.value}
                onClick={() => setSelectedStage(stage.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedStage === stage.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="px-4 pb-3 border-t border-border pt-3 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Industry</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                  <X className="w-3 h-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {industries.map((industry) => (
                <Badge
                  key={industry}
                  variant={selectedIndustry === industry ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedIndustry(industry)}
                >
                  {industry}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </header>

      <PullToRefresh onRefresh={handleRefresh}>
        <main className="p-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden">
                  <Skeleton className="h-32" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <div className="grid grid-cols-2 gap-3">
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Rocket className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {hasActiveFilters 
                  ? "No startups match your filters" 
                  : "No Startup Investments Available Yet"
                }
              </h3>
              <p className="text-muted-foreground max-w-md mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more opportunities."
                  : "SAFE, equity, and convertible note opportunities will be listed here soon."
                }
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDeals.map((deal) => (
                <SafeDealCard key={deal.id} deal={deal} />
              ))}
            </div>
          )}
        </main>
      </PullToRefresh>

      <BottomNav />
    </div>
  );
}
