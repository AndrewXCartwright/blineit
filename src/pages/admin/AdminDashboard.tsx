import { 
  DollarSign, Users, Building2, TrendingUp, Target, Landmark,
  UserPlus, Zap
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { useAdminStats } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { stats, loading, refetch } = useAdminStats();

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Admin</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={refetch}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Total AUM"
            value={formatCurrency(stats.totalAum)}
            trend="up"
            trendValue="12.5%"
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Total Users"
            value={stats.totalUsers.toLocaleString()}
            trend="up"
            trendValue="8.2%"
          />
          <StatCard
            icon={<Building2 className="w-5 h-5" />}
            label="Active Listings"
            value={stats.activeListings}
            subValue="Properties + Loans"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="24h Volume"
            value={formatCurrency(stats.volume24h)}
            trend="neutral"
            trendValue="0.3%"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Total Transactions"
            value={stats.totalTransactions.toLocaleString()}
          />
          <StatCard
            icon={<Landmark className="w-5 h-5" />}
            label="Pending KYC"
            value={stats.pendingKyc}
            className={stats.pendingKyc > 0 ? "border-amber-500/30" : ""}
          />
          <StatCard
            icon={<UserPlus className="w-5 h-5" />}
            label="Today's Date"
            value={format(new Date(), "MMM d, yyyy")}
            subValue={format(new Date(), "EEEE")}
          />
        </div>

        {/* Quick Actions */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Test User
            </Button>
            <Button variant="outline" className="gap-2">
              <Zap className="w-4 h-4" />
              Simulate Interest Payments
            </Button>
            <Button variant="outline" className="gap-2">
              <Building2 className="w-4 h-4" />
              Seed Sample Data
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-xl p-6">
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { type: "investment", text: "New $5,000 investment in Sunset Apartments", time: "2 minutes ago" },
              { type: "signup", text: "New user signed up: john@example.com", time: "15 minutes ago" },
              { type: "bet", text: "New bet placed on Miami Property Sale", time: "1 hour ago" },
              { type: "waitlist", text: "New waitlist signup for Gold & Commodities", time: "2 hours ago" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm text-foreground">{activity.text}</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
