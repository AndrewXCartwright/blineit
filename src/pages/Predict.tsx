import { useState, useEffect, useCallback } from "react";
import { Target, Trophy, Percent } from "lucide-react";
import { PredictionCardEnhanced } from "@/components/PredictionCardEnhanced";
import { BettingModalEnhanced } from "@/components/BettingModalEnhanced";
import { PredictionCardSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { PullToRefresh } from "@/components/PullToRefresh";
import { CountUp } from "@/components/CountUp";
import { SuccessCheck } from "@/components/SuccessCheck";
import { supabase } from "@/integrations/supabase/client";
import { useUserData, usePlaceBet } from "@/hooks/useUserData";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeMarkets } from "@/hooks/useRealtimeSubscriptions";
import confetti from "canvas-confetti";

interface Market {
  id: string;
  question: string;
  title: string | null;
  yes_price: number;
  no_price: number;
  expires_at: string;
  volume: number;
  traders_count: number;
  status: string;
  properties: { name: string } | null;
}

export default function Predict() {
  const { user } = useAuth();
  const { bets, activeBetsValue, bettingWinnings, refetch } = useUserData();
  const { placeBet } = usePlaceBet();
  const { getPriceChange } = useRealtimeMarkets();
  
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceHistories, setPriceHistories] = useState<Record<string, number[]>>({});
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedSide, setSelectedSide] = useState<"bull" | "bear">("bull");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchMarkets = useCallback(async () => {
    const { data, error } = await supabase
      .from("prediction_markets")
      .select("*, properties(name)")
      .eq("is_resolved", false)
      .order("expires_at", { ascending: true });

    if (!error && data) {
      setMarkets(data as Market[]);
      
      // Fetch price histories
      const histories: Record<string, number[]> = {};
      for (const market of data) {
        const { data: historyData } = await supabase
          .from("market_price_history")
          .select("yes_price")
          .eq("market_id", market.id)
          .order("recorded_at", { ascending: true })
          .limit(24);
        
        histories[market.id] = historyData?.map(h => Number(h.yes_price)) || [];
      }
      setPriceHistories(histories);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  // Subscribe to real-time market updates
  useEffect(() => {
    const channel = supabase
      .channel('markets-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'prediction_markets'
        },
        (payload) => {
          const updatedMarket = payload.new as Market;
          setMarkets(prev => 
            prev.map(m => m.id === updatedMarket.id ? { ...m, ...updatedMarket } : m)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = async () => {
    await fetchMarkets();
    await refetch();
  };

  const handleBullClick = (market: Market) => {
    setSelectedMarket(market);
    setSelectedSide("bull");
    setIsModalOpen(true);
  };

  const handleBearClick = (market: Market) => {
    setSelectedMarket(market);
    setSelectedSide("bear");
    setIsModalOpen(true);
  };

  const handlePlaceBet = async (side: "bull" | "bear", amount: number, shares: number) => {
    if (!selectedMarket) return;
    
    const entryPrice = side === "bull" ? selectedMarket.yes_price : selectedMarket.no_price;
    const result = await placeBet(selectedMarket.id, side, amount, entryPrice);
    
    if (result.success) {
      // Fire confetti
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: side === "bull" 
          ? ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0"] 
          : ["#EF4444", "#F87171", "#FCA5A5", "#FECACA"],
      });
      
      setShowSuccess(true);
      
      setTimeout(() => {
        setShowSuccess(false);
        setIsModalOpen(false);
        refetch();
      }, 2000);
    }
  };

  // Calculate stats from user bets
  const activeBets = bets.filter(b => b.status === "active");
  const wonBets = bets.filter(b => b.status === "won");
  const totalBets = bets.filter(b => b.status !== "active").length;
  const winRate = totalBets > 0 ? (wonBets.length / totalBets) * 100 : 0;

  return (
    <div className="min-h-screen pb-24">
      <SuccessCheck active={showSuccess} />
      
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl gradient-gold glow-gold">
            <Target className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">🎯 Predictions</h1>
            <p className="text-sm text-muted-foreground">Bet on real estate outcomes</p>
          </div>
        </div>

        <div className="gradient-gold rounded-xl p-4 glow-gold">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-accent-foreground/70 text-xs mb-1">Active Bets</p>
              <p className="font-display font-bold text-lg text-accent-foreground">
                $<CountUp end={activeBetsValue} decimals={0} duration={1500} />
              </p>
            </div>
            <div className="border-x border-accent-foreground/20">
              <p className="text-accent-foreground/70 text-xs mb-1">Winnings</p>
              <p className="font-display font-bold text-lg text-accent-foreground flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4" />
                $<CountUp end={bettingWinnings} decimals={0} duration={1500} />
              </p>
            </div>
            <div>
              <p className="text-accent-foreground/70 text-xs mb-1">Win Rate</p>
              <p className="font-display font-bold text-lg text-accent-foreground flex items-center justify-center gap-1">
                <Percent className="w-4 h-4" />
                <CountUp end={winRate} decimals={0} duration={1500} />%
              </p>
            </div>
          </div>
        </div>
      </header>

      <PullToRefresh onRefresh={handleRefresh} className="h-[calc(100vh-220px)]">
        <main className="px-4 py-6 space-y-4">
          <h2 className="font-display font-bold text-foreground">Active Markets</h2>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <PredictionCardSkeleton key={i} />)
          ) : markets.length > 0 ? (
            markets.map((market, index) => (
              <div 
                key={market.id} 
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <PredictionCardEnhanced
                  id={market.id}
                  property={market.title || market.properties?.name || "Market"}
                  question={market.question}
                  expiresAt={new Date(market.expires_at)}
                  bullPrice={Number(market.yes_price)}
                  bearPrice={Number(market.no_price)}
                  volume={`$${(Number(market.volume) / 1000).toFixed(1)}K`}
                  traders={market.traders_count}
                  priceHistory={priceHistories[market.id] || [50, 55, 52, 58, 60, 55]}
                  onBullClick={() => handleBullClick(market)}
                  onBearClick={() => handleBearClick(market)}
                />
              </div>
            ))
          ) : (
            <EmptyState
              icon={<Target className="w-12 h-12" />}
              title="No active markets"
              description="Check back soon for new prediction markets"
            />
          )}
        </main>
      </PullToRefresh>

      {selectedMarket && (
        <BettingModalEnhanced
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          property={selectedMarket.title || selectedMarket.properties?.name || "Market"}
          question={selectedMarket.question}
          expiresAt={new Date(selectedMarket.expires_at)}
          bullPrice={Number(selectedMarket.yes_price)}
          bearPrice={Number(selectedMarket.no_price)}
          priceHistory={(priceHistories[selectedMarket.id] || [50, 55, 52, 58]).map((price, i) => ({
            time: new Date(Date.now() - (24 - i) * 3600000).toISOString(),
            yesPrice: price
          }))}
          initialSide={selectedSide}
          onPlaceBet={handlePlaceBet}
        />
      )}
    </div>
  );
}
