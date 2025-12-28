import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, MapPin, TrendingUp, Flame, Search, SlidersHorizontal, Grid3X3, List, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { PullToRefresh } from "@/components/PullToRefresh";
import { BottomNav } from "@/components/BottomNav";

interface Property {
  id: string;
  name: string;
  city: string;
  state: string;
  value: number;
  apy: number;
  token_price: number;
  total_tokens?: number;
  occupancy?: number;
  category: string;
  is_hot?: boolean;
  image_url?: string;
}

export default function PropertiesListing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [sortBy, setSortBy] = useState("newest");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("properties").select("*");
    if (!error && data) {
      setProperties(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredProperties = properties
    .filter((property) => {
      const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || property.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "apy-high":
          return b.apy - a.apy;
        case "apy-low":
          return a.apy - b.apy;
        case "value-high":
          return b.value - a.value;
        case "value-low":
          return a.value - b.value;
        case "price-high":
          return b.token_price - a.token_price;
        case "price-low":
          return a.token_price - b.token_price;
        default:
          return 0;
      }
    });

  const categories = [...new Set(properties.map(p => p.category))];

  return (
    <div className="min-h-screen bg-background pb-20">
      <PullToRefresh onRefresh={fetchProperties}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-display font-bold text-foreground">{t('propertiesListing.title')}</h1>
              <p className="text-xs text-muted-foreground">{t('propertiesListing.availableInvestments', { count: filteredProperties.length })}</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="px-4 pb-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('propertiesListing.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t('propertiesListing.category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('propertiesListing.allCategories')}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={t('propertiesListing.sortBy')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{t('propertiesListing.sortNewest')}</SelectItem>
                  <SelectItem value="apy-high">{t('propertiesListing.sortApyHigh')}</SelectItem>
                  <SelectItem value="apy-low">{t('propertiesListing.sortApyLow')}</SelectItem>
                  <SelectItem value="value-high">{t('propertiesListing.sortValueHigh')}</SelectItem>
                  <SelectItem value="value-low">{t('propertiesListing.sortValueLow')}</SelectItem>
                  <SelectItem value="price-high">{t('propertiesListing.sortPriceHigh')}</SelectItem>
                  <SelectItem value="price-low">{t('propertiesListing.sortPriceLow')}</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-border rounded-lg">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-r-none"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-l-none"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4">
          {loading ? (
            <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-3"}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden">
                  <Skeleton className="h-28" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">{t('propertiesListing.noProperties')}</h3>
              <p className="text-sm text-muted-foreground">{t('propertiesListing.adjustFilters')}</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredProperties.map((property, index) => (
                <div
                  key={property.id}
                  onClick={() => navigate(`/property/${property.id}`)}
                  className="glass-card rounded-2xl overflow-hidden animate-fade-in interactive-card cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="h-24 relative overflow-hidden">
                    {property.image_url ? (
                      <img 
                        src={property.image_url} 
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full gradient-primary flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-primary-foreground/20" />
                      </div>
                    )}
                    {property.is_hot && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 bg-accent/90 text-accent-foreground px-2 py-0.5 rounded-full text-[10px] font-medium">
                        <Flame className="w-3 h-3" />{t('propertiesListing.hot')}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-display font-semibold text-sm text-foreground truncate mb-1">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{property.city}, {property.state}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">${property.token_price}</span>
                      <span className="text-success font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {property.apy}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProperties.map((property, index) => (
                <div
                  key={property.id}
                  onClick={() => navigate(`/property/${property.id}`)}
                  className="glass-card rounded-2xl overflow-hidden animate-fade-in interactive-card cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex">
                    <div className="w-28 h-28 relative flex-shrink-0 overflow-hidden">
                      {property.image_url ? (
                        <img 
                          src={property.image_url} 
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full gradient-primary flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-primary-foreground/20" />
                        </div>
                      )}
                      {property.is_hot && (
                        <span className="absolute top-2 left-2 flex items-center gap-1 bg-accent/90 text-accent-foreground px-2 py-0.5 rounded-full text-[10px] font-medium">
                          <Flame className="w-3 h-3" />{t('propertiesListing.hot')}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-display font-semibold text-sm text-foreground leading-tight pr-2">
                          {property.name}
                        </h3>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {property.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{property.city}, {property.state}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-muted-foreground">{t('propertiesListing.token')}:</span>
                          <span className="font-semibold text-foreground">${property.token_price}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <TrendingUp className="w-3 h-3 text-success" />
                          <span className="font-semibold text-success">{property.apy}% {t('investments.apy')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs col-span-2">
                          <span className="text-muted-foreground">{t('propertiesListing.value')}:</span>
                          <span className="font-semibold text-foreground">${(property.value / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </PullToRefresh>
      <BottomNav />
    </div>
  );
}