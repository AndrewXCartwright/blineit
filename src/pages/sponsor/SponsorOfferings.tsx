import { useState } from "react";
import { Link } from "react-router-dom";
import { useSponsorPortal, SponsorOffering } from "@/hooks/useSponsorPortal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Users,
  PieChart,
  Power,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  draft: { label: 'Draft', variant: 'secondary', icon: Clock },
  active: { label: 'Active', variant: 'default', icon: Zap },
  funded: { label: 'Funded', variant: 'outline', icon: CheckCircle },
  closed: { label: 'Closed', variant: 'destructive', icon: XCircle },
  paused: { label: 'Paused', variant: 'secondary', icon: Clock },
};

const typeLabels: Record<string, string> = {
  property: 'Real Estate',
  factor_deal: 'Factor',
  lien_deal: 'Lien',
  safe_deal: 'SAFE',
  vc_fund: 'VC Fund',
  pe_fund: 'PE Fund',
};

export default function SponsorOfferings() {
  const { signOut } = useAuth();
  const { offerings, loading, activateOffering, fetchOfferings } = useSponsorPortal();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredOfferings = offerings.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesType = typeFilter === "all" || o.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleActivate = async (offering: SponsorOffering) => {
    const success = await activateOffering(offering.id, offering.type);
    if (success) {
      toast.success(`${offering.name} has been activated`);
    } else {
      toast.error("Failed to activate offering");
    }
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
            <h1 className="text-2xl font-bold">My Offerings</h1>
            <p className="text-muted-foreground">Manage all your investment offerings</p>
          </div>
          <Button asChild>
            <Link to="/sponsor/deals/new">
              <Plus className="h-4 w-4 mr-2" />
              Create Offering
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search offerings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Asset Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="property">Real Estate</SelectItem>
                  <SelectItem value="factor_deal">Factor</SelectItem>
                  <SelectItem value="lien_deal">Lien</SelectItem>
                  <SelectItem value="safe_deal">SAFE</SelectItem>
                  <SelectItem value="vc_fund">VC Fund</SelectItem>
                  <SelectItem value="pe_fund">PE Fund</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Offerings Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Offerings ({filteredOfferings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredOfferings.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No offerings found</h3>
                <p className="text-muted-foreground mb-4">
                  {offerings.length === 0 
                    ? "You haven't created any offerings yet."
                    : "No offerings match your current filters."}
                </p>
                {offerings.length === 0 && (
                  <Button asChild>
                    <Link to="/sponsor/deals/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Offering
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Target Raise</TableHead>
                      <TableHead className="text-right">Current Raised</TableHead>
                      <TableHead className="text-right">Progress</TableHead>
                      <TableHead>Sync Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOfferings.map((offering) => {
                      const statusInfo = statusConfig[offering.status] || statusConfig.draft;
                      const StatusIcon = statusInfo.icon;
                      return (
                        <TableRow key={`${offering.type}-${offering.id}`}>
                          <TableCell className="font-medium">{offering.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{typeLabels[offering.type]}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusInfo.variant} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(offering.target_raise)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(offering.current_raised)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Progress value={offering.progress} className="w-16 h-2" />
                              <span className="text-sm">{offering.progress.toFixed(0)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {offering.digishares_sto_id ? (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Synced
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">
                                Not Synced
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/sponsor/deals/${offering.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/sponsor/investors?offering=${offering.id}`}>
                                    <Users className="h-4 w-4 mr-2" />
                                    View Investors
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link to={`/sponsor/cap-table?offering=${offering.id}&type=${offering.type}`}>
                                    <PieChart className="h-4 w-4 mr-2" />
                                    View Cap Table
                                  </Link>
                                </DropdownMenuItem>
                                {offering.status === 'draft' && (
                                  <DropdownMenuItem onClick={() => handleActivate(offering)}>
                                    <Power className="h-4 w-4 mr-2" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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
    </div>
  );
}
