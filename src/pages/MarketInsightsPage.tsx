import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { MarketInsights } from "@/components/MarketInsights";

export default function MarketInsightsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="px-4 py-6 pb-24 max-w-3xl mx-auto">
        <MarketInsights />
      </main>
      <BottomNav />
    </div>
  );
}
