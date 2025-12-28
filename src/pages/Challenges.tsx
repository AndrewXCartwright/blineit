import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useChallenges, useUserChallenges, useClaimReward } from '@/hooks/useGamification';
import { ArrowLeft, Target, Clock, Gift, CheckCircle, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Challenges() {
  const { data: challenges = [] } = useChallenges();
  const { data: userChallenges = [] } = useUserChallenges();
  const claimReward = useClaimReward();
  const [timeLeft, setTimeLeft] = useState({ daily: '', weekly: '' });

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date();
      
      // Daily reset at midnight
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const dailyDiff = tomorrow.getTime() - now.getTime();
      
      // Weekly reset on Monday
      const nextMonday = new Date(now);
      nextMonday.setDate(nextMonday.getDate() + ((8 - nextMonday.getDay()) % 7 || 7));
      nextMonday.setHours(0, 0, 0, 0);
      const weeklyDiff = nextMonday.getTime() - now.getTime();

      const formatTime = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      };

      const formatDays = (ms: number) => {
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      };

      setTimeLeft({
        daily: formatTime(dailyDiff),
        weekly: formatDays(weeklyDiff),
      });
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const dailyChallenges = challenges.filter(c => c.challenge_type === 'daily');
  const weeklyChallenges = challenges.filter(c => c.challenge_type === 'weekly');
  const monthlyChallenges = challenges.filter(c => c.challenge_type === 'monthly');
  const specialChallenges = challenges.filter(c => c.challenge_type === 'special');

  const getUserChallenge = (challengeId: string) => 
    userChallenges.find(uc => uc.challenge_id === challengeId);

  const handleClaimReward = async (challengeId: string) => {
    try {
      await claimReward.mutateAsync(challengeId);
      toast({ title: 'Reward Claimed!', description: 'XP has been added to your account.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to claim reward', variant: 'destructive' });
    }
  };

  const renderChallenge = (challenge: typeof challenges[0]) => {
    const uc = getUserChallenge(challenge.id);
    const progress = uc?.progress || 0;
    const progressPercent = (progress / challenge.requirement_value) * 100;
    const isCompleted = uc?.completed || false;
    const canClaim = isCompleted && !uc?.reward_claimed;

    return (
      <Card key={challenge.id} className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500/20' : 'bg-primary/10'}`}>
            {isCompleted ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Target className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium">{challenge.name}</p>
              {isCompleted && <Badge variant="secondary" className="text-xs">Completed</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{challenge.description}</p>
            
            {!isCompleted && (
              <div className="flex items-center gap-2 mt-2">
                <Progress value={progressPercent} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground">
                  {progress}/{challenge.requirement_value}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <Badge variant="outline" className="text-xs">
                <Gift className="h-3 w-3 mr-1" />
                +{challenge.reward_value} {challenge.reward_type.toUpperCase()}
              </Badge>
              
              {canClaim && (
                <Button size="sm" onClick={() => handleClaimReward(challenge.id)}>
                  <Sparkles className="h-4 w-4 mr-1" /> Claim
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
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
            <Target className="h-6 w-6 text-primary" /> Challenges
          </h1>
          <p className="text-muted-foreground">Complete challenges for bonus rewards</p>
        </div>

        {/* Daily Challenges */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Daily Challenges</h2>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" /> Resets in {timeLeft.daily}
            </Badge>
          </div>
          <div className="space-y-3">
            {dailyChallenges.map(renderChallenge)}
          </div>
        </div>

        {/* Weekly Challenges */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Weekly Challenges</h2>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" /> Resets in {timeLeft.weekly}
            </Badge>
          </div>
          <div className="space-y-3">
            {weeklyChallenges.map(renderChallenge)}
          </div>
        </div>

        {/* Monthly Challenges */}
        {monthlyChallenges.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg mb-3">Monthly Challenges</h2>
            <div className="space-y-3">
              {monthlyChallenges.map(challenge => {
                const uc = getUserChallenge(challenge.id);
                const progress = uc?.progress || 0;
                const progressPercent = (progress / challenge.requirement_value) * 100;
                const endsAt = new Date(challenge.ends_at);

                return (
                  <Card key={challenge.id} className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🏆</span>
                      <div>
                        <p className="font-semibold">{challenge.name}</p>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">
                        Prize: ${challenge.reward_value} + {challenge.reward_value} XP
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={progressPercent} className="flex-1 h-2" />
                      <span className="text-sm font-medium">
                        ${progress.toLocaleString()} / ${challenge.requirement_value.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Ends: {endsAt.toLocaleDateString()}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Challenges */}
        {specialChallenges.length > 0 && (
          <div>
            <h2 className="font-semibold text-lg mb-3">Special Challenges</h2>
            <div className="space-y-3">
              {specialChallenges.map(challenge => (
                <Card key={challenge.id} className="p-4 border-2 border-yellow-500/50 bg-yellow-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎆</span>
                    <div>
                      <p className="font-semibold">{challenge.name}</p>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-500 text-black">
                    Exclusive "2025" badge + {challenge.reward_value} XP
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">Limited time!</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
