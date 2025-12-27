import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  wallet_balance: number;
}

interface Holding {
  id: string;
  property_id: string;
  tokens: number;
  average_buy_price: number;
  property?: {
    id: string;
    name: string;
    token_price: number;
    apy: number;
    city: string;
    state: string;
  };
}

interface Bet {
  id: string;
  market_id: string;
  position: string;
  shares: number;
  entry_price: number;
  amount: number;
  status: string;
  payout: number | null;
  market?: {
    id: string;
    question: string;
    title: string | null;
    yes_price: number;
    no_price: number;
    expires_at: string;
    status: string;
  };
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  property_id: string | null;
  market_id: string | null;
  created_at: string;
}

export function useUserData() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setHoldings([]);
      setBets([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch holdings with property data
      const { data: holdingsData } = await supabase
        .from("user_holdings")
        .select("*, property:properties(id, name, token_price, apy, city, state)")
        .eq("user_id", user.id);

      if (holdingsData) {
        setHoldings(holdingsData as unknown as Holding[]);
      }

      // Fetch bets with market data
      const { data: betsData } = await supabase
        .from("user_bets")
        .select("*, market:prediction_markets(id, question, title, yes_price, no_price, expires_at, status)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (betsData) {
        setBets(betsData as unknown as Bet[]);
      }

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (transactionsData) {
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate portfolio value
  const portfolioValue = holdings.reduce((total, holding) => {
    const currentPrice = holding.property?.token_price || 0;
    return total + (holding.tokens * currentPrice);
  }, 0);

  // Calculate total earnings from properties
  const totalEarnings = holdings.reduce((total, holding) => {
    const currentPrice = holding.property?.token_price || 0;
    const costBasis = holding.tokens * holding.average_buy_price;
    const currentValue = holding.tokens * currentPrice;
    return total + (currentValue - costBasis);
  }, 0);

  // Active bets value
  const activeBetsValue = bets
    .filter(bet => bet.status === "active")
    .reduce((total, bet) => total + bet.amount, 0);

  // Betting winnings
  const bettingWinnings = bets
    .filter(bet => bet.status === "won")
    .reduce((total, bet) => total + (bet.payout || 0) - bet.amount, 0);

  return {
    profile,
    holdings,
    bets,
    transactions,
    loading,
    portfolioValue,
    totalEarnings,
    activeBetsValue,
    bettingWinnings,
    walletBalance: profile?.wallet_balance || 0,
    refetch: fetchData,
  };
}

export function usePlaceBet() {
  const { user } = useAuth();

  const placeBet = async (
    marketId: string,
    position: "bull" | "bear",
    amount: number,
    entryPrice: number
  ) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to place a bet",
        variant: "destructive",
      });
      return { success: false };
    }

    const shares = amount / (entryPrice / 100);

    try {
      // Insert bet
      const { error: betError } = await supabase.from("user_bets").insert({
        user_id: user.id,
        market_id: marketId,
        position: position === "bull" ? "YES" : "NO",
        shares,
        entry_price: entryPrice,
        amount,
        status: "active",
      });

      if (betError) throw betError;

      // Insert transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "bet_placed",
        amount: -amount,
        description: `Placed ${position.toUpperCase()} bet`,
        market_id: marketId,
      });

      if (txError) throw txError;

      // Update wallet balance - would need RPC function for atomic update
      // For now, we'll handle this on the backend

      toast({
        title: "Bet placed!",
        description: `Your ${position.toUpperCase()} bet of $${amount} has been placed`,
      });

      return { success: true };
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  return { placeBet };
}

export function useBuyTokens() {
  const { user } = useAuth();

  const buyTokens = async (
    propertyId: string,
    totalCost: number,
    tokenPrice: number
  ) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to buy tokens",
        variant: "destructive",
      });
      return { success: false };
    }

    // Calculate tokens from total cost (which includes fee)
    const subtotal = totalCost / 1.01; // Remove 1% fee
    const tokens = subtotal / tokenPrice;

    try {
      // Get current wallet balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile || profile.wallet_balance < totalCost) {
        toast({
          title: "Insufficient balance",
          description: "You don't have enough funds for this purchase",
          variant: "destructive",
        });
        return { success: false };
      }

      // Check if user already has holdings for this property
      const { data: existingHolding } = await supabase
        .from("user_holdings")
        .select("*")
        .eq("user_id", user.id)
        .eq("property_id", propertyId)
        .maybeSingle();

      if (existingHolding) {
        // Update existing holding
        const newTokens = existingHolding.tokens + tokens;
        const newAvgPrice = 
          ((existingHolding.tokens * existingHolding.average_buy_price) + subtotal) / newTokens;

        const { error } = await supabase
          .from("user_holdings")
          .update({
            tokens: newTokens,
            average_buy_price: newAvgPrice,
          })
          .eq("id", existingHolding.id);

        if (error) throw error;
      } else {
        // Create new holding
        const { error } = await supabase.from("user_holdings").insert({
          user_id: user.id,
          property_id: propertyId,
          tokens,
          average_buy_price: tokenPrice,
        });

        if (error) throw error;
      }

      // Deduct from wallet balance
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ wallet_balance: profile.wallet_balance - totalCost })
        .eq("user_id", user.id);

      if (balanceError) throw balanceError;

      // Insert transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "buy_tokens",
        amount: -totalCost,
        description: `Purchased ${tokens.toFixed(2)} tokens`,
        property_id: propertyId,
      });

      if (txError) throw txError;

      return { success: true, tokens };
    } catch (error) {
      console.error("Error buying tokens:", error);
      toast({
        title: "Error",
        description: "Failed to buy tokens. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  return { buyTokens };
}

export function useSellTokens() {
  const { user } = useAuth();

  const sellTokens = async (
    propertyId: string,
    tokens: number,
    tokenPrice: number
  ) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to sell tokens",
        variant: "destructive",
      });
      return { success: false };
    }

    const subtotal = tokens * tokenPrice;
    const fee = subtotal * 0.01;
    const proceeds = subtotal - fee;

    try {
      // Get current holding
      const { data: holding } = await supabase
        .from("user_holdings")
        .select("*")
        .eq("user_id", user.id)
        .eq("property_id", propertyId)
        .maybeSingle();

      if (!holding || holding.tokens < tokens) {
        toast({
          title: "Insufficient tokens",
          description: "You don't have enough tokens to sell",
          variant: "destructive",
        });
        return { success: false };
      }

      const newTokens = holding.tokens - tokens;

      if (newTokens <= 0) {
        // Delete the holding
        const { error } = await supabase
          .from("user_holdings")
          .delete()
          .eq("id", holding.id);

        if (error) throw error;
      } else {
        // Update the holding
        const { error } = await supabase
          .from("user_holdings")
          .update({ tokens: newTokens })
          .eq("id", holding.id);

        if (error) throw error;
      }

      // Get current wallet balance
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) throw new Error("Profile not found");

      // Add to wallet balance
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ wallet_balance: profile.wallet_balance + proceeds })
        .eq("user_id", user.id);

      if (balanceError) throw balanceError;

      // Insert transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: "sell_tokens",
        amount: proceeds,
        description: `Sold ${tokens.toFixed(2)} tokens`,
        property_id: propertyId,
      });

      if (txError) throw txError;

      return { success: true, proceeds };
    } catch (error) {
      console.error("Error selling tokens:", error);
      toast({
        title: "Error",
        description: "Failed to sell tokens. Please try again.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  return { sellTokens };
}
