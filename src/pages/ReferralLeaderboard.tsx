import { useState } from "react";
import { ArrowLeft, Trophy, Medal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from "@/components/BottomNav";
import { useLeaderboard, useActiveContests, useUserReferralStats } from "@/hooks/useReferralProgram";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { CountdownTimer } from "@/components/CountdownTimer";

const ReferralLeaderboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useUserData();
  const [period, setPeriod] = useState<"weekly" | "monthly" | "all_time">("monthly");
  const { data: leaderboard, isLoading } = useLeaderboard(period);
  const { data: contests } = useActiveContests();
  const { data: stats } = useUserReferralStats();

  const activeContest = contests?.find((c) => c.status === "active");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "diamond":
        return "👑";
      case "platinum":
        return "💎";
      case "gold":
        return "🥇";
      case "silver":
        return "🥈";
      default:
        return "🥉";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Referral Leaderboard
            </h1>
          </div>
        </div>

        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">This Week</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="all_time">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4 space-y-4">
        {/* Active Contest Banner */}
        {activeContest && (
          <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">🎉 {activeContest.name}</p>
                <p className="text-lg font-bold mt-1">Prize Pool: ${activeContest.prize_pool.toLocaleString()}</p>
                <div className="flex justify-center gap-4 mt-2 text-sm">
                  <span>🥇 1st: ${activeContest.prizes[0]?.amount}</span>
                  <span>🥈 2nd: ${activeContest.prizes[1]?.amount}</span>
                  <span>🥉 3rd: ${activeContest.prizes[2]?.amount}</span>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">Ends in:</p>
                  <CountdownTimer expiresAt={new Date(activeContest.end_date)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 */}
        {leaderboard && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[1, 0, 2].map((index) => {
              const entry = leaderboard[index];
              if (!entry) return null;
              const isFirst = index === 0;
              return (
                <Card
                  key={entry.id}
                  className={`text-center ${isFirst ? "order-1 scale-105" : index === 1 ? "order-0" : "order-2"}`}
                >
                  <CardContent className="p-3">
                    <div className="text-2xl mb-1">{getRankIcon(entry.rank)}</div>
                    <Avatar className="mx-auto mb-2">
                      <AvatarImage src={entry.profile?.avatar_url} />
                      <AvatarFallback>{entry.profile?.display_name?.[0] || "?"}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-sm truncate">
                      {getTierIcon(entry.profile?.referral_tier || "")} {entry.profile?.display_name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">{entry.referral_count} referrals</p>
                    <p className="text-xs text-muted-foreground">${entry.total_invested_by_referrals.toLocaleString()}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Rest of Leaderboard */}
        <Card>
          <CardContent className="p-0">
            {leaderboard?.slice(3).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-3 border-b last:border-b-0"
              >
                <span className="text-sm font-semibold w-8">{getRankIcon(entry.rank)}</span>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.profile?.avatar_url} />
                  <AvatarFallback>{entry.profile?.display_name?.[0] || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {getTierIcon(entry.profile?.referral_tier || "")} {entry.profile?.display_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.referral_count} refs • ${entry.total_invested_by_referrals.toLocaleString()}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{entry.profile?.referral_tier}</span>
              </div>
            ))}

            {(!leaderboard || leaderboard.length === 0) && (
              <div className="p-8 text-center text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No leaderboard data yet</p>
                <p className="text-sm">Start referring friends to appear here!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Your Ranking */}
        {stats?.current_rank && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">#{stats.current_rank}</span>
                <Avatar>
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>{profile?.display_name?.[0] || "Y"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">You ({profile?.display_name})</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.qualified_referrals} referrals • ${stats.total_invested_by_referrals.toLocaleString()} invested
                  </p>
                </div>
              </div>
              {stats.current_rank > 10 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {10 - stats.qualified_referrals > 0 ? `${10 - stats.qualified_referrals} more referrals to reach Top 10!` : "Keep going!"}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ReferralLeaderboard;
