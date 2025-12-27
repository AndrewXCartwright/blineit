import { useState, useMemo } from "react";
import { useMarketCountdown, useMarketActivity } from "@/hooks/useRealtimeSubscriptions";
import { LiveIndicator } from "./LiveIndicator";
import { Clock, Users, TrendingUp, TrendingDown } from "lucide-react";

interface LiveCountdownProps {
  expiresAt: string;
  compact?: boolean;
}

export function LiveCountdown({ expiresAt, compact = false }: LiveCountdownProps) {
  const { days, hours, minutes, seconds, isExpired, isEndingSoon } = useMarketCountdown(expiresAt);

  if (isExpired) {
    return (
      <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
        CLOSED
      </span>
    );
  }

  const formatTime = () => {
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1 text-xs ${isEndingSoon ? "text-destructive" : "text-accent"}`}>
        <Clock className="w-3 h-3" />
        <span className="font-medium">{formatTime()}</span>
        {isEndingSoon && <span className="font-semibold animate-pulse">Ending soon!</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${isEndingSoon ? "text-destructive" : "text-accent"}`}>
      <Clock className="w-4 h-4" />
      <div className="flex gap-1 text-sm font-mono">
        {days > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-secondary">{days}d</span>
        )}
        <span className="px-1.5 py-0.5 rounded bg-secondary">{hours.toString().padStart(2, '0')}h</span>
        <span className="px-1.5 py-0.5 rounded bg-secondary">{minutes.toString().padStart(2, '0')}m</span>
        <span className="px-1.5 py-0.5 rounded bg-secondary">{seconds.toString().padStart(2, '0')}s</span>
      </div>
      {isEndingSoon && (
        <span className="text-xs font-semibold animate-pulse">Ending soon!</span>
      )}
    </div>
  );
}

interface MarketActivityProps {
  compact?: boolean;
}

export function MarketActivity({ compact = false }: MarketActivityProps) {
  const { activeUsers, recentBettors } = useMarketActivity();

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="w-3 h-3" />
        <span>{activeUsers} betting now</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {recentBettors.slice(0, 3).map((name, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-semibold text-primary"
          >
            {name[0]}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
        <span className="font-medium">{activeUsers} betting now</span>
      </div>
    </div>
  );
}

interface PriceDisplayProps {
  price: number;
  previousPrice?: number;
  label?: string;
  type?: "bull" | "bear" | "neutral";
  showChange?: boolean;
}

export function PriceDisplay({ price, previousPrice, label, type = "neutral", showChange = false }: PriceDisplayProps) {
  const direction = previousPrice !== undefined && previousPrice !== price
    ? price > previousPrice ? "up" : "down"
    : null;

  const colorClass = type === "bull" 
    ? "text-bull" 
    : type === "bear" 
      ? "text-bear" 
      : direction === "up" 
        ? "text-success" 
        : direction === "down" 
          ? "text-destructive" 
          : "text-foreground";

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-xs text-muted-foreground mb-0.5">{label}</span>
      )}
      <div className={`flex items-center gap-1 font-display font-bold transition-colors duration-300 ${colorClass}`}>
        {direction === "up" && <TrendingUp className="w-3 h-3" />}
        {direction === "down" && <TrendingDown className="w-3 h-3" />}
        <span className={direction ? "animate-pulse" : ""}>{price}¢</span>
      </div>
    </div>
  );
}
