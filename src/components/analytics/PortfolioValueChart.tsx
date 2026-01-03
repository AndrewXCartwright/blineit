import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePortfolioSnapshots } from '@/hooks/usePortfolioAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';

const timeRanges = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 730 }
];

export const PortfolioValueChart = () => {
  const [selectedRange, setSelectedRange] = useState(30);
  const { data: snapshots, isLoading } = usePortfolioSnapshots(selectedRange);
  
  const chartData = snapshots?.map(s => ({
    date: s.snapshot_date,
    value: s.total_value,
    formattedDate: format(new Date(s.snapshot_date), 'MMM d')
  })) || [];
  
  const currentValue = chartData[chartData.length - 1]?.value || 0;
  const startValue = chartData[0]?.value || 0;
  const change = currentValue - startValue;
  const changePercent = startValue > 0 ? (change / startValue) * 100 : 0;
  const isPositive = change >= 0;

  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">TOTAL PORTFOLIO VALUE</CardTitle>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-foreground">
            {formatValue(currentValue)}
          </span>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{isPositive ? '+' : ''}{formatValue(change)} ({changePercent.toFixed(1)}%)</span>
            <span className="text-muted-foreground ml-1">all time</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-1 mb-4">
          {timeRanges.map(range => (
            <Button
              key={range.label}
              variant={selectedRange === range.days ? 'default' : 'ghost'}
              size="sm"
              className="text-xs px-2"
              onClick={() => setSelectedRange(range.days)}
            >
              {range.label}
            </Button>
          ))}
        </div>
        
        <div className="h-64">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="formattedDate" 
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
                  tickFormatter={(value) => value >= 1000000 ? `$${(value / 1000000).toFixed(0)}M` : `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                  formatter={(value: number) => [formatValue(value), 'Value']}
                  labelFormatter={(label) => label}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
