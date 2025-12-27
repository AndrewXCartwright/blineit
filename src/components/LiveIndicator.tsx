import { useState, useEffect } from "react";

interface LiveIndicatorProps {
  size?: "sm" | "md";
  showText?: boolean;
}

export function LiveIndicator({ size = "md", showText = true }: LiveIndicatorProps) {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <span 
        className={`rounded-full bg-success animate-pulse ${
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2"
        }`} 
      />
      {showText && (
        <span className={`text-success font-semibold uppercase ${
          size === "sm" ? "text-[10px]" : "text-xs"
        }`}>
          Live
        </span>
      )}
    </div>
  );
}

interface PriceFlashProps {
  direction: "up" | "down" | null;
  children: React.ReactNode;
}

export function PriceFlashWrapper({ direction, children }: PriceFlashProps) {
  if (!direction) return <>{children}</>;
  
  return (
    <span className={`inline-block animate-pulse ${
      direction === "up" ? "text-success" : "text-destructive"
    }`}>
      {children}
    </span>
  );
}

interface FlashBorderProps {
  flash: boolean;
  direction?: "up" | "down";
  children: React.ReactNode;
  className?: string;
}

export function FlashBorder({ flash, direction = "up", children, className = "" }: FlashBorderProps) {
  return (
    <div 
      className={`transition-all duration-300 ${
        flash 
          ? direction === "up" 
            ? "ring-2 ring-success ring-opacity-50" 
            : "ring-2 ring-destructive ring-opacity-50"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
