import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Building2, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Percent,
  FileCheck,
  Activity,
  Users,
  TrendingUp,
  Target,
  MapPin,
  User,
  BarChart3,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BottomNav } from "@/components/BottomNav";
import { usePrivateBusinesses, type PrivateBusiness } from "@/hooks/usePrivateBusinesses";
import { InvestmentModal } from "@/components/shared/InvestmentModal";

const businessTypeLabels: Record<string, string> = {
  revenue_share: "Revenue Share",
  equity: "Equity",
  convertible_note: "Convertible Note",
  profit_share: "Profit Share",
};

const businessTypeColors: Record<string, string> = {
  revenue_share: "bg-emerald-500/10 text-emerald-500",
  equity: "bg-purple-500/10 text-purple-500",
  convertible_note: "bg-blue-500/10 text-blue-500",
  profit_share: "bg-amber-500/10 text-amber-500",
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

export default function PrivateBusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBusiness } = usePrivateBusinesses();
  const [business, setBusiness] = useState<PrivateBusiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showInvestModal, setShowInvestModal] = useState(false);

  const tabs = ["Overview", "Financials", "Team", "Documents"];

  useEffect(() => {
    async function loadBusiness() {
      if (!id) return;
      setLoading(true);
      const fetchedBusiness = await getBusiness(id);
      setBusiness(fetchedBusiness);
      setLoading(false);
    }
    loadBusiness();
  }, [id, getBusiness]);

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

  if (!business) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-display font-bold">Business Not Found</h1>
          </div>
        </header>
        <main className="p-4 flex flex-col items-center justify-center py-16 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Business not found</h3>
          <p className="text-muted-foreground mb-4">This business investment may have been removed or doesn't exist.</p>
          <Button onClick={() => navigate("/explore")}>Back to Explore</Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const typeLabel = businessTypeLabels[business.business_type] || business.business_type;
  const typeColor = businessTypeColors[business.business_type] || "bg-muted text-muted-foreground";
  const fundedPercent = business.target_raise > 0 
    ? Math.min((business.current_raised / business.target_raise) * 100, 100)
    : 0;
  
  const exemptionLabel = business.exemption_type === 'reg_cf' 
    ? "Open to All Investors" 
    : "Accredited Only";
  const exemptionColor = business.exemption_type === 'reg_cf'
    ? "bg-success/10 text-success"
    : "bg-amber-500/10 text-amber-500";

  // Parse team members safely
  const teamMembers: TeamMember[] = Array.isArray(business.team) 
    ? (business.team as unknown as TeamMember[]).filter(
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
              {business.business_name}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge className={`${typeColor} text-[10px]`}>{typeLabel}</Badge>
              <Badge className={`${exemptionColor} text-[10px]`}>{exemptionLabel}</Badge>
              {business.status === "active" && (
                <Badge className="bg-success/10 text-success text-[10px]">Active</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img 
          src={business.image_url || "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800"} 
          alt={business.business_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=800";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-2xl font-bold">{business.business_name}</h2>
          <div className="flex items-center gap-2 mt-1 text-sm opacity-90">
            {business.industry && <span>{business.industry}</span>}
            {business.industry && business.location_city && <span>•</span>}
            {business.location_city && business.location_state && (
              <span>{business.location_city}, {business.location_state}</span>
            )}
          </div>
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
            {/* Business Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Business Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Industry</p>
                      <p className="font-semibold">{business.industry}</p>
                    </div>
                  </div>

                  {business.years_in_operation && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Years Operating</p>
                        <p className="font-semibold">{business.years_in_operation} years</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Investment Terms */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Investment Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {business.projected_return && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                        <Percent className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Projected Return</p>
                        <p className="font-semibold text-success">{business.projected_return}%</p>
                      </div>
                    </div>
                  )}

                  {business.term_months && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Term</p>
                        <p className="font-semibold">{business.term_months} months</p>
                      </div>
                    </div>
                  )}

                  {business.revenue_share_percentage && business.business_type === 'revenue_share' && (
                    <div className="flex items-center gap-3 col-span-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue Share to Investors</p>
                        <p className="font-semibold">{business.revenue_share_percentage}% of gross revenue</p>
                      </div>
                    </div>
                  )}
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
                    <p className="font-semibold text-lg">{formatCurrency(business.target_raise)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Raised</p>
                    <p className="font-semibold text-lg text-success">{formatCurrency(business.current_raised)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={fundedPercent} className="h-3" />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{fundedPercent.toFixed(1)}% Funded</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(business.target_raise - business.current_raised)} remaining
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {business.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {business.description}
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
                  <span className="font-semibold">{formatCurrency(business.min_investment)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Investment Type</span>
                  <Badge className={typeColor}>{typeLabel}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Investor Eligibility</span>
                  <Badge className={exemptionColor}>{exemptionLabel}</Badge>
                </div>

                <Button className="w-full" size="lg" onClick={() => setShowInvestModal(true)}>
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "Financials" && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {business.annual_revenue && (
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Annual Revenue</span>
                    <span className="font-semibold">{formatCurrency(business.annual_revenue)}</span>
                  </div>
                )}

                {business.projected_return && (
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Projected Annual Return</span>
                    <span className="font-semibold text-success">{business.projected_return}%</span>
                  </div>
                )}

                {business.revenue_share_percentage && (
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Revenue Share %</span>
                    <span className="font-semibold">{business.revenue_share_percentage}%</span>
                  </div>
                )}

                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Target Raise</span>
                  <span className="font-semibold">{formatCurrency(business.target_raise)}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Amount Raised</span>
                  <span className="font-semibold text-success">{formatCurrency(business.current_raised)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Use of Funds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Detailed use of funds will be provided in offering documents</p>
                </div>
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
              {business.documents && Array.isArray(business.documents) && business.documents.length > 0 ? (
                <div className="space-y-2">
                  {business.documents.map((doc: any, index: number) => (
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
      </main>

      <BottomNav />

      {/* Investment Modal */}
      {business && (
        <InvestmentModal
          isOpen={showInvestModal}
          onClose={() => setShowInvestModal(false)}
          investmentType="private_business"
          investmentId={business.id}
          title={business.business_name}
          minInvestment={business.min_investment}
          targetRaise={business.target_raise}
          currentRaised={business.current_raised}
        />
      )}
    </div>
  );
}
