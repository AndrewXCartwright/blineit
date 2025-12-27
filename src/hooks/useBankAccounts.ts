import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface LinkedAccount {
  id: string;
  institutionName: string;
  institutionLogo: string | null;
  accountName: string;
  accountType: string;
  accountMask: string | null;
  isPrimary: boolean;
  isVerified: boolean;
  verificationStatus: string;
  createdAt: Date;
}

export interface Transfer {
  id: string;
  linkedAccountId: string | null;
  type: "deposit" | "withdrawal";
  amount: number;
  currency: string;
  status: string;
  confirmationNumber: string | null;
  initiatedAt: Date;
  completedAt: Date | null;
  failureReason: string | null;
  linkedAccount?: LinkedAccount;
}

// Demo bank data
const DEMO_BANKS = [
  { id: "chase", name: "Chase", logo: "🏦" },
  { id: "bofa", name: "Bank of America", logo: "🏦" },
  { id: "wells", name: "Wells Fargo", logo: "🏦" },
  { id: "citi", name: "Citi", logo: "🏦" },
  { id: "usbank", name: "US Bank", logo: "🏦" },
  { id: "capital_one", name: "Capital One", logo: "🏦" },
  { id: "pnc", name: "PNC Bank", logo: "🏦" },
  { id: "td", name: "TD Bank", logo: "🏦" },
];

