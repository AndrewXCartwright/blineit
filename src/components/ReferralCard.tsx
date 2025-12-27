import { useState } from "react";
import { Users, Copy, Share2, Gift, UserPlus, CheckCircle, Send } from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CountUp } from "@/components/CountUp";

export function ReferralCard() {
  const { referralCode, stats, copyReferralLink, shareReferral, inviteFriend, getReferralLink } = useReferrals();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) return;
    
    setSending(true);
    await inviteFriend(email.trim());
    setEmail("");
    setSending(false);
  };

  const potentialEarnings = stats.qualified * 50;

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl gradient-gold glow-gold">
          <Gift className="w-6 h-6 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg text-foreground">Invite Friends</h3>
          <p className="text-sm text-muted-foreground">
            Earn <span className="text-success font-semibold">$50</span> when they invest $500+
          </p>
        </div>
      </div>

      {/* Referral Code */}
      <div className="bg-secondary/50 rounded-xl p-4">
        <p className="text-xs text-muted-foreground mb-2">Your referral code</p>
        <div className="flex items-center gap-3">
          <code className="flex-1 font-mono text-lg font-bold text-primary tracking-wider">
            {referralCode || "Loading..."}
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={copyReferralLink}
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Link
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-secondary/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <UserPlus className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="font-display font-bold text-lg text-foreground">
            <CountUp end={stats.invited} />
          </p>
          <p className="text-xs text-muted-foreground">Invited</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-secondary/30">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <p className="font-display font-bold text-lg text-foreground">
            <CountUp end={stats.signedUp} />
          </p>
          <p className="text-xs text-muted-foreground">Signed Up</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-success/10">
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle className="w-4 h-4 text-success" />
          </div>
          <p className="font-display font-bold text-lg text-success">
            <CountUp end={stats.qualified} />
          </p>
          <p className="text-xs text-muted-foreground">Qualified</p>
        </div>
      </div>

      {/* Earnings */}
      {stats.qualified > 0 && (
        <div className="bg-success/10 rounded-xl p-4 text-center">
          <p className="text-sm text-success mb-1">Total Earnings</p>
          <p className="font-display text-2xl font-bold text-success">
            $<CountUp end={potentialEarnings} />
          </p>
        </div>
      )}

      {/* Invite by Email */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Invite by email</p>
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="friend@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            className="flex-1"
          />
          <Button
            onClick={handleInvite}
            disabled={!email.trim() || sending}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Share Button */}
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={shareReferral}
      >
        <Share2 className="w-4 h-4" />
        Share Referral Link
      </Button>
    </div>
  );
}
