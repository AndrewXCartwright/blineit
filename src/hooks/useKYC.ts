import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface KYCData {
  id?: string;
  user_id: string;
  full_legal_name: string;
  date_of_birth: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone_number: string;
  ssn_last4: string;
  id_type: string;
  id_front_url?: string;
  id_back_url?: string;
  selfie_url?: string;
  status: string;
  rejection_reason?: string;
}

export type KYCStatus = "not_started" | "pending" | "in_review" | "verified" | "rejected";

export function useKYC() {
  const { user } = useAuth();
  const [kycData, setKycData] = useState<KYCData | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatus>("not_started");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchKYC = async () => {
      try {
        // Fetch profile KYC status
        const { data: profile } = await supabase
          .from("profiles")
          .select("kyc_status")
          .eq("user_id", user.id)
          .single();

        if (profile?.kyc_status) {
          setKycStatus(profile.kyc_status as KYCStatus);
        }

        // Fetch KYC verification details
        const { data: kyc } = await supabase
          .from("kyc_verifications")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (kyc) {
          setKycData(kyc as unknown as KYCData);
          setKycStatus(kyc.status as KYCStatus);
        }
      } catch (error) {
        console.error("Error fetching KYC data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKYC();
  }, [user]);

  const uploadDocument = async (file: File, type: "id_front" | "id_back" | "selfie"): Promise<string | null> => {
    if (!user) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      toast.error(`Failed to upload ${type.replace("_", " ")}`);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("kyc-documents")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const savePersonalInfo = async (data: Partial<KYCData>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("kyc_verifications")
        .upsert({
          user_id: user.id,
          ...data,
          status: "pending",
        }, { onConflict: "user_id" });

      if (error) throw error;

      setKycData(prev => prev ? { ...prev, ...data } : { user_id: user.id, ...data } as KYCData);
      return true;
    } catch (error) {
      console.error("Error saving personal info:", error);
      toast.error("Failed to save personal information");
      return false;
    }
  };

  const saveDocuments = async (idFrontUrl: string, idBackUrl: string, idType: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("kyc_verifications")
        .update({
          id_front_url: idFrontUrl,
          id_back_url: idBackUrl,
          id_type: idType,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setKycData(prev => prev ? { ...prev, id_front_url: idFrontUrl, id_back_url: idBackUrl, id_type: idType } : null);
      return true;
    } catch (error) {
      console.error("Error saving documents:", error);
      toast.error("Failed to save documents");
      return false;
    }
  };

  const saveSelfie = async (selfieUrl: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("kyc_verifications")
        .update({
          selfie_url: selfieUrl,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      setKycData(prev => prev ? { ...prev, selfie_url: selfieUrl } : null);
      return true;
    } catch (error) {
      console.error("Error saving selfie:", error);
      toast.error("Failed to save selfie");
      return false;
    }
  };

  const submitForReview = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      // Update KYC verification status
      const { error: kycError } = await supabase
        .from("kyc_verifications")
        .update({ status: "in_review" })
        .eq("user_id", user.id);

      if (kycError) throw kycError;

      // Update profile KYC status
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          kyc_status: "in_review",
          kyc_submitted_at: new Date().toISOString()
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      setKycStatus("in_review");
      toast.success("KYC submitted for review!");
      return true;
    } catch (error) {
      console.error("Error submitting KYC:", error);
      toast.error("Failed to submit KYC");
      return false;
    }
  };

  const isVerified = kycStatus === "verified";
  const isPending = kycStatus === "in_review" || kycStatus === "pending";

  return {
    kycData,
    kycStatus,
    loading,
    isVerified,
    isPending,
    uploadDocument,
    savePersonalInfo,
    saveDocuments,
    saveSelfie,
    submitForReview,
  };
}
