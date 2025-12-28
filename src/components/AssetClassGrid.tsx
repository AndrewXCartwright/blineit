import { useNavigate } from "react-router-dom";
import { Check, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWaitlistCounts, useUserWaitlistStatus, AssetClass as WaitlistAssetClass } from "@/hooks/useWaitlist";
import type { InvestmentType } from "./InvestmentTypeToggle";

interface AssetClass {
  id: string;
  icon: string;
  nameKey: string;
  value: string;
  subtitleKey?: string;
  subtitle?: string;
  isLive: boolean;
  launchDate?: string;
  filterPath?: string;
  waitlistId?: WaitlistAssetClass;
}

const equityAssets: AssetClass[] = [
  { id: "real-estate", icon: "🏠", nameKey: "assets.realEstate", value: "$1.2B", subtitle: "45", subtitleKey: "assets.properties", isLive: true, filterPath: "/assets/explore?type=equity&class=real-estate" },
  { id: "commercial", icon: "🏢", nameKey: "assets.commercial", value: "$840M", subtitle: "28", subtitleKey: "assets.properties", isLive: true, filterPath: "/assets/explore?type=equity&class=commercial" },
  { id: "gold", icon: "🥇", nameKey: "assets.goldCommodities", value: "$500M", subtitle: "Coming Q3 2025", isLive: false, launchDate: "Q3 2025", waitlistId: "gold_commodities" },
  { id: "private", icon: "🏭", nameKey: "assets.privateBusiness", value: "$320M", subtitle: "Coming Q1 2026", isLive: false, launchDate: "Q1 2026", waitlistId: "private_business" },
  { id: "startups", icon: "🚀", nameKey: "assets.startupsVc", value: "$180M", subtitle: "Coming Q3 2026", isLive: false, launchDate: "Q3 2026", waitlistId: "startups_vc" },
  { id: "predictions", icon: "🎯", nameKey: "assets.predictions", value: "", subtitleKey: "assets.volume", subtitle: "$2.4M", isLive: true, filterPath: "/predict" },
];

const debtAssets: AssetClass[] = [
  { id: "re-loans", icon: "🏠", nameKey: "assets.realEstateLoans", value: "$650M", subtitle: "8-12% APY", isLive: true, filterPath: "/assets/explore?type=debt&class=re-loans" },
  { id: "commercial-mortgages", icon: "🏢", nameKey: "assets.commercialMortgages", value: "$420M", subtitle: "9-14% APY", isLive: true, filterPath: "/assets/explore?type=debt&class=commercial" },
  { id: "construction", icon: "🏗️", nameKey: "assets.constructionLoans", value: "$180M", subtitle: "12-16% APY", isLive: true, filterPath: "/assets/explore?type=debt&class=construction" },
  { id: "business", icon: "💼", nameKey: "assets.businessLoans", value: "$95M", subtitle: "Coming Q1 2026", isLive: false, launchDate: "Q1 2026", waitlistId: "private_business" },
  { id: "bridge", icon: "🌉", nameKey: "assets.bridgeLoans", value: "$210M", subtitle: "10-15% APY", isLive: true, filterPath: "/assets/explore?type=debt&class=bridge" },
  { id: "portfolios", icon: "📊", nameKey: "assets.loanPortfolios", value: "", subtitleKey: "assets.diversified", subtitle: "Coming Q2 2026", isLive: false, launchDate: "Q2 2026" },
];

interface AssetClassGridProps {
  investmentType: InvestmentType;
}

export function AssetClassGrid({ investmentType }: AssetClassGridProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { counts } = useWaitlistCounts();
  const { statuses } = useUserWaitlistStatus();
  
  const assets = investmentType === "equity" ? equityAssets : debtAssets;

  const handleAssetClick = (asset: AssetClass) => {
    if (asset.isLive && asset.filterPath) {
      navigate(asset.filterPath);
    } else if (!asset.isLive && asset.waitlistId) {
      navigate(`/coming-soon/${asset.waitlistId}`);
    }
  };

  const formatWaitlistCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const getSubtitle = (asset: AssetClass) => {
    if (asset.subtitleKey && asset.subtitle) {
      return `${asset.subtitle} ${t(asset.subtitleKey)}`;
    }
    return asset.subtitle || '';
  };

  const getValue = (asset: AssetClass) => {
    if (asset.id === "predictions") {
      return t('assets.betAndWin');
    }
    if (asset.id === "portfolios" && !asset.value) {
      return t('assets.diversified');
    }
    return asset.value;
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {assets.map((asset, index) => {
        const waitlistCount = asset.waitlistId ? counts[asset.waitlistId] || 0 : 0;
        const isOnWaitlist = asset.waitlistId ? statuses[asset.waitlistId] || false : false;

        return (
          <button
            key={asset.id}
            onClick={() => handleAssetClick(asset)}
            className="p-4 rounded-2xl glass-card text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-fade-in relative"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{asset.icon}</span>
              <div className="flex flex-col items-end gap-1">
                {asset.isLive ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/20 text-success uppercase">
                    {t('assets.live')}
                  </span>
                ) : isOnWaitlist ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/20 text-success">
                    <Check className="w-3 h-3" />
                    {t('assets.waitlisted')}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                    {asset.launchDate || t('assets.soon')}
                  </span>
                )}
                {!asset.isLive && waitlistCount > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Users className="w-2.5 h-2.5" />
                    {formatWaitlistCount(waitlistCount)} {t('assets.waiting')}
                  </span>
                )}
              </div>
            </div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-1 leading-tight">
              {t(asset.nameKey)}
            </h3>
            <p className={`text-sm font-bold mb-0.5 ${
              investmentType === "equity" ? "text-purple-400" : "text-blue-400"
            }`}>
              {getValue(asset)}
            </p>
            <p className="text-xs text-muted-foreground">{getSubtitle(asset)}</p>
          </button>
        );
      })}
    </div>
  );
}
