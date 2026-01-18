import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Filter, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePlatformOfferings } from "@/hooks/usePlatformAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";

const assetTypes = [
  { value: "", label: "All Types" },
  { value: "real_estate", label: "Real Estate" },
  { value: "factor", label: "Factor" },
  { value: "lien", label: "Lien" },
  { value: "safe", label: "SAFE" },
  { value: "vc", label: "VC Fund" },
  { value: "pe", label: "PE Fund" },
];

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

export default function PlatformOfferings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { offerings, loading } = usePlatformOfferings({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  const filteredOfferings = offerings.filter(
    (o) =>
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.sponsor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-success/20 text-success border-success/30">Active</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSyncStatus = (stoId: string | null) => {
    if (stoId) {
      return (
        <div className="flex items-center gap-1 text-success">
          <CheckCircle className="w-4 h-4" />
          <span className="text-xs">Synced</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <XCircle className="w-4 h-4" />
        <span className="text-xs">Not Synced</span>
      </div>
    );
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      "Real Estate": "bg-blue-500/10 text-blue-500",
      "Factor": "bg-purple-500/10 text-purple-500",
      "Lien": "bg-orange-500/10 text-orange-500",
      "SAFE": "bg-green-500/10 text-green-500",
      "VC": "bg-pink-500/10 text-pink-500",
      "PE": "bg-cyan-500/10 text-cyan-500",
    };
    return colors[type] || "bg-muted text-muted-foreground";
  };

  const handleRowClick = (offering: typeof offerings[0]) => {
    const routes: Record<string, string> = {
      "Real Estate": `/properties/${offering.id}`,
      "Factor": `/factor/${offering.id}`,
      "Lien": `/lien/${offering.id}`,
      "SAFE": `/safe/${offering.id}`,
      "VC": `/vc-funds/${offering.id}`,
      "PE": `/pe-funds/${offering.id}`,
    };
    navigate(routes[offering.type] || `/properties/${offering.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">All Offerings</h1>
        <p className="text-muted-foreground">
          View and manage all platform offerings across asset types
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search offerings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Asset Type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                    <TableHead>Type</TableHead>
                    <TableHead>Sponsor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Raised</TableHead>
                    <TableHead className="text-right">Investors</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>DigiShares</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOfferings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No offerings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOfferings.map((offering) => (
                      <TableRow
                        key={`${offering.type}-${offering.id}`}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(offering)}
                      >
                        <TableCell className="font-medium">{offering.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeColor(offering.type)}>
                            {offering.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{offering.sponsor_name}</TableCell>
                        <TableCell>{getStatusBadge(offering.status)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(offering.total_raised)}
                        </TableCell>
                        <TableCell className="text-right">{offering.investors}</TableCell>
                        <TableCell>
                          {offering.created_at
                            ? format(new Date(offering.created_at), "MMM d, yyyy")
                            : "N/A"}
                        </TableCell>
                        <TableCell>{getSyncStatus(offering.digishares_sto_id)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
