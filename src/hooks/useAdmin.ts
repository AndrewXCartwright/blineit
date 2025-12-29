import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(data.is_admin || false);
      }
      setLoading(false);
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, loading };
}

export function useAdminStats() {
  const [stats, setStats] = useState({
    totalAum: 0,
    totalUsers: 0,
    activeListings: 0,
    volume24h: 0,
    totalTransactions: 0,
    pendingKyc: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get active properties
      const { data: properties } = await supabase
        .from("properties")
        .select("value");

      // Get active loans
      const { data: loans } = await supabase
        .from("loans")
        .select("loan_amount, amount_funded")
        .in("status", ["funding", "active"]);

      // Get transactions (last 24h)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentTx } = await supabase
        .from("transactions")
        .select("amount")
        .gte("created_at", yesterday);

      // Get total transactions count
      const { count: txCount } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true });

      // Get pending KYC count
      const { count: kycCount } = await supabase
        .from("kyc_verifications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Calculate totals
      const totalPropertyValue = properties?.reduce((sum, p) => sum + Number(p.value), 0) || 0;
      const totalLoanValue = loans?.reduce((sum, l) => sum + Number(l.amount_funded), 0) || 0;
      const volume24h = recentTx?.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) || 0;
      const activeListings = (properties?.length || 0) + (loans?.length || 0);

      setStats({
        totalAum: totalPropertyValue + totalLoanValue,
        totalUsers: userCount || 0,
        activeListings,
        volume24h,
        totalTransactions: txCount || 0,
        pendingKyc: kycCount || 0,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (userId: string, updates: Record<string, any>) => {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    toast({ title: "Success", description: "User updated successfully" });
    fetchUsers();
    return true;
  };

  const addTestFunds = async (userId: string) => {
    // Fetch current balance and add 10000
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("user_id", userId)
      .single();

    if (fetchError || !profile) {
      toast({ title: "Error", description: "Could not fetch user profile", variant: "destructive" });
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: Number(profile.wallet_balance) + 10000 })
      .eq("user_id", userId);

    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
      return;
    }

    // Create notification
    await supabase.rpc("create_system_notification", {
      p_user_id: userId,
      p_type: "system",
      p_title: "Test Funds Added",
      p_message: "Admin added $10,000 test funds to your account",
    });

    toast({ title: "Success", description: "Added $10,000 test funds" });
    fetchUsers();
  };

  return { users, loading, refetch: fetchUsers, updateUser, addTestFunds };
}

export function useAdminProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProperties(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const createProperty = async (property: any) => {
    const { error } = await supabase.from("properties").insert(property);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Property created" });
    fetchProperties();
    return true;
  };

  const updateProperty = async (id: string, updates: any) => {
    const { error } = await supabase.from("properties").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Property updated" });
    fetchProperties();
    return true;
  };

  const deleteProperty = async (id: string) => {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Property deleted" });
    fetchProperties();
    return true;
  };

  return { properties, loading, refetch: fetchProperties, createProperty, updateProperty, deleteProperty };
}

export function useAdminLoans() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLoans(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const createLoan = async (loan: any) => {
    const { error } = await supabase.from("loans").insert(loan);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Loan created" });
    fetchLoans();
    return true;
  };

  const updateLoan = async (id: string, updates: any) => {
    const { error } = await supabase.from("loans").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Loan updated" });
    fetchLoans();
    return true;
  };

  const deleteLoan = async (id: string) => {
    const { error } = await supabase.from("loans").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Loan deleted" });
    fetchLoans();
    return true;
  };

  return { loans, loading, refetch: fetchLoans, createLoan, updateLoan, deleteLoan };
}

