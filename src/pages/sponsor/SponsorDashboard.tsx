import { useState } from "react";
import { Link } from "react-router-dom";
import { useSponsor } from "@/hooks/useSponsor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Plus,
  MessageSquare,
  FileText,
  BarChart3,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bell,
  LogOut,
  ChevronRight,
  Target,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { formatCurrency } from "@/lib/formatters";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { SponsorOnboardingChecklist } from "@/components/sponsor/SponsorOnboardingChecklist";

// Mock data for the dashboard
const mockDeals = [
  {
    id: "1",
    name: "Sunset Plaza Apartments",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
    raiseGoal: 2500000,
    raised: 1875000,
    percentFunded: 75,
    daysRemaining: 18,
    investorCount: 142,
    projectedIrr: 18.5,
    status: "active",
  },
  {
    id: "2",
    name: "Harbor View Office",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    raiseGoal: 5000000,
    raised: 3250000,
    percentFunded: 65,
    daysRemaining: 24,
    investorCount: 89,
    projectedIrr: 15.2,
    status: "active",
  },
  {
    id: "3",
    name: "Downtown Retail Center",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
    raiseGoal: 3000000,
    raised: 3000000,
    percentFunded: 100,
    daysRemaining: 0,
    investorCount: 215,
    projectedIrr: 16.8,
    status: "funded",
  },
  {
    id: "4",
    name: "Industrial Park Phase 2",
    image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400",
    raiseGoal: 4000000,
    raised: 4000000,
    percentFunded: 100,
    daysRemaining: 0,
    investorCount: 178,
    projectedIrr: 22.4,
    status: "exited",
    actualIrr: 24.1,
  },
  {
    id: "5",
    name: "Riverfront Mixed Use",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400",
    raiseGoal: 6000000,
    raised: 0,
    percentFunded: 0,
    daysRemaining: null,
    investorCount: 0,
    projectedIrr: 19.0,
    status: "draft",
  },
];

const mockChartData = [
  { month: "Jan", raised: 1200000 },
  { month: "Feb", raised: 1850000 },
  { month: "Mar", raised: 2400000 },
  { month: "Apr", raised: 3100000 },
  { month: "May", raised: 4250000 },
  { month: "Jun", raised: 5125000 },
  { month: "Jul", raised: 6800000 },
  { month: "Aug", raised: 7500000 },
  { month: "Sep", raised: 8125000 },
  { month: "Oct", raised: 9250000 },
  { month: "Nov", raised: 10500000 },
  { month: "Dec", raised: 12125000 },
];

const mockActivity = [
  { id: 1, type: "investment", investor: "John D.", amount: 25000, deal: "Sunset Plaza Apartments", time: "2 hours ago" },
  { id: 2, type: "milestone", message: "Sunset Plaza reached 75% funded!", time: "5 hours ago" },
  { id: 3, type: "investment", investor: "Sarah M.", amount: 50000, deal: "Harbor View Office", time: "8 hours ago" },
  { id: 4, type: "document", message: "New K-1 document requested", deal: "Downtown Retail Center", time: "1 day ago" },
  { id: 5, type: "message", investor: "Michael R.", deal: "Sunset Plaza Apartments", time: "1 day ago" },
  { id: 6, type: "investment", investor: "Emily K.", amount: 15000, deal: "Sunset Plaza Apartments", time: "2 days ago" },
  { id: 7, type: "milestone", message: "Harbor View reached 50% funded!", time: "3 days ago" },
  { id: 8, type: "investment", investor: "David L.", amount: 100000, deal: "Harbor View Office", time: "3 days ago" },
  { id: 9, type: "document", message: "Quarterly report uploaded", deal: "Downtown Retail Center", time: "4 days ago" },
  { id: 10, type: "investment", investor: "Lisa W.", amount: 35000, deal: "Sunset Plaza Apartments", time: "5 days ago" },
];

