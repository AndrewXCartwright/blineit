import { useState, useEffect } from "react";
import { 
  Users, DollarSign, TrendingUp, Gift, Search, 
  CheckCircle, Clock, Mail, ChevronDown
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReferralWithDetails {
  id: string;
  referrer_id: string;
  referred_email: string;
  referred_user_id: string | null;
  status: string;
  total_invested: number;
  qualified_at: string | null;
  reward_paid: boolean;
  created_at: string;
  referrer?: {
    email: string | null;
    display_name: string | null;
  };
}

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<ReferralWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [stats, setStats] = useState({
    totalReferrals: 0,
    qualified: 0,
    totalRewardsPaid: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      // Fetch referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .order("created_at", { ascending: false });

      if (referralsError) throw referralsError;

      // Fetch referrer profiles
      const referrerIds = [...new Set(referralsData?.map(r => r.referrer_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, email, display_name")
        .in("user_id", referrerIds);

      // Merge data
      const enrichedReferrals = referralsData?.map(r => ({
        ...r,
        referrer: profiles?.find(p => p.user_id === r.referrer_id),
      })) || [];

      setReferrals(enrichedReferrals);

      // Calculate stats
      const totalReferrals = enrichedReferrals.length;
      const qualified = enrichedReferrals.filter(r => r.status === "qualified").length;
      const signedUp = enrichedReferrals.filter(r => r.status === "signed_up" || r.status === "qualified").length;
      const totalRewardsPaid = qualified * 50 + (signedUp - qualified) * 10;
      const conversionRate = totalReferrals > 0 ? (qualified / totalReferrals) * 100 : 0;

      setStats({
        totalReferrals,
        qualified,
        totalRewardsPaid,
        conversionRate,
      });
    } catch (error) {
      console.error("Error fetching referrals:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.filter(r => {
    const matchesSearch = 
      r.referred_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referrer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referrer?.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "qualified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Qualified
          </span>
        );
      case "signed_up":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
            <Clock className="w-3 h-3" />
            Signed Up
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
            <Mail className="w-3 h-3" />
            Invited
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Referral Management</h1>
          <p className="text-muted-foreground">Track and manage user referrals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Referrals"
            value={stats.totalReferrals}
            icon={<Users className="w-5 h-5" />}
            trend="up"
            trendValue="12%"
          />
          <StatCard
            label="Qualified"
            value={stats.qualified}
            icon={<CheckCircle className="w-5 h-5" />}
            trend="up"
            trendValue="8%"
          />
          <StatCard
            label="Rewards Paid"
            value={`$${stats.totalRewardsPaid.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5" />}
            trend="up"
            trendValue="15%"
          />
          <StatCard
            label="Conversion Rate"
            value={`${stats.conversionRate.toFixed(1)}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            trend="up"
            trendValue="5%"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="invited">Invited</SelectItem>
              <SelectItem value="signed_up">Signed Up</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Referrals Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No referrals found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Referrer</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Referred</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Invested</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reward</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-border/30 hover:bg-secondary/30">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {referral.referrer?.display_name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {referral.referrer?.email || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-foreground">{referral.referred_email}</p>
                      </td>
                      <td className="p-4">{getStatusBadge(referral.status)}</td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">
                          ${(referral.total_invested || 0).toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className={`font-semibold ${referral.status === "qualified" ? "text-success" : "text-muted-foreground"}`}>
                          {referral.status === "qualified" ? "$50" : referral.status === "signed_up" ? "$10" : "-"}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-muted-foreground text-sm">
                          {format(new Date(referral.created_at), "MMM d, yyyy")}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
