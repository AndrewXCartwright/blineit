import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useKYC } from "@/hooks/useKYC";
import { Button } from "@/components/ui/button";

interface VerificationGateProps {
  children: ReactNode;
  requiredLevel?: "verified" | "pending";
  fallbackMessage?: string;
}

export function VerificationGate({ 
  children, 
  requiredLevel = "verified",
  fallbackMessage = "You need to verify your identity to access this feature."
}: VerificationGateProps) {
  const { kycStatus, isVerified, isPending } = useKYC();

  const hasAccess = requiredLevel === "verified" 
    ? isVerified 
    : (isVerified || isPending);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="glass-card rounded-2xl p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warning/20 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-warning" />
      </div>
      <h3 className="font-display text-lg font-bold text-foreground mb-2">
        Verification Required
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {fallbackMessage}
      </p>
      <Link to="/kyc">
        <Button className="gap-2">
          <ShieldCheck className="w-4 h-4" />
          Verify Identity
        </Button>
      </Link>
    </div>
  );
}

// Hook for checking verification in components
export function useVerificationCheck() {
  const { isVerified, isPending, kycStatus } = useKYC();

  const canInvest = isVerified;
  const canTrade = isVerified;
  const canWithdraw = isVerified;
  const canPlaceBets = isVerified || isPending; // Allow pending users to bet

  return {
    isVerified,
    isPending,
    kycStatus,
    canInvest,
    canTrade,
    canWithdraw,
    canPlaceBets,
  };
}
