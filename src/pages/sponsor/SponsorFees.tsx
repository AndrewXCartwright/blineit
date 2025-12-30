import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsor } from "@/hooks/useSponsor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Building2, 
  ArrowLeft,
  DollarSign,
  CreditCard,
  Receipt,
  Download,
  Calendar,
  Info,
  Calculator,
  TrendingDown,
  FileText,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Landmark,
  Percent
} from "lucide-react";
import logo from "@/assets/logo.png";

// Mock data
const mockDealFees = [
  { id: "1", name: "Oakwood Apartments", aum: 1200000, monthlyFee: 500, status: "active" },
  { id: "2", name: "Downtown Retail Center", aum: 850000, monthlyFee: 354, status: "active" },
  { id: "3", name: "Riverside Industrial", aum: 450000, monthlyFee: 188, status: "funded" },
];

const mockPaymentHistory = [
  { id: "1", period: "Q4 2024", aum: 2500000, feeAmount: 3125, paymentDate: "2024-12-15", status: "paid", invoiceUrl: "#" },
  { id: "2", period: "Q3 2024", aum: 2200000, feeAmount: 2750, paymentDate: "2024-09-15", status: "paid", invoiceUrl: "#" },
  { id: "3", period: "Q2 2024", aum: 1800000, feeAmount: 2250, paymentDate: "2024-06-15", status: "paid", invoiceUrl: "#" },
  { id: "4", period: "Q1 2024", aum: 1500000, feeAmount: 1875, paymentDate: "2024-03-15", status: "paid", invoiceUrl: "#" },
];

