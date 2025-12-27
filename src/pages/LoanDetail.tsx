import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { 
  ArrowLeft, MapPin, Calendar, Landmark, ShieldCheck, Users, 
  Building2, DollarSign, Percent, FileText, Clock, BarChart3,
  Download, TrendingUp, Home, Calculator, Share2, Heart
} from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { CountUp } from "@/components/CountUp";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { LoanInvestModal } from "@/components/LoanInvestModal";
import type { LoanData } from "@/components/LoanCard";

type TabType = "overview" | "property" | "borrower" | "documents" | "activity";

// Mock loan data - in production this would come from Supabase
const getMockLoan = (id: string): LoanData & {
  description: string;
  useOfFunds: string;
  propertyValue: number;
  propertyType: string;
  propertyUnits: number;
  propertyOccupancy: number;
  dscr: number;
  borrowerType: string;
  hasPersonalGuarantee: boolean;
  insuranceCoverage: number;
  liquidationValue: number;
  paymentFrequency: string;
  maturityDate: string;
  investors: number;
  fundingDeadline: string;
  maxInvestment: number;
} => ({
  id,
  name: `Loan-${id.slice(0, 4)}`,
  propertyName: "Sunset Apartments",
  loanType: "Bridge Loan",
  city: "Austin",
  state: "TX",
  loanAmount: 2400000,
  apy: 10.5,
  termMonths: 18,
  ltv: 65,
  fundedAmount: 1872000,
  minInvestment: 1000,
  maxInvestment: 100000,
  isSecured: true,
  lienPosition: "1st",
  description: "This bridge loan is secured by a 24-unit multifamily property in Austin, TX. The borrower is refinancing an existing loan to complete renovations and stabilize occupancy before permanent financing.",
  useOfFunds: "Refinance existing debt, complete unit renovations, and fund operating reserves.",
  propertyValue: 3700000,
  propertyType: "Multifamily",
  propertyUnits: 24,
  propertyOccupancy: 92,
  dscr: 1.45,
  borrowerType: "LLC",
  hasPersonalGuarantee: true,
  insuranceCoverage: 4000000,
  liquidationValue: 3200000,
  paymentFrequency: "Monthly",
  maturityDate: "June 2026",
  investors: 47,
  fundingDeadline: "12 days",
});

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<ReturnType<typeof getMockLoan> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [investAmount, setInvestAmount] = useState<string>("10000");
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      // Simulate API call
      setTimeout(() => {
        setLoan(getMockLoan(id));
        setLoading(false);
      }, 500);
    }
  }, [id]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: loan?.propertyName,
        text: `Check out this debt investment opportunity`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Loan link copied to clipboard",
      });
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Loan removed from your watchlist" : "Loan added to your watchlist",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <div className="h-56 w-full">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Landmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Loan not found</p>
          <button
            onClick={() => navigate("/assets")}
            className="text-primary hover:underline"
          >
            Back to Assets
          </button>
        </div>
      </div>
    );
  }

  const fundedPercent = Math.round((loan.fundedAmount / loan.loanAmount) * 100);
  const investmentValue = parseFloat(investAmount) || 0;
  const monthlyPayment = (investmentValue * (loan.apy / 100)) / 12;
  const totalInterest = monthlyPayment * loan.termMonths;
  const totalReturn = investmentValue + totalInterest;

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Image */}
      <div className="h-64 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
          <Building2 className="w-24 h-24 text-white/30" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        
        {/* Top controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full glass-card hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleFavorite}
              className={`p-2.5 rounded-full glass-card hover:bg-secondary/80 transition-colors ${
                isFavorite ? "text-destructive" : "text-foreground"
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full glass-card hover:bg-secondary/80 transition-colors"
            >
              <Share2 className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Investment Type Badge */}
        <span className="absolute bottom-20 right-4 flex items-center gap-1.5 bg-blue-500/90 text-white px-3 py-1.5 rounded-full text-sm font-semibold z-10">
          <Landmark className="w-4 h-4" />
          DEBT INVESTMENT
        </span>
      </div>

      <main className="px-4 -mt-12 relative z-10 space-y-5">
        {/* Header Card */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
              {loan.propertyName} - {loan.loanType}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{loan.city}, {loan.state}</span>
          </div>
        </div>

        {/* Loan Terms Card - Blue Gradient Border */}
        <div className="relative rounded-2xl p-[2px] bg-gradient-to-r from-blue-500 to-blue-400 animate-fade-in">
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fixed APY</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl font-bold text-blue-400">
                    <CountUp end={loan.apy} decimals={1} />%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Paid monthly</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Term</p>
                <p className="font-display text-xl font-bold text-foreground">{loan.termMonths} months</p>
                <p className="text-sm text-muted-foreground">Maturity: {loan.maturityDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Loan Amount" value={`$${(loan.loanAmount / 1000000).toFixed(1)}M`} />
          <MetricCard icon={<Percent className="w-4 h-4" />} label="LTV Ratio" value={`${loan.ltv}%`} />
          <MetricCard icon={<Building2 className="w-4 h-4" />} label="Property Value" value={`$${(loan.propertyValue / 1000000).toFixed(1)}M`} />
          <MetricCard icon={<ShieldCheck className="w-4 h-4" />} label="Loan Position" value="1st Lien" highlight="success" />
          <MetricCard icon={<BarChart3 className="w-4 h-4" />} label="DSCR" value={`${loan.dscr}x`} />
          <MetricCard icon={<FileText className="w-4 h-4" />} label="Borrower Type" value={loan.borrowerType} />
        </div>

        {/* Security Info Card */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Your Investment is Secured By:
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Property Type</p>
              <p className="font-semibold text-foreground">{loan.propertyType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Units</p>
              <p className="font-semibold text-foreground">{loan.propertyUnits}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Occupancy</p>
              <p className="font-semibold text-foreground">{loan.propertyOccupancy}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Personal Guarantee</p>
              <p className="font-semibold text-foreground">{loan.hasPersonalGuarantee ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Insurance Coverage</p>
              <p className="font-semibold text-foreground">${(loan.insuranceCoverage / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-muted-foreground">Est. Liquidation Value</p>
              <p className="font-semibold text-foreground">${(loan.liquidationValue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>

        {/* Funding Progress */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <h3 className="font-display font-semibold text-foreground mb-4">Funding Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ${(loan.fundedAmount / 1000000).toFixed(2)}M of ${(loan.loanAmount / 1000000).toFixed(1)}M raised
              </span>
              <span className="font-bold text-blue-400">{fundedPercent}%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${fundedPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Funding closes in {loan.fundingDeadline}
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-4 h-4" />
                {loan.investors} investors
              </span>
            </div>
          </div>
        </div>

        {/* Payment Schedule */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Interest Payments
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Payment Frequency</p>
              <p className="font-semibold text-foreground">{loan.paymentFrequency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">First Payment</p>
              <p className="font-semibold text-foreground">~30 days after funding</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Expected Monthly Payment per $1,000</p>
              <p className="font-semibold text-foreground">${((1000 * loan.apy / 100) / 12).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Investment Calculator */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in border-2 border-blue-500/30">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            Investment Calculator
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Investment amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  min={loan.minInvestment}
                  max={loan.maxInvestment}
                  className="w-full bg-secondary border border-border rounded-xl py-3 pl-8 pr-4 text-lg font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Min: ${loan.minInvestment.toLocaleString()} | Max: ${loan.maxInvestment.toLocaleString()}
              </p>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[1000, 5000, 10000, 25000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setInvestAmount(amount.toString())}
                  className="py-2 rounded-lg bg-secondary text-muted-foreground hover:bg-blue-500/20 hover:text-blue-400 transition-colors text-sm font-medium"
                >
                  ${(amount / 1000).toFixed(0)}K
                </button>
              ))}
            </div>

            <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Payment:</span>
                <span className="font-semibold text-foreground">${monthlyPayment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Interest ({loan.termMonths}mo):</span>
                <span className="font-semibold text-foreground">${totalInterest.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Principal Return:</span>
                <span className="font-semibold text-foreground">${investmentValue.toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold text-foreground">Total Return:</span>
                <span className="font-bold text-lg text-blue-400">${totalReturn.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsInvestModalOpen(true)}
            className="flex-1 py-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-display font-bold text-lg"
          >
            Invest in This Loan
          </Button>
          <Button 
            variant="outline"
            className="py-6 rounded-xl font-display font-bold"
          >
            <Download className="w-5 h-5 mr-2" />
            Documents
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {(["overview", "property", "borrower", "documents", "activity"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">About this Loan</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{loan.description}</p>
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold text-foreground mb-3">Use of Funds</h4>
                <p className="text-muted-foreground text-sm">{loan.useOfFunds}</p>
              </div>
            </div>
          )}

          {activeTab === "property" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Collateral Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Property Type</p>
                  <p className="font-semibold text-foreground">{loan.propertyType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Units</p>
                  <p className="font-semibold text-foreground">{loan.propertyUnits}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Occupancy</p>
                  <p className="font-semibold text-foreground">{loan.propertyOccupancy}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Appraised Value</p>
                  <p className="font-semibold text-foreground">${(loan.propertyValue / 1000000).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-semibold text-foreground">{loan.city}, {loan.state}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Insurance</p>
                  <p className="font-semibold text-foreground">${(loan.insuranceCoverage / 1000000).toFixed(1)}M coverage</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "borrower" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Borrower Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Entity Type</p>
                  <p className="font-semibold text-foreground">{loan.borrowerType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Personal Guarantee</p>
                  <p className="font-semibold text-foreground">{loan.hasPersonalGuarantee ? "Yes" : "No"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Track Record</p>
                  <p className="font-semibold text-foreground">5+ successful projects, no defaults</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Loan Documents</h3>
              {["Loan Agreement", "Property Appraisal", "Title Report", "Insurance Certificate"].map((doc) => (
                <div key={doc} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="text-foreground">{doc}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "activity" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Funding Activity</h3>
              <div className="space-y-3">
                {[
                  { action: "Investment received", amount: "$25,000", time: "2 hours ago" },
                  { action: "Investment received", amount: "$10,000", time: "5 hours ago" },
                  { action: "Investment received", amount: "$50,000", time: "1 day ago" },
                  { action: "Loan listed", amount: "", time: "5 days ago" },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <div>
                      <p className="text-foreground text-sm">{activity.action}</p>
                      <p className="text-muted-foreground text-xs">{activity.time}</p>
                    </div>
                    {activity.amount && (
                      <span className="font-semibold text-blue-400">{activity.amount}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Invest Modal */}
      <LoanInvestModal
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
        loan={loan}
      />
    </div>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  highlight 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  highlight?: "success" | "blue";
}) {
  return (
    <div className="glass-card rounded-xl p-3 text-center animate-fade-in">
      <div className={`inline-flex p-2 rounded-lg mb-2 ${
        highlight === "success" ? "bg-emerald-500/20 text-emerald-400" :
        highlight === "blue" ? "bg-blue-500/20 text-blue-400" :
        "bg-secondary text-muted-foreground"
      }`}>
        {icon}
      </div>
      <p className={`font-display font-bold text-sm ${
        highlight === "success" ? "text-emerald-400" :
        highlight === "blue" ? "text-blue-400" :
        "text-foreground"
      }`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
