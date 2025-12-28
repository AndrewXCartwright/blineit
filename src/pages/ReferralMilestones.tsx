import { ArrowLeft, Target, Check, Lock, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { useReferralMilestones, useClaimMilestone, useUserReferralStats } from "@/hooks/useReferralProgram";

// Default milestones if none exist in DB
const defaultMilestones = [
  { type: "referral_count", value: 1, name: "First Referral", reward: 10, description: "Refer your first friend" },
  { type: "referral_count", value: 5, name: "High Five", reward: 25, description: "Reach 5 referrals" },
  { type: "referral_count", value: 10, name: "Perfect 10", reward: 50, description: "Reach 10 referrals" },
  { type: "referral_count", value: 25, name: "Quarter Century", reward: 100, description: "Reach 25 referrals" },
  { type: "referral_count", value: 50, name: "Half Century", reward: 250, description: "Reach 50 referrals" },
  { type: "referral_count", value: 100, name: "Century Club", reward: 1000, description: "Reach 100 referrals" },
  { type: "investment_amount", value: 1000, name: "Starter", reward: 25, description: "Referrals invest $1,000 total" },
  { type: "investment_amount", value: 5000, name: "Growing Network", reward: 75, description: "Referrals invest $5,000 total" },
  { type: "investment_amount", value: 25000, name: "Power Connector", reward: 500, description: "Referrals invest $25,000 total" },
];

const ReferralMilestones = () => {
  const navigate = useNavigate();
  const { data: milestones } = useReferralMilestones();
  const { data: stats } = useUserReferralStats();
  const claimMilestone = useClaimMilestone();

  const qualifiedReferrals = stats?.qualified_referrals || 0;
  const totalInvested = stats?.total_invested_by_referrals || 0;

  const getMilestoneProgress = (type: string, value: number) => {
    if (type === "referral_count") {
      return Math.min((qualifiedReferrals / value) * 100, 100);
    }
    if (type === "investment_amount") {
      return Math.min((totalInvested / value) * 100, 100);
    }
    return 0;
  };

  const getMilestoneCurrentValue = (type: string) => {
    if (type === "referral_count") return qualifiedReferrals;
    if (type === "investment_amount") return totalInvested;
    return 0;
  };

  const isMilestoneAchieved = (type: string, value: number) => {
    return getMilestoneProgress(type, value) >= 100;
  };

  const referralMilestones = defaultMilestones.filter((m) => m.type === "referral_count");
  const investmentMilestones = defaultMilestones.filter((m) => m.type === "investment_amount");

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
              <Target className="h-5 w-5 text-green-500" />
              Referral Milestones
            </h1>
            <p className="text-sm text-muted-foreground">Unlock rewards as you reach milestones!</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Referral Count Milestones */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">👥</span>
            Referral Count Milestones
          </h2>
          <div className="space-y-3">
            {referralMilestones.map((milestone) => {
              const achieved = isMilestoneAchieved(milestone.type, milestone.value);
              const progress = getMilestoneProgress(milestone.type, milestone.value);
              const currentValue = getMilestoneCurrentValue(milestone.type);

              return (
                <Card key={`${milestone.type}-${milestone.value}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {achieved ? (
                          <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{milestone.name}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                      </div>
                      {achieved ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          CLAIMED
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          {currentValue}/{milestone.value}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Gift className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Reward:</span>
                      <span className="font-medium">${milestone.reward} bonus</span>
                    </div>
                    {!achieved && (
                      <div className="mt-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-right">{progress.toFixed(0)}%</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Investment Milestones */}
        <div>
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">💰</span>
            Investment Milestones
          </h2>
          <div className="space-y-3">
            {investmentMilestones.map((milestone) => {
              const achieved = isMilestoneAchieved(milestone.type, milestone.value);
              const progress = getMilestoneProgress(milestone.type, milestone.value);
              const currentValue = getMilestoneCurrentValue(milestone.type);

              return (
                <Card key={`${milestone.type}-${milestone.value}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {achieved ? (
                          <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Check className="h-4 w-4 text-green-500" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{milestone.name}</h3>
                          <p className="text-sm text-muted-foreground">{milestone.description}</p>
                        </div>
                      </div>
                      {achieved ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                          CLAIMED
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          ${currentValue.toLocaleString()}/${milestone.value.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Gift className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Reward:</span>
                      <span className="font-medium">${milestone.reward} bonus</span>
                    </div>
                    {!achieved && (
                      <div className="mt-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-right">{progress.toFixed(0)}%</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReferralMilestones;
