import { useState, useEffect } from "react";
import { X, Wallet, ArrowDownUp, Loader2 } from "lucide-react";
import { Confetti } from "./Confetti";
import { CountUp } from "./CountUp";
import { useUserData } from "@/hooks/useUserData";
import { useBuyTokens, useSellTokens } from "@/hooks/useUserData";
import { useKYCGate } from "@/hooks/useKYCGate";
import { KYCVerificationModal } from "@/components/kyc/KYCVerificationModal";

interface TokenTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  tokenPrice: number;
  initialMode?: "buy" | "sell";
  userTokens?: number;
  onSuccess?: () => void;
}

export function TokenTradeModal({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  tokenPrice,
  initialMode = "buy",
  userTokens = 0,
  onSuccess,
}: TokenTradeModalProps) {
  const [mode, setMode] = useState<"buy" | "sell">(initialMode);
  const [inputMode, setInputMode] = useState<"tokens" | "usd">("tokens");
  const [tokenAmount, setTokenAmount] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  const { walletBalance, refetch } = useUserData();
  const { buyTokens } = useBuyTokens();
  const { sellTokens } = useSellTokens();
  const { requireKYC, showKYCModal, setShowKYCModal, onKYCVerified } = useKYCGate();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setTokenAmount("");
      setUsdAmount("");
      setSuccess(false);
      setProcessing(false);
    }
  }, [isOpen, initialMode]);

  // Calculate values
  const tokens = inputMode === "tokens" 
    ? parseFloat(tokenAmount) || 0 
    : (parseFloat(usdAmount) || 0) / tokenPrice;
  
  const subtotal = tokens * tokenPrice;
  const fee = subtotal * 0.01;
  const total = mode === "buy" ? subtotal + fee : subtotal - fee;
  const proceeds = mode === "sell" ? subtotal - fee : 0;

  const insufficientBalance = mode === "buy" && total > walletBalance;
  const insufficientTokens = mode === "sell" && tokens > userTokens;
  const isDisabled = tokens <= 0 || insufficientBalance || insufficientTokens || processing;

  const handleTokenAmountChange = (value: string) => {
    setTokenAmount(value);
    const numTokens = parseFloat(value) || 0;
    setUsdAmount((numTokens * tokenPrice).toFixed(2));
  };

  const handleUsdAmountChange = (value: string) => {
    setUsdAmount(value);
    const numUsd = parseFloat(value) || 0;
    setTokenAmount((numUsd / tokenPrice).toFixed(2));
  };

  const handleQuickAmount = (amount: number) => {
    if (mode === "buy") {
      handleTokenAmountChange(amount.toString());
    } else {
      // For sell mode, quick amounts are percentages
      const tokenCount = Math.floor(userTokens * (amount / 100));
      handleTokenAmountChange(tokenCount.toString());
    }
  };

  const processPurchase = async () => {
    setProcessing(true);
    try {
      if (mode === "buy") {
        const result = await buyTokens(propertyId, total, tokenPrice);
        if (result.success) {
          setShowConfetti(true);
          setSuccess(true);
          setSuccessMessage(`🎉 You now own ${tokens.toFixed(0)} tokens of ${propertyName}!`);
          await refetch();
          onSuccess?.();
        }
      } else {
        const result = await sellTokens(propertyId, tokens, tokenPrice);
        if (result.success) {
          setSuccess(true);
          setSuccessMessage(`✅ Sold ${tokens.toFixed(0)} tokens for $${proceeds.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
          await refetch();
          onSuccess?.();
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (isDisabled) return;
    
    if (mode === "buy") {
      // Require KYC for purchases
      requireKYC(() => {
        processPurchase();
      });
    } else {
      // Selling doesn't require KYC check (they already own tokens)
      processPurchase();
    }
  };

  const handleClose = () => {
    if (success) {
      setTimeout(() => {
        setSuccess(false);
        setTokenAmount("");
        setUsdAmount("");
      }, 300);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <KYCVerificationModal
        isOpen={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onVerified={() => {
          onKYCVerified();
          processPurchase();
        }}
      />
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        <div className="relative w-full max-w-lg glass-card rounded-t-3xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">{propertyName}</h2>
              <p className="text-muted-foreground text-sm">
                Current price: <span className="text-foreground font-semibold">${tokenPrice.toFixed(2)}</span>
              </p>
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
              <div className="text-5xl mb-4">{mode === "buy" ? "🎉" : "✅"}</div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {mode === "buy" ? "Purchase Complete!" : "Sale Complete!"}
              </h3>
              <p className="text-muted-foreground">{successMessage}</p>
              <button
                onClick={handleClose}
                className="mt-6 px-8 py-3 rounded-xl gradient-primary text-primary-foreground font-display font-bold transition-all hover:opacity-90"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setMode("buy")}
                  className={`flex-1 py-3 rounded-xl font-display font-bold transition-all ${
                    mode === "buy"
                      ? "gradient-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground border-2 border-border"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setMode("sell")}
                  className={`flex-1 py-3 rounded-xl font-display font-bold transition-all ${
                    mode === "sell"
                      ? "gradient-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground border-2 border-border"
                  }`}
                >
                  Sell
                </button>
              </div>

              {/* Sell Mode: Show owned tokens */}
              {mode === "sell" && (
                <div className="p-4 rounded-xl bg-secondary/50 mb-4 flex items-center justify-between">
                  <span className="text-muted-foreground">Tokens owned</span>
                  <span className="font-display font-bold text-foreground">{userTokens.toLocaleString()}</span>
                </div>
              )}

              {/* Input Mode Toggle */}
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm text-muted-foreground">
                  {inputMode === "tokens" ? "Number of tokens" : "USD amount"}
                </label>
                <button
                  onClick={() => setInputMode(inputMode === "tokens" ? "usd" : "tokens")}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  <ArrowDownUp className="w-3 h-3" />
                  Switch to {inputMode === "tokens" ? "USD" : "tokens"}
                </button>
              </div>

              {/* Amount Input */}
              <div className="mb-4">
                <div className="relative">
                  {inputMode === "usd" && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">$</span>
                  )}
                  <input
                    type="number"
                    value={inputMode === "tokens" ? tokenAmount : usdAmount}
                    onChange={(e) => inputMode === "tokens" 
                      ? handleTokenAmountChange(e.target.value)
                      : handleUsdAmountChange(e.target.value)
                    }
                    placeholder="0"
                    className={`w-full bg-secondary border border-border rounded-xl py-4 text-2xl font-display font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      inputMode === "usd" ? "pl-8 pr-4" : "px-4"
                    }`}
                  />
                </div>
                {inputMode === "tokens" && tokens > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    ≈ ${(tokens * tokenPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
                {inputMode === "usd" && tokens > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    ≈ {tokens.toFixed(2)} tokens
                  </p>
                )}
              </div>

              {/* Quick Buttons */}
              <div className="flex gap-2 mb-6">
                {mode === "buy" ? (
                  <>
                    <QuickButton onClick={() => handleQuickAmount(10)} label="10" />
                    <QuickButton onClick={() => handleQuickAmount(50)} label="50" />
                    <QuickButton onClick={() => handleQuickAmount(100)} label="100" />
                    <QuickButton onClick={() => handleQuickAmount(500)} label="500" />
                  </>
                ) : (
                  <>
                    <QuickButton onClick={() => handleQuickAmount(25)} label="25%" />
                    <QuickButton onClick={() => handleQuickAmount(50)} label="50%" />
                    <QuickButton onClick={() => handleQuickAmount(75)} label="75%" />
                    <QuickButton onClick={() => handleQuickAmount(100)} label="All" />
                  </>
                )}
              </div>

              {/* Order Summary */}
              <div className="glass-card rounded-xl p-4 space-y-3 mb-6">
                <h4 className="font-display font-semibold text-foreground">Order Summary</h4>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tokens</span>
                  <span className="text-foreground">{tokens.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per token</span>
                  <span className="text-foreground">${tokenPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">
                    ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform fee (1%)</span>
                  <span className={mode === "sell" ? "text-destructive" : "text-foreground"}>
                    {mode === "sell" ? "-" : ""}${fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-display font-semibold text-foreground">
                    {mode === "buy" ? "Total cost" : "You receive"}
                  </span>
                  <span className="font-display font-bold text-lg text-foreground">
                    ${(mode === "buy" ? total : proceeds).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="w-4 h-4" />
                    Your balance
                  </span>
                  <span className={`font-semibold ${insufficientBalance ? "text-destructive" : "text-foreground"}`}>
                    ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Error Messages */}
              {insufficientBalance && (
                <p className="text-destructive text-sm mb-4 text-center">
                  Insufficient balance. You need ${(total - walletBalance).toFixed(2)} more.
                </p>
              )}
              {insufficientTokens && (
                <p className="text-destructive text-sm mb-4 text-center">
                  You only own {userTokens} tokens.
                </p>
              )}

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={isDisabled}
                className="w-full py-4 rounded-xl gradient-primary text-primary-foreground font-display font-bold text-lg transition-all hover:opacity-90 glow-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  mode === "buy" ? "Confirm Purchase" : "Confirm Sale"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function QuickButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-2 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground transition-colors text-sm font-medium"
    >
      {label}
    </button>
  );
}
