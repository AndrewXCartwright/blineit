import { useState, useEffect } from "react";
import { X, Wallet, ShieldCheck, Loader2, Calendar, Percent, Clock, Landmark, CheckCircle2 } from "lucide-react";
import { Confetti } from "./Confetti";
import { useUserData } from "@/hooks/useUserData";
import { useInvestInLoan } from "@/hooks/useLoanData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { LoanData } from "./LoanCard";

interface LoanInvestModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: LoanData & {
    termMonths: number;
    minInvestment: number;
    maxInvestment?: number;
    paymentFrequency?: string;
    maturityDate?: string;
  };
  onSuccess?: () => void;
}

export function LoanInvestModal({
  isOpen,
  onClose,
  loan,
  onSuccess,
}: LoanInvestModalProps) {
  const [investAmount, setInvestAmount] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [success, setSuccess] = useState(false);
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);

  const { walletBalance, refetch: refetchUserData } = useUserData();
  const { investInLoan, loading: processing } = useInvestInLoan();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setInvestAmount("");
      setSuccess(false);
      setRiskAcknowledged(false);
    }
  }, [isOpen]);

  const amount = parseFloat(investAmount) || 0;
  const monthlyPayment = (amount * (loan.apy / 100)) / 12;
  const totalInterest = monthlyPayment * loan.termMonths;
  const totalReturn = amount + totalInterest;

  const minInvestment = loan.minInvestment || 1000;
  const maxInvestment = loan.maxInvestment || 100000;

  const isValidAmount = amount >= minInvestment && amount <= maxInvestment;
  const insufficientBalance = amount > walletBalance;
  const isDisabled = !isValidAmount || insufficientBalance || !riskAcknowledged || processing;

  const handleQuickAmount = (value: number) => {
    setInvestAmount(value.toString());
  };

  const handleConfirm = async () => {
    if (isDisabled) return;

    const result = await investInLoan(loan.id, amount);
    
    if (result.success) {
      setShowConfetti(true);
      setSuccess(true);
      await refetchUserData();
      onSuccess?.();
    }
  };

  const handleClose = () => {
    if (success) {
      setTimeout(() => {
        setSuccess(false);
        setInvestAmount("");
        setRiskAcknowledged(false);
      }, 300);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <div className="relative w-full max-w-lg glass-card rounded-t-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-400" />
                Invest in {loan.propertyName}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">{loan.loanType}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Investment Complete!
              </h3>
              <p className="text-muted-foreground mb-2">
                🏦 You've invested ${amount.toLocaleString()} in {loan.propertyName}
              </p>
              <p className="text-sm text-muted-foreground">
                First interest payment expected: ~30 days after funding closes
              </p>
              <Button
                onClick={handleClose}
                className="mt-6 px-8 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-display font-bold"
              >
                View in Portfolio
              </Button>
            </div>
          ) : (
            <>
              {/* Investment Terms Summary */}
              <div className="glass-card rounded-xl p-4 mb-6 border border-blue-500/30">
                <h4 className="text-sm font-semibold text-foreground mb-3">Investment Terms</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Percent className="w-4 h-4 text-blue-400" />
                    <span className="text-muted-foreground">Fixed APY:</span>
                    <span className="font-semibold text-blue-400">{loan.apy}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Term:</span>
                    <span className="font-semibold text-foreground">{loan.termMonths} mo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Payment:</span>
                    <span className="font-semibold text-foreground">{loan.paymentFrequency || "Monthly"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-muted-foreground">Security:</span>
                    <span className="font-semibold text-emerald-400">1st Lien</span>
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mb-2 block">Investment Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                  <input
                    type="number"
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="0"
                    className="w-full bg-secondary border border-border rounded-xl py-4 pl-8 pr-4 text-2xl font-display font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Minimum: ${minInvestment.toLocaleString()} | Maximum: ${maxInvestment.toLocaleString()}
                </p>
              </div>

              {/* Quick Buttons */}
              <div className="flex gap-2 mb-6">
                {[1000, 5000, 10000, 25000].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleQuickAmount(value)}
                    className="flex-1 py-2 rounded-lg bg-secondary text-muted-foreground hover:bg-blue-500/20 hover:text-blue-400 transition-colors text-sm font-medium"
                  >
                    ${value >= 1000 ? `${value / 1000}K` : value}
                  </button>
                ))}
              </div>

              {/* Returns Calculator */}
              <div className="glass-card rounded-xl p-4 space-y-3 mb-6 bg-blue-500/5 border border-blue-500/20">
                <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
                  YOUR PROJECTED RETURNS
                </h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Investment:</span>
                    <span className="text-foreground font-medium">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Monthly Payment:</span>
                    <span className="text-foreground font-medium">${monthlyPayment.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Interest ({loan.termMonths}mo):</span>
                    <span className="text-foreground font-medium">${totalInterest.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Principal Return:</span>
                    <span className="text-foreground font-medium">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold text-foreground">Total Return:</span>
                    <span className="font-bold text-lg text-blue-400">${totalReturn.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Effective APY:</span>
                    <span className="font-semibold text-blue-400">{loan.apy}%</span>
                  </div>
                </div>
              </div>

              {/* Risk Acknowledgment */}
              <div className="flex items-start gap-3 mb-6 p-4 bg-secondary/50 rounded-xl">
                <Checkbox
                  id="risk"
                  checked={riskAcknowledged}
                  onCheckedChange={(checked) => setRiskAcknowledged(checked as boolean)}
                  className="mt-0.5"
                />
                <label htmlFor="risk" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                  I understand this is a debt investment secured by real estate. While secured, all investments carry risk including potential loss of principal.
                </label>
              </div>

              {/* Available Balance */}
              <div className="flex items-center justify-between mb-4 p-3 bg-secondary/50 rounded-xl">
                <span className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Wallet className="w-4 h-4" />
                  Available Balance
                </span>
                <span className={`font-semibold ${insufficientBalance ? "text-destructive" : "text-foreground"}`}>
                  ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Error Messages */}
              {insufficientBalance && (
                <p className="text-destructive text-sm mb-4 text-center">
                  Insufficient balance. You need ${(amount - walletBalance).toFixed(2)} more.
                </p>
              )}
              {amount > 0 && amount < minInvestment && (
                <p className="text-destructive text-sm mb-4 text-center">
                  Minimum investment is ${minInvestment.toLocaleString()}.
                </p>
              )}

              {/* Confirm Button */}
              <Button
                onClick={handleConfirm}
                disabled={isDisabled}
                className="w-full py-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-display font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Investment"
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
