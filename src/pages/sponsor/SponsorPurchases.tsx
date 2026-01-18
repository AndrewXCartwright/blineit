import { useState } from "react";
import { Link } from "react-router-dom";
import { useSponsorPortal, SponsorInvestment } from "@/hooks/useSponsorPortal";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Building2,
  Search,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  User,
  DollarSign,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  kyc_required: { label: 'KYC Required', variant: 'outline' },
  payment_pending: { label: 'Payment Pending', variant: 'outline' },
  processing: { label: 'Processing', variant: 'default' },
  completed: { label: 'Completed', variant: 'default' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

const kycStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  not_started: { label: 'Not Started', variant: 'secondary' },
  pending: { label: 'Pending', variant: 'outline' },
  in_review: { label: 'In Review', variant: 'outline' },
  verified: { label: 'Verified', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

export default function SponsorPurchases() {
  const { signOut } = useAuth();
  const { investments, loading, approveInvestment, rejectInvestment, offerings } = useSponsorPortal();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [offeringFilter, setOfferingFilter] = useState("all");
  const [selectedInvestment, setSelectedInvestment] = useState<SponsorInvestment | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const filteredInvestments = investments.filter(inv => {
    const matchesSearch = 
      inv.investor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.investor_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchesOffering = offeringFilter === "all" || inv.offering_id === offeringFilter;
    return matchesSearch && matchesStatus && matchesOffering;
  });

  const pendingCount = investments.filter(i => i.status === 'pending').length;

  const handleApprove = async (investment: SponsorInvestment) => {
    setProcessing(true);
    const success = await approveInvestment(investment.id);
    if (success) {
      toast.success(`Investment from ${investment.investor_name} has been approved`);
    } else {
      toast.error("Failed to approve investment");
    }
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedInvestment || !rejectReason.trim()) return;
    
    setProcessing(true);
    const success = await rejectInvestment(selectedInvestment.id, rejectReason);
    if (success) {
      toast.success(`Investment from ${selectedInvestment.investor_name} has been rejected`);
      setRejectModalOpen(false);
      setRejectReason("");
      setSelectedInvestment(null);
    } else {
      toast.error("Failed to reject investment");
    }
    setProcessing(false);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Link to="/sponsor/dashboard" className="hover:text-foreground flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Purchase Queue</h1>
              {pendingCount > 0 && (
                <Badge variant="destructive">{pendingCount} pending</Badge>
              )}
            </div>
            <p className="text-muted-foreground">Review and manage investment requests</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by investor name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Purchases Table */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Requests ({filteredInvestments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredInvestments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No investment requests</h3>
                <p className="text-muted-foreground">
                  {investments.length === 0 
                    ? "You haven't received any investment requests yet."
                    : "No requests match your current filters."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investor</TableHead>
                      <TableHead>Offering</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Tokens</TableHead>
                      <TableHead>KYC Status</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvestments.map((investment) => {
                      const statusInfo = statusConfig[investment.status] || statusConfig.pending;
                      const kycInfo = kycStatusConfig[investment.kyc_status] || kycStatusConfig.not_started;
                      return (
                        <TableRow key={investment.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{investment.investor_name}</p>
                              <p className="text-sm text-muted-foreground">{investment.investor_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{investment.offering_name}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(investment.amount)}
                          </TableCell>
                          <TableCell className="text-right">{investment.tokens.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={kycInfo.variant}>{kycInfo.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(investment.created_at), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedInvestment(investment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {investment.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-green-600 hover:text-green-700"
                                    onClick={() => handleApprove(investment)}
                                    disabled={processing}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setSelectedInvestment(investment);
                                      setRejectModalOpen(true);
                                    }}
                                    disabled={processing}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
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

      {/* Investment Detail Modal */}
      <Dialog open={!!selectedInvestment && !rejectModalOpen} onOpenChange={() => setSelectedInvestment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Investment Details</DialogTitle>
          </DialogHeader>
          {selectedInvestment && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedInvestment.investor_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedInvestment.investor_email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </div>
                  <p className="font-semibold">{formatCurrency(selectedInvestment.amount)}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Building2 className="h-4 w-4" />
                    Tokens
                  </div>
                  <p className="font-semibold">{selectedInvestment.tokens.toLocaleString()}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <ShieldCheck className="h-4 w-4" />
                    KYC Status
                  </div>
                  <Badge variant={kycStatusConfig[selectedInvestment.kyc_status]?.variant || 'secondary'}>
                    {kycStatusConfig[selectedInvestment.kyc_status]?.label || selectedInvestment.kyc_status}
                  </Badge>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Calendar className="h-4 w-4" />
                    Submitted
                  </div>
                  <p className="font-semibold">{format(new Date(selectedInvestment.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>

              {selectedInvestment.status === 'pending' && (
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectModalOpen(true);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={() => handleApprove(selectedInvestment)} disabled={processing}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Investment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this investment request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectReason.trim() || processing}
            >
              Reject Investment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
