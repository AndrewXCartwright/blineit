import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Building2, 
  Star, 
  MapPin, 
  TrendingUp, 
  DollarSign,
  CheckCircle,
  ChevronRight,
  Filter,
  Users,
  Award,
  Sparkles
} from "lucide-react";

interface Sponsor {
  id: string;
  companyName: string;
  logoUrl: string;
  isVerified: boolean;
  location: string;
  rating: number;
  reviewCount: number;
  dealsCompleted: number;
  capitalRaised: number;
  averageIrr: number;
  assetTypes: string[];
  activeDeals: number;
  isFeatured: boolean;
  yearsInBusiness: number;
}

const mockSponsors: Sponsor[] = [
  {
    id: "1",
    companyName: "Sunset Properties LLC",
    logoUrl: "",
    isVerified: true,
    location: "San Francisco, CA",
    rating: 4.8,
    reviewCount: 45,
    dealsCompleted: 28,
    capitalRaised: 125000000,
    averageIrr: 18.5,
    assetTypes: ["Multifamily", "Industrial"],
    activeDeals: 3,
    isFeatured: true,
    yearsInBusiness: 15
  },
  {
    id: "2",
    companyName: "Horizon Capital Partners",
    logoUrl: "",
    isVerified: true,
    location: "Austin, TX",
    rating: 4.9,
    reviewCount: 62,
    dealsCompleted: 42,
    capitalRaised: 280000000,
    averageIrr: 21.2,
    assetTypes: ["Multifamily", "Mixed-Use", "Office"],
    activeDeals: 5,
    isFeatured: true,
    yearsInBusiness: 22
  },
  {
    id: "3",
    companyName: "Pinnacle Real Estate Group",
    logoUrl: "",
    isVerified: true,
    location: "Miami, FL",
    rating: 4.6,
    reviewCount: 38,
    dealsCompleted: 19,
    capitalRaised: 85000000,
    averageIrr: 16.8,
    assetTypes: ["Multifamily", "Hospitality"],
    activeDeals: 2,
    isFeatured: false,
    yearsInBusiness: 10
  },
  {
    id: "4",
    companyName: "Metro Development Co",
    logoUrl: "",
    isVerified: true,
    location: "Chicago, IL",
    rating: 4.5,
    reviewCount: 28,
    dealsCompleted: 15,
    capitalRaised: 62000000,
    averageIrr: 15.4,
    assetTypes: ["Commercial", "Retail"],
    activeDeals: 1,
    isFeatured: false,
    yearsInBusiness: 8
  },
  {
    id: "5",
    companyName: "Pacific Coast Investments",
    logoUrl: "",
    isVerified: true,
    location: "Los Angeles, CA",
    rating: 4.7,
    reviewCount: 52,
    dealsCompleted: 35,
    capitalRaised: 195000000,
    averageIrr: 19.3,
    assetTypes: ["Multifamily", "Industrial", "Self-Storage"],
    activeDeals: 4,
    isFeatured: true,
    yearsInBusiness: 18
  },
  {
    id: "6",
    companyName: "Bluegrass Property Group",
    logoUrl: "",
    isVerified: false,
    location: "Nashville, TN",
    rating: 4.3,
    reviewCount: 15,
    dealsCompleted: 8,
    capitalRaised: 32000000,
    averageIrr: 14.2,
    assetTypes: ["Multifamily"],
    activeDeals: 2,
    isFeatured: false,
    yearsInBusiness: 5
  },
  {
    id: "7",
    companyName: "Mountain View Equity",
    logoUrl: "",
    isVerified: true,
    location: "Denver, CO",
    rating: 4.4,
    reviewCount: 22,
    dealsCompleted: 12,
    capitalRaised: 48000000,
    averageIrr: 17.1,
    assetTypes: ["Multifamily", "Office"],
    activeDeals: 1,
    isFeatured: false,
    yearsInBusiness: 7
  },
  {
    id: "8",
    companyName: "Empire State Holdings",
    logoUrl: "",
    isVerified: true,
    location: "New York, NY",
    rating: 4.8,
    reviewCount: 78,
    dealsCompleted: 55,
    capitalRaised: 420000000,
    averageIrr: 20.5,
    assetTypes: ["Office", "Retail", "Mixed-Use"],
    activeDeals: 6,
    isFeatured: true,
    yearsInBusiness: 25
  }
];

const assetTypeOptions = [
  "All",
  "Multifamily",
  "Commercial",
  "Industrial",
  "Office",
  "Retail",
  "Mixed-Use",
  "Hospitality",
  "Self-Storage"
];

const stateOptions = [
  "All",
  "CA",
  "TX",
  "FL",
  "NY",
  "IL",
  "TN",
  "CO"
];

const sortOptions = [
  { value: "rating", label: "Highest Rated" },
  { value: "capital", label: "Capital Raised" },
  { value: "deals", label: "Deals Completed" },
  { value: "newest", label: "Newest" }
];

