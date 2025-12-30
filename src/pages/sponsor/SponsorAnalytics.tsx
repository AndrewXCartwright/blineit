import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsor } from "@/hooks/useSponsor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Building2, 
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Download,
  CalendarIcon,
  FileText,
  Clock,
  BarChart3,
  PieChart,
  Zap,
  FileSpreadsheet,
  Receipt
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays, startOfQuarter, startOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

// Mock data for charts
const capitalRaisedData = [
  { date: "Jan", amount: 150000, cumulative: 150000 },
  { date: "Feb", amount: 225000, cumulative: 375000 },
  { date: "Mar", amount: 180000, cumulative: 555000 },
  { date: "Apr", amount: 320000, cumulative: 875000 },
  { date: "May", amount: 275000, cumulative: 1150000 },
  { date: "Jun", amount: 400000, cumulative: 1550000 },
  { date: "Jul", amount: 350000, cumulative: 1900000 },
  { date: "Aug", amount: 280000, cumulative: 2180000 },
  { date: "Sep", amount: 320000, cumulative: 2500000 },
];

const dealPerformanceData = [
  { name: "Oakwood Apartments", funded: 100, goal: 500000 },
  { name: "Downtown Retail", funded: 85, goal: 750000 },
  { name: "Industrial Park", funded: 65, goal: 1000000 },
  { name: "Sunset Villas", funded: 45, goal: 600000 },
  { name: "Harbor View", funded: 20, goal: 800000 },
];

const accreditationData = [
  { name: "Accredited", value: 72, color: "hsl(var(--primary))" },
  { name: "Non-Accredited", value: 28, color: "hsl(var(--muted))" },
];

const investmentSizeData = [
  { name: "$100-1K", value: 45, color: "#60a5fa" },
  { name: "$1K-10K", value: 120, color: "#34d399" },
  { name: "$10K-50K", value: 85, color: "#a78bfa" },
  { name: "$50K+", value: 35, color: "#f472b6" },
];

const topStatesData = [
  { state: "California", count: 125 },
  { state: "Texas", count: 98 },
  { state: "Florida", count: 76 },
  { state: "New York", count: 65 },
  { state: "Illinois", count: 42 },
];

const feeData = [
  { deal: "Oakwood Apartments", aum: 500000, fee: 2500, status: "paid" },
  { deal: "Downtown Retail", aum: 637500, fee: 3188, status: "paid" },
  { deal: "Industrial Park", aum: 650000, fee: 3250, status: "pending" },
  { deal: "Sunset Villas", aum: 270000, fee: 1350, status: "pending" },
];

type DateRange = "30days" | "quarter" | "year" | "custom";

