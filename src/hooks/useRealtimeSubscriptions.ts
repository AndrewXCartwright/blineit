import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface PriceChange {
  marketId: string;
  direction: "up" | "down" | null;
  timestamp: number;
}

export function useRealtimeMarkets() {
  const [priceChanges, setPriceChanges] = useState<Map<string, PriceChange>>(new Map());

  useEffect(() => {
    const channel = supabase
      .channel('markets-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'prediction_markets'
        },
        (payload) => {
          const oldData = payload.old as { yes_price?: number };
          const newData = payload.new as { id: string; yes_price: number };
          
          if (oldData.yes_price !== undefined && oldData.yes_price !== newData.yes_price) {
            const direction = newData.yes_price > oldData.yes_price ? "up" : "down";
            setPriceChanges(prev => {
              const updated = new Map(prev);
              updated.set(newData.id, { 
                marketId: newData.id, 
                direction, 
                timestamp: Date.now() 
              });
              return updated;
            });

            // Clear the flash after animation
            setTimeout(() => {
              setPriceChanges(prev => {
                const updated = new Map(prev);
                updated.delete(newData.id);
                return updated;
              });
            }, 1000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getPriceChange = useCallback((marketId: string) => {
    return priceChanges.get(marketId) || null;
  }, [priceChanges]);

  return { getPriceChange };
}

export function useRealtimePortfolio(onValueChange?: (direction: "up" | "down") => void) {
  const { user } = useAuth();
  const previousValueRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('holdings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_holdings',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Trigger refetch and value change animation
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            onValueChange?.("up");
          } else if (payload.eventType === 'DELETE') {
            onValueChange?.("down");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onValueChange]);
}

export function useRealtimeTransactions(onNewTransaction?: (tx: any) => void) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const tx = payload.new as { type: string; amount: number; description: string };
          
          // Show toast for positive transactions
          if (tx.amount > 0) {
            if (tx.type === 'dividend') {
              toast({
                title: "💰 Dividend received!",
                description: `+$${tx.amount.toFixed(2)}`,
              });
            } else if (tx.type === 'bet_won') {
              toast({
                title: "🎉 You won!",
                description: `+$${tx.amount.toFixed(2)}`,
              });
            } else if (tx.type === 'sell_tokens') {
              toast({
                title: "✅ Tokens sold",
                description: `+$${tx.amount.toFixed(2)}`,
              });
            }
          }
          
          onNewTransaction?.(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onNewTransaction]);
}

export function useRealtimeWalletBalance(onBalanceChange?: (direction: "up" | "down") => void) {
  const { user } = useAuth();
  const previousBalanceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('wallet-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const oldBalance = (payload.old as { wallet_balance?: number }).wallet_balance;
          const newBalance = (payload.new as { wallet_balance: number }).wallet_balance;
          
          if (oldBalance !== undefined && oldBalance !== newBalance) {
            const direction = newBalance > oldBalance ? "up" : "down";
            onBalanceChange?.(direction);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, onBalanceChange]);
}

export function useMarketCountdown(expiresAt: string) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    isEndingSoon: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false, isEndingSoon: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isEndingSoon: false };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const isEndingSoon = diff < 60 * 60 * 1000; // Less than 1 hour

      return { days, hours, minutes, seconds, isExpired: false, isEndingSoon };
    };

    setTimeLeft(calculateTimeLeft());
    
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return timeLeft;
}

// Mock activity for market activity indicator
export function useMarketActivity() {
  const [activeUsers, setActiveUsers] = useState(Math.floor(Math.random() * 50) + 20);
  const [recentBettors, setRecentBettors] = useState<string[]>([
    "Alex", "Sam", "Jordan", "Taylor", "Morgan"
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly increment/decrement active users
      setActiveUsers(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(10, Math.min(100, prev + change));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return { activeUsers, recentBettors };
}
