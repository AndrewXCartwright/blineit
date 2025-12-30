import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsorDeals } from "@/hooks/useSponsorDeals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Building2, 
  Edit,
  Eye,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  FileText,
  Download,
  Send,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  MessageSquare,
  Plus
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-500/20 text-yellow-600",
  under_review: "bg-yellow-500/20 text-yellow-600",
  active: "bg-green-500/20 text-green-600",
  funded: "bg-blue-500/20 text-blue-600",
  exited: "bg-purple-500/20 text-purple-600",
  closed: "bg-gray-500/20 text-gray-600",
};

// Mock data for investors
const mockInvestors = [
  { id: "1", name: "John Smith", amount: 25000, tokens: 250, date: "2024-01-15", kyc: "verified", accreditation: "verified" },
  { id: "2", name: "Sarah Johnson", amount: 50000, tokens: 500, date: "2024-01-18", kyc: "verified", accreditation: "verified" },
  { id: "3", name: "Michael Chen", amount: 10000, tokens: 100, date: "2024-01-20", kyc: "pending", accreditation: "pending" },
  { id: "4", name: "Emily Davis", amount: 75000, tokens: 750, date: "2024-01-22", kyc: "verified", accreditation: "verified" },
  { id: "5", name: "Robert Wilson", amount: 15000, tokens: 150, date: "2024-01-25", kyc: "verified", accreditation: "pending" },
];

// Mock data for distributions
const mockDistributions = [
  { id: "1", date: "2024-03-01", type: "Quarterly", amount: 15000, status: "paid" },
  { id: "2", date: "2024-06-01", type: "Quarterly", amount: 15500, status: "paid" },
  { id: "3", date: "2024-09-01", type: "Quarterly", amount: 16200, status: "scheduled" },
];

// Mock data for documents
const mockDocuments = [
  { id: "1", name: "Private Placement Memorandum.pdf", category: "Legal", uploadDate: "2024-01-01", downloads: 47, investorVisible: true },
  { id: "2", name: "Subscription Agreement.pdf", category: "Legal", uploadDate: "2024-01-01", downloads: 52, investorVisible: true },
  { id: "3", name: "Operating Agreement.pdf", category: "Legal", uploadDate: "2024-01-01", downloads: 38, investorVisible: true },
  { id: "4", name: "Q1 2024 Financial Report.pdf", category: "Financial", uploadDate: "2024-04-15", downloads: 23, investorVisible: true },
  { id: "5", name: "Property Inspection Report.pdf", category: "Reports", uploadDate: "2024-01-10", downloads: 31, investorVisible: true },
  { id: "6", name: "Internal Pro Forma.xlsx", category: "Other", uploadDate: "2024-01-05", downloads: 0, investorVisible: false },
];

// Mock data for activity
const mockActivity = [
  { id: "1", type: "distribution", title: "Distribution recorded", description: "Q2 distribution of $15,500 sent to investors", timestamp: "2024-06-01T10:00:00Z", icon: DollarSign },
  { id: "2", type: "milestone", title: "Milestone reached", description: "Deal reached 100% funded", timestamp: "2024-02-15T14:30:00Z", icon: CheckCircle2 },
  { id: "3", type: "investor", title: "New investment", description: "Emily Davis invested $75,000", timestamp: "2024-01-22T09:15:00Z", icon: Users },
  { id: "4", type: "milestone", title: "Milestone reached", description: "Deal reached 75% funded", timestamp: "2024-01-20T16:45:00Z", icon: TrendingUp },
  { id: "5", type: "document", title: "Document uploaded", description: "Property Inspection Report added", timestamp: "2024-01-10T11:20:00Z", icon: FileText },
  { id: "6", type: "milestone", title: "Milestone reached", description: "Deal reached 50% funded", timestamp: "2024-01-18T08:00:00Z", icon: TrendingUp },
  { id: "7", type: "investor", title: "First investment", description: "John Smith invested $25,000", timestamp: "2024-01-15T13:30:00Z", icon: Users },
  { id: "8", type: "approval", title: "Deal approved", description: "Your deal has been reviewed and approved", timestamp: "2024-01-10T09:00:00Z", icon: CheckCircle2 },
  { id: "9", type: "created", title: "Deal created", description: "Oakwood Apartments listed as new deal", timestamp: "2024-01-05T10:00:00Z", icon: Plus },
];

