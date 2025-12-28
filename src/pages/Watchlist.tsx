import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Bell, Building2, Landmark, Target, TrendingUp, TrendingDown, ArrowLeft, Plus, Filter, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWatchlists, useWatchlistItems, WatchlistItem } from '@/hooks/useWatchlist';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/formatters';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';

interface EnrichedWatchlistItem extends WatchlistItem {
  name?: string;
  location?: string;
  apy?: number;
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
  yesPrice?: number;
  expiresAt?: string;
}

export default function Watchlist() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { watchlists, ensureDefaultWatchlist } = useWatchlists();
  const { items, removeItem } = useWatchlistItems();
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    if (user && watchlists.length === 0) {
      ensureDefaultWatchlist();
    }
  }, [user, watchlists.length]);

  // Fetch properties, loans, and predictions to enrich watchlist items
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('*');
      return data || [];
    },
  });

  const { data: loans = [] } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data } = await supabase.from('loans').select('*');
      return data || [];
    },
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const { data } = await supabase.from('prediction_markets').select('*');
      return data || [];
    },
  });

  // Enrich items with current data
  const enrichedItems: EnrichedWatchlistItem[] = items.map((item) => {
    if (item.item_type === 'property') {
      const property = properties.find((p) => p.id === item.item_id);
      if (property) {
        const currentPrice = property.token_price;
        const priceChange = currentPrice - item.added_price;
        const priceChangePercent = (priceChange / item.added_price) * 100;
        return {
          ...item,
          name: property.name,
          location: `${property.city}, ${property.state}`,
          apy: property.apy,
          currentPrice,
          priceChange,
          priceChangePercent,
        };
      }
    } else if (item.item_type === 'loan') {
      const loan = loans.find((l) => l.id === item.item_id);
      if (loan) {
        return {
          ...item,
          name: loan.name,
          location: `${loan.city}, ${loan.state}`,
          apy: loan.apy,
          currentPrice: loan.amount_funded,
        };
      }
    } else if (item.item_type === 'prediction') {
      const prediction = predictions.find((p) => p.id === item.item_id);
      if (prediction) {
        const priceChange = prediction.yes_price - item.added_price;
        return {
          ...item,
          name: prediction.title || prediction.question,
          yesPrice: prediction.yes_price,
          currentPrice: prediction.yes_price,
          priceChange,
          priceChangePercent: priceChange,
          expiresAt: prediction.expires_at,
        };
      }
    }
    return item;
  });

  const filteredItems = enrichedItems.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'properties') return item.item_type === 'property';
    if (activeTab === 'loans') return item.item_type === 'loan';
    if (activeTab === 'predictions') return item.item_type === 'prediction';
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortBy === 'change') {
      return (b.priceChangePercent || 0) - (a.priceChangePercent || 0);
    }
    if (sortBy === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }
    return 0;
  });

  const stats = {
    properties: items.filter((i) => i.item_type === 'property').length,
    loans: items.filter((i) => i.item_type === 'loan').length,
    predictions: items.filter((i) => i.item_type === 'prediction').length,
    avgChange: enrichedItems.length > 0
      ? enrichedItems.reduce((acc, item) => acc + (item.priceChangePercent || 0), 0) / enrichedItems.length
      : 0,
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Building2 className="h-4 w-4" />;
      case 'loan':
        return <Landmark className="h-4 w-4" />;
      case 'prediction':
        return <Target className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const handleViewItem = (item: EnrichedWatchlistItem) => {
    if (item.item_type === 'property') {
      navigate(`/property/${item.item_id}`);
    } else if (item.item_type === 'loan') {
      navigate(`/loan/${item.item_id}`);
    } else if (item.item_type === 'prediction') {
      navigate(`/predict`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              My Watchlist
            </h1>
            <p className="text-sm text-muted-foreground">Track your favorite investments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className="text-center p-3">
            <div className="text-2xl font-bold">{stats.properties}</div>
            <div className="text-xs text-muted-foreground">Properties</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-2xl font-bold">{stats.loans}</div>
            <div className="text-xs text-muted-foreground">Loans</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-2xl font-bold">{stats.predictions}</div>
            <div className="text-xs text-muted-foreground">Predictions</div>
          </Card>
          <Card className="text-center p-3">
            <div className={`text-2xl font-bold ${stats.avgChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {stats.avgChange >= 0 ? '+' : ''}{stats.avgChange.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Avg Change</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">All ({items.length})</TabsTrigger>
            <TabsTrigger value="properties" className="flex-1">Properties ({stats.properties})</TabsTrigger>
            <TabsTrigger value="loans" className="flex-1">Loans ({stats.loans})</TabsTrigger>
            <TabsTrigger value="predictions" className="flex-1">Predictions ({stats.predictions})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Sort & Filters */}
        <div className="flex justify-between items-center mb-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="change">Price Change</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => navigate('/alerts')}>
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </Button>
        </div>

        {/* Watchlist Items */}
        <div className="space-y-3">
          {sortedItems.length === 0 ? (
            <Card className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Your watchlist is empty</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add properties, loans, or predictions to track them here.
              </p>
              <Button onClick={() => navigate('/assets')}>
                Browse Assets
              </Button>
            </Card>
          ) : (
            sortedItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {getItemIcon(item.item_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium truncate">{item.name || 'Unknown'}</span>
                        </div>
                        {item.location && (
                          <p className="text-sm text-muted-foreground">{item.location}</p>
                        )}
                        {item.apy && (
                          <p className="text-sm text-muted-foreground">{item.apy}% APY</p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {item.item_type === 'prediction' ? (
                            <>
                              <span>Current: <span className="text-green-500">{item.yesPrice}%</span></span>
                              <span>When Added: {item.added_price}%</span>
                            </>
                          ) : (
                            <>
                              <span>Current: {formatCurrency(item.currentPrice || 0)}</span>
                              <span>When Added: {formatCurrency(item.added_price)}</span>
                            </>
                          )}
                        </div>
                        
                        {item.priceChange !== undefined && (
                          <div className={`flex items-center gap-1 mt-1 text-sm ${item.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {item.priceChange >= 0 ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                            <span>
                              {item.priceChange >= 0 ? '+' : ''}
                              {item.item_type === 'prediction' 
                                ? `${item.priceChange.toFixed(0)}%`
                                : `${formatCurrency(item.priceChange)} (${item.priceChangePercent?.toFixed(1)}%)`
                              }
                            </span>
                          </div>
                        )}

                        {item.notes && (
                          <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            <span className="truncate">{item.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleViewItem(item)}>
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => navigate('/alerts')}>
                      <Bell className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeItem.mutate(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
