import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type InvestorType = "individual" | "entity" | "trust" | "ira";
export type AccreditationType = "income" | "net_worth" | "professional" | "entity";
export type VerificationStatus = "pending" | "under_review" | "verified" | "expired" | "rejected";
export type VerificationMethod = "self_certified" | "third_party" | "documents";

export interface AccreditedInvestor {
  id: string;
  user_id: string;
  investor_type: InvestorType;
  accreditation_type: AccreditationType;
  verification_status: VerificationStatus;
  verification_method: VerificationMethod | null;
  verified_at: string | null;
  expires_at: string | null;
  annual_income: number | null;
  net_worth: number | null;
  documents: any[];
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExclusiveOffering {
  id: string;
  name: string;
  description: string;
  offering_type: "property" | "fund" | "syndication" | "debt";
  minimum_investment: number;
  target_raise: number;
  current_raised: number;
  target_irr: number | null;
  target_multiple: number | null;
  hold_period_years: number | null;
  investor_requirements: any;
  documents: any[];
  status: "coming_soon" | "open" | "fully_subscribed" | "closed";
  opens_at: string | null;
  closes_at: string | null;
  created_at: string;
}

export interface AccreditationFormData {
  investor_type: InvestorType;
  accreditation_type: AccreditationType;
  verification_method: VerificationMethod;
  annual_income?: number;
  net_worth?: number;
  documents?: any[];
}

export function useAccreditation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: accreditation, isLoading } = useQuery({
    queryKey: ["accreditation", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("accredited_investors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as AccreditedInvestor | null;
    },
    enabled: !!user?.id,
  });

  const submitAccreditation = useMutation({
    mutationFn: async (formData: AccreditationFormData) => {
      if (!user?.id) throw new Error("Not authenticated");

      const payload = {
        user_id: user.id,
        investor_type: formData.investor_type,
        accreditation_type: formData.accreditation_type,
        verification_method: formData.verification_method,
        verification_status: "pending" as VerificationStatus,
        annual_income: formData.annual_income || null,
        net_worth: formData.net_worth || null,
        documents: formData.documents || [],
      };

      // Check if exists
      const { data: existing } = await supabase
        .from("accredited_investors")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("accredited_investors")
          .update(payload)
          .eq("user_id", user.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("accredited_investors")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accreditation"] });
      toast.success("Accreditation submitted for review");
    },
    onError: (error) => {
      toast.error("Failed to submit accreditation: " + error.message);
    },
  });

  const isVerified = accreditation?.verification_status === "verified";
  const isPending = accreditation?.verification_status === "pending" || 
                    accreditation?.verification_status === "under_review";
  const isExpired = accreditation?.verification_status === "expired";
  const isExpiringSoon = accreditation?.expires_at 
    ? new Date(accreditation.expires_at).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000
    : false;

  return {
    accreditation,
    isLoading,
    submitAccreditation,
    isVerified,
    isPending,
    isExpired,
    isExpiringSoon,
  };
}

export function useExclusiveOfferings() {
  const { data: offerings, isLoading } = useQuery({
    queryKey: ["exclusive-offerings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exclusive_offerings")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ExclusiveOffering[];
    },
  });

  return { offerings: offerings || [], isLoading };
}
