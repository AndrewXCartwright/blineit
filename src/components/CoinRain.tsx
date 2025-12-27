import { useEffect, useState } from "react";

interface Coin {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

interface CoinRainProps {
  active: boolean;
  onComplete?: () => void;
}

export function CoinRain({ active, onComplete }: CoinRainProps) {
  const [coins, setCoins] = useState<Coin[]>([]);

  useEffect(() => {
    if (active) {
      const newCoins: Coin[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 1,
        duration: 2 + Math.random() * 2,
        size: 20 + Math.random() * 20,
      }));
      setCoins(newCoins);

      const timer = setTimeout(() => {
        setCoins([]);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active || coins.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute top-0 animate-[fall_var(--duration)_ease-in_var(--delay)_forwards]"
          style={{
            left: `${coin.x}%`,
            "--delay": `${coin.delay}s`,
            "--duration": `${coin.duration}s`,
            fontSize: coin.size,
          } as React.CSSProperties}
        >
          🪙
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
