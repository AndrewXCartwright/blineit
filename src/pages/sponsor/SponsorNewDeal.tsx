import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSponsor } from '@/hooks/useSponsor';
import { useSponsorDeals, DealFormData, initialDealData } from '@/hooks/useSponsorDeals';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Building2, 
  DollarSign, 
  TrendingUp, 
  FileCheck, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import logo from '@/assets/logo.png';

const STEPS = [
  { id: 1, title: 'Property Details', icon: Building2, description: 'Basic property information' },
  { id: 2, title: 'Deal Structure', icon: DollarSign, description: 'Investment terms & pricing' },
  { id: 3, title: 'Returns & Fees', icon: TrendingUp, description: 'Projected returns & fee structure' },
  { id: 4, title: 'Legal & Compliance', icon: FileCheck, description: 'Regulatory documents' },
  { id: 5, title: 'Review & Submit', icon: CheckCircle2, description: 'Final review' },
];

const PROPERTY_TYPES = [
  'Multifamily',
  'Commercial',
  'Industrial',
  'Retail',
  'Hospitality',
  'Mixed-Use',
  'Land',
  'Single Family Portfolio',
];

const HOLD_PERIODS = ['3 years', '5 years', '7 years', '10 years', 'Open-ended'];
const INVESTMENT_TYPES = ['Equity', 'Debt', 'Preferred Equity'];
const DISTRIBUTION_FREQUENCIES = ['Monthly', 'Quarterly', 'Annually'];
const OFFERING_TYPES = ['Reg D 506(c)', 'Reg D 506(b)', 'Reg A+', 'Reg CF', 'Reg S'];

