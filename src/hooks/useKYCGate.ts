import { useState, useCallback } from "react";
import { useKYC } from "./useKYC";
import { useAuth } from "./useAuth";

export function useKYCGate() {
  const { user } = useAuth();
  const { kycStatus, isVerified, loading } = useKYC();
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);

  const requireKYC = useCallback((onApproved: () => void) => {
    console.log('requireKYC called', { user: !!user, isVerified, kycStatus });
    
    if (!user) {
      console.log('requireKYC: No user, returning early');
      return;
    }

    if (isVerified || kycStatus === "verified") {
      console.log('requireKYC: User is verified, proceeding immediately');
      onApproved();
    } else {
      console.log('requireKYC: User NOT verified, showing KYC modal');
      setPendingCallback(() => onApproved);
      setShowKYCModal(true);
      console.log('requireKYC: showKYCModal set to true');
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
