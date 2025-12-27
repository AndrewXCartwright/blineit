import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: Date;
  className?: string;
  showIcon?: boolean;
}

export function CountdownTimer({ expiresAt, className = "", showIcon = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isPulsing, setIsPulsing] = useState(false);

  function calculateTimeLeft() {
    const now = new Date();
    const difference = expiresAt.getTime() - now.getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      // Pulse when less than 1 hour remaining
      setIsPulsing(newTimeLeft.total > 0 && newTimeLeft.total < 60 * 60 * 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const formatTime = () => {
    if (timeLeft.total <= 0) return "Expired";
    
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${timeLeft.hours}h`;
    }
    if (timeLeft.hours > 0) {
      return `${timeLeft.hours}h ${timeLeft.minutes}m`;
    }
    if (timeLeft.minutes > 0) {
      return `${timeLeft.minutes}m ${timeLeft.seconds}s`;
    }
    return `${timeLeft.seconds}s`;
  };

  const isUrgent = timeLeft.total > 0 && timeLeft.total < 60 * 60 * 1000;
  const isExpired = timeLeft.total <= 0;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-all ${
        isExpired
          ? "bg-muted text-muted-foreground"
          : isUrgent
          ? "bg-destructive/20 text-destructive"
          : "bg-accent/20 text-accent"
      } ${isPulsing ? "animate-pulse" : ""} ${className}`}
    >
      {showIcon && <Clock className="w-3 h-3" />}
      {formatTime()}
    </span>
  );
}
