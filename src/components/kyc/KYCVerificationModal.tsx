import { X, Shield, AlertTriangle, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { useKYC } from "@/hooks/useKYC";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface KYCVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export function KYCVerificationModal({ isOpen, onClose, onVerified }: KYCVerificationModalProps) {
  const { kycStatus, isVerified } = useKYC();
  const navigate = useNavigate();

  if (!isOpen) return null;

  // If already verified, call onVerified and close
  if (isVerified || kycStatus === "verified") {
    onVerified?.();
    return null;
  }

  const handleStartVerification = () => {
    onClose();
    navigate("/kyc-verification");
  };

  const getStatusContent = () => {
    switch (kycStatus) {
      case "in_review":
      case "pending":
        return {
          icon: <Clock className="w-16 h-16 text-amber-500" />,
          title: "Verification In Progress",
          description: "Your identity verification is being reviewed. This usually takes 1-2 business days.",
          showButton: false,
        };
      case "rejected":
        return {
          icon: <AlertTriangle className="w-16 h-16 text-destructive" />,
          title: "Verification Failed",
          description: "Your identity verification was not approved. Please try again with valid documents.",
          showButton: true,
          buttonText: "Try Again",
        };
      default:
        return {
          icon: <Shield className="w-16 h-16 text-primary" />,
          title: "Identity Verification Required",
          description: "Before you can purchase tokens, we need to verify your identity. This is a one-time process that helps us comply with securities regulations.",
          showButton: true,
          buttonText: "Start Verification",
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md glass-card rounded-2xl p-6 animate-fade-in mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center pt-4">
          <div className="flex justify-center mb-6">
            {content.icon}
          </div>
          
          <h2 className="font-display text-xl font-bold text-foreground mb-3">
            {content.title}
          </h2>
          
          <p className="text-muted-foreground mb-6">
            {content.description}
          </p>

          {/* Benefits list */}
          {kycStatus === "not_started" && (
            <div className="text-left bg-secondary/50 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">Takes less than 5 minutes</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">Secure and encrypted</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">Required for all token purchases</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {content.showButton && (
              <Button
                onClick={handleStartVerification}
                className="w-full gradient-primary text-primary-foreground font-display font-bold py-6"
              >
                {content.buttonText}
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              {content.showButton ? "Maybe Later" : "Close"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
