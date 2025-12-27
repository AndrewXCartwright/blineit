import { MapPin, TrendingUp } from "lucide-react";

interface PropertyCardProps {
  name: string;
  location: string;
  tokens: number;
  yield: number;
  value: number;
  image?: string;
}

export function PropertyCard({ name, location, tokens, yield: yieldPercent, value }: PropertyCardProps) {
  return (
    <div className="min-w-[200px] glass-card rounded-2xl overflow-hidden animate-fade-in">
      <div className="h-24 gradient-primary relative">
        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <h3 className="font-display font-semibold text-sm text-foreground truncate">{name}</h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Tokens</span>
          <span className="text-sm font-semibold text-foreground">{tokens.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Yield</span>
          <span className="text-sm font-semibold text-success flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {yieldPercent}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Value</span>
          <span className="text-sm font-semibold text-foreground">${value.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
