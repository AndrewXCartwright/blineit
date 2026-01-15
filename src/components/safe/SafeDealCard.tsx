import { useNavigate } from "react-router-dom";
import { Rocket, TrendingUp, Shield, Sparkles, DollarSign, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SafeDeal } from "@/hooks/useSafeDeals";

interface SafeDealCardProps {
  deal: SafeDeal;
}

const stageLabels: Record<string, string> = {
  pre_seed: "Pre-Seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
};

const dealTypeLabels: Record<string, string> = {
  safe: "SAFE",
  equity: "Equity",
  convertible_note: "Convertible Note",
};

const stageColors: Record<string, string> = {
  pre_seed: "bg-purple-500/10 text-purple-500",
  seed: "bg-blue-500/10 text-blue-500",
  series_a: "bg-green-500/10 text-green-500",
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export function SafeDealCard({ deal }: SafeDealCardProps) {
  const navigate = useNavigate();
  
  const stageLabel = stageLabels[deal.stage] || deal.stage;
  const stageColor = stageColors[deal.stage] || "bg-muted text-muted-foreground";
  
  const fundedPercent = deal.target_raise > 0 
    ? Math.min((deal.current_raised / deal.target_raise) * 100, 100)
    : 0;

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in interactive-card">
      {/* Header with gradient */}
      <div className="h-20 relative overflow-hidden bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <Rocket className="w-10 h-10 text-violet-500/30" />
        </div>
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className={`${stageColor} text-[10px] font-medium`}>
            {stageLabel}
          </Badge>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {deal.has_mfn && (
            <Badge className="bg-amber-500/10 text-amber-500 text-[10px]">
              MFN
            </Badge>
          )}
          {deal.has_pro_rata && (
            <Badge className="bg-cyan-500/10 text-cyan-500 text-[10px]">
              Pro-Rata
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-semibold text-foreground truncate">
            {deal.company_name}
          </h3>
          {deal.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {deal.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {deal.valuation_cap && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Val Cap</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(deal.valuation_cap)}
                </p>
              </div>
            </div>
          )}

          {deal.discount_rate && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Percent className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Discount</p>
                <p className="text-sm font-semibold text-success">
                  {deal.discount_rate}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Raised</span>
            <span className="font-semibold">
              {formatCurrency(deal.current_raised)} / {formatCurrency(deal.target_raise)}
            </span>
          </div>
          <Progress value={fundedPercent} className="h-2" />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{fundedPercent.toFixed(0)}% funded</span>
            <span className="text-muted-foreground">Min: ${deal.min_investment}</span>
          </div>
        </div>

        <Button 
          className="w-full" 
          variant="secondary"
          onClick={() => navigate(`/safe/${deal.id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
