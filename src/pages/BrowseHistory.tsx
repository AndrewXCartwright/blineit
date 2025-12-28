import { ArrowLeft, Clock, Trash2, Building2, Landmark, Target, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/hooks/useSearch';
import { formatDistanceToNow } from 'date-fns';

export default function BrowseHistory() {
  const navigate = useNavigate();
  const { recentSearches, clearRecentSearches, setSearchQuery, setSearchType } = useSearch();

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
    setSearchQuery(search.query);
    setSearchType(search.search_type);
    navigate(`/search?q=${encodeURIComponent(search.query)}&type=${search.search_type}`);
  };

  // Group searches by date
  const groupedSearches = recentSearches.reduce((acc: any, search) => {
    const date = new Date(search.created_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(search);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Browse History</h1>
                <p className="text-sm text-muted-foreground">{recentSearches.length} recent searches</p>
              </div>
            </div>
            {recentSearches.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => clearRecentSearches()}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {recentSearches.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Search History</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your search history will appear here. Start searching to build your history.
            </p>
            <Button onClick={() => navigate('/search')}>
              <Search className="h-4 w-4 mr-2" />
              Start Searching
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSearches).map(([date, searches]: [string, any]) => (
              <div key={date}>
                <h2 className="text-sm font-medium text-muted-foreground mb-3">
                  {new Date(date).toDateString() === new Date().toDateString() 
                    ? 'Today'
                    : new Date(date).toDateString() === new Date(Date.now() - 86400000).toDateString()
                    ? 'Yesterday'
                    : date}
                </h2>
                <div className="space-y-2">
                  {searches.map((search: any) => {
                    const Icon = getIcon(search.search_type);
                    return (
                      <Card 
                        key={search.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => runSearch(search)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{search.query}</p>
                                <Badge variant="outline" className="text-xs capitalize shrink-0">
                                  {search.search_type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(search.created_at), { addSuffix: true })}
                              </p>
                            </div>
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}