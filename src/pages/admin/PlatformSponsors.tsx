import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Search, MoreHorizontal, Eye, Ban, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { usePlatformSponsors } from "@/hooks/usePlatformAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function PlatformSponsors() {
  const navigate = useNavigate();
  const { sponsors, loading, refetch, disableSponsor } = usePlatformSponsors();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSponsor, setNewSponsor] = useState({
    email: "",
    name: "",
    company: "",
  });
  const [creating, setCreating] = useState(false);

  const filteredSponsors = sponsors.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
      case "active":
        return <Badge className="bg-success/20 text-success border-success/30">Active</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">Pending</Badge>;
      case "disabled":
        return <Badge variant="destructive">Disabled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDisable = async (sponsorId: string, sponsorName: string) => {
    const { error } = await disableSponsor(sponsorId);
    if (error) {
      toast.error("Failed to disable sponsor");
    } else {
      toast.success(`Sponsor "${sponsorName}" has been disabled`);
    }
  };

  const handleAddSponsor = async () => {
    if (!newSponsor.email || !newSponsor.name || !newSponsor.company) {
      toast.error("Please fill in all fields");
      return;
    }

    setCreating(true);
    try {
      // Note: In production, this would send an invite email
      // For now, we'll just show a success message
      toast.success(`Sponsor invite would be sent to ${newSponsor.email}`);
      setShowAddDialog(false);
      setNewSponsor({ email: "", name: "", company: "" });
    } catch (error) {
      toast.error("Failed to create sponsor");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-display font-bold">All Sponsors</h1>
          <p className="text-muted-foreground">
            Manage sponsor accounts and their offerings
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Sponsor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sponsors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Offerings</TableHead>
                    <TableHead className="text-right">Total Raised</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSponsors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No sponsors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSponsors.map((sponsor) => (
                      <TableRow key={sponsor.id}>
                        <TableCell className="font-medium">{sponsor.name}</TableCell>
                        <TableCell>{sponsor.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {sponsor.company}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{sponsor.offerings_count}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(sponsor.total_raised)}
                        </TableCell>
                        <TableCell>{getStatusBadge(sponsor.status)}</TableCell>
                        <TableCell>
                          {format(new Date(sponsor.joined_date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => navigate(`/sponsor/${sponsor.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {sponsor.status !== "disabled" && (
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDisable(sponsor.id, sponsor.name)}
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Disable Account
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Sponsor Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Sponsor</DialogTitle>
            <DialogDescription>
              Create a new sponsor account. They will receive an email invite to complete their profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="sponsor@company.com"
                value={newSponsor.email}
                onChange={(e) => setNewSponsor({ ...newSponsor, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Contact Name</Label>
              <Input
                id="name"
                placeholder="John Smith"
                value={newSponsor.name}
                onChange={(e) => setNewSponsor({ ...newSponsor, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                placeholder="Acme Real Estate LLC"
                value={newSponsor.company}
                onChange={(e) => setNewSponsor({ ...newSponsor, company: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSponsor} disabled={creating}>
              {creating ? "Creating..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
