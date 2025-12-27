import { useState, useEffect } from "react";
import { X, TrendingUp, Check, Clock, Info, ChevronRight } from "lucide-react";
import { Sparkline } from "./Sparkline";
import confetti from "canvas-confetti";

interface PriceHistoryPoint {
  time: string;
  yesPrice: number;
}

interface BettingModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  property: string;
  question: string;
  expiresAt: Date;
  bullPrice: number;
  bearPrice: number;
  priceHistory: PriceHistoryPoint[];
  resolutionCriteria?: string;
  initialSide?: "bull" | "bear" | null;
  userBalance?: number;
  onPlaceBet?: (side: "bull" | "bear", amount: number, shares: number) => void;
}

type TimeRange = "1H" | "24H" | "7D" | "ALL";

export function BettingModalEnhanced({
  isOpen,
  onClose,
  property,
  question,
  expiresAt,
  bullPrice,
  bearPrice,
  priceHistory,
  resolutionCriteria = "Resolved based on official market data at expiration time",
  initialSide = null,
  userBalance = 2500,
  onPlaceBet,
}: BettingModalEnhancedProps) {
  const [selectedSide, setSelectedSide] = useState<"bull" | "bear" | null>(initialSide);
  const [amount, setAmount] = useState("");
  const [betPlaced, setBetPlaced] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("24H");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedSide(initialSide);
      setAmount("");
      setBetPlaced(false);
      setShowSuccess(false);
    }
  }, [isOpen, initialSide]);

  // Calculate countdown
  const getCountdown = () => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  // Filter price history based on time range
  const getFilteredHistory = () => {
    const now = new Date();
    const prices = priceHistory.map(p => p.yesPrice);
    
    switch (timeRange) {
      case "1H":
        return prices.slice(-6); // Last 6 points for 1 hour
      case "24H":
        return prices.slice(-24); // Last 24 points
      case "7D":
        return prices.slice(-7 * 24); // Last 7 days worth
      case "ALL":
      default:
        return prices;
    }
  };

  const price = selectedSide === "bull" ? bullPrice : selectedSide === "bear" ? bearPrice : 0;
  const amountNum = parseFloat(amount) || 0;
  const shares = price > 0 ? amountNum / (price / 100) : 0;
  const platformFee = amountNum * 0.02; // 2% fee
  const potentialPayout = shares; // Each share pays $1 if correct
  const netProfit = potentialPayout - amountNum - platformFee;

  const handleQuickAmount = (percentage: number) => {
    const amt = (userBalance * percentage / 100);
    setAmount(amt.toFixed(2));
  };

  const handleAmountChange = (value: string) => {
    // Only allow valid number input
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const isValidBet = selectedSide !== null && amountNum > 0 && amountNum <= userBalance;

  const handlePlaceBet = () => {
    if (!isValidBet || !selectedSide) return;
    
    // Fire confetti
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: selectedSide === "bull" 
        ? ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0"] 
        : ["#EF4444", "#F87171", "#FCA5A5", "#FECACA"],
    });

    setBetPlaced(true);
    setShowSuccess(true);
    
    onPlaceBet?.(selectedSide, amountNum, shares);
    
    setTimeout(() => {
      setBetPlaced(false);
      setShowSuccess(false);
      setAmount("");
      setSelectedSide(null);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div className="flex-1 pr-4">
          <h1 className="font-display text-lg font-bold text-foreground leading-tight">
            {question}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{property}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {showSuccess ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6 animate-bounce-in">
              <Check className="w-12 h-12 text-success" strokeWidth={3} />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-2">
              🎯 Your {selectedSide === "bull" ? "BULL" : "BEAR"} bet is placed!
            </h2>
            <p className="text-muted-foreground text-lg text-center">
              Good luck!
            </p>
            <div className={`mt-6 px-6 py-3 rounded-xl ${
              selectedSide === "bull" ? "bg-bull/20 text-bull" : "bg-bear/20 text-bear"
            }`}>
              <span className="font-display font-bold text-xl">
                ${amountNum.toFixed(2)} → ${potentialPayout.toFixed(2)} potential
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-5">
            {/* Countdown Timer */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary/50">
              <Clock className="w-5 h-5 text-accent" />
              <span className="font-display font-semibold text-foreground">
                {getCountdown()}
              </span>
            </div>

            {/* Resolution Criteria */}
            <div className="flex items-start gap-2 px-3 py-2">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {resolutionCriteria}
              </p>
            </div>

            {/* Price Chart */}
            <div className="bg-secondary/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Price History</span>
                <div className="flex gap-1">
                  {(["1H", "24H", "7D", "ALL"] as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                        timeRange === range
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-2 text-sm">
                <span className="text-bull font-semibold">YES: {bullPrice}¢</span>
                <span className="text-bear font-semibold">NO: {bearPrice}¢</span>
              </div>
              
              <Sparkline 
                data={getFilteredHistory()} 
                width={320} 
                height={80} 
                showArea={true}
              />
            </div>

            {/* Position Selection */}
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">
                Select Position
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedSide("bull")}
                  className={`relative overflow-hidden rounded-2xl p-4 border-2 transition-all duration-300 ${
                    selectedSide === "bull"
                      ? "border-bull bg-bull/15 glow-bull scale-[1.02]"
                      : "border-muted bg-secondary hover:border-bull/40"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🐂</span>
                    <span className={`font-display font-bold text-base ${
                      selectedSide === "bull" ? "text-bull" : "text-muted-foreground"
                    }`}>
                      BULL (YES)
                    </span>
                    <span className="text-xl font-bold text-bull">{bullPrice}¢</span>
                  </div>
                  {selectedSide === "bull" && (
                    <div className="absolute inset-0 border-2 border-bull rounded-2xl animate-pulse opacity-50" />
                  )}
                </button>

                <button
                  onClick={() => setSelectedSide("bear")}
                  className={`relative overflow-hidden rounded-2xl p-4 border-2 transition-all duration-300 ${
                    selectedSide === "bear"
                      ? "border-bear bg-bear/15 glow-bear scale-[1.02]"
                      : "border-muted bg-secondary hover:border-bear/40"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🐻</span>
                    <span className={`font-display font-bold text-base ${
                      selectedSide === "bear" ? "text-bear" : "text-muted-foreground"
                    }`}>
                      BEAR (NO)
                    </span>
                    <span className="text-xl font-bold text-bear">{bearPrice}¢</span>
                  </div>
                  {selectedSide === "bear" && (
                    <div className="absolute inset-0 border-2 border-bear rounded-2xl animate-pulse opacity-50" />
                  )}
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Amount to bet
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-secondary border-2 border-border rounded-xl pl-10 pr-4 py-4 text-3xl font-bold text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                />
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[25, 50, 75].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => handleQuickAmount(pct)}
                    className="py-2.5 rounded-xl bg-secondary hover:bg-muted text-sm font-semibold text-foreground transition-colors border border-border"
                  >
                    {pct}%
                  </button>
                ))}
                <button
                  onClick={() => handleQuickAmount(100)}
                  className="py-2.5 rounded-xl bg-accent/20 hover:bg-accent/30 text-sm font-semibold text-accent transition-colors border border-accent/30"
                >
                  MAX
                </button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Balance: <span className="text-foreground font-semibold">${userBalance.toLocaleString()}</span> available
              </p>
            </div>

            {/* Order Summary */}
            {selectedSide && amountNum > 0 && (
              <div className="bg-card rounded-2xl p-4 space-y-3 border border-border animate-fade-in">
                <h3 className="font-display font-semibold text-foreground">Order Summary</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shares you'll receive</span>
                    <span className="font-semibold text-foreground">{shares.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per share</span>
                    <span className="font-semibold text-foreground">{price}¢</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Potential payout if you win</span>
                    <span className="font-semibold text-foreground">${potentialPayout.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform fee (2%)</span>
                    <span className="font-semibold text-muted-foreground">-${platformFee.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t border-border pt-3 flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Net profit if correct</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className={`w-5 h-5 ${selectedSide === "bull" ? "text-bull" : "text-bear"}`} />
                    <span className={`font-display font-bold text-2xl ${
                      selectedSide === "bull" ? "text-bull" : "text-bear"
                    }`}>
                      +${netProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {!showSuccess && (
        <div className="p-4 border-t border-border bg-background">
          <button
            onClick={handlePlaceBet}
            disabled={!isValidBet}
            className={`w-full py-4 rounded-2xl font-display font-bold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              selectedSide === "bull"
                ? "gradient-bull text-bull-foreground glow-bull"
                : selectedSide === "bear"
                ? "gradient-bear text-bear-foreground glow-bear"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {!selectedSide ? (
              "Select a position"
            ) : !amountNum ? (
              "Enter an amount"
            ) : (
              <>
                Place {selectedSide === "bull" ? "🐂 BULL" : "🐻 BEAR"} Bet
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
