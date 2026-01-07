import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { InvestmentTypeData } from "@/data/investmentTypes";
import { Badge } from "@/components/ui/badge";

interface InvestmentTypeCardProps {
  investment: InvestmentTypeData;
}

const riskColors: Record<string, string> = {
  'Low': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Low-Medium': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Medium': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Medium-High': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'High': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Varies': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export function InvestmentTypeCard({ investment }: InvestmentTypeCardProps) {
  const basePath = investment.category === 'factor' 
    ? '/explore/debt/factor' 
    : '/explore/debt/lien';

  return (
    <Link
      to={`${basePath}/${investment.slug}`}
      className="block p-4 rounded-2xl glass-card hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{investment.icon}</span>
        <Badge 
          variant="outline" 
          className={`text-xs ${riskColors[investment.riskLevel] || riskColors['Medium']}`}
        >
          {investment.riskLevel} Risk
        </Badge>
      </div>

      <h3 className="font-display font-semibold text-foreground text-lg mb-1">
        {investment.title}
      </h3>
      <p className="text-sm text-muted-foreground mb-3">
        {investment.subtitle}
      </p>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
        {investment.description}
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-secondary/50 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">Returns</p>
          <p className="text-sm font-semibold text-primary">{investment.typicalReturns}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2">
          <p className="text-xs text-muted-foreground">Duration</p>
          <p className="text-sm font-semibold text-foreground">{investment.typicalDuration}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">View Details</span>
        <ChevronRight className="w-4 h-4 text-primary" />
      </div>
    </Link>
  );
}
