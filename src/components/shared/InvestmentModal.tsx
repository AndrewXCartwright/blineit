import { useState, useMemo } from "react";
import { X, DollarSign, Loader2, CheckCircle, AlertCircle, XCircle, Shield, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useKYCGate } from "@/hooks/useKYCGate";
import { KYCVerificationModal } from "@/components/kyc/KYCVerificationModal";
import { AccreditationModal } from "@/components/accreditation/AccreditationModal";
import { useInvestment, type InvestmentType } from "@/hooks/useInvestment";
import { useInvestorEligibility, type OfferingRequirements } from "@/hooks/useInvestorEligibility";
import { useNavigate } from "react-router-dom";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  investmentType: InvestmentType;
  investmentId: string;
  title: string;
  pricePerToken?: number;
  minInvestment: number;
  targetRaise?: number;
  currentRaised?: number;
  requiresAccreditation?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function InvestmentModal({
  isOpen,
  onClose,
  investmentType,
  investmentId,
  title,
  pricePerToken = 1,
  minInvestment,
  targetRaise,
  currentRaised = 0,
  requiresAccreditation = false,
}: InvestmentModalProps) {
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAccreditationModal, setShowAccreditationModal] = useState(false);
  
  const { requireKYC, showKYCModal, setShowKYCModal, isVerified: kycVerified } = useKYCGate();
  const { createInvestment, loading: investmentLoading } = useInvestment();
  const { checkEligibility, isKYCVerified, accreditationStatus } = useInvestorEligibility();

  const numericAmount = parseFloat(amount) || 0;
  const tokens = pricePerToken > 0 ? numericAmount / pricePerToken : numericAmount;
  const remainingToRaise = targetRaise ? targetRaise - currentRaised : null;

  const quickAmounts = [100, 500, 1000, 5000];

  // Build offering requirements
  const offeringRequirements: OfferingRequirements = useMemo(() => ({
    requires_kyc: true, // All investments require KYC
    requires_accreditation: requiresAccreditation,
    min_investment: minInvestment,
  }), [requiresAccreditation, minInvestment]);

  // Check eligibility
  const eligibility = useMemo(() => 
    checkEligibility(offeringRequirements, numericAmount),
    [checkEligibility, offeringRequirements, numericAmount]
  );

  const handleQuickSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleConfirmInvestment = async () => {
    if (numericAmount < minInvestment) {
      return;
    }

    // Check eligibility before proceeding
    if (eligibility.nextStep === 'kyc') {
      requireKYC(async () => {
        await processInvestment();
      });
      return;
    }

    if (eligibility.nextStep === 'accreditation') {
      // User needs accreditation - show modal
      setShowAccreditationModal(true);
      return;
    }

    // All checks passed, process investment
    await processInvestment();
  };

  const processInvestment = async () => {
    setIsProcessing(true);
    
    const investment = await createInvestment({
      investment_type: investmentType,
      investment_id: investmentId,
      amount: numericAmount,
      tokens: tokens,
    });

    setIsProcessing(false);

    if (investment) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setAmount("");
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmount("");
      setIsSuccess(false);
      onClose();
    }
  };

  const handleGoToAccreditation = () => {
    onClose();
    navigate('/accreditation');
  };

  const isValidAmount = numericAmount >= minInvestment && 
    (!remainingToRaise || numericAmount <= remainingToRaise);

  // Determine if user can proceed (eligible or just needs to trigger KYC flow)
  const canProceed = isValidAmount && (eligibility.eligible || eligibility.nextStep === 'kyc');

  // Hide InvestmentModal while KYC or Accreditation modals are active to avoid z-index issues
  const isSubModalOpen = showKYCModal || showAccreditationModal;

  return (
    <>
      <Dialog open={isOpen && !isSubModalOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto pb-24">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Invest in {title}
            </DialogTitle>
          </DialogHeader>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Investment Successful!</h3>
              <p className="text-muted-foreground text-center">
                You've invested {formatCurrency(numericAmount)} in {title}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Investment Type Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Investment Type:</span>
                <span className="text-sm font-medium capitalize">{investmentType.replace('_', ' ')}</span>
              </div>

              {/* Eligibility Status */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Investor Requirements
                </h4>
                <div className="space-y-2">
                  {/* KYC Status */}
                  <div className="flex items-center gap-2 text-sm">
                    {eligibility.checks.kyc ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-success">Identity Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="text-destructive">Identity Verification Required</span>
                      </>
                    )}
                  </div>

                  {/* Accreditation Status (only show if required) */}
                  {requiresAccreditation && (
                    <div className="flex items-center gap-2 text-sm">
                      {eligibility.checks.accreditation ? (
                        <>
                          <BadgeCheck className="w-4 h-4 text-success" />
                          <span className="text-success">Accreditation Verified</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-destructive" />
                          <span className="text-destructive">Accreditation Required</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Min Investment Status */}
                  {numericAmount > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      {eligibility.checks.minInvestment ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-success">Meets Minimum Investment</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-destructive" />
                          <span className="text-destructive">Below Minimum ({formatCurrency(minInvestment)})</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Accreditation CTA if needed */}
              {requiresAccreditation && !eligibility.checks.accreditation && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Accreditation Required</p>
                      <p className="text-sm text-muted-foreground">
                        This investment requires accredited investor status. Please complete your accreditation verification to proceed.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleGoToAccreditation}
                      >
                        Verify Accreditation
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Investment Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-8 text-lg"
                    min={minInvestment}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum: {formatCurrency(minInvestment)}
                </p>
              </div>

              {/* Quick Select */}
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((value) => (
                  <Button
                    key={value}
                    variant={numericAmount === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQuickSelect(value)}
                  >
                    ${value.toLocaleString()}
                  </Button>
                ))}
              </div>

              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-medium">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Amount</span>
                    <span className="font-medium">{formatCurrency(numericAmount)}</span>
                  </div>
                  {pricePerToken > 0 && pricePerToken !== 1 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per Token</span>
                      <span>{formatCurrency(pricePerToken)}</span>
                    </div>
                  )}
                  {pricePerToken > 0 && pricePerToken !== 1 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tokens</span>
                      <span>{tokens.toFixed(4)}</span>
                    </div>
                  )}
                  {targetRaise && (
                    <>
                      <div className="border-t border-border pt-2 flex justify-between">
                        <span className="text-muted-foreground">Target Raise</span>
                        <span>{formatCurrency(targetRaise)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Remaining</span>
                        <span>{formatCurrency(remainingToRaise || 0)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Validation Messages */}
              {remainingToRaise && numericAmount > remainingToRaise && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Amount exceeds remaining allocation ({formatCurrency(remainingToRaise)})
                </div>
              )}

              {/* Confirm Button */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border sm:relative sm:p-0 sm:border-0 sm:bg-transparent">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleConfirmInvestment}
                  disabled={!canProceed || isProcessing || investmentLoading}
                >
                  {isProcessing || investmentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : eligibility.nextStep === 'kyc' ? (
                    'Verify Identity & Invest'
                  ) : eligibility.nextStep === 'accreditation' ? (
                    'Accreditation Required'
                  ) : (
                    `Confirm Investment • ${formatCurrency(numericAmount)}`
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* KYC Modal */}
      <KYCVerificationModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onVerified={() => {
          setShowKYCModal(false);
        }}
      />

      {/* Accreditation Modal */}
      <AccreditationModal
        isOpen={showAccreditationModal}
        onClose={() => setShowAccreditationModal(false)}
        onVerified={() => {
          setShowAccreditationModal(false);
          // Re-check eligibility and proceed if now eligible
          const newEligibility = checkEligibility(offeringRequirements, numericAmount);
          if (newEligibility.eligible) {
            processInvestment();
          }
        }}
      />
    </>
  );
}
