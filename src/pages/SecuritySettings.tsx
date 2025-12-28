import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Shield, 
  Key, 
  Smartphone, 
  Laptop, 
  Monitor,
  Trash2,
  AlertTriangle,
  Check,
  Copy,
  Download,
  RefreshCw,
  Loader2,
  Fingerprint,
  ScanFace,
  Lock,
  ChevronRight,
  History
} from "lucide-react";
import { useTwoFactor } from "@/hooks/useTwoFactor";
import { useBiometric } from "@/hooks/useBiometric";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function SecuritySettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    settings, 
    trustedDevices, 
    loading,
    removeTrustedDevice,
    removeAllTrustedDevices,
    disable2FA,
    regenerateBackupCodes,
    fetchSettings
  } = useTwoFactor();

  const {
    settings: biometricSettings,
    biometricAvailable,
    biometricType,
    allDeviceSettings,
    loadingSettings: loadingBiometric,
    disableBiometric,
    updateSettings: updateBiometricSettings,
  } = useBiometric();

  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showRegenerateCodes, setShowRegenerateCodes] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [regenerateCode, setRegenerateCode] = useState("");
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleSetupComplete = () => {
    setShowSetup(false);
    fetchSettings();
  };

  const handleDisable2FA = async () => {
    if (!disablePassword || disableCode.length !== 6) return;
    
    setIsDisabling(true);
    const success = await disable2FA(disablePassword, disableCode);
    setIsDisabling(false);
    
    if (success) {
      setShowDisable(false);
      setDisablePassword("");
      setDisableCode("");
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (regenerateCode.length !== 6) return;
    
    setIsRegenerating(true);
    const codes = await regenerateBackupCodes(regenerateCode);
    setIsRegenerating(false);
    
    if (codes) {
      setNewBackupCodes(codes);
      setShowRegenerateCodes(false);
      setRegenerateCode("");
    }
  };

  const handleCopyAllCodes = () => {
    if (newBackupCodes) {
      const codesText = newBackupCodes.map((code, i) => `${i + 1}. ${code}`).join("\n");
      navigator.clipboard.writeText(codesText);
      toast({ title: "Copied!", description: "Backup codes copied to clipboard." });
    }
  };

  const handleDownloadCodes = () => {
    if (newBackupCodes) {
      const codesText = `B-LINE-IT Backup Codes\n\nKeep these codes safe. Each can only be used once.\n\n${newBackupCodes.map((code, i) => `${i + 1}. ${code}`).join("\n")}\n\nGenerated: ${new Date().toLocaleString()}`;
      const blob = new Blob([codesText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blineit-backup-codes.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getDeviceIcon = (deviceName: string) => {
    if (deviceName.toLowerCase().includes("iphone") || deviceName.toLowerCase().includes("android")) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (deviceName.toLowerCase().includes("mac") || deviceName.toLowerCase().includes("windows")) {
      return <Laptop className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const biometricName = biometricType === "face_id" 
    ? "Face ID" 
    : biometricType === "touch_id" 
    ? "Touch ID" 
    : "Fingerprint";

  const BiometricIcon = biometricType === "face_id" ? ScanFace : Fingerprint;

  if (loading || loadingBiometric) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showSetup) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-lg mx-auto p-4 pt-8">
          <TwoFactorSetup 
            onComplete={handleSetupComplete} 
            onCancel={() => setShowSetup(false)} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-lg mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security Settings
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Biometric Authentication Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BiometricIcon className="h-5 w-5" />
                Biometric Authentication
              </CardTitle>
              <CardDescription>
                Use {biometricName} for faster, more secure access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {biometricSettings?.biometric_enabled ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Check className="h-5 w-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium text-green-600 dark:text-green-400">{biometricName} Enabled</p>
                      <p className="text-sm text-muted-foreground">{biometricSettings.device_name}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">App Login</span>
                      <Switch 
                        checked={biometricSettings.require_biometric_for_login}
                        onCheckedChange={(checked) => updateBiometricSettings({ require_biometric_for_login: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Transaction Approval</span>
                      <Switch 
                        checked={biometricSettings.require_biometric_for_transactions}
                        onCheckedChange={(checked) => updateBiometricSettings({ require_biometric_for_transactions: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Transfers & Withdrawals</span>
                      <Switch 
                        checked={biometricSettings.require_biometric_for_transfers}
                        onCheckedChange={(checked) => updateBiometricSettings({ require_biometric_for_transfers: checked })}
                      />
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={() => disableBiometric()}>
                    Disable {biometricName}
                  </Button>
                </>
              ) : (
                <div className="text-center py-4">
                  <BiometricIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">
                    {biometricAvailable 
                      ? `Enable ${biometricName} for faster, more secure access`
                      : "Biometric authentication not available on this device"}
                  </p>
                  <Link to="/settings/security/biometric">
                    <Button disabled={!biometricAvailable}>
                      Set Up {biometricName}
                    </Button>
                  </Link>
                </div>
              )}

              {/* PIN Status */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Security PIN</span>
                  </div>
                  {biometricSettings?.pin_enabled ? (
                    <Badge variant="secondary" className="text-xs">Enabled</Badge>
                  ) : (
                    <Link to="/settings/security/pin">
                      <Button variant="outline" size="sm">Set Up</Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-2 pt-2">
                <Link to="/settings/security/devices" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span className="text-sm">Trusted Devices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{allDeviceSettings.length}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                <Link to="/settings/security/activity" className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4" />
                    <span className="text-sm">Security Activity</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </div>
            </CardContent>
          </Card>
          {/* 2FA Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings?.enabled ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <Check className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-600 dark:text-green-400">2FA is ON</p>
                      <p className="text-sm text-muted-foreground">
                        Method: {settings.method === "authenticator" ? "Authenticator App" : "SMS"}
                      </p>
                      {settings.enabledAt && (
                        <p className="text-xs text-muted-foreground">
                          Enabled: {format(settings.enabledAt, "MMMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>

                  <Card className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Backup codes remaining</span>
                        <span className="text-sm">{settings.backupCodesRemaining} of 10</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setShowBackupCodes(true)}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          View Codes
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setShowRegenerateCodes(true)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Generate New
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowSetup(true)}
                    >
                      Change Method
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => setShowDisable(true)}
                    >
                      Disable 2FA
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">
                    2FA is OFF. Add an extra layer of security to protect your investments.
                  </p>
                  <Button onClick={() => setShowSetup(true)}>
                    Enable 2FA
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trusted Devices Section */}
          {settings?.enabled && trustedDevices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trusted Devices</CardTitle>
                <CardDescription>
                  Devices that don't require 2FA verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {trustedDevices.map((device) => (
                  <div 
                    key={device.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.deviceName)}
                      <div>
                        <p className="font-medium text-sm">{device.deviceName}</p>
                        <p className="text-xs text-muted-foreground">
                          Trusted until: {format(device.trustedUntil, "MMM d, yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last used: {format(device.lastUsedAt, "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeTrustedDevice(device.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}

                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={removeAllTrustedDevices}
                >
                  Remove All Trusted Devices
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Password Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Password</CardTitle>
              <CardDescription>
                Change your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable} onOpenChange={setShowDisable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Disable Two-Factor Authentication?
            </DialogTitle>
            <DialogDescription>
              Your account will be less secure without 2FA.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Enter your password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Enter your 2FA code</label>
              <div className="flex justify-center mt-2">
                <InputOTP
                  maxLength={6}
                  value={disableCode}
                  onChange={(value) => setDisableCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowDisable(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={handleDisable2FA}
              disabled={!disablePassword || disableCode.length !== 6 || isDisabling}
            >
              {isDisabling ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disable 2FA"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerate Backup Codes Dialog */}
      <Dialog open={showRegenerateCodes} onOpenChange={setShowRegenerateCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate New Backup Codes</DialogTitle>
            <DialogDescription>
              This will invalidate your existing backup codes.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium">Enter your 2FA code to confirm</label>
            <div className="flex justify-center mt-2">
              <InputOTP
                maxLength={6}
                value={regenerateCode}
                onChange={(value) => setRegenerateCode(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowRegenerateCodes(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1"
              onClick={handleRegenerateBackupCodes}
              disabled={regenerateCode.length !== 6 || isRegenerating}
            >
              {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Backup Codes Dialog */}
      <Dialog open={!!newBackupCodes} onOpenChange={() => setNewBackupCodes(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Backup Codes</DialogTitle>
            <DialogDescription>
              Your old codes have been invalidated. Save these new codes.
            </DialogDescription>
          </DialogHeader>

          <Card className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {newBackupCodes?.map((code, index) => (
                <div key={code} className="flex items-center gap-2 font-mono text-sm">
                  <span className="text-muted-foreground w-5">{index + 1}.</span>
                  <span>{code}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleDownloadCodes}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" className="flex-1" onClick={handleCopyAllCodes}>
              <Copy className="h-4 w-4 mr-2" />
              Copy All
            </Button>
          </div>

          <Button onClick={() => setNewBackupCodes(null)}>
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
