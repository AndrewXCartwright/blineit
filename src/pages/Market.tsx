import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Building2, Landmark, ShoppingCart, Tag, ClipboardList, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useListings, useMyListings, useMyBuyOrders, useTrades } from '@/hooks/useSecondaryMarket';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';

interface MarketSummary {
  itemId: string;
  itemType: string;
  name: string;
  location: string;
  lastPrice: number;
  priceChange: number;
  volume24h: number;
  bestBid: number | null;
  bestAsk: number | null;
  spread: number | null;
}

export default function Market() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('markets');
  const { data: listings = [] } = useListings();
  const { data: myListings = [] } = useMyListings();
  const { data: myOrders = [] } = useMyBuyOrders();
  const { data: trades = [] } = useTrades();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('*');
      return data || [];
    },
  });

  // Group listings by item to create market summaries
  const marketSummaries: MarketSummary[] = properties.map(property => {
    const propertyListings = listings.filter(l => l.item_id === property.id && l.item_type === 'property_token');
    const bestAsk = propertyListings.length > 0 
      ? Math.min(...propertyListings.map(l => l.price_per_token))
      : null;
    
    return {
      itemId: property.id,
      itemType: 'property_token',
      name: property.name,
      location: `${property.city}, ${property.state}`,
      lastPrice: property.token_price,
      priceChange: Math.random() * 10 - 5, // Mock for demo
      volume24h: Math.random() * 50000, // Mock for demo
      bestBid: bestAsk ? bestAsk * 0.98 : null,
      bestAsk,
      spread: bestAsk ? 0.016 : null,
    };
  }).filter(m => m.bestAsk !== null || listings.some(l => l.item_id === m.itemId));

  const activeListings = myListings.filter(l => l.status === 'active' || l.status === 'partially_filled');
  const activeOrders = myOrders.filter(o => o.status === 'active' || o.status === 'partially_filled');
  const completedTrades = trades.filter(t => t.status === 'completed');

  const totalVolume = completedTrades.reduce((sum, t) => sum + t.total_price, 0);

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
              <RefreshCw className="h-6 w-6" />
              Secondary Market
            </h1>
            <p className="text-sm text-muted-foreground">Buy and sell tokens with other investors</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className="text-center p-3">
            <div className="text-xl font-bold">{formatCurrency(totalVolume)}</div>
            <div className="text-xs text-muted-foreground">Volume</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-xl font-bold">{listings.length}</div>
            <div className="text-xs text-muted-foreground">Listings</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-xl font-bold">{completedTrades.length}</div>
            <div className="text-xs text-muted-foreground">Trades</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-xl font-bold">1.0%</div>
            <div className="text-xs text-muted-foreground">Fee</div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <Button variant="outline" className="flex-col h-auto py-3" onClick={() => navigate('/market/all')}>
            <ShoppingCart className="h-5 w-5 mb-1" />
            <span className="text-xs">Buy</span>
          </Button>
          <Button variant="outline" className="flex-col h-auto py-3" onClick={() => navigate('/market/sell')}>
            <Tag className="h-5 w-5 mb-1" />
            <span className="text-xs">Sell</span>
          </Button>
          <Button variant="outline" className="flex-col h-auto py-3" onClick={() => navigate('/market/orders')}>
            <ClipboardList className="h-5 w-5 mb-1" />
            <span className="text-xs">Orders</span>
          </Button>
          <Button variant="outline" className="flex-col h-auto py-3" onClick={() => navigate('/market/history')}>
            <History className="h-5 w-5 mb-1" />
            <span className="text-xs">History</span>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="markets" className="flex-1">Hot Markets</TabsTrigger>
            <TabsTrigger value="my-orders" className="flex-1">My Orders ({activeListings.length + activeOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="markets" className="space-y-3">
            {marketSummaries.length === 0 ? (
              <Card className="p-8 text-center">
                <RefreshCw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Active Markets</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to list tokens for sale!
                </p>
                <Button onClick={() => navigate('/market/sell')}>
                  Create Listing
                </Button>
              </Card>
            ) : (
              marketSummaries.slice(0, 5).map((market) => (
                <Card key={market.itemId} className="overflow-hidden cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate(`/market/${market.itemId}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{market.name}</h3>
                          <p className="text-sm text-muted-foreground">{market.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(market.lastPrice)}</div>
                        <div className={`text-sm flex items-center justify-end gap-1 ${market.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {market.priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {market.priceChange >= 0 ? '+' : ''}{market.priceChange.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Vol: {formatCurrency(market.volume24h)}</span>
                      {market.bestBid && market.bestAsk && (
                        <span>Bid: {formatCurrency(market.bestBid)} | Ask: {formatCurrency(market.bestAsk)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            {marketSummaries.length > 5 && (
              <Button variant="outline" className="w-full" onClick={() => navigate('/market/all')}>
                View All Markets
              </Button>
            )}
          </TabsContent>

          <TabsContent value="my-orders" className="space-y-3">
            {activeListings.length === 0 && activeOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Active Orders</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create a listing or place a buy order to get started.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => navigate('/market/all')}>
                    Buy Tokens
                  </Button>
                  <Button onClick={() => navigate('/market/sell')}>
                    Sell Tokens
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {activeListings.map((listing) => {
                  const property = properties.find(p => p.id === listing.item_id);
                  return (
                    <Card key={listing.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">SELL</Badge>
                            <Badge variant={listing.status === 'partially_filled' ? 'secondary' : 'default'}>
                              {listing.status === 'partially_filled' ? 'Partial' : 'Active'}
                            </Badge>
                          </div>
                        </div>
                        <h4 className="font-medium">{property?.name || 'Unknown'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {listing.token_quantity - listing.filled_quantity} tokens @ {formatCurrency(listing.price_per_token)}
                        </p>
                        {listing.filled_quantity > 0 && (
                          <p className="text-sm text-green-500">
                            Filled: {listing.filled_quantity}/{listing.token_quantity}
                          </p>
                        )}
                        <Button variant="link" className="p-0 h-auto mt-2" onClick={() => navigate('/market/orders')}>
                          Manage →
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
                {activeOrders.map((order) => {
                  const property = properties.find(p => p.id === order.item_id);
                  return (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-500/10 text-green-500">BUY</Badge>
                            <Badge variant="default">Active</Badge>
                          </div>
                        </div>
                        <h4 className="font-medium">{property?.name || 'Unknown'}</h4>
                        <p className="text-sm text-muted-foreground">
                          {order.token_quantity} tokens @ max {formatCurrency(order.max_price_per_token)}
                        </p>
                        <Button variant="link" className="p-0 h-auto mt-2" onClick={() => navigate('/market/orders')}>
                          Manage →
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNav />
    </div>
  );
}
