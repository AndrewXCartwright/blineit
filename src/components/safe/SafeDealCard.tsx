import { useNavigate } from "react-router-dom";
import { Rocket, DollarSign, Percent, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SafeDeal } from "@/hooks/useSafeDeals";

interface SafeDealCardProps {
  deal: SafeDeal;
}

const stageLabels: Record<string, string> = {
  angel: "Angel",
  pre_seed: "Pre-Seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
  series_c: "Series C",
  growth: "Growth",
};

const stageColors: Record<string, string> = {
  angel: "bg-violet-500/10 text-violet-500",
  pre_seed: "bg-blue-400/10 text-blue-400",
  seed: "bg-emerald-500/10 text-emerald-500",
  series_a: "bg-orange-500/10 text-orange-500",
  series_b: "bg-red-500/10 text-red-500",
  series_c: "bg-amber-500/10 text-amber-500",
  growth: "bg-pink-500/10 text-pink-500",
};

const industryColors: Record<string, string> = {
  "AI/Machine Learning": "bg-purple-500/10 text-purple-500",
  "CleanTech": "bg-green-500/10 text-green-500",
  "HealthTech": "bg-red-500/10 text-red-500",
  "FinTech": "bg-blue-500/10 text-blue-500",
  "EdTech": "bg-yellow-500/10 text-yellow-500",
  "AgTech": "bg-lime-500/10 text-lime-500",
  "Sustainability": "bg-teal-500/10 text-teal-500",
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
  const industryColor = deal.industry ? (industryColors[deal.industry] || "bg-slate-500/10 text-slate-500") : "";
  
  const fundedPercent = deal.target_raise > 0 
    ? Math.min((deal.current_raised / deal.target_raise) * 100, 100)
    : 0;

  // Exemption labels
  const getExemptionLabel = (type: string | null) => {
    switch (type) {
      case 'reg_cf':
        return "Open to All";
      case 'reg_a_plus':
        return "Open to All";
      case 'reg_d_506c':
      case 'reg_d_506b':
        return "Accredited Only";
      default:
        return "Open to All";
    }
  };

  const getExemptionColor = (type: string | null) => {
    switch (type) {
      case 'reg_cf':
        return "bg-success/10 text-success";
      case 'reg_a_plus':
        return "bg-blue-500/10 text-blue-500";
      case 'reg_d_506c':
      case 'reg_d_506b':
        return "bg-amber-500/10 text-amber-500";
      default:
        return "bg-success/10 text-success";
    }
  };

  const exemptionLabel = getExemptionLabel(deal.exemption_type);
  const exemptionColor = getExemptionColor(deal.exemption_type);

  const defaultImage = "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800";
  const imageUrl = deal.image_url || defaultImage;

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in interactive-card">
      {/* Image Header */}
      <div className="h-32 relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt={deal.company_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
        
        {/* Top badges */}
        <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
          <Badge className={`${stageColor} text-[10px] font-medium backdrop-blur-sm`}>
            {stageLabel}
          </Badge>
          {deal.industry && (
            <Badge className={`${industryColor} text-[10px] font-medium backdrop-blur-sm`}>
              {deal.industry}
            </Badge>
          )}
        </div>
        
        {/* Exemption badge */}
        <div className="absolute top-2 right-2">
          <Badge className={`${exemptionColor} text-[10px] backdrop-blur-sm`}>
            {exemptionLabel}
          </Badge>
        </div>

        {/* Bottom overlays - MFN/Pro-Rata */}
        <div className="absolute bottom-2 right-2 flex gap-1">
          {deal.has_mfn && (
            <Badge className="bg-amber-500/20 text-amber-400 text-[9px] backdrop-blur-sm">
              MFN
            </Badge>
          )}
          {deal.has_pro_rata && (
            <Badge className="bg-cyan-500/20 text-cyan-400 text-[9px] backdrop-blur-sm">
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
          {deal.location_city && deal.location_state && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="w-3 h-3" />
              <span>{deal.location_city}, {deal.location_state}</span>
            </div>
          )}
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
