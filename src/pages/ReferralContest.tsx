import { ArrowLeft, Trophy, Clock, Gift, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { useActiveContests, useUserReferralStats, useLeaderboard } from "@/hooks/useReferralProgram";
import { CountdownTimer } from "@/components/CountdownTimer";

const ReferralContest = () => {
  const navigate = useNavigate();
  const { data: contests } = useActiveContests();
  const { data: stats } = useUserReferralStats();
  const { data: leaderboard } = useLeaderboard("monthly");

  const activeContest = contests?.find((c) => c.status === "active");
  const upcomingContests = contests?.filter((c) => c.status === "upcoming") || [];

  const userRank = stats?.current_rank || null;
  const userReferralsThisMonth = stats?.qualified_referrals || 0;

  const referralsToTop10 = leaderboard && leaderboard.length >= 10
    ? Math.max(0, (leaderboard[9]?.referral_count || 0) - userReferralsThisMonth + 1)
    : 0;

  const referralsToTop3 = leaderboard && leaderboard.length >= 3
    ? Math.max(0, (leaderboard[2]?.referral_count || 0) - userReferralsThisMonth + 1)
    : 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Referral Contest
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {activeContest ? (
          <>
            {/* Active Contest Banner */}
            <Card className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-red-500/10 border-amber-500/30">
              <CardContent className="p-6 text-center">
                <Badge className="bg-amber-500 text-white mb-3">🏆 ACTIVE CONTEST</Badge>
                <h2 className="text-2xl font-bold mb-2">{activeContest.name}</h2>
                <p className="text-muted-foreground mb-4">{activeContest.description}</p>
                
                <div className="bg-background/80 rounded-lg p-4 mb-4">
                  <p className="text-3xl font-bold text-primary">
                    ${activeContest.prize_pool.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Prize Pool</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {activeContest.prizes.slice(0, 3).map((prize, index) => (
                    <div key={index} className="bg-background/60 rounded-lg p-3">
                      <span className="text-xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>
                      <p className="font-bold">${prize.amount}</p>
                      <p className="text-xs text-muted-foreground">{prize.label || `${index + 1}st Place`}</p>
                    </div>
                  ))}
                </div>

                {activeContest.prizes.length > 3 && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {activeContest.prizes.slice(3).map((p) => `${p.label}: $${p.amount}`).join(" • ")}
                  </p>
                )}

                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ends in:</span>
                </div>
                <CountdownTimer expiresAt={new Date(activeContest.end_date)} />
              </CardContent>
            </Card>

            {/* Your Progress */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Your Progress</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-2xl font-bold">#{userRank || "-"}</p>
                    <p className="text-sm text-muted-foreground">Current Rank</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{userReferralsThisMonth}</p>
                    <p className="text-sm text-muted-foreground">Referrals This Month</p>
                  </div>
                </div>
                
                {userRank && userRank > 10 && (
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      To reach Top 10: Need <strong>{referralsToTop10}</strong> more referrals
                    </p>
                    <p className="text-muted-foreground">
                      To reach Top 3: Need <strong>{referralsToTop3}</strong> more referrals
                    </p>
                  </div>
                )}

                <Button className="w-full mt-4" onClick={() => navigate("/referrals")}>
                  Share Now to Climb the Leaderboard!
                </Button>
              </CardContent>
            </Card>

            {/* Contest Rules */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Contest Rules</h3>
                <ul className="space-y-2">
                  {(activeContest.rules || [
                    "Only qualified referrals count (must invest $50+)",
                    `Contest runs ${new Date(activeContest.start_date).toLocaleDateString()} - ${new Date(activeContest.end_date).toLocaleDateString()}`,
                    "Prizes paid within 7 days of contest end",
                    "Ties broken by total investment amount",
                    "One entry per person",
                  ]).map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-bold mb-2">No Active Contest</h2>
              <p className="text-muted-foreground">
                Check back soon for the next referral competition!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Contests */}
        {upcomingContests.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Upcoming Contests</h3>
            {upcomingContests.map((contest) => (
              <Card key={contest.id} className="mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{contest.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Starts: {new Date(contest.start_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${contest.prize_pool.toLocaleString()}</p>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Past Winners */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Past Winners</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span>December 2024</span>
                <span className="font-medium">CryptoKing (52 refs) - $500</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>November 2024</span>
                <span className="font-medium">InvestorPro (41 refs) - $500</span>
              </div>
              <div className="flex justify-between py-2">
                <span>October 2024</span>
                <span className="font-medium">TokenMaster (38 refs) - $500</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReferralContest;
