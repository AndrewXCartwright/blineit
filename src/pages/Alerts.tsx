import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Plus, Building2, Landmark, Target, TrendingUp, TrendingDown, Pause, Play, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { usePriceAlerts, useAlertHistory, PriceAlert } from '@/hooks/useWatchlist';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';

export default function Alerts() {
  const navigate = useNavigate();
  const { alerts, createAlert, updateAlert, deleteAlert } = usePriceAlerts();
  const { history } = useAlertHistory();
  const [activeTab, setActiveTab] = useState('active');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState<'property' | 'loan' | 'prediction'>('property');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [alertType, setAlertType] = useState<PriceAlert['alert_type']>('price_below');
  const [thresholdValue, setThresholdValue] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  // Fetch all available items
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('*');
      return data || [];
    },
  });

  const { data: loans = [] } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data } = await supabase.from('loans').select('*');
      return data || [];
    },
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const { data } = await supabase.from('prediction_markets').select('*');
      return data || [];
    },
  });

  const activeAlerts = alerts.filter((a) => a.is_active);
  const pausedAlerts = alerts.filter((a) => !a.is_active);

  const stats = {
    active: activeAlerts.length,
    priceAlerts: alerts.filter((a) => a.alert_type.includes('price')).length,
    apyAlerts: alerts.filter((a) => a.alert_type.includes('apy')).length,
    triggered: history.length,
  };

  const getItemName = (itemType: string, itemId: string) => {
    if (itemType === 'property') {
      return properties.find((p) => p.id === itemId)?.name || 'Unknown Property';
    } else if (itemType === 'loan') {
      return loans.find((l) => l.id === itemId)?.name || 'Unknown Loan';
    } else {
      const pred = predictions.find((p) => p.id === itemId);
      return pred?.title || pred?.question || 'Unknown Prediction';
    }
  };

  const getCurrentValue = (itemType: string, itemId: string) => {
    if (itemType === 'property') {
      return properties.find((p) => p.id === itemId)?.token_price || 0;
    } else if (itemType === 'loan') {
      return loans.find((l) => l.id === itemId)?.apy || 0;
    } else {
      return predictions.find((p) => p.id === itemId)?.yes_price || 0;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      price_above: 'Price Above',
      price_below: 'Price Below',
      price_change_percent: 'Price Change %',
      apy_above: 'APY Above',
      apy_below: 'APY Below',
      funding_above: 'Funding Above',
      odds_above: 'Odds Above',
      odds_below: 'Odds Below',
    };
    return labels[type] || type;
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'property':
        return <Building2 className="h-4 w-4" />;
      case 'loan':
        return <Landmark className="h-4 w-4" />;
      case 'prediction':
        return <Target className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getProgressToTrigger = (alert: PriceAlert) => {
    const currentValue = getCurrentValue(alert.item_type, alert.item_id);
    if (alert.alert_type === 'price_below' || alert.alert_type === 'apy_below' || alert.alert_type === 'odds_below') {
      if (currentValue <= alert.threshold_value) return 100;
      const diff = currentValue - alert.threshold_value;
      const total = currentValue;
      return Math.max(0, Math.min(100, 100 - (diff / total) * 100));
    } else {
      if (currentValue >= alert.threshold_value) return 100;
      const progress = (currentValue / alert.threshold_value) * 100;
      return Math.max(0, Math.min(100, progress));
    }
  };

  const handleCreateAlert = () => {
    if (!selectedItemId || !thresholdValue) return;
    
    createAlert.mutate({
      itemType: selectedItemType,
      itemId: selectedItemId,
      alertType: alertType,
      thresholdValue: parseFloat(thresholdValue),
      isRecurring,
    }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setSelectedItemId('');
        setThresholdValue('');
      },
    });
  };

  const availableItems = selectedItemType === 'property' 
    ? properties 
    : selectedItemType === 'loan' 
      ? loans 
      : predictions;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Price Alerts
            </h1>
            <p className="text-sm text-muted-foreground">Get notified when prices change</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Price Alert</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Asset Type</Label>
                  <Select value={selectedItemType} onValueChange={(v) => {
                    setSelectedItemType(v as 'property' | 'loan' | 'prediction');
                    setSelectedItemId('');
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="loan">Loan</SelectItem>
                      <SelectItem value="prediction">Prediction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Asset</Label>
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableItems.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name || item.title || item.question}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Alert Type</Label>
                  <RadioGroup value={alertType} onValueChange={(v) => setAlertType(v as PriceAlert['alert_type'])}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="price_below" id="price_below" />
                      <Label htmlFor="price_below">Price drops below</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="price_above" id="price_above" />
                      <Label htmlFor="price_above">Price rises above</Label>
                    </div>
                    {selectedItemType !== 'prediction' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apy_above" id="apy_above" />
                          <Label htmlFor="apy_above">APY rises above</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apy_below" id="apy_below" />
                          <Label htmlFor="apy_below">APY drops below</Label>
                        </div>
                      </>
                    )}
                    {selectedItemType === 'prediction' && (
                      <>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="odds_above" id="odds_above" />
                          <Label htmlFor="odds_above">Odds rise above</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="odds_below" id="odds_below" />
                          <Label htmlFor="odds_below">Odds drop below</Label>
                        </div>
                      </>
                    )}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Threshold Value</Label>
                  <Input
                    type="number"
                    placeholder={alertType.includes('apy') || alertType.includes('odds') ? 'e.g., 10' : 'e.g., 120.00'}
                    value={thresholdValue}
                    onChange={(e) => setThresholdValue(e.target.value)}
                  />
                  {selectedItemId && (
                    <p className="text-xs text-muted-foreground">
                      Current value: {alertType.includes('price') 
                        ? formatCurrency(getCurrentValue(selectedItemType, selectedItemId))
                        : `${getCurrentValue(selectedItemType, selectedItemId)}%`
                      }
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="recurring">Recurring alert</Label>
                  <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                </div>

                <Button className="w-full" onClick={handleCreateAlert} disabled={!selectedItemId || !thresholdValue}>
                  Create Alert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <Card className="text-center p-3">
            <div className="text-2xl font-bold">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-2xl font-bold">{stats.priceAlerts}</div>
            <div className="text-xs text-muted-foreground">Price</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-2xl font-bold">{stats.apyAlerts}</div>
            <div className="text-xs text-muted-foreground">APY</div>
          </Card>
          <Card className="text-center p-3">
            <div className="text-2xl font-bold">{stats.triggered}</div>
            <div className="text-xs text-muted-foreground">Triggered</div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">Active ({activeAlerts.length})</TabsTrigger>
            <TabsTrigger value="triggered" className="flex-1">Triggered ({history.length})</TabsTrigger>
            <TabsTrigger value="all" className="flex-1">All ({alerts.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Alerts List */}
        <div className="space-y-3">
          {activeTab === 'triggered' ? (
            history.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No triggered alerts yet</h3>
                <p className="text-sm text-muted-foreground">
                  Alerts will appear here when conditions are met.
                </p>
              </Card>
            ) : (
              history.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {getItemName(item.item_type, item.item_id)}
                          </span>
                          {!item.is_read && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{item.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Target: {item.threshold_value}</span>
                          <span>Actual: {item.actual_value}</span>
                          <span>{format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          ) : (
            (activeTab === 'active' ? activeAlerts : alerts).length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No alerts yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create an alert to get notified when conditions are met.
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </Card>
            ) : (
              (activeTab === 'active' ? activeAlerts : alerts).map((alert) => {
                const progress = getProgressToTrigger(alert);
                const currentValue = getCurrentValue(alert.item_type, alert.item_id);
                
                return (
                  <Card key={alert.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {getItemIcon(alert.item_type)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4" />
                              <span className="font-medium">{getAlertTypeLabel(alert.alert_type)}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {getItemName(alert.item_type, alert.item_id)}
                            </span>
                          </div>
                        </div>
                        <Badge variant={alert.is_active ? 'default' : 'secondary'}>
                          {alert.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>

                      <p className="text-sm mb-2">
                        Alert when {alert.alert_type.includes('price') ? 'price' : alert.alert_type.includes('apy') ? 'APY' : 'odds'}{' '}
                        {alert.alert_type.includes('below') ? 'drops below' : 'rises above'}{' '}
                        <span className="font-medium">
                          {alert.alert_type.includes('price') 
                            ? formatCurrency(alert.threshold_value)
                            : `${alert.threshold_value}%`
                          }
                        </span>
                      </p>

                      <div className="text-sm text-muted-foreground mb-2">
                        Current: {alert.alert_type.includes('price') 
                          ? formatCurrency(currentValue)
                          : `${currentValue}%`
                        }
                      </div>

                      <div className="mb-3">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">{progress.toFixed(0)}% to trigger</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAlert.mutate({ id: alert.id, isActive: !alert.is_active })}
                        >
                          {alert.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => deleteAlert.mutate(alert.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
