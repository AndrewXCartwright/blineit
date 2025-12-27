import { useState } from "react";
import { ArrowLeft, Bell, Mail, Smartphone, Moon, Volume2, Trash2, Laptop, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { PushPermissionModal } from "@/components/PushPermissionModal";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/Skeleton";
import { formatDistanceToNow } from "date-fns";

export default function NotificationSettings() {
  const { preferences, subscriptions, loading, saving, updatePreferences, removeSubscription } = useNotificationPreferences();
  const { isPushSupported, isEnabled, requestPermission, isRequesting } = usePushNotifications();
  const [showPushModal, setShowPushModal] = useState(false);

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled && !isEnabled) {
      setShowPushModal(true);
    } else {
      await updatePreferences({ push_enabled: enabled });
    }
  };

  const handleEnablePush = async () => {
    const success = await requestPermission();
    if (success) {
      await updatePreferences({ push_enabled: true });
    }
    setShowPushModal(false);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "ios":
      case "android":
        return Smartphone;
      case "web":
      default:
        return Laptop;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/profile" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground">Notification Settings</h1>
          </div>
        </header>
        <main className="px-4 py-6 space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-xl font-bold text-foreground">Notification Settings</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Push Notifications Section */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-display font-semibold text-foreground">Push Notifications</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Enable Push Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alerts on this device</p>
            </div>
            <Switch
              checked={preferences?.push_enabled ?? false}
              onCheckedChange={handlePushToggle}
              disabled={!isPushSupported || saving}
            />
          </div>

          {preferences?.push_enabled && (
            <div className="space-y-3 pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground">When enabled, notify me about:</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Investment confirmations</span>
                  <Switch
                    checked={preferences?.push_investments ?? true}
                    onCheckedChange={(checked) => updatePreferences({ push_investments: checked })}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Bet results (win/loss)</span>
                  <Switch
                    checked={preferences?.push_predictions ?? true}
                    onCheckedChange={(checked) => updatePreferences({ push_predictions: checked })}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Interest payments</span>
                  <Switch
                    checked={preferences?.push_payments ?? true}
                    onCheckedChange={(checked) => updatePreferences({ push_payments: checked })}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Referral activity</span>
                  <Switch
                    checked={preferences?.push_referrals ?? true}
                    onCheckedChange={(checked) => updatePreferences({ push_referrals: checked })}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Price alerts</span>
                  <Switch
                    checked={preferences?.push_price_alerts ?? false}
                    onCheckedChange={(checked) => updatePreferences({ push_price_alerts: checked })}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">New property listings</span>
                  <Switch
                    checked={preferences?.push_new_properties ?? false}
                    onCheckedChange={(checked) => updatePreferences({ push_new_properties: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Registered Devices */}
        {subscriptions.length > 0 && (
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary">
                <Smartphone className="w-5 h-5 text-muted-foreground" />
              </div>
              <h2 className="font-display font-semibold text-foreground">Registered Devices</h2>
            </div>

            <div className="space-y-3">
              {subscriptions.map((sub) => {
                const DeviceIcon = getDeviceIcon(sub.device_type);
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
                  >
                    <div className="flex items-center gap-3">
                      <DeviceIcon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {sub.device_name || "Unknown Device"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Added {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                          {sub.last_used_at && ` • Last active ${formatDistanceToNow(new Date(sub.last_used_at), { addSuffix: true })}`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removeSubscription(sub.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Email Notifications Section */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary">
              <Mail className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-foreground">Email Notifications</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">Account</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Welcome email</span>
                  <Switch
                    checked={preferences?.email_welcome ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_welcome: checked })}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">KYC status updates</span>
                  <Switch
                    checked={preferences?.email_kyc_status ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_kyc_status: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Investments</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Investment confirmations</span>
                  <Switch
                    checked={preferences?.email_investment_confirm ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_investment_confirm: checked })}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Interest payments</span>
                  <Switch
                    checked={preferences?.email_interest_payment ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_interest_payment: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Predictions</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Bet confirmations</span>
                  <Switch
                    checked={preferences?.email_bet_placed ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_bet_placed: checked })}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Bet results</span>
                  <Switch
                    checked={preferences?.email_bet_resolved ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_bet_resolved: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Referrals</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Referral activity</span>
                  <Switch
                    checked={preferences?.email_referral_activity ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_referral_activity: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-muted-foreground mb-3">Updates</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Weekly digest</span>
                  <Switch
                    checked={preferences?.email_weekly_digest ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_weekly_digest: checked })}
                    disabled={saving}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Marketing & promotions</span>
                  <Switch
                    checked={preferences?.email_marketing ?? false}
                    onCheckedChange={(checked) => updatePreferences({ email_marketing: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary">
              <Moon className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-foreground">Quiet Hours</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Enable Quiet Hours</p>
              <p className="text-sm text-muted-foreground">
                Pause notifications from {preferences?.quiet_hours_start || "22:00"} to {preferences?.quiet_hours_end || "07:00"}
              </p>
            </div>
            <Switch
              checked={preferences?.quiet_hours_enabled ?? false}
              onCheckedChange={(checked) => updatePreferences({ quiet_hours_enabled: checked })}
              disabled={saving}
            />
          </div>
        </div>

        {/* Sound Settings */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary">
              <Volume2 className="w-5 h-5 text-muted-foreground" />
            </div>
            <h2 className="font-display font-semibold text-foreground">Sound</h2>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Notification Sounds</p>
              <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
            </div>
            <Switch
              checked={preferences?.notification_sounds ?? true}
              onCheckedChange={(checked) => updatePreferences({ notification_sounds: checked })}
              disabled={saving}
            />
          </div>
        </div>

        {/* Unsubscribe All */}
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => {
              updatePreferences({
                email_welcome: false,
                email_kyc_status: false,
                email_investment_confirm: false,
                email_bet_placed: false,
                email_bet_resolved: false,
                email_interest_payment: false,
                email_referral_activity: false,
                email_marketing: false,
                email_weekly_digest: false,
                push_enabled: false,
              });
            }}
          >
            Unsubscribe from all notifications
          </Button>
        </div>
      </main>

      <PushPermissionModal
        isOpen={showPushModal}
        onClose={() => setShowPushModal(false)}
        onEnable={handleEnablePush}
        isLoading={isRequesting}
      />
    </div>
  );
}
