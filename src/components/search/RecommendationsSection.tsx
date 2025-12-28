import { Sparkles, Building2, Landmark, Target, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { Recommendation } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

interface RecommendationsSectionProps {
  items: Recommendation[];
  isLoading?: boolean;
  onDismiss?: (id: string) => void;
}

export function RecommendationsSection({ items, isLoading, onDismiss }: RecommendationsSectionProps) {
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
        return Sparkles;
    }
  };

  const getRoute = (item: Recommendation) => {
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

  const getTitle = (item: Recommendation) => {
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

  const getSubtitle = (item: Recommendation) => {
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

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'similar_investment':
        return { label: 'Similar to your investments', color: 'bg-blue-500/20 text-blue-500' };
      case 'high_apy':
        return { label: 'High APY', color: 'bg-green-500/20 text-green-500' };
      case 'trending':
        return { label: 'Trending', color: 'bg-orange-500/20 text-orange-500' };
      case 'new_listing':
        return { label: 'New listing', color: 'bg-purple-500/20 text-purple-500' };
      case 'watchlist_match':
        return { label: 'Matches your watchlist', color: 'bg-pink-500/20 text-pink-500' };
      default:
        return { label: 'Recommended', color: 'bg-primary/20 text-primary' };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">For You</h3>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">For You</h3>
      </div>
      <div className="grid gap-3">
        {items.slice(0, 5).map((item) => {
          const Icon = getIcon(item.item_type);
          const reason = getReasonBadge(item.recommendation_reason);
          return (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors group relative"
              onClick={() => navigate(getRoute(item))}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.item_type}
                      </Badge>
                      <Badge className={cn("border-0 text-xs", reason.color)}>
                        {reason.label}
                      </Badge>
                    </div>
                    <p className="font-medium truncate">{getTitle(item)}</p>
                    <p className="text-sm text-muted-foreground truncate">{getSubtitle(item)}</p>
                  </div>
                  {onDismiss && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(item.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}