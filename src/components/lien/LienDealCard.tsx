import { useNavigate } from "react-router-dom";
import { MapPin, Clock, TrendingUp, Landmark, Percent, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LienDeal } from "@/hooks/useLienDeals";

interface LienDealCardProps {
  deal: LienDeal;
}

const lienPositionLabels: Record<string, string> = {
  first: "1st Lien",
  second: "2nd Lien",
  tax: "Tax Lien",
  mechanics: "Mechanics Lien",
  judgment: "Judgment Lien",
};

const lienPositionColors: Record<string, string> = {
  first: "bg-green-500/10 text-green-500",
  second: "bg-blue-500/10 text-blue-500",
  tax: "bg-orange-500/10 text-orange-500",
  mechanics: "bg-purple-500/10 text-purple-500",
  judgment: "bg-red-500/10 text-red-500",
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

function formatTermMonths(months: number): string {
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  if (months === 12) return "1 year";
  if (months % 12 === 0) return `${months / 12} years`;
  return `${months} months`;
}

export function LienDealCard({ deal }: LienDealCardProps) {
  const navigate = useNavigate();
  
  const positionLabel = lienPositionLabels[deal.lien_position] || deal.lien_position;
  const positionColor = lienPositionColors[deal.lien_position] || "bg-muted text-muted-foreground";
  
  // Calculate LTV if not provided
  const ltv = deal.ltv_ratio ?? (deal.collateral_value > 0 ? (deal.principal_amount / deal.collateral_value) * 100 : 0);

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in interactive-card">
      {/* Header with gradient */}
      <div className="h-20 relative overflow-hidden bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <Landmark className="w-10 h-10 text-amber-500/30" />
        </div>
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className={`${positionColor} text-[10px] font-medium`}>
            {positionLabel}
          </Badge>
        </div>
        {deal.status === "active" && (
          <Badge className="absolute top-2 right-2 bg-success/10 text-success text-[10px]">
            Active
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-semibold text-foreground truncate">
            {deal.title}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">
              {deal.property_city && deal.property_state 
                ? `${deal.property_city}, ${deal.property_state}`
                : deal.property_address}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Principal</p>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(deal.principal_amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Percent className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Interest</p>
              <p className="text-sm font-semibold text-success">
                {deal.interest_rate}% APR
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Term</p>
              <p className="text-sm font-semibold text-foreground">
                {formatTermMonths(deal.term_months)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">LTV</p>
              <p className="text-sm font-semibold text-foreground">
                {ltv.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <Button 
          className="w-full" 
          variant="secondary"
          onClick={() => navigate(`/lien/${deal.id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
