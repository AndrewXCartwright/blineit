import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  FileText,
  Download,
  ExternalLink,
  ArrowLeft,
  PieChart
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const InstitutionalInvestmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock investment data
  const investment = {
    id,
    name: "Sunbelt Multifamily Fund III",
    type: "Private Equity Fund",
    status: "active",
    investedAmount: 250000,
    investedDate: "2024-01-15",
    currentValue: 267500,
    unrealizedGain: 17500,
    gainPercent: 7.0,
    distributionsYTD: 8750,
    totalDistributions: 12500,
    irrToDate: 14.2,
    targetIRR: 16,
    ownershipPercent: 0.25,
    nextDistribution: {
      date: "2025-03-31",
      estimatedAmount: 3125
    },
    exitDate: "2029-01-15",
    holdPeriod: "5 years",
    structure: "LLC Class A Units",
    distributions: [
      { date: "2024-12-31", amount: 3750, type: "Quarterly Distribution" },
      { date: "2024-09-30", amount: 3125, type: "Quarterly Distribution" },
      { date: "2024-06-30", amount: 3125, type: "Quarterly Distribution" },
      { date: "2024-03-31", amount: 2500, type: "Quarterly Distribution" }
    ],
    documents: [
      { name: "Q4 2024 Quarterly Report", date: "2025-01-15", type: "report" },
      { name: "2024 K-1 Tax Document", date: "2025-02-28", type: "tax" },
      { name: "Capital Account Statement", date: "2025-01-01", type: "statement" },
      { name: "Subscription Agreement", date: "2024-01-15", type: "legal" },
      { name: "Operating Agreement", date: "2024-01-15", type: "legal" }
    ],
    updates: [
      { 
        date: "2025-01-15", 
        title: "Q4 2024 Performance Update",
        content: "Strong quarterly performance with 98% occupancy across portfolio properties. Rent growth of 4.2% YoY."
      },
      { 
        date: "2024-10-15", 
        title: "New Acquisition Closed",
        content: "Successfully acquired 256-unit multifamily property in Austin, TX at 15% below replacement cost."
      },
      { 
        date: "2024-07-15", 
        title: "Q2 2024 Distribution",
        content: "Quarterly distribution of $3,125 paid to your account. Represents 5% annualized yield on invested capital."
      }
    ],
    properties: [
      { name: "Oakwood Apartments", location: "Austin, TX", units: 256, occupancy: 97 },
      { name: "Palm Gardens", location: "Phoenix, AZ", units: 312, occupancy: 98 },
      { name: "Riverside Commons", location: "Tampa, FL", units: 198, occupancy: 99 }
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-display font-bold text-lg">Investment Details</h1>
        </div>
      </header>
      
      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{investment.name}</h1>
              <Badge variant="secondary">{investment.type}</Badge>
            </div>
            <p className="text-muted-foreground">
              Invested {investment.investedDate} • {investment.ownershipPercent}% ownership
            </p>
          </div>
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            Active
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs">Invested</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(investment.investedAmount)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Current Value</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(investment.currentValue)}</p>
              <p className="text-xs text-green-500">+{investment.gainPercent}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <PieChart className="h-4 w-4" />
                <span className="text-xs">IRR to Date</span>
              </div>
              <p className="text-xl font-bold">{investment.irrToDate}%</p>
              <p className="text-xs text-muted-foreground">Target: {investment.targetIRR}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Distributions YTD</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(investment.distributionsYTD)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Next Distribution */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Next Expected Distribution</p>
                <p className="text-lg font-bold">{formatCurrency(investment.nextDistribution.estimatedAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Expected Date</p>
                <p className="font-medium">{investment.nextDistribution.date}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="distributions">Distributions</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Investment Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Structure</p>
                    <p className="font-medium">{investment.structure}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hold Period</p>
                    <p className="font-medium">{investment.holdPeriod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected Exit</p>
                    <p className="font-medium">{investment.exitDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ownership</p>
                    <p className="font-medium">{investment.ownershipPercent}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Properties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Portfolio Properties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {investment.properties.map((property, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <p className="text-sm text-muted-foreground">{property.location} • {property.units} units</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{property.occupancy}%</p>
                        <p className="text-xs text-muted-foreground">Occupancy</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distributions" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Distribution History</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Total: {formatCurrency(investment.totalDistributions)}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {investment.distributions.map((dist, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{dist.type}</p>
                        <p className="text-sm text-muted-foreground">{dist.date}</p>
                      </div>
                      <p className="font-bold text-green-500">+{formatCurrency(dist.amount)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Documents</CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {investment.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="updates" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Investment Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investment.updates.map((update, index) => (
                    <div key={index} className="border-l-2 border-primary pl-4 pb-4">
                      <p className="text-xs text-muted-foreground mb-1">{update.date}</p>
                      <p className="font-medium mb-1">{update.title}</p>
                      <p className="text-sm text-muted-foreground">{update.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/institutional/reports')}>
            <FileText className="h-4 w-4 mr-2" />
            View K-1
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => navigate('/institutional/contact')}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Contact RM
          </Button>
        </div>
      </main>
    </div>
  );
};

export default InstitutionalInvestmentDetail;
