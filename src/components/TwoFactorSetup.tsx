import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Smartphone, MessageSquare, Copy, Download, Check, Shield } from "lucide-react";
import { useTwoFactor } from "@/hooks/useTwoFactor";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorSetupProps {
  onComplete: () => void;
  onCancel: () => void;
}

type SetupStep = "method" | "authenticator-scan" | "authenticator-verify" | "backup-codes" | "sms-phone" | "sms-verify";

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const { toast } = useToast();
  const { initAuthenticatorSetup, completeAuthenticatorSetup, setupSecret, setupUri, pendingBackupCodes } = useTwoFactor();
  const [step, setStep] = useState<SetupStep>("method");
  const [verificationCode, setVerificationCode] = useState("");
  const [savedCodesConfirmed, setSavedCodesConfirmed] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleMethodSelect = (method: "authenticator" | "sms") => {
    if (method === "authenticator") {
      initAuthenticatorSetup();
      setStep("authenticator-scan");
    } else {
      setStep("sms-phone");
    }
  };

  const handleCopySecret = () => {
    if (setupSecret) {
      navigator.clipboard.writeText(setupSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied!", description: "Secret key copied to clipboard." });
    }
  };

  const handleCopyAllCodes = () => {
    if (pendingBackupCodes) {
      const codesText = pendingBackupCodes.map((code, i) => `${i + 1}. ${code}`).join("\n");
      navigator.clipboard.writeText(codesText);
      toast({ title: "Copied!", description: "Backup codes copied to clipboard." });
    }
  };

  const handleDownloadCodes = () => {
    if (pendingBackupCodes) {
      const codesText = `B-LINE-IT Backup Codes\n\nKeep these codes safe. Each can only be used once.\n\n${pendingBackupCodes.map((code, i) => `${i + 1}. ${code}`).join("\n")}\n\nGenerated: ${new Date().toLocaleString()}`;
      const blob = new Blob([codesText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blineit-backup-codes.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) return;
    
    setIsVerifying(true);
    const success = await completeAuthenticatorSetup(verificationCode);
    setIsVerifying(false);
    
    if (success) {
      setStep("backup-codes");
    }
  };

  const handleCompleteSetup = () => {
    if (!savedCodesConfirmed) {
      toast({
        title: "Please confirm",
        description: "You must confirm that you've saved your backup codes.",
        variant: "destructive",
      });
      return;
    }
    onComplete();
  };

  const formatSecretForDisplay = (secret: string | null) => {
    if (!secret) return "";
    return secret.match(/.{1,4}/g)?.join(" ") || secret;
  };

  const getStepNumber = () => {
    if (step === "authenticator-scan") return "1 of 3";
    if (step === "authenticator-verify") return "2 of 3";
    if (step === "backup-codes") return "3 of 3";
    if (step === "sms-phone") return "1 of 2";
    if (step === "sms-verify") return "2 of 2";
    return "";
  };

  return (
    <div className="space-y-6">
      {step !== "method" && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setStep("method")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <span className="text-sm text-muted-foreground">Step {getStepNumber()}</span>
        </div>
      )}

      {step === "method" && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Shield className="h-12 w-12 mx-auto text-primary mb-3" />
            <h2 className="text-xl font-semibold">Set Up Two-Factor Authentication</h2>
            <p className="text-muted-foreground mt-1">Choose your preferred method</p>
          </div>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleMethodSelect("authenticator")}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg">Authenticator App</CardTitle>
                    <span className="text-xs text-primary font-medium">Recommended</span>
                  </div>
                </div>
                <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                Use Google Authenticator, Authy, or any TOTP app to generate secure codes.
              </CardDescription>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Most secure option
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Works offline
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  No SMS fees
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="opacity-50 cursor-not-allowed">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  <CardTitle className="text-lg">SMS Text Message</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-3">
                Receive a code via text message when logging in.
              </CardDescription>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}

      {step === "authenticator-scan" && (
        <div className="space-y-6">
          <div className="text-center">
            <Smartphone className="h-10 w-10 mx-auto text-primary mb-3" />
            <h2 className="text-xl font-semibold">Set Up Authenticator App</h2>
            <p className="text-muted-foreground mt-1">Scan this QR code with your authenticator app</p>
          </div>

          <Card className="p-6">
            <div className="flex justify-center mb-4">
              {setupUri && (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setupUri)}`}
                  alt="QR Code"
                  className="rounded-lg"
                />
              )}
            </div>
            
            <div className="text-center text-sm text-muted-foreground mb-4">
              Can't scan? Enter this code manually:
            </div>
            
            <div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
              <code className="flex-1 text-sm font-mono break-all">
                {formatSecretForDisplay(setupSecret)}
              </code>
              <Button variant="ghost" size="sm" onClick={handleCopySecret}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </Card>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Recommended apps:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Google Authenticator</li>
              <li>Authy</li>
              <li>1Password</li>
              <li>Microsoft Authenticator</li>
            </ul>
          </div>

          <Button className="w-full" onClick={() => setStep("authenticator-verify")}>
            Continue
          </Button>
        </div>
      )}

      {step === "authenticator-verify" && (
        <div className="space-y-6">
          <div className="text-center">
            <Check className="h-10 w-10 mx-auto text-primary mb-3" />
            <h2 className="text-xl font-semibold">Verify Your Code</h2>
            <p className="text-muted-foreground mt-1">Enter the 6-digit code from your authenticator app</p>
          </div>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={verificationCode}
              onChange={(value) => setVerificationCode(value)}
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

          <p className="text-center text-sm text-muted-foreground">
            Code refreshes every 30 seconds
          </p>

          <Button 
            className="w-full" 
            onClick={handleVerifyCode}
            disabled={verificationCode.length !== 6 || isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </div>
      )}

      {step === "backup-codes" && (
        <div className="space-y-6">
          <div className="text-center">
            <Shield className="h-10 w-10 mx-auto text-primary mb-3" />
            <h2 className="text-xl font-semibold">Save Your Backup Codes</h2>
            <p className="text-muted-foreground mt-1">
              If you lose access to your authenticator, use these codes to log in
            </p>
          </div>

          <Card className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {pendingBackupCodes?.map((code, index) => (
                <div key={code} className="flex items-center gap-2 font-mono text-sm">
                  <span className="text-muted-foreground w-5">{index + 1}.</span>
                  <span>{code}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-600 dark:text-yellow-400">
            <strong>⚠️ Important:</strong> Store these in a safe place. You won't see them again after this screen.
          </div>

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

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="saved-codes" 
              checked={savedCodesConfirmed}
              onCheckedChange={(checked) => setSavedCodesConfirmed(checked === true)}
            />
            <label 
              htmlFor="saved-codes" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have saved these backup codes
            </label>
          </div>

          <Button 
            className="w-full" 
            onClick={handleCompleteSetup}
            disabled={!savedCodesConfirmed}
          >
            Complete Setup
          </Button>
        </div>
      )}
    </div>
  );
}
