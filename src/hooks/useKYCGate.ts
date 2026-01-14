import { useState, useCallback } from "react";
import { useKYC } from "./useKYC";
import { useAuth } from "./useAuth";

export function useKYCGate() {
  const { user } = useAuth();
  const { kycStatus, isVerified, loading } = useKYC();
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const requireKYC = useCallback((onApproved: () => void) => {
    if (!user) {
      // Not logged in - could redirect to auth
      return;
    }

    if (isVerified || kycStatus === "verified") {
      // User is verified, proceed immediately
      onApproved();
    } else {
      // User not verified, show KYC modal
      setPendingCallback(() => onApproved);
      setShowKYCModal(true);
    }
  }, [user, isVerified, kycStatus]);

  const onKYCVerified = useCallback(() => {
    setShowKYCModal(false);
    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  }, [pendingCallback]);

  return {
    requireKYC,
    showKYCModal,
    setShowKYCModal,
    onKYCVerified,
    kycStatus,
    isVerified,
    loading,
  };
}