export default function SponsorFees() {
  const { signOut } = useAuth();
  const { sponsorProfile } = useSponsor();
  const [yearFilter, setYearFilter] = useState("2024");
  const [sortField, setSortField] = useState<"name" | "aum" | "monthlyFee">("aum");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [calculatorInput, setCalculatorInput] = useState("");
  const [autoPay, setAutoPay] = useState(true);

  // Current period data
  const currentAUM = 2500000;
  const annualFeeRate = 0.005; // 0.5%
  const monthlyFee = (currentAUM * annualFeeRate) / 12;
  const quarterlyFee = monthlyFee * 3;
  const daysInPeriod = 90;
  const daysRemaining = 45;
  const billingPeriodStart = new Date("2024-10-01");
  const billingPeriodEnd = new Date("2024-12-31");
  const nextPaymentDate = new Date("2025-01-15");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyPrecise = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedDealFees = [...mockDealFees].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;
    if (sortField === "name") return multiplier * a.name.localeCompare(b.name);
    return multiplier * (a[sortField] - b[sortField]);
  });

  const filteredPaymentHistory = mockPaymentHistory.filter(p => p.period.includes(yearFilter));

  const calculatedFee = calculatorInput ? parseFloat(calculatorInput) * annualFeeRate : 0;
  const traditionalPlatformFee = calculatorInput ? parseFloat(calculatorInput) * 0.025 : 0; // 2.5% avg
  const brokerDealerFee = calculatorInput ? parseFloat(calculatorInput) * 0.06 : 0; // 6% avg
  const savings = traditionalPlatformFee - calculatedFee;

  const exportToCSV = () => {
    const headers = ["Deal Name", "AUM", "Monthly Fee", "Status"];
    const rows = sortedDealFees.map(d => [d.name, d.aum, d.monthlyFee, d.status]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fee-breakdown.csv";
    a.click();
  };

  const SortIcon = ({ field }: { field: typeof sortField }) => (
    sortField === field ? (
      sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
    ) : null
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Link to="/sponsor/dashboard" className="hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </div>
            <h1 className="text-2xl font-bold">Platform Fees</h1>
            <p className="text-muted-foreground">
              Current billing period: {billingPeriodStart.toLocaleDateString()} - {billingPeriodEnd.toLocaleDateString()}
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All Statements
          </Button>
        </div>

        {/* Fee Structure Explanation */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Percent className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">B-LINE-IT Fee Structure</h3>
                  <p className="text-muted-foreground mt-1">
                    B-LINE-IT charges <span className="font-semibold text-primary">0.5% annually</span> on Assets Under Management
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Calculated monthly based on AUM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Billed quarterly</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>No hidden fees</span>
                  </div>
                </div>
                <Button variant="link" className="p-0 h-auto text-primary">
                  View full fee schedule
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Period Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total AUM This Period</p>
                  <p className="text-2xl font-bold">{formatCurrency(currentAUM)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Receipt className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Fee (0.5%/12)</p>
                  <p className="text-2xl font-bold">{formatCurrencyPrecise(monthlyFee)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="text-2xl font-bold">{daysRemaining}</p>
                  <Progress value={((daysInPeriod - daysRemaining) / daysInPeriod) * 100} className="h-1.5 mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Quarterly Total</p>
                  <p className="text-2xl font-bold">{formatCurrencyPrecise(quarterlyFee)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Fee Breakdown by Deal */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fee Breakdown by Deal</CardTitle>
                  <CardDescription>Monthly fees calculated per deal</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th 
                        className="text-left py-3 px-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-1">
                          Deal Name <SortIcon field="name" />
                        </div>
                      </th>
                      <th 
                        className="text-right py-3 px-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort("aum")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          AUM <SortIcon field="aum" />
                        </div>
                      </th>
                      <th 
                        className="text-right py-3 px-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                        onClick={() => handleSort("monthlyFee")}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Monthly Fee <SortIcon field="monthlyFee" />
                        </div>
                      </th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDealFees.map((deal) => (
                      <tr key={deal.id} className="border-b last:border-0">
                        <td className="py-3 px-2 text-sm font-medium">{deal.name}</td>
                        <td className="py-3 px-2 text-sm text-right">{formatCurrency(deal.aum)}</td>
                        <td className="py-3 px-2 text-sm text-right font-medium">{formatCurrencyPrecise(deal.monthlyFee)}</td>
                        <td className="py-3 px-2 text-right">
                          <Badge variant="outline" className={
                            deal.status === "active" ? "bg-green-500/10 text-green-600 border-green-500/30" : 
                            "bg-blue-500/10 text-blue-600 border-blue-500/30"
                          }>
                            {deal.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/50">
                      <td className="py-3 px-2 text-sm font-bold">Total</td>
                      <td className="py-3 px-2 text-sm text-right font-bold">
                        {formatCurrency(sortedDealFees.reduce((sum, d) => sum + d.aum, 0))}
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-bold">
                        {formatCurrencyPrecise(sortedDealFees.reduce((sum, d) => sum + d.monthlyFee, 0))}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Fee Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Fee Calculator
              </CardTitle>
              <CardDescription>Estimate your platform fees based on expected AUM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Expected AUM ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="10,000,000"
                    value={calculatorInput}
                    onChange={(e) => setCalculatorInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {calculatorInput && (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">If you raise</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(parseFloat(calculatorInput))}</p>
                    <p className="text-sm text-muted-foreground mt-2">Your annual platform fee would be</p>
                    <p className="text-3xl font-bold">{formatCurrency(calculatedFee)}</p>
                    <p className="text-sm text-muted-foreground">({formatCurrencyPrecise(calculatedFee / 12)} per month)</p>
                  </div>

                  {/* Fee Comparison */}
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-green-500" />
                      Compare to Alternatives
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-green-500/5 rounded-lg border border-green-500/20">
                        <div>
                          <p className="font-medium text-green-600">B-LINE-IT</p>
                          <p className="text-xs text-muted-foreground">0.5% AUM</p>
                        </div>
                        <p className="font-bold text-green-600">{formatCurrency(calculatedFee)}/yr</p>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Traditional Platforms</p>
                          <p className="text-xs text-muted-foreground">2-3% AUM</p>
                        </div>
                        <p className="font-medium">{formatCurrency(traditionalPlatformFee)}/yr</p>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Broker-Dealer Fees</p>
                          <p className="text-xs text-muted-foreground">5-7%</p>
                        </div>
                        <p className="font-medium">{formatCurrency(brokerDealerFee)}/yr</p>
                      </div>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                      <p className="text-sm text-muted-foreground">You're saving</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(savings)}/year</p>
                      <p className="text-xs text-muted-foreground">vs traditional syndication platforms</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Method & Upcoming */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5" />
                Payment Method
              </CardTitle>
              <CardDescription>Manage how platform fees are paid</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-400 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">BANK</span>
                  </div>
                  <div>
                    <p className="font-medium">Chase Business ••••4892</p>
                    <p className="text-sm text-muted-foreground">ACH Auto-Debit</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Pay</Label>
                  <p className="text-sm text-muted-foreground">Automatically pay fees when due</p>
                </div>
                <Switch checked={autoPay} onCheckedChange={setAutoPay} />
              </div>

              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download W-9
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Payment
              </CardTitle>
              <CardDescription>Your next scheduled fee payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Date</span>
                  <span className="font-medium">{nextPaymentDate.toLocaleDateString("en-US", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estimated Amount</span>
                  <span className="text-2xl font-bold">{formatCurrencyPrecise(quarterlyFee)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">Chase ••••4892</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                    <Clock className="h-3 w-3 mr-1" />
                    Scheduled
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Past platform fee payments and invoices</CardDescription>
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Period</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">AUM</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Fee Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Payment Date</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPaymentHistory.map((payment) => (
                    <tr key={payment.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-sm font-medium">{payment.period}</td>
                      <td className="py-3 px-4 text-sm text-right">{formatCurrency(payment.aum)}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium">{formatCurrencyPrecise(payment.feeAmount)}</td>
                      <td className="py-3 px-4 text-sm text-right">{payment.paymentDate}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <a href={payment.invoiceUrl}>
                            <FileText className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredPaymentHistory.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No payment history for {yearFilter}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
