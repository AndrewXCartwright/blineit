import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, RotateCcw, DollarSign, Percent, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebtCalculator, useSaveCalculation } from '@/hooks/useCalculator';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { BottomNav } from '@/components/BottomNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const quickAmounts = [1000, 5000, 10000, 25000, 50000];
const quickTerms = [6, 12, 18, 24, 36];

export default function DebtCalculator() {
  const { inputs, setInputs, results, calculate } = useDebtCalculator();
  const { saveCalculation, loading: saveLoading } = useSaveCalculation();
  const [saveName, setSaveName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  useEffect(() => {
    calculate();
  }, [inputs, calculate]);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    await saveCalculation(saveName, 'debt', inputs, results || {});
    setSaveDialogOpen(false);
    setSaveName('');
  };

  const handleReset = () => {
    setInputs({
      investmentAmount: 10000,
      apy: 10.5,
      termMonths: 18,
      paymentFrequency: 'monthly',
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
          <h1 className="text-lg font-semibold">Debt Calculator</h1>
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
                    placeholder="My Loan Investment"
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
              <CardTitle className="text-base">Loan Parameters</CardTitle>
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
                  APY
                </Label>
                <span className="text-lg font-semibold text-primary">{inputs.apy.toFixed(1)}%</span>
              </div>
              <Slider
                value={[inputs.apy]}
                onValueChange={([value]) => setInputs({ ...inputs, apy: value })}
                min={5}
                max={20}
                step={0.5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5%</span>
                <span>20%</span>
              </div>
            </div>

            {/* Term */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Loan Term
              </Label>
              <div className="flex flex-wrap gap-2">
                {quickTerms.map((term) => (
                  <Button
                    key={term}
                    variant={inputs.termMonths === term ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInputs({ ...inputs, termMonths: term })}
                  >
                    {term} months
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Frequency */}
            <div className="space-y-3">
              <Label>Payment Frequency</Label>
              <RadioGroup
                value={inputs.paymentFrequency}
                onValueChange={(value: 'monthly' | 'quarterly') => setInputs({ ...inputs, paymentFrequency: value })}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="quarterly" id="quarterly" />
                  <Label htmlFor="quarterly">Quarterly</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg">Projected Returns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-1">Total Interest Earned</p>
                <p className="text-4xl font-bold text-blue-500">{formatCurrency(results.totalInterest)}</p>
                <p className="text-muted-foreground">over {inputs.termMonths} months</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    {inputs.paymentFrequency === 'monthly' ? 'Monthly' : 'Quarterly'} Payment
                  </p>
                  <p className="text-lg font-semibold">{formatCurrency(results.monthlyPayment)}</p>
                </div>
                <div className="bg-background rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total at Maturity</p>
                  <p className="text-lg font-semibold">{formatCurrency(results.totalAtMaturity)}</p>
                </div>
              </div>

              <div className="bg-background rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">At maturity you receive:</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Principal Return</span>
                    <span className="font-semibold">{formatCurrency(inputs.investmentAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Interest</span>
                    <span className="font-semibold text-emerald-500">+{formatCurrency(results.totalInterest)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">{formatCurrency(results.totalAtMaturity)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Schedule */}
        {results && results.paymentSchedule.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Schedule</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-64 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Payment</TableHead>
                      <TableHead className="text-right">Cumulative</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.paymentSchedule.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">Month {row.month}</TableCell>
                        <TableCell className="text-right text-emerald-500">
                          +{formatCurrency(row.payment)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(row.cumulative)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-primary/5">
                      <TableCell className="font-semibold">Maturity</TableCell>
                      <TableCell className="text-right font-semibold">
                        +{formatCurrency(inputs.investmentAmount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(results.totalAtMaturity)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Button className="w-full" size="lg">
          Browse Loans
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}
