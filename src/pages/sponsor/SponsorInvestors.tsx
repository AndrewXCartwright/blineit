import { useState } from "react";
import { Link } from "react-router-dom";
import { useSponsorPortal, SponsorInvestor } from "@/hooks/useSponsorPortal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Building2,
  Search,
  ArrowLeft,
  User,
  Users,
  DollarSign,
  ShieldCheck,
  Award,
  Mail,
  Globe,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { formatCurrency } from "@/lib/formatters";

const kycStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  not_started: { label: 'Not Started', variant: 'secondary' },
  pending: { label: 'Pending', variant: 'outline' },
  in_review: { label: 'In Review', variant: 'outline' },
  verified: { label: 'Verified', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

export default function SponsorInvestors() {
  const { signOut } = useAuth();
  const { investors, loading, offerings, investments } = useSponsorPortal();
  const [searchQuery, setSearchQuery] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [offeringFilter, setOfferingFilter] = useState("all");
  const [selectedInvestor, setSelectedInvestor] = useState<SponsorInvestor | null>(null);

  const filteredInvestors = investors.filter(inv => {
    const matchesSearch = 
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKyc = kycFilter === "all" || inv.kyc_status === kycFilter;
    return matchesSearch && matchesKyc;
  });

  // Get investor's investments when modal is open
  const investorInvestments = selectedInvestor 
    ? investments.filter(i => i.investor_id === selectedInvestor.user_id)
    : [];

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
            <h1 className="text-2xl font-bold">Investors</h1>
            <p className="text-muted-foreground">Manage investors in your offerings</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Investors</p>
                  <p className="text-2xl font-bold">{investors.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Verified KYC</p>
                  <p className="text-2xl font-bold">
                    {investors.filter(i => i.kyc_status === 'verified').length}
                  </p>
                </div>
                <ShieldCheck className="h-8 w-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accredited</p>
                  <p className="text-2xl font-bold">
                    {investors.filter(i => i.is_accredited).length}
                  </p>
                </div>
                <Award className="h-8 w-8 text-amber-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(investors.reduce((sum, i) => sum + i.total_invested, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-primary/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={kycFilter} onValueChange={setKycFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="KYC Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="not_started">Not Started</SelectItem>
                </SelectContent>
              </Select>
              <Select value={offeringFilter} onValueChange={setOfferingFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Offering" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Offerings</SelectItem>
                  {offerings.map(o => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Investors Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Investors ({filteredInvestors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredInvestors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No investors found</h3>
                <p className="text-muted-foreground">
                  {investors.length === 0 
                    ? "You don't have any investors yet."
                    : "No investors match your current filters."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Accreditation</TableHead>
                      <TableHead className="text-right">Total Invested</TableHead>
                      <TableHead className="text-right">Offerings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvestors.map((investor) => {
                      const kycInfo = kycStatusConfig[investor.kyc_status] || kycStatusConfig.not_started;
                      return (
                        <TableRow 
                          key={investor.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedInvestor(investor)}
                        >
                          <TableCell className="font-medium">{investor.name}</TableCell>
                          <TableCell className="text-muted-foreground">{investor.email}</TableCell>
                          <TableCell>{investor.country}</TableCell>
                          <TableCell>
                            <Badge variant={kycInfo.variant}>{kycInfo.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {investor.is_accredited ? (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                                <Award className="h-3 w-3 mr-1" />
                                Accredited
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(investor.total_invested)}
                          </TableCell>
                          <TableCell className="text-right">{investor.offerings_count}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Investor Detail Modal */}
      <Dialog open={!!selectedInvestor} onOpenChange={() => setSelectedInvestor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Investor Profile</DialogTitle>
          </DialogHeader>
          {selectedInvestor && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{selectedInvestor.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {selectedInvestor.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      {selectedInvestor.country}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant={kycStatusConfig[selectedInvestor.kyc_status]?.variant || 'secondary'}>
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    {kycStatusConfig[selectedInvestor.kyc_status]?.label || selectedInvestor.kyc_status}
                  </Badge>
                  {selectedInvestor.is_accredited && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                      <Award className="h-3 w-3 mr-1" />
                      Accredited
                    </Badge>
                  )}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-2xl font-bold">{formatCurrency(selectedInvestor.total_invested)}</p>
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <p className="text-2xl font-bold">{selectedInvestor.offerings_count}</p>
                  <p className="text-sm text-muted-foreground">Offerings</p>
                </div>
              </div>

              {/* Investment History */}
              <div>
                <h4 className="font-medium mb-3">Investment History</h4>
                {investorInvestments.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No investments found</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {investorInvestments.map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{inv.offering_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(inv.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(inv.amount)}</p>
                          <Badge variant={inv.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
