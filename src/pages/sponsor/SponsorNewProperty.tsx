import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSponsor } from '@/hooks/useSponsor';
import { useSponsorProperties, PropertyFormData, initialPropertyData, ShareType } from '@/hooks/useSponsorProperties';
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
  MapPin,
  DollarSign,
  Coins,
  LayoutList,
  Image as ImageIcon,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Upload,
  X,
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  Edit
} from 'lucide-react';
import logo from '@/assets/logo.png';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Building2, description: 'Property name & type' },
  { id: 2, title: 'Location', icon: MapPin, description: 'Address details' },
  { id: 3, title: 'Financial', icon: DollarSign, description: 'Investment terms' },
  { id: 4, title: 'Tokens', icon: Coins, description: 'Share configuration' },
  { id: 5, title: 'Details', icon: LayoutList, description: 'Property specs' },
  { id: 6, title: 'Media', icon: ImageIcon, description: 'Images & videos' },
  { id: 7, title: 'Documents', icon: FileText, description: 'Legal documents' },
  { id: 8, title: 'Review', icon: CheckCircle2, description: 'Final review' },
];

const PROPERTY_TYPES = [
  'Multifamily',
  'Commercial',
  'Industrial',
  'Retail',
  'Mixed-Use',
  'Land',
  'Single Family',
  'Hotel',
];

const INVESTMENT_TYPES = ['Equity', 'Debt', 'Preferred Equity', 'Mezzanine'];
const STATUS_OPTIONS = ['Draft', 'Coming Soon', 'Active', 'Funded', 'Closed'];
const DISTRIBUTION_FREQUENCIES = ['Monthly', 'Quarterly', 'Annually', 'At Exit'];
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

const LIEN_POSITIONS = ['1st Lien', '2nd Lien', 'Unsecured'];

const DOCUMENT_TYPES = [
  { key: 'offeringMemorandum', label: 'Offering Memorandum', required: true },
  { key: 'subscriptionAgreement', label: 'Subscription Agreement', required: true },
  { key: 'operatingAgreement', label: 'Operating Agreement', required: false },
  { key: 'propertyAppraisal', label: 'Property Appraisal', required: false },
  { key: 'financialStatements', label: 'Financial Statements', required: false },
  { key: 'titleReport', label: 'Title Report', required: false },
  { key: 'environmentalReport', label: 'Environmental Report', required: false },
];

