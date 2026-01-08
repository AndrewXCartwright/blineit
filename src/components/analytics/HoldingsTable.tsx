import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useHoldingsPerformance } from '@/hooks/usePortfolioAnalytics';
import { Building2, Landmark, Target, Download, TrendingUp, TrendingDown, MoreVertical, ExternalLink, ShoppingCart, Shield, History } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HoldingDetailPanel } from './HoldingDetailPanel';

type SortOption = 'best' | 'worst' | 'value' | 'name';
type FilterOption = 'all' | 'property' | 'loan' | 'prediction';

const icons = {
  property: Building2,
  loan: Landmark,
  prediction: Target
};

export interface HoldingWithDetails {
  id: string;
  name: string;
  type: 'property' | 'loan' | 'prediction';
  currentValue: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
  tokens?: number;
  apy?: number;
  tokenPrice?: number;
  holdingStartDate?: string;
  offeringId?: string;
}

export const HoldingsTable = () => {
  const navigate = useNavigate();
  const { data: holdings, isLoading } = useHoldingsPerformance();
  const [sortBy, setSortBy] = useState<SortOption>('best');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedHolding, setSelectedHolding] = useState<HoldingWithDetails | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const filteredHoldings = holdings?.filter(h => 
    filterBy === 'all' || h.type === filterBy
  ) || [];

  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    switch (sortBy) {
      case 'best': return b.pnlPercent - a.pnlPercent;
      case 'worst': return a.pnlPercent - b.pnlPercent;
      case 'value': return b.currentValue - a.currentValue;
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const totals = sortedHoldings.reduce((acc, h) => ({
    currentValue: acc.currentValue + h.currentValue,
    costBasis: acc.costBasis + h.costBasis,
    pnl: acc.pnl + h.pnl
  }), { currentValue: 0, costBasis: 0, pnl: 0 });

  const totalPnlPercent = totals.costBasis > 0 ? (totals.pnl / totals.costBasis) * 100 : 0;

  const exportCSV = () => {
    const headers = ['Asset', 'Type', 'Current Value', 'Cost Basis', 'P&L', 'P&L %'];
    const rows = sortedHoldings.map(h => [
      h.name, h.type, h.currentValue, h.costBasis, h.pnl, h.pnlPercent.toFixed(2)
    ]);
    rows.push(['TOTAL', '', totals.currentValue, totals.costBasis, totals.pnl, totalPnlPercent.toFixed(2)]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'holdings-performance.csv';
    a.click();
  };

  const handleRowClick = (holding: HoldingWithDetails) => {
    if (holding.type === 'property' || holding.type === 'loan') {
      setSelectedHolding({
        ...holding,
        tokenPrice: holding.tokens && holding.currentValue ? holding.currentValue / holding.tokens : 100,
        holdingStartDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        offeringId: holding.id,
      });
      setIsPanelOpen(true);
    }
  };

  const handleAction = (action: string, holding: HoldingWithDetails, e: React.MouseEvent) => {
    e.stopPropagation();
    switch (action) {
      case 'view':
        if (holding.type === 'property') {
          navigate(`/property/${holding.id}`);
        } else if (holding.type === 'loan') {
          navigate(`/loans/${holding.id}`);
        }
        break;
      case 'list':
        navigate(`/portfolio/${holding.id}/list`);
        break;
      case 'liquidity':
        navigate(`/portfolio/${holding.id}/liquidity`);
        break;
      case 'history':
        // Could open a transaction history modal
        break;
    }
  };

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">HOLDINGS PERFORMANCE</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="best">Best Performers</SelectItem>
                  <SelectItem value="worst">Worst Performers</SelectItem>
                  <SelectItem value="value">Highest Value</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  <SelectItem value="property">Properties</SelectItem>
                  <SelectItem value="loan">Loans</SelectItem>
                  <SelectItem value="prediction">Predictions</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead className="text-right w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedHoldings.map((holding) => {
                    const Icon = icons[holding.type];
                    const isPositive = holding.pnl >= 0;
                    const isClickable = holding.type === 'property' || holding.type === 'loan';
                    
                    return (
                      <TableRow 
                        key={holding.id}
                        onClick={() => handleRowClick(holding as HoldingWithDetails)}
                        className={isClickable ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{holding.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatValue(holding.currentValue)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatValue(holding.costBasis)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          <div className="flex items-center justify-end gap-1">
                            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {isPositive ? '+' : ''}{formatValue(holding.pnl)}
                          </div>
                        </TableCell>
                        <TableCell className={`text-right font-medium ${isPositive ? 'text-success' : 'text-destructive'}`}>
                          {isPositive ? '+' : ''}{holding.pnlPercent.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => handleAction('view', holding as HoldingWithDetails, e as any)}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View {holding.type === 'property' ? 'Property' : holding.type === 'loan' ? 'Loan' : 'Market'}
                              </DropdownMenuItem>
                              {(holding.type === 'property' || holding.type === 'loan') && (
                                <>
                                  <DropdownMenuItem onClick={(e) => handleAction('list', holding as HoldingWithDetails, e as any)}>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    List on Secondary
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => handleAction('liquidity', holding as HoldingWithDetails, e as any)}>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Request Liquidity
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => handleAction('history', holding as HoldingWithDetails, e as any)}>
                                <History className="h-4 w-4 mr-2" />
                                Transaction History
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  <TableRow className="border-t-2 font-semibold">
                    <TableCell>TOTALS</TableCell>
                    <TableCell className="text-right">{formatValue(totals.currentValue)}</TableCell>
                    <TableCell className="text-right">{formatValue(totals.costBasis)}</TableCell>
                    <TableCell className={`text-right ${totals.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {totals.pnl >= 0 ? '+' : ''}{formatValue(totals.pnl)}
                    </TableCell>
                    <TableCell className={`text-right ${totalPnlPercent >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(1)}%
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Holding Detail Panel */}
      <HoldingDetailPanel
        holding={selectedHolding}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </>
  );
};
