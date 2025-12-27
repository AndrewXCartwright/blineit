import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { WaitlistModal } from "./WaitlistModal";
import type { InvestmentType } from "./InvestmentTypeToggle";

interface AssetClass {
  id: string;
  icon: string;
  name: string;
  value: string;
  subtitle: string;
  isLive: boolean;
  launchDate?: string;
  filterPath?: string;
}

const equityAssets: AssetClass[] = [
  { id: "real-estate", icon: "🏠", name: "Real Estate", value: "$1.2B", subtitle: "45 properties", isLive: true, filterPath: "/assets/explore?type=equity&class=real-estate" },
  { id: "commercial", icon: "🏢", name: "Commercial", value: "$840M", subtitle: "28 properties", isLive: true, filterPath: "/assets/explore?type=equity&class=commercial" },
  { id: "gold", icon: "🥇", name: "Gold & Commodities", value: "$500M", subtitle: "Coming Q3 2025", isLive: false, launchDate: "Q3 2025" },
  { id: "private", icon: "🏭", name: "Private Companies", value: "$320M", subtitle: "Coming Q1 2026", isLive: false, launchDate: "Q1 2026" },
  { id: "startups", icon: "🚀", name: "Startups & VC", value: "$180M", subtitle: "Coming Q3 2026", isLive: false, launchDate: "Q3 2026" },
  { id: "predictions", icon: "🎯", name: "Predictions", value: "Bet & Win", subtitle: "$2.4M volume", isLive: true, filterPath: "/predict" },
];

const debtAssets: AssetClass[] = [
  { id: "re-loans", icon: "🏠", name: "Real Estate Loans", value: "$650M", subtitle: "8-12% APY", isLive: true, filterPath: "/assets/explore?type=debt&class=re-loans" },
  { id: "commercial-mortgages", icon: "🏢", name: "Commercial Mortgages", value: "$420M", subtitle: "9-14% APY", isLive: true, filterPath: "/assets/explore?type=debt&class=commercial" },
  { id: "construction", icon: "🏗️", name: "Construction Loans", value: "$180M", subtitle: "12-16% APY", isLive: true, filterPath: "/assets/explore?type=debt&class=construction" },
  { id: "business", icon: "💼", name: "Business Loans", value: "$95M", subtitle: "Coming Q1 2026", isLive: false, launchDate: "Q1 2026" },
  { id: "bridge", icon: "🌉", name: "Bridge Loans", value: "$210M", subtitle: "10-15% APY", isLive: true, filterPath: "/assets/explore?type=debt&class=bridge" },
  { id: "portfolios", icon: "📊", name: "Loan Portfolios", value: "Diversified", subtitle: "Coming Q2 2026", isLive: false, launchDate: "Q2 2026" },
];

interface AssetClassGridProps {
  investmentType: InvestmentType;
}

export function AssetClassGrid({ investmentType }: AssetClassGridProps) {
  const navigate = useNavigate();
  const [waitlistAsset, setWaitlistAsset] = useState<AssetClass | null>(null);
  
  const assets = investmentType === "equity" ? equityAssets : debtAssets;

  const handleAssetClick = (asset: AssetClass) => {
    if (asset.isLive && asset.filterPath) {
      navigate(asset.filterPath);
    } else if (!asset.isLive) {
      setWaitlistAsset(asset);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {assets.map((asset, index) => (
          <button
            key={asset.id}
            onClick={() => handleAssetClick(asset)}
            className="p-4 rounded-2xl glass-card text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{asset.icon}</span>
              {asset.isLive ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/20 text-success uppercase">
                  Live
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                  Soon
                </span>
              )}
            </div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-1 leading-tight">
              {asset.name}
            </h3>
            <p className={`text-sm font-bold mb-0.5 ${
              investmentType === "equity" ? "text-purple-400" : "text-blue-400"
            }`}>
              {asset.value}
            </p>
            <p className="text-xs text-muted-foreground">{asset.subtitle}</p>
          </button>
        ))}
      </div>

      {waitlistAsset && (
        <WaitlistModal
          isOpen={!!waitlistAsset}
          onClose={() => setWaitlistAsset(null)}
          assetClass={{
            name: waitlistAsset.name,
            icon: waitlistAsset.icon,
            launchDate: waitlistAsset.launchDate || "Soon"
          }}
        />
      )}
    </>
  );
}
