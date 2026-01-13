import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useSponsor } from './useSponsor';
import { toast } from 'sonner';

// DigiShares-compatible field structure
export interface ShareType {
  id?: string;
  shareTypeName: string;
  shareTypeCategory: 'Equity' | 'Debt';
  votingRights: boolean;
  dividendPriority: number;
  liquidationPriority: number;
  interestRate: number | null;
  lienPosition: '1st Lien' | '2nd Lien' | 'Unsecured' | null;
}

export interface PropertyDocument {
  type: string;
  name: string;
  url: string;
  required: boolean;
}

export interface PropertyFormData {
  // Step 1: Basic Information
  title: string;
  description: string;
  shortDescription: string;
  propertyType: string;
  investmentType: string;
  status: string;

  // Step 2: Location
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  latitude: number | null;
  longitude: number | null;

  // Step 3: Financial Terms
  targetRaise: number;
  minimumInvestment: number;
  maximumInvestment: number | null;
  pricePerShare: number;
  totalShares: number;
  projectedReturn: number | null;
  holdPeriod: number | null;
  distributionFrequency: string;

  // Step 4: Token Configuration
  shareTypes: ShareType[];

  // Step 5: Property Details
  propertyValue: number | null;
  squareFootage: number | null;
  units: number | null;
  yearBuilt: number | null;
  occupancyRate: number | null;
  capRate: number | null;
  noi: number | null;
  ltv: number | null;
  dscr: number | null;

  // Step 6: Media
  featuredImage: string | null;
  gallery: string[];
  video: string;
  virtualTour: string;

  // Step 7: Documents
  documents: PropertyDocument[];

  // Tracking
  currentStep: number;
}

export const initialPropertyData: PropertyFormData = {
  // Step 1
  title: '',
  description: '',
  shortDescription: '',
  propertyType: '',
  investmentType: '',
  status: 'Draft',

  // Step 2
  address: '',
  city: '',
  state: '',
  zip: '',
  country: 'USA',
  latitude: null,
  longitude: null,

  // Step 3
  targetRaise: 0,
  minimumInvestment: 0,
  pricePerShare: 0,
  totalShares: 0,
  maximumInvestment: null,
  projectedReturn: null,
  holdPeriod: null,
  distributionFrequency: 'Quarterly',

  // Step 4
  shareTypes: [],

  // Step 5
  propertyValue: null,
  squareFootage: null,
  units: null,
  yearBuilt: null,
  occupancyRate: null,
  capRate: null,
  noi: null,
  ltv: null,
  dscr: null,

  // Step 6
  featuredImage: null,
  gallery: [],
  video: '',
  virtualTour: '',

  // Step 7
  documents: [],

  // Tracking
  currentStep: 1,
};

export interface SponsorProperty extends PropertyFormData {
  id: string;
  sponsor_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
}

export function useSponsorProperties() {
  const { user } = useAuth();
  const { sponsorProfile } = useSponsor();
  const [properties, setProperties] = useState<SponsorProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sponsorProfile?.id) {
      fetchProperties();
    }
  }, [sponsorProfile?.id]);

  const fetchProperties = async () => {
    if (!sponsorProfile?.id) return;

    try {
      const { data, error } = await supabase
        .from('sponsor_properties')
        .select('*')
        .eq('sponsor_id', sponsorProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties((data as unknown as SponsorProperty[]) || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (data: Partial<PropertyFormData>): Promise<string | null> => {
    if (!sponsorProfile?.id) {
      toast.error('Sponsor profile not found');
      return null;
    }

    setSaving(true);
    try {
      const { data: newProperty, error } = await supabase
        .from('sponsor_properties')
        .insert({
          sponsor_id: sponsorProfile.id,
          title: data.title || 'New Property',
          ...data,
        } as any)
        .select('id')
        .single();

      if (error) throw error;
      toast.success('Property created as draft');
      await fetchProperties();
      return newProperty.id;
    } catch (error: any) {
      console.error('Error creating property:', error);
      toast.error(error.message || 'Failed to create property');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const updateProperty = async (propertyId: string, data: Partial<PropertyFormData>): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sponsor_properties')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId);

      if (error) throw error;
      await fetchProperties();
      return true;
    } catch (error: any) {
      console.error('Error updating property:', error);
      toast.error(error.message || 'Failed to update property');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async (propertyId: string | null, data: Partial<PropertyFormData>): Promise<string | null> => {
    if (propertyId) {
      const success = await updateProperty(propertyId, data);
      return success ? propertyId : null;
    } else {
      return await createProperty(data);
    }
  };

  const submitForReview = async (propertyId: string): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sponsor_properties')
        .update({
          status: 'pending_review',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', propertyId);

      if (error) throw error;
      toast.success('Property submitted for review');
      await fetchProperties();
      return true;
    } catch (error: any) {
      console.error('Error submitting property:', error);
      toast.error(error.message || 'Failed to submit property');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const publishProperty = async (propertyId: string): Promise<boolean> => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sponsor_properties')
        .update({
          status: 'Active',
          approved_at: new Date().toISOString(),
        })
        .eq('id', propertyId);

      if (error) throw error;
      toast.success('Property published successfully');
      await fetchProperties();
      return true;
    } catch (error: any) {
      console.error('Error publishing property:', error);
      toast.error(error.message || 'Failed to publish property');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadFile = async (file: File, propertyId: string, fileType: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${fileType}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('sponsor-properties')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('sponsor-properties')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
      return null;
    }
  };

  const getProperty = async (propertyId: string): Promise<SponsorProperty | null> => {
    try {
      const { data, error } = await supabase
        .from('sponsor_properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;
      return data as unknown as SponsorProperty;
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  };

  const deleteProperty = async (propertyId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sponsor_properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;
      toast.success('Property deleted');
      await fetchProperties();
      return true;
    } catch (error: any) {
      console.error('Error deleting property:', error);
      toast.error(error.message || 'Failed to delete property');
      return false;
    }
  };

  return {
    properties,
    loading,
    saving,
    fetchProperties,
    createProperty,
    updateProperty,
    saveDraft,
    submitForReview,
    publishProperty,
    uploadFile,
    getProperty,
    deleteProperty,
  };
}
