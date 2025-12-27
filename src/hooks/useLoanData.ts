import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";

export interface Loan {
  id: string;
  property_id: string | null;
  name: string;
  loan_type: string;
  description: string | null;
  loan_amount: number;
  amount_funded: number;
  apy: number;
  term_months: number;
  ltv_ratio: number;
  loan_position: string;
  dscr: number | null;
  borrower_type: string | null;
  personal_guarantee: boolean | null;
  property_value: number | null;
  min_investment: number;
  max_investment: number | null;
  payment_frequency: string | null;
  start_date: string | null;
  maturity_date: string | null;
  status: string;
  investor_count: number;
  image_url: string | null;
  city: string;
  state: string;
  created_at: string;
}

export interface UserLoanInvestment {
  id: string;
  loan_id: string;
  principal_invested: number;
  investment_date: string;
  expected_monthly_payment: number;
  total_interest_earned: number;
  total_principal_returned: number;
  next_payment_date: string | null;
  status: string;
  loan?: Loan;
}

export function useLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .neq("status", "paid_off")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching loans:", error);
    } else {
      setLoans(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // Real-time subscription for loan funding updates
  useEffect(() => {
    const channel = supabase
      .channel("loans-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "loans",
        },
        (payload) => {
          setLoans((prev) =>
            prev.map((loan) =>
              loan.id === payload.new.id ? { ...loan, ...payload.new } : loan
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { loans, loading, refetch: fetchLoans };
}

export function useLoanById(id: string | undefined) {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLoan = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching loan:", error);
    } else {
      setLoan(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchLoan();
  }, [fetchLoan]);

  // Real-time subscription for this specific loan
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`loan-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "loans",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setLoan((prev) => (prev ? { ...prev, ...payload.new } : null));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return { loan, loading, refetch: fetchLoan };
}

export function useUserLoanInvestments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<UserLoanInvestment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = useCallback(async () => {
    if (!user) {
      setInvestments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("user_loan_investments")
      .select(`
        *,
        loan:loans(*)
      `)
      .eq("user_id", user.id)
      .order("investment_date", { ascending: false });

    if (error) {
      console.error("Error fetching loan investments:", error);
    } else {
      setInvestments(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  // Calculate totals
  const totalDebtInvested = investments.reduce(
    (sum, inv) => sum + Number(inv.principal_invested),
    0
  );
  const monthlyIncome = investments
    .filter((inv) => inv.status === "active")
    .reduce((sum, inv) => sum + Number(inv.expected_monthly_payment), 0);
  
  const activeLoans = investments.filter((inv) => inv.status === "active").length;
  
  // Weighted average APY
  const avgApy =
    totalDebtInvested > 0
      ? investments.reduce((sum, inv) => {
          const loanApy = inv.loan?.apy || 0;
          return sum + (Number(inv.principal_invested) / totalDebtInvested) * loanApy;
        }, 0)
      : 0;

  return {
    investments,
    loading,
    refetch: fetchInvestments,
    totalDebtInvested,
    monthlyIncome,
    activeLoans,
    avgApy,
  };
}

export function useInvestInLoan() {
  const [loading, setLoading] = useState(false);

  const investInLoan = async (loanId: string, amount: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("invest_in_loan", {
        p_loan_id: loanId,
        p_amount: amount,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; monthly_payment?: number };

      if (!result.success) {
        const errorMessages: Record<string, string> = {
          not_authenticated: "Please log in to invest",
          loan_not_found: "Loan not found",
          loan_not_accepting_investments: "This loan is no longer accepting investments",
          below_minimum_investment: "Amount is below minimum investment",
          above_maximum_investment: "Amount exceeds maximum investment",
          exceeds_funding_capacity: "Amount exceeds remaining funding capacity",
          profile_not_found: "Profile not found",
          insufficient_balance: "Insufficient wallet balance",
          rate_limit_exceeded: "Too many requests. Please wait.",
        };
        throw new Error(errorMessages[result.error || ""] || "Investment failed");
      }

      toast({
        title: "Investment Successful!",
        description: `You've invested $${amount.toLocaleString()}. Expected monthly payment: $${result.monthly_payment?.toFixed(2)}`,
      });

      return { success: true, monthlyPayment: result.monthly_payment };
    } catch (error: any) {
      toast({
        title: "Investment Failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { investInLoan, loading };
}
