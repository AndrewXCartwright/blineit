import { ArrowLeft, Search, Bell, Trash2, Play, Clock, Building2, Landmark, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSearch } from '@/hooks/useSearch';
import { formatDistanceToNow } from 'date-fns';

export default function SavedSearches() {
  const navigate = useNavigate();
  const { savedSearches, deleteSavedSearch, setFilters, setSearchType, setSearchQuery } = useSearch();

  const getIcon = (type: string) => {
    switch (type) {
      case 'properties':
        return Building2;
      case 'loans':
        return Landmark;
      case 'predictions':
        return Target;
      default:
        return Search;
    }
  };

  const runSearch = (search: any) => {
    setSearchQuery('');
    setSearchType(search.search_type);
    setFilters(search.filters || {});
    navigate(`/search?type=${search.search_type}`);
  };

  const getFilterSummary = (filters: any) => {
    if (!filters) return 'No filters';
    const keys = Object.keys(filters).filter(k => filters[k] !== undefined);
    if (keys.length === 0) return 'No filters';
    return `${keys.length} filter${keys.length !== 1 ? 's' : ''} applied`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Saved Searches</h1>
              <p className="text-sm text-muted-foreground">{savedSearches.length} saved searches</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {savedSearches.length === 0 ? (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Saved Searches</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Save your searches to quickly access them later and get notified when new matches appear.
            </p>
            <Button onClick={() => navigate('/search')}>
              <Search className="h-4 w-4 mr-2" />
              Start Searching
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedSearches.map((search) => {
              const Icon = getIcon(search.search_type);
              return (
                <Card key={search.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold truncate">{search.name}</h3>
                            <Badge variant="outline" className="text-xs capitalize">
                              {search.search_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {getFilterSummary(search.filters)}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {search.last_run_at 
                                ? `Last run ${formatDistanceToNow(new Date(search.last_run_at), { addSuffix: true })}`
                                : 'Never run'}
                            </span>
                            {search.results_count !== undefined && (
                              <span>{search.results_count} results</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Bell className={`h-4 w-4 ${search.notify_new_matches ? 'text-primary' : 'text-muted-foreground'}`} />
                          <Switch checked={search.notify_new_matches} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => runSearch(search)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run Search
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteSavedSearch(search.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}