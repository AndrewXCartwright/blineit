import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLeaderboard, useUserLevel } from '@/hooks/useGamification';
import { ArrowLeft, Medal, Trophy, TrendingUp, Users, Target } from 'lucide-react';

export default function Leaderboards() {
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('all');
  const [leaderboardType, setLeaderboardType] = useState<'xp' | 'investors' | 'referrals' | 'predictions'>('xp');
  const { data: leaderboard = [] } = useLeaderboard(leaderboardType);
  const { data: userLevel } = useUserLevel();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500/20 border-yellow-500';
      case 2: return 'bg-slate-400/20 border-slate-400';
      case 3: return 'bg-amber-700/20 border-amber-700';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Link to="/achievements" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Achievements
        </Link>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Medal className="h-6 w-6 text-yellow-500" /> Leaderboards
          </h1>
          <p className="text-muted-foreground">See how you rank against other investors</p>
        </div>

        {/* Tabs and Period Filter */}
        <div className="flex items-center justify-between gap-4">
          <Tabs value={leaderboardType} onValueChange={(v) => setLeaderboardType(v as typeof leaderboardType)} className="flex-1">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="xp" className="text-xs">
                <Trophy className="h-3 w-3 mr-1" /> XP
              </TabsTrigger>
              <TabsTrigger value="investors" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" /> Investors
              </TabsTrigger>
              <TabsTrigger value="referrals" className="text-xs">
                <Users className="h-3 w-3 mr-1" /> Referrals
              </TabsTrigger>
              <TabsTrigger value="predictions" className="text-xs">
                <Target className="h-3 w-3 mr-1" /> Predictions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        {/* Leaderboard List */}
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <Card
              key={entry.user_id}
              className={`p-4 border-2 ${getRankColor(entry.rank)}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-xl font-bold w-8 text-center">
                  {getRankIcon(entry.rank)}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{entry.display_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{entry.display_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Level {entry.level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{entry.total_xp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Your Rank */}
        <Card className="p-4 bg-primary/5 border-primary">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold w-8 text-center">
              #234
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">You</p>
              <p className="text-sm text-muted-foreground">
                Level {userLevel?.current_level || 1}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{userLevel?.total_xp?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">XP</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-3">
            Top 15% of all users
          </p>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}
