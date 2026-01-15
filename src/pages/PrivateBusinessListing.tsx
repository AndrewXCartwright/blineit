import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Building2, 
  Filter,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { PullToRefresh } from "@/components/PullToRefresh";
import { PrivateBusinessCard } from "@/components/private-business/PrivateBusinessCard";
import { usePrivateBusinesses } from "@/hooks/usePrivateBusinesses";

const industries = [
  "All",
  "Laundromats",
  "Car Washes",
  "Storage",
  "Franchises",
  "E-commerce",
  "Restaurants",
  "Services",
  "Manufacturing",
];

const businessTypes = [
  { value: "all", label: "All Types" },
  { value: "revenue_share", label: "Revenue Share" },
  { value: "equity", label: "Equity" },
  { value: "profit_share", label: "Profit Share" },
  { value: "convertible_note", label: "Convertible Note" },
];

export default function PrivateBusinessListing() {
  const navigate = useNavigate();
  const { businesses, loading, refetch } = usePrivateBusinesses();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedType, setSelectedType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const filteredBusinesses = businesses.filter((business) => {
    const matchesSearch = 
      business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.location_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.location_state?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = 
      selectedIndustry === "All" || 
      business.industry === selectedIndustry;
    
    const matchesType = 
      selectedType === "all" || 
      business.business_type === selectedType;
    
    return matchesSearch && matchesIndustry && matchesType;
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const clearFilters = () => {
    setSelectedIndustry("All");
    setSelectedType("all");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedIndustry !== "All" || selectedType !== "all" || searchQuery;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/assets")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">Private Business</h1>
            <p className="text-xs text-muted-foreground">Invest in operating businesses</p>
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
              placeholder="Search businesses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Industry Filter Chips */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-2">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedIndustry === industry
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="px-4 pb-3 border-t border-border pt-3 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Business Type</span>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                  <X className="w-3 h-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {businessTypes.map((type) => (
                <Badge
                  key={type.value}
                  variant={selectedType === type.value ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedType(type.value)}
                >
                  {type.label}
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
                  <Skeleton className="h-20" />
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
          ) : filteredBusinesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {hasActiveFilters 
                  ? "No businesses match your filters" 
                  : "No Private Business Investments Available Yet"
                }
              </h3>
              <p className="text-muted-foreground max-w-md mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more opportunities."
                  : "Revenue share and equity opportunities in operating businesses will be listed here soon."
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
              {filteredBusinesses.map((business) => (
                <PrivateBusinessCard key={business.id} business={business} />
              ))}
            </div>
          )}
        </main>
      </PullToRefresh>

      <BottomNav />
    </div>
  );
}
