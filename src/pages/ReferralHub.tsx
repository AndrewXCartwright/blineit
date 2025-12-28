import { useState } from "react";
import { ArrowLeft, Gift, Trophy, Target, BarChart3, Medal, Copy, Share2, QrCode, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/BottomNav";
import { useUserReferralStats, useActiveContests } from "@/hooks/useReferralProgram";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ReferralHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserData();
  const { data: stats, isLoading } = useUserReferralStats();
  const { data: contests } = useActiveContests();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const referralCode = profile?.referral_code || "LOADING";
  const referralLink = `${window.location.origin}/r/${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: "Link copied!", description: "Share it with your friends." });
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join B-LINE-IT",
          text: "I've been investing in real estate on B-LINE-IT. Join with my link and we both get bonuses!",
          url: referralLink,
        });
      } catch (err) {
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const tierProgress = stats?.next_tier
    ? ((stats.current_tier?.min_referrals || 0) + (stats.qualified_referrals - (stats.current_tier?.min_referrals || 0))) /
      stats.next_tier.min_referrals *
      100
    : 100;

  const activeContest = contests?.find((c) => c.status === "active");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background p-4 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Referral Center
            </h1>
            <p className="text-sm text-muted-foreground">Invite friends and earn rewards together!</p>
          </div>
        </div>

        {/* Current Tier Card */}
        {stats?.current_tier && (
          <Card className="border-primary/20 bg-card/80 backdrop-blur">
            <CardContent className="p-4">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{stats.current_tier.badge_icon}</div>
                <h2 className="text-lg font-bold">{stats.current_tier.tier_name.toUpperCase()}</h2>
                <p className="text-sm text-muted-foreground">AMBASSADOR</p>
                <p className="text-sm mt-2">
                  {(stats.current_tier.commission_rate * 100).toFixed(0)}% commission • ${stats.current_tier.bonus_per_referral} per referral
                </p>
              </div>

              {stats.next_tier && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress to {stats.next_tier.tier_name}</span>
                    <span>{stats.qualified_referrals}/{stats.next_tier.min_referrals} referrals</span>
                  </div>
                  <Progress value={tierProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.referrals_to_next_tier} more referrals to unlock:
                  </p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    <li>• {(stats.next_tier.commission_rate * 100).toFixed(0)}% commission rate</li>
                    <li>• ${stats.next_tier.bonus_per_referral} per referral bonus</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">{stats?.total_referrals || 0}</p>
              <p className="text-xs text-muted-foreground">Total Referrals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${(stats?.total_invested_by_referrals || 0).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Friends Invested</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">${(stats?.commission_earned || 0).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Commission</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold">#{stats?.current_rank || "-"}</p>
              <p className="text-xs text-muted-foreground">Rank</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">Your Referral Link</h3>
            <div className="bg-muted rounded-lg p-3 mb-3">
              <p className="text-sm font-mono truncate">{referralLink}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={copyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" className="flex-1" onClick={shareLink}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={() => setShowQRModal(true)}>
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Contest Banner */}
        {activeContest && (
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">🎉 ACTIVE CONTEST</p>
                  <h3 className="font-bold">{activeContest.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Prize Pool: ${activeContest.prize_pool.toLocaleString()}
                  </p>
                </div>
                <Button size="sm" onClick={() => navigate("/referrals/contest")}>
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-1"
            onClick={() => navigate("/referrals/leaderboard")}
          >
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium">Leaderboard</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-1"
            onClick={() => navigate("/referrals/stats")}
          >
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">My Stats</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-1"
            onClick={() => navigate("/referrals/milestones")}
          >
            <Target className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Milestones</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-1"
            onClick={() => navigate("/referrals/tiers")}
          >
            <Medal className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium">Tiers</span>
          </Button>
        </div>
      </div>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Referral Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm font-mono break-all">{referralLink}</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["Email", "SMS", "Twitter", "Facebook"].map((platform) => (
                <Button key={platform} variant="outline" className="flex flex-col h-auto py-3">
                  <span className="text-lg mb-1">
                    {platform === "Email" ? "📧" : platform === "SMS" ? "💬" : platform === "Twitter" ? "🐦" : "📘"}
                  </span>
                  <span className="text-xs">{platform}</span>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Referral QR Code</DialogTitle>
          </DialogHeader>
          <div className="text-center">
            <div className="bg-white p-4 rounded-lg inline-block">
              <div className="w-48 h-48 bg-muted flex items-center justify-center">
                <QrCode className="h-32 w-32 text-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">@{referralCode}</p>
            <p className="text-xs text-muted-foreground mt-1">Perfect for in-person sharing!</p>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default ReferralHub;
