import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Building2, Target, TrendingUp, TrendingDown, Wallet as WalletIcon, Landmark, Zap, Calendar, CheckCircle2, Clock } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useRealtimeWalletBalance, useRealtimeTransactions, useRealtimePortfolio } from "@/hooks/useRealtimeSubscriptions";
import { useUserLoanInvestments, useSimulateInterestPayment, useSimulateLoanPayoff } from "@/hooks/useLoanData";
import { FlashBorder } from "@/components/LiveIndicator";
import { CountUp } from "@/components/CountUp";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LinkedAccountsSection } from "@/components/LinkedAccountsSection";
import { TransferHistory } from "@/components/TransferHistory";

export default function Wallet() {
  const { t } = useTranslation();
  const { 
    holdings, 
    bets, 
    transactions,
    loading, 
    portfolioValue, 
    walletBalance,
    activeBetsValue,
    refetch 
  } = useUserData();

  const { 
    investments: debtInvestments, 
    totalDebtInvested, 
    monthlyIncome, 
    totalInterestEarned,
    nextPaymentDate,
    refetch: refetchDebt,
    loading: debtLoading 
  } = useUserLoanInvestments();

  const { simulateAllPayments, loading: simulatingPayment } = useSimulateInterestPayment();
  const { simulatePayoff, loading: simulatingPayoff } = useSimulateLoanPayoff();

  const [walletFlash, setWalletFlash] = useState(false);
  const [portfolioFlash, setPortfolioFlash] = useState(false);
  const [flashDirection, setFlashDirection] = useState<"up" | "down">("up");
  const [newTransactions, setNewTransactions] = useState<string[]>([]);

  useRealtimeWalletBalance(useCallback((direction: "up" | "down") => {
    setFlashDirection(direction);
    setWalletFlash(true);
    refetch();
    refetchDebt();
    setTimeout(() => setWalletFlash(false), 1000);
  }, [refetch, refetchDebt]));

  useRealtimePortfolio(useCallback((direction: "up" | "down") => {
    setFlashDirection(direction);
    setPortfolioFlash(true);
    refetch();
    setTimeout(() => setPortfolioFlash(false), 1000);
  }, [refetch]));

  useRealtimeTransactions(useCallback((tx: any) => {
    setNewTransactions(prev => [tx.id, ...prev]);
    refetch();
    refetchDebt();
    setTimeout(() => {
      setNewTransactions(prev => prev.filter(id => id !== tx.id));
    }, 2000);
  }, [refetch, refetchDebt]));

  const handleSimulatePayments = async () => {
    const result = await simulateAllPayments();
    if (result.success) {
      refetch();
      refetchDebt();
    }
  };

  const handleSimulatePayoff = async (investmentId: string) => {
    const result = await simulatePayoff(investmentId);
    if (result.success) {
      refetch();
      refetchDebt();
    }
  };

  // Demo values for $147M portfolio display
  const demoWalletBalance = 12450000; // $12.45M cash
  const demoPortfolioValue = 98750000; // $98.75M equity
  const demoDebtInvested = 28500000; // $28.5M debt
  const demoActiveBetsValue = 7557230.88; // ~$7.5M in predictions
  const demoMonthlyIncome = 237500; // ~$237.5K/month
  const demoTotalInterestEarned = 1425000; // $1.425M earned

  // Use demo values if no real data
  const displayWalletBalance = walletBalance > 0 ? walletBalance : demoWalletBalance;
  const displayPortfolioValue = portfolioValue > 0 ? portfolioValue : demoPortfolioValue;
  const displayDebtInvested = totalDebtInvested > 0 ? totalDebtInvested : demoDebtInvested;
  const displayActiveBetsValue = activeBetsValue > 0 ? activeBetsValue : demoActiveBetsValue;
  const displayMonthlyIncome = monthlyIncome > 0 ? monthlyIncome : demoMonthlyIncome;
  const displayTotalInterestEarned = totalInterestEarned > 0 ? totalInterestEarned : demoTotalInterestEarned;

  const totalBalance = displayWalletBalance + displayPortfolioValue + displayActiveBetsValue + displayDebtInvested;
  const activeBets = bets.filter(b => b.status === "active");
  const activeDebtInvestments = debtInvestments.filter(inv => inv.status === "active");

  // Days until next payment
  const daysUntilPayment = nextPaymentDate 
    ? Math.max(0, Math.ceil((nextPaymentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 12; // Default 12 days for demo

  // Demo equity holdings for display
  const demoEquityHoldings = [
    { type: "property" as const, name: "Manhattan Tower Portfolio", amount: "2,450,000 tokens", value: 34250000, change: 8.4, propertyId: "demo-1" },
    { type: "property" as const, name: "Miami Beach Resort Collection", amount: "1,850,000 tokens", value: 27750000, change: 12.1, propertyId: "demo-2" },
    { type: "property" as const, name: "San Francisco Tech Campus", amount: "1,200,000 tokens", value: 21600000, change: 5.7, propertyId: "demo-3" },
    { type: "property" as const, name: "Chicago Loop Commercial", amount: "750,000 tokens", value: 9750000, change: -2.3, propertyId: "demo-4" },
    { type: "property" as const, name: "Austin Mixed-Use Development", amount: "425,000 tokens", value: 5400000, change: 15.8, propertyId: "demo-5" },
  ];

  // Build holdings display - Equity (Properties)
  const realEquityHoldings = holdings.map(h => ({
    type: "property" as const,
    name: h.property?.name || "Property",
    amount: `${h.tokens.toLocaleString()} tokens`,
    value: h.tokens * (h.property?.token_price || 0),
    change: h.property?.token_price 
      ? ((h.property.token_price - h.average_buy_price) / h.average_buy_price) * 100 
      : 0,
    propertyId: h.property_id,
  }));

  const equityHoldings = realEquityHoldings.length > 0 ? realEquityHoldings : demoEquityHoldings;

  // Demo prediction holdings
  const demoPredictionHoldings = [
    { type: "prediction" as const, name: "BULL - Fed Rate Decision Q1", amount: "125,000.00 shares", value: 3125000, change: 4.2 },
    { type: "prediction" as const, name: "BEAR - Tech Sector Correction", amount: "85,000.00 shares", value: 2125000, change: -1.8 },
    { type: "prediction" as const, name: "BULL - Real Estate Market Rally", amount: "92,289.15 shares", value: 2307230.88, change: 7.5 },
  ];

  // Active predictions
  const realPredictionHoldings = activeBets.map(b => ({
    type: "prediction" as const,
    name: `${b.position} - ${b.market?.title || "Market"}`,
    amount: `${b.shares.toFixed(2)} shares`,
    value: b.amount,
    change: 0,
  }));

  const predictionHoldings = realPredictionHoldings.length > 0 ? realPredictionHoldings : demoPredictionHoldings;

  // Demo debt investments
  const demoDebtInvestments = [
    { id: "demo-debt-1", loan: { name: "Luxury Condo Development Loan", apy: 11.5 }, principal_invested: 12500000, expected_monthly_payment: 119792, total_interest_earned: 718750, next_payment_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), status: "active", loan_id: "demo-loan-1" },
    { id: "demo-debt-2", loan: { name: "Commercial Office Refinance", apy: 9.75 }, principal_invested: 8500000, expected_monthly_payment: 69063, total_interest_earned: 414375, next_payment_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(), status: "active", loan_id: "demo-loan-2" },
    { id: "demo-debt-3", loan: { name: "Multi-Family Acquisition Bridge", apy: 12.25 }, principal_invested: 7500000, expected_monthly_payment: 76563, total_interest_earned: 291875, next_payment_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), status: "active", loan_id: "demo-loan-3" },
  ];

  const displayDebtInvestments = debtInvestments.length > 0 ? debtInvestments : demoDebtInvestments;
  const displayActiveDebtInvestments = displayDebtInvestments.filter((inv: any) => inv.status === "active");

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <h1 className="font-display text-2xl font-bold text-foreground">{t('wallet.title')}</h1>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Balance Card */}
        <FlashBorder flash={walletFlash || portfolioFlash} direction={flashDirection} className="rounded-2xl">
          <div className="glass-card rounded-2xl p-6 animate-fade-in">
            <p className="text-muted-foreground text-sm mb-1">{t('wallet.totalBalance')}</p>
            <h2 className="font-display text-4xl font-bold text-foreground mb-2">
              {loading ? (
                <span className="animate-pulse">{t('common.loading')}</span>
              ) : (
                <>$<CountUp end={totalBalance} decimals={2} duration={1500} /></>
              )}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-6">
              <span>{t('wallet.cash')}: ${displayWalletBalance.toLocaleString()}</span>
              <span>•</span>
              <span>{t('wallet.equity')}: ${displayPortfolioValue.toLocaleString()}</span>
              <span>•</span>
              <span>{t('wallet.debt')}: ${displayDebtInvested.toLocaleString()}</span>
              <span>•</span>
              <span>{t('wallet.predictions')}: ${displayActiveBetsValue.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-success/20 hover:bg-success/30 transition-colors">
                <div className="p-2 rounded-full bg-success/30">
                  <ArrowDownLeft className="w-5 h-5 text-success" />
                </div>
                <span className="text-xs font-medium text-success">{t('wallet.deposit')}</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/20 hover:bg-primary/30 transition-colors">
                <div className="p-2 rounded-full bg-primary/30">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-primary">{t('wallet.withdraw')}</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="p-2 rounded-full bg-accent/30">
                  <RefreshCw className="w-5 h-5 text-accent" />
                </div>
                <span className="text-xs font-medium text-accent">{t('wallet.swap')}</span>
              </button>
            </div>
          </div>
        </FlashBorder>

        {/* Cash Balance */}
        <section className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/20">
                <WalletIcon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{t('wallet.cashBalance')}</p>
                <p className="text-xs text-muted-foreground">{t('wallet.usdc')}</p>
              </div>
            </div>
            <p className="font-semibold text-foreground">
              ${displayWalletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </section>

        {/* Equity Holdings (Properties) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">{t('wallet.equityHoldings')}</h2>
            <span className="ml-auto text-sm text-muted-foreground">${displayPortfolioValue.toLocaleString()}</span>
          </div>
          <div className="space-y-3">
            {equityHoldings.length > 0 ? (
              equityHoldings.map((holding, index) => (
                <Link
                  key={index}
                  to={`/property/${holding.propertyId}`}
                  className="glass-card rounded-xl p-4 animate-fade-in hover:border-primary/30 transition-all block"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/20">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{holding.name}</p>
                        <p className="text-xs text-muted-foreground">{holding.amount}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <div className="flex items-center justify-end gap-1">
                        {holding.change >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-success" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-destructive" />
                        )}
                        <span className={`text-xs font-medium ${
                          holding.change >= 0 ? "text-success" : "text-destructive"
                        }`}>
                          {holding.change >= 0 ? "+" : ""}{holding.change.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-sm mb-2">{t('wallet.noPropertyTokens')}</p>
                <Link to="/explore" className="text-primary text-sm font-medium hover:underline">
                  {t('wallet.exploreProperties')} →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Debt Investments */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="w-5 h-5 text-amber-500" />
            <h2 className="font-display text-lg font-bold text-foreground">{t('wallet.debtInvestments')}</h2>
            <span className="ml-auto text-sm text-muted-foreground">${displayDebtInvested.toLocaleString()}</span>
          </div>

          {/* Debt Stats Summary */}
          {displayActiveDebtInvestments.length > 0 && (
            <div className="glass-card rounded-xl p-4 mb-4 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-amber-500/20">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">{t('wallet.monthlyIncome')}</p>
                  <p className="font-bold text-amber-500">${displayMonthlyIncome.toLocaleString()}/mo</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('wallet.totalInterestEarned')}</p>
                  <p className="font-bold text-success">${displayTotalInterestEarned.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('wallet.activeInvestments')}</p>
                  <p className="font-bold text-foreground">{displayActiveDebtInvestments.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('wallet.nextPayment')}</p>
                  <p className="font-bold text-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {daysUntilPayment} days
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSimulatePayments}
                disabled={simulatingPayment || activeDebtInvestments.length === 0}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                size="sm"
              >
                <Zap className="w-4 h-4 mr-2" />
                {simulatingPayment ? "Processing..." : "⚡ Simulate Monthly Payment"}
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {displayDebtInvestments.length > 0 ? (
              displayDebtInvestments.map((inv: any, index: number) => {
                const loan = inv.loan;
                const paymentsReceived = inv.total_interest_earned > 0 
                  ? Math.round(inv.total_interest_earned / inv.expected_monthly_payment)
                  : 0;

                return (
                  <div
                    key={inv.id}
                    className="glass-card rounded-xl p-4 animate-fade-in border-amber-500/10"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/20">
                          <Landmark className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{loan?.name || "Loan Investment"}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {inv.status === "active" ? (
                              <span className="flex items-center gap-1 text-xs text-success">
                                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <CheckCircle2 className="w-3 h-3" />
                                Paid Off
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground text-xs">Principal</p>
                        <p className="font-semibold">${inv.principal_invested.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">APY</p>
                        <p className="font-semibold text-amber-500">{loan?.apy || 0}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Monthly Payment</p>
                        <p className="font-semibold text-success">+${inv.expected_monthly_payment.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Next Payment</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {inv.next_payment_date 
                            ? new Date(inv.next_payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : "—"
                          }
                        </p>
                      </div>
                    </div>

                    {/* Interest Earned Box */}
                    <div className="bg-success/10 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-success/80">Interest Earned</p>
                          <p className="font-bold text-success">${inv.total_interest_earned.toFixed(2)}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          ({paymentsReceived} payment{paymentsReceived !== 1 ? 's' : ''} received)
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        to={`/loan/${inv.loan_id}`}
                        className="flex-1 text-center py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted text-sm font-medium transition-colors"
                      >
                        View Details
                      </Link>
                      {inv.status === "active" && (
                        <Button
                          onClick={() => handleSimulatePayoff(inv.id)}
                          disabled={simulatingPayoff}
                          variant="outline"
                          size="sm"
                          className="text-xs border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Simulate Payoff
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-sm mb-2">No debt investments yet</p>
                <Link to="/explore" className="text-amber-500 text-sm font-medium hover:underline">
                  Browse Loans →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Prediction Positions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-success" />
            <h2 className="font-display text-lg font-bold text-foreground">{t('wallet.predictionPositions')}</h2>
            <span className="ml-auto text-sm text-muted-foreground">${displayActiveBetsValue.toLocaleString()}</span>
          </div>
          <div className="space-y-3">
            {predictionHoldings.length > 0 ? (
              predictionHoldings.map((holding, index) => (
                <div
                  key={index}
                  className="glass-card rounded-xl p-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-success/20">
                        <Target className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{holding.name}</p>
                        <p className="text-xs text-muted-foreground">{holding.amount}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-foreground">
                      ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-sm mb-2">{t('wallet.noActivePredictions')}</p>
                <Link to="/predict" className="text-success text-sm font-medium hover:underline">
                  {t('common.browseMarkets')} →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-4">{t('wallet.recentTransactions')}</h2>
          <div className="space-y-3">
            {transactions.slice(0, 10).map((tx, index) => {
              const isPositive = tx.amount > 0;
              const isNew = newTransactions.includes(tx.id);
              return (
                <div
                  key={tx.id}
                  className={`glass-card rounded-xl p-4 animate-fade-in transition-all ${
                    isNew ? "ring-2 ring-primary/50 animate-slide-in-right" : ""
                  }`}
                  style={{ animationDelay: isNew ? "0s" : `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        isPositive ? "bg-success/20" : "bg-destructive/20"
                      }`}>
                        {isPositive ? (
                          <ArrowDownLeft className="w-4 h-4 text-success" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{tx.description || tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      isPositive ? "text-success" : "text-destructive"
                    }`}>
                      {isPositive ? "+" : ""}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-muted-foreground">{t('common.noTransactionsYet')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Linked Bank Accounts Section */}
        <section className="space-y-4">
          <LinkedAccountsSection />
        </section>

        {/* Transfer History Section */}
        <section className="space-y-4">
          <TransferHistory />
        </section>
      </main>
    </div>
  );
}
