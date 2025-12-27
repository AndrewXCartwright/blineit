import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Check, DollarSign, TrendingUp, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNav } from '@/components/BottomNav';
import { useDRIPSettings, useDRIPPropertySettings } from '@/hooks/useDRIP';
import { useUserData } from '@/hooks/useUserData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DRIPSettings() {
  const navigate = useNavigate();
  const { settings, isLoading, updateSettings, toggleDRIP, isUpdating } = useDRIPSettings();
  const { propertySettings, updatePropertySettings } = useDRIPPropertySettings();
  const { holdings } = useUserData();
  
  const [localSettings, setLocalSettings] = useState({
    drip_type: settings?.drip_type || 'same_property',
    reinvest_equity_dividends: settings?.reinvest_equity_dividends ?? true,
    reinvest_debt_interest: settings?.reinvest_debt_interest ?? true,
    reinvest_prediction_winnings: settings?.reinvest_prediction_winnings ?? false,
    minimum_reinvest_amount: settings?.minimum_reinvest_amount || 10,
  });

  const handleSaveSettings = async () => {
    await updateSettings(localSettings);
  };

  const isEnabled = settings?.is_enabled ?? false;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display text-xl font-bold">Dividend Reinvestment (DRIP)</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* DRIP Status Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
              }`}>
                {isEnabled ? (
                  <Check className="h-8 w-8" />
                ) : (
                  <RefreshCw className="h-8 w-8" />
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-bold">
                  DRIP is {isEnabled ? 'ON' : 'OFF'}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {isEnabled 
                    ? 'Your earnings are automatically being reinvested to buy more tokens.'
                    : 'Your dividends and interest are being deposited to your wallet as cash.'
                  }
                </p>
              </div>

              <Button
                variant={isEnabled ? 'outline' : 'default'}
                onClick={() => toggleDRIP(!isEnabled)}
                disabled={isUpdating}
              >
                {isEnabled ? 'Disable DRIP' : 'Enable DRIP'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Why Enable DRIP */}
        {!isEnabled && (
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Why Enable DRIP?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-muted-foreground">WITHOUT DRIP</p>
                  <p className="text-2xl font-bold mt-1">$18,000</p>
                  <p className="text-sm text-muted-foreground">(+$8,000)</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">WITH DRIP</p>
                  <p className="text-2xl font-bold mt-1 text-primary">$21,589</p>
                  <p className="text-sm text-primary">(+$11,589)</p>
                </div>
              </div>
              <p className="text-center mt-4 text-sm">
                <span className="text-primary font-semibold">📈 DRIP earns you +$3,589 MORE (44% more!)</span>
              </p>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Based on $10,000 invested at 8% APY for 10 years
              </p>
            </CardContent>
          </Card>
        )}

        {/* DRIP Settings */}
        {isEnabled && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>What to Reinvest</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Property Dividends</Label>
                    <p className="text-sm text-muted-foreground">Reinvest equity token dividends</p>
                  </div>
                  <Checkbox
                    checked={localSettings.reinvest_equity_dividends}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({ ...prev, reinvest_equity_dividends: !!checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Loan Interest Payments</Label>
                    <p className="text-sm text-muted-foreground">Reinvest debt investment interest</p>
                  </div>
                  <Checkbox
                    checked={localSettings.reinvest_debt_interest}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({ ...prev, reinvest_debt_interest: !!checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <Label className="font-medium">Prediction Winnings</Label>
                    <p className="text-sm text-muted-foreground">Reinvest winning prediction payouts</p>
                  </div>
                  <Checkbox
                    checked={localSettings.reinvest_prediction_winnings}
                    onCheckedChange={(checked) => 
                      setLocalSettings(prev => ({ ...prev, reinvest_prediction_winnings: !!checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reinvestment Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={localSettings.drip_type}
                  onValueChange={(value) => setLocalSettings(prev => ({ ...prev, drip_type: value }))}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 p-3 bg-secondary/50 rounded-lg">
                    <RadioGroupItem value="same_property" id="same_property" className="mt-1" />
                    <div>
                      <Label htmlFor="same_property" className="font-medium">Same Property</Label>
                      <p className="text-sm text-muted-foreground">Reinvest dividends into the same property</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-secondary/50 rounded-lg">
                    <RadioGroupItem value="spread_portfolio" id="spread_portfolio" className="mt-1" />
                    <div>
                      <Label htmlFor="spread_portfolio" className="font-medium">Spread Across Portfolio</Label>
                      <p className="text-sm text-muted-foreground">Distribute reinvestments across all holdings</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-secondary/50 rounded-lg">
                    <RadioGroupItem value="custom" id="custom" className="mt-1" />
                    <div>
                      <Label htmlFor="custom" className="font-medium">Custom Allocation</Label>
                      <p className="text-sm text-muted-foreground">Choose specific properties for reinvestment</p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Minimum Reinvestment Amount</CardTitle>
                <CardDescription>
                  Amounts below this will accumulate in your DRIP balance until they reach the minimum.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <Input
                    type="number"
                    value={localSettings.minimum_reinvest_amount}
                    onChange={(e) => setLocalSettings(prev => ({ 
                      ...prev, 
                      minimum_reinvest_amount: parseFloat(e.target.value) || 10 
                    }))}
                    min={1}
                    step={1}
                    className="max-w-32"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property-Specific Settings */}
            {holdings && holdings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Property-Specific Settings
                  </CardTitle>
                  <CardDescription>
                    Customize DRIP for each property
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {holdings.map((holding) => {
                    const propertySetting = propertySettings?.find(p => p.property_id === holding.property_id);
                    const isPropertyEnabled = propertySetting?.is_enabled ?? true;
                    
                    return (
                      <div key={holding.property_id} className="p-4 bg-secondary/50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{holding.property?.name || 'Property'}</p>
                            <p className="text-sm text-muted-foreground">
                              {holding.tokens} tokens • ${(holding.tokens * (holding.property?.token_price || 0)).toFixed(2)}
                            </p>
                          </div>
                          <Switch
                            checked={isPropertyEnabled}
                            onCheckedChange={(checked) => 
                              updatePropertySettings({ 
                                propertyId: holding.property_id, 
                                updates: { is_enabled: checked } 
                              })
                            }
                          />
                        </div>
                        
                        {isPropertyEnabled && (
                          <div className="pt-2 border-t border-border">
                            <Label className="text-sm">Reinvest to:</Label>
                            <Select
                              value={propertySetting?.reinvest_to || 'same_property'}
                              onValueChange={(value) => 
                                updatePropertySettings({ 
                                  propertyId: holding.property_id, 
                                  updates: { reinvest_to: value } 
                                })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="same_property">Same Property</SelectItem>
                                {holdings.filter(h => h.property_id !== holding.property_id).map((h) => (
                                  <SelectItem key={h.property_id} value={h.property_id}>
                                    {h.property?.name || 'Other Property'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            <Button 
              className="w-full" 
              onClick={handleSaveSettings}
              disabled={isUpdating}
            >
              Save Settings
            </Button>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
