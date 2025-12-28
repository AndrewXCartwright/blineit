import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

interface HoldingWithProperty {
  id: string;
  property_id: string;
  tokens: number;
  average_buy_price: number;
  created_at: string;
  property: {
    name: string;
    token_price: number;
  };
}

export default function TaxCostBasis() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const { data: holdings, isLoading } = useQuery({
    queryKey: ['holdings-with-properties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_holdings')
        .select(`
          id,
          property_id,
          tokens,
          average_buy_price,
          created_at,
          properties:property_id (
            name,
            token_price
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      return (data || []).map(h => ({
        ...h,
        property: Array.isArray(h.properties) ? h.properties[0] : h.properties
      })) as HoldingWithProperty[];
    },
    enabled: !!user?.id,
  });

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const totalCostBasis = holdings?.reduce((sum, h) => sum + (h.tokens * h.average_buy_price), 0) || 0;
  const totalCurrentValue = holdings?.reduce((sum, h) => sum + (h.tokens * (h.property?.token_price || 0)), 0) || 0;
  const totalUnrealizedGain = totalCurrentValue - totalCostBasis;
  const unrealizedGainPercent = totalCostBasis > 0 ? ((totalUnrealizedGain / totalCostBasis) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tax')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Cost Basis Report
            </h1>
            <p className="text-sm text-muted-foreground">Track your cost basis for all holdings</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Holdings List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-6 bg-muted rounded w-48 mb-2" />
                  <div className="h-4 bg-muted rounded w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : holdings && holdings.length > 0 ? (
          <div className="space-y-4">
            {holdings.map(holding => {
              const costBasis = holding.tokens * holding.average_buy_price;
              const currentValue = holding.tokens * (holding.property?.token_price || 0);
              const unrealizedGain = currentValue - costBasis;
              const gainPercent = costBasis > 0 ? ((unrealizedGain / costBasis) * 100) : 0;
              const isExpanded = expandedItems.includes(holding.id);

              return (
                <Collapsible key={holding.id} open={isExpanded}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardContent 
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleExpand(holding.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground mt-0.5" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground mt-0.5" />
                            )}
                            <div>
                              <p className="font-semibold">🏢 {holding.property?.name || 'Unknown Property'}</p>
                              <p className="text-sm text-muted-foreground">
                                Current Holdings: {holding.tokens.toFixed(2)} tokens
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Total Cost Basis: {formatCurrency(costBasis)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Average Cost: {formatCurrency(holding.average_buy_price)}/token
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Current Value: {formatCurrency(currentValue)} ({formatCurrency(holding.property?.token_price || 0)}/token)
                              </p>
                              <p className={`text-sm font-medium ${unrealizedGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                Unrealized Gain: {unrealizedGain >= 0 ? '+' : ''}{formatCurrency(unrealizedGain)} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <Separator className="mb-4" />
                        <h4 className="font-medium mb-3 text-sm">Tax Lots</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead className="text-right">Tokens</TableHead>
                              <TableHead className="text-right">Cost</TableHead>
                              <TableHead className="text-right">Basis/Token</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell>{format(new Date(holding.created_at), 'MMM d, yyyy')}</TableCell>
                              <TableCell className="text-right">{holding.tokens.toFixed(2)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(costBasis)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(holding.average_buy_price)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No holdings to display</p>
            </CardContent>
          </Card>
        )}

        {/* Total Summary */}
        {holdings && holdings.length > 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Total Unrealized Gains/Losses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Total Cost Basis:</span>
                <span className="font-medium">{formatCurrency(totalCostBasis)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Current Value:</span>
                <span className="font-medium">{formatCurrency(totalCurrentValue)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total Unrealized Gain:</span>
                <span className={totalUnrealizedGain >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {totalUnrealizedGain >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedGain)} ({unrealizedGainPercent >= 0 ? '+' : ''}{unrealizedGainPercent.toFixed(1)}%)
                </span>
              </div>

              <Separator className="my-4" />

              <div>
                <p className="text-sm text-muted-foreground mb-2">If sold today:</p>
                <div className="text-sm space-y-1">
                  <p>• Short-term gains: {formatCurrency(totalUnrealizedGain > 0 ? totalUnrealizedGain : 0)} (taxed as income)</p>
                  <p>• Long-term gains: {formatCurrency(0)} (lower tax rate)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Export Button */}
        <Button className="w-full" variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Full Cost Basis Report (CSV)
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
