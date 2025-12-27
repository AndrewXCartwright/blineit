import { useState } from "react";
import { 
  Gift, Copy, Share2, Users, CheckCircle, UserPlus, 
  DollarSign, Twitter, Linkedin, Send, Trophy,
  ChevronRight, Clock, Mail
} from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountUp } from "@/components/CountUp";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { format } from "date-fns";

export default function Referrals() {
  const { 
    referrals, 
    referralCode, 
    stats, 
    loading, 
    getReferralLink, 
    copyReferralLink, 
    inviteFriend 
  } = useReferrals();
  
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    await inviteFriend(email.trim());
    setEmail("");
    setSending(false);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `I'm investing in tokenized real estate on @BLineIT! Join me and get $50 when you invest. 🏠💰`
    );
    const url = encodeURIComponent(getReferralLink());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(getReferralLink());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(
      `Join me on B-LINE-IT! Invest in tokenized real estate and get $50 when you invest $500+. ${getReferralLink()}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent("Join me on B-LINE-IT!");
    const body = encodeURIComponent(
      `Hey!\n\nI've been using B-LINE-IT to invest in tokenized real estate, and I think you'd love it too.\n\nSign up with my link and get $50 when you invest $500+:\n${getReferralLink()}\n\nLet me know if you have questions!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const totalEarnings = stats.qualified * 50 + (stats.signedUp - stats.qualified) * 10;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "qualified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Qualified
          </span>
        );
      case "signed_up":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
            <Clock className="w-3 h-3" />
            Signed Up
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            <Mail className="w-3 h-3" />
            Invited
          </span>
        );
    }
  };

  const getRewardAmount = (status: string) => {
    switch (status) {
      case "qualified":
        return "+$50";
      case "signed_up":
        return "+$10";
      default:
        return "-";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl gradient-gold glow-gold">
            <Gift className="w-8 h-8 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Invite Friends, Earn Rewards</h1>
            <p className="text-muted-foreground">Share your link and earn up to $50 per referral</p>
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Your Referral Link</h2>
          <div className="flex items-center gap-2">
            <Input
              value={getReferralLink()}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={copyReferralLink} size="icon" variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Share Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={shareOnTwitter} className="gap-2">
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            <Button variant="outline" size="sm" onClick={shareOnLinkedIn} className="gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Button>
            <Button variant="outline" size="sm" onClick={shareOnWhatsApp} className="gap-2">
              <Send className="w-4 h-4" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={shareByEmail} className="gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <UserPlus className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">
              <CountUp end={stats.invited} />
            </p>
            <p className="text-xs text-muted-foreground">Invited</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">
              <CountUp end={stats.qualified} />
            </p>
            <p className="text-xs text-muted-foreground">Qualified</p>
          </div>
          <div className="glass-card rounded-xl p-4 text-center bg-success/5">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <p className="font-display text-2xl font-bold text-success">
              $<CountUp end={totalEarnings} />
            </p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            How It Works
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <p className="text-sm text-muted-foreground">Share your link with friends</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <p className="text-sm text-muted-foreground">They sign up and complete KYC <span className="text-success font-medium">(+$10 each)</span></p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <p className="text-sm text-muted-foreground">They invest $500+ <span className="text-success font-medium">(+$50 each!)</span></p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-success">★</span>
              </div>
              <p className="text-sm text-muted-foreground">Bonus tiers: $5K = +$100, $25K = +$250</p>
            </div>
          </div>
        </div>

        {/* Invite by Email */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Invite by Email</h2>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="friend@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              className="flex-1"
            />
            <Button onClick={handleInvite} disabled={!email.trim() || sending} className="gap-2">
              <Send className="w-4 h-4" />
              Invite
            </Button>
          </div>
        </div>

        {/* Referrals List */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground">Your Referrals</h2>
          
          {referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No referrals yet</p>
              <p className="text-sm">Share your link to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div 
                  key={referral.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {referral.referred_email.split('@')[0]}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {format(new Date(referral.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(referral.status)}
                    <p className="text-sm font-semibold text-success mt-1">
                      {getRewardAmount(referral.status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
