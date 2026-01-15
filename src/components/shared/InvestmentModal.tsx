import { useState } from "react";
import { X, DollarSign, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useKYCGate } from "@/hooks/useKYCGate";
import { KYCVerificationModal } from "@/components/kyc/KYCVerificationModal";
import { useInvestment, type InvestmentType } from "@/hooks/useInvestment";

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
}: InvestmentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { requireKYC, showKYCModal, setShowKYCModal, isVerified } = useKYCGate();
  const { createInvestment, loading: investmentLoading } = useInvestment();

  const numericAmount = parseFloat(amount) || 0;
  const tokens = pricePerToken > 0 ? numericAmount / pricePerToken : numericAmount;
  const remainingToRaise = targetRaise ? targetRaise - currentRaised : null;

  const quickAmounts = [100, 500, 1000, 5000];

  const handleQuickSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleConfirmInvestment = async () => {
    if (numericAmount < minInvestment) {
      return;
    }

    // KYC check
    requireKYC(async () => {
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
    });
  };

  const handleClose = () => {
    if (!isProcessing) {
      setAmount("");
      setIsSuccess(false);
      onClose();
    }
  };

  const isValidAmount = numericAmount >= minInvestment && 
    (!remainingToRaise || numericAmount <= remainingToRaise);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
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
              {numericAmount > 0 && numericAmount < minInvestment && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Minimum investment is {formatCurrency(minInvestment)}
                </div>
              )}
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
                  disabled={!isValidAmount || isProcessing || investmentLoading}
                >
                  {isProcessing || investmentLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
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
    </>
  );
}
