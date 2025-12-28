import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Target, Lightbulb, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { useReportExports } from '@/hooks/useReports';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const portfolioValueData = [
  { month: 'Jan', value: 35000, benchmark: 34000 },
  { month: 'Feb', value: 36500, benchmark: 35200 },
  { month: 'Mar', value: 38000, benchmark: 36100 },
  { month: 'Apr', value: 37200, benchmark: 35800 },
  { month: 'May', value: 39500, benchmark: 37500 },
  { month: 'Jun', value: 40800, benchmark: 38200 },
  { month: 'Jul', value: 42000, benchmark: 39100 },
  { month: 'Aug', value: 41500, benchmark: 38800 },
  { month: 'Sep', value: 43200, benchmark: 40200 },
  { month: 'Oct', value: 44100, benchmark: 41000 },
  { month: 'Nov', value: 44800, benchmark: 41500 },
  { month: 'Dec', value: 45234, benchmark: 42100 },
];

const allocationData = [
  { name: 'Equity', value: 65, color: 'hsl(var(--chart-1))' },
  { name: 'Debt', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Predictions', value: 10, color: 'hsl(var(--chart-3))' },
];

const incomeData = [
  { month: 'Jan', dividends: 180, interest: 120, predictions: 50 },
  { month: 'Feb', dividends: 195, interest: 125, predictions: 0 },
  { month: 'Mar', dividends: 210, interest: 130, predictions: 75 },
  { month: 'Apr', dividends: 225, interest: 135, predictions: 25 },
  { month: 'May', dividends: 240, interest: 140, predictions: 100 },
  { month: 'Jun', dividends: 255, interest: 145, predictions: 0 },
  { month: 'Jul', dividends: 270, interest: 150, predictions: 50 },
  { month: 'Aug', dividends: 285, interest: 155, predictions: 125 },
  { month: 'Sep', dividends: 300, interest: 160, predictions: 0 },
  { month: 'Oct', dividends: 315, interest: 165, predictions: 75 },
  { month: 'Nov', dividends: 330, interest: 170, predictions: 50 },
  { month: 'Dec', dividends: 345, interest: 175, predictions: 100 },
];

const topHoldings = [
  { name: 'Sunset Apartments', value: 12450, pct: 27.5, return: 15.2 },
  { name: 'Marina Heights', value: 8230, pct: 18.2, return: 8.5 },
  { name: 'Downtown Tower', value: 6890, pct: 15.2, return: 6.2 },
  { name: 'Phoenix Retail', value: 5420, pct: 12.0, return: -3.2 },
  { name: 'Austin Industrial', value: 4890, pct: 10.8, return: 4.5 },
];

const monthlyReturns = [
  { month: 'Jan', return: 2.1, benchmark: 1.8, alpha: 0.3 },
  { month: 'Feb', return: 1.5, benchmark: 2.2, alpha: -0.7 },
  { month: 'Mar', return: 3.2, benchmark: 2.5, alpha: 0.7 },
  { month: 'Apr', return: -1.2, benchmark: -0.8, alpha: -0.4 },
  { month: 'May', return: 2.8, benchmark: 2.0, alpha: 0.8 },
  { month: 'Jun', return: 1.9, benchmark: 1.5, alpha: 0.4 },
];

const insights = [
  { icon: '📈', text: 'Your portfolio outperformed the S&P 500 by 3.2% this year' },
  { icon: '🏆', text: 'Sunset Apartments has been your best performer (+15.2%)' },
  { icon: '💰', text: 'Your dividend income increased 28% compared to last year' },
  { icon: '⚖️', text: 'Consider rebalancing: Commercial is 45% of portfolio vs target 30%' },
  { icon: '📊', text: 'You have 3 positions with unrealized losses that could offset gains' },
];

const AnalyticsDashboard = () => {
  const { createExport } = useReportExports();
  const [dateRange, setDateRange] = useState('this_year');
  const [compareMode, setCompareMode] = useState('none');

  const handleExportDashboard = () => {
    createExport('analytics_dashboard', 'pdf');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/reports">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="this_quarter">This Quarter</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportDashboard}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Total Return</span>
              </div>
              <p className="text-2xl font-bold text-foreground">$7,506.79</p>
              <p className="text-sm text-green-500">+17.8%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="text-sm">Portfolio IRR</span>
              </div>
              <p className="text-2xl font-bold text-foreground">15.2%</p>
              <p className="text-sm text-green-500">+2.1% vs benchmark</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Dividend Yield</span>
              </div>
              <p className="text-2xl font-bold text-foreground">6.3%</p>
              <p className="text-sm text-muted-foreground">$2,847 YTD</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                <span className="text-sm">Win Rate</span>
              </div>
              <p className="text-2xl font-bold text-foreground">62%</p>
              <p className="text-sm text-muted-foreground">Predictions</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Value Over Time */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Portfolio Value Over Time</CardTitle>
                <Select value={compareMode} onValueChange={setCompareMode}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Compare" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sp500">S&P 500</SelectItem>
                    <SelectItem value="realestate">Real Estate Index</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={portfolioValueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Portfolio" />
                  {compareMode !== 'none' && (
                    <Line type="monotone" dataKey="benchmark" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Benchmark" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Asset Allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {allocationData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Holdings by Value */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Holdings by Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topHoldings.map((holding, i) => (
                  <div key={holding.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground w-4">{i + 1}.</span>
                      <span className="font-medium text-foreground">{holding.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-foreground">${holding.value.toLocaleString()}</span>
                      <Badge variant="secondary">{holding.pct}%</Badge>
                      <span className={holding.return >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {holding.return >= 0 ? '+' : ''}{holding.return}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Returns */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-4 text-sm text-muted-foreground border-b border-border pb-2">
                  <span>Month</span>
                  <span className="text-right">Return</span>
                  <span className="text-right">Benchmark</span>
                  <span className="text-right">Alpha</span>
                </div>
                {monthlyReturns.map((row) => (
                  <div key={row.month} className="grid grid-cols-4 text-sm py-1">
                    <span className="text-foreground">{row.month}</span>
                    <span className={`text-right ${row.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {row.return >= 0 ? '+' : ''}{row.return}%
                    </span>
                    <span className={`text-right ${row.benchmark >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {row.benchmark >= 0 ? '+' : ''}{row.benchmark}%
                    </span>
                    <span className={`text-right ${row.alpha >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {row.alpha >= 0 ? '+' : ''}{row.alpha}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Income Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  formatter={(value: number) => [`$${value}`, '']}
                />
                <Legend />
                <Bar dataKey="dividends" stackId="a" fill="hsl(var(--chart-1))" name="Dividends" />
                <Bar dataKey="interest" stackId="a" fill="hsl(var(--chart-2))" name="Interest" />
                <Bar dataKey="predictions" stackId="a" fill="hsl(var(--chart-3))" name="Predictions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-xl">{insight.icon}</span>
                  <p className="text-foreground">{insight.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default AnalyticsDashboard;
