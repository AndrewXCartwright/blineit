import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MapPin, TrendingUp, Building2, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PEFund } from "@/hooks/usePEFunds";

interface PEFundCardProps {
  fund: PEFund;
}

const strategyLabels: Record<string, string> = {
  buyout: "Buyout",
  growth: "Growth Equity",
  turnaround: "Turnaround",
  distressed: "Distressed",
  secondaries: "Secondaries",
  fund_of_funds: "Fund of Funds",
  real_assets: "Real Assets",
  infrastructure: "Infrastructure",
};

const strategyColors: Record<string, string> = {
  buyout: "bg-blue-600/10 text-blue-600 border-blue-600/20",
  growth: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  turnaround: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  distressed: "bg-red-500/10 text-red-500 border-red-500/20",
  secondaries: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  fund_of_funds: "bg-teal-500/10 text-teal-500 border-teal-500/20",
  real_assets: "bg-amber-700/10 text-amber-700 border-amber-700/20",
  infrastructure: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const stageLabels: Record<string, string> = {
  emerging: "Emerging Manager",
  established: "Established",
  flagship: "Flagship Fund",
};

const exemptionLabels: Record<string, string> = {
  reg_cf: "Open to All",
  reg_d_506c: "Accredited Only",
  reg_d_506b: "Accredited Only",
};

const exemptionColors: Record<string, string> = {
  reg_cf: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  reg_d_506c: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  reg_d_506b: "bg-orange-500/10 text-orange-500 border-orange-500/20",
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

export function PEFundCard({ fund }: PEFundCardProps) {
  const navigate = useNavigate();
  const progress = (fund.current_raised / fund.target_fund_size) * 100;
  const defaultImage = "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800";

  // Get best track record
  const bestTrackRecord = fund.track_record.length > 0
    ? fund.track_record.reduce((best, curr) => 
        curr.tvpi > (best?.tvpi || 0) ? curr : best, fund.track_record[0])
    : null;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(`/pe/${fund.id}`)}>
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={fund.image_url || defaultImage}
          alt={fund.fund_name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Strategy Badge */}
        <div className="absolute top-3 left-3">
          {fund.strategy && (
            <Badge className={`${strategyColors[fund.strategy]} border`}>
              {strategyLabels[fund.strategy] || fund.strategy}
            </Badge>
          )}
        </div>
        
        <div className="absolute top-3 right-3">
          <Badge className={`${exemptionColors[fund.exemption_type] || exemptionColors.reg_d_506c} border`}>
            {exemptionLabels[fund.exemption_type] || "Accredited Only"}
          </Badge>
        </div>

        {/* Location */}
        {fund.location_city && fund.location_state && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-sm">
            <MapPin className="w-3 h-3" />
            <span>{fund.location_city}, {fund.location_state}</span>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Fund Name & Manager */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{fund.fund_name}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {fund.fund_manager}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">GP: {fund.gp_name}</p>
        </div>

        {/* Target Sectors */}
        {fund.target_sectors.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {fund.target_sectors.slice(0, 2).map((sector, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {sector}
              </Badge>
            ))}
            {fund.target_sectors.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{fund.target_sectors.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Track Record */}
        {bestTrackRecord && (
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-muted-foreground">{bestTrackRecord.fund}:</span>
            <span className="font-medium text-emerald-500">{bestTrackRecord.tvpi}x TVPI</span>
            <span className="text-muted-foreground">({bestTrackRecord.irr}% IRR)</span>
          </div>
        )}

        {/* Fund Size & Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Fund Progress</span>
            <span className="font-medium">
              {formatCurrency(fund.current_raised)} / {formatCurrency(fund.target_fund_size)}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Terms */}
        <div className="flex items-center justify-between text-sm pt-2 border-t">
          <div>
            <span className="text-muted-foreground">Terms: </span>
            <span className="font-medium">{fund.management_fee}/{fund.carried_interest} w/ {fund.preferred_return}% pref</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">Min: </span>
            <span className="font-medium">{formatCurrency(fund.min_investment)}</span>
          </div>
          {fund.fund_stage && (
            <Badge variant="secondary" className="text-xs">
              {stageLabels[fund.fund_stage] || fund.fund_stage}
            </Badge>
          )}
        </div>

        <Button className="w-full mt-2" onClick={(e) => { e.stopPropagation(); navigate(`/pe/${fund.id}`); }}>
          View Fund
        </Button>
      </CardContent>
    </Card>
  );
}
