import { MapPin, Landmark, ShieldCheck, Clock, Percent, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LoanData {
  id: string;
  name: string;
  propertyName: string;
  loanType: string;
  city: string;
  state: string;
  loanAmount: number;
  apy: number;
  termMonths: number;
  ltv: number;
  fundedAmount: number;
  minInvestment: number;
  isSecured: boolean;
  lienPosition: "1st" | "2nd" | "mezzanine";
  imageUrl?: string;
}

interface LoanCardProps {
  loan: LoanData;
  onClick?: () => void;
}

export function LoanCard({ loan, onClick }: LoanCardProps) {
  const fundedPercent = Math.round((loan.fundedAmount / loan.loanAmount) * 100);
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div
      onClick={onClick}
      className="glass-card rounded-2xl overflow-hidden animate-fade-in interactive-card cursor-pointer"
    >
      {/* Image Header */}
      <div className="h-32 gradient-primary relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/90" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/90 text-white">
            <Landmark className="w-3.5 h-3.5" />
            DEBT
          </span>
          {loan.isSecured && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white">
              <ShieldCheck className="w-3.5 h-3.5" />
              {loan.lienPosition === "1st" ? "1ST LIEN" : loan.lienPosition === "2nd" ? "2ND LIEN" : "SECURED"}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Loan Name & Location */}
        <div>
          <h3 className="font-display font-bold text-foreground leading-tight mb-1">
            {loan.propertyName} - {loan.loanType}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{loan.city}, {loan.state}</span>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Percent className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="font-display font-bold text-lg text-blue-400">{loan.apy}%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">APY</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="font-display font-bold text-lg text-foreground">{loan.termMonths} mo</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Term</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <p className="font-display font-bold text-lg text-foreground">{loan.ltv}%</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">LTV</p>
          </div>
        </div>

        {/* Funding Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{formatCurrency(loan.loanAmount)} raising</span>
            <span className="font-semibold text-blue-400">{fundedPercent}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${fundedPercent}%` }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">
            Min: ${loan.minInvestment.toLocaleString()}
          </span>
          <Button 
            size="sm" 
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Invest Now
          </Button>
        </div>
      </div>
    </div>
  );
}
