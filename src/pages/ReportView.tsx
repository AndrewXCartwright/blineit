import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const portfolioValueData = [
  { month: 'Jan', value: 35000 },
  { month: 'Feb', value: 36500 },
  { month: 'Mar', value: 38000 },
  { month: 'Apr', value: 37200 },
  { month: 'May', value: 39500 },
  { month: 'Jun', value: 40800 },
  { month: 'Jul', value: 42000 },
  { month: 'Aug', value: 41500 },
  { month: 'Sep', value: 43200 },
  { month: 'Oct', value: 44100 },
  { month: 'Nov', value: 44800 },
  { month: 'Dec', value: 45234 },
];

const allocationData = [
  { name: 'Equity', value: 65, color: 'hsl(var(--chart-1))' },
  { name: 'Debt', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Predictions', value: 10, color: 'hsl(var(--chart-3))' },
];

const holdings = [
  { name: 'Sunset Apartments', type: 'Equity', tokens: 50.27, costBasis: 10850, value: 12450, gain: 1600, pct: 14.7, apy: 8.2 },
  { name: 'Marina Heights', type: 'Equity', tokens: 25.20, costBasis: 7150, value: 8230, gain: 1080, pct: 15.1, apy: 7.8 },
  { name: 'Downtown Tower', type: 'Equity', tokens: 18.45, costBasis: 6490, value: 6890, gain: 400, pct: 6.2, apy: 9.1 },
  { name: 'Commercial Bridge Loan', type: 'Debt', tokens: 15.50, costBasis: 5600, value: 5420, gain: -180, pct: -3.2, apy: 7.5 },
  { name: 'Austin Industrial', type: 'Equity', tokens: 12.20, costBasis: 4680, value: 4890, gain: 210, pct: 4.5, apy: 8.0 },
];

const ReportView = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/reports">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Portfolio Summary Report</h1>
                <p className="text-sm text-muted-foreground">Generated December 28, 2024</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Report Header */}
        <div className="text-center py-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">PORTFOLIO SUMMARY REPORT</h1>
          <p className="text-muted-foreground mt-1">Generated: December 28, 2024</p>
          <p className="text-muted-foreground">Period: January 1 - December 28, 2024</p>
        </div>

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
                <p className="text-2xl font-bold text-foreground">$45,234.56</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost Basis</p>
                <p className="text-2xl font-bold text-foreground">$42,150.00</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                <p className="text-2xl font-bold text-green-500">+$3,084.56 (+7.3%)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">YTD Dividends</p>
                <p className="text-2xl font-bold text-foreground">$2,847.23</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">YTD Interest</p>
                <p className="text-2xl font-bold text-foreground">$1,575.00</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Return</p>
                <p className="text-2xl font-bold text-green-500">$7,506.79 (17.8%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Portfolio Value Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={portfolioValueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Holdings by Asset Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {allocationData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-muted-foreground">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Property</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Type</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Tokens</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Cost Basis</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Value</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">Gain/Loss</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">%</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">APY</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h.name} className="border-b border-border">
                      <td className="py-2 px-2 font-medium text-foreground">{h.name}</td>
                      <td className="py-2 px-2">
                        <Badge variant="secondary">{h.type}</Badge>
                      </td>
                      <td className="text-right py-2 px-2 text-foreground">{h.tokens}</td>
                      <td className="text-right py-2 px-2 text-foreground">${h.costBasis.toLocaleString()}</td>
                      <td className="text-right py-2 px-2 text-foreground">${h.value.toLocaleString()}</td>
                      <td className={`text-right py-2 px-2 ${h.gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {h.gain >= 0 ? '+' : ''}${h.gain.toLocaleString()}
                      </td>
                      <td className={`text-right py-2 px-2 ${h.pct >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {h.pct >= 0 ? '+' : ''}{h.pct}%
                      </td>
                      <td className="text-right py-2 px-2 text-foreground">{h.apy}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-medium">
                    <td className="py-2 px-2 text-foreground">TOTAL</td>
                    <td className="py-2 px-2"></td>
                    <td className="text-right py-2 px-2 text-foreground">121.62</td>
                    <td className="text-right py-2 px-2 text-foreground">$34,770</td>
                    <td className="text-right py-2 px-2 text-foreground">$37,880</td>
                    <td className="text-right py-2 px-2 text-green-500">+$3,110</td>
                    <td className="text-right py-2 px-2 text-green-500">+8.9%</td>
                    <td className="text-right py-2 px-2 text-foreground">8.1%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">1. Marina Heights</span>
                  <span className="text-green-500 font-medium">+15.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">2. Sunset Apartments</span>
                  <span className="text-green-500 font-medium">+8.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground">3. Downtown Tower</span>
                  <span className="text-green-500 font-medium">+6.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Underperformers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-foreground">1. Phoenix Retail</span>
                  <span className="text-red-500 font-medium">-3.2%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-border text-sm text-muted-foreground">
          <p>This report was generated by B-LINE-IT on December 28, 2024.</p>
          <p>Past performance is not indicative of future results.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReportView;
