import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  FileText, 
  Building2, 
  Clock, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Percent,
  FileCheck,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { useFactorDeals, type FactorDeal } from "@/hooks/useFactorDeals";
import { InvestmentModal } from "@/components/shared/InvestmentModal";

const factorTypeLabels: Record<string, string> = {
  invoice: "Invoice Factoring",
  contract: "Contract Factoring",
  po_financing: "PO Financing",
  trade: "Trade Finance",
};

const riskColors: Record<string, string> = {
  low: "bg-success/10 text-success",
  medium: "bg-warning/10 text-warning",
  high: "bg-destructive/10 text-destructive",
};

function formatTermDays(days: number): string {
  if (days <= 30) return "Net 30";
  if (days <= 45) return "Net 45";
  if (days <= 60) return "Net 60";
  if (days <= 90) return "Net 90";
  return `Net ${days}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculateNetYield(discountRate: number, termDays: number): number {
  // Annualized yield = (discount / (1 - discount)) * (365 / term_days)
  const discount = discountRate / 100;
  const annualizedYield = (discount / (1 - discount)) * (365 / termDays);
  return Math.round(annualizedYield * 1000) / 10;
}

export default function FactorDealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeal } = useFactorDeals();
  const [deal, setDeal] = useState<FactorDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showInvestModal, setShowInvestModal] = useState(false);

  const tabs = ["Overview", "Borrower", "Documents", "Activity"];

  useEffect(() => {
    async function loadDeal() {
      if (!id) return;
      setLoading(true);
      const fetchedDeal = await getDeal(id);
      setDeal(fetchedDeal);
      setLoading(false);
    }
    loadDeal();
  }, [id, getDeal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </header>
        <main className="p-4 space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-display font-bold">Deal Not Found</h1>
          </div>
        </header>
        <main className="p-4 flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Deal not found</h3>
          <p className="text-muted-foreground mb-4">This factor deal may have been removed or doesn't exist.</p>
          <Button onClick={() => navigate("/explore")}>Back to Explore</Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const netYield = calculateNetYield(deal.discount_rate, deal.term_days);
  const typeLabel = factorTypeLabels[deal.factor_type] || deal.factor_type;
  const riskColor = deal.risk_rating ? riskColors[deal.risk_rating.toLowerCase()] || "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-display font-bold text-foreground truncate">
              {deal.company_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-[10px]">{typeLabel}</Badge>
              {deal.status === "active" && (
                <Badge className="bg-success/10 text-success text-[10px]">Active</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="h-32 relative overflow-hidden bg-gradient-to-br from-primary/30 via-primary/20 to-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-16 h-16 text-primary/20" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-sm text-foreground/80">{deal.title}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 border-b border-border overflow-x-auto">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="p-4 space-y-4">
        {activeTab === "Overview" && (
          <>
            {/* Key Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Deal Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Invoice Amount</p>
                      <p className="font-semibold">{formatCurrency(deal.invoice_amount)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <Percent className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Discount Rate</p>
                      <p className="font-semibold text-success">{deal.discount_rate}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Term</p>
                      <p className="font-semibold">{formatTermDays(deal.term_days)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Net Yield (APY)</p>
                      <p className="font-semibold text-accent">{netYield}%</p>
                    </div>
                  </div>
                </div>

                {deal.risk_rating && (
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Shield className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Risk Rating</p>
                      <Badge className={riskColor}>{deal.risk_rating}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Investment Card */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Minimum Investment</span>
                  <span className="font-semibold">{formatCurrency(deal.min_investment)}</span>
                </div>
                
                {deal.target_raise && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Target Raise</span>
                      <span className="font-semibold">{formatCurrency(deal.target_raise)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Currently Raised</span>
                      <span className="font-semibold">{formatCurrency(deal.current_raised)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((deal.current_raised / deal.target_raise) * 100, 100)}%` }}
                      />
                    </div>
                  </>
                )}

                <Button className="w-full" size="lg" onClick={() => setShowInvestModal(true)}>
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "Borrower" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Borrower Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Company Name</p>
                  <p className="font-semibold">{deal.company_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Factor Type</p>
                  <p className="font-semibold">{typeLabel}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Additional borrower details will be available after signing the NDA.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "Documents" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deal.documents && Array.isArray(deal.documents) && deal.documents.length > 0 ? (
                <div className="space-y-2">
                  {deal.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">{doc.name || `Document ${index + 1}`}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No documents available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "Activity" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Deal Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(deal.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />

      {/* Investment Modal */}
      {deal && (
        <InvestmentModal
          isOpen={showInvestModal}
          onClose={() => setShowInvestModal(false)}
          investmentType="factor"
          investmentId={deal.id}
          title={deal.company_name}
          minInvestment={deal.min_investment}
          targetRaise={deal.target_raise || undefined}
          currentRaised={deal.current_raised}
        />
      )}
    </div>
  );
}
