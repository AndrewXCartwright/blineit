import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Rocket, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Percent,
  FileCheck,
  Activity,
  Users,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from "@/components/BottomNav";
import { useSafeDeals, type SafeDeal } from "@/hooks/useSafeDeals";

const stageLabels: Record<string, string> = {
  pre_seed: "Pre-Seed",
  seed: "Seed",
  series_a: "Series A",
};

const stageColors: Record<string, string> = {
  pre_seed: "bg-purple-500/10 text-purple-500",
  seed: "bg-blue-500/10 text-blue-500",
  series_a: "bg-green-500/10 text-green-500",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  image?: string;
}

export default function SafeDealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDeal } = useSafeDeals();
  const [deal, setDeal] = useState<SafeDeal | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = ["Overview", "Team", "Documents", "Activity"];

  useEffect(() => {
    async function loadDeal() {
      if (!id) return;
      setLoading(true);
      const fetchedDeal = await getDeal(id);
      setDeal(fetchedDeal);
      setLoading(false);
    }
    loadDeal();
  }, [id, getDeal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3 p-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </header>
        <main className="p-4 space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-display font-bold">Deal Not Found</h1>
          </div>
        </header>
        <main className="p-4 flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Deal not found</h3>
          <p className="text-muted-foreground mb-4">This SAFE deal may have been removed or doesn't exist.</p>
          <Button onClick={() => navigate("/explore")}>Back to Explore</Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const stageLabel = stageLabels[deal.stage] || deal.stage;
  const stageColor = stageColors[deal.stage] || "bg-muted text-muted-foreground";
  const fundedPercent = deal.target_raise > 0 
    ? Math.min((deal.current_raised / deal.target_raise) * 100, 100)
    : 0;
  
  // Parse team members safely
  const teamMembers: TeamMember[] = Array.isArray(deal.team) 
    ? (deal.team as unknown as TeamMember[]).filter(
        (m): m is TeamMember => typeof m === 'object' && m !== null && 'name' in m && 'role' in m
      )
    : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-display font-bold text-foreground truncate">
              {deal.company_name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={`${stageColor} text-[10px]`}>{stageLabel}</Badge>
              {deal.has_mfn && (
                <Badge className="bg-amber-500/10 text-amber-500 text-[10px]">MFN</Badge>
              )}
              {deal.has_pro_rata && (
                <Badge className="bg-cyan-500/10 text-cyan-500 text-[10px]">Pro-Rata</Badge>
              )}
              {deal.status === "active" && (
                <Badge className="bg-success/10 text-success text-[10px]">Active</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="h-32 relative overflow-hidden bg-gradient-to-br from-violet-500/30 via-violet-500/20 to-background">
        <div className="absolute inset-0 flex items-center justify-center">
          <Rocket className="w-16 h-16 text-violet-500/20" />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 border-b border-border overflow-x-auto">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="p-4 space-y-4">
        {activeTab === "Overview" && (
          <>
            {/* SAFE Terms */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  SAFE Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {deal.valuation_cap && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Valuation Cap</p>
                        <p className="font-semibold">{formatCurrency(deal.valuation_cap)}</p>
                      </div>
                    </div>
                  )}

                  {deal.discount_rate && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                        <Percent className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Discount Rate</p>
                        <p className="font-semibold text-success">{deal.discount_rate}%</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${deal.has_mfn ? 'bg-amber-500/10' : 'bg-muted'}`}>
                      <Sparkles className={`w-5 h-5 ${deal.has_mfn ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">MFN Clause</p>
                      <p className="font-semibold">{deal.has_mfn ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${deal.has_pro_rata ? 'bg-cyan-500/10' : 'bg-muted'}`}>
                      <TrendingUp className={`w-5 h-5 ${deal.has_pro_rata ? 'text-cyan-500' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pro-Rata Rights</p>
                      <p className="font-semibold">{deal.has_pro_rata ? "Yes" : "No"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Raise Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Raise Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Target Raise</p>
                    <p className="font-semibold text-lg">{formatCurrency(deal.target_raise)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Raised</p>
                    <p className="font-semibold text-lg text-success">{formatCurrency(deal.current_raised)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={fundedPercent} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{fundedPercent.toFixed(1)}% Funded</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(deal.target_raise - deal.current_raised)} remaining
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Description */}
            {deal.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {deal.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Investment Card */}
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Minimum Investment</span>
                  <span className="font-semibold">{formatCurrency(deal.min_investment)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Investment Type</span>
                  <span className="font-semibold">SAFE</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stage</span>
                  <Badge className={stageColor}>{stageLabel}</Badge>
                </div>

                <Button className="w-full" size="lg">
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "Team" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length > 0 ? (
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-primary">{member.role}</p>
                        {member.bio && (
                          <p className="text-sm text-muted-foreground mt-1">{member.bio}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Team information not available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "Documents" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deal.documents && Array.isArray(deal.documents) && deal.documents.length > 0 ? (
                <div className="space-y-2">
                  {deal.documents.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <FileCheck className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">{doc.name || `Document ${index + 1}`}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No documents available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "Activity" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Deal Created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(deal.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
