import { Building2, Users, DollarSign, ShieldCheck, TrendingUp, FileText, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatformStats } from "@/hooks/usePlatformAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { formatCurrency } from "@/lib/formatters";

export default function PlatformDashboard() {
  const { stats, loading } = usePlatformStats();
  const navigate = useNavigate();

  const statCards = [
    {
      title: "Total Offerings",
      value: stats.totalOfferings,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10",
      onClick: () => navigate('/admin/platform/offerings'),
    },
    {
      title: "Total Investors",
      value: stats.totalInvestors.toLocaleString(),
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Raised",
      value: formatCurrency(stats.totalRaised),
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Pending KYC",
      value: stats.pendingKYC,
      icon: ShieldCheck,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      onClick: () => navigate('/admin/kyc'),
    },
  ];

  const quickLinks = [
    {
      title: "All Offerings",
      description: "View and manage all platform offerings",
      icon: FileText,
      path: "/admin/platform/offerings",
    },
    {
      title: "All Sponsors",
      description: "Manage sponsor accounts",
      icon: Users,
      path: "/admin/platform/sponsors",
    },
    {
      title: "Platform Settings",
      description: "Configure platform settings",
      icon: Settings,
      path: "/admin/platform/settings",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Platform Dashboard</h1>
        <p className="text-muted-foreground">
          DigiShares platform administration overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card 
            key={stat.title} 
            className={`${stat.onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
            onClick={stat.onClick}
          >
            <CardContent className="p-6">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DigiShares Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            DigiShares Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
            <div>
              <p className="font-medium">Integration Pending</p>
              <p className="text-sm text-muted-foreground">
                DigiShares API connection will be configured via Edge Functions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Card 
              key={link.path}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => navigate(link.path)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <link.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{link.title}</p>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
