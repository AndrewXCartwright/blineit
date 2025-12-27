import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { usePredictionCalculator, useSaveCalculation } from '@/hooks/useCalculator';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { BottomNav } from '@/components/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const quickAmounts = [25, 50, 100, 250, 500];

export default function PredictionCalculator() {
  const { inputs, setInputs, results, calculate } = usePredictionCalculator();
  const { saveCalculation, loading: saveLoading } = useSaveCalculation();
  const [saveName, setSaveName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    calculate();
  }, [inputs, calculate]);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    await saveCalculation(saveName, 'prediction', inputs, results || {});
    setSaveDialogOpen(false);
    setSaveName('');
  };

  const handleReset = () => {
    setInputs({
      betAmount: 100,
      position: 'BULL',
      bullOdds: 65,
      bearOdds: 35,
    });
  };

  const handleOddsChange = (bullOdds: number) => {
    setInputs({ ...inputs, bullOdds, bearOdds: 100 - bullOdds });
  };

  // Calculate both positions for comparison
  const bullShares = inputs.betAmount / (inputs.bullOdds / 100);
  const bearShares = inputs.betAmount / (inputs.bearOdds / 100);
  const bullWinProfit = bullShares - inputs.betAmount;
  const bearWinProfit = bearShares - inputs.betAmount;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Link to="/calculators" className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-semibold">Prediction Calculator</h1>
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
                    placeholder="My Prediction Analysis"
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
              <CardTitle className="text-base">Bet Parameters</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Position Selection */}
            <div className="space-y-3">
              <Label>Your Position</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={inputs.position === 'BULL' ? 'default' : 'outline'}
                  className={cn(
                    'h-20 flex-col gap-1',
                    inputs.position === 'BULL' && 'bg-emerald-500 hover:bg-emerald-600'
                  )}
                  onClick={() => setInputs({ ...inputs, position: 'BULL' })}
                >
                  <TrendingUp className="h-6 w-6" />
                  <span className="font-semibold">🐂 BULL</span>
                  <span className="text-xs opacity-80">{inputs.bullOdds}¢</span>
                </Button>
                <Button
                  variant={inputs.position === 'BEAR' ? 'default' : 'outline'}
                  className={cn(
                    'h-20 flex-col gap-1',
                    inputs.position === 'BEAR' && 'bg-red-500 hover:bg-red-600'
                  )}
                  onClick={() => setInputs({ ...inputs, position: 'BEAR' })}
                >
                  <TrendingDown className="h-6 w-6" />
                  <span className="font-semibold">🐻 BEAR</span>
                  <span className="text-xs opacity-80">{inputs.bearOdds}¢</span>
                </Button>
              </div>
            </div>

            {/* Bet Amount */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Bet Amount
              </Label>
              <Input
                type="number"
                value={inputs.betAmount}
                onChange={(e) => setInputs({ ...inputs, betAmount: Number(e.target.value) })}
                className="text-lg font-semibold"
              />
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={inputs.betAmount === amount ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputs({ ...inputs, betAmount: amount })}
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Odds Slider */}
            <div className="space-y-3">
              <Label>Market Odds</Label>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-emerald-500 font-semibold">🐂 {inputs.bullOdds}%</span>
                <span className="text-red-500 font-semibold">{inputs.bearOdds}% 🐻</span>
              </div>
              <Slider
                value={[inputs.bullOdds]}
                onValueChange={([value]) => handleOddsChange(value)}
                min={5}
                max={95}
                step={1}
              />
              <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-yellow-500 to-red-500 opacity-30" />
            </div>
          </CardContent>
        </Card>

        {/* Results - Both Positions */}
        <div className="grid gap-4">
          {/* BULL Payout */}
          <Card className={cn(
            'border-2 transition-all',
            inputs.position === 'BULL' ? 'border-emerald-500 bg-emerald-500/5' : 'border-border'
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                If You Bet 🐂 BULL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Cost: {formatCurrency(inputs.betAmount)} ({bullShares.toFixed(1)} shares @ {inputs.bullOdds}¢)
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">If BULL wins</p>
                  <p className="text-lg font-semibold text-emerald-500">+{formatCurrency(bullWinProfit)}</p>
                  <p className="text-xs text-muted-foreground">
                    Payout: {formatCurrency(bullShares)} (+{formatPercentage(bullWinProfit / inputs.betAmount)})
                  </p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">If BEAR wins</p>
                  <p className="text-lg font-semibold text-red-500">-{formatCurrency(inputs.betAmount)}</p>
                  <p className="text-xs text-muted-foreground">
                    Payout: $0.00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BEAR Payout */}
          <Card className={cn(
            'border-2 transition-all',
            inputs.position === 'BEAR' ? 'border-red-500 bg-red-500/5' : 'border-border'
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                If You Bet 🐻 BEAR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Cost: {formatCurrency(inputs.betAmount)} ({bearShares.toFixed(1)} shares @ {inputs.bearOdds}¢)
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/10 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">If BEAR wins</p>
                  <p className="text-lg font-semibold text-emerald-500">+{formatCurrency(bearWinProfit)}</p>
                  <p className="text-xs text-muted-foreground">
                    Payout: {formatCurrency(bearShares)} (+{formatPercentage(bearWinProfit / inputs.betAmount)})
                  </p>
                </div>
                <div className="bg-red-500/10 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">If BULL wins</p>
                  <p className="text-lg font-semibold text-red-500">-{formatCurrency(inputs.betAmount)}</p>
                  <p className="text-xs text-muted-foreground">
                    Payout: $0.00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expected Value Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 Expected Value Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              At current market odds, both positions have neutral expected value. 
              If you believe the true probability differs from market odds, you may find positive EV bets.
            </p>
            
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">💡 Pro Tip</p>
              <p className="text-sm text-muted-foreground">
                If you think BULL has a {inputs.bullOdds + 10}% chance (not {inputs.bullOdds}%), 
                betting BULL has positive expected value of approximately{' '}
                <span className="text-emerald-500 font-semibold">
                  +{formatCurrency(((inputs.bullOdds + 10) / 100 * bullWinProfit) - ((100 - inputs.bullOdds - 10) / 100 * inputs.betAmount))}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Button className="w-full" size="lg">
          Place Bet
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
