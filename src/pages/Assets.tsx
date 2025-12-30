import { useState } from "react";
import { Search, Sparkles, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InvestmentTypeToggle, type InvestmentType } from "@/components/InvestmentTypeToggle";
import { AssetClassGrid } from "@/components/AssetClassGrid";
import { QuickStatsBar } from "@/components/QuickStatsBar";

export default function Assets() {
  const { t } = useTranslation();
  const [investmentType, setInvestmentType] = useState<InvestmentType>("equity");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-2xl font-bold text-foreground">{t('assets.title')}</h1>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{t('assets.platformAum')}</p>
            <p className="font-display font-bold text-primary">$3.94B {t('assets.tokenized')}</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('assets.searchAssets')}
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
            {investmentType === "equity" ? t('assets.equityInvestments') : t('assets.debtInvestments')}
          </h2>
          <AssetClassGrid investmentType={investmentType} />
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => window.location.href = '/ai-recommendations'}
            className="flex-1 bg-primary/10 border border-primary/30 text-primary font-semibold py-3 px-4 rounded-xl hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            AI-Powered Recommendations
          </button>
          <button
            onClick={() => window.location.href = '/properties'}
            className="flex-1 bg-secondary border border-border text-foreground font-semibold py-3 px-4 rounded-xl hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
          >
            <Building2 className="w-5 h-5" />
            Your Properties
          </button>
        </div>
      </main>
    </div>
  );
}
