import { Clock, Users, TrendingUp } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { CountdownTimer } from "./CountdownTimer";
import { useState } from "react";

interface PredictionCardEnhancedProps {
  id: string;
  property: string;
  question: string;
  expiresAt: Date;
  bullPrice: number;
  bearPrice: number;
  volume: string;
  traders: number;
  priceHistory: number[];
  onBullClick: () => void;
  onBearClick: () => void;
}

export function PredictionCardEnhanced({
  property,
  question,
  expiresAt,
  bullPrice,
  bearPrice,
  volume,
  traders,
  priceHistory,
  onBullClick,
  onBearClick,
}: PredictionCardEnhancedProps) {
  const [hoveredSide, setHoveredSide] = useState<"bull" | "bear" | null>(null);

  const isExpiringSoon = expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <div 
      className={`glass-card rounded-2xl p-4 space-y-4 animate-fade-in transition-all duration-300 ${
        isExpiringSoon ? "animate-pulse-slow border-accent/50" : ""
      } hover:border-primary/30`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-foreground">{property}</h3>
          <p className="text-sm text-muted-foreground mt-1">{question}</p>
        </div>
        <CountdownTimer expiresAt={expiresAt} />
      </div>

      {/* Sparkline Chart */}
      <div className="flex items-center justify-between bg-secondary/50 rounded-xl p-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">24h Price History</span>
          <span className="text-sm font-semibold text-foreground">YES: {bullPrice}¢</span>
        </div>
        <Sparkline data={priceHistory} width={100} height={32} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onBullClick}
          onMouseEnter={() => setHoveredSide("bull")}
          onMouseLeave={() => setHoveredSide(null)}
          className={`group relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-300 ${
            hoveredSide === "bull"
              ? "border-bull bg-bull/20 glow-bull scale-[1.02]"
              : "border-bull/30 bg-bull/10 hover:border-bull/50"
          }`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🐂</span>
              <span className={`font-display font-bold transition-colors ${
                hoveredSide === "bull" ? "text-bull" : "text-bull/80"
              }`}>BULL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">YES</span>
              <span className={`font-bold text-lg transition-all ${
                hoveredSide === "bull" ? "text-bull scale-110" : "text-bull"
              }`}>{bullPrice}¢</span>
            </div>
          </div>
          <div className={`absolute inset-0 bg-gradient-to-r from-bull/0 via-bull/10 to-bull/0 transition-transform duration-500 ${
            hoveredSide === "bull" ? "translate-x-0" : "translate-x-[-100%]"
          }`} />
        </button>

        <button
          onClick={onBearClick}
          onMouseEnter={() => setHoveredSide("bear")}
          onMouseLeave={() => setHoveredSide(null)}
          className={`group relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-300 ${
            hoveredSide === "bear"
              ? "border-bear bg-bear/20 glow-bear scale-[1.02]"
              : "border-bear/30 bg-bear/10 hover:border-bear/50"
          }`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🐻</span>
              <span className={`font-display font-bold transition-colors ${
                hoveredSide === "bear" ? "text-bear" : "text-bear/80"
              }`}>BEAR</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">NO</span>
              <span className={`font-bold text-lg transition-all ${
                hoveredSide === "bear" ? "text-bear scale-110" : "text-bear"
              }`}>{bearPrice}¢</span>
            </div>
          </div>
          <div className={`absolute inset-0 bg-gradient-to-r from-bear/0 via-bear/10 to-bear/0 transition-transform duration-500 ${
            hoveredSide === "bear" ? "translate-x-0" : "translate-x-[-100%]"
          }`} />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>Vol: {volume}</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{traders} traders</span>
        </div>
      </div>
    </div>
  );
}
