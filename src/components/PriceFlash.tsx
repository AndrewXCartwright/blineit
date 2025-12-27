import { useEffect, useRef, useState } from "react";

interface PriceFlashProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  animate?: boolean;
}

export function PriceFlash({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  className = "",
  animate = true,
}: PriceFlashProps) {
  const prevValueRef = useRef(value);
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    if (!animate) return;
    
    const prevValue = prevValueRef.current;
    if (value !== prevValue) {
      if (value > prevValue) {
        setFlashClass("price-flash-up");
      } else if (value < prevValue) {
        setFlashClass("price-flash-down");
      }

      const timer = setTimeout(() => {
        setFlashClass("");
      }, 500);

      prevValueRef.current = value;
      return () => clearTimeout(timer);
    }
  }, [value, animate]);

  const formattedValue = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`inline-block rounded px-1 -mx-1 transition-colors ${flashClass} ${className}`}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}