export default function SponsorDealDetail() {
  const { id } = useParams<{ id: string }>();
  const { signOut } = useAuth();
  const { deals, loading } = useSponsorDeals();
  const [activeTab, setActiveTab] = useState("overview");
  const [investorFilter, setInvestorFilter] = useState("all");
  const [investorSearch, setInvestorSearch] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const deal = deals.find(d => d.id === id);

  // Mock property images
  const propertyImages = [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  // Mock raised amount for demo
  const raisedAmount = 175000;
  const fundingProgress = (raisedAmount / deal.raise_goal) * 100;
  const investorCount = mockInvestors.length;
  const daysLeft = 45; // Mock

  const filteredInvestors = mockInvestors.filter(investor => {
    const matchesSearch = investor.name.toLowerCase().includes(investorSearch.toLowerCase());
    const matchesFilter = investorFilter === "all" || 
      (investorFilter === "pending" && investor.kyc === "pending") ||
      (investorFilter === "verified" && investor.kyc === "verified");
    return matchesSearch && matchesFilter;
  });

  const totalInvested = mockInvestors.reduce((sum, inv) => sum + inv.amount, 0);
  const totalTokens = mockInvestors.reduce((sum, inv) => sum + inv.tokens, 0);

  const handleExportCSV = () => {
    toast.success("Investor list exported to CSV");
  };

  const handleMessageAll = () => {
    toast.success("Message composer opened");
  };

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
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div>
            <Link 
              to="/sponsor/deals" 
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Deals
            </Link>
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
              <Eye className="h-4 w-4 mr-2" />
              View as Investor
            </Button>
            {(deal.status === "draft" || deal.status === "active") && (
              <Button asChild size="sm">
                <Link to={`/sponsor/deals/${deal.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Deal
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Hero Stats Row */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {/* Raised Amount */}
              <div className="lg:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Capital Raised</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold">{formatCurrency(raisedAmount)}</span>
                  <span className="text-muted-foreground">of {formatCurrency(deal.raise_goal)}</span>
                </div>
                <div className="space-y-1">
                  <Progress value={fundingProgress} className="h-3" />
                  <p className="text-sm text-muted-foreground">{fundingProgress.toFixed(1)}% funded</p>
                </div>
              </div>

              {/* Investors */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Investors</p>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">{investorCount}</span>
                </div>
              </div>

              {/* Days Left */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Days Left</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold">
                    {fundingProgress >= 100 ? "Funded" : daysLeft}
                  </span>
                </div>
              </div>

              {/* Projected IRR */}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Projected IRR</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">{deal.projected_irr}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="investors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Investors
            </TabsTrigger>
            <TabsTrigger value="financials" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financials
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Property Images Carousel */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Property Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={propertyImages[currentImageIndex]} 
                      alt={`Property ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-between p-2">
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 rounded-full opacity-80"
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === 0 ? propertyImages.length - 1 : prev - 1
                        )}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="icon" 
                        className="h-8 w-8 rounded-full opacity-80"
                        onClick={() => setCurrentImageIndex((prev) => 
                          prev === propertyImages.length - 1 ? 0 : prev + 1
                        )}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {propertyImages.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? "bg-white" : "bg-white/50"
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-medium">{deal.property_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium text-right">{deal.street_address}<br />{deal.city}, {deal.state} {deal.zip_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Year Built</span>
                    <span className="font-medium">{deal.year_built || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Units/SF</span>
                    <span className="font-medium">{deal.total_units?.toLocaleString() || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium">{deal.current_occupancy}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Deal Structure & Returns */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Deal Structure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Investment Type</span>
                    <span className="font-medium">{deal.investment_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Token Price</span>
                    <span className="font-medium">{formatCurrency(deal.token_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Investment</span>
                    <span className="font-medium">{formatCurrency(deal.minimum_investment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hold Period</span>
                    <span className="font-medium">{deal.hold_period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distribution</span>
                    <span className="font-medium">{deal.distribution_frequency}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Returns Breakdown
                  </CardTitle>
                  <CardDescription>Projected distribution of returns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-green-500" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Investor Return (Pref)</span>
                          <span className="font-medium">{deal.preferred_return}%</span>
                        </div>
                        <div className="h-2 bg-green-500/20 rounded mt-1">
                          <div className="h-full bg-green-500 rounded" style={{ width: "60%" }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-blue-500" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Sponsor Promote</span>
                          <span className="font-medium">{deal.sponsor_promote}%</span>
                        </div>
                        <div className="h-2 bg-blue-500/20 rounded mt-1">
                          <div className="h-full bg-blue-500 rounded" style={{ width: "35%" }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-orange-500" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Platform Fee</span>
                          <span className="font-medium">0.5%</span>
                        </div>
                        <div className="h-2 bg-orange-500/20 rounded mt-1">
                          <div className="h-full bg-orange-500 rounded" style={{ width: "5%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Investors Tab */}
          <TabsContent value="investors" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Investors</CardTitle>
                    <CardDescription>{investorCount} investors in this deal</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button size="sm" onClick={handleMessageAll}>
                      <Send className="h-4 w-4 mr-2" />
                      Message All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search investors..."
                      value={investorSearch}
                      onChange={(e) => setInvestorSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={investorFilter} onValueChange={setInvestorFilter}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Investors</SelectItem>
                      <SelectItem value="pending">Pending KYC</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Investors Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Investor</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Tokens</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">KYC</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Accreditation</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvestors.map((investor) => (
                        <tr key={investor.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <p className="font-medium">{investor.name}</p>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">{formatCurrency(investor.amount)}</td>
                          <td className="py-3 px-4 text-right">{investor.tokens.toLocaleString()}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(investor.date)}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge 
                              variant="secondary"
                              className={investor.kyc === "verified" ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600"}
                            >
                              {investor.kyc}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge 
                              variant="secondary"
                              className={investor.accreditation === "verified" ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600"}
                            >
                              {investor.accreditation}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50 font-medium">
                        <td className="py-3 px-4">Total ({filteredInvestors.length} investors)</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(totalInvested)}</td>
                        <td className="py-3 px-4 text-right">{totalTokens.toLocaleString()}</td>
                        <td colSpan={4}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="space-y-6 mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Capital Stack */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Capital Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Senior Debt</span>
                        <span>60%</span>
                      </div>
                      <div className="h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-medium">
                        $600,000
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mezzanine</span>
                        <span>15%</span>
                      </div>
                      <div className="h-6 bg-purple-500 rounded flex items-center justify-center text-white text-sm font-medium">
                        $150,000
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Equity (This Raise)</span>
                        <span>25%</span>
                      </div>
                      <div className="h-6 bg-green-500 rounded flex items-center justify-center text-white text-sm font-medium">
                        $250,000
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Distribution */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Upcoming Distribution</CardTitle>
                    <Button size="sm">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Record Distribution
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Q3 2024 Distribution</span>
                      <Badge>Scheduled</Badge>
                    </div>
                    <p className="text-2xl font-bold mb-1">{formatCurrency(16200)}</p>
                    <p className="text-sm text-muted-foreground">Scheduled for September 1, 2024</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution History */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution History</CardTitle>
                <CardDescription>All distributions made to investors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockDistributions.map((dist) => (
                        <tr key={dist.id} className="border-b last:border-0">
                          <td className="py-3 px-4">{formatDate(dist.date)}</td>
                          <td className="py-3 px-4">{dist.type}</td>
                          <td className="py-3 px-4 text-right font-medium">{formatCurrency(dist.amount)}</td>
                          <td className="py-3 px-4 text-right">
                            <Badge 
                              variant="secondary"
                              className={dist.status === "paid" ? "bg-green-500/20 text-green-600" : "bg-blue-500/20 text-blue-600"}
                            >
                              {dist.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Manage deal documents and investor access</CardDescription>
                  </div>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Document</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Upload Date</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Downloads</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Investor Visible</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockDocuments.map((doc) => (
                        <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{doc.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{doc.category}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{formatDate(doc.uploadDate)}</td>
                          <td className="py-3 px-4 text-center text-sm">{doc.downloads}</td>
                          <td className="py-3 px-4 text-center">
                            <Switch checked={doc.investorVisible} />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>Complete history of deal events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  
                  <div className="space-y-6">
                    {mockActivity.map((event, index) => {
                      const Icon = event.icon;
                      return (
                        <div key={event.id} className="relative flex gap-4 pl-10">
                          {/* Timeline dot */}
                          <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            event.type === "milestone" ? "bg-green-500/20" :
                            event.type === "distribution" ? "bg-blue-500/20" :
                            event.type === "investor" ? "bg-purple-500/20" :
                            event.type === "approval" ? "bg-green-500/20" :
                            "bg-muted"
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              event.type === "milestone" ? "text-green-500" :
                              event.type === "distribution" ? "text-blue-500" :
                              event.type === "investor" ? "text-purple-500" :
                              event.type === "approval" ? "text-green-500" :
                              "text-muted-foreground"
                            }`} />
                          </div>
                          
                          <div className="flex-1 pt-1">
                            <p className="font-medium">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{event.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(event.timestamp).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
