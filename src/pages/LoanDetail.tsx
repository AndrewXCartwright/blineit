import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  ArrowLeft, MapPin, Calendar, Landmark, ShieldCheck, Users, 
  Building2, DollarSign, Percent, FileText, Clock, BarChart3,
  Download, Calculator, Share2, Heart, Zap, CheckCircle2, Banknote
} from "lucide-react";
import { Skeleton } from "@/components/Skeleton";
import { CountUp } from "@/components/CountUp";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { LoanInvestModal } from "@/components/LoanInvestModal";
import { useLoanById, useUserLoanInvestments, useLoanPayments, useSimulateInterestPayment, useSimulateLoanPayoff } from "@/hooks/useLoanData";
import { useAuth } from "@/hooks/useAuth";
import { format, differenceInDays } from "date-fns";
import { getLoanFallbackImage } from "@/lib/loanImages";

type TabType = "overview" | "property" | "borrower" | "documents" | "activity" | "payments";

export default function LoanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loan, loading, refetch } = useLoanById(id);
  const { investments, refetch: refetchInvestments } = useUserLoanInvestments();
  const { simulateSinglePayment, loading: simulatingPayment } = useSimulateInterestPayment();
  const { simulatePayoff, loading: simulatingPayoff } = useSimulateLoanPayoff();
  
  // Find user's investment in this loan
  const userInvestment = investments.find(inv => inv.loan_id === id);
  const { payments, totalInterest, totalPrincipal, refetch: refetchPayments } = useLoanPayments(userInvestment?.id);
  
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isFavorite, setIsFavorite] = useState(false);
  const [investAmount, setInvestAmount] = useState<string>("10000");
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);

  const handleSimulatePayment = async () => {
    if (!userInvestment) return;
    const result = await simulateSinglePayment(userInvestment.id);
    if (result.success) {
      refetch();
      refetchInvestments();
      refetchPayments();
    }
  };

  const handleSimulatePayoff = async () => {
    if (!userInvestment) return;
    const result = await simulatePayoff(userInvestment.id);
    if (result.success) {
      refetch();
      refetchInvestments();
      refetchPayments();
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: loan?.name,
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

  const fundedPercent = Math.round((Number(loan.amount_funded) / Number(loan.loan_amount)) * 100);
  const isFullyFunded = fundedPercent >= 100;
  const investmentValue = parseFloat(investAmount) || 0;
  const monthlyPaymentCalc = (investmentValue * (Number(loan.apy) / 100)) / 12;
  const totalInterestCalc = monthlyPaymentCalc * loan.term_months;
  const totalReturnCalc = investmentValue + totalInterestCalc;
  
  const daysUntilMaturity = loan.maturity_date 
    ? differenceInDays(new Date(loan.maturity_date), new Date())
    : null;
  
  const maturityDateFormatted = loan.maturity_date 
    ? format(new Date(loan.maturity_date), "MMMM yyyy")
    : "TBD";

  const loanTypeLabels: Record<string, string> = {
    bridge: "Bridge Loan",
    construction: "Construction",
    stabilized: "Stabilized",
    mezzanine: "Mezzanine",
    preferred_equity: "Preferred Equity",
  };

  const loanPositionLabels: Record<string, string> = {
    "1st_lien": "1st Lien",
    "2nd_lien": "2nd Lien",
    mezzanine: "Mezzanine",
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Hero Image */}
      <div className="h-64 relative overflow-hidden">
        <img 
          src={loan.image_url || getLoanFallbackImage(loan.loan_type, loan.id)} 
          alt={loan.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
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

        {/* Badges */}
        <div className="absolute bottom-20 right-4 flex gap-2 z-10">
          {isFullyFunded && (
            <span className="flex items-center gap-1.5 bg-amber-500/90 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
              FULLY FUNDED
            </span>
          )}
          <span className="flex items-center gap-1.5 bg-blue-500/90 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
            <Landmark className="w-4 h-4" />
            DEBT INVESTMENT
          </span>
        </div>
      </div>

      <main className="px-4 -mt-12 relative z-10 space-y-5">
        {/* Header Card */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
              {loan.name}
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
                    <CountUp end={Number(loan.apy)} decimals={1} />%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Paid {loan.payment_frequency || "monthly"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Term</p>
                <p className="font-display text-xl font-bold text-foreground">{loan.term_months} months</p>
                <p className="text-sm text-muted-foreground">Maturity: {maturityDateFormatted}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Loan Amount" value={`$${(Number(loan.loan_amount) / 1000000).toFixed(1)}M`} />
          <MetricCard icon={<Percent className="w-4 h-4" />} label="LTV Ratio" value={`${loan.ltv_ratio}%`} />
          <MetricCard icon={<Building2 className="w-4 h-4" />} label="Property Value" value={loan.property_value ? `$${(Number(loan.property_value) / 1000000).toFixed(1)}M` : "N/A"} />
          <MetricCard icon={<ShieldCheck className="w-4 h-4" />} label="Loan Position" value={loanPositionLabels[loan.loan_position] || loan.loan_position} highlight="success" />
          <MetricCard icon={<BarChart3 className="w-4 h-4" />} label="DSCR" value={loan.dscr ? `${loan.dscr}x` : "N/A"} />
          <MetricCard icon={<FileText className="w-4 h-4" />} label="Borrower Type" value={loan.borrower_type || "N/A"} />
        </div>

        {/* Security Info Card */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Your Investment is Secured By:
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Loan Type</p>
              <p className="font-semibold text-foreground">{loanTypeLabels[loan.loan_type] || loan.loan_type}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Lien Position</p>
              <p className="font-semibold text-foreground">{loanPositionLabels[loan.loan_position] || loan.loan_position}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Property Value</p>
              <p className="font-semibold text-foreground">
                {loan.property_value ? `$${(Number(loan.property_value) / 1000000).toFixed(2)}M` : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Personal Guarantee</p>
              <p className="font-semibold text-foreground">{loan.personal_guarantee ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        {/* Funding Progress */}
        <div className="glass-card rounded-2xl p-5 animate-fade-in">
          <h3 className="font-display font-semibold text-foreground mb-4">Funding Progress</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                ${(Number(loan.amount_funded) / 1000000).toFixed(2)}M of ${(Number(loan.loan_amount) / 1000000).toFixed(1)}M raised
              </span>
              <span className={`font-bold ${isFullyFunded ? "text-amber-400" : "text-blue-400"}`}>{fundedPercent}%</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isFullyFunded 
                    ? "bg-gradient-to-r from-amber-500 to-amber-400" 
                    : "bg-gradient-to-r from-blue-500 to-blue-400"
                }`}
                style={{ width: `${Math.min(fundedPercent, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {daysUntilMaturity !== null ? `${daysUntilMaturity} days to maturity` : "Date TBD"}
              </span>
              <span className="text-muted-foreground flex items-center gap-1">
                <Users className="w-4 h-4" />
                {loan.investor_count} investors
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
              <p className="font-semibold text-foreground capitalize">{loan.payment_frequency || "Monthly"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">First Payment</p>
              <p className="font-semibold text-foreground">~30 days after funding</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Expected Monthly Payment per $1,000</p>
              <p className="font-semibold text-foreground">${((1000 * Number(loan.apy) / 100) / 12).toFixed(2)}</p>
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
                  min={Number(loan.min_investment)}
                  max={Number(loan.max_investment)}
                  className="w-full bg-secondary border border-border rounded-xl py-3 pl-8 pr-4 text-lg font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Min: ${Number(loan.min_investment).toLocaleString()} | Max: ${Number(loan.max_investment).toLocaleString()}
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
                <span className="font-semibold text-foreground">${monthlyPaymentCalc.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Interest ({loan.term_months}mo):</span>
                <span className="font-semibold text-foreground">${totalInterestCalc.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Principal Return:</span>
                <span className="font-semibold text-foreground">${investmentValue.toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold text-foreground">Total Return:</span>
                <span className="font-bold text-lg text-blue-400">${totalReturnCalc.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isFullyFunded && loan.status === "funding" && (
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
        )}

        {isFullyFunded && !userInvestment && (
          <div className="glass-card rounded-2xl p-5 text-center border-2 border-amber-500/30">
            <p className="text-amber-400 font-semibold">This loan is fully funded and no longer accepting investments.</p>
          </div>
        )}

        {/* User Investment Card */}
        {userInvestment && (
          <div className="glass-card rounded-2xl p-5 border-2 border-blue-500/30 animate-fade-in">
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              Your Investment
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-muted-foreground">Principal Invested</p>
                <p className="font-semibold text-foreground">${userInvestment.principal_invested.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expected Monthly</p>
                <p className="font-semibold text-success">+${userInvestment.expected_monthly_payment.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Interest Earned</p>
                <p className="font-semibold text-success">${userInvestment.total_interest_earned.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className={`font-semibold ${userInvestment.status === 'active' ? 'text-blue-400' : 'text-muted-foreground'}`}>
                  {userInvestment.status === 'active' ? '● Active' : 'Paid Off'}
                </p>
              </div>
            </div>
            {userInvestment.status === 'active' && (
              <div className="flex gap-2">
                <Button
                  onClick={handleSimulatePayment}
                  disabled={simulatingPayment}
                  size="sm"
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {simulatingPayment ? "Processing..." : "Simulate Payment"}
                </Button>
                <Button
                  onClick={handleSimulatePayoff}
                  disabled={simulatingPayoff}
                  size="sm"
                  variant="outline"
                  className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                >
                  <Banknote className="w-4 h-4 mr-2" />
                  Payoff
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
          {(["overview", "property", "borrower", "documents", "activity", ...(userInvestment ? ["payments" as TabType] : [])] as TabType[]).map((tab) => (
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
              <p className="text-muted-foreground text-sm leading-relaxed">
                {loan.description || `This ${loanTypeLabels[loan.loan_type] || loan.loan_type} is secured by property in ${loan.city}, ${loan.state}. The loan offers a fixed ${loan.apy}% APY with ${loan.payment_frequency || "monthly"} interest payments over a ${loan.term_months}-month term.`}
              </p>
            </div>
          )}

          {activeTab === "property" && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Collateral Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Loan Type</p>
                  <p className="font-semibold text-foreground">{loanTypeLabels[loan.loan_type] || loan.loan_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">LTV Ratio</p>
                  <p className="font-semibold text-foreground">{loan.ltv_ratio}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Appraised Value</p>
                  <p className="font-semibold text-foreground">
                    {loan.property_value ? `$${(Number(loan.property_value) / 1000000).toFixed(2)}M` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Location</p>
                  <p className="font-semibold text-foreground">{loan.city}, {loan.state}</p>
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
                  <p className="font-semibold text-foreground">{loan.borrower_type || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Personal Guarantee</p>
                  <p className="font-semibold text-foreground">{loan.personal_guarantee ? "Yes" : "No"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">DSCR (Debt Service Coverage Ratio)</p>
                  <p className="font-semibold text-foreground">{loan.dscr ? `${loan.dscr}x` : "N/A"}</p>
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
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                  <div>
                    <p className="text-foreground text-sm">Current investors</p>
                    <p className="text-muted-foreground text-xs">{loan.investor_count} total</p>
                  </div>
                  <span className="font-semibold text-blue-400">{fundedPercent}% funded</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                  <div>
                    <p className="text-foreground text-sm">Amount funded</p>
                    <p className="text-muted-foreground text-xs">of ${(Number(loan.loan_amount) / 1000000).toFixed(1)}M target</p>
                  </div>
                  <span className="font-semibold text-blue-400">
                    ${(Number(loan.amount_funded) / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && userInvestment && (
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-foreground">Payment History</h3>
              
              {/* Payment Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-success/10 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Total Interest Received</p>
                  <p className="font-bold text-success">${totalInterest.toFixed(2)}</p>
                </div>
                <div className="bg-blue-500/10 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Principal Returned</p>
                  <p className="font-bold text-blue-400">${totalPrincipal.toFixed(2)}</p>
                </div>
              </div>

              {/* Payment Timeline */}
              <div className="space-y-3">
                {payments.length > 0 ? (
                  payments.map((payment, index) => (
                    <div
                      key={payment.id}
                      className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl"
                    >
                      <div className={`p-2 rounded-lg ${
                        payment.payment_type === 'interest' 
                          ? 'bg-success/20' 
                          : 'bg-blue-500/20'
                      }`}>
                        {payment.payment_type === 'interest' ? (
                          <DollarSign className={`w-4 h-4 text-success`} />
                        ) : (
                          <Banknote className={`w-4 h-4 text-blue-400`} />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground text-sm font-medium">
                          {payment.payment_type === 'interest' ? 'Interest Payment' : 'Principal Return'}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {format(new Date(payment.payment_date), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <span className={`font-semibold ${
                        payment.payment_type === 'interest' ? 'text-success' : 'text-blue-400'
                      }`}>
                        +${Number(payment.amount).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">No payments received yet</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Use the "Simulate Payment" button to receive your first interest payment
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Invest Modal */}
      <LoanInvestModal
        isOpen={isInvestModalOpen}
        onClose={() => setIsInvestModalOpen(false)}
        loan={{
          id: loan.id,
          name: loan.name,
          propertyName: loan.name.split(" - ")[0],
          loanType: loanTypeLabels[loan.loan_type] || loan.loan_type,
          city: loan.city,
          state: loan.state,
          loanAmount: Number(loan.loan_amount),
          apy: Number(loan.apy),
          termMonths: loan.term_months,
          ltv: Number(loan.ltv_ratio),
          fundedAmount: Number(loan.amount_funded),
          minInvestment: Number(loan.min_investment),
          maxInvestment: Number(loan.max_investment),
          isSecured: loan.loan_position !== "mezzanine",
          lienPosition: loan.loan_position === "1st_lien" ? "1st" : 
                        loan.loan_position === "2nd_lien" ? "2nd" : "mezzanine",
          paymentFrequency: loan.payment_frequency || "Monthly",
        }}
        onSuccess={() => {
          refetch();
          setIsInvestModalOpen(false);
        }}
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
