import { useNavigate } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Rocket, 
  Database, 
  Users, 
  Globe, 
  Smartphone,
  Shield,
  Languages,
  Palette,
  CreditCard,
  FileText,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  category: "complete" | "pending" | "external";
}

const LaunchChecklist = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { user, loading: authLoading } = useAuth();

  // Redirect if not admin
  if (!authLoading && !adminLoading && (!user || !isAdmin)) {
    navigate("/");
    return null;
  }

  const completedItems: ChecklistItem[] = [
    { id: "auth", label: "User authentication (signup/login/logout)", completed: true, category: "complete" },
    { id: "properties", label: "Property listings with detail pages", completed: true, category: "complete" },
    { id: "tokens", label: "Token trading system (demo mode)", completed: true, category: "complete" },
    { id: "wallet", label: "Wallet with deposit/withdraw", completed: true, category: "complete" },
    { id: "predictions", label: "Prediction markets", completed: true, category: "complete" },
    { id: "loans", label: "Loan investment platform", completed: true, category: "complete" },
    { id: "kyc", label: "KYC verification flow", completed: true, category: "complete" },
    { id: "i18n", label: "Multi-language support (5 languages)", completed: true, category: "complete" },
    { id: "theme", label: "Dark/light theme toggle", completed: true, category: "complete" },
    { id: "mobile", label: "Mobile responsive design", completed: true, category: "complete" },
    { id: "pwa", label: "PWA installable", completed: true, category: "complete" },
    { id: "notifications", label: "Push notification system", completed: true, category: "complete" },
    { id: "referrals", label: "Referral program", completed: true, category: "complete" },
    { id: "governance", label: "Governance voting", completed: true, category: "complete" },
    { id: "auto-invest", label: "Auto-invest plans", completed: true, category: "complete" },
    { id: "drip", label: "DRIP reinvestment", completed: true, category: "complete" },
    { id: "secondary", label: "Secondary market", completed: true, category: "complete" },
    { id: "documents", label: "Document signing", completed: true, category: "complete" },
    { id: "tax", label: "Tax center & reports", completed: true, category: "complete" },
    { id: "community", label: "Social/community features", completed: true, category: "complete" },
    { id: "admin", label: "Admin dashboard", completed: true, category: "complete" },
    { id: "2fa", label: "Two-factor authentication", completed: true, category: "complete" },
    { id: "biometric", label: "Biometric authentication", completed: true, category: "complete" },
    { id: "calculators", label: "Investment calculators", completed: true, category: "complete" },
    { id: "watchlist", label: "Watchlist management", completed: true, category: "complete" },
    { id: "news", label: "News feed integration", completed: true, category: "complete" },
    { id: "search", label: "Advanced search & filters", completed: true, category: "complete" },
    { id: "compare", label: "Comparison tools", completed: true, category: "complete" },
    { id: "alerts", label: "Price alerts system", completed: true, category: "complete" },
    { id: "developer", label: "Developer API portal", completed: true, category: "complete" },
    { id: "institutional", label: "Institutional investor portal", completed: true, category: "complete" },
    { id: "support", label: "Help center & live chat", completed: true, category: "complete" },
    { id: "gamification", label: "Achievements & leaderboards", completed: true, category: "complete" },
  ];

  const pendingItems: ChecklistItem[] = [
    { id: "digishares", label: "DigiShares API integration", completed: false, category: "pending" },
    { id: "payment", label: "Payment processor (Stripe/Plaid)", completed: false, category: "pending" },
    { id: "prod-db", label: "Production database migration", completed: false, category: "pending" },
    { id: "domain", label: "Custom domain setup", completed: false, category: "pending" },
    { id: "ssl", label: "SSL certificate verification", completed: false, category: "pending" },
    { id: "legal", label: "Legal compliance review", completed: false, category: "pending" },
  ];

  const totalItems = completedItems.length + pendingItems.length;
  const completedCount = completedItems.length;
  const progressPercent = Math.round((completedCount / totalItems) * 100);

  const metrics = [
    { label: "Pages", value: "50+", icon: FileText },
    { label: "Components", value: "100+", icon: Globe },
    { label: "Database Tables", value: "25+", icon: Database },
    { label: "Languages", value: "5", icon: Languages },
    { label: "API Ready", value: "Yes", icon: TrendingUp },
    { label: "Mobile Ready", value: "Yes", icon: Smartphone },
  ];

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Launch Readiness</h1>
            </div>
            <Badge variant="secondary" className="ml-auto">
              Admin Only
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Progress Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{progressPercent}% Ready</h2>
                <p className="text-muted-foreground">
                  {completedCount}/{totalItems} items complete
                </p>
              </div>
              <div className="text-right">
                <Badge variant={progressPercent >= 90 ? "default" : "secondary"} className="text-lg px-4 py-1">
                  {progressPercent >= 90 ? "Launch Ready" : "In Progress"}
                </Badge>
              </div>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </CardContent>
        </Card>

        {/* Completed Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              Complete ({completedItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {completedItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-green-500/5 border border-green-500/20"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Circle className="h-5 w-5" />
              Pending ({pendingItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {pendingItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
                >
                  <Circle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Platform Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {metrics.map((metric) => (
                <div 
                  key={metric.label}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/50"
                >
                  <metric.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-lg font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Row Level Security (RLS)</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Two-Factor Authentication</span>
                <Badge variant="default">Available</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Input Validation</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm">Rate Limiting</span>
                <Badge variant="default">Configured</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Feature Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-muted-foreground">Investment</h4>
                <ul className="space-y-1">
                  <li>• Property tokenization</li>
                  <li>• Debt/loan investments</li>
                  <li>• Prediction markets</li>
                  <li>• Secondary market trading</li>
                  <li>• Auto-invest & DRIP</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-muted-foreground">User Features</h4>
                <ul className="space-y-1">
                  <li>• Full KYC flow</li>
                  <li>• Wallet management</li>
                  <li>• Tax reporting</li>
                  <li>• Governance voting</li>
                  <li>• Referral program</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaunchChecklist;