import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export function usePushNotifications() {
  const { user } = useAuth();
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  );
  const [isRequesting, setIsRequesting] = useState(false);

  const isPushSupported = typeof window !== "undefined" && "Notification" in window;

  const getDeviceName = (): string => {
    const ua = navigator.userAgent;
    
    if (/iPad|iPhone|iPod/.test(ua)) {
      return `Safari on iPhone`;
    } else if (/Android/.test(ua)) {
      return `Chrome on Android`;
    } else if (/Mac/.test(ua)) {
      if (/Chrome/.test(ua)) return `Chrome on MacBook`;
      if (/Safari/.test(ua)) return `Safari on Mac`;
      if (/Firefox/.test(ua)) return `Firefox on Mac`;
    } else if (/Windows/.test(ua)) {
      if (/Chrome/.test(ua)) return `Chrome on Windows`;
      if (/Firefox/.test(ua)) return `Firefox on Windows`;
      if (/Edge/.test(ua)) return `Edge on Windows`;
    } else if (/Linux/.test(ua)) {
      return `Browser on Linux`;
    }
    
    return "Web Browser";
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported) {
      toast.error("Push notifications are not supported on this device");
      return false;
    }

    if (!user) {
      toast.error("Please sign in to enable notifications");
      return false;
    }

    setIsRequesting(true);

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === "granted") {
        // For demo purposes, we'll simulate a push subscription
        // In production, you would use the Push API with a service worker
        const mockSubscription = {
          endpoint: `https://push.example.com/${crypto.randomUUID()}`,
          p256dh_key: btoa(crypto.randomUUID()),
          auth_key: btoa(crypto.randomUUID().slice(0, 16)),
        };

        const { error } = await (supabase as any).from("push_subscriptions").insert({
          user_id: user.id,
          endpoint: mockSubscription.endpoint,
          p256dh_key: mockSubscription.p256dh_key,
          auth_key: mockSubscription.auth_key,
          device_type: "web",
          device_name: getDeviceName(),
        });

        if (error) {
          if (error.code === "23505") {
            // Duplicate entry - device already registered
            toast.success("This device is already registered");
          } else {
            console.error("Error saving push subscription:", error);
            toast.error("Failed to register for push notifications");
            return false;
          }
        }

        // Update preferences to enable push
        await (supabase as any)
          .from("notification_preferences")
          .update({ push_enabled: true })
          .eq("user_id", user.id);

        toast.success("Push notifications enabled!");
        
        // Show a test notification
        new Notification("🐝 B-LINE-IT", {
          body: "You'll now receive real-time updates!",
          icon: "/favicon.ico",
        });

        return true;
      } else if (permission === "denied") {
        toast.error("Notification permission denied. Please enable it in your browser settings.");
        return false;
      }

      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Failed to enable push notifications");
      return false;
    } finally {
      setIsRequesting(false);
    }
  }, [isPushSupported, user]);

  const showNotification = useCallback(
    (title: string, options?: NotificationOptions) => {
      if (permissionState !== "granted") {
        console.log("Push notification (simulated):", title, options?.body);
        toast(title, { description: options?.body });
        return;
      }

      try {
        new Notification(title, {
          icon: "/favicon.ico",
          badge: "/favicon.ico",
          ...options,
        });
      } catch (error) {
        console.error("Error showing notification:", error);
        toast(title, { description: options?.body });
      }
    },
    [permissionState]
  );

  return {
    isPushSupported,
    permissionState,
    isRequesting,
    requestPermission,
    showNotification,
    isEnabled: permissionState === "granted",
  };
}
