import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsorDeals, DealFormData, initialDealData } from "@/hooks/useSponsorDeals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  ArrowLeft, 
  Building2, 
  Save, 
  AlertCircle, 
  MapPin,
  DollarSign,
  TrendingUp,
  FileText,
  History,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const propertyTypes = ["Multifamily", "Office", "Retail", "Industrial", "Mixed-Use", "Hotel", "Self-Storage", "Land"];
const holdPeriods = ["1-2 years", "3-5 years", "5-7 years", "7-10 years", "10+ years"];
const investmentTypes = ["Equity", "Debt", "Preferred Equity", "Mezzanine"];
const distributionFrequencies = ["Monthly", "Quarterly", "Semi-Annually", "Annually", "At Exit"];
const offeringTypes = ["Reg D 506(b)", "Reg D 506(c)", "Reg A+", "Reg CF"];

// Mock change history
const mockChangeHistory = [
  { id: 1, field: "Raise Goal", oldValue: "$500,000", newValue: "$750,000", changedAt: "2024-01-15T10:30:00Z", changedBy: "John Sponsor" },
  { id: 2, field: "Minimum Investment", oldValue: "$1,000", newValue: "$500", changedAt: "2024-01-14T14:22:00Z", changedBy: "John Sponsor" },
  { id: 3, field: "Property Description", oldValue: "Updated description...", newValue: "New description...", changedAt: "2024-01-10T09:15:00Z", changedBy: "John Sponsor" },
];

