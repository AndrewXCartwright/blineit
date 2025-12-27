import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import * as OTPAuth from "otpauth";

interface TwoFactorSettings {
  enabled: boolean;
  method: string | null;
  enabledAt: Date | null;
  backupCodesRemaining: number;
  phone: string | null;
}

interface TrustedDevice {
  id: string;
  deviceName: string;
  lastUsedAt: Date;
  trustedUntil: Date;
  createdAt: Date;
}

// Generate a device hash based on browser fingerprint
const generateDeviceHash = (): string => {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const data = `${ua}-${screen}-${timezone}`;
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

// Get device name from user agent
const getDeviceName = (): string => {
  const ua = navigator.userAgent;
  let browser = "Unknown Browser";
  let os = "Unknown OS";
  
  if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edge")) browser = "Edge";
  
  if (ua.includes("Mac")) os = "Mac";
  else if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("iPhone")) os = "iPhone";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("Linux")) os = "Linux";
  
  return `${browser} on ${os}`;
};

// Generate backup codes
const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    codes.push(`${part1}-${part2}`);
  }
  return codes;
};

export function useTwoFactor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<TwoFactorSettings | null>(null);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [setupSecret, setSetupSecret] = useState<string | null>(null);
  const [setupUri, setSetupUri] = useState<string | null>(null);
  const [pendingBackupCodes, setPendingBackupCodes] = useState<string[] | null>(null);

  // Fetch 2FA settings
  const fetchSettings = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("two_factor_enabled, two_factor_method, two_factor_enabled_at, two_factor_backup_codes, two_factor_phone")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      setSettings({
        enabled: data.two_factor_enabled || false,
        method: data.two_factor_method,
        enabledAt: data.two_factor_enabled_at ? new Date(data.two_factor_enabled_at) : null,
        backupCodesRemaining: data.two_factor_backup_codes?.length || 0,
        phone: data.two_factor_phone,
      });
    } catch (error) {
      console.error("Error fetching 2FA settings:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch trusted devices
  const fetchTrustedDevices = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("trusted_devices")
        .select("*")
        .eq("user_id", user.id)
        .order("last_used_at", { ascending: false });

      if (error) throw error;

      setTrustedDevices(
        data.map((d) => ({
          id: d.id,
          deviceName: d.device_name || "Unknown Device",
          lastUsedAt: new Date(d.last_used_at),
          trustedUntil: new Date(d.trusted_until),
          createdAt: new Date(d.created_at),
        }))
      );
    } catch (error) {
      console.error("Error fetching trusted devices:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
    fetchTrustedDevices();
  }, [fetchSettings, fetchTrustedDevices]);

  // Initialize authenticator setup
  const initAuthenticatorSetup = useCallback(() => {
    if (!user) return;

    // Generate a random secret
    const randomBytes = new Uint8Array(20);
    crypto.getRandomValues(randomBytes);
    const secret = new OTPAuth.Secret({ buffer: randomBytes.buffer });

    const totp = new OTPAuth.TOTP({
      issuer: "B-LINE-IT",
      label: user.email || "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
    });

    setSetupSecret(totp.secret.base32);
    setSetupUri(totp.toString());
    
    // Generate backup codes
    const codes = generateBackupCodes();
    setPendingBackupCodes(codes);

    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
      backupCodes: codes,
    };
  }, [user]);

  // Verify TOTP code during setup
  const verifySetupCode = useCallback(async (code: string): Promise<boolean> => {
    if (!user || !setupSecret) return false;

    const totp = new OTPAuth.TOTP({
      issuer: "B-LINE-IT",
      label: user.email || "user",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(setupSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
  }, [user, setupSecret]);

  // Complete authenticator setup
  const completeAuthenticatorSetup = useCallback(async (code: string): Promise<boolean> => {
    if (!user || !setupSecret || !pendingBackupCodes) return false;

    const isValid = await verifySetupCode(code);
    if (!isValid) {
      toast({
        title: "Invalid Code",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          two_factor_enabled: true,
          two_factor_method: "authenticator",
          two_factor_secret: setupSecret,
          two_factor_backup_codes: pendingBackupCodes,
          two_factor_enabled_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchSettings();
      
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication is now active on your account.",
      });

      return true;
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to enable 2FA. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, setupSecret, pendingBackupCodes, verifySetupCode, toast, fetchSettings]);

  // Verify TOTP code during login
  const verifyLoginCode = useCallback(async (
    userId: string, 
    code: string, 
    trustDevice: boolean = false
  ): Promise<boolean> => {
    try {
      // Get user's 2FA secret
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("two_factor_secret, two_factor_backup_codes")
        .eq("user_id", userId)
        .single();

      if (profileError || !profile?.two_factor_secret) {
        return false;
      }

      const totp = new OTPAuth.TOTP({
        issuer: "B-LINE-IT",
        label: "user",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(profile.two_factor_secret),
      });

      const delta = totp.validate({ token: code, window: 1 });
      const isValid = delta !== null;

      // Log the attempt
      await supabase.rpc("log_2fa_attempt", {
        p_user_id: userId,
        p_method: "authenticator",
        p_success: isValid,
        p_user_agent: navigator.userAgent,
      });

      if (isValid && trustDevice) {
        await supabase.rpc("trust_device", {
          p_user_id: userId,
          p_device_hash: generateDeviceHash(),
          p_device_name: getDeviceName(),
        });
      }

      return isValid;
    } catch (error) {
      console.error("Error verifying 2FA code:", error);
      return false;
    }
  }, []);

  // Verify backup code
  const verifyBackupCode = useCallback(async (
    userId: string, 
    code: string
  ): Promise<boolean> => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("two_factor_backup_codes")
        .eq("user_id", userId)
        .single();

      if (profileError || !profile?.two_factor_backup_codes) {
        return false;
      }

      const normalizedCode = code.toUpperCase().replace(/\s/g, "");
      const codes = profile.two_factor_backup_codes as string[];
      const codeIndex = codes.findIndex(c => c.replace("-", "") === normalizedCode.replace("-", ""));

      if (codeIndex === -1) {
        await supabase.rpc("log_2fa_attempt", {
          p_user_id: userId,
          p_method: "backup",
          p_success: false,
          p_user_agent: navigator.userAgent,
        });
        return false;
      }

      // Remove used backup code
      const updatedCodes = [...codes];
      updatedCodes.splice(codeIndex, 1);

      await supabase
        .from("profiles")
        .update({ two_factor_backup_codes: updatedCodes })
        .eq("user_id", userId);

      await supabase.rpc("log_2fa_attempt", {
        p_user_id: userId,
        p_method: "backup",
        p_success: true,
        p_user_agent: navigator.userAgent,
      });

      return true;
    } catch (error) {
      console.error("Error verifying backup code:", error);
      return false;
    }
  }, []);

  // Check if current device is trusted
  const isCurrentDeviceTrusted = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("is_device_trusted", {
        p_user_id: userId,
        p_device_hash: generateDeviceHash(),
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error("Error checking device trust:", error);
      return false;
    }
  }, []);

  // Remove trusted device
  const removeTrustedDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("trusted_devices")
        .delete()
        .eq("id", deviceId);

      if (error) throw error;

      await fetchTrustedDevices();
      toast({
        title: "Device Removed",
        description: "The device has been removed from your trusted devices.",
      });
      return true;
    } catch (error) {
      console.error("Error removing trusted device:", error);
      toast({
        title: "Error",
        description: "Failed to remove device. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchTrustedDevices, toast]);

  // Remove all trusted devices
  const removeAllTrustedDevices = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("trusted_devices")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchTrustedDevices();
      toast({
        title: "All Devices Removed",
        description: "All trusted devices have been removed.",
      });
      return true;
    } catch (error) {
      console.error("Error removing all trusted devices:", error);
      toast({
        title: "Error",
        description: "Failed to remove devices. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, fetchTrustedDevices, toast]);

  // Disable 2FA
  const disable2FA = useCallback(async (password: string, code: string): Promise<boolean> => {
    if (!user) return false;

    // Verify password by re-signing in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email || "",
      password,
    });

    if (signInError) {
      toast({
        title: "Invalid Password",
        description: "The password you entered is incorrect.",
        variant: "destructive",
      });
      return false;
    }

    // Verify 2FA code
    const isCodeValid = await verifyLoginCode(user.id, code);
    if (!isCodeValid) {
      toast({
        title: "Invalid Code",
        description: "The 2FA code you entered is incorrect.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          two_factor_enabled: false,
          two_factor_method: null,
          two_factor_secret: null,
          two_factor_backup_codes: null,
          two_factor_enabled_at: null,
          two_factor_phone: null,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchSettings();
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
      return true;
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to disable 2FA. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, verifyLoginCode, toast, fetchSettings]);

  // Generate new backup codes
  const regenerateBackupCodes = useCallback(async (code: string): Promise<string[] | null> => {
    if (!user) return null;

    const isCodeValid = await verifyLoginCode(user.id, code);
    if (!isCodeValid) {
      toast({
        title: "Invalid Code",
        description: "The 2FA code you entered is incorrect.",
        variant: "destructive",
      });
      return null;
    }

    const newCodes = generateBackupCodes();

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ two_factor_backup_codes: newCodes })
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchSettings();
      toast({
        title: "New Backup Codes Generated",
        description: "Your old backup codes have been invalidated.",
      });
      return newCodes;
    } catch (error) {
      console.error("Error regenerating backup codes:", error);
      toast({
        title: "Error",
        description: "Failed to generate new codes. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, verifyLoginCode, toast, fetchSettings]);

  // Check rate limit
  const checkRateLimit = useCallback(async (userId: string): Promise<{ allowed: boolean; attemptsRemaining?: number }> => {
    try {
      const { data, error } = await supabase.rpc("check_2fa_rate_limit", {
        p_user_id: userId,
      });

      if (error) throw error;
      return data as { allowed: boolean; attemptsRemaining?: number };
    } catch (error) {
      console.error("Error checking rate limit:", error);
      return { allowed: true };
    }
  }, []);

  return {
    settings,
    trustedDevices,
    loading,
    setupSecret,
    setupUri,
    pendingBackupCodes,
    initAuthenticatorSetup,
    verifySetupCode,
    completeAuthenticatorSetup,
    verifyLoginCode,
    verifyBackupCode,
    isCurrentDeviceTrusted,
    removeTrustedDevice,
    removeAllTrustedDevices,
    disable2FA,
    regenerateBackupCodes,
    checkRateLimit,
    fetchSettings,
    fetchTrustedDevices,
    getDeviceHash: generateDeviceHash,
    getDeviceName,
  };
}
