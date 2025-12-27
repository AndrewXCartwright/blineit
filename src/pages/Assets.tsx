import { useState } from "react";
import { Search } from "lucide-react";
import { InvestmentTypeToggle, type InvestmentType } from "@/components/InvestmentTypeToggle";
import { AssetClassGrid } from "@/components/AssetClassGrid";
import { QuickStatsBar } from "@/components/QuickStatsBar";

export default function Assets() {
  const [investmentType, setInvestmentType] = useState<InvestmentType>("equity");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-2xl font-bold text-foreground">Assets</h1>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Platform AUM</p>
            <p className="font-display font-bold text-primary">$3.94B tokenized</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Investment Type Toggle */}
        <InvestmentTypeToggle 
          value={investmentType} 
          onChange={setInvestmentType} 
        />

        {/* Quick Stats Bar */}
        <QuickStatsBar investmentType={investmentType} />

        {/* Asset Class Grid */}
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">
            {investmentType === "equity" ? "Equity Investments" : "Debt Investments"}
          </h2>
          <AssetClassGrid investmentType={investmentType} />
        </div>
      </main>
    </div>
  );
}