export default function SponsorNewProperty() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get('id');

  const { sponsorProfile, loading: sponsorLoading } = useSponsor();
  const { saveDraft, submitForReview, publishProperty, uploadFile, getProperty, saving } = useSponsorProperties();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>(initialPropertyData);
  const [currentPropertyId, setCurrentPropertyId] = useState<string | null>(propertyId);
  const [loadingProperty, setLoadingProperty] = useState(!!propertyId);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Load existing property if editing
  useEffect(() => {
    if (propertyId) {
      loadExistingProperty(propertyId);
    }
  }, [propertyId]);

  const loadExistingProperty = async (id: string) => {
    setLoadingProperty(true);
    const property = await getProperty(id);
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        shortDescription: property.shortDescription || '',
        propertyType: property.propertyType || '',
        investmentType: property.investmentType || '',
        status: property.status || 'Draft',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        zip: property.zip || '',
        country: property.country || 'USA',
        latitude: property.latitude,
        longitude: property.longitude,
        targetRaise: property.targetRaise || 0,
        minimumInvestment: property.minimumInvestment || 0,
        maximumInvestment: property.maximumInvestment,
        pricePerShare: property.pricePerShare || 0,
        totalShares: property.totalShares || 0,
        projectedReturn: property.projectedReturn,
        holdPeriod: property.holdPeriod,
        distributionFrequency: property.distributionFrequency || 'Quarterly',
        shareTypes: property.shareTypes || [],
        propertyValue: property.propertyValue,
        squareFootage: property.squareFootage,
        units: property.units,
        yearBuilt: property.yearBuilt,
        occupancyRate: property.occupancyRate,
        capRate: property.capRate,
        noi: property.noi,
        ltv: property.ltv,
        dscr: property.dscr,
        featuredImage: property.featuredImage,
        gallery: property.gallery || [],
        video: property.video || '',
        virtualTour: property.virtualTour || '',
        documents: property.documents || [],
        currentStep: property.currentStep || 1,
      });
      setCurrentStep(property.currentStep || 1);
      setCurrentPropertyId(id);
    }
    setLoadingProperty(false);
  };

  const updateField = <K extends keyof PropertyFormData>(field: K, value: PropertyFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    const id = await saveDraft(currentPropertyId, { ...formData, currentStep });
    if (id && !currentPropertyId) {
      setCurrentPropertyId(id);
      navigate(`/sponsor/properties/new?id=${id}`, { replace: true });
    }
    if (id) toast.success('Draft saved');
  };

  const handleFeaturedImageUpload = async (files: FileList) => {
    if (!files.length) return;
    
    let propId = currentPropertyId;
    if (!propId) {
      propId = await saveDraft(null, { ...formData, title: formData.title || 'New Property' });
      if (!propId) return;
      setCurrentPropertyId(propId);
      navigate(`/sponsor/properties/new?id=${propId}`, { replace: true });
    }

    setUploadingImages(true);
    const url = await uploadFile(files[0], propId, 'featured');
    if (url) {
      updateField('featuredImage', url);
    }
    setUploadingImages(false);
  };

  const handleGalleryUpload = async (files: FileList) => {
    let propId = currentPropertyId;
    if (!propId) {
      propId = await saveDraft(null, { ...formData, title: formData.title || 'New Property' });
      if (!propId) return;
      setCurrentPropertyId(propId);
      navigate(`/sponsor/properties/new?id=${propId}`, { replace: true });
    }

    setUploadingImages(true);
    const newImages = [...formData.gallery];

    for (const file of Array.from(files)) {
      if (newImages.length >= 20) {
        toast.error('Maximum 20 gallery images allowed');
        break;
      }
      const url = await uploadFile(file, propId, 'gallery');
      if (url) newImages.push(url);
    }

    updateField('gallery', newImages);
    setUploadingImages(false);
  };

  const handleDocUpload = async (file: File, docType: string, docLabel: string, required: boolean) => {
    let propId = currentPropertyId;
    if (!propId) {
      propId = await saveDraft(null, { ...formData, title: formData.title || 'New Property' });
      if (!propId) return;
      setCurrentPropertyId(propId);
      navigate(`/sponsor/properties/new?id=${propId}`, { replace: true });
    }

    setUploadingDocs(docType);
    const url = await uploadFile(file, propId, `documents/${docType}`);
    if (url) {
      const existingDocs = formData.documents.filter(d => d.type !== docType);
      updateField('documents', [...existingDocs, { type: docType, name: docLabel, url, required }]);
    }
    setUploadingDocs(null);
  };

  const removeGalleryImage = (index: number) => {
    const newImages = formData.gallery.filter((_, i) => i !== index);
    updateField('gallery', newImages);
  };

  const removeDocument = (docType: string) => {
    const newDocs = formData.documents.filter(d => d.type !== docType);
    updateField('documents', newDocs);
  };

  // Share type management
  const addShareType = () => {
    const newShareType: ShareType = {
      shareTypeName: '',
      shareTypeCategory: 'Equity',
      votingRights: true,
      dividendPriority: 1,
      liquidationPriority: 1,
      interestRate: null,
      lienPosition: null,
    };
    updateField('shareTypes', [...formData.shareTypes, newShareType]);
  };

  const updateShareType = (index: number, field: keyof ShareType, value: any) => {
    const updated = [...formData.shareTypes];
    updated[index] = { ...updated[index], [field]: value };
    updateField('shareTypes', updated);
  };

  const removeShareType = (index: number) => {
    const updated = formData.shareTypes.filter((_, i) => i !== index);
    updateField('shareTypes', updated);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          toast.error('Property name is required');
          return false;
        }
        if (!formData.description.trim()) {
          toast.error('Description is required');
          return false;
        }
        if (!formData.propertyType) {
          toast.error('Property type is required');
          return false;
        }
        if (!formData.investmentType) {
          toast.error('Investment type is required');
          return false;
        }
        return true;
      case 2:
        if (!formData.address.trim()) {
          toast.error('Address is required');
          return false;
        }
        if (!formData.city.trim()) {
          toast.error('City is required');
          return false;
        }
        if (!formData.state) {
          toast.error('State is required');
          return false;
        }
        if (!formData.zip.trim()) {
          toast.error('ZIP code is required');
          return false;
        }
        return true;
      case 3:
        if (formData.targetRaise <= 0) {
          toast.error('Target raise must be greater than 0');
          return false;
        }
        if (formData.minimumInvestment <= 0) {
          toast.error('Minimum investment must be greater than 0');
          return false;
        }
        if (formData.pricePerShare <= 0) {
          toast.error('Price per share must be greater than 0');
          return false;
        }
        if (formData.totalShares <= 0) {
          toast.error('Total shares must be greater than 0');
          return false;
        }
        return true;
      case 4:
        return true; // Share types are optional
      case 5:
        return true; // Property details are optional
      case 6:
        if (!formData.featuredImage) {
          toast.error('Featured image is required');
          return false;
        }
        return true;
      case 7:
        const hasOM = formData.documents.some(d => d.type === 'offeringMemorandum');
        const hasSA = formData.documents.some(d => d.type === 'subscriptionAgreement');
        if (!hasOM) {
          toast.error('Offering Memorandum is required');
          return false;
        }
        if (!hasSA) {
          toast.error('Subscription Agreement is required');
          return false;
        }
        return true;
      case 8:
        if (!termsAccepted) {
          toast.error('Please accept the terms');
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
    setCurrentStep(prev => Math.min(prev + 1, 8));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!asDraft && !validateStep(8)) return;
    if (!currentPropertyId) {
      toast.error('Please save your property first');
      return;
    }

    if (asDraft) {
      await handleSaveDraft();
      toast.success('Saved as draft');
      navigate('/sponsor/deals');
    } else {
      const success = await publishProperty(currentPropertyId);
      if (success) {
        navigate('/sponsor/deals');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (sponsorLoading || loadingProperty) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const progress = (currentStep / 8) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/sponsor/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <img src={logo} alt="B-LINE-IT" className="h-8 hidden sm:block" />
            <span className="text-lg font-semibold text-foreground">Add New Property</span>
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
          <div className="flex justify-between overflow-x-auto pb-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-1 cursor-pointer transition-opacity min-w-[60px] ${
                  step.id <= currentStep ? 'opacity-100' : 'opacity-50'
                }`}
                onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                  step.id === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step.id < currentStep
                      ? 'bg-bull text-white'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {step.id < currentStep ? (
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-center">{step.title}</span>
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
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Property Name *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., Sunset Gardens Apartments"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Provide a detailed description of the property, investment opportunity, and highlights..."
                    className="min-h-[150px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description (for cards)</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => updateField('shortDescription', e.target.value)}
                    placeholder="Brief summary for listing cards"
                    maxLength={200}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Property Type *</Label>
                    <Select value={formData.propertyType} onValueChange={(v) => updateField('propertyType', v)}>
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

                  <div className="space-y-2">
                    <Label>Investment Type *</Label>
                    <Select value={formData.investmentType} onValueChange={(v) => updateField('investmentType', v)}>
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

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => updateField('status', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Location */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Los Angeles"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code *</Label>
                    <Input
                      id="zip"
                      value={formData.zip}
                      onChange={(e) => updateField('zip', e.target.value)}
                      placeholder="90001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="USA"
                    />
                  </div>
                </div>

                <Separator />
                <p className="text-sm text-muted-foreground">Optional: Add coordinates for map display</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      onChange={(e) => updateField('latitude', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="34.0522"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      onChange={(e) => updateField('longitude', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="-118.2437"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Financial Terms */}
            {currentStep === 3 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="targetRaise">Target Raise *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="targetRaise"
                        type="number"
                        className="pl-7"
                        value={formData.targetRaise || ''}
                        onChange={(e) => updateField('targetRaise', parseFloat(e.target.value) || 0)}
                        placeholder="5,000,000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimumInvestment">Minimum Investment *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="minimumInvestment"
                        type="number"
                        className="pl-7"
                        value={formData.minimumInvestment || ''}
                        onChange={(e) => updateField('minimumInvestment', parseFloat(e.target.value) || 0)}
                        placeholder="10,000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maximumInvestment">Maximum Investment (optional)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="maximumInvestment"
                        type="number"
                        className="pl-7"
                        value={formData.maximumInvestment || ''}
                        onChange={(e) => updateField('maximumInvestment', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="500,000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricePerShare">Price Per Share *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="pricePerShare"
                        type="number"
                        className="pl-7"
                        value={formData.pricePerShare || ''}
                        onChange={(e) => updateField('pricePerShare', parseFloat(e.target.value) || 0)}
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalShares">Total Shares *</Label>
                    <Input
                      id="totalShares"
                      type="number"
                      value={formData.totalShares || ''}
                      onChange={(e) => updateField('totalShares', parseInt(e.target.value) || 0)}
                      placeholder="50,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectedReturn">Projected Return (APY/IRR %)</Label>
                    <div className="relative">
                      <Input
                        id="projectedReturn"
                        type="number"
                        step="0.1"
                        value={formData.projectedReturn || ''}
                        onChange={(e) => updateField('projectedReturn', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="holdPeriod">Hold Period (months)</Label>
                    <Input
                      id="holdPeriod"
                      type="number"
                      value={formData.holdPeriod || ''}
                      onChange={(e) => updateField('holdPeriod', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="60"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Distribution Frequency</Label>
                    <Select value={formData.distributionFrequency} onValueChange={(v) => updateField('distributionFrequency', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DISTRIBUTION_FREQUENCIES.map(freq => (
                          <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.targetRaise > 0 && formData.pricePerShare > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Calculated: {formatCurrency(formData.targetRaise)} ÷ {formatCurrency(formData.pricePerShare)}/share = <strong>{Math.floor(formData.targetRaise / formData.pricePerShare).toLocaleString()} shares needed</strong>
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Step 4: Token Configuration */}
            {currentStep === 4 && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Share Types</h3>
                    <p className="text-sm text-muted-foreground">Configure different share classes for your offering</p>
                  </div>
                  <Button onClick={addShareType} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Share Type
                  </Button>
                </div>

                {formData.shareTypes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                    <Coins className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No share types configured yet</p>
                    <p className="text-sm">Click "Add Share Type" to create your first share class</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.shareTypes.map((share, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Share Type #{index + 1}</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => removeShareType(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Share Type Name</Label>
                              <Input
                                value={share.shareTypeName}
                                onChange={(e) => updateShareType(index, 'shareTypeName', e.target.value)}
                                placeholder="e.g., Class A Equity"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Category</Label>
                              <Select
                                value={share.shareTypeCategory}
                                onValueChange={(v) => updateShareType(index, 'shareTypeCategory', v)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Equity">Equity</SelectItem>
                                  <SelectItem value="Debt">Debt</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={share.votingRights}
                                onCheckedChange={(v) => updateShareType(index, 'votingRights', v)}
                              />
                              <Label className="font-normal">Voting Rights</Label>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Dividend Priority</Label>
                              <Input
                                type="number"
                                min="1"
                                value={share.dividendPriority}
                                onChange={(e) => updateShareType(index, 'dividendPriority', parseInt(e.target.value) || 1)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Liquidation Priority</Label>
                              <Input
                                type="number"
                                min="1"
                                value={share.liquidationPriority}
                                onChange={(e) => updateShareType(index, 'liquidationPriority', parseInt(e.target.value) || 1)}
                              />
                            </div>
                            {share.shareTypeCategory === 'Debt' && (
                              <>
                                <div className="space-y-2">
                                  <Label>Interest Rate (%)</Label>
                                  <Input
                                    type="number"
                                    step="0.1"
                                    value={share.interestRate || ''}
                                    onChange={(e) => updateShareType(index, 'interestRate', e.target.value ? parseFloat(e.target.value) : null)}
                                    placeholder="8.0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Lien Position</Label>
                                  <Select
                                    value={share.lienPosition || ''}
                                    onValueChange={(v) => updateShareType(index, 'lienPosition', v as any)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {LIEN_POSITIONS.map(pos => (
                                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Step 5: Property Details */}
            {currentStep === 5 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="propertyValue">Property Value</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="propertyValue"
                        type="number"
                        className="pl-7"
                        value={formData.propertyValue || ''}
                        onChange={(e) => updateField('propertyValue', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="10,000,000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="squareFootage">Square Footage</Label>
                    <Input
                      id="squareFootage"
                      type="number"
                      value={formData.squareFootage || ''}
                      onChange={(e) => updateField('squareFootage', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="50,000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="units">Number of Units</Label>
                    <Input
                      id="units"
                      type="number"
                      value={formData.units || ''}
                      onChange={(e) => updateField('units', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearBuilt">Year Built</Label>
                    <Input
                      id="yearBuilt"
                      type="number"
                      value={formData.yearBuilt || ''}
                      onChange={(e) => updateField('yearBuilt', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="2015"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="occupancyRate">Occupancy Rate (%)</Label>
                    <Input
                      id="occupancyRate"
                      type="number"
                      step="0.1"
                      value={formData.occupancyRate || ''}
                      onChange={(e) => updateField('occupancyRate', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="95"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capRate">Cap Rate (%)</Label>
                    <Input
                      id="capRate"
                      type="number"
                      step="0.01"
                      value={formData.capRate || ''}
                      onChange={(e) => updateField('capRate', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="6.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="noi">Net Operating Income (NOI)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="noi"
                        type="number"
                        className="pl-7"
                        value={formData.noi || ''}
                        onChange={(e) => updateField('noi', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="650,000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ltv">Loan-to-Value (LTV %)</Label>
                    <Input
                      id="ltv"
                      type="number"
                      step="0.1"
                      value={formData.ltv || ''}
                      onChange={(e) => updateField('ltv', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="65"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dscr">DSCR</Label>
                    <Input
                      id="dscr"
                      type="number"
                      step="0.01"
                      value={formData.dscr || ''}
                      onChange={(e) => updateField('dscr', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="1.25"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 6: Media */}
            {currentStep === 6 && (
              <>
                {/* Featured Image */}
                <div className="space-y-3">
                  <Label>Featured Image *</Label>
                  {formData.featuredImage ? (
                    <div className="relative w-full max-w-md">
                      <img
                        src={formData.featuredImage}
                        alt="Featured"
                        className="w-full aspect-video object-cover rounded-lg border"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => updateField('featuredImage', null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full max-w-md aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && handleFeaturedImageUpload(e.target.files)}
                      />
                      {uploadingImages ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload featured image</span>
                        </>
                      )}
                    </label>
                  )}
                </div>

                <Separator />

                {/* Gallery */}
                <div className="space-y-3">
                  <Label>Gallery Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.gallery.map((img, index) => (
                      <div key={index} className="relative aspect-video">
                        <img
                          src={img}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6"
                          onClick={() => removeGalleryImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => e.target.files && handleGalleryUpload(e.target.files)}
                      />
                      {uploadingImages ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Plus className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">Add more</span>
                        </>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">{formData.gallery.length}/20 images</p>
                </div>

                <Separator />

                {/* Video & Virtual Tour */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="video">Video URL</Label>
                    <Input
                      id="video"
                      value={formData.video}
                      onChange={(e) => updateField('video', e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="virtualTour">Virtual Tour URL</Label>
                    <Input
                      id="virtualTour"
                      value={formData.virtualTour}
                      onChange={(e) => updateField('virtualTour', e.target.value)}
                      placeholder="https://matterport.com/..."
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 7: Documents */}
            {currentStep === 7 && (
              <>
                <div className="space-y-4">
                  {DOCUMENT_TYPES.map((docType) => {
                    const existingDoc = formData.documents.find(d => d.type === docType.key);
                    return (
                      <div key={docType.key} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {docType.label}
                              {docType.required && <span className="text-destructive ml-1">*</span>}
                            </p>
                            {existingDoc && (
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {existingDoc.url.split('/').pop()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {existingDoc ? (
                            <>
                              <Badge variant="secondary" className="bg-bull/20 text-bull">Uploaded</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocument(docType.key)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          ) : (
                            <label>
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleDocUpload(e.target.files[0], docType.key, docType.label, docType.required);
                                  }
                                }}
                              />
                              <Button variant="outline" size="sm" asChild disabled={uploadingDocs === docType.key}>
                                <span>
                                  {uploadingDocs === docType.key ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload
                                    </>
                                  )}
                                </span>
                              </Button>
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Step 8: Review & Submit */}
            {currentStep === 8 && (
              <>
                <div className="space-y-6">
                  {/* Basic Info Summary */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Basic Information</h4>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-muted-foreground">Title:</span> {formData.title}</div>
                      <div><span className="text-muted-foreground">Type:</span> {formData.propertyType}</div>
                      <div><span className="text-muted-foreground">Investment:</span> {formData.investmentType}</div>
                      <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline">{formData.status}</Badge></div>
                    </div>
                  </div>

                  {/* Location Summary */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Location</h4>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                    <p className="text-sm">
                      {formData.address}, {formData.city}, {formData.state} {formData.zip}
                    </p>
                  </div>

                  {/* Financial Summary */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Financial Terms</h4>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Target Raise</p>
                        <p className="font-semibold text-accent">{formatCurrency(formData.targetRaise)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Min Investment</p>
                        <p className="font-semibold">{formatCurrency(formData.minimumInvestment)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Price/Share</p>
                        <p className="font-semibold">{formatCurrency(formData.pricePerShare)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Projected Return</p>
                        <p className="font-semibold text-bull">{formData.projectedReturn ? `${formData.projectedReturn}%` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Share Types Summary */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Token Configuration</h4>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(4)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                    {formData.shareTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {formData.shareTypes.map((share, i) => (
                          <Badge key={i} variant="secondary">
                            {share.shareTypeName || `Share Type ${i + 1}`} ({share.shareTypeCategory})
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No share types configured</p>
                    )}
                  </div>

                  {/* Media Summary */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Media</h4>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(6)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      {formData.featuredImage && (
                        <img src={formData.featuredImage} alt="Featured" className="w-20 h-14 object-cover rounded" />
                      )}
                      <div className="text-sm">
                        <p>{formData.gallery.length} gallery images</p>
                        {formData.video && <p>Video: ✓</p>}
                        {formData.virtualTour && <p>Virtual Tour: ✓</p>}
                      </div>
                    </div>
                  </div>

                  {/* Documents Summary */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Documents</h4>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep(7)}>
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.documents.map((doc, i) => (
                        <Badge key={i} variant="secondary" className="bg-bull/20 text-bull">
                          <FileText className="h-3 w-3 mr-1" />
                          {doc.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Terms */}
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                    />
                    <label htmlFor="terms" className="text-sm">
                      I confirm that all information provided is accurate and I agree to the{' '}
                      <a href="#" className="text-primary underline">Terms of Service</a> and{' '}
                      <a href="#" className="text-primary underline">Platform Guidelines</a>.
                    </label>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            {currentStep === 8 && (
              <>
                <Button variant="outline" onClick={() => handleSubmit(true)} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button onClick={() => handleSubmit(false)} disabled={saving || !termsAccepted}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Publish
                </Button>
              </>
            )}
            {currentStep < 8 && (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
