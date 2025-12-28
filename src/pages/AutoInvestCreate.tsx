import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { BottomNav } from '@/components/BottomNav';
import { useCreateAutoInvestPlan } from '@/hooks/useAutoInvest';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
type AllocationType = 'single' | 'multiple' | 'smart';

interface PropertyAllocation {
  propertyId: string;
  percent: number;
}

const AutoInvestCreate = () => {
  const navigate = useNavigate();
  const createPlan = useCreateAutoInvestPlan();

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(250);
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [startOption, setStartOption] = useState<'next' | 'custom'>('next');
  const [customStartDate, setCustomStartDate] = useState('');
  const [allocationType, setAllocationType] = useState<AllocationType>('single');
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [propertyAllocations, setPropertyAllocations] = useState<PropertyAllocation[]>([]);
  const [smartStrategy, setSmartStrategy] = useState('balanced');
  const [fundingSource, setFundingSource] = useState<'wallet' | 'linked_account'>('wallet');
  const [insufficientAction, setInsufficientAction] = useState<'skip' | 'partial' | 'pause'>('skip');
  const [planName, setPlanName] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const { data: properties } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, name, city, state, apy, token_price')
        .order('apy', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile-wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('user_id', user.id)
        .single();
      return data;
    },
  });

  const getNextScheduledDate = () => {
    const today = new Date();
    switch (frequency) {
      case 'weekly':
        return addWeeks(today, 1);
      case 'biweekly':
        return addWeeks(today, 2);
      case 'monthly':
        return addMonths(today, 1);
      case 'quarterly':
        return addMonths(today, 3);
      default:
        return addMonths(today, 1);
    }
  };

  const startDate = startOption === 'next' 
    ? getNextScheduledDate() 
    : customStartDate ? new Date(customStartDate) : getNextScheduledDate();

  const totalAllocationPercent = propertyAllocations.reduce((sum, a) => sum + a.percent, 0);

  const getBlendedApy = () => {
    if (!properties) return 0;
    if (allocationType === 'single' && selectedProperty) {
      const prop = properties.find(p => p.id === selectedProperty);
      return prop?.apy || 0;
    }
    if (allocationType === 'multiple' && propertyAllocations.length > 0) {
      return propertyAllocations.reduce((sum, a) => {
        const prop = properties.find(p => p.id === a.propertyId);
        return sum + ((prop?.apy || 0) * a.percent / 100);
      }, 0);
    }
    return properties.reduce((sum, p) => sum + p.apy, 0) / properties.length;
  };

  const handlePropertyAllocationChange = (propertyId: string, percent: number) => {
    setPropertyAllocations(prev => {
      const existing = prev.find(a => a.propertyId === propertyId);
      if (existing) {
        return prev.map(a => a.propertyId === propertyId ? { ...a, percent } : a);
      }
      return [...prev, { propertyId, percent }];
    });
  };

  const handlePropertyToggle = (propertyId: string, checked: boolean) => {
    if (checked) {
      setPropertyAllocations(prev => [...prev, { propertyId, percent: 0 }]);
    } else {
      setPropertyAllocations(prev => prev.filter(a => a.propertyId !== propertyId));
    }
  };

  const handleSubmit = async () => {
    let allocations: any[] = [];

    if (allocationType === 'single' && selectedProperty) {
      allocations = [{ target_type: 'property', target_id: selectedProperty, allocation_percent: 100 }];
    } else if (allocationType === 'multiple') {
      allocations = propertyAllocations.map(a => ({
        target_type: 'property',
        target_id: a.propertyId,
        allocation_percent: a.percent,
      }));
    } else if (allocationType === 'smart') {
      allocations = [{ target_type: 'category', category: smartStrategy, allocation_percent: 100 }];
    }

    const name = planName || `${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Auto-Invest`;

    await createPlan.mutateAsync({
      name,
      frequency,
      amount,
      funding_source: fundingSource,
      insufficient_funds_action: insufficientAction,
      start_date: format(startDate, 'yyyy-MM-dd'),
      allocations,
    });

    navigate('/auto-invest');
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return amount >= 10;
      case 2:
        if (allocationType === 'single') return !!selectedProperty;
        if (allocationType === 'multiple') return totalAllocationPercent === 100;
        return true;
      case 3:
        return true;
      case 4:
        return confirmed;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate('/auto-invest')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Create Auto-Invest Plan</h1>
            <p className="text-sm text-muted-foreground">Step {step} of 4</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        <Progress value={step * 25} className="h-2" />

        {/* Step 1: Amount & Frequency */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>How much do you want to invest automatically?</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="pl-8 text-lg"
                  min={10}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[50, 100, 250, 500, 1000].map(val => (
                  <Button
                    key={val}
                    variant={amount === val ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAmount(val)}
                  >
                    ${val}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>How often?</Label>
              <RadioGroup value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                <div className="space-y-2">
                  {[
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'biweekly', label: 'Bi-weekly', desc: 'Every 2 weeks' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'quarterly', label: 'Quarterly', desc: 'Every 3 months' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                      <RadioGroupItem value={opt.value} />
                      <div>
                        <span className="font-medium">{opt.label}</span>
                        {opt.desc && <span className="text-sm text-muted-foreground ml-2">{opt.desc}</span>}
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>When should we start?</Label>
              <RadioGroup value={startOption} onValueChange={(v) => setStartOption(v as 'next' | 'custom')}>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                  <RadioGroupItem value="next" />
                  <span>Next scheduled date ({format(getNextScheduledDate(), 'MMM d, yyyy')})</span>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                  <RadioGroupItem value="custom" />
                  <span>Custom start date</span>
                </label>
              </RadioGroup>
              {startOption === 'custom' && (
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              )}
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-1">📊 Annual Projection</p>
                <p className="text-muted-foreground text-sm">
                  {formatCurrency(amount)}/{frequency} × {frequency === 'weekly' ? 52 : frequency === 'biweekly' ? 26 : frequency === 'monthly' ? 12 : 4} = {formatCurrency(amount * (frequency === 'weekly' ? 52 : frequency === 'biweekly' ? 26 : frequency === 'monthly' ? 12 : 4))}/year
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Allocation */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>How do you want to allocate your {formatCurrency(amount)}/{frequency === 'monthly' ? 'month' : frequency}?</Label>
              <RadioGroup value={allocationType} onValueChange={(v) => setAllocationType(v as AllocationType)}>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                  <RadioGroupItem value="single" />
                  <div>
                    <span className="font-medium">Single Property</span>
                    <p className="text-sm text-muted-foreground">Invest 100% into one property</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                  <RadioGroupItem value="multiple" />
                  <div>
                    <span className="font-medium">Multiple Properties</span>
                    <p className="text-sm text-muted-foreground">Split across specific properties</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                  <RadioGroupItem value="smart" />
                  <div>
                    <span className="font-medium">Smart Allocation</span>
                    <p className="text-sm text-muted-foreground">Auto-allocate based on strategy</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {allocationType === 'single' && (
              <div className="space-y-3">
                <Label>Select Property</Label>
                <RadioGroup value={selectedProperty} onValueChange={setSelectedProperty}>
                  {properties?.map(prop => (
                    <label key={prop.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                      <RadioGroupItem value={prop.id} />
                      <div className="flex-1">
                        <span className="font-medium">{prop.name}</span>
                        <p className="text-sm text-muted-foreground">
                          {prop.city}, {prop.state} • {prop.apy}% APY • {formatCurrency(prop.token_price)}/token
                        </p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}

            {allocationType === 'multiple' && (
              <div className="space-y-4">
                <Label>Set percentage for each property (must equal 100%)</Label>
                {properties?.map(prop => {
                  const allocation = propertyAllocations.find(a => a.propertyId === prop.id);
                  const isSelected = !!allocation;
                  return (
                    <Card key={prop.id} className={isSelected ? 'border-primary' : ''}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handlePropertyToggle(prop.id, !!checked)}
                          />
                          <div className="flex-1">
                            <span className="font-medium">{prop.name}</span>
                            <p className="text-sm text-muted-foreground">
                              {prop.city}, {prop.state} • {prop.apy}% APY
                            </p>
                          </div>
                          {isSelected && (
                            <div className="text-right">
                              <span className="font-bold">{allocation?.percent || 0}%</span>
                              <p className="text-sm text-muted-foreground">
                                = {formatCurrency(amount * (allocation?.percent || 0) / 100)}
                              </p>
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <Slider
                            value={[allocation?.percent || 0]}
                            onValueChange={([val]) => handlePropertyAllocationChange(prop.id, val)}
                            max={100}
                            step={5}
                          />
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
                <div className={`text-sm font-medium ${totalAllocationPercent === 100 ? 'text-green-600' : 'text-destructive'}`}>
                  Total Allocation: {totalAllocationPercent}% {totalAllocationPercent === 100 && '✓'}
                </div>
                {totalAllocationPercent === 100 && (
                  <p className="text-sm text-muted-foreground">Blended APY: {getBlendedApy().toFixed(2)}%</p>
                )}
              </div>
            )}

            {allocationType === 'smart' && (
              <div className="space-y-3">
                <Label>Choose Strategy</Label>
                <RadioGroup value={smartStrategy} onValueChange={setSmartStrategy}>
                  {[
                    { value: 'highest_apy', label: 'Highest APY First', desc: 'Prioritize properties with best yields' },
                    { value: 'balanced', label: 'Balanced Portfolio', desc: 'Equal split across all properties' },
                    { value: 'match_holdings', label: 'Match Current Holdings', desc: 'Maintain your existing allocation ratios' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                      <RadioGroupItem value={opt.value} />
                      <div>
                        <span className="font-medium">{opt.label}</span>
                        <p className="text-sm text-muted-foreground">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Funding Source */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Where should we pull funds from?</Label>
              <RadioGroup value={fundingSource} onValueChange={(v) => setFundingSource(v as 'wallet' | 'linked_account')}>
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50">
                  <RadioGroupItem value="wallet" />
                  <div>
                    <span className="font-medium">Wallet Balance</span>
                    <p className="text-sm text-muted-foreground">
                      Current balance: {formatCurrency(profile?.wallet_balance || 0)}
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>What if funds are insufficient?</Label>
              <RadioGroup value={insufficientAction} onValueChange={(v) => setInsufficientAction(v as 'skip' | 'partial' | 'pause')}>
                {[
                  { value: 'skip', label: 'Skip this investment and try next scheduled date' },
                  { value: 'partial', label: 'Invest whatever amount is available' },
                  { value: 'pause', label: 'Pause plan and notify me' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent/50">
                    <RadioGroupItem value={opt.value} />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label>Plan Name</Label>
                  <Input
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder={`${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Auto-Invest`}
                  />
                </div>

                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-semibold">Investment Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Amount:</span>
                    <span>{formatCurrency(amount)}/{frequency}</span>
                    <span className="text-muted-foreground">First Investment:</span>
                    <span>{format(startDate, 'MMMM d, yyyy')}</span>
                    <span className="text-muted-foreground">Funding Source:</span>
                    <span>{fundingSource === 'wallet' ? 'Wallet Balance' : 'Linked Account'}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-semibold">Allocation</h3>
                  {allocationType === 'single' && selectedProperty && (
                    <p className="text-sm">
                      {properties?.find(p => p.id === selectedProperty)?.name}: 100%
                    </p>
                  )}
                  {allocationType === 'multiple' && propertyAllocations.map(a => {
                    const prop = properties?.find(p => p.id === a.propertyId);
                    return (
                      <p key={a.propertyId} className="text-sm">
                        {prop?.name}: {a.percent}% ({formatCurrency(amount * a.percent / 100)})
                      </p>
                    );
                  })}
                  {allocationType === 'smart' && (
                    <p className="text-sm">Strategy: {smartStrategy.replace('_', ' ')}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Blended APY: {getBlendedApy().toFixed(2)}%</p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-semibold">Projections (1 Year)</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Total Invested:</span>
                    <span>{formatCurrency(amount * (frequency === 'weekly' ? 52 : frequency === 'biweekly' ? 26 : frequency === 'monthly' ? 12 : 4))}</span>
                    <span className="text-muted-foreground">Est. Dividends:</span>
                    <span>{formatCurrency(amount * (frequency === 'weekly' ? 52 : frequency === 'biweekly' ? 26 : frequency === 'monthly' ? 12 : 4) * getBlendedApy() / 100)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer">
              <Checkbox checked={confirmed} onCheckedChange={(c) => setConfirmed(!!c)} className="mt-0.5" />
              <span className="text-sm">
                I understand investments will be made automatically and I'll maintain sufficient funds.
              </span>
            </label>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="flex-1">
              Continue
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceed() || createPlan.isPending} className="flex-1">
              {createPlan.isPending ? 'Creating...' : 'Create Plan'}
            </Button>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default AutoInvestCreate;
