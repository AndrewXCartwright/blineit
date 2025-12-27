import { useState } from "react";
import { ArrowLeft, Trophy, TrendingUp, Users, Gift, Crown, Medal, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useLeaderboard } from "@/hooks/useSocial";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/Skeleton";
import { CountUp } from "@/components/CountUp";

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"predictions" | "investors" | "referrals">("predictions");
  const { leaders, loading } = useLeaderboard(activeTab);

  const tabs = [
    { key: "predictions", label: "Predictions", icon: Trophy },
    { key: "investors", label: "Investors", icon: TrendingUp },
    { key: "referrals", label: "Referrals", icon: Users },
  ] as const;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-amber-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-700" />;
      default:
        return <span className="w-5 text-center text-muted-foreground font-medium">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-amber-500/30";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-amber-700/20 to-amber-700/5 border-amber-700/30";
      default:
        return "";
    }
  };

  const getValue = (leader: any) => {
    switch (activeTab) {
      case "predictions":
        return `${leader.prediction_win_rate || 0}% win rate`;
      case "investors":
        return `$${(leader.total_invested || 0).toLocaleString()} invested`;
      case "referrals":
        return `$${(leader.referral_earnings || 0).toLocaleString()} earned`;
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/community" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="font-display text-xl font-bold text-foreground">Leaderboard</h1>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Prize Banner */}
        <div className="glass-card rounded-2xl p-5 gradient-primary text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white/20">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold">Monthly Prize</h3>
              <p className="text-sm text-white/80">
                Top predictor wins $500 bonus at month end!
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-display font-semibold text-foreground mb-2">No leaders yet</h3>
            <p className="text-muted-foreground text-sm">Start investing to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader, index) => {
              const rank = index + 1;
              const isCurrentUser = leader.user_id === user?.id;

              return (
                <Link
                  key={leader.user_id}
                  to={`/user/${leader.user_id}`}
                  className={`glass-card rounded-xl p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors ${
                    getRankBg(rank)
                  } ${isCurrentUser ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="w-8 flex justify-center">
                    {getRankIcon(rank)}
                  </div>

                  <Avatar className="w-12 h-12">
                    <AvatarImage src={leader.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {leader.display_name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground truncate">
                        {leader.display_name || "Unknown"}
                      </span>
                      {leader.is_verified_investor && (
                        <span className="text-primary">✓</span>
                      )}
                      {isCurrentUser && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getValue(leader)}
                    </p>
                  </div>

                  {rank <= 3 && (
                    <div className="text-2xl">
                      {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Your Rank */}
        {user && leaders.length > 0 && (
          <div className="glass-card rounded-xl p-4 border border-primary/30">
            <p className="text-sm text-muted-foreground text-center">
              Your rank:{" "}
              <span className="font-semibold text-foreground">
                {leaders.findIndex((l) => l.user_id === user.id) + 1 || "Not ranked"}
              </span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
