import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Trophy, Target, Building2, Wallet, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { useKYC } from "@/hooks/useKYC";
import { useNavigate, Link } from "react-router-dom";
import { CountUp } from "@/components/CountUp";
import { EmptyState } from "@/components/EmptyState";
import { ReferralCard } from "@/components/ReferralCard";
import { KYCStatusBadge } from "@/components/KYCStatusBadge";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: Settings, label: "Account Settings", action: () => {} },
  { icon: Bell, label: "Notifications", action: () => {} },
  { icon: Shield, label: "Security", action: () => {} },
  { icon: HelpCircle, label: "Help & Support", action: () => {} },
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const { profile, holdings, bets, loading } = useUserData();
  const { kycStatus, isVerified } = useKYC();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  // Calculate stats
  const totalBets = bets.length;
  const wonBets = bets.filter(b => b.status === "won").length;
  const winRate = totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 0;

  if (!user) {
    return (
      <div className="min-h-screen pb-24 flex items-center justify-center px-4">
        <EmptyState
          icon={<User className="w-12 h-12" />}
          title="Sign in to view your profile"
          description="Track your investments and manage your account"
          actionLabel="Sign In"
          actionLink="/auth"
        />
      </div>
    );
  }

  const displayName = profile?.display_name || profile?.name || user.email?.split("@")[0] || "User";
  const email = profile?.email || user.email || "";

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-6 text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-primary glow-primary flex items-center justify-center">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={displayName} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-1">
            {displayName}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            {email}
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <KYCStatusBadge status={kycStatus} />
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full gradient-gold text-accent-foreground text-sm font-medium">
              <Wallet className="w-4 h-4" />
              $<CountUp end={profile?.wallet_balance || 0} decimals={0} />
            </span>
            {holdings.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                <Trophy className="w-4 h-4" />
                Investor
              </span>
            )}
          </div>
        </div>

        {/* KYC Verification Prompt */}
        {!isVerified && kycStatus !== "in_review" && (
          <div className="glass-card rounded-2xl p-5 animate-fade-in border border-warning/30 bg-warning/5">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-warning/20">
                <AlertCircle className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-foreground mb-1">Complete Verification</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Verify your identity to unlock full access to investing and higher limits.
                </p>
                <Button onClick={() => navigate("/kyc")} size="sm" className="gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Start Verification
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-4 text-center animate-fade-in stagger-1">
            <Building2 className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-display font-bold text-lg text-foreground">
              <CountUp end={holdings.length} />
            </p>
            <p className="text-xs text-muted-foreground">Properties</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center animate-fade-in stagger-2">
            <Target className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-display font-bold text-lg text-foreground">
              <CountUp end={totalBets} />
            </p>
            <p className="text-xs text-muted-foreground">Total Bets</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center animate-fade-in stagger-3">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-display font-bold text-lg text-foreground">
              <CountUp end={winRate} />%
            </p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
        </div>

        {/* Referral Section */}
        <ReferralCard />

        {/* Quick Links */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in stagger-4">
          <Link
            to="/wallet"
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">View Wallet</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link
            to="/explore"
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-success/20">
                <Building2 className="w-5 h-5 text-success" />
              </div>
              <span className="font-medium text-foreground">Explore Properties</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link
            to="/predict"
            className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent/20">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <span className="font-medium text-foreground">Prediction Markets</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>

        {/* Menu */}
        <div className="glass-card rounded-2xl overflow-hidden animate-fade-in stagger-5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-b-0 interactive-card"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-secondary">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button 
          onClick={handleSignOut}
          className="w-full glass-card rounded-xl p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors animate-fade-in stagger-6 interactive-card"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </main>
    </div>
  );
}
