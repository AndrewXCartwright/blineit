import { useState } from "react";
import { X, Clock, TrendingUp } from "lucide-react";
import { Confetti } from "./Confetti";

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: string;
  question: string;
  expiresIn: string;
  bullPrice: number;
  bearPrice: number;
  initialSide?: "bull" | "bear";
}

export function BettingModal({
  isOpen,
  onClose,
  property,
  question,
  expiresIn,
  bullPrice,
  bearPrice,
  initialSide = "bull",
}: BettingModalProps) {
  const [selectedSide, setSelectedSide] = useState<"bull" | "bear">(initialSide);
  const [amount, setAmount] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);

  const price = selectedSide === "bull" ? bullPrice : bearPrice;
  const potentialPayout = amount ? (parseFloat(amount) / (price / 100)).toFixed(2) : "0.00";

  const handlePlaceBet = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setShowConfetti(true);
    setBetPlaced(true);
    
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
      
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-lg glass-card rounded-t-3xl p-6 animate-slide-up">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {betPlaced ? (
            <div className="text-center py-8 animate-bounce-in">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Bet Placed!
              </h2>
              <p className="text-muted-foreground">
                Good luck with your {selectedSide === "bull" ? "BULL" : "BEAR"} position!
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-1">
                  {property}
                </h2>
                <p className="text-muted-foreground">{question}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <span className="text-sm text-accent">Expires in {expiresIn}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setSelectedSide("bull")}
                  className={`relative overflow-hidden rounded-xl p-4 border-2 transition-all ${
                    selectedSide === "bull"
                      ? "border-bull bg-bull/20 glow-bull"
                      : "border-border bg-secondary hover:border-bull/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🐂</span>
                    <span className={`font-display font-bold ${
                      selectedSide === "bull" ? "text-bull" : "text-foreground"
                    }`}>
                      BULL (YES)
                    </span>
                    <span className="text-xl font-bold text-bull">{bullPrice}¢</span>
                  </div>
                </button>

                <button
                  onClick={() => setSelectedSide("bear")}
                  className={`relative overflow-hidden rounded-xl p-4 border-2 transition-all ${
                    selectedSide === "bear"
                      ? "border-bear bg-bear/20 glow-bear"
                      : "border-border bg-secondary hover:border-bear/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🐻</span>
                    <span className={`font-display font-bold ${
                      selectedSide === "bear" ? "text-bear" : "text-foreground"
                    }`}>
                      BEAR (NO)
                    </span>
                    <span className="text-xl font-bold text-bear">{bearPrice}¢</span>
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Amount (USDC)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary">
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

                <button
                  onClick={handlePlaceBet}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className={`w-full py-4 rounded-xl font-display font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedSide === "bull"
                      ? "gradient-bull text-bull-foreground hover:opacity-90 glow-bull"
                      : "gradient-bear text-bear-foreground hover:opacity-90 glow-bear"
                  }`}
                >
                  {selectedSide === "bull" ? "🐂 Place BULL Bet" : "🐻 Place BEAR Bet"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
