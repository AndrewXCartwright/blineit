import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAchievements, useUserAchievements, useUserLevel, useUserStreaks, getLevelInfo, Achievement, UserAchievement } from '@/hooks/useGamification';
import { ArrowLeft, Trophy, Flame, Target, Star, Lock, CheckCircle, Share2, History } from 'lucide-react';

const categoryIcons: Record<string, string> = {
  investing: '💰',
  dividends: '💵',
  predictions: '🎯',
  trading: '📊',
  social: '👥',
  streaks: '🔥',
  learning: '📚',
  special: '⭐',
};

const badgeColors: Record<string, string> = {
  bronze: 'bg-amber-700 text-white',
  silver: 'bg-slate-400 text-white',
  gold: 'bg-yellow-500 text-black',
  platinum: 'bg-slate-300 text-black',
  diamond: 'bg-cyan-400 text-black',
};

export default function AchievementsHub() {
  const { data: achievements = [] } = useAchievements();
  const { data: userAchievements = [] } = useUserAchievements();
  const { data: userLevel } = useUserLevel();
  const { data: streaks = [] } = useUserStreaks();
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'locked'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<{ achievement: Achievement; userAchievement?: UserAchievement } | null>(null);

  const levelInfo = userLevel ? getLevelInfo(userLevel.current_level) : null;
  const xpToNextLevel = levelInfo ? levelInfo.next.xp - (userLevel?.total_xp || 0) : 0;
  const xpProgress = levelInfo ? ((userLevel?.current_xp || 0) / (levelInfo.next.xp - levelInfo.current.xp)) * 100 : 0;

  const completedCount = userAchievements.filter(ua => ua.completed).length;
  const totalCount = achievements.length;

  const getAchievementStatus = (achievement: Achievement) => {
    const ua = userAchievements.find(u => u.achievement_id === achievement.id);
    if (ua?.completed) return 'completed';
    if (ua && ua.progress > 0) return 'in_progress';
    return 'locked';
  };

  const filteredAchievements = achievements.filter(a => {
    const status = getAchievementStatus(a);
    if (filter === 'all') return true;
    return status === filter;
  });

  const groupedAchievements = filteredAchievements.reduce((acc, a) => {
    if (!acc[a.category]) acc[a.category] = [];
    acc[a.category].push(a);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const dailyStreak = streaks.find(s => s.streak_type === 'daily_login');
  const weeklyStreak = streaks.find(s => s.streak_type === 'weekly_invest');
  const dividendStreak = streaks.find(s => s.streak_type === 'dividend_collect');

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <Link to="/achievements/history">
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-1" /> XP History
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" /> Achievements
          </h1>
          <p className="text-muted-foreground">Track your progress and earn rewards</p>
        </div>

        {/* User Level */}
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold">
              {userLevel?.current_level || 1}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Level {userLevel?.current_level || 1} - {levelInfo?.current.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={xpProgress} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground">
                  {userLevel?.current_xp?.toLocaleString() || 0} / {((levelInfo?.next.xp || 0) - (levelInfo?.current.xp || 0)).toLocaleString()} XP
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{xpToNextLevel.toLocaleString()} XP to Level {(userLevel?.current_level || 1) + 1}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-background/50 rounded-lg p-2">
              <p className="text-lg font-bold">{completedCount}/{totalCount}</p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
            <div className="bg-background/50 rounded-lg p-2">
              <p className="text-lg font-bold">{userLevel?.total_xp?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
            <div className="bg-background/50 rounded-lg p-2">
              <p className="text-lg font-bold">{dailyStreak?.current_streak || 0}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
            <div className="bg-background/50 rounded-lg p-2">
              <p className="text-lg font-bold">#234</p>
              <p className="text-xs text-muted-foreground">Rank</p>
            </div>
          </div>
        </Card>

        {/* Streaks */}
        <Card className="p-4">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-orange-500" /> Streaks
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🔥</span>
                <span className="text-sm">Daily Login</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">{dailyStreak?.current_streak || 0} days</span>
                <span className="text-xs text-muted-foreground ml-2">(Best: {dailyStreak?.longest_streak || 0})</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span className="text-sm">Weekly Investor</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">{weeklyStreak?.current_streak || 0} weeks</span>
                <span className="text-xs text-muted-foreground ml-2">(Best: {weeklyStreak?.longest_streak || 0})</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>📈</span>
                <span className="text-sm">Dividend Collector</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">{dividendStreak?.current_streak || 0} months</span>
                <span className="text-xs text-muted-foreground ml-2">(Best: {dividendStreak?.longest_streak || 0})</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/challenges">
            <Card className="p-4 hover:bg-muted/50 transition-colors text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">Challenges</p>
              <p className="text-xs text-muted-foreground">Daily & Weekly</p>
            </Card>
          </Link>
          <Link to="/leaderboards">
            <Card className="p-4 hover:bg-muted/50 transition-colors text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="font-medium">Leaderboards</p>
              <p className="text-xs text-muted-foreground">Top Investors</p>
            </Card>
          </Link>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            <TabsTrigger value="locked">Locked</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Achievements by Category */}
        <div className="space-y-6">
          {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
            <div key={category}>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                {categoryIcons[category] || '🏆'} {category.charAt(0).toUpperCase() + category.slice(1)} Achievements
              </h3>
              <div className="space-y-2">
                {categoryAchievements.map(achievement => {
                  const ua = userAchievements.find(u => u.achievement_id === achievement.id);
                  const status = getAchievementStatus(achievement);
                  const progressPercent = ua ? (ua.progress / achievement.requirement_value) * 100 : 0;

                  return (
                    <Card
                      key={achievement.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${status === 'completed' ? 'border-green-500/50' : ''}`}
                      onClick={() => setSelectedAchievement({ achievement, userAchievement: ua })}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-xl ${
                          status === 'locked' ? 'bg-muted text-muted-foreground' : 'bg-primary/10'
                        }`}>
                          {status === 'locked' && achievement.is_hidden ? <Lock className="h-5 w-5" /> : achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium ${status === 'locked' ? 'text-muted-foreground' : ''}`}>
                              {status === 'locked' && achievement.is_hidden ? '???' : achievement.name}
                            </p>
                            {status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {status === 'locked' && achievement.is_hidden ? 'Secret achievement' : achievement.description}
                          </p>
                          {status === 'in_progress' && (
                            <div className="flex items-center gap-2 mt-1">
                              <Progress value={progressPercent} className="flex-1 h-1.5" />
                              <span className="text-xs text-muted-foreground">
                                {Math.round(progressPercent)}%
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={badgeColors[achievement.badge_color]}>
                            +{achievement.points} XP
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Achievement Detail Modal */}
        <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedAchievement?.achievement.icon}</span>
                {selectedAchievement?.achievement.name}
              </DialogTitle>
            </DialogHeader>
            {selectedAchievement && (
              <div className="space-y-4">
                <Badge className={badgeColors[selectedAchievement.achievement.badge_color]}>
                  {selectedAchievement.achievement.badge_color.charAt(0).toUpperCase() + selectedAchievement.achievement.badge_color.slice(1)} Badge • {selectedAchievement.achievement.points} XP
                </Badge>

                <p className="text-muted-foreground">{selectedAchievement.achievement.description}</p>

                {selectedAchievement.userAchievement && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {selectedAchievement.userAchievement.progress} / {selectedAchievement.achievement.requirement_value}
                      </span>
                    </div>
                    <Progress
                      value={(selectedAchievement.userAchievement.progress / selectedAchievement.achievement.requirement_value) * 100}
                      className="h-3"
                    />
                  </div>
                )}

                {selectedAchievement.userAchievement?.completed && (
                  <p className="text-sm text-green-600">
                    ✅ Completed on {new Date(selectedAchievement.userAchievement.completed_at!).toLocaleDateString()}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedAchievement(null)}>
                    Close
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-1" /> Share
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <BottomNav />
    </div>
  );
}
