import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, TrendingUp, TrendingDown, ShoppingCart, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useListings, useOrderBook, useSecondaryMarket, useTrades } from '@/hooks/useSecondaryMarket';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';

export default function MarketDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isSellOpen, setIsSellOpen] = useState(false);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  const { data: property } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await supabase.from('properties').select('*').eq('id', id).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: userHolding } = useQuery({
    queryKey: ['user-holding', id, user?.id],
    queryFn: async () => {
      if (!id || !user) return null;
      const { data } = await supabase.from('user_holdings').select('*').eq('property_id', id).eq('user_id', user.id).single();
      return data;
    },
    enabled: !!id && !!user,
  });

  const { data: listings = [] } = useListings('property_token', id);
  const { asks, bestAsk } = useOrderBook('property_token', id || '');
  const { data: allTrades = [] } = useTrades();
  const { executeTrade, createListing } = useSecondaryMarket();

  const recentTrades = allTrades.filter(t => t.item_id === id).slice(0, 10);
  const priceChange = Math.random() * 10 - 5; // Mock for demo

  const handleBuy = async () => {
    if (!selectedListing || !quantity) return;
    try {
      await executeTrade.mutateAsync({
        listingId: selectedListing,
        quantity: parseFloat(quantity),
      });
      setIsBuyOpen(false);
      setQuantity('');
      setSelectedListing(null);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleSell = async () => {
    if (!id || !quantity || !limitPrice) return;
    try {
      await createListing.mutateAsync({
        itemType: 'property_token',
        itemId: id,
        quantity: parseFloat(quantity),
        pricePerToken: parseFloat(limitPrice),
      });
      setIsSellOpen(false);
      setQuantity('');
      setLimitPrice('');
    } catch (error) {
      // Error handled in mutation
    }
  };

  const totalCost = selectedListing && quantity 
    ? parseFloat(quantity) * (listings.find(l => l.id === selectedListing)?.price_per_token || 0) * 1.01
    : 0;

  if (!property) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Market not found</h1>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/market')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <h1 className="text-xl font-bold">{property.name}</h1>
            </div>
            <p className="text-sm text-muted-foreground">{property.city}, {property.state} • Property Token</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className="text-center p-3">
            <div className="text-lg font-bold">{formatCurrency(property.token_price)}</div>
            <div className="text-xs text-muted-foreground">Last</div>
          </Card>
          <Card className="text-center p-3">
            <div className={`text-lg font-bold flex items-center justify-center gap-1 ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Today</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-lg font-bold">{formatCurrency(recentTrades.reduce((s, t) => s + t.total_price, 0))}</div>
            <div className="text-xs text-muted-foreground">Volume</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-lg font-bold">{recentTrades.length}</div>
            <div className="text-xs text-muted-foreground">Trades</div>
          </Card>
        </div>

        {/* Order Book & Recent Trades */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Order Book</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-xs text-muted-foreground mb-2">ASKS (Sell Orders)</p>
              {asks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sell orders</p>
              ) : (
                asks.slice(0, 5).map((ask, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-red-500">{formatCurrency(ask.price)}</span>
                    <span className="text-muted-foreground">{ask.quantity.toFixed(2)}</span>
                  </div>
                ))
              )}
              {bestAsk && (
                <div className="border-t pt-2 mt-2">
                  <p className="text-xs text-muted-foreground">Best Ask: {formatCurrency(bestAsk)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {recentTrades.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent trades</p>
              ) : (
                recentTrades.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{format(new Date(trade.created_at), 'h:mm a')}</span>
                    <span>{formatCurrency(trade.price_per_token)}</span>
                    <span className="text-muted-foreground">{trade.token_quantity}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button size="lg" className="w-full" onClick={() => setIsBuyOpen(true)} disabled={asks.length === 0}>
            <ShoppingCart className="h-5 w-5 mr-2" />
            Buy Tokens
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => setIsSellOpen(true)} disabled={!userHolding || userHolding.tokens <= 0}>
            <Tag className="h-5 w-5 mr-2" />
            Sell Tokens
          </Button>
        </div>

        {userHolding && (
          <p className="text-sm text-center text-muted-foreground mt-4">
            Your holdings: {userHolding.tokens.toFixed(2)} tokens ({formatCurrency(userHolding.tokens * property.token_price)})
          </p>
        )}
      </main>

      {/* Buy Modal */}
      <Dialog open={isBuyOpen} onOpenChange={setIsBuyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Buy Tokens
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{property.name}</p>
              <p className="text-sm text-muted-foreground">{property.city}, {property.state}</p>
            </div>

            <div className="space-y-2">
              <Label>Select Listing</Label>
              <RadioGroup value={selectedListing || ''} onValueChange={setSelectedListing}>
                {asks.map((ask) => (
                  <div key={ask.listingId} className="flex items-center space-x-2 p-2 border rounded-lg">
                    <RadioGroupItem value={ask.listingId} id={ask.listingId} />
                    <Label htmlFor={ask.listingId} className="flex-1 flex justify-between cursor-pointer">
                      <span>{formatCurrency(ask.price)}/token</span>
                      <span className="text-muted-foreground">{ask.quantity.toFixed(2)} available</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Quantity (tokens)</Label>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <div className="flex gap-2">
                {[1, 5, 10, 25].map((q) => (
                  <Button key={q} variant="outline" size="sm" onClick={() => setQuantity(q.toString())}>
                    {q}
                  </Button>
                ))}
              </div>
            </div>

            {selectedListing && quantity && (
              <Card className="bg-muted">
                <CardContent className="p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totalCost / 1.01)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (1%)</span>
                    <span>{formatCurrency(totalCost - totalCost / 1.01)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{formatCurrency(totalCost)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button className="w-full" onClick={handleBuy} disabled={!selectedListing || !quantity || executeTrade.isPending}>
              {executeTrade.isPending ? 'Processing...' : `Buy ${quantity || 0} Tokens`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sell Modal */}
      <Dialog open={isSellOpen} onOpenChange={setIsSellOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Sell Tokens
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{property.name}</p>
              <p className="text-sm text-muted-foreground">
                Your holdings: {userHolding?.tokens.toFixed(2) || 0} tokens
              </p>
            </div>

            <div className="space-y-2">
              <Label>Price per token</Label>
              <Input
                type="number"
                placeholder="e.g., 125.00"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Current market: {formatCurrency(property.token_price)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Quantity (tokens)</Label>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                max={userHolding?.tokens || 0}
              />
              <div className="flex gap-2">
                {userHolding && [5, 10, 20].map((q) => (
                  <Button key={q} variant="outline" size="sm" onClick={() => setQuantity(Math.min(q, userHolding.tokens).toString())} disabled={userHolding.tokens < q}>
                    {q}
                  </Button>
                ))}
                {userHolding && (
                  <Button variant="outline" size="sm" onClick={() => setQuantity(userHolding.tokens.toString())}>
                    All
                  </Button>
                )}
              </div>
            </div>

            {quantity && limitPrice && (
              <Card className="bg-muted">
                <CardContent className="p-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Gross Total</span>
                    <span>{formatCurrency(parseFloat(quantity) * parseFloat(limitPrice))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee (1%)</span>
                    <span>-{formatCurrency(parseFloat(quantity) * parseFloat(limitPrice) * 0.01)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>You'll Receive</span>
                    <span>{formatCurrency(parseFloat(quantity) * parseFloat(limitPrice) * 0.99)}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button className="w-full" onClick={handleSell} disabled={!quantity || !limitPrice || createListing.isPending}>
              {createListing.isPending ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <BottomNav />
    </div>
  );
}
