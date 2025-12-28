import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface BiometricSettings {
  id: string;
  user_id: string;
  biometric_enabled: boolean;
  biometric_type: string | null;
  device_id: string;
  device_name: string;
  pin_enabled: boolean;
  pin_hash: string | null;
  require_biometric_for_login: boolean;
  require_biometric_for_transactions: boolean;
  require_biometric_for_transfers: boolean;
  last_biometric_auth: string | null;
  failed_attempts: number;
  locked_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthEvent {
  id: string;
  user_id: string;
  event_type: string;
  auth_method: string;
  device_id: string | null;
  ip_address: string | null;
  location: string | null;
  success: boolean;
  failure_reason: string | null;
  created_at: string;
}

type BiometricType = "face_id" | "touch_id" | "fingerprint" | "none";

// Generate a unique device ID
const generateDeviceId = (): string => {
  const storedId = localStorage.getItem("blineit_device_id");
  if (storedId) return storedId;
  
  const newId = crypto.randomUUID();
  localStorage.setItem("blineit_device_id", newId);
  return newId;
};

// Detect device name
const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android Device";
  if (/Mac/.test(ua)) return "Mac";
  if (/Windows/.test(ua)) return "Windows PC";
  return "Unknown Device";
};

// Check if Web Authentication API is available
const isBiometricAvailable = async (): Promise<boolean> => {
  if (!window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

// Detect biometric type based on platform
const detectBiometricType = (): BiometricType => {
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) {
    // iPhone X and later have Face ID, earlier have Touch ID
    return "face_id"; // Simplified - in production would detect more precisely
  }
  if (/Android/.test(ua)) {
    return "fingerprint";
  }
  if (/Mac/.test(ua)) {
    return "touch_id";
  }
  return "none";
};

// Simple hash function for PIN (in production, use proper crypto)
const hashPin = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "blineit_salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

export const useBiometric = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deviceId] = useState(generateDeviceId);
  const [deviceName] = useState(getDeviceName);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>("none");

  // Check biometric availability on mount
  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailable);
    setBiometricType(detectBiometricType());
  }, []);

  // Fetch biometric settings for current device
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ["biometric-settings", user?.id, deviceId],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("biometric_settings")
        .select("*")
        .eq("user_id", user.id)
        .eq("device_id", deviceId)
        .maybeSingle();

      if (error) throw error;
      return data as BiometricSettings | null;
    },
    enabled: !!user,
  });

  // Fetch all biometric settings for user (all devices)
  const { data: allDeviceSettings = [] } = useQuery({
    queryKey: ["biometric-settings-all", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("biometric_settings")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as BiometricSettings[];
    },
    enabled: !!user,
  });

  // Fetch recent auth events
  const { data: authEvents = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["auth-events", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("auth_events")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AuthEvent[];
    },
    enabled: !!user,
  });

  // Enable biometric authentication
  const enableBiometricMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // In demo mode, simulate biometric enrollment
      // In production, this would trigger WebAuthn registration
      
      const { error } = await supabase
        .from("biometric_settings")
        .upsert({
          user_id: user.id,
          device_id: deviceId,
          device_name: deviceName,
          biometric_enabled: true,
          biometric_type: biometricType,
        }, { onConflict: "user_id,device_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-settings"] });
      toast.success(`${biometricType === "face_id" ? "Face ID" : biometricType === "touch_id" ? "Touch ID" : "Fingerprint"} enabled!`);
    },
    onError: (error) => {
      console.error("Enable biometric error:", error);
      toast.error("Failed to enable biometric authentication");
    },
  });

  // Disable biometric authentication
  const disableBiometricMutation = useMutation({
    mutationFn: async () => {
      if (!user || !settings) throw new Error("No settings found");

      const { error } = await supabase
        .from("biometric_settings")
        .update({ biometric_enabled: false, biometric_type: null })
        .eq("id", settings.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-settings"] });
      toast.success("Biometric authentication disabled");
    },
    onError: (error) => {
      console.error("Disable biometric error:", error);
      toast.error("Failed to disable biometric authentication");
    },
  });

  // Set up PIN
  const setupPinMutation = useMutation({
    mutationFn: async (pin: string) => {
      if (!user) throw new Error("Not authenticated");
      if (pin.length !== 6 || !/^\d+$/.test(pin)) {
        throw new Error("PIN must be 6 digits");
      }

      const pinHash = await hashPin(pin);

      const { error } = await supabase
        .from("biometric_settings")
        .upsert({
          user_id: user.id,
          device_id: deviceId,
          device_name: deviceName,
          pin_enabled: true,
          pin_hash: pinHash,
        }, { onConflict: "user_id,device_id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-settings"] });
      toast.success("PIN created successfully!");
    },
    onError: (error) => {
      console.error("Setup PIN error:", error);
      toast.error("Failed to set up PIN");
    },
  });

  // Verify PIN
  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!settings?.pin_hash) return false;
    
    const pinHash = await hashPin(pin);
    const isValid = pinHash === settings.pin_hash;

    // Log auth event
    if (user) {
      await supabase.from("auth_events").insert({
        user_id: user.id,
        event_type: "login",
        auth_method: "pin",
        device_id: deviceId,
        success: isValid,
        failure_reason: isValid ? null : "Invalid PIN",
      });
    }

    if (!isValid && settings) {
      // Increment failed attempts
      await supabase
        .from("biometric_settings")
        .update({ 
          failed_attempts: (settings.failed_attempts || 0) + 1,
          locked_until: settings.failed_attempts >= 4 
            ? new Date(Date.now() + 5 * 60 * 1000).toISOString() 
            : null
        })
        .eq("id", settings.id);
    } else if (isValid && settings) {
      // Reset failed attempts
      await supabase
        .from("biometric_settings")
        .update({ failed_attempts: 0, locked_until: null })
        .eq("id", settings.id);
    }

    return isValid;
  }, [settings, user, deviceId]);

  // Simulate biometric authentication (in demo mode)
  const authenticateBiometric = useCallback(async (): Promise<boolean> => {
    // In production, this would use WebAuthn
    // For demo, we simulate success after a delay
    return new Promise((resolve) => {
      setTimeout(async () => {
        if (user) {
          await supabase.from("auth_events").insert({
            user_id: user.id,
            event_type: "login",
            auth_method: "biometric",
            device_id: deviceId,
            success: true,
          });

          if (settings) {
            await supabase
              .from("biometric_settings")
              .update({ last_biometric_auth: new Date().toISOString() })
              .eq("id", settings.id);
          }
        }
        resolve(true);
      }, 1000);
    });
  }, [user, deviceId, settings]);

  // Update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<BiometricSettings>) => {
      if (!user || !settings) throw new Error("No settings found");

      const { error } = await supabase
        .from("biometric_settings")
        .update(updates)
        .eq("id", settings.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-settings"] });
      toast.success("Settings updated");
    },
    onError: (error) => {
      console.error("Update settings error:", error);
      toast.error("Failed to update settings");
    },
  });

  // Remove a device
  const removeDeviceMutation = useMutation({
    mutationFn: async (settingsId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("biometric_settings")
        .delete()
        .eq("id", settingsId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["biometric-settings"] });
      toast.success("Device removed");
    },
    onError: (error) => {
      console.error("Remove device error:", error);
      toast.error("Failed to remove device");
    },
  });

  // Log auth event
  const logAuthEvent = useCallback(async (
    eventType: string,
    authMethod: string,
    success: boolean,
    failureReason?: string
  ) => {
    if (!user) return;

    await supabase.from("auth_events").insert({
      user_id: user.id,
      event_type: eventType,
      auth_method: authMethod,
      device_id: deviceId,
      success,
      failure_reason: failureReason,
    });
  }, [user, deviceId]);

  // Check if account is locked
  const isLocked = settings?.locked_until 
    ? new Date(settings.locked_until) > new Date() 
    : false;

  return {
    // Data
    settings,
    allDeviceSettings,
    authEvents,
    deviceId,
    deviceName,
    biometricAvailable,
    biometricType,
    isLocked,

    // Loading states
    loadingSettings,
    loadingEvents,

    // Mutations
    enableBiometric: enableBiometricMutation.mutate,
    isEnabling: enableBiometricMutation.isPending,
    disableBiometric: disableBiometricMutation.mutate,
    isDisabling: disableBiometricMutation.isPending,
    setupPin: setupPinMutation.mutate,
    isSettingUpPin: setupPinMutation.isPending,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
    removeDevice: removeDeviceMutation.mutate,
    isRemovingDevice: removeDeviceMutation.isPending,

    // Methods
    verifyPin,
    authenticateBiometric,
    logAuthEvent,
  };
};
