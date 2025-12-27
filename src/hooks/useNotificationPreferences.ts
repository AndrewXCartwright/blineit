import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface NotificationPreferences {
  id: string;
  user_id: string;
  // Email preferences
  email_welcome: boolean;
  email_kyc_status: boolean;
  email_investment_confirm: boolean;
  email_bet_placed: boolean;
  email_bet_resolved: boolean;
  email_interest_payment: boolean;
  email_referral_activity: boolean;
  email_marketing: boolean;
  email_weekly_digest: boolean;
  // Push preferences
  push_enabled: boolean;
  push_investments: boolean;
  push_predictions: boolean;
  push_payments: boolean;
  push_referrals: boolean;
  push_price_alerts: boolean;
  push_new_properties: boolean;
  // Quiet hours
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  // Sound
  notification_sounds: boolean;
  created_at: string;
  updated_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  device_type: string;
  device_name: string | null;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
}

const defaultPreferences: Record<string, any> = {
  email_welcome: true,
  email_kyc_status: true,
  email_investment_confirm: true,
  email_bet_placed: true,
  email_bet_resolved: true,
  email_interest_payment: true,
  email_referral_activity: true,
  email_marketing: false,
  email_weekly_digest: true,
  push_enabled: false,
  push_investments: true,
  push_predictions: true,
  push_payments: true,
  push_referrals: true,
  push_price_alerts: false,
  push_new_properties: false,
  quiet_hours_enabled: false,
  quiet_hours_start: "22:00",
  quiet_hours_end: "07:00",
  notification_sounds: true,
};

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [subscriptions, setSubscriptions] = useState<PushSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch preferences using raw query since types haven't regenerated
      const { data: prefsData, error: prefsError } = await (supabase as any)
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prefsError && prefsError.code !== "PGRST116") {
        console.error("Error fetching notification preferences:", prefsError);
      }

      if (prefsData) {
        setPreferences(prefsData as NotificationPreferences);
      } else {
        // Create default preferences if not exist
        const { data: newPrefs, error: createError } = await (supabase as any)
          .from("notification_preferences")
          .insert({ user_id: user.id, ...defaultPreferences })
          .select()
          .single();

        if (createError) {
          console.error("Error creating notification preferences:", createError);
        } else {
          setPreferences(newPrefs as NotificationPreferences);
        }
      }

      // Fetch push subscriptions
      const { data: subsData, error: subsError } = await (supabase as any)
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (subsError) {
        console.error("Error fetching push subscriptions:", subsError);
      } else {
        setSubscriptions((subsData || []) as PushSubscription[]);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return false;

    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("notification_preferences")
        .update(updates)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating notification preferences:", error);
        toast.error("Failed to save preferences");
        return false;
      }

      setPreferences((prev) => (prev ? { ...prev, ...updates } : null));
      toast.success("Preferences saved");
      return true;
    } finally {
      setSaving(false);
    }
  };

  const removeSubscription = async (subscriptionId: string) => {
    if (!user) return false;

    try {
      const { error } = await (supabase as any)
        .from("push_subscriptions")
        .delete()
        .eq("id", subscriptionId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error removing push subscription:", error);
        toast.error("Failed to remove device");
        return false;
      }

      setSubscriptions((prev) => prev.filter((s) => s.id !== subscriptionId));
      toast.success("Device removed");
      return true;
    } catch (error) {
      console.error("Error removing subscription:", error);
      return false;
    }
  };

  return {
    preferences,
    subscriptions,
    loading,
    saving,
    updatePreferences,
    removeSubscription,
    refetch: fetchPreferences,
  };
}
