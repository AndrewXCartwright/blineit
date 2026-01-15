import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Coins, Bell, Check, Sparkles, Shield, TrendingUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useWaitlist } from "@/hooks/useWaitlist";
import { Confetti } from "@/components/Confetti";

const categories = [
  { name: "Gold", emoji: "🥇" },
  { name: "Silver", emoji: "🥈" },
  { name: "Bitcoin", emoji: "₿" },
  { name: "Ethereum", emoji: "⟠" },
  { name: "Oil", emoji: "🛢️" },
  { name: "Agriculture", emoji: "🌾" },
];

const benefits = [
  {
    icon: Shield,
    title: "Hedge Against Inflation",
    description: "Precious metals and commodities historically preserve value during inflationary periods"
  },
  {
    icon: TrendingUp,
    title: "Portfolio Diversification",
    description: "Alternative assets with low correlation to traditional stocks and bonds"
  },
  {
    icon: Globe,
    title: "Global Market Access",
    description: "Invest in commodities from markets around the world with fractional ownership"
  },
  {
    icon: Sparkles,
    title: "Tokenized Ownership",
    description: "Blockchain-verified ownership of real assets with instant liquidity"
  }
];

export default function CommoditiesComingSoon() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinWaitlist, isOnWaitlist, loading } = useWaitlist("gold_commodities");
  const [email, setEmail] = useState(user?.email || "");
  const [showConfetti, setShowConfetti] = useState(false);
  const [justJoined, setJustJoined] = useState(false);

  const handleJoinWaitlist = async () => {
    const success = await joinWaitlist(email);
    if (success) {
      setShowConfetti(true);
      setJustJoined(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold text-foreground">Gold & Crypto</h1>
            <p className="text-xs text-muted-foreground">Coming Q2 2026</p>
          </div>
          <div className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
            <Coins className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
            <Coins className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-medium text-amber-500">Coming Soon</span>
          </div>
          
          <h2 className="text-2xl font-display font-bold">
            Invest in Tokenized Precious Metals & Crypto
          </h2>
          
          <p className="text-muted-foreground">
            Access alternative assets with fractional ownership. Diversify your portfolio with gold, silver, and cryptocurrencies.
          </p>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Badge 
              key={category.name}
              variant="outline" 
              className="px-4 py-2 text-sm bg-card/50 border-border/50"
            >
              <span className="mr-2">{category.emoji}</span>
              {category.name}
            </Badge>
          ))}
        </div>

        {/* Why Alternative Assets Card */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Why Alternative Assets?
            </h3>
            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 h-fit">
                    <benefit.icon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{benefit.title}</h4>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Waitlist Form */}
        <Card className="border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="text-lg font-semibold">Get Early Access</h3>
              <p className="text-sm text-muted-foreground">
                Be the first to know when gold & crypto investing launches
              </p>
            </div>

            {isOnWaitlist || justJoined ? (
              <div className="flex items-center justify-center gap-2 py-4 text-green-500">
                <Check className="w-5 h-5" />
                <span className="font-medium">You're on the waitlist!</span>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background"
                />
                <Button 
                  className="w-full gradient-primary"
                  onClick={handleJoinWaitlist}
                  disabled={loading || !email}
                >
                  {loading ? "Joining..." : "Get Notified"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What's Coming */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">What's Coming</h3>
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
              <span className="text-2xl">🥇</span>
              <div>
                <h4 className="font-medium">Tokenized Gold & Silver</h4>
                <p className="text-xs text-muted-foreground">Fractional ownership of physical precious metals</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
              <span className="text-2xl">₿</span>
              <div>
                <h4 className="font-medium">Crypto Baskets</h4>
                <p className="text-xs text-muted-foreground">Diversified cryptocurrency portfolios</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50">
              <span className="text-2xl">🛢️</span>
              <div>
                <h4 className="font-medium">Commodity Funds</h4>
                <p className="text-xs text-muted-foreground">Oil, agriculture, and natural resources</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
