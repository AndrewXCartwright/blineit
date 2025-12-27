import { Clock, Users, TrendingUp } from "lucide-react";

interface PredictionCardProps {
  property: string;
  question: string;
  expiresIn: string;
  bullPrice: number;
  bearPrice: number;
  volume: string;
  traders: number;
  onBullClick: () => void;
  onBearClick: () => void;
}

export function PredictionCard({
  property,
  question,
  expiresIn,
  bullPrice,
  bearPrice,
  volume,
  traders,
  onBullClick,
  onBearClick,
}: PredictionCardProps) {
  return (
    <div className="glass-card rounded-2xl p-4 space-y-4 animate-fade-in hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-display font-semibold text-foreground">{property}</h3>
          <p className="text-sm text-muted-foreground mt-1">{question}</p>
        </div>
        <span className="flex items-center gap-1 text-xs text-accent bg-accent/20 px-2 py-1 rounded-full">
          <Clock className="w-3 h-3" />
          {expiresIn}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onBullClick}
          className="group relative overflow-hidden rounded-xl p-4 bg-bull/10 border border-bull/30 hover:bg-bull/20 hover:border-bull/50 transition-all hover:glow-bull"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🐂</span>
              <span className="font-display font-bold text-bull">BULL</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">YES</span>
              <span className="font-bold text-lg text-bull">{bullPrice}¢</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-bull/0 via-bull/5 to-bull/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        </button>

        <button
          onClick={onBearClick}
          className="group relative overflow-hidden rounded-xl p-4 bg-bear/10 border border-bear/30 hover:bg-bear/20 hover:border-bear/50 transition-all hover:glow-bear"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">🐻</span>
              <span className="font-display font-bold text-bear">BEAR</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">NO</span>
              <span className="font-bold text-lg text-bear">{bearPrice}¢</span>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-bear/0 via-bear/5 to-bear/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
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
