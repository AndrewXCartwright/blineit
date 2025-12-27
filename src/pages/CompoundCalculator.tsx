import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, DollarSign, Percent, Calendar, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCompoundCalculator, useSaveCalculation } from '@/hooks/useCalculator';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { BottomNav } from '@/components/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const quickAmounts = [5000, 10000, 25000, 50000];
const quickContributions = [0, 100, 250, 500, 1000];
const quickYears = [5, 10, 15, 20, 25, 30];

export default function CompoundCalculator() {
  const { inputs, setInputs, results, calculate } = useCompoundCalculator();
  const { saveCalculation, loading: saveLoading } = useSaveCalculation();
  const [saveName, setSaveName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    calculate();
  }, [inputs, calculate]);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    await saveCalculation(saveName, 'compound', inputs, results || {});
    setSaveDialogOpen(false);
    setSaveName('');
  };

  const handleReset = () => {
    setInputs({
      initialInvestment: 10000,
      monthlyContribution: 500,
      apy: 8.0,
      years: 10,
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
          <h1 className="text-lg font-semibold">Compound Growth</h1>
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
                    placeholder="My Growth Plan"
                  />
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
              <CardTitle className="text-base">Growth Parameters</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Initial Investment */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Initial Investment
              </Label>
              <Input
                type="number"
                value={inputs.initialInvestment}
                onChange={(e) => setInputs({ ...inputs, initialInvestment: Number(e.target.value) })}
                className="text-lg font-semibold"
              />
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={inputs.initialInvestment === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputs({ ...inputs, initialInvestment: amount })}
                  >
                    {formatCurrency(amount, 'en-US', 'USD').replace('.00', '')}
                  </Button>
                ))}
              </div>
            </div>

            {/* Monthly Contribution */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Monthly Contribution
              </Label>
              <Input
                type="number"
                value={inputs.monthlyContribution}
                onChange={(e) => setInputs({ ...inputs, monthlyContribution: Number(e.target.value) })}
                className="text-lg font-semibold"
              />
              <div className="flex flex-wrap gap-2">
                {quickContributions.map((amount) => (
                  <Button
                    key={amount}
                    variant={inputs.monthlyContribution === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputs({ ...inputs, monthlyContribution: amount })}
                  >
                    ${amount}
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
                min={1}
                max={15}
                step={0.5}
              />
            </div>

            {/* Time Period */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Time Period
              </Label>
              <div className="flex flex-wrap gap-2">
                {quickYears.map((years) => (
                  <Button
                    key={years}
                    variant={inputs.years === years ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputs({ ...inputs, years })}
                  >
                    {years} years
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Comparison */}
        {results && (
          <div className="grid gap-4">
            {/* With Reinvestment */}
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-500" />
                  With Dividend Reinvestment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-2">
                  <p className="text-3xl font-bold text-emerald-500">{formatCurrency(results.withReinvestment)}</p>
                  <p className="text-sm text-muted-foreground">
                    +{formatCurrency(results.withReinvestment - inputs.initialInvestment)} 
                    ({formatPercentage((results.withReinvestment - inputs.initialInvestment) / inputs.initialInvestment)})
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Without Reinvestment */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Without Reinvestment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-2">
                  <p className="text-3xl font-bold">{formatCurrency(results.withoutReinvestment)}</p>
                  <p className="text-sm text-muted-foreground">
                    +{formatCurrency(results.withoutReinvestment - inputs.initialInvestment)} 
                    ({formatPercentage((results.withoutReinvestment - inputs.initialInvestment) / inputs.initialInvestment)})
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bonus Highlight */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">💰 Reinvestment Bonus</p>
                  <p className="text-2xl font-bold text-primary">
                    +{formatCurrency(results.reinvestmentBonus)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPercentage(results.reinvestmentBonus / results.withoutReinvestment)} more by reinvesting
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Milestones */}
        {results && results.milestones.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🎯 Wealth Milestones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead className="text-right">Without DRIP</TableHead>
                    <TableHead className="text-right">With DRIP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.milestones.map((milestone) => (
                    <TableRow key={milestone.amount}>
                      <TableCell className="font-medium">
                        {formatCurrency(milestone.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {milestone.withoutReinvestmentYears < 50 
                          ? `${milestone.withoutReinvestmentYears.toFixed(1)} years`
                          : '50+ years'
                        }
                      </TableCell>
                      <TableCell className="text-right text-emerald-500 font-semibold">
                        {milestone.withReinvestmentYears < 50 
                          ? `${milestone.withReinvestmentYears.toFixed(1)} years ⚡`
                          : '50+ years'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Year by Year */}
        {results && results.yearlyBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📅 Year-by-Year Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-64 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead className="text-right">Compound</TableHead>
                      <TableHead className="text-right">Simple</TableHead>
                      <TableHead className="text-right">Diff</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.yearlyBreakdown.map((row) => (
                      <TableRow key={row.year}>
                        <TableCell className="font-medium">Year {row.year}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(row.compoundValue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(row.simpleValue)}
                        </TableCell>
                        <TableCell className="text-right text-emerald-500">
                          +{formatCurrency(row.difference)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
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
