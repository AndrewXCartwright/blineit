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

  // Calculate total interest earned
  const totalInterestEarned = investments.reduce(
    (sum, inv) => sum + Number(inv.total_interest_earned),
    0
  );

  // Find next payment date
  const nextPaymentDate = investments
    .filter((inv) => inv.status === "active" && inv.next_payment_date)
    .map((inv) => new Date(inv.next_payment_date!))
    .sort((a, b) => a.getTime() - b.getTime())[0] || null;

  return {
    investments,
    loading,
    refetch: fetchInvestments,
    totalDebtInvested,
    monthlyIncome,
    activeLoans,
    avgApy,
    totalInterestEarned,
    nextPaymentDate,
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

export function useSimulateInterestPayment() {
  const [loading, setLoading] = useState(false);

  const simulateAllPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("process_all_interest_payments");

      if (error) throw error;

      const result = data as { success: boolean; error?: string; total_amount?: number; payment_count?: number };

      if (!result.success) {
        throw new Error(result.error || "Payment simulation failed");
      }

      if (result.payment_count === 0) {
        toast({
          title: "No Active Investments",
          description: "You don't have any active loan investments to receive payments from.",
        });
        return { success: false };
      }

      toast({
        title: "💰 Interest Payments Received!",
        description: `+$${result.total_amount?.toFixed(2)} from ${result.payment_count} investment${result.payment_count > 1 ? 's' : ''}`,
      });

      return { success: true, totalAmount: result.total_amount, paymentCount: result.payment_count };
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const simulateSinglePayment = async (investmentId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("process_interest_payment", {
        p_investment_id: investmentId,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; amount?: number; loan_name?: string };

      if (!result.success) {
        const errorMessages: Record<string, string> = {
          not_authenticated: "Please log in",
          investment_not_found: "Investment not found",
          investment_not_active: "This investment is no longer active",
          loan_not_found: "Loan not found",
        };
        throw new Error(errorMessages[result.error || ""] || "Payment simulation failed");
      }

      toast({
        title: "💰 Interest Payment Received!",
        description: `+$${result.amount?.toFixed(2)} from ${result.loan_name}`,
      });

      return { success: true, amount: result.amount, loanName: result.loan_name };
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { simulateAllPayments, simulateSinglePayment, loading };
}

export function useSimulateLoanPayoff() {
  const [loading, setLoading] = useState(false);

  const simulatePayoff = async (investmentId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("process_loan_payoff", {
        p_investment_id: investmentId,
      });

      if (error) throw error;

      const result = data as { 
        success: boolean; 
        error?: string; 
        principal_amount?: number; 
        loan_name?: string;
        total_interest_earned?: number;
      };

      if (!result.success) {
        const errorMessages: Record<string, string> = {
          not_authenticated: "Please log in",
          investment_not_found: "Investment not found",
          investment_already_paid_off: "This investment has already been paid off",
        };
        throw new Error(errorMessages[result.error || ""] || "Payoff simulation failed");
      }

      toast({
        title: "🎉 Loan Paid Off!",
        description: `Principal returned: $${result.principal_amount?.toFixed(2)}. Total interest earned: $${result.total_interest_earned?.toFixed(2)}`,
      });

      return { 
        success: true, 
        principalAmount: result.principal_amount, 
        loanName: result.loan_name,
        totalInterestEarned: result.total_interest_earned,
      };
    } catch (error: any) {
      toast({
        title: "Payoff Failed",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return { simulatePayoff, loading };
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  user_investment_id: string;
  payment_type: string;
  amount: number;
  payment_date: string;
  status: string;
  created_at: string;
}

export function useLoanPayments(investmentId: string | undefined) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<LoanPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    if (!user || !investmentId) {
      setPayments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("loan_payments")
      .select("*")
      .eq("user_investment_id", investmentId)
      .eq("user_id", user.id)
      .order("payment_date", { ascending: false });

    if (error) {
      console.error("Error fetching loan payments:", error);
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  }, [user, investmentId]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalInterest = payments
    .filter(p => p.payment_type === "interest")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPrincipal = payments
    .filter(p => p.payment_type === "principal")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return { payments, loading, refetch: fetchPayments, totalInterest, totalPrincipal };
}
