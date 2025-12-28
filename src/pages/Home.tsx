import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { PropertyCard } from "@/components/PropertyCard";
import { CountUp } from "@/components/CountUp";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/hooks/useAuth";
import { useKYC } from "@/hooks/useKYC";
import { useRealtimeTransactions, useRealtimeWalletBalance, useRealtimePortfolio } from "@/hooks/useRealtimeSubscriptions";
import { FlashBorder } from "@/components/LiveIndicator";
import { DollarSign, Building2, Target, TrendingUp, ArrowUpRight, ArrowDownRight, Wallet, ShieldAlert, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { kycStatus, isVerified, isPending } = useKYC();
  const { 
    holdings, 
    bets, 
    transactions, 
    loading, 
    portfolioValue, 
    totalEarnings, 
    activeBetsValue,
    bettingWinnings,
    walletBalance,
    refetch 
  } = useUserData();

  const [portfolioFlash, setPortfolioFlash] = useState(false);
  const [walletFlash, setWalletFlash] = useState(false);
  const [flashDirection, setFlashDirection] = useState<"up" | "down">("up");
  const [newTransactions, setNewTransactions] = useState<string[]>([]);

  // Real-time subscriptions
  useRealtimeTransactions(useCallback((tx: any) => {
    setNewTransactions(prev => [tx.id, ...prev]);
    refetch();
    // Clear new transaction highlight after animation
    setTimeout(() => {
      setNewTransactions(prev => prev.filter(id => id !== tx.id));
    }, 2000);
  }, [refetch]));

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

  const activeBets = bets.filter(b => b.status === "active");
  const avgYield = holdings.length > 0 
    ? holdings.reduce((sum, h) => sum + (h.property?.apy || 0), 0) / holdings.length 
    : 0;

  const recentTransactions = transactions.slice(0, 4);

  return (
    <div className="min-h-screen pb-24">
      <Header />
      
      <main className="px-4 py-6 space-y-6">
        {/* KYC Verification Banner */}
        {user && !isVerified && !isPending && (
          <div className="glass-card rounded-2xl p-5 animate-fade-in border border-warning/30 bg-warning/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-warning/20">
                <ShieldAlert className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-foreground mb-1">{t('dashboard.verificationRequired')}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('dashboard.verificationMessage')}
                </p>
                <Link to="/kyc">
                  <Button size="sm" className="gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    {t('dashboard.verifyNow')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Value Card */}
        <FlashBorder flash={portfolioFlash} direction={flashDirection} className="rounded-2xl">
          <div className="gradient-primary rounded-2xl p-6 glow-primary animate-fade-in">
            <p className="text-primary-foreground/80 text-sm mb-1">{t('dashboard.portfolioValue')}</p>
            <h2 className="font-display text-3xl font-bold text-primary-foreground mb-2">
              {loading ? (
                <span className="animate-pulse">{t('common.loading')}</span>
              ) : (
                <>$<CountUp end={portfolioValue + walletBalance} decimals={2} duration={2000} /></>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {totalEarnings >= 0 ? (
                <span className="bg-success/20 text-success px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +${totalEarnings.toFixed(0)} {t('dashboard.gains')}
                </span>
              ) : (
                <span className="bg-destructive/20 text-destructive px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  ${totalEarnings.toFixed(0)}
                </span>
              )}
              <span className="text-primary-foreground/60 text-sm">{t('dashboard.allTime')}</span>
            </div>
          </div>
        </FlashBorder>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="stagger-1 animate-fade-in">
            <FlashBorder flash={walletFlash} direction={flashDirection} className="rounded-2xl h-full">
              <StatCard
                icon={<Wallet className="w-5 h-5" />}
                label={t('dashboard.cashBalance')}
                value={`$${walletBalance.toLocaleString()}`}
                subValue={t('dashboard.available')}
                trend="up"
              />
            </FlashBorder>
          </div>
          <div className="stagger-2 animate-fade-in">
            <StatCard
              icon={<Building2 className="w-5 h-5" />}
              label={t('dashboard.properties')}
              value={holdings.length.toString()}
              subValue={`$${portfolioValue.toLocaleString()} ${t('dashboard.value')}`}
              trend="up"
            />
          </div>
          <div className="stagger-3 animate-fade-in">
            <StatCard
              icon={<Target className="w-5 h-5" />}
              label={t('dashboard.activeBets')}
              value={activeBets.length.toString()}
              subValue={`$${activeBetsValue.toLocaleString()} ${t('dashboard.wagered')}`}
            />
          </div>
          <div className="stagger-4 animate-fade-in">
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label={t('dashboard.avgYield')}
              value={`${avgYield.toFixed(1)}%`}
              subValue={bettingWinnings > 0 ? `+$${bettingWinnings.toFixed(0)} ${t('dashboard.won')}` : t('dashboard.fromProperties')}
              trend="up"
            />
          </div>
        </div>

        {/* Your Properties */}
        <section className="animate-fade-in stagger-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">{t('dashboard.yourProperties')}</h2>
            <Link to="/explore" className="text-sm text-primary hover:text-primary/80 transition-colors btn-interactive">
              {t('dashboard.exploreMore')}
            </Link>
          </div>
          {holdings.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {holdings.map((holding) => (
                <div key={holding.id} className="interactive-card">
                  <PropertyCard
                    name={holding.property?.name || "Property"}
                    location={`${holding.property?.city}, ${holding.property?.state}`}
                    tokens={holding.tokens}
                    yield={holding.property?.apy || 0}
                    value={holding.tokens * (holding.property?.token_price || 0)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-6 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">{t('dashboard.noPropertiesYet')}</p>
              <Link 
                to="/explore" 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground font-semibold pulse-button"
              >
                {t('dashboard.exploreProperties')} →
              </Link>
            </div>
          )}
        </section>

        {/* Recent Activity */}
        <section className="animate-fade-in stagger-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-foreground">{t('dashboard.recentActivity')}</h2>
            <Link to="/wallet" className="text-sm text-primary hover:text-primary/80 transition-colors">
              {t('common.viewAll')}
            </Link>
          </div>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, index) => {
                const isPositive = tx.amount > 0;
                const isNew = newTransactions.includes(tx.id);
                return (
                  <div
                    key={tx.id}
                    className={`glass-card rounded-xl p-4 flex items-center justify-between interactive-card transition-all duration-300 ${
                      isNew ? "animate-slide-in-right ring-2 ring-primary/50" : "animate-fade-in"
                    }`}
                    style={{ animationDelay: isNew ? "0s" : `${(index + 6) * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${
                        isPositive ? "bg-success/20" : "bg-destructive/20"
                      }`}>
                        {isPositive ? (
                          <ArrowUpRight className="w-4 h-4 text-success" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-foreground">{tx.description || tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-semibold text-sm ${
                      isPositive ? "text-success" : "text-destructive"
                    }`}>
                      {isPositive ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-muted-foreground">{t('dashboard.noRecentActivity')}</p>
                {!user && (
                  <Link 
                    to="/auth" 
                    className="text-primary hover:underline mt-2 inline-block"
                  >
                    {t('dashboard.signInToStart')}
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
