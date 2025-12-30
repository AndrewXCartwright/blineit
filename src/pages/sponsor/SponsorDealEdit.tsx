import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsorDeals } from "@/hooks/useSponsorDeals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, Building2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

export default function SponsorDealEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { deals, loading } = useSponsorDeals();
  
  const deal = deals.find(d => d.id === id);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Deal Not Found</h1>
        <p className="text-muted-foreground mb-4">The deal you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/sponsor/deals">Back to Deals</Link>
        </Button>
      </div>
    );
  }

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

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/sponsor/dashboard" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link to="/sponsor/deals" className="hover:text-foreground">Deals</Link>
          <span>/</span>
          <Link to={`/sponsor/deals/${deal.id}`} className="hover:text-foreground">{deal.property_name}</Link>
          <span>/</span>
          <span className="text-foreground">Edit</span>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Edit Deal</h1>
            <p className="text-muted-foreground">{deal.property_name}</p>
          </div>
          <Button asChild variant="outline">
            <Link to={`/sponsor/deals/${deal.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Link>
          </Button>
        </div>

        {/* Edit Notice */}
        {deal.status !== "draft" && (
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-600">Limited Editing Available</p>
                <p className="text-sm text-muted-foreground">
                  This deal is {deal.status}. Some fields cannot be edited after a deal goes live.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Form Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Information</CardTitle>
            <CardDescription>
              Update your deal details. Changes will be saved automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Edit Form Coming Soon</h3>
            <p className="text-muted-foreground mb-6">
              The full edit form will mirror the deal creation wizard with pre-filled values.
            </p>
            <Button onClick={() => {
              toast.success("Changes saved successfully");
              navigate(`/sponsor/deals/${deal.id}`);
            }}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
