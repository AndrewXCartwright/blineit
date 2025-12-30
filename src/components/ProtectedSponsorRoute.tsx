import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsor } from "@/hooks/useSponsor";

interface ProtectedSponsorRouteProps {
  children: ReactNode;
  requireVerified?: boolean;
}

export function ProtectedSponsorRoute({ 
  children, 
  requireVerified = true 
}: ProtectedSponsorRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { isSponsor, isVerified, isPending, loading: sponsorLoading } = useSponsor();

  if (authLoading || sponsorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/sponsor/login" replace />;
  }

  if (!isSponsor) {
    return <Navigate to="/sponsor/login" replace />;
  }

  if (requireVerified && isPending) {
    return <Navigate to="/sponsor/pending" replace />;
  }

  return <>{children}</>;
}
