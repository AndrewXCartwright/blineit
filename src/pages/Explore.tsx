import { useNavigate } from "react-router-dom";
import { Search, Filter, MapPin, TrendingUp, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/Skeleton";

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

const filters = ["All", "Multifamily", "Commercial", "Industrial", "Retail"];

export default function Explore() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase.from("properties").select("*");
      if (!error && data) setProperties(data);
      setLoading(false);
    };
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((property) => {
    const matchesFilter = activeFilter === "All" || property.category === activeFilter;
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <h1 className="font-display text-2xl font-bold text-foreground mb-4">Property Marketplace</h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl pl-12 pr-12 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/20 text-primary">
            <Filter className="w-4 h-4" />
          </button>
        </div>

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
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <Skeleton className="h-28" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : (
            filteredProperties.map((property) => (
              <div
                key={property.id}
                onClick={() => navigate(`/property/${property.id}`)}
                className="glass-card rounded-2xl overflow-hidden animate-fade-in hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="h-28 gradient-primary relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                  {property.is_hot && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 bg-accent/90 text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                      <Flame className="w-3 h-3" />Hot
                    </span>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-display font-semibold text-sm text-foreground truncate">{property.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{property.city}, {property.state}</span>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-border/50">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Value</span>
                      <span className="font-semibold text-foreground">${(property.value / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">APY</span>
                      <span className="font-semibold text-success flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />{property.apy}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
