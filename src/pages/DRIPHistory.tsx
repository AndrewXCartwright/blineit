import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNav } from '@/components/BottomNav';
import { useDRIPTransactions, useDRIPStats } from '@/hooks/useDRIP';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DRIPHistory() {
  const navigate = useNavigate();
  const { transactions, isLoading } = useDRIPTransactions();
  const stats = useDRIPStats();
  const [sourceFilter, setSourceFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');

  const filteredTransactions = transactions?.filter(tx => {
    if (sourceFilter !== 'all' && tx.source_type !== sourceFilter) return false;
    if (yearFilter !== 'all') {
      const txYear = new Date(tx.created_at).getFullYear().toString();
      if (txYear !== yearFilter) return false;
    }
    return true;
  });

  const years = [...new Set(transactions?.map(tx => 
    new Date(tx.created_at).getFullYear().toString()
  ) || [])].sort().reverse();

  const handleExport = () => {
    if (!filteredTransactions) return;
    
    const csv = [
      ['Date', 'Source', 'Amount', 'Tokens', 'Token Price', 'Property'].join(','),
      ...filteredTransactions.map(tx => [
        format(new Date(tx.created_at), 'yyyy-MM-dd'),
        tx.source_type,
        tx.source_amount.toFixed(2),
        tx.tokens_purchased.toFixed(4),
        tx.token_price.toFixed(2),
        tx.property?.name || 'Unknown'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drip-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-xl font-bold">DRIP History</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="flex gap-3">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="flex-1">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="dividend">Dividends</SelectItem>
              <SelectItem value="interest">Interest</SelectItem>
              <SelectItem value="prediction_winnings">Prediction Winnings</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Reinvested</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalReinvested)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tokens Acquired</p>
                <p className="text-lg font-bold">{stats.tokensAcquired.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Value</p>
                <p className="text-lg font-bold">{formatCurrency(stats.currentValue)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Gain on DRIP Tokens</p>
                <p className="text-lg font-bold text-green-500">
                  +{formatCurrency(stats.extraEarned)} ({((stats.extraEarned / stats.totalReinvested) * 100 || 0).toFixed(1)}%)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : filteredTransactions && filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Tokens</TableHead>
                      <TableHead>To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(tx.created_at), 'MMM d')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-3 w-3 text-primary" />
                            <span className="capitalize text-sm">
                              {tx.source_type.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(tx.source_amount)}
                        </TableCell>
                        <TableCell className="text-right text-primary font-medium">
                          +{tx.tokens_purchased.toFixed(2)}
                        </TableCell>
                        <TableCell className="max-w-24 truncate">
                          {tx.property?.name || 'Property'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No DRIP transactions found
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
