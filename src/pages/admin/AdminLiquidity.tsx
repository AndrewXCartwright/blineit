import { useState, useMemo } from "react";
import { 
  Clock, DollarSign, Droplets, AlertCircle, CheckCircle2, XCircle,
  MoreHorizontal, Download, Filter, ChevronDown, X, Settings2
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useLiquidityNotifications } from "@/hooks/useLiquidityNotifications";

// Sample data for demo
const sampleRequests = [
  {
    id: '1',
    request_number: 'LIQ-2026-0001',
    investor: { name: 'John Smith', email: 'john@example.com' },
    property: 'Sunbelt Tax Lien Fund - Arizona',
    tokens: 25,
    gross_value: 2500,
    fee_percent: 7,
    fee_amount: 175,
    net_payout: 2325,
    status: 'pending',
    requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    holding_months: 14,
  },
  {
    id: '2',
    request_number: 'LIQ-2026-0002',
    investor: { name: 'Sarah Johnson', email: 'sarah@example.com' },
    property: 'Phoenix Commercial Liens',
    tokens: 50,
    gross_value: 5000,
    fee_percent: 5,
    fee_amount: 250,
    net_payout: 4750,
    status: 'pending',
    requested_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    holding_months: 26,
  },
  {
    id: '3',
    request_number: 'LIQ-2026-0003',
    investor: { name: 'Mike Wilson', email: 'mike@example.com' },
    property: 'Sunbelt Tax Lien Fund - Arizona',
    tokens: 10,
    gross_value: 1000,
    fee_percent: 10,
    fee_amount: 100,
    net_payout: 900,
    status: 'processing',
    requested_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    holding_months: 8,
  },
  {
    id: '4',
    request_number: 'LIQ-2025-0089',
    investor: { name: 'Emily Davis', email: 'emily@example.com' },
    property: 'Nevada Tax Lien Portfolio',
    tokens: 100,
    gross_value: 10000,
    fee_percent: 3,
    fee_amount: 300,
    net_payout: 9700,
    status: 'completed',
    requested_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    holding_months: 40,
  },
  {
    id: '5',
    request_number: 'LIQ-2025-0088',
    investor: { name: 'Robert Brown', email: 'robert@example.com' },
    property: 'Phoenix Commercial Liens',
    tokens: 15,
    gross_value: 1500,
    fee_percent: 10,
    fee_amount: 150,
    net_payout: 1350,
    status: 'denied',
    denial_reason: 'Minimum holding period not met',
    requested_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    holding_months: 0,
  },
];

type RequestStatus = 'pending' | 'processing' | 'completed' | 'denied' | 'cancelled';

interface LiquidityRequest {
  id: string;
  request_number: string;
  investor: { name: string; email: string };
  property: string;
  tokens: number;
  gross_value: number;
  fee_percent: number;
  fee_amount: number;
  net_payout: number;
  status: RequestStatus;
  denial_reason?: string;
  requested_at: string;
  holding_months: number;
}