export default function SponsorDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { sponsorProfile, isVerified, loading } = useSponsor();
  const [dealTab, setDealTab] = useState("active");
  const [chartPeriod, setChartPeriod] = useState("year");

  const handleSignOut = async () => {
    await signOut();
    navigate("/sponsor/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredDeals = mockDeals.filter((deal) => deal.status === dealTab);

  // Calculate stats
  const totalRaised = mockDeals.reduce((sum, deal) => sum + deal.raised, 0);
  const activeDeals = mockDeals.filter((d) => d.status === "active").length;
  const totalInvestors = mockDeals.reduce((sum, deal) => sum + deal.investorCount, 0);
  const platformFees = totalRaised * 0.005;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-8 w-auto" />
            <Badge variant="secondary" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              Sponsor
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
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
                Manage your deals and track investor activity
              </p>
            </div>
          </div>
          <Button className="gap-2" asChild>
            <Link to="/sponsor/deals/new">
              <Plus className="h-4 w-4" />
              List New Deal
            </Link>
          </Button>
        </div>

        {/* Quick Stats Row */}
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
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                +12.5% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Deals</p>
                  <p className="text-xl font-bold">{activeDeals}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-amber-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Currently raising</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Total Investors</p>
                  <p className="text-xl font-bold">{totalInvestors.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                +28 this week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Platform Fees YTD</p>
                  <p className="text-xl font-bold">{formatCurrency(platformFees)}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">0.5% AUM fee</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Your Deals Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Your Deals</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/sponsor/deals">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={dealTab} onValueChange={setDealTab}>
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="active">Active ({mockDeals.filter(d => d.status === 'active').length})</TabsTrigger>
                    <TabsTrigger value="funded">Funded ({mockDeals.filter(d => d.status === 'funded').length})</TabsTrigger>
                    <TabsTrigger value="exited">Exited ({mockDeals.filter(d => d.status === 'exited').length})</TabsTrigger>
                    <TabsTrigger value="draft">Draft ({mockDeals.filter(d => d.status === 'draft').length})</TabsTrigger>
                  </TabsList>

                  <div className="space-y-3">
                    {filteredDeals.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>No {dealTab} deals</p>
                        {dealTab === "draft" && (
                          <Button variant="link" asChild className="mt-2">
                            <Link to="/sponsor/deals/new">Create your first deal</Link>
                          </Button>
                        )}
                      </div>
                    ) : (
                      filteredDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <img
                            src={deal.image}
                            alt={deal.name}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium truncate">{deal.name}</h4>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {deal.investorCount}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    {deal.status === "exited" ? deal.actualIrr : deal.projectedIrr}% IRR
                                  </span>
                                  {deal.daysRemaining !== null && deal.daysRemaining > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {deal.daysRemaining}d left
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge
                                variant={
                                  deal.status === "active"
                                    ? "default"
                                    : deal.status === "funded"
                                    ? "secondary"
                                    : deal.status === "exited"
                                    ? "outline"
                                    : "secondary"
                                }
                                className="capitalize flex-shrink-0"
                              >
                                {deal.status}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">
                                  {formatCurrency(deal.raised)} / {formatCurrency(deal.raiseGoal)}
                                </span>
                                <span className="font-medium">{deal.percentFunded}%</span>
                              </div>
                              <Progress value={deal.percentFunded} className="h-1.5" />
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="self-center" asChild>
                            <Link to={`/sponsor/deals/${deal.id}`}>
                              View
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>

            {/* Performance Chart */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Capital Raised Over Time</CardTitle>
                  <div className="flex gap-1">
                    {["month", "quarter", "year", "all"].map((period) => (
                      <Button
                        key={period}
                        variant={chartPeriod === period ? "default" : "ghost"}
                        size="sm"
                        className="h-7 text-xs capitalize"
                        onClick={() => setChartPeriod(period)}
                      >
                        {period === "all" ? "All Time" : `This ${period}`}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [formatCurrency(value), "Raised"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="raised"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-muted-foreground">This Period</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="h-4 w-4" />
                    +45% vs previous period
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Onboarding Checklist - shows until complete */}
            <SponsorOnboardingChecklist />

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link to="/sponsor/deals/new">
                    <Plus className="h-4 w-4" />
                    List New Deal
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link to="/sponsor/messages">
                    <MessageSquare className="h-4 w-4" />
                    Message Investors
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link to="/sponsor/documents">
                    <FileText className="h-4 w-4" />
                    Upload Documents
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link to="/sponsor/reports">
                    <BarChart3 className="h-4 w-4" />
                    View Reports
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link to="/help">
                    <HelpCircle className="h-4 w-4" />
                    Get Support
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                    <Link to="/sponsor/activity">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {mockActivity.map((item) => (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.type === "investment"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : item.type === "milestone"
                            ? "bg-amber-500/10 text-amber-600"
                            : item.type === "document"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-purple-500/10 text-purple-600"
                        }`}
                      >
                        {item.type === "investment" ? (
                          <DollarSign className="h-4 w-4" />
                        ) : item.type === "milestone" ? (
                          <Target className="h-4 w-4" />
                        ) : item.type === "document" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <MessageSquare className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {item.type === "investment" ? (
                          <p className="truncate">
                            <span className="font-medium">{item.investor}</span> invested{" "}
                            <span className="text-emerald-600">{formatCurrency(item.amount!)}</span> in{" "}
                            {item.deal}
                          </p>
                        ) : item.type === "milestone" ? (
                          <p className="truncate">{item.message}</p>
                        ) : item.type === "document" ? (
                          <p className="truncate">{item.message}</p>
                        ) : (
                          <p className="truncate">
                            New message from <span className="font-medium">{item.investor}</span>
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span>Platform Fee: 0.5% annually on AUM</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Next billing: January 15, 2025</span>
              </div>
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link to="/sponsor/billing">Manage Billing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
