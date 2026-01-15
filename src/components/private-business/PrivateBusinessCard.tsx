import { useNavigate } from "react-router-dom";
import { Building2, TrendingUp, MapPin, Calendar, DollarSign, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { PrivateBusiness } from "@/hooks/usePrivateBusinesses";

interface PrivateBusinessCardProps {
  business: PrivateBusiness;
}

const businessTypeLabels: Record<string, string> = {
  revenue_share: "Revenue Share",
  equity: "Equity",
  convertible_note: "Convertible Note",
  profit_share: "Profit Share",
};

const businessTypeColors: Record<string, string> = {
  revenue_share: "bg-emerald-500/10 text-emerald-500",
  equity: "bg-purple-500/10 text-purple-500",
  convertible_note: "bg-blue-500/10 text-blue-500",
  profit_share: "bg-amber-500/10 text-amber-500",
};

const industryColors: Record<string, string> = {
  "Technology": "bg-cyan-500/10 text-cyan-500",
  "Healthcare": "bg-red-500/10 text-red-500",
  "Food & Beverage": "bg-orange-500/10 text-orange-500",
  "Retail": "bg-pink-500/10 text-pink-500",
  "Manufacturing": "bg-slate-500/10 text-slate-500",
  "Services": "bg-indigo-500/10 text-indigo-500",
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

export function PrivateBusinessCard({ business }: PrivateBusinessCardProps) {
  const navigate = useNavigate();
  
  const typeLabel = businessTypeLabels[business.business_type] || business.business_type;
  const typeColor = businessTypeColors[business.business_type] || "bg-muted text-muted-foreground";
  const industryColor = industryColors[business.industry] || "bg-muted text-muted-foreground";
  
  const fundedPercent = business.target_raise > 0 
    ? Math.min((business.current_raised / business.target_raise) * 100, 100)
    : 0;

  // Exemption labels with proper handling for different types
  const getExemptionLabel = (type: string) => {
    switch (type) {
      case 'reg_cf':
        return "Open to All Investors";
      case 'reg_a_plus':
        return "Open to All Investors";
      case 'reg_d_506c':
        return "Accredited Only";
      case 'reg_d_506b':
        return "Accredited Only";
      default:
        return "Open to All Investors";
    }
  };

  const getExemptionColor = (type: string) => {
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

  const exemptionLabel = getExemptionLabel(business.exemption_type);
  const exemptionColor = getExemptionColor(business.exemption_type);

  const defaultImage = "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800";
  const imageUrl = business.image_url || defaultImage;

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in interactive-card">
      {/* Image Header */}
      <div className="h-32 relative overflow-hidden">
        <img 
          src={imageUrl} 
          alt={business.business_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-2 flex-wrap">
          <Badge className={`${industryColor} text-[10px] font-medium backdrop-blur-sm`}>
            {business.industry}
          </Badge>
          <Badge className={`${typeColor} text-[10px] font-medium backdrop-blur-sm`}>
            {typeLabel}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <Badge className={`${exemptionColor} text-[10px] backdrop-blur-sm`}>
            {exemptionLabel}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-display font-semibold text-foreground truncate">
            {business.business_name}
          </h3>
          {business.location_city && business.location_state && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              <span>{business.location_city}, {business.location_state}</span>
            </div>
          )}
        </div>

        {business.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {business.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          {business.annual_revenue && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Annual Revenue</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatCurrency(business.annual_revenue)}
                </p>
              </div>
            </div>
          )}

          {business.projected_return && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Projected Return</p>
                <p className="text-sm font-semibold text-success">
                  {business.projected_return}%
                </p>
              </div>
            </div>
          )}

          {business.years_in_operation && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Years Operating</p>
                <p className="text-sm font-semibold text-foreground">
                  {business.years_in_operation} yrs
                </p>
              </div>
            </div>
          )}

          {business.revenue_share_percentage && business.business_type === 'revenue_share' && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Revenue Share</p>
                <p className="text-sm font-semibold text-foreground">
                  {business.revenue_share_percentage}%
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
              {formatCurrency(business.current_raised)} / {formatCurrency(business.target_raise)}
            </span>
          </div>
          <Progress value={fundedPercent} className="h-2" />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{fundedPercent.toFixed(0)}% funded</span>
            <span className="text-muted-foreground">Min: ${business.min_investment}</span>
          </div>
        </div>

        <Button 
          className="w-full" 
          variant="secondary"
          onClick={() => navigate(`/business/${business.id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
