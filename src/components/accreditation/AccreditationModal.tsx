import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { useAccreditation } from '@/hooks/useAccreditation';
import { useNavigate } from 'react-router-dom';

interface AccreditationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export function AccreditationModal({ isOpen, onClose, onVerified }: AccreditationModalProps) {
  const navigate = useNavigate();
  const { accreditation, isVerified, isPending } = useAccreditation();

  const handleVerifyWithAccredd = () => {
    // Open Accredd verification in new tab
    window.open('https://accredd.com', '_blank');
  };

  const handleSelfCertify = () => {
    onClose();
    navigate('/accreditation');
  };

  // If user is already verified, show success state
  if (isVerified) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" />
              Accreditation Verified
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">You're Verified!</h3>
              <p className="text-muted-foreground text-center text-sm">
                Your accredited investor status has been verified. You can invest in accredited-only offerings.
              </p>
            </div>

            <Button className="w-full" onClick={() => {
              onClose();
              if (onVerified) onVerified();
            }}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If verification is pending
  if (isPending) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Verification In Progress
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Under Review</h3>
              <p className="text-muted-foreground text-center text-sm">
                Your accreditation is being reviewed. This typically takes 24-48 hours.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground text-center">
                You'll receive an email notification once your accreditation is verified.
              </p>
            </div>

            <Button variant="outline" className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default: User needs to verify
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Accredited Investor Verification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Alert */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm">
                This investment is only available to accredited investors under SEC Regulation D 506(c).
              </p>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <p className="text-sm font-medium">You qualify as accredited if you have:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Annual income over $200K ($300K joint) for past 2 years</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Net worth over $1M (excluding primary residence)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Series 7, 65, or 82 license holder</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                <span>Director, executive, or GP of the issuer</span>
              </li>
            </ul>
          </div>

          {/* Verification Options */}
          <div className="space-y-3">
            <Button className="w-full" onClick={handleVerifyWithAccredd}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Verify with Accredd
            </Button>
            
            <Button variant="outline" className="w-full" onClick={handleSelfCertify}>
              Self-Certify Status
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Third-party verification typically takes 24 hours. You'll receive an email when approved.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
