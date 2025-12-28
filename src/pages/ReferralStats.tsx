import { ArrowLeft, BarChart3, Users, DollarSign, TrendingUp, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from "@/components/BottomNav";
import { useUserReferralStats, useUserReferrals } from "@/hooks/useReferralProgram";
import { format } from "date-fns";

const ReferralStats = () => {
  const navigate = useNavigate();
  const { data: stats } = useUserReferralStats();
  const { data: referrals } = useUserReferrals();

  const conversionRate = stats?.total_referrals
    ? ((stats.qualified_referrals / stats.total_referrals) * 100).toFixed(0)
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
              <BarChart3 className="h-5 w-5 text-blue-500" />
              My Referral Stats
            </h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold">{stats?.total_referrals || 0}</p>
              <p className="text-xs text-muted-foreground">Referrals</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Qualified</span>
              </div>
              <p className="text-2xl font-bold">{stats?.qualified_referrals || 0}</p>
              <p className="text-xs text-muted-foreground">Invested</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted-foreground">⏳</span>
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
              <p className="text-2xl font-bold">{stats?.pending_referrals || 0}</p>
              <p className="text-xs text-muted-foreground">Signups</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-muted-foreground">📊</span>
                <span className="text-sm text-muted-foreground">Conversion</span>
              </div>
              <p className="text-2xl font-bold">{conversionRate}%</p>
              <p className="text-xs text-muted-foreground">Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Earnings Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Signup Bonuses</span>
              <span className="font-medium">
                ${((stats?.qualified_referrals || 0) * (stats?.current_tier?.bonus_per_referral || 10)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground text-sm">
                ({stats?.qualified_referrals || 0} qualified × ${stats?.current_tier?.bonus_per_referral || 10})
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Investment Commissions</span>
              <span className="font-medium">
                ${((stats?.total_invested_by_referrals || 0) * (stats?.current_tier?.commission_rate || 0.05)).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground text-sm">
                ({((stats?.current_tier?.commission_rate || 0.05) * 100).toFixed(0)}% of ${(stats?.total_invested_by_referrals || 0).toLocaleString()})
              </span>
            </div>
            <div className="flex justify-between py-3 font-bold text-lg">
              <span>TOTAL EARNED</span>
              <span className="text-primary">${(stats?.commission_earned || 0).toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Referral List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">My Referrals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {referrals?.slice(0, 5).map((referral) => {
              const isQualified = referral.status === "qualified";
              const profile = Array.isArray(referral.referred_profile)
                ? referral.referred_profile[0]
                : referral.referred_profile;

              return (
                <div key={referral.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {profile?.display_name?.[0] || referral.referred_email?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {profile?.display_name || referral.referred_email?.split("@")[0]}
                      </p>
                      {isQualified ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-600 text-xs">
                          Qualified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Joined: {format(new Date(referral.created_at), "MMM d, yyyy")}
                    </p>
                    {isQualified && (
                      <p className="text-sm text-muted-foreground">
                        Invested: ${Number(referral.total_invested || 0).toLocaleString()}
                      </p>
                    )}
                  </div>
                  {!isQualified && (
                    <Button variant="ghost" size="sm">
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}

            {(!referrals || referrals.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No referrals yet</p>
                <p className="text-sm">Share your link to start earning!</p>
              </div>
            )}

            {referrals && referrals.length > 5 && (
              <Button variant="outline" className="w-full" onClick={() => navigate("/referrals")}>
                View All Referrals
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReferralStats;
