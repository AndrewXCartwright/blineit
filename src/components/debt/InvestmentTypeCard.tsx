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
      className="block rounded-2xl glass-card hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden relative"
    >
      {investment.image && (
        <div className="absolute inset-0 z-0">
          <img 
            src={investment.image} 
            alt="" 
            className="w-full h-full object-cover opacity-30" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>
      )}
      
      <div className="relative z-10 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {investment.image ? (
              <img 
                src={investment.image} 
                alt={investment.title}
                className="w-12 h-12 rounded-lg object-cover border border-border/50"
              />
            ) : (
              <span className="text-3xl">{investment.icon}</span>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className="px-2 py-0.5 text-[10px] font-bold bg-success/20 text-success border-0">
              LIVE
            </Badge>
            <Badge 
              variant="outline" 
              className={`text-[10px] ${riskColors[investment.riskLevel] || riskColors['Medium']}`}
            >
              {investment.riskLevel}
            </Badge>
          </div>
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
      </div>
    </Link>
  );
}
