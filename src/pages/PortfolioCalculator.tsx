import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, DollarSign, PieChart, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { usePortfolioCalculator, useSaveCalculation } from '@/hooks/useCalculator';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { BottomNav } from '@/components/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const quickBudgets = [10000, 25000, 50000, 100000, 250000];

export default function PortfolioCalculator() {
  const { inputs, setInputs, results, calculate } = usePortfolioCalculator();
  const { saveCalculation, loading: saveLoading } = useSaveCalculation();
  const [saveName, setSaveName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    calculate();
  }, [inputs, calculate]);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    await saveCalculation(saveName, 'portfolio', inputs, results || {});
    setSaveDialogOpen(false);
    setSaveName('');
  };

  const handleReset = () => {
    setInputs({
      totalBudget: 50000,
      equityAllocation: 60,
      debtAllocation: 30,
      predictionAllocation: 10,
      equityApy: 8.0,
      debtApy: 10.5,
      holdPeriod: 5,
    });
  };

  const handleAllocationChange = (type: 'equity' | 'debt' | 'prediction', value: number) => {
    const remaining = 100 - value;
    if (type === 'equity') {
      const debtRatio = inputs.debtAllocation / (inputs.debtAllocation + inputs.predictionAllocation) || 0.75;
      setInputs({
        ...inputs,
        equityAllocation: value,
        debtAllocation: Math.round(remaining * debtRatio),
        predictionAllocation: Math.round(remaining * (1 - debtRatio)),
      });
    } else if (type === 'debt') {
      const equityRatio = inputs.equityAllocation / (inputs.equityAllocation + inputs.predictionAllocation) || 0.85;
      setInputs({
        ...inputs,
        debtAllocation: value,
        equityAllocation: Math.round(remaining * equityRatio),
        predictionAllocation: Math.round(remaining * (1 - equityRatio)),
      });
    } else {
      const equityRatio = inputs.equityAllocation / (inputs.equityAllocation + inputs.debtAllocation) || 0.67;
      setInputs({
        ...inputs,
        predictionAllocation: value,
        equityAllocation: Math.round(remaining * equityRatio),
        debtAllocation: Math.round(remaining * (1 - equityRatio)),
      });
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-emerald-500';
      case 'medium': return 'text-amber-500';
      case 'high': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskDots = (level: string) => {
    switch (level) {
      case 'low': return '●●○○○';
      case 'medium': return '●●●○○';
      case 'high': return '●●●●○';
      default: return '●●●○○';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link to="/calculators" className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">Portfolio Builder</h1>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Save className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Portfolio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Portfolio Name</Label>
                  <Input
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="My Investment Portfolio"
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
        {/* Budget Input */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Investment Budget</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Total Investment Budget
              </Label>
              <Input
                type="number"
                value={inputs.totalBudget}
                onChange={(e) => setInputs({ ...inputs, totalBudget: Number(e.target.value) })}
                className="text-lg font-semibold"
              />
              <div className="flex flex-wrap gap-2">
                {quickBudgets.map((amount) => (
                  <Button
                    key={amount}
                    variant={inputs.totalBudget === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputs({ ...inputs, totalBudget: amount })}
                  >
                    {formatCurrency(amount, 'en-US', 'USD').replace('.00', '')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Sliders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Equity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  🏢 Equity (Real Estate Tokens)
                </Label>
                <span className="font-semibold text-emerald-500">{inputs.equityAllocation}%</span>
              </div>
              <Slider
                value={[inputs.equityAllocation]}
                onValueChange={([value]) => handleAllocationChange('equity', value)}
                min={0}
                max={100}
                step={5}
                className="[&>span]:bg-emerald-500"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatCurrency(inputs.totalBudget * inputs.equityAllocation / 100)}</span>
                <span>Expected APY: {inputs.equityApy}%</span>
              </div>
            </div>

            {/* Debt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  🏦 Debt (Loan Investments)
                </Label>
                <span className="font-semibold text-blue-500">{inputs.debtAllocation}%</span>
              </div>
              <Slider
                value={[inputs.debtAllocation]}
                onValueChange={([value]) => handleAllocationChange('debt', value)}
                min={0}
                max={100}
                step={5}
                className="[&>span]:bg-blue-500"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatCurrency(inputs.totalBudget * inputs.debtAllocation / 100)}</span>
                <span>Expected APY: {inputs.debtApy}%</span>
              </div>
            </div>

            {/* Predictions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  🎯 Predictions (Betting Markets)
                </Label>
                <span className="font-semibold text-amber-500">{inputs.predictionAllocation}%</span>
              </div>
              <Slider
                value={[inputs.predictionAllocation]}
                onValueChange={([value]) => handleAllocationChange('prediction', value)}
                min={0}
                max={100}
                step={5}
                className="[&>span]:bg-amber-500"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatCurrency(inputs.totalBudget * inputs.predictionAllocation / 100)}</span>
                <span>High risk / Variable return</span>
              </div>
            </div>

            {/* Total Bar */}
            <div className="pt-4 border-t">
              <div className="h-4 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${inputs.equityAllocation}%` }}
                />
                <div 
                  className="bg-blue-500 transition-all"
                  style={{ width: `${inputs.debtAllocation}%` }}
                />
                <div 
                  className="bg-amber-500 transition-all"
                  style={{ width: `${inputs.predictionAllocation}%` }}
                />
              </div>
              <p className="text-sm text-center mt-2 text-muted-foreground">
                Total: {formatCurrency(inputs.totalBudget)} (100%)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {results && (
          <>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg">
                  Portfolio Projection ({inputs.holdPeriod} Years)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-1">Final Value</p>
                  <p className="text-4xl font-bold text-primary">{formatCurrency(results.finalValue)}</p>
                  <p className="text-lg text-emerald-500">
                    +{formatCurrency(results.finalValue - inputs.totalBudget)} ({formatPercentage(results.totalReturn / 100)})
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Blended APY</p>
                    <p className="text-lg font-semibold">{results.blendedApy.toFixed(1)}%</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Monthly Income</p>
                    <p className="text-lg font-semibold">{formatCurrency(results.monthlyIncome)}</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Annual Income</p>
                    <p className="text-lg font-semibold">{formatCurrency(results.annualIncome)}</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Dividends</p>
                    <p className="text-lg font-semibold">{formatCurrency(results.totalDividends)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Risk Level</span>
                  <span className={cn('font-semibold', getRiskColor(results.riskLevel))}>
                    {results.riskLevel.charAt(0).toUpperCase() + results.riskLevel.slice(1)} {getRiskDots(results.riskLevel)}
                  </span>
                </div>

                <div className="space-y-2">
                  {inputs.equityAllocation >= 50 && (
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                      <span>{inputs.equityAllocation}% in stable equity investments</span>
                    </div>
                  )}
                  {inputs.debtAllocation >= 20 && (
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                      <span>{inputs.debtAllocation}% in fixed-income debt</span>
                    </div>
                  )}
                  {inputs.predictionAllocation > 15 && (
                    <div className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>{inputs.predictionAllocation}% in high-risk predictions</span>
                    </div>
                  )}
                  {inputs.predictionAllocation <= 15 && inputs.predictionAllocation > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                      <span>{inputs.predictionAllocation}% in predictions (moderate exposure)</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  {results.riskLevel === 'low' && 'Conservative portfolio focused on stable income with minimal risk exposure.'}
                  {results.riskLevel === 'medium' && 'Well-balanced portfolio suitable for growth-focused investors with moderate risk tolerance.'}
                  {results.riskLevel === 'high' && 'Aggressive portfolio with significant prediction exposure. Consider reducing for lower risk.'}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* CTA */}
        <Button className="w-full" size="lg">
          Build This Portfolio
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
