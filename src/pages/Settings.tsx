import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, Camera, Check, X, Loader2, User, Mail, Phone, 
  AtSign, Bell, Shield, Palette, Globe, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitcher } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Settings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile, refetch } = useUserData();
  const { preferences, updatePreferences, loading: prefsLoading } = useNotificationPreferences();

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Username validation states
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  
  // Loading states
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || profile.name || "");
      setUsername((profile as any).username || "");
      setPhoneNumber((profile as any).phone_number || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  // Debounced username availability check
  const checkUsernameAvailability = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setUsernameStatus("idle");
      setUsernameError(value && value.length < 3 ? "Username must be at least 3 characters" : null);
      return;
    }

    if (value.length > 20) {
      setUsernameStatus("invalid");
      setUsernameError("Username must be 20 characters or less");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameStatus("invalid");
      setUsernameError("Only letters, numbers, and underscores allowed");
      return;
    }

    // If it's the same as current username, it's available
    if ((profile as any)?.username?.toLowerCase() === value.toLowerCase()) {
      setUsernameStatus("available");
      setUsernameError(null);
      return;
    }

    setUsernameStatus("checking");
    setUsernameError(null);

    try {
      const { data, error } = await supabase.rpc("check_username_available", {
        check_username: value
      });

      if (error) {
        console.error("Error checking username:", error);
        setUsernameStatus("idle");
        return;
      }

      setUsernameStatus(data ? "available" : "taken");
      setUsernameError(data ? null : "Username is already taken");
    } catch (err) {
      console.error("Error checking username:", err);
      setUsernameStatus("idle");
    }
  }, [profile]);

  // Debounce username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameAvailability(username);
      } else {
        setUsernameStatus("idle");
        setUsernameError(null);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, checkUsernameAvailability]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Avatar uploaded successfully");
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Validate username if changed
    if (username && usernameStatus !== "available" && usernameStatus !== "idle") {
      if ((profile as any)?.username?.toLowerCase() !== username.toLowerCase()) {
        toast.error("Please choose a valid username");
        return;
      }
    }

    setSaving(true);
    try {
      // Update username via RPC if changed
      if (username && (profile as any)?.username !== username) {
        const { data: usernameResult, error: usernameError } = await supabase.rpc("update_username", {
          new_username: username
        });

        if (usernameError) throw usernameError;
        
        const result = usernameResult as { success: boolean; error?: string };
        if (!result.success) {
          toast.error(result.error || "Failed to update username");
          setSaving(false);
          return;
        }
      }

      // Update other profile fields
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          phone_number: phoneNumber,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        } as any)
        .eq("user_id", user.id);

      if (error) throw error;

      await refetch();
      toast.success("Profile saved successfully!");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (displayName) {
      return displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUsernameIcon = () => {
    switch (usernameStatus) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case "available":
        return <Check className="h-4 w-4 text-green-500" />;
      case "taken":
      case "invalid":
        return <X className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-lg">Settings</h1>
            <p className="text-xs text-muted-foreground">Manage your account</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="account" className="flex flex-col gap-1 py-2 text-xs">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex flex-col gap-1 py-2 text-xs">
              <Bell className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="security" className="flex flex-col gap-1 py-2 text-xs">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex flex-col gap-1 py-2 text-xs">
              <Palette className="h-4 w-4" />
              Display
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-2 border-border">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                      {uploadingAvatar ? (
                        <Loader2 className="h-3.5 w-3.5 text-primary-foreground animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5 text-primary-foreground" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </label>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Upload a profile photo</p>
                    <p className="text-xs">Max 5MB, JPG or PNG</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Account Information</CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <AtSign className="h-3.5 w-3.5" />
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="your_username"
                      className={cn(
                        "pr-10",
                        usernameStatus === "available" && "border-green-500 focus-visible:ring-green-500",
                        (usernameStatus === "taken" || usernameStatus === "invalid") && "border-destructive focus-visible:ring-destructive"
                      )}
                      maxLength={20}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {getUsernameIcon()}
                    </div>
                  </div>
                  {usernameError && (
                    <p className="text-xs text-destructive">{usernameError}</p>
                  )}
                  {usernameStatus === "available" && username && (
                    <p className="text-xs text-green-500">Username is available!</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    3-20 characters, letters, numbers, and underscores only
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" />
                    Phone Number (optional)
                  </Label>
                  <Input
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    type="tel"
                  />
                </div>

                <Separator />

                <Button 
                  onClick={handleSaveProfile} 
                  disabled={saving || usernameStatus === "checking" || usernameStatus === "taken" || usernameStatus === "invalid"}
                  className="w-full"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Email Notifications</CardTitle>
                <CardDescription>Choose what emails you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Investment Confirmations</p>
                    <p className="text-xs text-muted-foreground">Get notified when you make investments</p>
                  </div>
                  <Switch
                    checked={preferences?.email_investment_confirm ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_investment_confirm: checked })}
                    disabled={prefsLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Prediction Results</p>
                    <p className="text-xs text-muted-foreground">Know when your bets are resolved</p>
                  </div>
                  <Switch
                    checked={preferences?.email_bet_resolved ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_bet_resolved: checked })}
                    disabled={prefsLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Payment Updates</p>
                    <p className="text-xs text-muted-foreground">Interest and dividend payments</p>
                  </div>
                  <Switch
                    checked={preferences?.email_interest_payment ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_interest_payment: checked })}
                    disabled={prefsLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Weekly Digest</p>
                    <p className="text-xs text-muted-foreground">Summary of your portfolio</p>
                  </div>
                  <Switch
                    checked={preferences?.email_weekly_digest ?? true}
                    onCheckedChange={(checked) => updatePreferences({ email_weekly_digest: checked })}
                    disabled={prefsLoading}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Marketing Emails</p>
                    <p className="text-xs text-muted-foreground">New features and promotions</p>
                  </div>
                  <Switch
                    checked={preferences?.email_marketing ?? false}
                    onCheckedChange={(checked) => updatePreferences({ email_marketing: checked })}
                    disabled={prefsLoading}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Push Notifications</CardTitle>
                <CardDescription>Mobile and browser alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Enable Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive real-time alerts</p>
                  </div>
                  <Switch
                    checked={preferences?.push_enabled ?? false}
                    onCheckedChange={(checked) => updatePreferences({ push_enabled: checked })}
                    disabled={prefsLoading}
                  />
                </div>
                {preferences?.push_enabled && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">Price Alerts</p>
                        <p className="text-xs text-muted-foreground">When assets hit your targets</p>
                      </div>
                      <Switch
                        checked={preferences?.push_price_alerts ?? false}
                        onCheckedChange={(checked) => updatePreferences({ push_price_alerts: checked })}
                        disabled={prefsLoading}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">New Properties</p>
                        <p className="text-xs text-muted-foreground">New investment opportunities</p>
                      </div>
                      <Switch
                        checked={preferences?.push_new_properties ?? false}
                        onCheckedChange={(checked) => updatePreferences({ push_new_properties: checked })}
                        disabled={prefsLoading}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quiet Hours</CardTitle>
                <CardDescription>Pause notifications during certain times</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Enable Quiet Hours</p>
                    <p className="text-xs text-muted-foreground">No notifications during these hours</p>
                  </div>
                  <Switch
                    checked={preferences?.quiet_hours_enabled ?? false}
                    onCheckedChange={(checked) => updatePreferences({ quiet_hours_enabled: checked })}
                    disabled={prefsLoading}
                  />
                </div>
                {preferences?.quiet_hours_enabled && (
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">Start</Label>
                      <Input
                        type="time"
                        value={preferences?.quiet_hours_start || "22:00"}
                        onChange={(e) => updatePreferences({ quiet_hours_start: e.target.value })}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs">End</Label>
                      <Input
                        type="time"
                        value={preferences?.quiet_hours_end || "07:00"}
                        onChange={(e) => updatePreferences({ quiet_hours_end: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Enable 2FA</p>
                    <p className="text-xs text-muted-foreground">
                      {(profile as any)?.two_factor_enabled 
                        ? "Two-factor authentication is enabled" 
                        : "Protect your account with 2FA"
                      }
                    </p>
                  </div>
                  <Button
                    variant={(profile as any)?.two_factor_enabled ? "outline" : "default"}
                    size="sm"
                    onClick={() => navigate("/security")}
                  >
                    {(profile as any)?.two_factor_enabled ? "Manage" : "Set Up"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Security Activity</CardTitle>
                <CardDescription>Recent account activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/security")}
                >
                  View Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Theme
                </CardTitle>
                <CardDescription>Choose your preferred appearance</CardDescription>
              </CardHeader>
              <CardContent>
                <ThemeSwitcher />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Language
                </CardTitle>
                <CardDescription>Select your preferred language</CardDescription>
              </CardHeader>
              <CardContent>
                <LanguageSelector variant="button" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sound</CardTitle>
                <CardDescription>Notification sounds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Notification Sounds</p>
                    <p className="text-xs text-muted-foreground">Play sounds for alerts</p>
                  </div>
                  <Switch
                    checked={preferences?.notification_sounds ?? true}
                    onCheckedChange={(checked) => updatePreferences({ notification_sounds: checked })}
                    disabled={prefsLoading}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}