import { Clock, Users, TrendingUp } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { useState, useEffect } from "react";
import { LiveIndicator } from "./LiveIndicator";
import { LiveCountdown, MarketActivity } from "./MarketRealtime";

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
  priceFlash?: "up" | "down" | null;
  onBullClick: () => void;
  onBearClick: () => void;
}

export function PredictionCardEnhanced({
  id,
  property,
  question,
  expiresAt,
  bullPrice,
  bearPrice,
  volume,
  traders,
  priceHistory,
  priceFlash,
  onBullClick,
  onBearClick,
}: PredictionCardEnhancedProps) {
  const [hoveredSide, setHoveredSide] = useState<"bull" | "bear" | null>(null);
  const [flashDirection, setFlashDirection] = useState<"up" | "down" | null>(null);
  const [prevBullPrice, setPrevBullPrice] = useState(bullPrice);

  const isExpired = expiresAt.getTime() < Date.now();
  const isExpiringSoon = !isExpired && expiresAt.getTime() - Date.now() < 60 * 60 * 1000;

  // Detect price changes for flash animation
  useEffect(() => {
    if (bullPrice !== prevBullPrice) {
      setFlashDirection(bullPrice > prevBullPrice ? "up" : "down");
      setPrevBullPrice(bullPrice);
      
      const timer = setTimeout(() => setFlashDirection(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [bullPrice, prevBullPrice]);

  return (
    <div 
      className={`glass-card rounded-2xl p-4 space-y-4 animate-fade-in transition-all duration-300 ${
        isExpiringSoon ? "border-destructive/50" : ""
      } ${flashDirection === "up" ? "ring-2 ring-success/50" : flashDirection === "down" ? "ring-2 ring-destructive/50" : ""} ${
        isExpired ? "opacity-60" : "hover:border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-foreground">{property}</h3>
            {!isExpired && <LiveIndicator size="sm" />}
            {isExpired && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                CLOSED
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{question}</p>
        </div>
        <LiveCountdown expiresAt={expiresAt.toISOString()} compact />
      </div>

      {/* Sparkline Chart */}
      <div className="flex items-center justify-between bg-secondary/50 rounded-xl p-3">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">24h Price History</span>
          <span className={`text-sm font-semibold transition-colors duration-300 ${
            flashDirection === "up" ? "text-success" : flashDirection === "down" ? "text-destructive" : "text-foreground"
          }`}>
            YES: {bullPrice}¢
          </span>
        </div>
        <Sparkline data={priceHistory} width={100} height={32} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onBullClick}
          onMouseEnter={() => setHoveredSide("bull")}
          onMouseLeave={() => setHoveredSide(null)}
          disabled={isExpired}
          className={`group relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
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
              } ${flashDirection === "up" ? "animate-pulse" : ""}`}>{bullPrice}¢</span>
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
          disabled={isExpired}
          className={`group relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
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
              } ${flashDirection === "down" ? "animate-pulse" : ""}`}>{bearPrice}¢</span>
            </div>
          </div>
          <div className={`absolute inset-0 bg-gradient-to-r from-bear/0 via-bear/10 to-bear/0 transition-transform duration-500 ${
            hoveredSide === "bear" ? "translate-x-0" : "translate-x-[-100%]"
          }`} />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Vol: {volume}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{traders} traders</span>
          </div>
        </div>
        <MarketActivity compact />
      </div>
    </div>
  );
}
