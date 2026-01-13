import { Link, useNavigate } from "react-router-dom";
import { useSponsor } from "@/hooks/useSponsor";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Percent,
  Clock,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

// Mock data for sponsor properties (when user is sponsor)
const mockProperties = [
  {
    id: "1",
    title: "Sunset Plaza Apartments",
    status: "active",
    raised: 1875000,
    goal: 2500000,
    investors: 142,
  },
  {
    id: "2",
    title: "Harbor View Office",
    status: "active",
    raised: 3250000,
    goal: 5000000,
    investors: 89,
  },
  {
    id: "3",
    title: "Downtown Retail Center",
    status: "funded",
    raised: 3000000,
    goal: 3000000,
    investors: 215,
  },
  {
    id: "4",
    title: "Riverfront Mixed Use",
    status: "draft",
    raised: 0,
    goal: 6000000,
    investors: 0,
  },
];

const benefits = [
  {
    icon: DollarSign,
    title: "Access to Capital",
    description: "Tap into our network of accredited investors ready to fund quality deals",
  },
  {
    icon: Shield,
    title: "Tokenization Infrastructure",
    description: "Best-in-class blockchain technology for seamless property tokenization",
  },
  {
    icon: Globe,
    title: "Investor Network",
    description: "Reach 1,000+ verified accredited investors actively seeking opportunities",
  },
  {
    icon: Percent,
    title: "Competitive Fees",
    description: "Industry-low platform fees with transparent pricing and no hidden costs",
  },
];

const stats = [
  { value: "$1.75B+", label: "Committed Assets" },
  { value: "1,000+", label: "Accredited Investors" },
  { value: "50+", label: "Successful Offerings" },
  { value: "18%", label: "Avg. Investor IRR" },
];

// Marketing Landing Page for non-sponsors
function SponsorMarketingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-bull/10 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Building2 className="h-3 w-3 mr-1" />
              Sponsor Portal
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              List Your Property on B-LINE-IT
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Access institutional-grade tokenization infrastructure and connect with our network of accredited investors to fund your real estate projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate("/sponsor/apply")} className="gap-2">
                Apply to Become a Sponsor
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/sponsor/login")}>
                Existing Sponsor? Sign In
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4 border-b">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">Why List with B-LINE-IT?</h2>
              <p className="text-muted-foreground">
                Everything you need to tokenize and fund your real estate projects
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground">Simple process to list your property</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: 1, title: "Apply", description: "Submit your application with property portfolio details" },
                { step: 2, title: "Onboard", description: "Complete verification and set up your sponsor profile" },
                { step: 3, title: "List", description: "Create offerings and start raising capital from investors" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-6">
              Join leading real estate sponsors who are already raising capital on B-LINE-IT
            </p>
            <Button size="lg" onClick={() => navigate("/sponsor/apply")} className="gap-2">
              Apply to Become a Sponsor
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

// Sponsor Dashboard for approved sponsors
function SponsorDashboardView() {
  const navigate = useNavigate();
  const { sponsorProfile, isVerified } = useSponsor();

  const totalRaised = mockProperties.reduce((sum, p) => sum + p.raised, 0);
  const activeOfferings = mockProperties.filter((p) => p.status === "active").length;
  const pendingInvestments = 12; // Mock
  const totalInvestors = mockProperties.reduce((sum, p) => sum + p.investors, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-4 py-6 pb-24 max-w-4xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              {sponsorProfile?.company_logo_url ? (
                <img
                  src={sponsorProfile.company_logo_url}
                  alt="Company"
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <Building2 className="h-7 w-7 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  Welcome back, {sponsorProfile?.company_name || "Sponsor"}
                </h1>
                {isVerified && (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Manage your properties and track investor activity
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/sponsor/properties/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Property
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Raised</p>
                  <p className="text-xl font-bold">{formatCurrency(totalRaised)}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Offerings</p>
                  <p className="text-xl font-bold">{activeOfferings}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-bull/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-bull" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Pending Investments</p>
                  <p className="text-xl font-bold">{pendingInvestments}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Investors</p>
                  <p className="text-xl font-bold">{totalInvestors}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Properties */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>My Properties</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to="/sponsor/deals">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockProperties.map((property) => (
              <div
                key={property.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/sponsor/deals/${property.id}`)}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium truncate">{property.title}</h4>
                    <Badge
                      variant={
                        property.status === "active"
                          ? "default"
                          : property.status === "funded"
                          ? "secondary"
                          : "outline"
                      }
                      className="capitalize flex-shrink-0"
                    >
                      {property.status}
                    </Badge>
                  </div>
                  <div className="mt-1.5">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {formatCurrency(property.raised)} / {formatCurrency(property.goal)}
                      </span>
                      <span className="font-medium">
                        {Math.round((property.raised / property.goal) * 100)}%
                      </span>
                    </div>
                    <Progress value={(property.raised / property.goal) * 100} className="h-1.5" />
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            ))}

            {mockProperties.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No properties yet</p>
                <Button variant="link" className="mt-2" onClick={() => navigate("/sponsor/properties/new")}>
                  Add your first property
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <BottomNav />
    </div>
  );
}

export default function SponsorLanding() {
  const { user } = useAuth();
  const { sponsorProfile, loading } = useSponsor();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If user is an approved sponsor, show dashboard
  if (user && sponsorProfile && sponsorProfile.verification_status === "verified") {
    return <SponsorDashboardView />;
  }

  // Otherwise show marketing page
  return <SponsorMarketingPage />;
}
