import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
}

export function Sparkline({ 
  data, 
  width = 80, 
  height = 24,
  strokeColor = "hsl(var(--success))",
  fillColor = "hsla(160, 84%, 39%, 0.2)"
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return "";
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });
    
    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
    
    return linePath;
  }, [data, width, height]);

  const fillPath = useMemo(() => {
    if (data.length < 2) return "";
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });
    
    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
    
    return `${linePath} L ${width} ${height} L 0 ${height} Z`;
  }, [data, width, height]);

  if (data.length < 2) return null;

  // Determine color based on trend
  const isPositive = data[data.length - 1] >= data[0];
  const actualStroke = isPositive ? strokeColor : "hsl(var(--destructive))";
  const actualFill = isPositive ? fillColor : "hsla(0, 84%, 60%, 0.2)";

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${isPositive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={actualFill} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d={fillPath}
        fill={`url(#gradient-${isPositive ? 'up' : 'down'})`}
      />
      <path
        d={path}
        fill="none"
        stroke={actualStroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
