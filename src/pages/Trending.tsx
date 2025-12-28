import { ArrowLeft, Flame, Building2, Landmark, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearch, TrendingItem } from '@/hooks/useSearch';
import { cn } from '@/lib/utils';

export default function Trending() {
  const navigate = useNavigate();
  const { trendingItems } = useSearch();

  const propertyItems = trendingItems.filter(i => i.item_type === 'property');
  const loanItems = trendingItems.filter(i => i.item_type === 'loan');
  const predictionItems = trendingItems.filter(i => i.item_type === 'prediction');

  const getRoute = (item: TrendingItem) => {
    switch (item.item_type) {
      case 'property':
        return `/property/${item.item_id}`;
      case 'loan':
        return `/loan/${item.item_id}`;
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

  const renderItemList = (items: TrendingItem[], showRank = true) => (
    <div className="space-y-3">
      {items.map((item, index) => (
        <Card
          key={item.id}
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => navigate(getRoute(item))}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {showRank && (
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-lg font-bold text-lg",
                  index === 0 ? "bg-orange-500/20 text-orange-500" :
                  index === 1 ? "bg-yellow-500/20 text-yellow-500" :
                  index === 2 ? "bg-amber-500/20 text-amber-500" :
                  "bg-muted text-muted-foreground"
                )}>
                  #{index + 1}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {index < 3 && (
                    <Badge className="bg-orange-500/20 text-orange-500 border-0 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
                <p className="font-medium truncate">{getTitle(item)}</p>
                <p className="text-sm text-muted-foreground truncate">{getSubtitle(item)}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>{item.view_count} views</span>
                  <span>{item.investment_count} investors</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No trending items in this category
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6 text-orange-500" />
              <div>
                <h1 className="text-xl font-bold">Trending</h1>
                <p className="text-sm text-muted-foreground">Most popular right now</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="properties" className="gap-1">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger value="loans" className="gap-1">
              <Landmark className="h-4 w-4" />
              <span className="hidden sm:inline">Loans</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-1">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Predictions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {renderItemList(trendingItems)}
          </TabsContent>
          <TabsContent value="properties">
            {renderItemList(propertyItems)}
          </TabsContent>
          <TabsContent value="loans">
            {renderItemList(loanItems)}
          </TabsContent>
          <TabsContent value="predictions">
            {renderItemList(predictionItems)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}