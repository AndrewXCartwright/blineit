import { ArrowLeft, Check, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BottomNav } from "@/components/BottomNav";
import { useReferralTiers, useUserReferralStats } from "@/hooks/useReferralProgram";

const ReferralTiers = () => {
  const navigate = useNavigate();
  const { data: tiers, isLoading } = useReferralTiers();
  const { data: stats } = useUserReferralStats();

  const currentTierLevel = stats?.current_tier?.tier_level || 1;
  const qualifiedReferrals = stats?.qualified_referrals || 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Referral Tiers</h1>
            <p className="text-sm text-muted-foreground">Level up by referring more friends!</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tiers?.map((tier) => {
          const isUnlocked = tier.tier_level <= currentTierLevel;
          const isCurrent = tier.tier_level === currentTierLevel;
          const referralsNeeded = Math.max(0, tier.min_referrals - qualifiedReferrals);

          return (
            <Card
              key={tier.id}
              className={`${isCurrent ? "border-primary ring-2 ring-primary/20" : ""} ${
                !isUnlocked ? "opacity-75" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{tier.badge_icon}</span>
                    <div>
                      <h3 className="font-bold text-lg">{tier.tier_name.toUpperCase()}</h3>
                      <p className="text-sm text-muted-foreground">{tier.min_referrals}+ referrals</p>
                    </div>
                  </div>
                  <div>
                    {isUnlocked && isCurrent && (
                      <Badge className="bg-primary">Current Tier</Badge>
                    )}
                    {isUnlocked && !isCurrent && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Unlocked
                      </Badge>
                    )}
                    {!isUnlocked && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        {referralsNeeded} to go
                      </Badge>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5">
                  {tier.perks.map((perk, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-0.5">•</span>
                      <span className={!isUnlocked ? "text-muted-foreground" : ""}>{perk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default ReferralTiers;
