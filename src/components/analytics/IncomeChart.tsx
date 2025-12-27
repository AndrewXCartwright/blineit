import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIncomeAnalytics } from '@/hooks/usePortfolioAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Landmark, Target } from 'lucide-react';

export const IncomeChart = () => {
  const { data, isLoading } = useIncomeAnalytics();
  
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (isLoading || !data) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="h-64 flex items-center justify-center">
          <span className="text-muted-foreground">Loading...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">INCOME & EARNINGS</CardTitle>
          <span className="text-lg font-bold text-foreground">{formatValue(data.breakdown.total)}/mo</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyIncome}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
                formatter={(value: number) => [formatValue(value), 'Income']}
              />
              <Bar 
                dataKey="income" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">INCOME BREAKDOWN</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-chart-1" />
                <span className="text-sm text-foreground">Property Dividends</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">{formatValue(data.breakdown.propertyDividends)}</span>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {((data.breakdown.propertyDividends / data.breakdown.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-chart-2" />
                <span className="text-sm text-foreground">Loan Interest</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">{formatValue(data.breakdown.loanInterest)}</span>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {((data.breakdown.loanInterest / data.breakdown.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-chart-3" />
                <span className="text-sm text-foreground">Prediction Winnings</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">{formatValue(data.breakdown.predictionWinnings)}</span>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {((data.breakdown.predictionWinnings / data.breakdown.total) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2 font-semibold">
              <span className="text-sm text-foreground">Total This Month</span>
              <span className="text-sm text-foreground">{formatValue(data.breakdown.total)}</span>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Projected Annual Income</span>
              <span className="text-lg font-bold text-foreground">{formatValue(data.projectedAnnual)}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-muted-foreground">Effective Yield</span>
              <span className="text-sm font-medium text-green-500">{data.effectiveYield}% APY</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