export function useBankAccounts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinkedAccounts = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("linked_accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("is_primary", { ascending: false });

      if (error) throw error;

      setLinkedAccounts(
        data.map((a) => ({
          id: a.id,
          institutionName: a.institution_name,
          institutionLogo: a.institution_logo,
          accountName: a.account_name,
          accountType: a.account_type,
          accountMask: a.account_mask,
          isPrimary: a.is_primary || false,
          isVerified: a.is_verified || false,
          verificationStatus: a.verification_status || "pending",
          createdAt: new Date(a.created_at),
        }))
      );
    } catch (error) {
      console.error("Error fetching linked accounts:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTransfers = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("transfers")
        .select(`
          *,
          linked_accounts (
            id,
            institution_name,
            account_name,
            account_mask
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setTransfers(
        data.map((t) => ({
          id: t.id,
          linkedAccountId: t.linked_account_id,
          type: t.type as "deposit" | "withdrawal",
          amount: Number(t.amount),
          currency: t.currency || "USD",
          status: t.status,
          confirmationNumber: t.confirmation_number,
          initiatedAt: new Date(t.initiated_at),
          completedAt: t.completed_at ? new Date(t.completed_at) : null,
          failureReason: t.failure_reason,
          linkedAccount: t.linked_accounts ? {
            id: t.linked_accounts.id,
            institutionName: t.linked_accounts.institution_name,
            accountName: t.linked_accounts.account_name,
            accountMask: t.linked_accounts.account_mask,
          } as LinkedAccount : undefined,
        }))
      );
    } catch (error) {
      console.error("Error fetching transfers:", error);
    }
  }, [user]);

  useEffect(() => {
    fetchLinkedAccounts();
    fetchTransfers();
  }, [fetchLinkedAccounts, fetchTransfers]);

  // Link a new bank account (demo mode)
  const linkBankAccount = useCallback(async (
    bankId: string,
    accountType: "checking" | "savings"
  ): Promise<LinkedAccount | null> => {
    if (!user) return null;

    const bank = DEMO_BANKS.find(b => b.id === bankId);
    if (!bank) return null;

    // Generate demo account details
    const mask = Math.floor(1000 + Math.random() * 9000).toString();
    const accountName = `${bank.name} ${accountType.charAt(0).toUpperCase() + accountType.slice(1)}`;

    try {
      const { data, error } = await supabase
        .from("linked_accounts")
        .insert({
          user_id: user.id,
          institution_id: bankId,
          institution_name: bank.name,
          institution_logo: bank.logo,
          account_name: accountName,
          account_type: accountType,
          account_mask: mask,
          is_verified: true, // Auto-verify in demo mode
          verification_status: "verified",
          is_primary: linkedAccounts.length === 0,
        })
        .select()
        .single();

      if (error) throw error;

      const newAccount: LinkedAccount = {
        id: data.id,
        institutionName: data.institution_name,
        institutionLogo: data.institution_logo,
        accountName: data.account_name,
        accountType: data.account_type,
        accountMask: data.account_mask,
        isPrimary: data.is_primary || false,
        isVerified: data.is_verified || false,
        verificationStatus: data.verification_status || "pending",
        createdAt: new Date(data.created_at),
      };

      await fetchLinkedAccounts();

      toast({
        title: "Account Linked!",
        description: `${accountName} ****${mask} has been connected.`,
      });

      return newAccount;
    } catch (error) {
      console.error("Error linking account:", error);
      toast({
        title: "Error",
        description: "Failed to link bank account. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [user, linkedAccounts.length, fetchLinkedAccounts, toast]);

  // Remove a linked account
  const unlinkAccount = useCallback(async (accountId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("linked_accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;

      await fetchLinkedAccounts();

      toast({
        title: "Account Removed",
        description: "The bank account has been unlinked.",
      });

      return true;
    } catch (error) {
      console.error("Error unlinking account:", error);
      toast({
        title: "Error",
        description: "Failed to remove bank account.",
        variant: "destructive",
      });
      return false;
    }
  }, [fetchLinkedAccounts, toast]);

  // Set account as primary
  const setPrimaryAccount = useCallback(async (accountId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // First, unset all accounts as primary
      await supabase
        .from("linked_accounts")
        .update({ is_primary: false })
        .eq("user_id", user.id);

      // Then set the selected account as primary
      const { error } = await supabase
        .from("linked_accounts")
        .update({ is_primary: true })
        .eq("id", accountId);

      if (error) throw error;

      await fetchLinkedAccounts();

      toast({
        title: "Primary Account Updated",
        description: "This account is now your primary for deposits.",
      });

      return true;
    } catch (error) {
      console.error("Error setting primary account:", error);
      return false;
    }
  }, [user, fetchLinkedAccounts, toast]);

  // Process deposit
  const deposit = useCallback(async (
    accountId: string,
    amount: number
  ): Promise<{ success: boolean; transferId?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc("process_deposit", {
        p_linked_account_id: accountId,
        p_amount: amount,
      });

      if (error) throw error;

      const result = data as { success: boolean; transfer_id?: string; error?: string };

      if (!result.success) {
        toast({
          title: "Deposit Failed",
          description: getErrorMessage(result.error || "unknown_error"),
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }

      // Simulate instant completion for demo
      if (result.transfer_id) {
        setTimeout(async () => {
          await supabase.rpc("complete_transfer", { p_transfer_id: result.transfer_id });
          await fetchTransfers();
          toast({
            title: "Deposit Completed! 💰",
            description: `$${amount.toLocaleString()} has been added to your wallet.`,
          });
        }, 3000);
      }

      await fetchTransfers();

      toast({
        title: "Deposit Initiated",
        description: `Your $${amount.toLocaleString()} deposit is being processed.`,
      });

      return { success: true, transferId: result.transfer_id };
    } catch (error) {
      console.error("Error processing deposit:", error);
      toast({
        title: "Error",
        description: "Failed to process deposit. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "system_error" };
    }
  }, [fetchTransfers, toast]);

  // Process withdrawal
  const withdraw = useCallback(async (
    accountId: string,
    amount: number
  ): Promise<{ success: boolean; transferId?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.rpc("process_withdrawal", {
        p_linked_account_id: accountId,
        p_amount: amount,
      });

      if (error) throw error;

      const result = data as { success: boolean; transfer_id?: string; error?: string };

      if (!result.success) {
        toast({
          title: "Withdrawal Failed",
          description: getErrorMessage(result.error || "unknown_error"),
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }

      // Simulate completion for demo
      if (result.transfer_id) {
        setTimeout(async () => {
          await supabase.rpc("complete_transfer", { p_transfer_id: result.transfer_id });
          await fetchTransfers();
          toast({
            title: "Withdrawal Completed! ✓",
            description: `$${amount.toLocaleString()} has been sent to your bank.`,
          });
        }, 5000);
      }

      await fetchTransfers();

      toast({
        title: "Withdrawal Initiated",
        description: `Your $${amount.toLocaleString()} withdrawal is being processed.`,
      });

      return { success: true, transferId: result.transfer_id };
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Error",
        description: "Failed to process withdrawal. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: "system_error" };
    }
  }, [fetchTransfers, toast]);

  return {
    linkedAccounts,
    transfers,
    loading,
    demoBanks: DEMO_BANKS,
    linkBankAccount,
    unlinkAccount,
    setPrimaryAccount,
    deposit,
    withdraw,
    refetch: () => {
      fetchLinkedAccounts();
      fetchTransfers();
    },
  };
}

function getErrorMessage(error: string): string {
  switch (error) {
    case "not_authenticated":
      return "Please sign in to continue.";
    case "invalid_amount":
      return "Please enter a valid amount.";
    case "exceeds_limit":
      return "Amount exceeds the transaction limit.";
    case "insufficient_balance":
      return "Insufficient balance in your wallet.";
    case "account_not_found":
      return "Bank account not found.";
    case "account_not_verified":
      return "Please verify your bank account first.";
    default:
      return "An unexpected error occurred.";
  }
}
