import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsor } from "@/hooks/useSponsor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Building2, 
  ArrowLeft,
  DollarSign,
  CreditCard,
  Receipt,
  Download,
  Calendar,
  Info
} from "lucide-react";
import logo from "@/assets/logo.png";

const mockFeeHistory = [
  { id: "1", date: "2024-01-01", type: "Platform Fee", amount: 1250, deal: "Oakwood Apartments", status: "paid" },
  { id: "2", date: "2024-02-01", type: "Platform Fee", amount: 1250, deal: "Oakwood Apartments", status: "paid" },
  { id: "3", date: "2024-03-01", type: "Platform Fee", amount: 2500, deal: "Downtown Retail", status: "paid" },
  { id: "4", date: "2024-04-01", type: "Platform Fee", amount: 3750, deal: "Multiple Deals", status: "pending" },
];

export default function SponsorFees() {
  const { signOut } = useAuth();
  const { sponsorProfile } = useSponsor();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
            <h1 className="text-2xl font-bold">Fees & Billing</h1>
            <p className="text-muted-foreground">Manage your platform fees and billing</p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Statements
          </Button>
        </div>

        {/* Fee Overview */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current AUM</p>
                  <p className="text-xl font-bold">$2,500,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Receipt className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Fee (0.5% AUM / 12)</p>
                  <p className="text-xl font-bold">$1,042</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Calendar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Billing Date</p>
                  <p className="text-xl font-bold">May 1, 2024</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Structure Info */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Platform Fee Structure</p>
              <p className="text-sm text-muted-foreground mt-1">
                B-LINE-IT charges a 0.5% annual fee on Assets Under Management (AUM), billed monthly. 
                This fee covers platform access, investor management, compliance tools, and ongoing support.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </CardTitle>
            <CardDescription>Manage how you pay platform fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold">
                  VISA
                </div>
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/2025</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fee History */}
        <Card>
          <CardHeader>
            <CardTitle>Fee History</CardTitle>
            <CardDescription>Your platform fee payment history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Deal</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFeeHistory.map((fee) => (
                    <tr key={fee.id} className="border-b last:border-0">
                      <td className="py-3 px-4 text-sm">{fee.date}</td>
                      <td className="py-3 px-4 text-sm">{fee.type}</td>
                      <td className="py-3 px-4 text-sm">{fee.deal}</td>
                      <td className="py-3 px-4 text-sm text-right font-medium">{formatCurrency(fee.amount)}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge 
                          variant={fee.status === "paid" ? "default" : "secondary"}
                          className={fee.status === "paid" ? "bg-green-500/20 text-green-600" : ""}
                        >
                          {fee.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
