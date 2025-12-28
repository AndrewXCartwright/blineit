import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Fingerprint, ScanFace, Check, Loader2, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBiometric } from "@/hooks/useBiometric";

type SetupStep = "intro" | "verify" | "enable" | "success";

export default function BiometricSetup() {
  const navigate = useNavigate();
  const { 
    biometricType, 
    biometricAvailable, 
    enableBiometric, 
    isEnabling,
    authenticateBiometric,
  } = useBiometric();

  const [step, setStep] = useState<SetupStep>("intro");
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const biometricName = biometricType === "face_id" 
    ? "Face ID" 
    : biometricType === "touch_id" 
    ? "Touch ID" 
    : "Fingerprint";

  const BiometricIcon = biometricType === "face_id" ? ScanFace : Fingerprint;

  const handleVerifyPassword = async () => {
    if (!password) return;
    setIsVerifying(true);
    // In demo mode, accept any password
    await new Promise(r => setTimeout(r, 1000));
    setIsVerifying(false);
    setStep("enable");
  };

  const handleEnableBiometric = async () => {
    // Simulate native biometric prompt
    const success = await authenticateBiometric();
    if (success) {
      enableBiometric();
      setStep("success");
    }
  };

  const handleDone = () => {
    navigate("/settings/security");
  };

  if (!biometricAvailable) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container max-w-lg mx-auto p-4">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">Biometric Setup</h1>
          </div>

          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Biometrics Not Available</h2>
              <p className="text-muted-foreground mb-6">
                Your device doesn't support biometric authentication, or it hasn't been set up in your device settings.
              </p>
              <Button variant="outline" onClick={() => navigate("/settings/security/pin")}>
                Set Up PIN Instead
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Set Up {biometricName}</h1>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {step === "intro" && (
            <Card>
              <CardHeader className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <BiometricIcon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle>Enable {biometricName}</CardTitle>
                <CardDescription>
                  Use {biometricName} for faster, more secure access to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Log in instantly with your {biometricType === "face_id" ? "face" : "fingerprint"}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Approve transactions securely</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>No password needed on this device</span>
                  </div>
                </div>

                <Button className="w-full" onClick={() => setStep("verify")}>
                  Continue
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/settings/security/pin")}>
                  Set Up PIN Instead
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
                  Skip for Now
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "verify" && (
            <Card>
              <CardHeader>
                <CardTitle>Verify Your Identity</CardTitle>
                <CardDescription>
                  Enter your password to enable {biometricName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerifyPassword()}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleVerifyPassword}
                  disabled={!password || isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Continue"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "enable" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Enable {biometricName}</CardTitle>
                <CardDescription>
                  {biometricType === "face_id" 
                    ? "Position your face in front of the camera" 
                    : "Place your finger on the sensor"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <BiometricIcon className="h-16 w-16 text-primary" />
                  </motion.div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleEnableBiometric}
                  disabled={isEnabling}
                >
                  {isEnabling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enabling...
                    </>
                  ) : (
                    <>
                      <BiometricIcon className="h-5 w-5 mr-2" />
                      Use {biometricName}
                    </>
                  )}
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => navigate("/settings/security/pin")}
                >
                  Use PIN Instead
                </Button>
              </CardContent>
            </Card>
          )}

          {step === "success" && (
            <Card>
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <Check className="h-10 w-10 text-green-500" />
                </motion.div>

                <h2 className="text-2xl font-bold mb-2">{biometricName} Enabled!</h2>
                <p className="text-muted-foreground mb-6">
                  You can now use {biometricName} to:
                </p>

                <div className="space-y-2 text-left mb-6">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <span>Log in to B-LINE-IT</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>Approve investments</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Check className="h-5 w-5 text-primary" />
                    <span>Confirm transfers</span>
                  </div>
                </div>

                <Button className="w-full" onClick={handleDone}>
                  Done
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
