import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSponsorPortal, CapTableEntry } from "@/hooks/useSponsorPortal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Building2,
  ArrowLeft,
  PieChart,
  Users,
  DollarSign,
  Download,
  Coins,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";

export default function SponsorCapTable() {
  const { signOut } = useAuth();
  const { offerings, getCapTable, loading: offeringsLoading } = useSponsorPortal();
  const [searchParams] = useSearchParams();
  const [selectedOffering, setSelectedOffering] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [capTable, setCapTable] = useState<CapTableEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Set initial offering from URL params
  useEffect(() => {
    const offeringId = searchParams.get('offering');
    const offeringType = searchParams.get('type');
    if (offeringId && offeringType) {
      setSelectedOffering(offeringId);
      setSelectedType(offeringType);
    }
  }, [searchParams]);

  // Fetch cap table when offering changes
  useEffect(() => {
    if (selectedOffering && selectedType) {
      setLoading(true);
      getCapTable(selectedOffering, selectedType)
        .then(setCapTable)
        .finally(() => setLoading(false));
    }
  }, [selectedOffering, selectedType, getCapTable]);

  const handleOfferingChange = (value: string) => {
    const offering = offerings.find(o => o.id === value);
    if (offering) {
      setSelectedOffering(value);
      setSelectedType(offering.type);
    }
  };

  const exportToCSV = () => {
    const headers = ['Investor Name', 'Email', 'Tokens Owned', '% Ownership', 'Amount Invested', 'Investment Date'];
    const rows = capTable.map(entry => [
      entry.investor_name,
      entry.investor_email,
      entry.tokens_owned,
      entry.percent_ownership.toFixed(2),
      entry.amount_invested,
      format(new Date(entry.investment_date), 'yyyy-MM-dd'),
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cap-table-${selectedOffering}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalTokens = capTable.reduce((sum, e) => sum + e.tokens_owned, 0);
  const totalInvested = capTable.reduce((sum, e) => sum + e.amount_invested, 0);
  const totalInvestors = capTable.length;

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
            <h1 className="text-2xl font-bold">Cap Table</h1>
            <p className="text-muted-foreground">View ownership breakdown per offering</p>
          </div>
          {capTable.length > 0 && (
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {/* Offering Selector */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex-1 max-w-sm">
                <label className="text-sm font-medium mb-2 block">Select Offering</label>
                <Select value={selectedOffering} onValueChange={handleOfferingChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an offering" />
                  </SelectTrigger>
                  <SelectContent>
                    {offerings.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedOffering && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Tokens Issued</p>
                      <p className="text-2xl font-bold">{totalTokens.toLocaleString()}</p>
                    </div>
                    <Coins className="h-8 w-8 text-primary/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Investors</p>
                      <p className="text-2xl font-bold">{totalInvestors}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Amount Raised</p>
                      <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cap Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Ownership Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading || offeringsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : capTable.length === 0 ? (
                  <div className="text-center py-12">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No investors yet</h3>
                    <p className="text-muted-foreground">
                      This offering doesn't have any completed investments.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Investor Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Tokens Owned</TableHead>
                          <TableHead className="text-right">% Ownership</TableHead>
                          <TableHead className="text-right">Amount Invested</TableHead>
                          <TableHead>Investment Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {capTable.map((entry, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{entry.investor_name}</TableCell>
                            <TableCell className="text-muted-foreground">{entry.investor_email}</TableCell>
                            <TableCell className="text-right">{entry.tokens_owned.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">{entry.percent_ownership.toFixed(2)}%</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(entry.amount_invested)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(entry.investment_date), 'MMM d, yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {!selectedOffering && !offeringsLoading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Offering</h3>
                <p className="text-muted-foreground">
                  Choose an offering above to view its cap table.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
