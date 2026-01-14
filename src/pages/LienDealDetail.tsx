import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Landmark, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Percent,
  FileCheck,
  Activity,
  Building2,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomNav } from "@/components/BottomNav";
import { useLienDeals, type LienDeal } from "@/hooks/useLienDeals";

const lienPositionLabels: Record<string, string> = {
  first: "1st Lien Position",
  second: "2nd Lien Position",
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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatTermMonths(months: number): string {
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  if (months === 12) return "1 year";
  if (months % 12 === 0) return `${months / 12} years`;
  return `${months} months`;
}

function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
}

export default function LienDealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeal } = useLienDeals();
  const [deal, setDeal] = useState<LienDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = ["Overview", "Property", "Documents", "Activity"];

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
          <p className="text-muted-foreground mb-4">This lien deal may have been removed or doesn't exist.</p>
          <Button onClick={() => navigate("/explore")}>Back to Explore</Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const positionLabel = lienPositionLabels[deal.lien_position] || deal.lien_position;
  const positionColor = lienPositionColors[deal.lien_position] || "bg-muted text-muted-foreground";
  const ltv = deal.ltv_ratio ?? (deal.collateral_value > 0 ? (deal.principal_amount / deal.collateral_value) * 100 : 0);
  const monthlyPayment = calculateMonthlyPayment(deal.principal_amount, deal.interest_rate, deal.term_months);

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
              {deal.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${positionColor} text-[10px]`}>{positionLabel}</Badge>
              {deal.status === "active" && (
                <Badge className="bg-success/10 text-success text-[10px]">Active</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="h-32 relative overflow-hidden bg-gradient-to-br from-amber-500/30 via-amber-500/20 to-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <Landmark className="w-16 h-16 text-amber-500/20" />
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-foreground/60" />
          <p className="text-sm text-foreground/80 truncate">
            {deal.property_city && deal.property_state 
              ? `${deal.property_address}, ${deal.property_city}, ${deal.property_state}`
              : deal.property_address}
          </p>
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
                <CardTitle className="text-base">Loan Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Principal Amount</p>
                      <p className="font-semibold">{formatCurrency(deal.principal_amount)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <Percent className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold text-success">{deal.interest_rate}% APR</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Term</p>
                      <p className="font-semibold">{formatTermMonths(deal.term_months)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LTV Ratio</p>
                      <p className="font-semibold">{ltv.toFixed(0)}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Collateral Value</p>
                      <p className="font-semibold">{formatCurrency(deal.collateral_value)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Payment</p>
                      <p className="font-semibold text-accent">{formatCurrency(monthlyPayment)}</p>
                    </div>
                  </div>
                </div>
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
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Lien Position</span>
                  <Badge className={positionColor}>{positionLabel}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expected Return</span>
                  <span className="font-semibold text-success">{deal.interest_rate}% APR</span>
                </div>

                <Button className="w-full" size="lg">
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "Property" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Property Address</p>
                  <p className="font-semibold">{deal.property_address}</p>
                </div>
                
                {(deal.property_city || deal.property_state) && (
                  <div className="grid grid-cols-2 gap-4">
                    {deal.property_city && (
                      <div>
                        <p className="text-sm text-muted-foreground">City</p>
                        <p className="font-semibold">{deal.property_city}</p>
                      </div>
                    )}
                    {deal.property_state && (
                      <div>
                        <p className="text-sm text-muted-foreground">State</p>
                        <p className="font-semibold">{deal.property_state}</p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Collateral Valuation</p>
                  <p className="font-semibold">{formatCurrency(deal.collateral_value)}</p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">Secured Investment</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This investment is secured by real property with an LTV of {ltv.toFixed(0)}%, 
                    providing protection in case of default.
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
                      <FileCheck className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">{doc.name || `Document ${index + 1}`}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
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
    </div>
  );
}
