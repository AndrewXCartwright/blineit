import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Bell, Share2, Check, Users, Sparkles,
  TrendingUp, Shield, Clock, Zap, Twitter, Linkedin, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useWaitlist, AssetClass } from "@/hooks/useWaitlist";
import { Confetti } from "@/components/Confetti";
import { CountUp } from "@/components/CountUp";

interface AssetClassConfig {
  id: AssetClass;
  name: string;
  icon: string;
  launchDate: string;
  color: string;
  gradient: string;
  items: string[];
  benefits: { icon: React.ReactNode; text: string }[];
  sneakPeek: { name: string; value: string; unit: string; icon: string }[];
}

const assetClassConfigs: Record<AssetClass, AssetClassConfig> = {
  gold_commodities: {
    id: "gold_commodities",
    name: "Gold & Crypto",
    icon: "🥇",
    launchDate: "Q3 2025",
    color: "amber",
    gradient: "from-amber-500 to-yellow-400",
    items: [
      "Gold & Silver bullion",
      "Oil & Natural Gas",
      "Agricultural commodities",
      "Precious metals ETFs",
    ],
    benefits: [
      { icon: <Shield className="w-4 h-4" />, text: "Inflation hedge" },
      { icon: <TrendingUp className="w-4 h-4" />, text: "Portfolio diversification" },
      { icon: <Sparkles className="w-4 h-4" />, text: "Tangible asset backing" },
      { icon: <Clock className="w-4 h-4" />, text: "24/7 trading" },
    ],
    sneakPeek: [
      { name: "Gold", value: "2,045", unit: "/oz", icon: "🥇" },
      { name: "Crude Oil", value: "78.50", unit: "/bbl", icon: "🛢️" },
      { name: "Silver", value: "24.30", unit: "/oz", icon: "🥈" },
      { name: "Natural Gas", value: "2.85", unit: "/MMBtu", icon: "⛽" },
    ],
  },
  private_business: {
    id: "private_business",
    name: "Private Business",
    icon: "🏭",
    launchDate: "Q1 2026",
    color: "blue",
    gradient: "from-blue-500 to-indigo-500",
    items: [
      "Car washes",
      "Laundromats",
      "Storage facilities",
      "Franchises",
      "E-commerce brands",
    ],
    benefits: [
      { icon: <Zap className="w-4 h-4" />, text: "Cash-flowing businesses" },
      { icon: <TrendingUp className="w-4 h-4" />, text: "Diversified revenue" },
      { icon: <Shield className="w-4 h-4" />, text: "Hands-off ownership" },
      { icon: <Clock className="w-4 h-4" />, text: "Monthly distributions" },
    ],
    sneakPeek: [
      { name: "Car Wash", value: "15K", unit: "/mo revenue", icon: "🚗" },
      { name: "Laundromat", value: "8.2K", unit: "/mo revenue", icon: "🧺" },
      { name: "Storage", value: "22K", unit: "/mo revenue", icon: "📦" },
      { name: "Franchise", value: "45K", unit: "/mo revenue", icon: "🍔" },
    ],
  },
  startups_vc: {
    id: "startups_vc",
    name: "Startups",
    icon: "🚀",
    launchDate: "Q3 2026",
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
    items: [
      "Pre-seed rounds",
      "Seed stage",
      "Series A",
      "Growth stage",
    ],
    benefits: [
      { icon: <Sparkles className="w-4 h-4" />, text: "Early access to unicorns" },
      { icon: <TrendingUp className="w-4 h-4" />, text: "Diversified startup portfolio" },
      { icon: <Zap className="w-4 h-4" />, text: "Secondary liquidity" },
      { icon: <Shield className="w-4 h-4" />, text: "Expert curation" },
    ],
    sneakPeek: [
      { name: "AI Startup", value: "10M", unit: "valuation", icon: "🤖" },
      { name: "FinTech", value: "25M", unit: "valuation", icon: "💳" },
      { name: "HealthTech", value: "15M", unit: "valuation", icon: "🏥" },
      { name: "CleanTech", value: "8M", unit: "valuation", icon: "🌱" },
    ],
  },
};

