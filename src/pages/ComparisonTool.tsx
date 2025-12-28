import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GitCompare, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/BottomNav';
import { useReportExports } from '@/hooks/useReports';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const properties = [
  { id: '1', name: 'Sunset Apartments', value: 12450, return: 8.5, apy: 8.2, dividends: 1020, tokens: 50.27, holdTime: '8 mo' },
  { id: '2', name: 'Marina Heights', value: 8230, return: 15.2, apy: 7.8, dividends: 640, tokens: 25.20, holdTime: '6 mo' },
  { id: '3', name: 'Downtown Tower', value: 6890, return: 6.2, apy: 9.1, dividends: 628, tokens: 18.45, holdTime: '10 mo' },
  { id: '4', name: 'Phoenix Retail', value: 5420, return: -3.2, apy: 7.5, dividends: 406, tokens: 15.50, holdTime: '4 mo' },
  { id: '5', name: 'Austin Industrial', value: 4890, return: 4.5, apy: 8.0, dividends: 391, tokens: 12.20, holdTime: '5 mo' },
];

const ComparisonTool = () => {
  const { createExport } = useReportExports();
  const [selected, setSelected] = useState<string[]>(['1', '2', '3']);
  const [showComparison, setShowComparison] = useState(false);

  const toggleProperty = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) {
        return prev.filter(p => p !== id);
      }
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  };

  const selectedProperties = properties.filter(p => selected.includes(p.id));

  const chartData = selectedProperties.map(p => ({
    name: p.name.split(' ')[0],
    value: p.value,
    return: p.return,
    apy: p.apy,
    dividends: p.dividends,
  }));

  const handleExport = () => {
    createExport('comparison', 'pdf', { properties: selected });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/reports">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Compare Holdings
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Property Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Properties to Compare (2-5)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    selected.includes(property.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => toggleProperty(property.id)}
                >
                  <Checkbox
                    id={property.id}
                    checked={selected.includes(property.id)}
                    onCheckedChange={() => toggleProperty(property.id)}
                  />
                  <Label htmlFor={property.id} className="flex-1 cursor-pointer font-normal">
                    <span className="font-medium">{property.name}</span>
                    <span className="text-muted-foreground ml-2">
                      ${property.value.toLocaleString()} • {property.return >= 0 ? '+' : ''}{property.return}%
                    </span>
                  </Label>
                  {selected.includes(property.id) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                onClick={() => setShowComparison(true)}
                disabled={selected.length < 2}
              >
                Generate Comparison
              </Button>
              <p className="text-sm text-muted-foreground self-center">
                {selected.length} selected
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Results */}
        {showComparison && selected.length >= 2 && (
          <>
            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Comparison Table</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 text-sm text-muted-foreground font-medium">Metric</th>
                        {selectedProperties.map((p) => (
                          <th key={p.id} className="text-right py-2 px-3 text-sm font-medium text-foreground">
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border">
                        <td className="py-2 px-3 text-sm text-muted-foreground">Value</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="text-right py-2 px-3 text-sm text-foreground">
                            ${p.value.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 px-3 text-sm text-muted-foreground">Return</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className={`text-right py-2 px-3 text-sm ${p.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {p.return >= 0 ? '+' : ''}{p.return}%
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 px-3 text-sm text-muted-foreground">APY</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="text-right py-2 px-3 text-sm text-foreground">
                            {p.apy}%
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 px-3 text-sm text-muted-foreground">Dividends</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="text-right py-2 px-3 text-sm text-foreground">
                            ${p.dividends}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-border">
                        <td className="py-2 px-3 text-sm text-muted-foreground">Tokens</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="text-right py-2 px-3 text-sm text-foreground">
                            {p.tokens}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-sm text-muted-foreground">Hold Time</td>
                        {selectedProperties.map((p) => (
                          <td key={p.id} className="text-right py-2 px-3 text-sm text-foreground">
                            {p.holdTime}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparison Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Value ($)" fill="hsl(var(--chart-1))" />
                    <Bar dataKey="dividends" name="Dividends ($)" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Returns Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Returns Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <Tooltip
                      contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [`${value}%`, 'Return']}
                    />
                    <Bar dataKey="return" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ComparisonTool;
