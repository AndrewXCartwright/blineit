import { useState, useEffect } from "react";
import { X, TrendingUp, Info } from "lucide-react";
import { Confetti } from "./Confetti";
import { CoinRain } from "./CoinRain";
import { CountdownTimer } from "./CountdownTimer";
import { Sparkline } from "./Sparkline";
import confetti from "canvas-confetti";

interface BettingModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  property: string;
  question: string;
  expiresAt: Date;
  bullPrice: number;
  bearPrice: number;
  priceHistory: number[];
  initialSide?: "bull" | "bear";
  onPlaceBet?: (side: "bull" | "bear", amount: number, shares: number) => void;
}

export function BettingModalEnhanced({
  isOpen,
  onClose,
  property,
  question,
  expiresAt,
  bullPrice,
  bearPrice,
  priceHistory,
  initialSide = "bull",
  onPlaceBet,
}: BettingModalEnhancedProps) {
  const [selectedSide, setSelectedSide] = useState<"bull" | "bear">(initialSide);
  const [amount, setAmount] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);

  useEffect(() => {
    setSelectedSide(initialSide);
  }, [initialSide]);

  const price = selectedSide === "bull" ? bullPrice : bearPrice;
  const shares = amount ? parseFloat(amount) / (price / 100) : 0;
  const potentialPayout = shares.toFixed(2);

  const handleQuickAmount = (percentage: number) => {
    const maxAmount = 1000; // Mock max amount
    setAmount((maxAmount * percentage / 100).toString());
  };

  const handlePlaceBet = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: selectedSide === "bull" 
        ? ["#10B981", "#34D399", "#6EE7B7"] 
        : ["#EF4444", "#F87171", "#FCA5A5"],
    });

    setShowConfetti(true);
    setBetPlaced(true);
    
    onPlaceBet?.(selectedSide, parseFloat(amount), shares);
    
    setTimeout(() => {
      setBetPlaced(false);
      setAmount("");
      onClose();
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div 
          className="absolute inset-0 bg-background/90 backdrop-blur-md"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-card rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {betPlaced ? (
            <div className="text-center py-12 animate-bounce-in">
              <div className="text-7xl mb-4">🎉</div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                Bet Placed!
              </h2>
              <p className="text-muted-foreground text-lg">
                Good luck with your {selectedSide === "bull" ? "🐂 BULL" : "🐻 BEAR"} position!
              </p>
              <div className={`mt-4 text-2xl font-bold ${
                selectedSide === "bull" ? "text-bull" : "text-bear"
              }`}>
                ${amount} → ${potentialPayout} potential
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 pr-10">
                <h2 className="font-display text-xl font-bold text-foreground mb-1">
                  {property}
                </h2>
                <p className="text-muted-foreground">{question}</p>
                <div className="flex items-center gap-3 mt-3">
                  <CountdownTimer expiresAt={expiresAt} />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Info className="w-3 h-3" />
                    <span>Resolution: Market close</span>
                  </div>
                </div>
              </div>

              {/* Price Chart */}
              <div className="bg-secondary/50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">YES/NO Price History</span>
                  <div className="flex gap-3 text-sm">
                    <span className="text-bull">YES: {bullPrice}¢</span>
                    <span className="text-bear">NO: {bearPrice}¢</span>
                  </div>
                </div>
                <Sparkline data={priceHistory} width={320} height={60} />
              </div>

              {/* Side Selection */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setSelectedSide("bull")}
                  className={`relative overflow-hidden rounded-2xl p-5 border-3 transition-all duration-300 ${
                    selectedSide === "bull"
                      ? "border-bull bg-bull/20 glow-bull scale-[1.02]"
                      : "border-border bg-secondary hover:border-bull/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl">🐂</span>
                    <span className={`font-display font-bold text-lg ${
                      selectedSide === "bull" ? "text-bull" : "text-foreground"
                    }`}>
                      BULL (YES)
                    </span>
                    <span className="text-2xl font-bold text-bull">{bullPrice}¢</span>
                  </div>
                  {selectedSide === "bull" && (
                    <div className="absolute inset-0 border-4 border-bull rounded-2xl animate-pulse" />
                  )}
                </button>

                <button
                  onClick={() => setSelectedSide("bear")}
                  className={`relative overflow-hidden rounded-2xl p-5 border-3 transition-all duration-300 ${
                    selectedSide === "bear"
                      ? "border-bear bg-bear/20 glow-bear scale-[1.02]"
                      : "border-border bg-secondary hover:border-bear/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <span className="text-4xl">🐻</span>
                    <span className={`font-display font-bold text-lg ${
                      selectedSide === "bear" ? "text-bear" : "text-foreground"
                    }`}>
                      BEAR (NO)
                    </span>
                    <span className="text-2xl font-bold text-bear">{bearPrice}¢</span>
                  </div>
                  {selectedSide === "bear" && (
                    <div className="absolute inset-0 border-4 border-bear rounded-2xl animate-pulse" />
                  )}
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-secondary border-2 border-border rounded-xl px-4 py-4 text-2xl font-bold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handleQuickAmount(pct)}
                      className="py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm font-medium text-foreground transition-colors"
                    >
                      {pct === 100 ? "MAX" : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-secondary/70 rounded-xl p-4 mb-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Position</span>
                  <span className={`font-semibold ${
                    selectedSide === "bull" ? "text-bull" : "text-bear"
                  }`}>
                    {selectedSide === "bull" ? "🐂 BULL (YES)" : "🐻 BEAR (NO)"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entry Price</span>
                  <span className="font-semibold text-foreground">{price}¢</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shares</span>
                  <span className="font-semibold text-foreground">{shares.toFixed(4)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="text-muted-foreground">Potential Payout</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-4 h-4 ${selectedSide === "bull" ? "text-bull" : "text-bear"}`} />
                    <span className={`font-display font-bold text-xl ${
                      selectedSide === "bull" ? "text-bull" : "text-bear"
                    }`}>
                      ${potentialPayout}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handlePlaceBet}
                disabled={!amount || parseFloat(amount) <= 0}
                className={`w-full py-5 rounded-2xl font-display font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedSide === "bull"
                    ? "gradient-bull text-bull-foreground hover:opacity-90 glow-bull"
                    : "gradient-bear text-bear-foreground hover:opacity-90 glow-bear"
                }`}
              >
                {selectedSide === "bull" ? "🐂 Place BULL Bet" : "🐻 Place BEAR Bet"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
