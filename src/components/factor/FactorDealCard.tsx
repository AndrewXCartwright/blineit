import { useNavigate } from "react-router-dom";
import { FileText, Clock, TrendingUp, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FactorDeal } from "@/hooks/useFactorDeals";

interface FactorDealCardProps {
  deal: FactorDeal;
}

const factorTypeLabels: Record<string, string> = {
  invoice: "Invoice",
  contract: "Contract",
  po_financing: "PO Financing",
  trade: "Trade",
};

const factorTypeColors: Record<string, string> = {
  invoice: "bg-blue-500/10 text-blue-500",
  contract: "bg-purple-500/10 text-purple-500",
  po_financing: "bg-orange-500/10 text-orange-500",
  trade: "bg-green-500/10 text-green-500",
};

function formatTermDays(days: number): string {
  if (days <= 30) return "Net 30";
  if (days <= 45) return "Net 45";
  if (days <= 60) return "Net 60";
  if (days <= 90) return "Net 90";
  return `Net ${days}`;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export function FactorDealCard({ deal }: FactorDealCardProps) {
  const navigate = useNavigate();
  
  const typeLabel = factorTypeLabels[deal.factor_type] || deal.factor_type;
  const typeColor = factorTypeColors[deal.factor_type] || "bg-muted text-muted-foreground";

  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-fade-in interactive-card">
      {/* Header with gradient */}
      <div className="h-20 relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-10 h-10 text-primary/30" />
        </div>
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className={`${typeColor} text-[10px] font-medium`}>
            {typeLabel}
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
            {deal.company_name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">{deal.title}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Invoice</p>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(deal.invoice_amount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Discount</p>
              <p className="text-sm font-semibold text-success">
                {deal.discount_rate}%
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
                {formatTermDays(deal.term_days)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Min</p>
              <p className="text-sm font-semibold text-foreground">
                ${deal.min_investment}
              </p>
            </div>
          </div>
        </div>

        <Button 
          className="w-full" 
          variant="secondary"
          onClick={() => navigate(`/factor/${deal.id}`)}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
