import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  document_type: string;
  template_url: string | null;
  required_for: string[];
  signing_order: number;
  version: string;
}

export interface DocumentEnvelope {
  id: string;
  user_id: string;
  template_id: string;
  property_id: string | null;
  loan_id: string | null;
  investment_amount: number | null;
  provider: string;
  status: string;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  completed_at: string | null;
  declined_at: string | null;
  decline_reason: string | null;
  signed_document_url: string | null;
  expires_at: string;
  created_at: string;
  template?: DocumentTemplate;
}

export interface DocumentField {
  id: string;
  envelope_id: string;
  field_name: string;
  field_value: string | null;
  field_type: string;
  is_required: boolean;
  signed_at: string | null;
}

export interface UserSignature {
  id: string;
  user_id: string;
  signature_data: string;
  signature_type: string;
  font_style: string | null;
  is_default: boolean;
}

export const useDocuments = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [envelopes, setEnvelopes] = useState<DocumentEnvelope[]>([]);
  const [savedSignature, setSavedSignature] = useState<UserSignature | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTemplates();
      fetchEnvelopes();
      fetchSavedSignature();
    }
  }, [user]);

  const fetchTemplates = async () => {
    const { data, error } = await supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true)
      .order('signing_order');

    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }

    setTemplates(data || []);
  };

  const fetchEnvelopes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('document_envelopes')
      .select(`
        *,
        template:document_templates(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching envelopes:', error);
      setLoading(false);
      return;
    }

    setEnvelopes(data || []);
    setLoading(false);
  };

  const fetchSavedSignature = async () => {
    const { data, error } = await supabase
      .from('user_signatures')
      .select('*')
      .eq('is_default', true)
      .maybeSingle();

    if (!error && data) {
      setSavedSignature(data);
    }
  };

  const getTemplatesForInvestment = (investmentType: 'equity' | 'debt') => {
    return templates.filter(t => 
      t.required_for.includes(investmentType) || t.required_for.includes('all')
    ).sort((a, b) => a.signing_order - b.signing_order);
  };

  const getPendingDocuments = () => {
    return envelopes.filter(e => 
      e.status === 'sent' || e.status === 'viewed' || e.status === 'draft'
    );
  };

  const getSignedDocuments = () => {
    return envelopes.filter(e => 
      e.status === 'signed' || e.status === 'completed'
    );
  };

  const createEnvelope = async (
    templateId: string,
    propertyId?: string,
    loanId?: string,
    investmentAmount?: number
  ): Promise<string | null> => {
    const { data, error } = await supabase.rpc('create_document_envelope', {
      p_template_id: templateId,
      p_property_id: propertyId || null,
      p_loan_id: loanId || null,
      p_investment_amount: investmentAmount || null
    });

    const result = data as { success: boolean; error?: string; envelope_id?: string } | null;

    if (error || !result?.success) {
      console.error('Error creating envelope:', error || result?.error);
      toast.error('Failed to create document');
      return null;
    }

    await fetchEnvelopes();
    return result.envelope_id || null;
  };

  const getEnvelopeFields = async (envelopeId: string): Promise<DocumentField[]> => {
    const { data, error } = await supabase
      .from('document_fields')
      .select('*')
      .eq('envelope_id', envelopeId);

    if (error) {
      console.error('Error fetching fields:', error);
      return [];
    }

    return data || [];
  };

  const signDocument = async (
    envelopeId: string,
    signatureData: string,
    fields: { field_name: string; field_value: string }[]
  ): Promise<boolean> => {
    const { data, error } = await supabase.rpc('sign_document', {
      p_envelope_id: envelopeId,
      p_signature_data: signatureData,
      p_fields: fields
    });

    const result = data as { success: boolean; error?: string; signed_at?: string } | null;

    if (error || !result?.success) {
      console.error('Error signing document:', error || result?.error);
      toast.error(result?.error === 'already_signed' ? 'Document already signed' : 'Failed to sign document');
      return false;
    }

    toast.success('Document signed successfully!');
    await fetchEnvelopes();
    return true;
  };

  const markAsViewed = async (envelopeId: string) => {
    await supabase
      .from('document_envelopes')
      .update({ viewed_at: new Date().toISOString(), status: 'viewed' })
      .eq('id', envelopeId);
  };

  const declineDocument = async (envelopeId: string, reason: string): Promise<boolean> => {
    const { error } = await supabase
      .from('document_envelopes')
      .update({ 
        status: 'declined', 
        declined_at: new Date().toISOString(),
        decline_reason: reason
      })
      .eq('id', envelopeId);

    if (error) {
      console.error('Error declining document:', error);
      toast.error('Failed to decline document');
      return false;
    }

    toast.success('Document declined');
    await fetchEnvelopes();
    return true;
  };

  const saveSignature = async (
    signatureData: string,
    signatureType: 'typed' | 'drawn',
    fontStyle?: string
  ): Promise<boolean> => {
    if (!user) return false;

    // Clear existing default
    await supabase
      .from('user_signatures')
      .update({ is_default: false })
      .eq('user_id', user.id);

    const { error } = await supabase
      .from('user_signatures')
      .insert({
        user_id: user.id,
        signature_data: signatureData,
        signature_type: signatureType,
        font_style: fontStyle,
        is_default: true
      });

    if (error) {
      console.error('Error saving signature:', error);
      return false;
    }

    await fetchSavedSignature();
    return true;
  };

  const createEnvelopesForInvestment = async (
    investmentType: 'equity' | 'debt',
    propertyId?: string,
    loanId?: string,
    investmentAmount?: number
  ): Promise<string[]> => {
    const requiredTemplates = getTemplatesForInvestment(investmentType);
    const envelopeIds: string[] = [];

    for (const template of requiredTemplates) {
      // Check if envelope already exists for this template/property/loan
      const existing = envelopes.find(e => 
        e.template_id === template.id &&
        e.property_id === propertyId &&
        e.loan_id === loanId &&
        (e.status === 'sent' || e.status === 'viewed' || e.status === 'signed')
      );

      if (existing) {
        envelopeIds.push(existing.id);
      } else {
        const id = await createEnvelope(template.id, propertyId, loanId, investmentAmount);
        if (id) envelopeIds.push(id);
      }
    }

    return envelopeIds;
  };

  return {
    templates,
    envelopes,
    savedSignature,
    loading,
    getTemplatesForInvestment,
    getPendingDocuments,
    getSignedDocuments,
    createEnvelope,
    createEnvelopesForInvestment,
    getEnvelopeFields,
    signDocument,
    markAsViewed,
    declineDocument,
    saveSignature,
    refetch: fetchEnvelopes
  };
};
