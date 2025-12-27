import { useState } from "react";
import { Target, Trophy, TrendingUp, Percent } from "lucide-react";
import { PredictionCard } from "@/components/PredictionCard";
import { BettingModal } from "@/components/BettingModal";

const predictions = [
  {
    property: "Sunset Towers",
    question: "Will this property sell above $2.5M?",
    expiresIn: "48h",
    bullPrice: 67,
    bearPrice: 33,
    volume: "$12.5K",
    traders: 234,
  },
  {
    property: "Metro Plaza",
    question: "Will occupancy reach 95% by Q2?",
    expiresIn: "5d",
    bullPrice: 45,
    bearPrice: 55,
    volume: "$8.2K",
    traders: 156,
  },
  {
    property: "Harbor View",
    question: "Will rent increase by 10% next year?",
    expiresIn: "12h",
    bullPrice: 72,
    bearPrice: 28,
    volume: "$25.1K",
    traders: 412,
  },
  {
    property: "Tech Park Austin",
    question: "Will the property get LEED certified?",
    expiresIn: "3d",
    bullPrice: 58,
    bearPrice: 42,
    volume: "$5.8K",
    traders: 89,
  },
];

export default function Predict() {
  const [selectedPrediction, setSelectedPrediction] = useState<typeof predictions[0] | null>(null);
  const [selectedSide, setSelectedSide] = useState<"bull" | "bear">("bull");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBullClick = (prediction: typeof predictions[0]) => {
    setSelectedPrediction(prediction);
    setSelectedSide("bull");
    setIsModalOpen(true);
  };

  const handleBearClick = (prediction: typeof predictions[0]) => {
    setSelectedPrediction(prediction);
    setSelectedSide("bear");
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl gradient-gold glow-gold">
            <Target className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              🎯 SquareFoot Predictions
            </h1>
            <p className="text-sm text-muted-foreground">Bet on real estate outcomes</p>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="gradient-gold rounded-xl p-4 glow-gold">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-accent-foreground/70 text-xs mb-1">Active Bets</p>
              <p className="font-display font-bold text-lg text-accent-foreground">$2,450</p>
            </div>
            <div className="border-x border-accent-foreground/20">
              <p className="text-accent-foreground/70 text-xs mb-1">Winnings</p>
              <p className="font-display font-bold text-lg text-accent-foreground flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4" />
                $8,420
              </p>
            </div>
            <div>
              <p className="text-accent-foreground/70 text-xs mb-1">Win Rate</p>
              <p className="font-display font-bold text-lg text-accent-foreground flex items-center justify-center gap-1">
                <Percent className="w-4 h-4" />
                67%
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-foreground">Active Markets</h2>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4 text-success" />
            <span>4 markets</span>
          </div>
        </div>

        {predictions.map((prediction, index) => (
          <PredictionCard
            key={index}
            {...prediction}
            onBullClick={() => handleBullClick(prediction)}
            onBearClick={() => handleBearClick(prediction)}
          />
        ))}
      </main>

      {selectedPrediction && (
        <BettingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          property={selectedPrediction.property}
          question={selectedPrediction.question}
          expiresIn={selectedPrediction.expiresIn}
          bullPrice={selectedPrediction.bullPrice}
          bearPrice={selectedPrediction.bearPrice}
          initialSide={selectedSide}
        />
      )}
    </div>
  );
}
