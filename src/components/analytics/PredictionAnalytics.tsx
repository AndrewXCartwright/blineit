import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePredictionAnalytics } from '@/hooks/usePortfolioAnalytics';
import { Target, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const PredictionAnalytics = () => {
  const { data, isLoading } = usePredictionAnalytics();
  
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading || !data) {
    return (
      <Card className="bg-card border-border animate-pulse">
        <CardContent className="h-64" />
      </Card>
    );
  }

  const isPositive = data.netPnl >= 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Target className="h-4 w-4" />
          PREDICTION PERFORMANCE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{data.winRate.toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{data.totalBets}</div>
            <div className="text-xs text-muted-foreground">Total Bets</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-500">{data.wins}</div>
            <div className="text-xs text-muted-foreground">Wins</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{formatValue(data.netPnl)}
            </div>
            <div className="text-xs text-muted-foreground">Net P&L</div>
          </div>
        </div>

        {/* Bull vs Bear */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                🐂 BULL Bets
              </span>
              <span className="text-sm font-bold text-green-500">{data.bullWinRate.toFixed(0)}% win</span>
            </div>
            <Progress value={data.bullWinRate} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                🐻 BEAR Bets
              </span>
              <span className="text-sm font-bold text-red-500">{data.bearWinRate.toFixed(0)}% win</span>
            </div>
            <Progress value={data.bearWinRate} className="h-2" />
          </div>
        </div>

        {/* Recent Predictions */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">RECENT PREDICTIONS</h4>
          <div className="space-y-2">
            {data.recentBets.map((bet: any, index: number) => {
              const won = bet.payout > bet.amount;
              const pnl = bet.payout - bet.amount;
              
              return (
                <div 
                  key={bet.id || index}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className={bet.position === 'YES' ? 'text-green-500' : 'text-red-500'}>
                      {bet.position === 'YES' ? '🐂' : '🐻'}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {bet.market?.title || 'Unknown Market'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {bet.is_settled ? (
                      <>
                        <span className={`flex items-center gap-1 text-xs font-medium ${won ? 'text-green-500' : 'text-red-500'}`}>
                          {won ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {won ? 'WON' : 'LOST'}
                        </span>
                        <span className={`text-sm font-medium ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {pnl >= 0 ? '+' : ''}{formatValue(pnl)}
                        </span>
                      </>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                        <Clock className="h-3 w-3" />
                        OPEN
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
