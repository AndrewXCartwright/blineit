import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search as SearchIcon, Building2, Landmark, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/Skeleton';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { SearchFilters, ActiveFilterPills } from '@/components/search/SearchFilters';
import { SaveSearchDialog } from '@/components/search/SaveSearchDialog';
import { SortSelect } from '@/components/search/SortSelect';
import { TrendingSection } from '@/components/search/TrendingSection';
import { RecommendationsSection } from '@/components/search/RecommendationsSection';
import { useSearch } from '@/hooks/useSearch';

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    searchResults,
    isLoading,
    saveSearch,
    isSavingSearch,
    trendingItems,
    recommendations,
    dismissRecommendation,
  } = useSearch();

  // Sync URL params with search state
  useEffect(() => {
    const q = searchParams.get('q');
    const type = searchParams.get('type');
    
    if (q) setSearchQuery(q);
    if (type) setSearchType(type as any);
  }, [searchParams, setSearchQuery, setSearchType]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSearchParams({ q: query, type: searchType });
  };

  const propertyResults = searchResults.filter(r => r.type === 'property');
  const loanResults = searchResults.filter(r => r.type === 'loan');
  const predictionResults = searchResults.filter(r => r.type === 'prediction');

  const getFilteredResults = () => {
    switch (searchType) {
      case 'properties':
        return propertyResults;
      case 'loans':
        return loanResults;
      case 'predictions':
        return predictionResults;
      default:
        return searchResults;
    }
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search properties, loans, predictions..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 h-11"
                  autoFocus
                />
              </div>
            </div>
          </div>

          <Tabs value={searchType} onValueChange={(v) => setSearchType(v as any)}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all" className="gap-1">
                All
                {searchResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {searchResults.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="properties" className="gap-1">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Properties</span>
                {propertyResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {propertyResults.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="loans" className="gap-1">
                <Landmark className="h-4 w-4" />
                <span className="hidden sm:inline">Loans</span>
                {loanResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {loanResults.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="predictions" className="gap-1">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Predictions</span>
                {predictionResults.length > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {predictionResults.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        {/* Filters and Sort */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {searchType !== 'all' && (
              <SearchFilters
                type={searchType as any}
                filters={filters}
                onChange={setFilters}
                resultsCount={filteredResults.length}
              />
            )}
            {(searchQuery || Object.keys(filters).length > 0) && (
              <SaveSearchDialog
                filters={filters}
                searchType={searchType}
                onSave={(name, notify) => saveSearch({ name, notifyNewMatches: notify })}
                isSaving={isSavingSearch}
              />
            )}
          </div>
          {searchType !== 'all' && (
            <SortSelect
              type={searchType as any}
              value={sortBy}
              onChange={setSortBy}
            />
          )}
        </div>

        {/* Active Filters */}
        <ActiveFilterPills filters={filters} onChange={setFilters} />

        {/* Results Count */}
        {(searchQuery || Object.keys(filters).length > 0) && (
          <p className="text-sm text-muted-foreground mb-4">
            {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} 
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Results */}
        {!isLoading && filteredResults.length > 0 && (
          <div className="space-y-3">
            {filteredResults.map((result) => (
              <SearchResultCard
                key={`${result.type}-${result.id}`}
                result={result}
                highlightQuery={searchQuery}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredResults.length === 0 && (searchQuery || Object.keys(filters).length > 0) && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your current search and filters returned no results. Try expanding your search criteria.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => setFilters({})}>
                Clear All Filters
              </Button>
              <Button onClick={() => saveSearch({ name: 'New Search Alert', notifyNewMatches: true })}>
                Save Search & Get Notified
              </Button>
            </div>
          </div>
        )}

        {/* Empty State with Trending and Recommendations */}
        {!isLoading && !searchQuery && Object.keys(filters).length === 0 && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-8">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Search Across All Assets</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Find properties, loans, and prediction markets that match your investment criteria.
              </p>
            </div>

            {/* Trending and Recommendations Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <TrendingSection items={trendingItems} />
              <RecommendationsSection 
                items={recommendations} 
                onDismiss={dismissRecommendation}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
