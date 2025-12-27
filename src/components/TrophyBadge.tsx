import { Trophy } from "lucide-react";

interface TrophyBadgeProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function TrophyBadge({ size = "md", className = "" }: TrophyBadgeProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };

  const iconSizes = {
    sm: 12,
    md: 18,
    lg: 24,
  };

  return (
    <div 
      className={`
        relative inline-flex items-center justify-center rounded-full
        gradient-gold glow-gold
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {/* Trophy icon */}
      <Trophy className="text-accent-foreground z-10" size={iconSizes[size]} />
      
      {/* Shine overlay */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="w-full h-full trophy-shine" />
      </div>
    </div>
  );
}