export function useAdminPredictions() {
  const [markets, setMarkets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarkets = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("prediction_markets")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMarkets(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  const createMarket = async (market: any) => {
    const { error } = await supabase.from("prediction_markets").insert(market);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Market created" });
    fetchMarkets();
    return true;
  };

  const updateMarket = async (id: string, updates: any) => {
    const { error } = await supabase.from("prediction_markets").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Market updated" });
    fetchMarkets();
    return true;
  };

  const resolveMarket = async (id: string, resolution: "YES" | "NO") => {
    const { error } = await supabase
      .from("prediction_markets")
      .update({ 
        resolution, 
        is_resolved: true, 
        status: "resolved" 
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }

    // TODO: Process payouts for winning bets
    toast({ title: "Success", description: `Market resolved as ${resolution}` });
    fetchMarkets();
    return true;
  };

  return { markets, loading, refetch: fetchMarkets, createMarket, updateMarket, resolveMarket };
}

export function useAdminWaitlists() {
  const [waitlists, setWaitlists] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchWaitlists = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setWaitlists(data);
      
      // Calculate counts by asset class
      const newCounts: Record<string, number> = {};
      data.forEach((entry) => {
        newCounts[entry.asset_class] = (newCounts[entry.asset_class] || 0) + 1;
      });
      setCounts(newCounts);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWaitlists();
  }, [fetchWaitlists]);

  const deleteWaitlistEntry = async (id: string) => {
    const { error } = await supabase.from("waitlist").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Success", description: "Entry deleted" });
    fetchWaitlists();
    return true;
  };

  const exportToCsv = () => {
    const headers = ["Email", "Asset Class", "Created At", "User ID"];
    const rows = waitlists.map((w) => [
      w.email,
      w.asset_class,
      new Date(w.created_at).toLocaleDateString(),
      w.user_id || "Guest",
    ]);
    
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Success", description: "Waitlist exported" });
  };

  return { waitlists, counts, loading, refetch: fetchWaitlists, deleteWaitlistEntry, exportToCsv };
}

export function useAdminTransactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    
    let query = supabase
      .from("transactions")
      .select(`
        *,
        profile:profiles!transactions_user_id_fkey1(email, display_name)
      `)
      .order("created_at", { ascending: false })
      .limit(500);

    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error } = await query;

    if (!error && data) {
      setTransactions(data);
      
      // Log admin access for audit trail (fire and forget)
      void supabase.rpc('log_admin_access', {
        p_table_name: 'transactions',
        p_action_type: 'query',
        p_query_context: 'Admin transactions list view',
        p_record_count: data.length,
        p_filters: { start_date: startDate || null, end_date: endDate || null }
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, refetch: fetchTransactions };
}

export function useAdminKYC() {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kyc_verifications")
      .select(`
        *,
        profile:profiles!kyc_verifications_user_id_fkey1(email, display_name, name)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVerifications(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const approveKYC = async (userId: string) => {
    // Update kyc_verifications
    const { error: kycError } = await supabase
      .from("kyc_verifications")
      .update({ 
        status: "verified",
        reviewed_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (kycError) {
      toast({ title: "Error", description: kycError.message, variant: "destructive" });
      return false;
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ 
        kyc_status: "verified",
        kyc_verified_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (profileError) {
      toast({ title: "Error", description: profileError.message, variant: "destructive" });
      return false;
    }

    // Create notification
    await supabase.rpc("create_system_notification", {
      p_user_id: userId,
      p_type: "kyc_approved",
      p_title: "Identity Verified",
      p_message: "Your identity has been verified. You now have full access to all features.",
    });

    toast({ title: "Success", description: "KYC approved successfully" });
    fetchVerifications();
    return true;
  };

  const rejectKYC = async (userId: string, reason: string) => {
    // Update kyc_verifications
    const { error: kycError } = await supabase
      .from("kyc_verifications")
      .update({ 
        status: "rejected",
        rejection_reason: reason,
        reviewed_at: new Date().toISOString()
      })
      .eq("user_id", userId);

    if (kycError) {
      toast({ title: "Error", description: kycError.message, variant: "destructive" });
      return false;
    }

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ kyc_status: "rejected" })
      .eq("user_id", userId);

    if (profileError) {
      toast({ title: "Error", description: profileError.message, variant: "destructive" });
      return false;
    }

    // Create notification
    await supabase.rpc("create_system_notification", {
      p_user_id: userId,
      p_type: "kyc_rejected",
      p_title: "Verification Unsuccessful",
      p_message: `Your identity verification was unsuccessful. Reason: ${reason}. Please resubmit your documents.`,
    });

    toast({ title: "Success", description: "KYC rejected" });
    fetchVerifications();
    return true;
  };

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    if (!filePath) return null;
    if (filePath.startsWith("http")) return filePath;
    
    const { data, error } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  };

  return { verifications, loading, refetch: fetchVerifications, approveKYC, rejectKYC, getSignedUrl };
}
