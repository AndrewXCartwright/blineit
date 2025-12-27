import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Key, ArrowLeft, Loader2, Lock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useTwoFactor } from "@/hooks/useTwoFactor";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorVerifyProps {
  userId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type VerifyMode = "authenticator" | "backup";

export function TwoFactorVerify({ userId, onSuccess, onCancel }: TwoFactorVerifyProps) {
  const { toast } = useToast();
  const { verifyLoginCode, verifyBackupCode, checkRateLimit } = useTwoFactor();
  const [mode, setMode] = useState<VerifyMode>("authenticator");
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<Date | null>(null);

  const handleVerifyAuthenticator = async () => {
    if (code.length !== 6) return;

    // Check rate limit
    const rateLimit = await checkRateLimit(userId);
    if (!rateLimit.allowed) {
      setIsLocked(true);
      toast({
        title: "Account Locked",
        description: "Too many failed attempts. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    const success = await verifyLoginCode(userId, code, trustDevice);
    setIsVerifying(false);

    if (success) {
      onSuccess();
    } else {
      toast({
        title: "Invalid Code",
        description: `Incorrect code. ${rateLimit.attemptsRemaining ? rateLimit.attemptsRemaining - 1 : 0} attempts remaining.`,
        variant: "destructive",
      });
      setCode("");
    }
  };

  const handleVerifyBackup = async () => {
    if (!backupCode.trim()) return;

    setIsVerifying(true);
    const success = await verifyBackupCode(userId, backupCode);
    setIsVerifying(false);

    if (success) {
      toast({
        title: "Backup Code Used",
        description: "This code has been invalidated. Consider generating new codes.",
      });
      onSuccess();
    } else {
      toast({
        title: "Invalid Backup Code",
        description: "The backup code you entered is incorrect.",
        variant: "destructive",
      });
      setBackupCode("");
    }
  };

  if (isLocked) {
    return (
      <div className="text-center space-y-6 py-8">
        <Lock className="h-16 w-16 mx-auto text-destructive" />
        <div>
          <h2 className="text-xl font-semibold">Account Temporarily Locked</h2>
          <p className="text-muted-foreground mt-2">
            Too many failed attempts.<br />
            Please try again in 30 minutes.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          If this wasn't you, please{" "}
          <a href="mailto:support@blineit.com" className="text-primary hover:underline">
            contact support
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {mode === "authenticator" ? (
        <>
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-primary mb-3" />
            <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
            <p className="text-muted-foreground mt-1">
              Enter the 6-digit code from your authenticator
            </p>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
              autoFocus
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

          <div className="flex items-center justify-center space-x-2">
            <Checkbox 
              id="trust-device" 
              checked={trustDevice}
              onCheckedChange={(checked) => setTrustDevice(checked === true)}
            />
            <label 
              htmlFor="trust-device" 
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Trust this device for 30 days
            </label>
          </div>

          <Button 
            className="w-full" 
            onClick={handleVerifyAuthenticator}
            disabled={code.length !== 6 || isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setMode("backup")}
          >
            <Key className="h-4 w-4 mr-2" />
            Use backup code instead
          </Button>

          <Button 
            variant="ghost" 
            className="w-full"
            onClick={onCancel}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login
          </Button>
        </>
      ) : (
        <>
          <div className="text-center">
            <Key className="h-12 w-12 mx-auto text-primary mb-3" />
            <h2 className="text-xl font-semibold">Use Backup Code</h2>
            <p className="text-muted-foreground mt-1">
              Enter one of your backup codes
            </p>
          </div>

          <Input
            placeholder="XXXX-XXXX"
            value={backupCode}
            onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
            className="text-center font-mono text-lg tracking-wider"
            autoFocus
          />

          <p className="text-center text-sm text-muted-foreground">
            ⚠️ Each backup code can only be used once.
          </p>

          <Button 
            className="w-full" 
            onClick={handleVerifyBackup}
            disabled={!backupCode.trim() || isVerifying}
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify"
            )}
          </Button>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setMode("authenticator");
              setBackupCode("");
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to authenticator code
          </Button>
        </>
      )}
    </div>
  );
}
