import { Card, CardContent } from '@/components/ui/card';
import { useUserPerformance } from '@/hooks/usePortfolioAnalytics';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const PerformanceCards = () => {
  const { data: performance, isLoading } = useUserPerformance();
  
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (isLoading || !performance) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="bg-card border-border animate-pulse">
            <CardContent className="p-4 h-20" />
          </Card>
        ))}
      </div>
    );
  }

  const periods = [
    { label: 'Today', ...performance.today },
    { label: 'This Week', ...performance.week },
    { label: 'This Month', ...performance.month },
    { label: 'YTD', ...performance.ytd }
  ];

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">PERFORMANCE SUMMARY</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {periods.map((period, index) => {
            const isPositive = period.percent >= 0;
            
            return (
              <div 
                key={index}
                className="bg-muted/30 rounded-lg p-3 text-center"
              >
                <div className={`text-xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{period.percent.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground mt-1">{period.label}</div>
                <div className={`text-sm font-medium mt-1 flex items-center justify-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {isPositive ? '+' : ''}{formatValue(period.value)}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
