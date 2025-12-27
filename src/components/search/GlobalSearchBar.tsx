import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, TrendingUp, Building2, Landmark, Target } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSearch } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface GlobalSearchBarProps {
  variant?: 'header' | 'page';
  onSearch?: (query: string) => void;
}

export function GlobalSearchBar({ variant = 'header', onSearch }: GlobalSearchBarProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { recentSearches, setSearchQuery, setSearchType, clearRecentSearches } = useSearch();

  const searchTypes = [
    { id: 'all', label: 'All' },
    { id: 'properties', label: 'Properties' },
    { id: 'loans', label: 'Loans' },
    { id: 'predictions', label: 'Predictions' },
  ];

  const popularSearches = [
    { query: '8%+ APY properties', icon: TrendingUp },
    { query: 'New listings this week', icon: Building2 },
    { query: 'Markets closing soon', icon: Target },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query: string, type?: string) => {
    setSearchQuery(query);
    if (type) {
      setSearchType(type as any);
    }
    setIsOpen(false);
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}${type ? `&type=${type}` : ''}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && localQuery) {
      handleSearch(localQuery);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search properties, loans, predictions..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "pl-10 pr-10",
            variant === 'header' ? "h-9 bg-background/50 border-border/50" : "h-11"
          )}
        />
        {localQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => {
              setLocalQuery('');
              inputRef.current?.focus();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Search type selector */}
          <div className="p-3 border-b border-border">
            <p className="text-xs text-muted-foreground mb-2">SEARCH IN</p>
            <div className="flex flex-wrap gap-2">
              {searchTypes.map((type) => (
                <Badge
                  key={type.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => {
                    setSearchType(type.id as any);
                    if (localQuery) {
                      handleSearch(localQuery, type.id);
                    }
                  }}
                >
                  {type.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">RECENT SEARCHES</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => clearRecentSearches()}
                >
                  Clear
                </Button>
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 3).map((search) => (
                  <button
                    key={search.id}
                    className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-muted text-left text-sm"
                    onClick={() => handleSearch(search.query, search.search_type)}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{search.query}</span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {search.search_type}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          <div className="p-3">
            <p className="text-xs text-muted-foreground mb-2">POPULAR SEARCHES</p>
            <div className="space-y-1">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-muted text-left text-sm"
                  onClick={() => handleSearch(search.query)}
                >
                  <search.icon className="h-4 w-4 text-primary" />
                  <span>{search.query}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
