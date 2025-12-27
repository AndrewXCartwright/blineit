import { useState } from "react";
import { Plus, Search, Edit2, Trash2, MoreHorizontal, DollarSign, Zap } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminLoans } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LoanFormData {
  name: string;
  loan_type: string;
  loan_amount: number;
  apy: number;
  term_months: number;
  ltv_ratio: number;
  loan_position: string;
  min_investment: number;
  max_investment: number;
  city: string;
  state: string;
  status: string;
  description: string;
  borrower_type: string;
  personal_guarantee: boolean;
  property_value: number;
  dscr: number;
}

const defaultFormData: LoanFormData = {
  name: "",
  loan_type: "bridge",
  loan_amount: 1000000,
  apy: 10,
  term_months: 12,
  ltv_ratio: 65,
  loan_position: "1st_lien",
  min_investment: 1000,
  max_investment: 100000,
  city: "",
  state: "",
  status: "funding",
  description: "",
  borrower_type: "LLC",
  personal_guarantee: false,
  property_value: 1500000,
  dscr: 1.25,
};

export default function AdminLoans() {
  const { loans, loading, createLoan, updateLoan, deleteLoan } = useAdminLoans();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LoanFormData>(defaultFormData);

  const filteredLoans = loans.filter((l) => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (loan?: any) => {
    if (loan) {
      setEditingId(loan.id);
      setFormData({
        name: loan.name,
        loan_type: loan.loan_type,
        loan_amount: loan.loan_amount,
        apy: loan.apy,
        term_months: loan.term_months,
        ltv_ratio: loan.ltv_ratio,
        loan_position: loan.loan_position,
        min_investment: loan.min_investment,
        max_investment: loan.max_investment || 100000,
        city: loan.city,
        state: loan.state,
        status: loan.status,
        description: loan.description || "",
        borrower_type: loan.borrower_type || "LLC",
        personal_guarantee: loan.personal_guarantee || false,
        property_value: loan.property_value || 0,
        dscr: loan.dscr || 1.25,
      });
    } else {
      setEditingId(null);
      setFormData(defaultFormData);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateLoan(editingId, formData);
    } else {
      await createLoan(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this loan?")) {
      await deleteLoan(id);
    }
  };

  const handleMarkActive = async (id: string) => {
    await updateLoan(id, { status: "active" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "funding":
        return "bg-blue-500/20 text-blue-400";
      case "active":
        return "bg-success/20 text-success";
      case "paid_off":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">Loans</h1>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Loan
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search loans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="funding">Funding</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paid_off">Paid Off</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Funded</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">APY</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No loans found
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const fundedPercent = Math.round((loan.amount_funded / loan.loan_amount) * 100);
                  return (
                    <tr key={loan.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{loan.name}</p>
                          <p className="text-xs text-muted-foreground">{loan.city}, {loan.state}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground capitalize">
                        {loan.loan_type.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        ${(loan.loan_amount / 1000000).toFixed(2)}M
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min(fundedPercent, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{fundedPercent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-success font-medium">
                        {loan.apy}%
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem onClick={() => handleOpenModal(loan)}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {loan.status === "funding" && fundedPercent >= 100 && (
                              <DropdownMenuItem onClick={() => handleMarkActive(loan.id)}>
                                <Zap className="w-4 h-4 mr-2" />
                                Mark as Active
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDelete(loan.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Loan" : "Add Loan"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Loan Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Downtown Bridge Loan"
                  />
                </div>
                <div>
                  <Label>Loan Type</Label>
                  <Select
                    value={formData.loan_type}
                    onValueChange={(v) => setFormData({ ...formData, loan_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="bridge">Bridge</SelectItem>
                      <SelectItem value="construction">Construction</SelectItem>
                      <SelectItem value="stabilized">Stabilized</SelectItem>
                      <SelectItem value="mezzanine">Mezzanine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Loan Amount ($)</Label>
                  <Input
                    type="number"
                    value={formData.loan_amount}
                    onChange={(e) => setFormData({ ...formData, loan_amount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>APY (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.apy}
                    onChange={(e) => setFormData({ ...formData, apy: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Term (months)</Label>
                  <Input
                    type="number"
                    value={formData.term_months}
                    onChange={(e) => setFormData({ ...formData, term_months: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>LTV Ratio (%)</Label>
                  <Input
                    type="number"
                    value={formData.ltv_ratio}
                    onChange={(e) => setFormData({ ...formData, ltv_ratio: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Loan Position</Label>
                  <Select
                    value={formData.loan_position}
                    onValueChange={(v) => setFormData({ ...formData, loan_position: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="1st_lien">1st Lien</SelectItem>
                      <SelectItem value="2nd_lien">2nd Lien</SelectItem>
                      <SelectItem value="mezzanine">Mezzanine</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="funding">Funding</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paid_off">Paid Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Min Investment ($)</Label>
                  <Input
                    type="number"
                    value={formData.min_investment}
                    onChange={(e) => setFormData({ ...formData, min_investment: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Max Investment ($)</Label>
                  <Input
                    type="number"
                    value={formData.max_investment}
                    onChange={(e) => setFormData({ ...formData, max_investment: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Austin"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="TX"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the loan..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? "Save Changes" : "Create Loan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
