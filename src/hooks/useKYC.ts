import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { z } from "zod";

// Comprehensive KYC validation schema
const kycPersonalInfoSchema = z.object({
  full_legal_name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be less than 200 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  
  date_of_birth: z.string()
    .refine((date) => {
      const dob = new Date(date);
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 18 && age <= 120;
    }, "Must be between 18 and 120 years old"),
  
  phone_number: z.string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, "Invalid phone number format")
    .min(7, "Phone number too short")
    .max(20, "Phone number too long"),
  
  ssn_last4: z.string()
    .regex(/^[0-9]{4}$/, "SSN must be exactly 4 digits"),
  
  postal_code: z.string()
    .regex(/^[A-Z0-9\s-]{3,20}$/i, "Invalid postal code format")
    .max(20, "Postal code too long"),
  
  address_line1: z.string()
    .min(5, "Address too short")
    .max(200, "Address too long")
    .regex(/^[a-zA-Z0-9\s,.#-]+$/, "Address contains invalid characters"),
  
  address_line2: z.string()
    .max(200, "Address too long")
    .regex(/^[a-zA-Z0-9\s,.#-]*$/, "Address contains invalid characters")
    .optional()
    .or(z.literal("")),
  
  city: z.string()
    .min(2, "City name too short")
    .max(100, "City name too long")
    .regex(/^[a-zA-Z\s'-]+$/, "City contains invalid characters"),
  
  state: z.string()
    .min(2, "State name too short")
    .max(100, "State name too long")
    .regex(/^[a-zA-Z\s-]+$/, "State contains invalid characters"),
  
  country: z.string()
    .min(2, "Country name too short")
    .max(100, "Country name too long")
    .regex(/^[a-zA-Z\s-]+$/, "Country contains invalid characters"),
});

export type KYCPersonalInfoInput = z.infer<typeof kycPersonalInfoSchema>;

export function validateKYCPersonalInfo(data: Partial<KYCData>): { success: boolean; errors?: Record<string, string> } {
  const result = kycPersonalInfoSchema.safeParse(data);
  
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      if (err.path[0]) {
        errors[err.path[0] as string] = err.message;
      }
    });
    return { success: false, errors };
  }
  
  return { success: true };
}

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

    // Store the file path instead of public URL for private bucket
    // Signed URLs will be generated on-demand when viewing
    return fileName;
  };

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    if (!filePath) return null;
    
    // If it's already a full URL (legacy data), return as-is
    if (filePath.startsWith("http")) return filePath;
    
    const { data, error } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  };

  const savePersonalInfo = async (data: Partial<KYCData>): Promise<{ success: boolean; errors?: Record<string, string> }> => {
    if (!user) return { success: false, errors: { general: "Not authenticated" } };

    // Validate input data
    const validation = validateKYCPersonalInfo(data);
    if (!validation.success) {
      const firstError = Object.values(validation.errors || {})[0];
      toast.error(firstError || "Invalid input data");
      return { success: false, errors: validation.errors };
    }

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
      return { success: true };
    } catch (error) {
      console.error("Error saving personal info:", error);
      toast.error("Failed to save personal information");
      return { success: false, errors: { general: "Failed to save" } };
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
    getSignedUrl,
    savePersonalInfo,
    saveDocuments,
    saveSelfie,
    submitForReview,
  };
}
