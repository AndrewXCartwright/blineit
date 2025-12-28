import { TrendingUp, Building2, Landmark, Target, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import type { TrendingItem } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface TrendingSectionProps {
  items: TrendingItem[];
  isLoading?: boolean;
}

export function TrendingSection({ items, isLoading }: TrendingSectionProps) {
  const navigate = useNavigate();

  const getIcon = (type: string) => {
    switch (type) {
      case 'property':
        return Building2;
      case 'loan':
        return Landmark;
      case 'prediction':
        return Target;
      default:
        return TrendingUp;
    }
  };

  const getRoute = (item: TrendingItem) => {
    switch (item.item_type) {
      case 'property':
        return `/properties/${item.item_id}`;
      case 'loan':
        return `/loans/${item.item_id}`;
      case 'prediction':
        return `/predict?market=${item.item_id}`;
      default:
        return '/';
    }
  };

  const getTitle = (item: TrendingItem) => {
    if (!item.data) return 'Loading...';
    switch (item.item_type) {
      case 'property':
        return item.data.name;
      case 'loan':
        return item.data.name;
      case 'prediction':
        return item.data.title || item.data.question;
      default:
        return 'Unknown';
    }
  };

  const getSubtitle = (item: TrendingItem) => {
    if (!item.data) return '';
    switch (item.item_type) {
      case 'property':
        return `${item.data.city}, ${item.data.state} • ${item.data.apy}% APY`;
      case 'loan':
        return `${item.data.apy}% APY • ${item.data.term_months} months`;
      case 'prediction':
        return `${item.data.yes_price}% Yes • $${item.data.volume?.toLocaleString() || 0} volume`;
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold">Trending Now</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold">Trending Now</h3>
      </div>
      <div className="grid gap-3">
        {items.slice(0, 5).map((item, index) => {
          const Icon = getIcon(item.item_type);
          return (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => navigate(getRoute(item))}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg",
                    index === 0 ? "bg-orange-500/20 text-orange-500" :
                    index === 1 ? "bg-yellow-500/20 text-yellow-500" :
                    index === 2 ? "bg-amber-500/20 text-amber-500" :
                    "bg-muted text-muted-foreground"
                  )}>
                    <span className="font-bold text-lg">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.item_type}
                      </Badge>
                      {index < 3 && (
                        <Badge className="bg-orange-500/20 text-orange-500 border-0 text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Hot
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium truncate">{getTitle(item)}</p>
                    <p className="text-sm text-muted-foreground truncate">{getSubtitle(item)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}