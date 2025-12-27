import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, TrendingUp, Coins, DollarSign, Settings, History, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/BottomNav';
import { useDRIPSettings, useDRIPTransactions, useDRIPStats, useSimulateDRIP } from '@/hooks/useDRIP';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function DRIPDashboard() {
  const navigate = useNavigate();
  const { settings, isLoading: settingsLoading } = useDRIPSettings();
  const { transactions, isLoading: transactionsLoading } = useDRIPTransactions(10);
  const stats = useDRIPStats();
  const { simulateDividend, isSimulating } = useSimulateDRIP();

  const isEnabled = settings?.is_enabled ?? false;

  // Generate projection data
  const projectionData = Array.from({ length: 11 }, (_, i) => {
    const year = i;
    const principal = 13000;
    const rate = 0.08;
    const withDrip = principal * Math.pow(1 + rate, year);
    const withoutDrip = principal + (principal * rate * year);
    return {
      year: `Y${year}`,
      withDrip: Math.round(withDrip),
      withoutDrip: Math.round(withoutDrip),
    };
  });

  const handleSimulateDividend = () => {
    simulateDividend({
      propertyId: '00000000-0000-0000-0000-000000000001',
      propertyName: 'Sunset Apartments',
      amount: 34.17,
      tokenPrice: 124.50,
    });
  };

  if (!isEnabled) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center gap-4 px-4 py-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-xl font-bold">DRIP Dashboard</h1>
          </div>
        </header>

        <main className="px-4 py-6">
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <RefreshCw className="h-16 w-16 mx-auto text-muted-foreground" />
              <h2 className="text-xl font-bold">DRIP is Not Enabled</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Enable Dividend Reinvestment to automatically compound your returns over time.
              </p>
              <Button onClick={() => navigate('/settings/drip')}>
                Enable DRIP
              </Button>
            </CardContent>
          </Card>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-xl font-bold">DRIP Dashboard</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings/drip')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{formatCurrency(stats.totalReinvested)}</p>
              <p className="text-xs text-muted-foreground">Total Reinvested</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Coins className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{stats.tokensAcquired.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Tokens Acquired</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <RefreshCw className="h-6 w-6 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{formatCurrency(stats.currentValue)}</p>
              <p className="text-xs text-muted-foreground">Current Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto text-green-500 mb-1" />
              <p className="text-2xl font-bold text-green-500">+{formatCurrency(stats.extraEarned)}</p>
              <p className="text-xs text-muted-foreground">Extra Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* DRIP Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">DRIP Balance</CardTitle>
            <CardDescription>
              Accumulating until minimum is reached
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{formatCurrency(stats.dripBalance)}</span>
                <span className="text-muted-foreground">
                  of {formatCurrency(settings?.minimum_reinvest_amount || 10)} minimum
                </span>
              </div>
              <Progress 
                value={(stats.dripBalance / (settings?.minimum_reinvest_amount || 10)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Demo Button */}
        <Card className="border-dashed border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Demo Mode</p>
                  <p className="text-xs text-muted-foreground">Simulate a dividend reinvestment</p>
                </div>
              </div>
              <Button 
                size="sm" 
                onClick={handleSimulateDividend}
                disabled={isSimulating}
              >
                Simulate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Growth Projection */}
        <Card>
          <CardHeader>
            <CardTitle>DRIP Projection</CardTitle>
            <CardDescription>10-year growth comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs" />
                  <YAxis 
                    className="text-xs" 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="withDrip" 
                    name="With DRIP"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="withoutDrip" 
                    name="Without DRIP"
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-green-500/10 rounded-lg text-center">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                DRIP Advantage: +$4,176 (+32.1%) over 10 years
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent DRIP Activity</CardTitle>
              <CardDescription>Your latest reinvestments</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/drip/history')}>
              <History className="h-4 w-4 mr-1" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading...</p>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {tx.source_type === 'dividend' ? 'Dividend' : 
                         tx.source_type === 'interest' ? 'Interest' : 'Winnings'} Reinvested
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(tx.source_amount)} → {tx.tokens_purchased.toFixed(4)} tokens @ {formatCurrency(tx.token_price)}
                      </p>
                      {tx.remainder_to_balance > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(tx.remainder_to_balance)} added to DRIP balance
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {tx.executed_at ? format(new Date(tx.executed_at), 'MMM d') : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No DRIP transactions yet. Your dividends will be automatically reinvested.
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
