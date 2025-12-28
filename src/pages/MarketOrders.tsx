import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, Tag, ShoppingCart, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useMyListings, useMyBuyOrders, useSecondaryMarket } from '@/hooks/useSecondaryMarket';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';

export default function MarketOrders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const { data: listings = [] } = useMyListings();
  const { data: buyOrders = [] } = useMyBuyOrders();
  const { cancelListing, cancelBuyOrder } = useSecondaryMarket();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('*');
      return data || [];
    },
  });

  const activeListings = listings.filter(l => l.status === 'active' || l.status === 'partially_filled');
  const filledListings = listings.filter(l => l.status === 'filled');
  const cancelledListings = listings.filter(l => l.status === 'cancelled');

  const activeOrders = buyOrders.filter(o => o.status === 'active' || o.status === 'partially_filled');
  const filledOrders = buyOrders.filter(o => o.status === 'filled');
  const cancelledOrders = buyOrders.filter(o => o.status === 'cancelled');

  const getPropertyName = (itemId: string) => {
    return properties.find(p => p.id === itemId)?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/market')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="h-6 w-6" />
              My Orders
            </h1>
            <p className="text-sm text-muted-foreground">Manage your listings and buy orders</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="active" className="flex-1">Active ({activeListings.length + activeOrders.length})</TabsTrigger>
            <TabsTrigger value="filled" className="flex-1">Filled ({filledListings.length + filledOrders.length})</TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1">Cancelled ({cancelledListings.length + cancelledOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeListings.length === 0 && activeOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Active Orders</h3>
                <p className="text-sm text-muted-foreground">You don't have any active orders.</p>
              </Card>
            ) : (
              <>
                {activeListings.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">SELL LISTINGS</h3>
                    {activeListings.map((listing) => {
                      const fillPercent = (listing.filled_quantity / listing.token_quantity) * 100;
                      return (
                        <Card key={listing.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                <span className="font-medium">SELL LISTING</span>
                              </div>
                              <Badge variant={listing.status === 'partially_filled' ? 'secondary' : 'default'}>
                                {listing.status === 'partially_filled' ? 'Partial Fill' : 'Active'}
                              </Badge>
                            </div>
                            <h4 className="font-semibold mb-1">{getPropertyName(listing.item_id)}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {listing.token_quantity} tokens @ {formatCurrency(listing.price_per_token)}/token
                            </p>
                            <p className="text-sm mb-2">Total: {formatCurrency(listing.total_price)}</p>
                            
                            {listing.filled_quantity > 0 && (
                              <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Filled: {listing.filled_quantity}/{listing.token_quantity} tokens</span>
                                  <span>{fillPercent.toFixed(0)}%</span>
                                </div>
                                <Progress value={fillPercent} className="h-2" />
                              </div>
                            )}
                            
                            <p className="text-xs text-muted-foreground mb-3">
                              Created: {format(new Date(listing.created_at), 'MMM d, yyyy')}
                            </p>
                            
                            <div className="flex gap-2">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Listing?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will cancel your listing and return {listing.token_quantity - listing.filled_quantity} tokens to your holdings.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Listing</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => cancelListing.mutate(listing.id)}>
                                      Cancel Listing
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {activeOrders.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">BUY ORDERS</h3>
                    {activeOrders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              <span className="font-medium">BUY ORDER (Limit)</span>
                            </div>
                            <Badge>Active</Badge>
                          </div>
                          <h4 className="font-semibold mb-1">{getPropertyName(order.item_id)}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {order.token_quantity} tokens @ max {formatCurrency(order.max_price_per_token)}/token
                          </p>
                          <p className="text-sm mb-2">Max Total: {formatCurrency(order.token_quantity * order.max_price_per_token)}</p>
                          
                          {order.expires_at && (
                            <p className="text-xs text-muted-foreground mb-3">
                              Expires: {format(new Date(order.expires_at), 'MMM d, yyyy')}
                            </p>
                          )}
                          
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => cancelBuyOrder.mutate(order.id)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Cancel Order
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="filled" className="space-y-3">
            {filledListings.length === 0 && filledOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No filled orders yet.</p>
              </Card>
            ) : (
              [...filledListings, ...filledOrders].map((item) => {
                const isListing = 'seller_id' in item;
                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          {isListing ? 'SOLD' : 'BOUGHT'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(item.updated_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h4 className="font-medium">{getPropertyName(item.item_id)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.token_quantity} tokens @ {formatCurrency(isListing ? (item as typeof listings[0]).price_per_token : (item as typeof buyOrders[0]).max_price_per_token)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-3">
            {cancelledListings.length === 0 && cancelledOrders.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No cancelled orders.</p>
              </Card>
            ) : (
              [...cancelledListings, ...cancelledOrders].map((item) => {
                const isListing = 'seller_id' in item;
                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">Cancelled</Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(item.updated_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <h4 className="font-medium">{getPropertyName(item.item_id)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.token_quantity} tokens
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNav />
    </div>
  );
}
