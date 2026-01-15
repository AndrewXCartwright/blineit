import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, TrendingUp, Users, FileText, Building2, ExternalLink, Linkedin, Calendar, Target, DollarSign, Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useVCFund } from "@/hooks/useVCFunds";
import { useState } from "react";
import { InvestmentModal } from "@/components/shared/InvestmentModal";

const stageLabels: Record<string, string> = {
  emerging: "Emerging Manager",
  established: "Established",
  flagship: "Flagship Fund",
};

const stageColors: Record<string, string> = {
  emerging: "bg-purple-500/10 text-purple-500",
  established: "bg-blue-500/10 text-blue-500",
  flagship: "bg-amber-500/10 text-amber-500",
};

const exemptionLabels: Record<string, string> = {
  reg_cf: "Reg CF - Open to All",
  reg_d_506c: "Reg D 506(c) - Accredited Only",
  reg_d_506b: "Reg D 506(b) - Accredited Only",
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

export default function VCFundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fund, loading, error } = useVCFund(id);
  const [showInvestModal, setShowInvestModal] = useState(false);

  const defaultImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800";

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <div className="mt-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || "Fund not found"}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const progress = (fund.current_raised / fund.target_fund_size) * 100;
  const remainingToRaise = fund.target_fund_size - fund.current_raised;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold truncate max-w-[200px]">{fund.fund_name}</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <img
          src={fund.image_url || defaultImage}
          alt={fund.fund_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            {fund.fund_stage && (
              <Badge className={`${stageColors[fund.fund_stage]} border-0`}>
                {stageLabels[fund.fund_stage] || fund.fund_stage}
              </Badge>
            )}
          </div>
          <h2 className="text-2xl font-bold">{fund.fund_name}</h2>
          <div className="flex items-center gap-2 mt-1 text-sm opacity-90">
            <Building2 className="w-4 h-4" />
            <span>{fund.fund_manager}</span>
            {fund.location_city && fund.location_state && (
              <>
                <span>•</span>
                <MapPin className="w-4 h-4" />
                <span>{fund.location_city}, {fund.location_state}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="px-4 mt-4">
        <TabsList className="w-full grid grid-cols-5 h-auto">
          <TabsTrigger value="overview" className="text-xs py-2">Overview</TabsTrigger>
          <TabsTrigger value="team" className="text-xs py-2">Team</TabsTrigger>
          <TabsTrigger value="track-record" className="text-xs py-2">Track Record</TabsTrigger>
          <TabsTrigger value="portfolio" className="text-xs py-2">Portfolio</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs py-2">Docs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* GP */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">General Partners</p>
              <p className="font-medium">{fund.gp_name}</p>
            </CardContent>
          </Card>

          {/* Investment Thesis */}
          {fund.thesis && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Investment Thesis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{fund.thesis}</p>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {fund.description && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">About the Fund</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{fund.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Fund Progress */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Fundraising Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Raised</span>
                <span className="font-medium">{formatCurrency(fund.current_raised)}</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target</span>
                <span className="font-medium">{formatCurrency(fund.target_fund_size)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {formatCurrency(remainingToRaise)} remaining to close
              </p>
            </CardContent>
          </Card>

          {/* Fund Terms */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Fund Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Target Fund Size</p>
                  <p className="font-medium">{formatCurrency(fund.target_fund_size)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Minimum Investment</p>
                  <p className="font-medium">{formatCurrency(fund.min_investment)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Management Fee</p>
                  <p className="font-medium">{fund.management_fee}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Carried Interest</p>
                  <p className="font-medium">{fund.carried_interest}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Fund Term</p>
                  <p className="font-medium">{fund.fund_term_years} years</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Vintage Year</p>
                  <p className="font-medium">{fund.vintage_year || "2024"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Investment Focus</p>
                  <p className="font-medium">{fund.investment_focus || "Generalist"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Target Portfolio</p>
                  <p className="font-medium">{fund.target_portfolio_size || "20-30"} companies</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-xs text-muted-foreground">Exemption Type</p>
                  <Badge variant="outline" className="mt-1">
                    {exemptionLabels[fund.exemption_type] || fund.exemption_type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4 mt-4">
          {fund.team.length > 0 ? (
            fund.team.map((member, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {member.image_url ? (
                      <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.title}</p>
                    {member.bio && <p className="text-sm mt-2">{member.bio}</p>}
                    {member.linkedin_url && (
                      <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto" asChild>
                        <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4 mr-1" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Team information coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">GP: {fund.gp_name}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Track Record Tab */}
        <TabsContent value="track-record" className="space-y-4 mt-4">
          {fund.track_record.length > 0 ? (
            <>
              {fund.track_record.map((record, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{record.fund}</h3>
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        {record.vintage}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-emerald-500">{record.tvpi}x</p>
                        <p className="text-xs text-muted-foreground">TVPI</p>
                      </div>
                      <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-500">{record.irr}%</p>
                        <p className="text-xs text-muted-foreground">Net IRR</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  <p><strong>Note:</strong> Past performance is not indicative of future results. TVPI = Total Value to Paid-In. IRR = Internal Rate of Return.</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">This is an emerging manager's debut fund</p>
                <p className="text-sm text-muted-foreground mt-1">No prior fund track record available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-4 mt-4">
          {fund.portfolio_companies.length > 0 ? (
            fund.portfolio_companies.map((company, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground">
                        {company.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{company.name}</h3>
                      {company.status && (
                        <Badge variant="outline" className="text-xs">{company.status}</Badge>
                      )}
                    </div>
                    {company.description && (
                      <p className="text-sm text-muted-foreground mt-1">{company.description}</p>
                    )}
                    {company.website_url && (
                      <Button variant="link" size="sm" className="p-0 h-auto mt-1" asChild>
                        <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Portfolio building in progress</p>
                <p className="text-sm text-muted-foreground mt-1">Target: {fund.target_portfolio_size || "20-30"} companies</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4 mt-4">
          {fund.documents.length > 0 ? (
            fund.documents.map((doc: any, index: number) => (
              <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.type || "Document"}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Documents available upon request</p>
                <p className="text-sm text-muted-foreground mt-1">PPM, LPA, and subscription documents</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Investment CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Minimum Investment</p>
            <p className="text-lg font-bold">{formatCurrency(fund.min_investment)}</p>
          </div>
          <Button size="lg" className="flex-1 max-w-xs" onClick={() => setShowInvestModal(true)}>
            Invest in Fund
          </Button>
        </div>
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={showInvestModal}
        onClose={() => setShowInvestModal(false)}
        investmentType="vc_fund"
        investmentId={fund.id}
        title={fund.fund_name}
        pricePerToken={1}
        minInvestment={fund.min_investment}
        targetRaise={fund.target_fund_size}
        currentRaised={fund.current_raised}
        requiresAccreditation={fund.exemption_type !== 'reg_cf'}
      />
    </div>
  );
}
