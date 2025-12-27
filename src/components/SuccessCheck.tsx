import { useEffect, useState } from "react";

interface SuccessCheckProps {
  active: boolean;
  onComplete?: () => void;
  size?: number;
  color?: "success" | "primary" | "accent";
}

export function SuccessCheck({ 
  active, 
  onComplete, 
  size = 80,
  color = "success" 
}: SuccessCheckProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (active) {
      setShow(true);
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [active, onComplete]);

  if (!show) return null;

  const colorMap = {
    success: "hsl(160, 84%, 39%)",
    primary: "hsl(288, 52%, 36%)",
    accent: "hsl(38, 91%, 55%)",
  };

  const strokeColor = colorMap[color];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="relative">
        {/* Expanding circle behind */}
        <div 
          className="absolute inset-0 rounded-full expand-circle"
          style={{ 
            backgroundColor: strokeColor,
            width: size,
            height: size,
            opacity: 0.3,
          }}
        />
        
        {/* Main checkmark circle */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 50 50"
          className="check-circle-animation animate-bounce-in"
        >
          <circle
            className="circle-path"
            cx="25"
            cy="25"
            r="23"
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
          />
          <path
            className="check-path"
            d="M14 26 L22 34 L36 18"
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
