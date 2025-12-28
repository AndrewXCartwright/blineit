import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Delete, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBiometric } from "@/hooks/useBiometric";
import { cn } from "@/lib/utils";

type SetupStep = "create" | "confirm" | "success";

export default function PinSetup() {
  const navigate = useNavigate();
  const { setupPin, isSettingUpPin } = useBiometric();

  const [step, setStep] = useState<SetupStep>("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const currentPin = step === "create" ? pin : confirmPin;
  const setCurrentPin = step === "create" ? setPin : setConfirmPin;

  const handleKeyPress = (digit: string) => {
    if (currentPin.length < 6) {
      setCurrentPin(currentPin + digit);
      setError("");
    }
  };

  const handleBackspace = () => {
    setCurrentPin(currentPin.slice(0, -1));
    setError("");
  };

  const handleContinue = () => {
    if (step === "create" && pin.length === 6) {
      setStep("confirm");
    } else if (step === "confirm" && confirmPin.length === 6) {
      if (pin === confirmPin) {
        setupPin(pin, {
          onSuccess: () => setStep("success"),
        });
      } else {
        setError("PINs don't match. Try again.");
        setConfirmPin("");
      }
    }
  };

  const handleDone = () => {
    navigate("/settings/security");
  };

  const renderPinDots = () => {
    return (
      <div className="flex justify-center gap-3 my-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            animate={
              i < currentPin.length 
                ? { scale: [1, 1.2, 1], backgroundColor: "hsl(var(--primary))" }
                : {}
            }
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-colors",
              i < currentPin.length 
                ? "bg-primary border-primary" 
                : "border-muted-foreground"
            )}
          />
        ))}
      </div>
    );
  };

  const renderKeypad = () => {
    const keys = [
      ["1", "2", "3"],
      ["4", "5", "6"],
      ["7", "8", "9"],
      ["", "0", "backspace"],
    ];

    return (
      <div className="grid gap-3 max-w-xs mx-auto">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 gap-3">
            {row.map((key, keyIndex) => {
              if (key === "") {
                return <div key={keyIndex} />;
              }
              if (key === "backspace") {
                return (
                  <Button
                    key={keyIndex}
                    variant="ghost"
                    size="lg"
                    className="h-16 text-xl"
                    onClick={handleBackspace}
                    disabled={currentPin.length === 0}
                  >
                    <Delete className="h-6 w-6" />
                  </Button>
                );
              }
              return (
                <Button
                  key={keyIndex}
                  variant="outline"
                  size="lg"
                  className="h-16 text-2xl font-semibold"
                  onClick={() => handleKeyPress(key)}
                  disabled={currentPin.length >= 6}
                >
                  {key}
                </Button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Set Up Security PIN</h1>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {(step === "create" || step === "confirm") && (
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>
                  {step === "create" ? "Create Your PIN" : "Confirm Your PIN"}
                </CardTitle>
                <CardDescription>
                  {step === "create" 
                    ? "Create a 6-digit PIN for when biometrics aren't available"
                    : "Enter your PIN again to confirm"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderPinDots()}

                {error && (
                  <p className="text-center text-destructive text-sm mb-4">{error}</p>
                )}

                {renderKeypad()}

                <Button 
                  className="w-full mt-6" 
                  onClick={handleContinue}
                  disabled={currentPin.length !== 6 || isSettingUpPin}
                >
                  {isSettingUpPin ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating PIN...
                    </>
                  ) : (
                    "Continue"
                  )}
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

                <h2 className="text-2xl font-bold mb-2">PIN Created!</h2>
                <p className="text-muted-foreground mb-6">
                  Use this PIN when Face ID or Touch ID isn't available
                </p>

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
