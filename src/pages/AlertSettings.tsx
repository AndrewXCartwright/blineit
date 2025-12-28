import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Settings, Clock, Mail, Smartphone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePriceAlerts } from '@/hooks/useWatchlist';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

export default function AlertSettings() {
  const navigate = useNavigate();
  const { alerts } = usePriceAlerts();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');

  const maxAlerts = 50;
  const currentAlerts = alerts.length;

  const handleSave = () => {
    toast.success('Alert settings saved');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Alert Settings
            </h1>
            <p className="text-sm text-muted-foreground">Configure your notification preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>Push notifications</Label>
                    <p className="text-sm text-muted-foreground">Get instant alerts on your device</p>
                  </div>
                </div>
                <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>Email notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                  </div>
                </div>
                <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>SMS notifications</Label>
                    <p className="text-sm text-muted-foreground">Get text messages for alerts (requires 2FA)</p>
                  </div>
                </div>
                <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quiet Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable quiet hours</Label>
                  <p className="text-sm text-muted-foreground">Pause notifications during specified hours</p>
                </div>
                <Switch checked={quietHoursEnabled} onCheckedChange={setQuietHoursEnabled} />
              </div>

              {quietHoursEnabled && (
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex-1">
                    <Label className="text-sm mb-2 block">Start time</Label>
                    <Select value={quietStart} onValueChange={setQuietStart}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                        <SelectItem value="21:00">9:00 PM</SelectItem>
                        <SelectItem value="22:00">10:00 PM</SelectItem>
                        <SelectItem value="23:00">11:00 PM</SelectItem>
                        <SelectItem value="00:00">12:00 AM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-muted-foreground pt-6">to</span>
                  <div className="flex-1">
                    <Label className="text-sm mb-2 block">End time</Label>
                    <Select value={quietEnd} onValueChange={setQuietEnd}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="05:00">5:00 AM</SelectItem>
                        <SelectItem value="06:00">6:00 AM</SelectItem>
                        <SelectItem value="07:00">7:00 AM</SelectItem>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {quietHoursEnabled && (
                <p className="text-sm text-muted-foreground">
                  Alerts will be batched and sent after quiet hours end.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Alert Limits */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Maximum active alerts</span>
                <span className="font-medium">{maxAlerts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Currently using</span>
                <span className="font-medium">{currentAlerts}/{maxAlerts}</span>
              </div>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(currentAlerts / maxAlerts) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
