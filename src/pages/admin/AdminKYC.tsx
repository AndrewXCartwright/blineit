import { useState, useEffect } from "react";
import { useAdminKYC } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";

const rejectionReasons = [
  "Blurry ID photo",
  "ID doesn't match selfie",
  "Missing information",
  "Document expired",
  "Invalid document type",
  "Other",
];

export default function AdminKYC() {
  const { verifications, loading, refetch, approveKYC, rejectKYC, getSignedUrl } = useAdminKYC();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const filteredVerifications = verifications.filter((v) => {
    const matchesSearch =
      v.full_legal_name?.toLowerCase().includes(search.toLowerCase()) ||
      v.profile?.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = verifications.filter((v) => v.status === "in_review" || v.status === "pending").length;

  const openReview = async (verification: any) => {
    setSelectedVerification(verification);
    setRejectionReason("");
    setCustomReason("");
    setReviewModal(true);

    // Load signed URLs for documents
    const urls: Record<string, string> = {};
    if (verification.id_front_url) {
      const url = await getSignedUrl(verification.id_front_url);
      if (url) urls.id_front = url;
    }
    if (verification.id_back_url) {
      const url = await getSignedUrl(verification.id_back_url);
      if (url) urls.id_back = url;
    }
    if (verification.selfie_url) {
      const url = await getSignedUrl(verification.selfie_url);
      if (url) urls.selfie = url;
    }
    setDocumentUrls(urls);
  };

  const handleApprove = async () => {
    if (!selectedVerification) return;
    setProcessing(true);
    const success = await approveKYC(selectedVerification.user_id);
    setProcessing(false);
    if (success) {
      setReviewModal(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerification) return;
    const reason = rejectionReason === "Other" ? customReason : rejectionReason;
    if (!reason) return;
    
    setProcessing(true);
    const success = await rejectKYC(selectedVerification.user_id, reason);
    setProcessing(false);
    if (success) {
      setReviewModal(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-success/20 text-success border-0"><CheckCircle className="w-3 h-3 mr-1" /> Verified</Badge>;
      case "rejected":
        return <Badge className="bg-destructive/20 text-destructive border-0"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case "in_review":
      case "pending":
        return <Badge className="bg-warning/20 text-warning border-0"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground border-0">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">KYC Reviews</h1>
          <p className="text-muted-foreground">Review and approve identity verifications</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="secondary" className="bg-warning/20 text-warning border-0">
              {pendingCount} Pending Review
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>ID Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredVerifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No KYC submissions found
                </TableCell>
              </TableRow>
            ) : (
              filteredVerifications.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.full_legal_name || "—"}</TableCell>
                  <TableCell>{v.profile?.email || "—"}</TableCell>
                  <TableCell>{format(new Date(v.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="capitalize">{v.id_type?.replace("_", " ") || "—"}</TableCell>
                  <TableCell>{getStatusBadge(v.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openReview(v)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Review Modal */}
      <Dialog open={reviewModal} onOpenChange={setReviewModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review KYC Submission</DialogTitle>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current Status:</span>
                {getStatusBadge(selectedVerification.status)}
              </div>

              {/* Personal Info */}
              <div className="space-y-3">
                <h3 className="font-semibold">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Full Name:</span>
                    <p className="font-medium">{selectedVerification.full_legal_name || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date of Birth:</span>
                    <p className="font-medium">{selectedVerification.date_of_birth || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{selectedVerification.phone_number || "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SSN Last 4:</span>
                    <p className="font-medium">{selectedVerification.ssn_last4 ? `***-**-${selectedVerification.ssn_last4}` : "—"}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Address:</span>
                    <p className="font-medium">
                      {[
                        selectedVerification.address_line1,
                        selectedVerification.address_line2,
                        selectedVerification.city,
                        selectedVerification.state,
                        selectedVerification.postal_code,
                        selectedVerification.country
                      ].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3">
                <h3 className="font-semibold">Identity Documents</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">ID Front ({selectedVerification.id_type?.replace("_", " ")})</span>
                    {documentUrls.id_front ? (
                      <img 
                        src={documentUrls.id_front} 
                        alt="ID Front" 
                        className="mt-2 rounded-lg border w-full h-32 object-cover cursor-pointer hover:opacity-80"
                        onClick={() => window.open(documentUrls.id_front, "_blank")}
                      />
                    ) : (
                      <div className="mt-2 rounded-lg border w-full h-32 flex items-center justify-center bg-muted">
                        <AlertCircle className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">ID Back</span>
                    {documentUrls.id_back ? (
                      <img 
                        src={documentUrls.id_back} 
                        alt="ID Back" 
                        className="mt-2 rounded-lg border w-full h-32 object-cover cursor-pointer hover:opacity-80"
                        onClick={() => window.open(documentUrls.id_back, "_blank")}
                      />
                    ) : (
                      <div className="mt-2 rounded-lg border w-full h-32 flex items-center justify-center bg-muted">
                        <AlertCircle className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Selfie</span>
                    {documentUrls.selfie ? (
                      <img 
                        src={documentUrls.selfie} 
                        alt="Selfie" 
                        className="mt-2 rounded-lg border w-full h-32 object-cover cursor-pointer hover:opacity-80"
                        onClick={() => window.open(documentUrls.selfie, "_blank")}
                      />
                    ) : (
                      <div className="mt-2 rounded-lg border w-full h-32 flex items-center justify-center bg-muted">
                        <AlertCircle className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection Section (for pending status) */}
              {(selectedVerification.status === "pending" || selectedVerification.status === "in_review") && (
                <div className="space-y-3 border-t pt-4">
                  <h3 className="font-semibold text-destructive">Reject (if needed)</h3>
                  <div>
                    <Label>Rejection Reason</Label>
                    <Select value={rejectionReason} onValueChange={setRejectionReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        {rejectionReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {rejectionReason === "Other" && (
                    <div>
                      <Label>Custom Reason</Label>
                      <Textarea
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        placeholder="Enter the reason for rejection..."
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Previous Rejection Reason */}
              {selectedVerification.rejection_reason && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <span className="text-sm font-medium text-destructive">Previous Rejection:</span>
                  <p className="text-sm text-muted-foreground">{selectedVerification.rejection_reason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewModal(false)}>
              Close
            </Button>
            {(selectedVerification?.status === "pending" || selectedVerification?.status === "in_review") && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={!rejectionReason || (rejectionReason === "Other" && !customReason) || processing}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button onClick={handleApprove} disabled={processing}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}