export default function AdminLiquidity() {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [detailRequest, setDetailRequest] = useState<LiquidityRequest | null>(null);
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [denyingRequestId, setDenyingRequestId] = useState<string | null>(null);
  const [bulkDenyOpen, setBulkDenyOpen] = useState(false);
  
  const { notifyRequestApproved, notifyRequestProcessing, notifyRequestCompleted, notifyRequestDenied } = useLiquidityNotifications();
  
  const requests = sampleRequests as LiquidityRequest[];
  
  // Filter requests by tab
  const filteredRequests = useMemo(() => {
    if (activeTab === 'all') return requests;
    return requests.filter(r => r.status === activeTab);
  }, [activeTab, requests]);
  
  // Stats
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const mtdRedeemed = requests
    .filter(r => r.status === 'completed')
    .reduce((sum, r) => sum + r.net_payout, 0);
  const totalReserve = 125000; // Mock value
  const avgProcessingDays = 3.2; // Mock value
  
  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">Processing</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Completed</Badge>;
      case 'denied':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Denied</Badge>;
      case 'cancelled':
        return <Badge className="bg-muted text-muted-foreground">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(new Set(filteredRequests.filter(r => r.status === 'pending').map(r => r.id)));
    } else {
      setSelectedRequests(new Set());
    }
  };
  
  const handleSelectRequest = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRequests);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRequests(newSelected);
  };
  
  const handleApprove = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      notifyRequestApproved(
        { id, request_number: request.request_number, investor_id: id, net_payout: request.net_payout },
        request.investor.email
      );
    }
    toast.success(`Request approved and moved to processing`);
  };
  
  const handleBulkApprove = () => {
    selectedRequests.forEach(id => handleApprove(id));
    toast.success(`${selectedRequests.size} requests approved`);
    setSelectedRequests(new Set());
  };
  
  const openDenyModal = (id: string) => {
    setDenyingRequestId(id);
    setDenyReason('');
    setDenyModalOpen(true);
  };
  
  const handleDeny = () => {
    if (!denyReason.trim()) {
      toast.error('Please provide a denial reason');
      return;
    }
    const request = requests.find(r => r.id === denyingRequestId);
    if (request) {
      notifyRequestDenied(
        { id: denyingRequestId!, request_number: request.request_number, investor_id: denyingRequestId! },
        request.investor.email,
        denyReason
      );
    }
    toast.success(`Request denied`);
    setDenyModalOpen(false);
    setDenyingRequestId(null);
    setDenyReason('');
  };
  
  const handleBulkDeny = () => {
    if (!denyReason.trim()) {
      toast.error('Please provide a denial reason');
      return;
    }
    toast.success(`${selectedRequests.size} requests denied`);
    setBulkDenyOpen(false);
    setSelectedRequests(new Set());
    setDenyReason('');
  };
  
  const handleMarkProcessing = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      notifyRequestProcessing(
        { id, request_number: request.request_number, investor_id: id, net_payout: request.net_payout },
        request.investor.email
      );
    }
    toast.success(`Request marked as processing`);
  };
  
  const handleMarkCompleted = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      notifyRequestCompleted(
        { id, request_number: request.request_number, investor_id: id, net_payout: request.net_payout },
        request.investor.email,
        `PAY-${Date.now()}`
      );
    }
    toast.success(`Request marked as completed`);
  };
  
  const handleExport = () => {
    toast.success('Exporting to CSV...');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Liquidity Management</h1>
            <p className="text-muted-foreground">Manage liquidity requests and program settings</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Link to="/admin/liquidity/settings">
              <Button variant="outline" size="sm">
                <Settings2 className="w-4 h-4 mr-2" />
                Program Settings
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<AlertCircle className="w-5 h-5" />}
            label="Pending Requests"
            value={pendingCount.toString()}
            className={pendingCount > 0 ? "border-amber-500/30" : ""}
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Redeemed (MTD)"
            value={`$${mtdRedeemed.toLocaleString()}`}
          />
          <StatCard
            icon={<Droplets className="w-5 h-5" />}
            label="Total Reserve"
            value={`$${totalReserve.toLocaleString()}`}
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Avg Processing"
            value={`${avgProcessingDays} days`}
          />
        </div>
        
        {/* Bulk Actions */}
        {selectedRequests.size > 0 && (
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {selectedRequests.size} request{selectedRequests.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleBulkApprove}>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Approve All
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setBulkDenyOpen(true)}>
                <XCircle className="w-4 h-4 mr-1" />
                Deny All
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedRequests(new Set())}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Tabs & Table */}
        <div className="glass-card rounded-xl p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="gap-2">
                Pending
                {pendingCount > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5">{pendingCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="denied">Denied</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            
            <Table>
              <TableHeader>
                <TableRow>
                  {activeTab === 'pending' && (
                    <TableHead className="w-10">
                      <Checkbox 
                        checked={selectedRequests.size === filteredRequests.filter(r => r.status === 'pending').length && selectedRequests.size > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                  )}
                  <TableHead>Request #</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead className="text-right">Tokens</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Fee</TableHead>
                  <TableHead className="text-right">Net Payout</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    {activeTab === 'pending' && (
                      <TableCell>
                        <Checkbox 
                          checked={selectedRequests.has(request.id)}
                          onCheckedChange={(checked) => handleSelectRequest(request.id, !!checked)}
                          disabled={request.status !== 'pending'}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <button 
                        onClick={() => setDetailRequest(request)}
                        className="font-mono text-primary hover:underline"
                      >
                        {request.request_number}
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{request.investor.name}</p>
                        <p className="text-xs text-muted-foreground">{request.investor.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{request.property}</TableCell>
                    <TableCell className="text-right">{request.tokens}</TableCell>
                    <TableCell className="text-right">${request.gross_value.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-400">
                      {request.fee_percent}% (${request.fee_amount})
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-500">
                      ${request.net_payout.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(request.requested_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setDetailRequest(request)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {request.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(request.id)}>
                                <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openDenyModal(request.id)}>
                                <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                Deny
                              </DropdownMenuItem>
                            </>
                          )}
                          {request.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleMarkProcessing(request.id)}>
                              Mark Processing
                            </DropdownMenuItem>
                          )}
                          {request.status === 'processing' && (
                            <DropdownMenuItem onClick={() => handleMarkCompleted(request.id)}>
                              Mark Completed
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      No requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Tabs>
        </div>
      </div>
      
      {/* Request Detail Sheet */}
      <Sheet open={!!detailRequest} onOpenChange={() => setDetailRequest(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {detailRequest && (
            <>
              <SheetHeader>
                <SheetTitle className="font-mono">{detailRequest.request_number}</SheetTitle>
              </SheetHeader>
              
              <div className="mt-6 space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(detailRequest.status)}
                </div>
                
                {/* Investor Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Investor</h3>
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
                    <p className="font-medium text-foreground">{detailRequest.investor.name}</p>
                    <p className="text-sm text-muted-foreground">{detailRequest.investor.email}</p>
                  </div>
                </div>
                
                {/* Property */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Property</h3>
                  <p className="text-foreground">{detailRequest.property}</p>
                </div>
                
                {/* Fee Calculation */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Fee Calculation</h3>
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Holding Period</span>
                      <span className="text-foreground">{detailRequest.holding_months} months</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tokens</span>
                      <span className="text-foreground">{detailRequest.tokens}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gross Value</span>
                      <span className="text-foreground">${detailRequest.gross_value.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee Rate</span>
                      <span className="text-foreground">{detailRequest.fee_percent}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Fee Amount</span>
                      <span className="text-red-400">-${detailRequest.fee_amount.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-foreground">Net Payout</span>
                        <span className="font-bold text-green-500">${detailRequest.net_payout.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Denial Reason */}
                {detailRequest.status === 'denied' && detailRequest.denial_reason && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Denial Reason</h3>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <p className="text-sm text-red-400">{detailRequest.denial_reason}</p>
                    </div>
                  </div>
                )}
                
                {/* Timeline */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="text-sm font-medium text-foreground">Request Submitted</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(detailRequest.requested_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                {detailRequest.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1" onClick={() => {
                      handleApprove(detailRequest.id);
                      setDetailRequest(null);
                    }}>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="destructive" className="flex-1" onClick={() => {
                      setDetailRequest(null);
                      openDenyModal(detailRequest.id);
                    }}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Deny
                    </Button>
                  </div>
                )}
                
                {detailRequest.status === 'processing' && (
                  <Button className="w-full" onClick={() => {
                    handleMarkCompleted(detailRequest.id);
                    setDetailRequest(null);
                  }}>
                    Mark as Completed
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      
      {/* Deny Modal */}
      <Dialog open={denyModalOpen} onOpenChange={setDenyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deny-reason">Reason for Denial</Label>
              <Textarea
                id="deny-reason"
                placeholder="Provide a reason for denying this request..."
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeny}>Deny Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Deny Modal */}
      <Dialog open={bulkDenyOpen} onOpenChange={setBulkDenyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny {selectedRequests.size} Requests</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will deny all {selectedRequests.size} selected requests with the same reason.
            </p>
            <div className="space-y-2">
              <Label htmlFor="bulk-deny-reason">Reason for Denial</Label>
              <Textarea
                id="bulk-deny-reason"
                placeholder="Provide a reason for denying these requests..."
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDenyOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkDeny}>Deny All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