export default function SponsorAnalytics() {
  const { signOut } = useAuth();
  const { sponsorProfile } = useSponsor();
  const [dateRange, setDateRange] = useState<DateRange>("30days");
  const [customDate, setCustomDate] = useState<Date>();
  const [chartPeriod, setChartPeriod] = useState<"week" | "month" | "quarter">("month");

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "30days": return "Last 30 Days";
      case "quarter": return "This Quarter";
      case "year": return "This Year";
      case "custom": return customDate ? format(customDate, "PPP") : "Custom";
      default: return "Last 30 Days";
    }
  };

  const handleExportReport = () => {
    toast.success("Report exported successfully");
  };

  const handleGenerateReport = (type: string) => {
    toast.success(`Generating ${type}...`);
  };

  const getFundedColor = (percent: number) => {
    if (percent >= 100) return "#22c55e";
    if (percent >= 50) return "#eab308";
    return "#ef4444";
  };

  const totalAUM = feeData.reduce((sum, d) => sum + d.aum, 0);
  const totalFeesYTD = feeData.reduce((sum, d) => sum + d.fee, 0);

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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <Link 
              to="/sponsor/dashboard" 
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold">Analytics & Reports</h1>
            <p className="text-muted-foreground">Comprehensive reporting for your deals</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Date Range Picker */}
            <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
              <SelectTrigger className="w-[180px]">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !customDate && "text-muted-foreground"
                  )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDate ? format(customDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customDate}
                    onSelect={setCustomDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            )}

            <Button onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Top-Level KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total AUM</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalAUM)}</p>
                  <p className="text-xs text-green-500">+12.5% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Raised All-Time</p>
                  <p className="text-2xl font-bold">{formatCurrency(2500000)}</p>
                  <p className="text-xs text-green-500">+$320K this quarter</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <BarChart3 className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Average Deal Size</p>
                  <p className="text-2xl font-bold">{formatCurrency(500000)}</p>
                  <p className="text-xs text-muted-foreground">Across 5 deals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10">
                  <Users className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Investor Retention</p>
                  <p className="text-2xl font-bold">78%</p>
                  <p className="text-xs text-green-500">+5% from last year</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Capital Raised Over Time */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Capital Raised Over Time
                </CardTitle>
                <CardDescription>Cumulative capital raised by period</CardDescription>
              </div>
              <div className="flex gap-1 p-1 bg-muted rounded-lg">
                {(["week", "month", "quarter"] as const).map((period) => (
                  <Button
                    key={period}
                    variant={chartPeriod === period ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setChartPeriod(period)}
                    className="capitalize"
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={capitalRaisedData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)} 
                    className="text-xs"
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), "Cumulative"]}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Deal Performance & Investor Demographics */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Deal Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Deal Performance Comparison
              </CardTitle>
              <CardDescription>Funding progress by deal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dealPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [`${value}% funded`, "Progress"]}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar 
                      dataKey="funded" 
                      radius={[0, 4, 4, 0]}
                      fill="hsl(var(--primary))"
                    >
                      {dealPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getFundedColor(entry.funded)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span>100%+ Funded</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <span>50-99%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span>&lt;50%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Investor Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Investor Demographics
              </CardTitle>
              <CardDescription>Breakdown of your investor base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Accreditation Pie */}
                <div>
                  <p className="text-sm font-medium text-center mb-2">Accreditation Status</p>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={accreditationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={60}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {accreditationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-3 text-xs">
                    {accreditationData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Investment Size Pie */}
                <div>
                  <p className="text-sm font-medium text-center mb-2">Investment Size</p>
                  <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={investmentSizeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={60}
                          dataKey="value"
                          label={({ value }) => value}
                        >
                          {investmentSizeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    {investmentSizeData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top States & Raise Velocity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top States */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top States by Investor Count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topStatesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="state" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [value, "Investors"]}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Raise Velocity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Raise Velocity
              </CardTitle>
              <CardDescription>How fast your deals are funding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Avg. Days to 50% Funded</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">18</span>
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                  <p className="text-xs text-green-500 mt-1">5 days faster than platform avg</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Avg. Days to Fully Funded</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">42</span>
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                  <p className="text-xs text-green-500 mt-1">8 days faster than platform avg</p>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-medium">Platform Comparison</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your avg. funding time</span>
                    <span className="font-medium">42 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform average</span>
                    <span className="font-medium">50 days</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>You're performing</span>
                    <span className="font-medium">16% faster</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Summary */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Fee Summary
                </CardTitle>
                <CardDescription>Platform fees by deal (0.5% annual on AUM)</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Deal Name</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">AUM</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Annual Fee (0.5%)</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feeData.map((item) => (
                    <tr key={item.deal} className="border-b last:border-0">
                      <td className="py-3 px-4 font-medium">{item.deal}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.aum)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.fee)}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge 
                          variant="secondary"
                          className={item.status === "paid" ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600"}
                        >
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/50 font-medium">
                    <td className="py-3 px-4">Total Fees YTD</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(totalAUM)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(totalFeesYTD)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="flex items-center justify-between mt-4 p-3 rounded-lg bg-muted/50 text-sm">
              <span className="text-muted-foreground">Next billing date</span>
              <span className="font-medium">October 1, 2024</span>
            </div>
          </CardContent>
        </Card>

        {/* Reports Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reports & Downloads
            </CardTitle>
            <CardDescription>Generate and download reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex-col items-start text-left"
                onClick={() => handleGenerateReport("Investor Report")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">Investor Report</span>
                </div>
                <p className="text-xs text-muted-foreground">Generate comprehensive PDF report of all investors</p>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex-col items-start text-left"
                onClick={() => handleGenerateReport("Tax Documents")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Tax Documents</span>
                </div>
                <p className="text-xs text-muted-foreground">Generate K-1s and tax-related documents</p>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex-col items-start text-left"
                onClick={() => handleGenerateReport("Investor Data CSV")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">Investor Data</span>
                </div>
                <p className="text-xs text-muted-foreground">Download all investor data as CSV</p>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 flex-col items-start text-left"
                onClick={() => handleGenerateReport("Distribution History")}
              >
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">Distribution History</span>
                </div>
                <p className="text-xs text-muted-foreground">Download complete distribution history</p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