export default function SponsorDealEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { deals, loading, updateDeal, saving, getDeal } = useSponsorDeals();
  const [formData, setFormData] = useState<DealFormData>(initialDealData);
  const [activeTab, setActiveTab] = useState("property");
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<DealFormData>(initialDealData);
  
  const deal = deals.find(d => d.id === id);

  useEffect(() => {
    if (deal) {
      const data: DealFormData = {
        property_name: deal.property_name,
        property_type: deal.property_type,
        street_address: deal.street_address,
        city: deal.city,
        state: deal.state,
        zip_code: deal.zip_code,
        property_description: deal.property_description,
        year_built: deal.year_built,
        total_units: deal.total_units,
        total_sqft: deal.total_sqft,
        current_occupancy: deal.current_occupancy,
        property_images: deal.property_images || [],
        property_documents: deal.property_documents || [],
        raise_goal: deal.raise_goal,
        minimum_investment: deal.minimum_investment,
        maximum_investment: deal.maximum_investment,
        token_price: deal.token_price,
        hold_period: deal.hold_period,
        investment_type: deal.investment_type,
        projected_irr: deal.projected_irr,
        preferred_return: deal.preferred_return,
        sponsor_promote: deal.sponsor_promote,
        cash_on_cash_target: deal.cash_on_cash_target,
        distribution_frequency: deal.distribution_frequency,
        management_fee: deal.management_fee,
        acquisition_fee: deal.acquisition_fee,
        offering_type: deal.offering_type,
        accredited_only: deal.accredited_only,
        ppm_document_url: deal.ppm_document_url,
        subscription_agreement_url: deal.subscription_agreement_url,
        operating_agreement_url: deal.operating_agreement_url,
        sec_filing_number: deal.sec_filing_number,
        current_step: deal.current_step,
        status: deal.status,
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [deal]);

  const updateField = (field: keyof DealFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!id) return;
    
    const materialChange = 
      formData.raise_goal !== originalData.raise_goal ||
      formData.minimum_investment !== originalData.minimum_investment ||
      formData.projected_irr !== originalData.projected_irr ||
      formData.preferred_return !== originalData.preferred_return;

    const success = await updateDeal(id, formData);
    
    if (success) {
      if (materialChange && deal?.status !== "draft") {
        toast.success("Changes saved. Material changes require re-review.");
      } else {
        toast.success("Changes saved successfully");
      }
      setHasChanges(false);
      setOriginalData(formData);
    }
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

  const isLive = deal.status !== "draft";

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

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/sponsor/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link to="/sponsor/deals" className="hover:text-foreground">Deals</Link>
          <span>/</span>
          <Link to={`/sponsor/deals/${deal.id}`} className="hover:text-foreground">{deal.property_name}</Link>
          <span>/</span>
          <span className="text-foreground">Edit</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Deal</h1>
            <p className="text-muted-foreground">{deal.property_name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to={`/sponsor/deals/${deal.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Link>
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Edit Notice */}
        {isLive && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-600">Limited Editing Available</p>
                <p className="text-sm text-muted-foreground">
                  This deal is {deal.status}. Material changes (raise amount, returns, minimums) will require re-review.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Form Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="property" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Property</span>
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Structure</span>
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Returns</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Legal</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
          </TabsList>

          {/* Property Details Tab */}
          <TabsContent value="property">
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>Basic information about the property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property Name</Label>
                    <Input
                      value={formData.property_name}
                      onChange={(e) => updateField("property_name", e.target.value)}
                      placeholder="e.g., Sunset Gardens Apartments"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select value={formData.property_type} onValueChange={(v) => updateField("property_type", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {propertyTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Street Address</Label>
                  <Input
                    value={formData.street_address}
                    onChange={(e) => updateField("street_address", e.target.value)}
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>ZIP Code</Label>
                    <Input
                      value={formData.zip_code}
                      onChange={(e) => updateField("zip_code", e.target.value)}
                      placeholder="ZIP"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Property Description</Label>
                  <Textarea
                    value={formData.property_description}
                    onChange={(e) => updateField("property_description", e.target.value)}
                    placeholder="Describe the property, its features, and investment thesis..."
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Year Built</Label>
                    <Input
                      type="number"
                      value={formData.year_built || ""}
                      onChange={(e) => updateField("year_built", parseInt(e.target.value) || null)}
                      placeholder="2020"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Units</Label>
                    <Input
                      type="number"
                      value={formData.total_units || ""}
                      onChange={(e) => updateField("total_units", parseInt(e.target.value) || null)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Sq Ft</Label>
                    <Input
                      type="number"
                      value={formData.total_sqft || ""}
                      onChange={(e) => updateField("total_sqft", parseInt(e.target.value) || null)}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Occupancy %</Label>
                    <Input
                      type="number"
                      value={formData.current_occupancy || ""}
                      onChange={(e) => updateField("current_occupancy", parseInt(e.target.value) || null)}
                      placeholder="95"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Deal Structure Tab */}
          <TabsContent value="structure">
            <Card>
              <CardHeader>
                <CardTitle>Deal Structure</CardTitle>
                <CardDescription>Investment terms and structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Raise Goal ($)</Label>
                    <Input
                      type="number"
                      value={formData.raise_goal}
                      onChange={(e) => updateField("raise_goal", parseFloat(e.target.value) || 0)}
                      disabled={isLive}
                    />
                    {isLive && <p className="text-xs text-muted-foreground">Cannot change after launch</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Token Price ($)</Label>
                    <Input
                      type="number"
                      value={formData.token_price}
                      onChange={(e) => updateField("token_price", parseFloat(e.target.value) || 0)}
                      disabled={isLive}
                    />
                    {isLive && <p className="text-xs text-muted-foreground">Cannot change after launch</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Investment ($)</Label>
                    <Input
                      type="number"
                      value={formData.minimum_investment}
                      onChange={(e) => updateField("minimum_investment", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Investment ($)</Label>
                    <Input
                      type="number"
                      value={formData.maximum_investment || ""}
                      onChange={(e) => updateField("maximum_investment", parseFloat(e.target.value) || null)}
                      placeholder="No maximum"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Hold Period</Label>
                    <Select value={formData.hold_period} onValueChange={(v) => updateField("hold_period", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hold period" />
                      </SelectTrigger>
                      <SelectContent>
                        {holdPeriods.map(period => (
                          <SelectItem key={period} value={period}>{period}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Investment Type</Label>
                    <Select value={formData.investment_type} onValueChange={(v) => updateField("investment_type", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {investmentTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Returns & Fees Tab */}
          <TabsContent value="returns">
            <Card>
              <CardHeader>
                <CardTitle>Returns & Fees</CardTitle>
                <CardDescription>Projected returns and fee structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Projected IRR (%)</Label>
                    <Input
                      type="number"
                      value={formData.projected_irr || ""}
                      onChange={(e) => updateField("projected_irr", parseFloat(e.target.value) || null)}
                      placeholder="18"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Return (%)</Label>
                    <Input
                      type="number"
                      value={formData.preferred_return || ""}
                      onChange={(e) => updateField("preferred_return", parseFloat(e.target.value) || null)}
                      placeholder="8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sponsor Promote (%)</Label>
                    <Input
                      type="number"
                      value={formData.sponsor_promote || ""}
                      onChange={(e) => updateField("sponsor_promote", parseFloat(e.target.value) || null)}
                      placeholder="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cash on Cash Target (%)</Label>
                    <Input
                      type="number"
                      value={formData.cash_on_cash_target || ""}
                      onChange={(e) => updateField("cash_on_cash_target", parseFloat(e.target.value) || null)}
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Distribution Frequency</Label>
                  <Select value={formData.distribution_frequency} onValueChange={(v) => updateField("distribution_frequency", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {distributionFrequencies.map(freq => (
                        <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Management Fee (%)</Label>
                    <Input
                      type="number"
                      value={formData.management_fee || ""}
                      onChange={(e) => updateField("management_fee", parseFloat(e.target.value) || null)}
                      placeholder="2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Acquisition Fee (%)</Label>
                    <Input
                      type="number"
                      value={formData.acquisition_fee || ""}
                      onChange={(e) => updateField("acquisition_fee", parseFloat(e.target.value) || null)}
                      placeholder="1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Tab */}
          <TabsContent value="legal">
            <Card>
              <CardHeader>
                <CardTitle>Legal & Compliance</CardTitle>
                <CardDescription>Offering documents and compliance information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Offering Type</Label>
                    <Select value={formData.offering_type} onValueChange={(v) => updateField("offering_type", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select offering type" />
                      </SelectTrigger>
                      <SelectContent>
                        {offeringTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>SEC Filing Number</Label>
                    <Input
                      value={formData.sec_filing_number}
                      onChange={(e) => updateField("sec_filing_number", e.target.value)}
                      placeholder="D-XXXXX"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label>Accredited Investors Only</Label>
                    <p className="text-sm text-muted-foreground">Restrict to accredited investors</p>
                  </div>
                  <Switch
                    checked={formData.accredited_only}
                    onCheckedChange={(v) => updateField("accredited_only", v)}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Legal Documents</h4>
                  <div className="space-y-2">
                    <Label>PPM Document URL</Label>
                    <Input
                      value={formData.ppm_document_url || ""}
                      onChange={(e) => updateField("ppm_document_url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subscription Agreement URL</Label>
                    <Input
                      value={formData.subscription_agreement_url || ""}
                      onChange={(e) => updateField("subscription_agreement_url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Operating Agreement URL</Label>
                    <Input
                      value={formData.operating_agreement_url || ""}
                      onChange={(e) => updateField("operating_agreement_url", e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Change History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Change History</CardTitle>
                <CardDescription>Track all changes made to this deal</CardDescription>
              </CardHeader>
              <CardContent>
                {mockChangeHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No changes have been made yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockChangeHistory.map((change) => (
                      <div key={change.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{change.field}</p>
                            <div className="flex items-center gap-2 text-sm mt-1">
                              <span className="text-muted-foreground line-through">{change.oldValue}</span>
                              <ArrowLeft className="h-3 w-3 rotate-180" />
                              <span className="text-primary font-medium">{change.newValue}</span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(change.changedAt).toLocaleDateString()}
                            </div>
                            <p className="text-xs">{change.changedBy}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
