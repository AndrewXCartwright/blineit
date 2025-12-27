import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, TrendingUp, DollarSign, Calendar, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEquityCalculator, useSaveCalculation } from '@/hooks/useCalculator';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { BottomNav } from '@/components/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const quickAmounts = [1000, 5000, 10000, 25000, 50000, 100000];
const quickPeriods = [1, 3, 5, 7, 10];

export default function EquityCalculator() {
  const { inputs, setInputs, results, calculate } = useEquityCalculator();
  const { saveCalculation, loading: saveLoading } = useSaveCalculation();
  const [saveName, setSaveName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    calculate();
  }, [inputs, calculate]);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    await saveCalculation(saveName, 'equity', inputs, results || {});
    setSaveDialogOpen(false);
    setSaveName('');
  };

  const handleReset = () => {
    setInputs({
      investmentAmount: 10000,
      apy: 8.2,
      appreciationRate: 3.0,
      holdPeriod: 5,
      reinvestDividends: true,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link to="/calculators" className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">Equity Calculator</h1>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Save className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Calculation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Calculation Name</Label>
                  <Input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="My Investment Plan"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Investment: {formatCurrency(inputs.investmentAmount)}</p>
                  <p>APY: {formatPercentage(inputs.apy / 100)}</p>
                  <p>Hold Period: {inputs.holdPeriod} years</p>
                  {results && <p>Projected Return: {formatPercentage(results.totalReturn / 100)}</p>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saveLoading || !saveName.trim()} className="flex-1">
                    Save
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Inputs Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Investment Parameters</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Investment Amount */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Investment Amount
              </Label>
              <Input
                type="number"
                value={inputs.investmentAmount}
                onChange={(e) => setInputs({ ...inputs, investmentAmount: Number(e.target.value) })}
                className="text-lg font-semibold"
              />
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={inputs.investmentAmount === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputs({ ...inputs, investmentAmount: amount })}
                  >
                    {formatCurrency(amount, 'en-US', 'USD').replace('.00', '')}
                  </Button>
                ))}
              </div>
            </div>

            {/* APY Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  Expected APY
                </Label>
                <span className="text-lg font-semibold text-primary">{inputs.apy.toFixed(1)}%</span>
              </div>
              <Slider
                value={[inputs.apy]}
                onValueChange={([value]) => setInputs({ ...inputs, apy: value })}
                min={0}
                max={20}
                step={0.1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>20%</span>
              </div>
            </div>

            {/* Appreciation Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  Annual Appreciation
                </Label>
                <span className="text-lg font-semibold">{inputs.appreciationRate.toFixed(1)}%</span>
              </div>
              <Slider
                value={[inputs.appreciationRate]}
                onValueChange={([value]) => setInputs({ ...inputs, appreciationRate: value })}
                min={0}
                max={10}
                step={0.5}
              />
            </div>

            {/* Hold Period */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Hold Period
              </Label>
              <div className="flex flex-wrap gap-2">
                {quickPeriods.map((period) => (
                  <Button
                    key={period}
                    variant={inputs.holdPeriod === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputs({ ...inputs, holdPeriod: period })}
                  >
                    {period} {period === 1 ? 'year' : 'years'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Reinvest Toggle */}
            <div className="flex items-center justify-between">
              <Label>Reinvest Dividends (DRIP)</Label>
              <Switch
                checked={inputs.reinvestDividends}
                onCheckedChange={(checked) => setInputs({ ...inputs, reinvestDividends: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg">Projected Returns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-1">Total Return</p>
                <p className="text-4xl font-bold text-primary">{formatCurrency(results.finalValue)}</p>
                <p className="text-lg text-emerald-500">
                  +{formatCurrency(results.finalValue - inputs.investmentAmount)} ({formatPercentage(results.totalReturn / 100)})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Dividends</p>
                  <p className="text-lg font-semibold">{formatCurrency(results.totalDividends)}</p>
                </div>
                <div className="bg-background rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Appreciation</p>
                  <p className="text-lg font-semibold">{formatCurrency(results.totalAppreciation)}</p>
                </div>
                <div className="bg-background rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Annualized Return</p>
                  <p className="text-lg font-semibold">{formatPercentage(results.annualizedReturn / 100)}</p>
                </div>
                <div className="bg-background rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Avg Annual Income</p>
                  <p className="text-lg font-semibold">{formatCurrency(results.totalDividends / inputs.holdPeriod)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Yearly Breakdown */}
        {results && results.yearlyBreakdown.length > 0 && (
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">Year-by-Year</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            </TabsList>
            <TabsContent value="table">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right">Dividends</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.yearlyBreakdown.map((row) => (
                        <TableRow key={row.year}>
                          <TableCell className="font-medium">Year {row.year}</TableCell>
                          <TableCell className="text-right text-emerald-500">
                            +{formatCurrency(row.dividends)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(row.endValue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="scenarios">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Scenario Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Scenario</TableHead>
                        <TableHead className="text-right">Final Value</TableHead>
                        <TableHead className="text-right">Return</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Conservative (6% APY, 1% Appr.)</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(inputs.investmentAmount * Math.pow(1.07, inputs.holdPeriod))}
                        </TableCell>
                        <TableCell className="text-right text-emerald-500">
                          +{formatPercentage((Math.pow(1.07, inputs.holdPeriod) - 1))}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-primary/5">
                        <TableCell className="font-semibold">Base Case (Current)</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(results.finalValue)}
                        </TableCell>
                        <TableCell className="text-right text-emerald-500 font-semibold">
                          +{formatPercentage(results.totalReturn / 100)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Optimistic (10% APY, 5% Appr.)</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(inputs.investmentAmount * Math.pow(1.15, inputs.holdPeriod))}
                        </TableCell>
                        <TableCell className="text-right text-emerald-500">
                          +{formatPercentage((Math.pow(1.15, inputs.holdPeriod) - 1))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* CTA */}
        <Button className="w-full" size="lg">
          Start Investing
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
