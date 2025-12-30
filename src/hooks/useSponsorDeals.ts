import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSponsor } from './useSponsor';
import { toast } from 'sonner';

export interface DealFormData {
  // Step 1: Property Details
  property_name: string;
  property_type: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  property_description: string;
  year_built: number | null;
  total_units: number | null;
  total_sqft: number | null;
  current_occupancy: number | null;
  property_images: string[];
  property_documents: { name: string; url: string; type: string }[];
  
  // Step 2: Deal Structure
  raise_goal: number;
  minimum_investment: number;
  maximum_investment: number | null;
  token_price: number;
  hold_period: string;
  investment_type: string;
  
  // Step 3: Returns & Fees
  projected_irr: number | null;
  preferred_return: number | null;
  sponsor_promote: number | null;
  cash_on_cash_target: number | null;
  distribution_frequency: string;
  management_fee: number | null;
  acquisition_fee: number | null;
  
  // Step 4: Legal & Compliance
  offering_type: string;
  accredited_only: boolean;
  ppm_document_url: string | null;
  subscription_agreement_url: string | null;
  operating_agreement_url: string | null;
  sec_filing_number: string;
  
  // Tracking
  current_step: number;
  status: string;
}

export const initialDealData: DealFormData = {
  property_name: '',
  property_type: '',
  street_address: '',
  city: '',
  state: '',
  zip_code: '',
  property_description: '',
  year_built: null,
  total_units: null,
  total_sqft: null,
  current_occupancy: null,
  property_images: [],
  property_documents: [],
  
  raise_goal: 0,
  minimum_investment: 100,
  maximum_investment: null,
  token_price: 100,
  hold_period: '5 years',
  investment_type: 'Equity',
  
  projected_irr: null,
  preferred_return: null,
  sponsor_promote: null,
  cash_on_cash_target: null,
  distribution_frequency: 'Quarterly',
  management_fee: null,
  acquisition_fee: null,
  
  offering_type: '',
  accredited_only: true,
  ppm_document_url: null,
  subscription_agreement_url: null,
  operating_agreement_url: null,
  sec_filing_number: '',
  
  current_step: 1,
  status: 'draft',
};

export interface SponsorDeal extends DealFormData {
  id: string;
  sponsor_id: string;
  total_tokens: number;
  submitted_at: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  amount_raised: number;
  investor_count: number;
  created_at: string;
  updated_at: string;
}

export function useSponsorDeals() {
  const { user } = useAuth();
  const { sponsorProfile } = useSponsor();
  const [deals, setDeals] = useState<SponsorDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sponsorProfile?.id) {
      fetchDeals();
    }
  }, [sponsorProfile?.id]);

  const fetchDeals = async () => {
    if (!sponsorProfile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('sponsor_deals')
        .select('*')
        .eq('sponsor_id', sponsorProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals((data as unknown as SponsorDeal[]) || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (data: Partial<DealFormData>): Promise<string | null> => {
    if (!sponsorProfile?.id) {
      toast.error('Sponsor profile not found');
      return null;
    }

    setSaving(true);
    try {
      const { data: newDeal, error } = await supabase
        .from('sponsor_deals')
        .insert({
          sponsor_id: sponsorProfile.id,
          property_name: data.property_name || 'New Deal',
          property_type: data.property_type || 'Multifamily',
          ...data,
        } as any)
        .select('id')
        .single();

      if (error) throw error;
      toast.success('Deal created as draft');
      await fetchDeals();
      return newDeal.id;
    } catch (error: any) {
      console.error('Error creating deal:', error);
      toast.error(error.message || 'Failed to create deal');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateDeal = async (dealId: string, data: Partial<DealFormData>): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sponsor_deals')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', dealId);

      if (error) throw error;
      await fetchDeals();
      return true;
    } catch (error: any) {
      console.error('Error updating deal:', error);
      toast.error(error.message || 'Failed to update deal');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async (dealId: string | null, data: Partial<DealFormData>): Promise<string | null> => {
    if (dealId) {
      const success = await updateDeal(dealId, data);
      return success ? dealId : null;
    } else {
      return await createDeal(data);
    }
  };

  const submitForReview = async (dealId: string): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sponsor_deals')
        .update({
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', dealId);

      if (error) throw error;
      toast.success('Deal submitted for review');
      await fetchDeals();
      return true;
    } catch (error: any) {
      console.error('Error submitting deal:', error);
      toast.error(error.message || 'Failed to submit deal');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File, dealId: string, fileType: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${dealId}/${fileType}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('sponsor-deals')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sponsor-deals')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  };

  const getDeal = async (dealId: string): Promise<SponsorDeal | null> => {
    try {
      const { data, error } = await supabase
        .from('sponsor_deals')
        .select('*')
        .eq('id', dealId)
        .single();

      if (error) throw error;
      return data as unknown as SponsorDeal;
    } catch (error) {
      console.error('Error fetching deal:', error);
      return null;
    }
  };

  const deleteDeal = async (dealId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sponsor_deals')
        .delete()
        .eq('id', dealId);

      if (error) throw error;
      toast.success('Deal deleted');
      await fetchDeals();
      return true;
    } catch (error: any) {
      console.error('Error deleting deal:', error);
      toast.error(error.message || 'Failed to delete deal');
      return false;
    }
  };

  return {
    deals,
    loading,
    saving,
    fetchDeals,
    createDeal,
    updateDeal,
    saveDraft,
    submitForReview,
    uploadFile,
    getDeal,
    deleteDeal,
  };
}