export default function SponsorNewDeal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dealId = searchParams.get('id');
  
  const { sponsorProfile, loading: sponsorLoading } = useSponsor();
  const { saveDraft, submitForReview, uploadFile, getDeal, saving } = useSponsorDeals();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<DealFormData>(initialDealData);
  const [currentDealId, setCurrentDealId] = useState<string | null>(dealId);
  const [loadingDeal, setLoadingDeal] = useState(!!dealId);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [confirmations, setConfirmations] = useState({
    accurate: false,
    terms: false,
    fees: false,
  });

  // Load existing deal if editing
  useEffect(() => {
    if (dealId) {
      loadExistingDeal(dealId);
    }
  }, [dealId]);

  const loadExistingDeal = async (id: string) => {
    setLoadingDeal(true);
    const deal = await getDeal(id);
    if (deal) {
      setFormData({
        property_name: deal.property_name || '',
        property_type: deal.property_type || '',
        street_address: deal.street_address || '',
        city: deal.city || '',
        state: deal.state || '',
        zip_code: deal.zip_code || '',
        property_description: deal.property_description || '',
        year_built: deal.year_built,
        total_units: deal.total_units,
        total_sqft: deal.total_sqft,
        current_occupancy: deal.current_occupancy,
        property_images: deal.property_images || [],
        property_documents: deal.property_documents || [],
        raise_goal: deal.raise_goal || 0,
        minimum_investment: deal.minimum_investment || 100,
        maximum_investment: deal.maximum_investment,
        token_price: deal.token_price || 100,
        hold_period: deal.hold_period || '5 years',
        investment_type: deal.investment_type || 'Equity',
        projected_irr: deal.projected_irr,
        preferred_return: deal.preferred_return,
        sponsor_promote: deal.sponsor_promote,
        cash_on_cash_target: deal.cash_on_cash_target,
        distribution_frequency: deal.distribution_frequency || 'Quarterly',
        management_fee: deal.management_fee,
        acquisition_fee: deal.acquisition_fee,
        offering_type: deal.offering_type || '',
        accredited_only: deal.accredited_only ?? true,
        ppm_document_url: deal.ppm_document_url,
        subscription_agreement_url: deal.subscription_agreement_url,
        operating_agreement_url: deal.operating_agreement_url,
        sec_filing_number: deal.sec_filing_number || '',
        current_step: deal.current_step || 1,
        status: deal.status || 'draft',
      });
      setCurrentStep(deal.current_step || 1);
      setCurrentDealId(id);
    }
    setLoadingDeal(false);
  };

  const updateField = <K extends keyof DealFormData>(field: K, value: DealFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    const id = await saveDraft(currentDealId, { ...formData, current_step: currentStep });
    if (id && !currentDealId) {
      setCurrentDealId(id);
      navigate(`/sponsor/deals/new?id=${id}`, { replace: true });
    }
    if (id) toast.success('Draft saved');
  };

  const handleImageUpload = async (files: FileList) => {
    if (!currentDealId) {
      // Create draft first
      const id = await saveDraft(null, { ...formData, property_name: formData.property_name || 'New Deal' });
      if (!id) return;
      setCurrentDealId(id);
    }

    setUploadingImages(true);
    const newImages = [...formData.property_images];
    
    for (const file of Array.from(files)) {
      if (newImages.length >= 10) {
        toast.error('Maximum 10 images allowed');
        break;
      }
      const url = await uploadFile(file, currentDealId!, 'images');
      if (url) newImages.push(url);
    }
    
    updateField('property_images', newImages);
    setUploadingImages(false);
  };

  const handleDocUpload = async (file: File, docType: string) => {
    if (!currentDealId) {
      const id = await saveDraft(null, { ...formData, property_name: formData.property_name || 'New Deal' });
      if (!id) return;
      setCurrentDealId(id);
    }

    setUploadingDocs(true);
    const url = await uploadFile(file, currentDealId!, docType);
    if (url) {
      if (docType === 'ppm') updateField('ppm_document_url', url);
      else if (docType === 'subscription') updateField('subscription_agreement_url', url);
      else if (docType === 'operating') updateField('operating_agreement_url', url);
      else {
        const newDocs = [...formData.property_documents, { name: file.name, url, type: docType }];
        updateField('property_documents', newDocs);
      }
    }
    setUploadingDocs(false);
  };

  const removeImage = (index: number) => {
    const newImages = formData.property_images.filter((_, i) => i !== index);
    updateField('property_images', newImages);
  };

  const removePropertyDoc = (index: number) => {
    const newDocs = formData.property_documents.filter((_, i) => i !== index);
    updateField('property_documents', newDocs);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.property_name.trim()) {
          toast.error('Property name is required');
          return false;
        }
        if (!formData.property_type) {
          toast.error('Property type is required');
          return false;
        }
        if (formData.property_description.length < 500) {
          toast.error('Property description must be at least 500 characters');
          return false;
        }
        return true;
      case 2:
        if (formData.raise_goal <= 0) {
          toast.error('Raise goal must be greater than 0');
          return false;
        }
        if (formData.token_price <= 0) {
          toast.error('Token price must be greater than 0');
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        if (!formData.offering_type) {
          toast.error('Offering type is required');
          return false;
        }
        return true;
      case 5:
        if (!confirmations.accurate || !confirmations.terms || !confirmations.fees) {
          toast.error('Please confirm all checkboxes');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (!validateStep(currentStep)) return;
    await handleSaveDraft();
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;
    if (!currentDealId) {
      toast.error('Please save your deal first');
      return;
    }

    const success = await submitForReview(currentDealId);
    if (success) {
      navigate('/sponsor/dashboard');
    }
  };

  // Calculate returns example
  const calculateReturnsExample = () => {
    const investment = 100000;
    const pref = formData.preferred_return || 8;
    const promote = formData.sponsor_promote || 20;
    const irr = formData.projected_irr || 15;
    const years = parseInt(formData.hold_period) || 5;
    const platformFeeRate = 0.005;

    const totalReturn = investment * Math.pow(1 + irr / 100, years) - investment;
    const prefReturn = investment * (pref / 100) * years;
    const excessReturn = Math.max(0, totalReturn - prefReturn);
    const sponsorShare = excessReturn * (promote / 100);
    const investorReceives = investment + prefReturn + (excessReturn - sponsorShare);
    const platformFee = investment * platformFeeRate * years;

    return {
      investorReceives: Math.round(investorReceives),
      sponsorReceives: Math.round(sponsorShare),
      platformFee: Math.round(platformFee),
    };
  };

  if (sponsorLoading || loadingDeal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = (currentStep / 5) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/sponsor/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <img src={logo} alt="B-LINE-IT" className="h-8" />
            <span className="text-lg font-semibold text-foreground">List New Deal</span>
          </div>
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <Progress value={progress} className="h-2 mb-4" />
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-opacity ${
                  step.id <= currentStep ? 'opacity-100' : 'opacity-50'
                }`}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.id === currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : step.id < currentStep 
                      ? 'bg-green-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className="text-xs font-medium text-center hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const StepIcon = STEPS[currentStep - 1].icon;
                return <StepIcon className="h-5 w-5 text-primary" />;
              })()}
              Step {currentStep}: {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Property Details */}
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="property_name">Property Name *</Label>
                    <Input
                      id="property_name"
                      value={formData.property_name}
                      onChange={(e) => updateField('property_name', e.target.value)}
                      placeholder="e.g., Sunset Gardens Apartments"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property_type">Property Type *</Label>
                    <Select value={formData.property_type} onValueChange={(v) => updateField('property_type', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />
                <h3 className="font-medium text-foreground">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={formData.street_address}
                      onChange={(e) => updateField('street_address', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Los Angeles"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        placeholder="CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        value={formData.zip_code}
                        onChange={(e) => updateField('zip_code', e.target.value)}
                        placeholder="90001"
                      />
                    </div>
                  </div>
                </div>

                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="description">
                    Property Description * <span className="text-muted-foreground text-sm">({formData.property_description.length}/500 min)</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.property_description}
                    onChange={(e) => updateField('property_description', e.target.value)}
                    placeholder="Provide a detailed description of the property, including its history, current condition, amenities, and investment highlights..."
                    className="min-h-[150px]"
                  />
                </div>

                <Separator />
                <h3 className="font-medium text-foreground">Property Specs</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="year_built">Year Built</Label>
                    <Input
                      id="year_built"
                      type="number"
                      value={formData.year_built || ''}
                      onChange={(e) => updateField('year_built', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="1995"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="units">Total Units</Label>
                    <Input
                      id="units"
                      type="number"
                      value={formData.total_units || ''}
                      onChange={(e) => updateField('total_units', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sqft">Total Sq Ft</Label>
                    <Input
                      id="sqft"
                      type="number"
                      value={formData.total_sqft || ''}
                      onChange={(e) => updateField('total_sqft', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupancy">Occupancy %</Label>
                    <Input
                      id="occupancy"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.current_occupancy || ''}
                      onChange={(e) => updateField('current_occupancy', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="95"
                    />
                  </div>
                </div>

                <Separator />
                <h3 className="font-medium text-foreground">Property Images (up to 10)</h3>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="images"
                    accept="image/*"
                    multiple
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                  <label htmlFor="images" className="cursor-pointer flex flex-col items-center gap-2">
                    {uploadingImages ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">Drag & drop or click to upload images</span>
                  </label>
                </div>
                {formData.property_images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {formData.property_images.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt={`Property ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />
                <h3 className="font-medium text-foreground">Property Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['rent_roll', 'financials', 'inspection'].map((docType) => (
                    <div key={docType} className="border border-border rounded-lg p-4">
                      <Label className="capitalize mb-2 block">{docType.replace('_', ' ')}</Label>
                      <input
                        type="file"
                        id={docType}
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0], docType)}
                        className="hidden"
                        disabled={uploadingDocs}
                      />
                      <label
                        htmlFor={docType}
                        className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline"
                      >
                        <Upload className="h-4 w-4" />
                        Upload {docType.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
                {formData.property_documents.length > 0 && (
                  <div className="space-y-2">
                    {formData.property_documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-muted rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{doc.name}</span>
                          <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                        </div>
                        <button onClick={() => removePropertyDoc(idx)} className="text-destructive hover:text-destructive/80">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Step 2: Deal Structure */}
            {currentStep === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="raise_goal">Raise Goal ($) *</Label>
                    <Input
                      id="raise_goal"
                      type="number"
                      min="0"
                      value={formData.raise_goal || ''}
                      onChange={(e) => updateField('raise_goal', parseFloat(e.target.value) || 0)}
                      placeholder="1000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="token_price">Token Price ($) *</Label>
                    <Input
                      id="token_price"
                      type="number"
                      min="1"
                      value={formData.token_price || ''}
                      onChange={(e) => updateField('token_price', parseFloat(e.target.value) || 100)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_invest">Minimum Investment ($)</Label>
                    <Input
                      id="min_invest"
                      type="number"
                      min="1"
                      value={formData.minimum_investment || ''}
                      onChange={(e) => updateField('minimum_investment', parseFloat(e.target.value) || 100)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_invest">Maximum Investment ($) <span className="text-muted-foreground">(optional)</span></Label>
                    <Input
                      id="max_invest"
                      type="number"
                      min="0"
                      value={formData.maximum_investment || ''}
                      onChange={(e) => updateField('maximum_investment', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="No limit"
                    />
                  </div>
                </div>

                {formData.raise_goal > 0 && formData.token_price > 0 && (
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">Total Tokens Available:</span>{' '}
                      {Math.floor(formData.raise_goal / formData.token_price).toLocaleString()} tokens
                    </p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hold_period">Hold Period</Label>
                    <Select value={formData.hold_period} onValueChange={(v) => updateField('hold_period', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOLD_PERIODS.map(period => (
                          <SelectItem key={period} value={period}>{period}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="investment_type">Investment Type</Label>
                    <Select value={formData.investment_type} onValueChange={(v) => updateField('investment_type', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {INVESTMENT_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Returns & Fees */}
            {currentStep === 3 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="projected_irr">Projected IRR (%)</Label>
                    <Input
                      id="projected_irr"
                      type="number"
                      step="0.1"
                      value={formData.projected_irr || ''}
                      onChange={(e) => updateField('projected_irr', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="15"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_return">Preferred Return / Pref (%)</Label>
                    <Input
                      id="preferred_return"
                      type="number"
                      step="0.1"
                      value={formData.preferred_return || ''}
                      onChange={(e) => updateField('preferred_return', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="8"
                    />
                    <p className="text-xs text-muted-foreground">What investors receive first before profit split</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sponsor_promote">Sponsor Promote (%)</Label>
                    <Input
                      id="sponsor_promote"
                      type="number"
                      step="0.1"
                      value={formData.sponsor_promote || ''}
                      onChange={(e) => updateField('sponsor_promote', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="20"
                    />
                    <p className="text-xs text-muted-foreground">Sponsor's share of profits above the pref</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cash_on_cash">Cash-on-Cash Target (%)</Label>
                    <Input
                      id="cash_on_cash"
                      type="number"
                      step="0.1"
                      value={formData.cash_on_cash_target || ''}
                      onChange={(e) => updateField('cash_on_cash_target', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="6"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="distribution">Distribution Frequency</Label>
                    <Select value={formData.distribution_frequency} onValueChange={(v) => updateField('distribution_frequency', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISTRIBUTION_FREQUENCIES.map(freq => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="management_fee">Management Fee (%)</Label>
                    <Input
                      id="management_fee"
                      type="number"
                      step="0.1"
                      value={formData.management_fee || ''}
                      onChange={(e) => updateField('management_fee', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="1"
                    />
                    <p className="text-xs text-muted-foreground">Sponsor's ongoing fee</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acquisition_fee">Acquisition Fee (%)</Label>
                    <Input
                      id="acquisition_fee"
                      type="number"
                      step="0.1"
                      value={formData.acquisition_fee || ''}
                      onChange={(e) => updateField('acquisition_fee', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="1"
                    />
                    <p className="text-xs text-muted-foreground">One-time fee at close</p>
                  </div>
                </div>

                <Separator />

                {/* Returns Calculator */}
                <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Returns Example
                    </CardTitle>
                    <CardDescription>
                      $100K investment at {formData.preferred_return || 8}% pref, {formData.sponsor_promote || 20}% promote, {formData.projected_irr || 15}% IRR over {parseInt(formData.hold_period) || 5} years
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-500">
                          ${calculateReturnsExample().investorReceives.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Investor Receives</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          ${calculateReturnsExample().sponsorReceives.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Sponsor Receives</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-muted-foreground">
                          ${calculateReturnsExample().platformFee.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Platform Fee (0.5%)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Step 4: Legal & Compliance */}
            {currentStep === 4 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="offering_type">Offering Type *</Label>
                    <Select value={formData.offering_type} onValueChange={(v) => updateField('offering_type', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select offering type" />
                      </SelectTrigger>
                      <SelectContent>
                        {OFFERING_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sec_filing">SEC Filing Number <span className="text-muted-foreground">(if applicable)</span></Label>
                    <Input
                      id="sec_filing"
                      value={formData.sec_filing_number}
                      onChange={(e) => updateField('sec_filing_number', e.target.value)}
                      placeholder="e.g., 0001234567-23-001234"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    id="accredited_only"
                    checked={formData.accredited_only}
                    onCheckedChange={(v) => updateField('accredited_only', v)}
                  />
                  <Label htmlFor="accredited_only">Accredited Investors Only</Label>
                </div>

                <Separator />
                <h3 className="font-medium text-foreground">Legal Documents</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* PPM */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <Label>Private Placement Memorandum (PPM)</Label>
                    {formData.ppm_document_url ? (
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600">Uploaded</span>
                        <button onClick={() => updateField('ppm_document_url', null)} className="ml-auto text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          id="ppm"
                          accept=".pdf"
                          onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0], 'ppm')}
                          className="hidden"
                          disabled={uploadingDocs}
                        />
                        <label htmlFor="ppm" className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                          <Upload className="h-4 w-4" />
                          Upload PPM
                        </label>
                      </>
                    )}
                  </div>

                  {/* Subscription Agreement */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <Label>Subscription Agreement</Label>
                    {formData.subscription_agreement_url ? (
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600">Uploaded</span>
                        <button onClick={() => updateField('subscription_agreement_url', null)} className="ml-auto text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          id="subscription"
                          accept=".pdf"
                          onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0], 'subscription')}
                          className="hidden"
                          disabled={uploadingDocs}
                        />
                        <label htmlFor="subscription" className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                          <Upload className="h-4 w-4" />
                          Upload Agreement
                        </label>
                      </>
                    )}
                  </div>

                  {/* Operating Agreement */}
                  <div className="border border-border rounded-lg p-4 space-y-3">
                    <Label>Operating Agreement</Label>
                    {formData.operating_agreement_url ? (
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-green-600">Uploaded</span>
                        <button onClick={() => updateField('operating_agreement_url', null)} className="ml-auto text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          id="operating"
                          accept=".pdf"
                          onChange={(e) => e.target.files?.[0] && handleDocUpload(e.target.files[0], 'operating')}
                          className="hidden"
                          disabled={uploadingDocs}
                        />
                        <label htmlFor="operating" className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                          <Upload className="h-4 w-4" />
                          Upload Agreement
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Step 5: Review & Submit */}
            {currentStep === 5 && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Summary Column */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Deal Summary</h3>
                    
                    <Card className="bg-muted/50">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Property</span>
                          <span className="font-medium">{formData.property_name || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type</span>
                          <span>{formData.property_type || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location</span>
                          <span>{formData.city && formData.state ? `${formData.city}, ${formData.state}` : 'Not set'}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Raise Goal</span>
                          <span className="font-semibold text-primary">${formData.raise_goal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Token Price</span>
                          <span>${formData.token_price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Hold Period</span>
                          <span>{formData.hold_period}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Investment Type</span>
                          <span>{formData.investment_type}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Projected IRR</span>
                          <span className="font-semibold text-green-500">{formData.projected_irr || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Preferred Return</span>
                          <span>{formData.preferred_return || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sponsor Promote</span>
                          <span>{formData.sponsor_promote || 0}%</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Offering Type</span>
                          <span>{formData.offering_type || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Accredited Only</span>
                          <span>{formData.accredited_only ? 'Yes' : 'No'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Documents Status */}
                    <h3 className="font-semibold text-foreground">Documents</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {formData.property_images.length > 0 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-destructive" />
                        )}
                        <span className="text-sm">{formData.property_images.length} Property Images</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.ppm_document_url ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">PPM Document</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.subscription_agreement_url ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">Subscription Agreement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {formData.operating_agreement_url ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">Operating Agreement</span>
                      </div>
                    </div>
                  </div>

                  {/* Confirmations Column */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Confirmations</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                        <Checkbox
                          id="accurate"
                          checked={confirmations.accurate}
                          onCheckedChange={(v) => setConfirmations(prev => ({ ...prev, accurate: !!v }))}
                        />
                        <div>
                          <label htmlFor="accurate" className="font-medium cursor-pointer">
                            I confirm all information is accurate
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            All property details, financial projections, and documents are truthful and complete.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                        <Checkbox
                          id="terms"
                          checked={confirmations.terms}
                          onCheckedChange={(v) => setConfirmations(prev => ({ ...prev, terms: !!v }))}
                        />
                        <div>
                          <label htmlFor="terms" className="font-medium cursor-pointer">
                            I agree to B-LINE-IT Sponsor Terms
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            I have read and agree to the platform's terms of service for sponsors.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 border border-border rounded-lg">
                        <Checkbox
                          id="fees"
                          checked={confirmations.fees}
                          onCheckedChange={(v) => setConfirmations(prev => ({ ...prev, fees: !!v }))}
                        />
                        <div>
                          <label htmlFor="fees" className="font-medium cursor-pointer">
                            I understand the 0.5% annual platform fee
                          </label>
                          <p className="text-sm text-muted-foreground mt-1">
                            A 0.5% annual fee on AUM will be charged for using the platform.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Card className="bg-amber-500/10 border-amber-500/20">
                      <CardContent className="p-4">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          <strong>Note:</strong> Deals are reviewed within 24-48 hours before going live. Our team will verify all information and may request additional documentation if needed.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-3">
            {currentStep < 5 ? (
              <Button onClick={nextStep} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={saving || !confirmations.accurate || !confirmations.terms || !confirmations.fees}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Submit for Review
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
