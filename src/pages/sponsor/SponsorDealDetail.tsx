import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsorDeals } from "@/hooks/useSponsorDeals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  ArrowLeft, 
  Building2, 
  Edit,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Share2,
  BarChart3
} from "lucide-react";
import logo from "@/assets/logo.png";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-500/20 text-yellow-600",
  active: "bg-green-500/20 text-green-600",
  funded: "bg-blue-500/20 text-blue-600",
  closed: "bg-gray-500/20 text-gray-600",
};

export default function SponsorDealDetail() {
  const { id } = useParams<{ id: string }>();
  const { signOut } = useAuth();
  const { deals, loading } = useSponsorDeals();
  
  const deal = deals.find(d => d.id === id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Deal Not Found</h1>
        <p className="text-muted-foreground mb-4">The deal you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/sponsor/deals">Back to Deals</Link>
        </Button>
      </div>
    );
  }

  const fundingProgress = 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/sponsor/dashboard">
              <img src={logo} alt="Logo" className="h-8 w-auto" />
            </Link>
            <Badge variant="secondary" className="hidden sm:flex">
              <Building2 className="h-3 w-3 mr-1" />
              Sponsor
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/sponsor/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link to="/sponsor/deals" className="hover:text-foreground">Deals</Link>
          <span>/</span>
          <span className="text-foreground">{deal.property_name}</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{deal.property_name}</h1>
              <Badge className={statusColors[deal.status] || "bg-muted"}>
                {deal.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {deal.property_type} • {deal.city}, {deal.state}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button asChild size="sm">
              <Link to={`/sponsor/deals/${deal.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Deal
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Raised</p>
                  <p className="text-xl font-bold">{formatCurrency(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Investors</p>
                  <p className="text-xl font-bold">{deal.investor_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Projected IRR</p>
                  <p className="text-xl font-bold">{deal.projected_irr}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Calendar className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hold Period</p>
                  <p className="text-xl font-bold">{deal.hold_period}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Funding Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Funding Progress</CardTitle>
            <CardDescription>
              {formatCurrency(0)} of {formatCurrency(deal.raise_goal)} raised
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{fundingProgress.toFixed(1)}% funded</span>
                <span>{formatCurrency(deal.raise_goal)} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="investors">Investors</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{deal.property_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{deal.city}, {deal.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year Built</span>
                    <span className="font-medium">{deal.year_built || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Units/SF</span>
                    <span className="font-medium">{deal.total_units?.toLocaleString() || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium">{deal.current_occupancy}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Deal Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Type</span>
                    <span className="font-medium">{deal.investment_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token Price</span>
                    <span className="font-medium">{formatCurrency(deal.token_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum Investment</span>
                    <span className="font-medium">{formatCurrency(deal.minimum_investment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preferred Return</span>
                    <span className="font-medium">{deal.preferred_return}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sponsor Promote</span>
                    <span className="font-medium">{deal.sponsor_promote}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="investors" className="mt-4">
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Investors Yet</h3>
                <p className="text-muted-foreground">
                  Investors will appear here once they commit to your deal.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Documents</h3>
                <p className="text-muted-foreground">
                  PPM, subscription agreements, and other documents will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <Card>
              <CardContent className="p-12 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  View detailed analytics about your deal's performance.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
