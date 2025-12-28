import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTrades } from '@/hooks/useSecondaryMarket';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';

export default function MarketHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: trades = [] } = useTrades();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('*');
      return data || [];
    },
  });

  const completedTrades = trades.filter(t => t.status === 'completed');
  
  const buyTrades = completedTrades.filter(t => t.buyer_id === user?.id);
  const sellTrades = completedTrades.filter(t => t.seller_id === user?.id);

  const totalBought = buyTrades.reduce((sum, t) => sum + t.total_price, 0);
  const totalSold = sellTrades.reduce((sum, t) => sum + t.seller_receives, 0);
  const totalTokensBought = buyTrades.reduce((sum, t) => sum + t.token_quantity, 0);
  const totalTokensSold = sellTrades.reduce((sum, t) => sum + t.token_quantity, 0);
  const totalFeesPaid = completedTrades.reduce((sum, t) => {
    if (t.buyer_id === user?.id) return sum + t.platform_fee;
    return sum;
  }, 0);

  const getPropertyName = (itemId: string) => {
    return properties.find(p => p.id === itemId)?.name || 'Unknown';
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/market')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <History className="h-6 w-6" />
                Trade History
              </h1>
              <p className="text-sm text-muted-foreground">Your secondary market activity</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>

        {/* Summary */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-2">
            <h3 className="font-semibold mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Trades:</span>
                <span className="font-medium">{completedTrades.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bought:</span>
                <span className="font-medium text-red-500">{formatCurrency(totalBought)} ({totalTokensBought.toFixed(2)} tokens)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Sold:</span>
                <span className="font-medium text-green-500">{formatCurrency(totalSold)} ({totalTokensSold.toFixed(2)} tokens)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Position:</span>
                <span className="font-medium">{totalTokensBought - totalTokensSold >= 0 ? '+' : ''}{(totalTokensBought - totalTokensSold).toFixed(2)} tokens</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-muted-foreground">Total Fees Paid:</span>
                <span className="font-medium">{formatCurrency(totalFeesPaid)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trade Table */}
        {completedTrades.length === 0 ? (
          <Card className="p-8 text-center">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Trade History</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You haven't made any trades on the secondary market yet.
            </p>
            <Button onClick={() => navigate('/market')}>
              Explore Market
            </Button>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTrades.map((trade) => {
                    const isBuy = trade.buyer_id === user?.id;
                    return (
                      <TableRow key={trade.id}>
                        <TableCell className="text-sm">
                          {format(new Date(trade.created_at), 'MMM d')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isBuy ? 'default' : 'secondary'} className={isBuy ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}>
                            {isBuy ? 'BUY' : 'SELL'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium max-w-[120px] truncate">
                          {getPropertyName(trade.item_id)}
                        </TableCell>
                        <TableCell className="text-right">{trade.token_quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(trade.price_per_token)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(isBuy ? trade.total_price + trade.platform_fee : trade.seller_receives)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
