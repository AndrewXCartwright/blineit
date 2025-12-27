import { useState } from "react";
import { Search, MoreHorizontal, DollarSign, Shield, Edit2, UserCog } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminUsers } from "@/hooks/useAdmin";
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
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

export default function AdminUsers() {
  const { users, loading, updateUser, addTestFunds } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === "verified") matchesStatus = u.kyc_status === "verified";
    if (statusFilter === "pending") matchesStatus = u.kyc_status === "pending";
    if (statusFilter === "admins") matchesStatus = u.is_admin === true;
    
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (user: any) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleToggleAdmin = async () => {
    if (!selectedUser) return;
    await updateUser(selectedUser.user_id, { is_admin: !selectedUser.is_admin });
    setSelectedUser({ ...selectedUser, is_admin: !selectedUser.is_admin });
  };

  const handleAddFunds = async () => {
    if (!selectedUser) return;
    await addTestFunds(selectedUser.user_id);
    setSelectedUser({
      ...selectedUser,
      wallet_balance: Number(selectedUser.wallet_balance) + 10000,
    });
  };

  const handleUpdateKyc = async (status: string) => {
    if (!selectedUser) return;
    await updateUser(selectedUser.user_id, { kyc_status: status });
    setSelectedUser({ ...selectedUser, kyc_status: status });
  };

  const getKycBadge = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-success/20 text-success";
      case "pending":
        return "bg-amber-500/20 text-amber-500";
      case "rejected":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">Users</h1>
          <div className="text-sm text-muted-foreground">
            {users.length} total users
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending KYC</SelectItem>
              <SelectItem value="admins">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Joined</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Balance</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">KYC Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {(user.display_name || user.email || "U")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.display_name || user.name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(user.created_at), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      ${Number(user.wallet_balance).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getKycBadge(user.kyc_status)}`}>
                        {user.kyc_status || "not_started"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_admin ? (
                        <span className="flex items-center gap-1 text-xs text-amber-500">
                          <Shield className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">User</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => handleOpenModal(user)}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* User Detail Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md bg-card">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6 py-4">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                    {(selectedUser.display_name || selectedUser.email || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {selectedUser.display_name || selectedUser.name || "Unknown"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {format(new Date(selectedUser.created_at), "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Wallet Balance</p>
                    <p className="text-xl font-bold text-foreground">
                      ${Number(selectedUser.wallet_balance).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Referral Code</p>
                    <p className="text-sm font-mono text-foreground">
                      {selectedUser.referral_code || "N/A"}
                    </p>
                  </div>
                </div>

                {/* KYC Status */}
                <div>
                  <Label className="mb-2 block">KYC Status</Label>
                  <Select
                    value={selectedUser.kyc_status || "not_started"}
                    onValueChange={handleUpdateKyc}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Admin Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-amber-500" />
                    <Label>Admin Access</Label>
                  </div>
                  <Switch
                    checked={selectedUser.is_admin}
                    onCheckedChange={handleToggleAdmin}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAddFunds}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Add $10K Test Funds
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
