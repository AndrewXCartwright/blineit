import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface SponsorProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_logo_url: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  business_address: string | null;
  ein_tax_id: string | null;
  years_in_business: number | null;
  total_assets_managed: number;
  deals_completed: number;
  average_irr: number | null;
  bio: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  verification_status: "pending" | "verified" | "rejected";
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SponsorRegistrationData {
  email: string;
  password: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  business_address?: string;
  ein_tax_id?: string;
  years_in_business?: number;
  total_assets_managed?: number;
  deals_completed?: number;
  average_irr?: number;
  bio?: string;
  website_url?: string;
  linkedin_url?: string;
}

export function useSponsor() {
  const { user } = useAuth();
  const [sponsorProfile, setSponsorProfile] = useState<SponsorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSponsor, setIsSponsor] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSponsorProfile();
      checkSponsorRole();
    } else {
      setSponsorProfile(null);
      setIsSponsor(false);
      setLoading(false);
    }
  }, [user]);

  const checkSponsorRole = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "sponsor")
      .maybeSingle();
    
    setIsSponsor(!!data);
  };

  const fetchSponsorProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("sponsor_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!error && data) {
      setSponsorProfile(data as SponsorProfile);
    }
    setLoading(false);
  };

  const registerSponsor = async (data: SponsorRegistrationData) => {
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/sponsor/pending`,
        data: {
          name: data.contact_name,
          is_sponsor: true,
        },
      },
    });

    if (authError) {
      return { error: authError };
    }

    if (!authData.user) {
      return { error: new Error("Failed to create user") };
    }

    // Add sponsor role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({ user_id: authData.user.id, role: "sponsor" });

    if (roleError) {
      console.error("Failed to add sponsor role:", roleError);
    }

    // Create sponsor profile
    const { error: profileError } = await supabase
      .from("sponsor_profiles")
      .insert({
        user_id: authData.user.id,
        company_name: data.company_name,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone,
        business_address: data.business_address,
        ein_tax_id: data.ein_tax_id,
        years_in_business: data.years_in_business,
        total_assets_managed: data.total_assets_managed || 0,
        deals_completed: data.deals_completed || 0,
        average_irr: data.average_irr,
        bio: data.bio,
        website_url: data.website_url,
        linkedin_url: data.linkedin_url,
        verification_status: "pending",
      });

    if (profileError) {
      return { error: profileError };
    }

    return { error: null, user: authData.user };
  };

  const updateSponsorProfile = async (updates: Partial<SponsorProfile>) => {
    if (!user || !sponsorProfile) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("sponsor_profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (!error) {
      await fetchSponsorProfile();
    }

    return { error };
  };

  return {
    sponsorProfile,
    loading,
    isSponsor,
    isVerified: sponsorProfile?.verification_status === "verified",
    isPending: sponsorProfile?.verification_status === "pending",
    isRejected: sponsorProfile?.verification_status === "rejected",
    registerSponsor,
    updateSponsorProfile,
    refetch: fetchSponsorProfile,
  };
}