export default function ComingSoon() {
  const { assetClass } = useParams<{ assetClass: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const config = assetClassConfigs[assetClass as AssetClass];
  
  const {
    loading,
    isOnWaitlist,
    position,
    totalCount,
    checkingStatus,
    joinWaitlist,
    shareWaitlist,
    getShareUrl,
  } = useWaitlist(assetClass as AssetClass);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Asset class not found</p>
          <Button onClick={() => navigate("/assets")}>Back to Assets</Button>
        </div>
      </div>
    );
  }

  const handleJoinWaitlist = async () => {
    const result = await joinWaitlist(email);
    if (result.success) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(getShareUrl());
  };

  const colorClasses = {
    amber: {
      bg: "bg-amber-500/20",
      text: "text-amber-500",
      border: "border-amber-500/30",
      button: "bg-amber-500 hover:bg-amber-600",
      glow: "shadow-amber-500/30",
    },
    blue: {
      bg: "bg-blue-500/20",
      text: "text-blue-500",
      border: "border-blue-500/30",
      button: "bg-blue-500 hover:bg-blue-600",
      glow: "shadow-blue-500/30",
    },
    purple: {
      bg: "bg-purple-500/20",
      text: "text-purple-500",
      border: "border-purple-500/30",
      button: "bg-purple-500 hover:bg-purple-600",
      glow: "shadow-purple-500/30",
    },
  };

  const colors = colorClasses[config.color as keyof typeof colorClasses];

  return (
    <div className="min-h-screen pb-24">
      {showConfetti && <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />}
      
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg font-bold">Coming Soon</h1>
        </div>
      </header>

      <main className="px-4 py-8 space-y-6 max-w-lg mx-auto">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className={`w-24 h-24 mx-auto rounded-3xl ${colors.bg} flex items-center justify-center shadow-lg ${colors.glow}`}>
            <span className="text-5xl">{config.icon}</span>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              {config.name}
            </h2>
            <p className={`text-lg font-medium ${colors.text}`}>
              Coming {config.launchDate}
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* What's Included */}
        <div className="space-y-3">
          <p className="text-muted-foreground text-center">Invest in tokenized:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {config.items.map((item, index) => (
              <span
                key={index}
                className={`px-3 py-1.5 rounded-full ${colors.bg} ${colors.text} text-sm font-medium`}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Benefits Card */}
        <div className={`glass-card rounded-2xl p-5 border ${colors.border}`}>
          <h3 className="font-display font-semibold text-foreground mb-4">
            WHY {config.name.toUpperCase()}?
          </h3>
          <div className="space-y-3">
            {config.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                  {benefit.icon}
                </div>
                <span className="text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Waitlist Form */}
        <div className={`glass-card rounded-2xl p-5 border-2 ${colors.border}`}>
          <div className="flex items-center gap-2 mb-4">
            <Bell className={`w-5 h-5 ${colors.text}`} />
            <h3 className="font-display font-semibold text-foreground">
              {isOnWaitlist ? "You're on the list!" : "Get Notified"}
            </h3>
          </div>

          {checkingStatus ? (
            <div className="py-8 text-center">
              <div className="w-8 h-8 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : isOnWaitlist ? (
            <div className="space-y-4">
              <div className={`flex items-center gap-3 p-4 rounded-xl ${colors.bg}`}>
                <div className={`p-2 rounded-full bg-success/20`}>
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">You're waitlisted!</p>
                  {position && (
                    <p className="text-sm text-muted-foreground">
                      You're #{position.toLocaleString()} on the list
                    </p>
                  )}
                </div>
              </div>
              <Button
                onClick={shareWaitlist}
                variant="outline"
                className={`w-full ${colors.border}`}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share & Move Up the List
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-center"
              />
              <Button
                onClick={handleJoinWaitlist}
                disabled={loading || !email}
                className={`w-full ${colors.button} text-white font-display font-bold`}
              >
                {loading ? "Joining..." : "Join Waitlist"}
              </Button>
            </div>
          )}
        </div>

        {/* Waitlist Count */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">
              <CountUp end={totalCount} duration={1000} /> people on waitlist
            </span>
          </div>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Sneak Peek */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-foreground text-center">
            SNEAK PEEK
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {config.sneakPeek.map((item, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-4 text-center"
              >
                <span className="text-2xl mb-2 block">{item.icon}</span>
                <p className="text-sm text-muted-foreground mb-1">{item.name}</p>
                <p className="font-display font-bold text-foreground">
                  ${item.value}
                </p>
                <p className="text-xs text-muted-foreground">{item.unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Share Options */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-display font-semibold text-foreground mb-4 text-center">
            Share with Friends
          </h3>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=Check out this upcoming investment opportunity!&url=${encodeURIComponent(getShareUrl())}`, "_blank")}
            >
              <Twitter className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl())}`, "_blank")}
            >
              <Linkedin className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={copyShareLink}
            >
              <Copy className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
