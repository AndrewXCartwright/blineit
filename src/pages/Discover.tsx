import { useNavigate } from 'react-router-dom';
import { 
  Search, TrendingUp, Building2, Landmark, Target, MapPin, 
  Sparkles, ArrowRight, Flame, Star, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TrendingSection } from '@/components/search/TrendingSection';
import { RecommendationsSection } from '@/components/search/RecommendationsSection';
import { useSearch } from '@/hooks/useSearch';

const categories = [
  { slug: 'multifamily', name: 'Multifamily', icon: Building2, count: 24, color: 'bg-blue-500/10 text-blue-500' },
  { slug: 'commercial', name: 'Commercial', icon: Building2, count: 18, color: 'bg-purple-500/10 text-purple-500' },
  { slug: 'industrial', name: 'Industrial', icon: Building2, count: 12, color: 'bg-orange-500/10 text-orange-500' },
  { slug: 'bridge-loans', name: 'Bridge Loans', icon: Landmark, count: 15, color: 'bg-green-500/10 text-green-500' },
  { slug: 'fix-flip', name: 'Fix & Flip', icon: Landmark, count: 9, color: 'bg-yellow-500/10 text-yellow-500' },
  { slug: 'predictions', name: 'Predictions', icon: Target, count: 32, color: 'bg-pink-500/10 text-pink-500' },
];

const locations = [
  { slug: 'california', name: 'California', count: 45 },
  { slug: 'texas', name: 'Texas', count: 38 },
  { slug: 'florida', name: 'Florida', count: 29 },
  { slug: 'new-york', name: 'New York', count: 22 },
  { slug: 'arizona', name: 'Arizona', count: 18 },
  { slug: 'colorado', name: 'Colorado', count: 15 },
];

const quickFilters = [
  { label: 'High APY (8%+)', query: 'high-apy', icon: TrendingUp },
  { label: 'New Listings', query: 'new', icon: Star },
  { label: 'Closing Soon', query: 'closing-soon', icon: Clock },
  { label: 'Trending Now', query: 'trending', icon: Flame },
];

export default function Discover() {
  const navigate = useNavigate();
  const { trendingItems, recommendations, dismissRecommendation, setSearchQuery } = useSearch();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">Discover</h1>
          <p className="text-muted-foreground mb-6">Explore investment opportunities</p>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search properties, loans, predictions..."
              className="pl-10 h-12 bg-background"
              onClick={() => navigate('/search')}
              readOnly
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {quickFilters.map((filter) => (
              <Button
                key={filter.query}
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => handleSearch(filter.query)}
              >
                <filter.icon className="h-4 w-4" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Browse by Category</h2>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/search/advanced')}>
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Card 
                key={cat.slug}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => navigate(`/discover/category/${cat.slug}`)}
              >
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center mb-3`}>
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-sm text-muted-foreground">{cat.count} listings</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Locations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Popular Locations</h2>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/search/advanced')}>
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {locations.map((loc) => (
              <Button
                key={loc.slug}
                variant="outline"
                className="shrink-0 gap-2"
                onClick={() => navigate(`/discover/location/${loc.slug}`)}
              >
                <MapPin className="h-4 w-4" />
                {loc.name}
                <Badge variant="secondary" className="ml-1">{loc.count}</Badge>
              </Button>
            ))}
          </div>
        </section>

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Trending Now
            </h2>
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/discover/trending')}>
              See All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <TrendingSection items={trendingItems.slice(0, 3)} />
        </section>

        {/* Recommendations */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommended for You
            </h2>
          </div>
          <RecommendationsSection 
            items={recommendations.slice(0, 3)} 
            onDismiss={dismissRecommendation}
          />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-3">
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/search/saved')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Saved Searches</p>
                <p className="text-sm text-muted-foreground">Quick access</p>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate('/search/history')}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">History</p>
                <p className="text-sm text-muted-foreground">Recent searches</p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}