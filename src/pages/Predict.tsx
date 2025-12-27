import { useState, useEffect } from "react";
import { Target, Trophy, Percent } from "lucide-react";
import { PredictionCardEnhanced } from "@/components/PredictionCardEnhanced";
import { BettingModalEnhanced } from "@/components/BettingModalEnhanced";
import { PredictionCardSkeleton } from "@/components/Skeleton";
import { supabase } from "@/integrations/supabase/client";

interface Market {
  id: string;
  question: string;
  yes_price: number;
  no_price: number;
  expires_at: string;
  volume: number;
  traders_count: number;
  properties: { name: string } | null;
}

export default function Predict() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceHistories, setPriceHistories] = useState<Record<string, number[]>>({});
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedSide, setSelectedSide] = useState<"bull" | "bear">("bull");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchMarkets = async () => {
      const { data, error } = await supabase
        .from("prediction_markets")
        .select("*, properties(name)")
        .eq("is_resolved", false)
        .order("expires_at", { ascending: true });

      if (!error && data) {
        setMarkets(data);
        
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
    };

    fetchMarkets();
  }, []);

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

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl gradient-gold glow-gold">
            <Target className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">🎯 SquareFoot Predictions</h1>
            <p className="text-sm text-muted-foreground">Bet on real estate outcomes</p>
          </div>
        </div>

        <div className="gradient-gold rounded-xl p-4 glow-gold">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-accent-foreground/70 text-xs mb-1">Active Bets</p>
              <p className="font-display font-bold text-lg text-accent-foreground">$2,450</p>
            </div>
            <div className="border-x border-accent-foreground/20">
              <p className="text-accent-foreground/70 text-xs mb-1">Winnings</p>
              <p className="font-display font-bold text-lg text-accent-foreground flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4" />$8,420
              </p>
            </div>
            <div>
              <p className="text-accent-foreground/70 text-xs mb-1">Win Rate</p>
              <p className="font-display font-bold text-lg text-accent-foreground flex items-center justify-center gap-1">
                <Percent className="w-4 h-4" />67%
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        <h2 className="font-display font-bold text-foreground">Active Markets</h2>

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <PredictionCardSkeleton key={i} />)
        ) : (
          markets.map((market) => (
            <PredictionCardEnhanced
              key={market.id}
              id={market.id}
              property={market.properties?.name || "Unknown Property"}
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
          ))
        )}
      </main>

      {selectedMarket && (
        <BettingModalEnhanced
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          property={selectedMarket.properties?.name || "Unknown"}
          question={selectedMarket.question}
          expiresAt={new Date(selectedMarket.expires_at)}
          bullPrice={Number(selectedMarket.yes_price)}
          bearPrice={Number(selectedMarket.no_price)}
          priceHistory={priceHistories[selectedMarket.id] || [50, 55, 52, 58]}
          initialSide={selectedSide}
        />
      )}
    </div>
  );
}
