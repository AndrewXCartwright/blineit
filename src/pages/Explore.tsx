import { Search, Filter, MapPin, TrendingUp, Flame } from "lucide-react";
import { useState } from "react";

const filters = ["All", "Multifamily", "Commercial", "Industrial", "Retail", "Mixed-Use"];

const properties = [
  { name: "Pacific Heights", location: "San Francisco, CA", value: "$3.2M", apy: "9.2%", tokenPrice: "$125", hot: true, category: "Multifamily" },
  { name: "Lakefront Office", location: "Chicago, IL", value: "$5.8M", apy: "7.8%", tokenPrice: "$200", hot: false, category: "Commercial" },
  { name: "Sunrise Complex", location: "Phoenix, AZ", value: "$2.1M", apy: "10.1%", tokenPrice: "$85", hot: true, category: "Multifamily" },
  { name: "Tech Park", location: "Austin, TX", value: "$4.5M", apy: "8.5%", tokenPrice: "$175", hot: false, category: "Commercial" },
  { name: "Harbor Retail", location: "Seattle, WA", value: "$1.8M", apy: "6.9%", tokenPrice: "$65", hot: false, category: "Retail" },
  { name: "Industrial Hub", location: "Dallas, TX", value: "$6.2M", apy: "11.2%", tokenPrice: "$250", hot: true, category: "Industrial" },
];

export default function Explore() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProperties = properties.filter((property) => {
    const matchesFilter = activeFilter === "All" || property.category === activeFilter;
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <h1 className="font-display text-2xl font-bold text-foreground mb-4">
          Property Marketplace
        </h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl pl-12 pr-12 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/20 text-primary">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? "gradient-primary text-primary-foreground glow-primary"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {filteredProperties.map((property, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl overflow-hidden animate-fade-in hover:border-primary/30 transition-all cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Placeholder */}
              <div className="h-28 gradient-primary relative">
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                {property.hot && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 bg-accent/90 text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                    <Flame className="w-3 h-3" />
                    Hot
                  </span>
                )}
              </div>

              <div className="p-3 space-y-2">
                <h3 className="font-display font-semibold text-sm text-foreground truncate">
                  {property.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{property.location}</span>
                </div>

                <div className="space-y-1 pt-2 border-t border-border/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Value</span>
                    <span className="font-semibold text-foreground">{property.value}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">APY</span>
                    <span className="font-semibold text-success flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {property.apy}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Token</span>
                    <span className="font-semibold text-foreground">{property.tokenPrice}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