export default function SponsorDirectory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [assetTypeFilter, setAssetTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("any");
  const [dealsFilter, setDealsFilter] = useState("any");
  const [sortBy, setSortBy] = useState("rating");
  const [displayCount, setDisplayCount] = useState(12);

  const filteredSponsors = useMemo(() => {
    let result = [...mockSponsors];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.companyName.toLowerCase().includes(query) ||
        s.assetTypes.some(a => a.toLowerCase().includes(query))
      );
    }

    // Asset type filter
    if (assetTypeFilter !== "All") {
      result = result.filter(s => s.assetTypes.includes(assetTypeFilter));
    }

    // Location filter
    if (locationFilter !== "All") {
      result = result.filter(s => s.location.includes(locationFilter));
    }

    // Rating filter
    if (ratingFilter === "4+") {
      result = result.filter(s => s.rating >= 4);
    } else if (ratingFilter === "4.5+") {
      result = result.filter(s => s.rating >= 4.5);
    }

    // Deals filter
    if (dealsFilter === "5+") {
      result = result.filter(s => s.dealsCompleted >= 5);
    } else if (dealsFilter === "10+") {
      result = result.filter(s => s.dealsCompleted >= 10);
    } else if (dealsFilter === "25+") {
      result = result.filter(s => s.dealsCompleted >= 25);
    }

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "capital":
        result.sort((a, b) => b.capitalRaised - a.capitalRaised);
        break;
      case "deals":
        result.sort((a, b) => b.dealsCompleted - a.dealsCompleted);
        break;
      case "newest":
        result.sort((a, b) => a.yearsInBusiness - b.yearsInBusiness);
        break;
    }

    return result;
  }, [searchQuery, assetTypeFilter, locationFilter, ratingFilter, dealsFilter, sortBy]);

  const featuredSponsors = filteredSponsors.filter(s => s.isFeatured);
  const regularSponsors = filteredSponsors.slice(0, displayCount);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const SponsorCard = ({ sponsor, featured = false }: { sponsor: Sponsor; featured?: boolean }) => (
    <Card 
      className={`glass-card overflow-hidden cursor-pointer hover:shadow-lg transition-all ${
        featured ? 'border-primary/30 bg-primary/5' : ''
      }`}
      onClick={() => navigate(`/sponsors/${sponsor.id}`)}
    >
      <CardContent className={`p-4 ${featured ? 'p-5' : ''}`}>
        <div className="flex items-start gap-4">
          <Avatar className={featured ? "h-16 w-16" : "h-12 w-12"}>
            <AvatarImage src={sponsor.logoUrl} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {getInitials(sponsor.companyName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {featured && (
                <Badge variant="secondary" className="bg-primary/10 text-primary text-xs gap-1">
                  <Sparkles className="h-3 w-3" />
                  Featured
                </Badge>
              )}
              {sponsor.isVerified && (
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              )}
            </div>
            <h3 className={`font-semibold truncate ${featured ? 'text-lg' : ''}`}>
              {sponsor.companyName}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{sponsor.location}</span>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{sponsor.rating}</span>
                <span className="text-muted-foreground text-sm">({sponsor.reviewCount})</span>
              </div>
            </div>
          </div>

          {sponsor.activeDeals > 0 && (
            <Badge className="shrink-0 bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              {sponsor.activeDeals} Active
            </Badge>
          )}
        </div>

        {/* Quick Stats */}
        <div className={`grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50 ${featured ? 'grid-cols-4' : ''}`}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Building2 className="h-3 w-3" />
            </div>
            <p className="font-semibold text-sm">{sponsor.dealsCompleted}</p>
            <p className="text-xs text-muted-foreground">Deals</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <DollarSign className="h-3 w-3" />
            </div>
            <p className="font-semibold text-sm">{formatCurrency(sponsor.capitalRaised)}</p>
            <p className="text-xs text-muted-foreground">Raised</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <TrendingUp className="h-3 w-3" />
            </div>
            <p className="font-semibold text-sm">{sponsor.averageIrr}%</p>
            <p className="text-xs text-muted-foreground">Avg IRR</p>
          </div>
          {featured && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Award className="h-3 w-3" />
              </div>
              <p className="font-semibold text-sm">{sponsor.yearsInBusiness}</p>
              <p className="text-xs text-muted-foreground">Years</p>
            </div>
          )}
        </div>

        {/* Asset Types */}
        <div className="flex flex-wrap gap-1 mt-3">
          {sponsor.assetTypes.slice(0, 3).map(type => (
            <Badge key={type} variant="outline" className="text-xs">
              {type}
            </Badge>
          ))}
          {sponsor.assetTypes.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{sponsor.assetTypes.length - 3}
            </Badge>
          )}
        </div>

        <Button 
          variant="ghost" 
          className="w-full mt-4 text-primary hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/sponsors/${sponsor.id}`);
          }}
        >
          View Profile
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-display">Sponsor Directory</h1>
          <p className="text-muted-foreground">
            Find experienced sponsors for your investments
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sponsors by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Bar */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <Select value={assetTypeFilter} onValueChange={setAssetTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Asset Type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypeOptions.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map(state => (
                    <SelectItem key={state} value={state}>
                      {state === "All" ? "All Locations" : state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Rating</SelectItem>
                  <SelectItem value="4+">4+ Stars</SelectItem>
                  <SelectItem value="4.5+">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dealsFilter} onValueChange={setDealsFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Min Deals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Deals</SelectItem>
                  <SelectItem value="5+">5+ Deals</SelectItem>
                  <SelectItem value="10+">10+ Deals</SelectItem>
                  <SelectItem value="25+">25+ Deals</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Featured Sponsors */}
        {featuredSponsors.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Featured Sponsors</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredSponsors.slice(0, 4).map(sponsor => (
                <SponsorCard key={sponsor.id} sponsor={sponsor} featured />
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* All Sponsors */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">All Sponsors</h2>
              <Badge variant="secondary">{filteredSponsors.length}</Badge>
            </div>
          </div>

          {regularSponsors.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No sponsors found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters to see more results.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setAssetTypeFilter("All");
                    setLocationFilter("All");
                    setRatingFilter("any");
                    setDealsFilter("any");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularSponsors.map(sponsor => (
                  <SponsorCard key={sponsor.id} sponsor={sponsor} />
                ))}
              </div>

              {displayCount < filteredSponsors.length && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setDisplayCount(prev => prev + 12)}
                  >
                    Load More Sponsors
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing {Math.min(displayCount, filteredSponsors.length)} of {filteredSponsors.length}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
