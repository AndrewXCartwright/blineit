import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useXPHistory, useUserLevel } from '@/hooks/useGamification';
import { ArrowLeft, Sparkles, Trophy, Target, ArrowUp, Gift } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

const typeIcons: Record<string, React.ReactNode> = {
  daily_login: <Sparkles className="h-4 w-4" />,
  achievement: <Trophy className="h-4 w-4" />,
  challenge: <Target className="h-4 w-4" />,
  level_up: <ArrowUp className="h-4 w-4" />,
  referral: <Gift className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  daily_login: 'bg-blue-500/20 text-blue-500',
  achievement: 'bg-yellow-500/20 text-yellow-500',
  challenge: 'bg-green-500/20 text-green-500',
  level_up: 'bg-purple-500/20 text-purple-500',
  referral: 'bg-pink-500/20 text-pink-500',
};

export default function XPHistory() {
  const { data: history = [] } = useXPHistory();
  const { data: userLevel } = useUserLevel();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d, yyyy');
  };

  // Group by date
  const groupedHistory = history.reduce((acc, item) => {
    const dateKey = formatDate(item.created_at);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, typeof history>);

  const thisMonthXP = history
    .filter(h => new Date(h.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, h) => sum + h.xp, 0);

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
            <Sparkles className="h-6 w-6 text-primary" /> XP History
          </h1>
          <p className="text-muted-foreground">Track your experience points earned</p>
        </div>

        {/* Summary */}
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">+{thisMonthXP.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{userLevel?.total_xp?.toLocaleString() || 0}</p>
              <p className="text-sm text-muted-foreground">Total All Time</p>
            </div>
          </div>
        </Card>

        {/* History List */}
        <div className="space-y-6">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{date}</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <Card key={item.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${typeColors[item.type] || 'bg-muted'}`}>
                        {typeIcons[item.type] || <Sparkles className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), 'h:mm a')}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-green-600">
                        +{item.xp} XP
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
