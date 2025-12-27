import { useState, useCallback } from "react";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Building2, Coins, Target, TrendingUp, TrendingDown, Wallet as WalletIcon } from "lucide-react";
import { useUserData } from "@/hooks/useUserData";
import { useRealtimeWalletBalance, useRealtimeTransactions, useRealtimePortfolio } from "@/hooks/useRealtimeSubscriptions";
import { FlashBorder } from "@/components/LiveIndicator";
import { CountUp } from "@/components/CountUp";
import { Link } from "react-router-dom";

export default function Wallet() {
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

  const [walletFlash, setWalletFlash] = useState(false);
  const [portfolioFlash, setPortfolioFlash] = useState(false);
  const [flashDirection, setFlashDirection] = useState<"up" | "down">("up");
  const [newTransactions, setNewTransactions] = useState<string[]>([]);

  useRealtimeWalletBalance(useCallback((direction: "up" | "down") => {
    setFlashDirection(direction);
    setWalletFlash(true);
    refetch();
    setTimeout(() => setWalletFlash(false), 1000);
  }, [refetch]));

  useRealtimePortfolio(useCallback((direction: "up" | "down") => {
    setFlashDirection(direction);
    setPortfolioFlash(true);
    refetch();
    setTimeout(() => setPortfolioFlash(false), 1000);
  }, [refetch]));

  useRealtimeTransactions(useCallback((tx: any) => {
    setNewTransactions(prev => [tx.id, ...prev]);
    refetch();
    setTimeout(() => {
      setNewTransactions(prev => prev.filter(id => id !== tx.id));
    }, 2000);
  }, [refetch]));

  const totalBalance = walletBalance + portfolioValue + activeBetsValue;
  const activeBets = bets.filter(b => b.status === "active");

  // Build holdings display
  const displayHoldings = [
    // Cash balance
    {
      type: "cash" as const,
      name: "Cash Balance",
      amount: "USDC",
      value: walletBalance,
      change: 0,
    },
    // Properties
    ...holdings.map(h => ({
      type: "property" as const,
      name: h.property?.name || "Property",
      amount: `${h.tokens.toLocaleString()} tokens`,
      value: h.tokens * (h.property?.token_price || 0),
      change: h.property?.token_price 
        ? ((h.property.token_price - h.average_buy_price) / h.average_buy_price) * 100 
        : 0,
      propertyId: h.property_id,
    })),
    // Active bets
    ...activeBets.map(b => ({
      type: "prediction" as const,
      name: `${b.position} - ${b.market?.title || "Market"}`,
      amount: `${b.shares.toFixed(2)} shares`,
      value: b.amount,
      change: 0,
    })),
  ];

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Wallet</h1>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Balance Card */}
        <FlashBorder flash={walletFlash || portfolioFlash} direction={flashDirection} className="rounded-2xl">
          <div className="glass-card rounded-2xl p-6 animate-fade-in">
            <p className="text-muted-foreground text-sm mb-1">Total Balance</p>
            <h2 className="font-display text-4xl font-bold text-foreground mb-2">
              {loading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <>$<CountUp end={totalBalance} decimals={2} duration={1500} /></>
              )}
            </h2>
            <div className="flex gap-4 text-sm text-muted-foreground mb-6">
              <span>Cash: ${walletBalance.toLocaleString()}</span>
              <span>•</span>
              <span>Invested: ${portfolioValue.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-success/20 hover:bg-success/30 transition-colors">
                <div className="p-2 rounded-full bg-success/30">
                  <ArrowDownLeft className="w-5 h-5 text-success" />
                </div>
                <span className="text-xs font-medium text-success">Deposit</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/20 hover:bg-primary/30 transition-colors">
                <div className="p-2 rounded-full bg-primary/30">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-primary">Withdraw</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-3 rounded-xl bg-accent/20 hover:bg-accent/30 transition-colors">
                <div className="p-2 rounded-full bg-accent/30">
                  <RefreshCw className="w-5 h-5 text-accent" />
                </div>
                <span className="text-xs font-medium text-accent">Swap</span>
              </button>
            </div>
          </div>
        </FlashBorder>

        {/* Holdings */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Holdings</h2>
          <div className="space-y-3">
            {displayHoldings.length > 0 ? (
              displayHoldings.map((holding, index) => (
                <Link
                  key={index}
                  to={holding.type === "property" && (holding as any).propertyId 
                    ? `/property/${(holding as any).propertyId}` 
                    : "#"
                  }
                  className="glass-card rounded-xl p-4 animate-fade-in hover:border-primary/30 transition-all block"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        holding.type === "property" 
                          ? "bg-primary/20" 
                          : holding.type === "cash"
                          ? "bg-accent/20"
                          : "bg-success/20"
                      }`}>
                        {holding.type === "property" ? (
                          <Building2 className="w-5 h-5 text-primary" />
                        ) : holding.type === "cash" ? (
                          <WalletIcon className="w-5 h-5 text-accent" />
                        ) : (
                          <Target className="w-5 h-5 text-success" />
                        )}
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
                      {holding.type === "property" && (
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
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="glass-card rounded-xl p-6 text-center">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-3">No holdings yet</p>
                <Link 
                  to="/explore" 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground font-semibold"
                >
                  Explore Properties →
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <h2 className="font-display text-lg font-bold text-foreground mb-4">Recent Transactions</h2>
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
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
