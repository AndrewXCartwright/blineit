import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, User, CreditCard, Camera, CheckCircle, Upload, AlertCircle } from "lucide-react";
import { useKYC, KYCData } from "@/hooks/useKYC";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KYCStatusBadge } from "@/components/KYCStatusBadge";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Upload ID", icon: CreditCard },
  { id: 3, title: "Selfie", icon: Camera },
  { id: 4, title: "Review", icon: CheckCircle },
];

export default function KYCVerification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { kycData, kycStatus, uploadDocument, savePersonalInfo, saveDocuments, saveSelfie, submitForReview } = useKYC();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    full_legal_name: kycData?.full_legal_name || "",
    date_of_birth: kycData?.date_of_birth || "",
    address_line1: kycData?.address_line1 || "",
    address_line2: kycData?.address_line2 || "",
    city: kycData?.city || "",
    state: kycData?.state || "",
    postal_code: kycData?.postal_code || "",
    country: kycData?.country || "US",
    phone_number: kycData?.phone_number || "",
    ssn_last4: kycData?.ssn_last4 || "",
  });

  // Document state
  const [idType, setIdType] = useState(kycData?.id_type || "drivers_license");
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(kycData?.id_front_url || null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(kycData?.id_back_url || null);

  // Selfie state
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(kycData?.selfie_url || null);
  
  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  if (!user) {
    navigate("/auth");
    return null;
  }

  // If already in review or verified, show status
  if (kycStatus === "in_review" || kycStatus === "verified") {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary/50 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-xl font-bold text-foreground">KYC Verification</h1>
          </div>
        </header>

        <main className="px-4 py-8">
          <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              kycStatus === "verified" ? "bg-success/20" : "bg-primary/20"
            }`}>
              {kycStatus === "verified" ? (
                <CheckCircle className="w-10 h-10 text-success" />
              ) : (
                <AlertCircle className="w-10 h-10 text-primary" />
              )}
            </div>
            <KYCStatusBadge status={kycStatus} size="lg" />
            <h2 className="font-display text-2xl font-bold mt-4 mb-2">
              {kycStatus === "verified" ? "You're Verified!" : "Verification In Progress"}
            </h2>
            <p className="text-muted-foreground">
              {kycStatus === "verified" 
                ? "Your identity has been verified. You now have full access to all features."
                : "We're reviewing your documents. This usually takes 1-2 business days."}
            </p>
            <Button onClick={() => navigate("/profile")} className="mt-6">
              Back to Profile
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePersonalInfoSubmit = async () => {
    // Validate required fields
    const required = ["full_legal_name", "date_of_birth", "address_line1", "city", "state", "postal_code", "phone_number", "ssn_last4", "country"];
    const missing = required.filter(field => !personalInfo[field as keyof typeof personalInfo]);
    
    if (missing.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const result = await savePersonalInfo(personalInfo);
    setLoading(false);
    
    if (result.success) {
      setCurrentStep(2);
    }
  };

  const handleDocumentsSubmit = async () => {
    if (!idFront && !idFrontPreview) {
      toast.error("Please upload the front of your ID");
      return;
    }
    if (!idBack && !idBackPreview) {
      toast.error("Please upload the back of your ID");
      return;
    }

    setLoading(true);
    
    let frontUrl = idFrontPreview;
    let backUrl = idBackPreview;

    if (idFront) {
      frontUrl = await uploadDocument(idFront, "id_front");
    }
    if (idBack) {
      backUrl = await uploadDocument(idBack, "id_back");
    }

    if (frontUrl && backUrl) {
      const success = await saveDocuments(frontUrl, backUrl, idType);
      if (success) {
        setIdFrontPreview(frontUrl);
        setIdBackPreview(backUrl);
        setCurrentStep(3);
      }
    }
    
    setLoading(false);
  };

  const handleSelfieSubmit = async () => {
    if (!selfie && !selfiePreview) {
      toast.error("Please upload a selfie");
      return;
    }

    setLoading(true);
    
    let url = selfiePreview;
    if (selfie) {
      url = await uploadDocument(selfie, "selfie");
    }

    if (url) {
      const success = await saveSelfie(url);
      if (success) {
        setSelfiePreview(url);
        setCurrentStep(4);
      }
    }
    
    setLoading(false);
  };

  const handleSubmitForReview = async () => {
    setLoading(true);
    const success = await submitForReview();
    setLoading(false);
    
    if (success) {
      navigate("/profile");
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary/50 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-bold text-foreground">KYC Verification</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-success text-success-foreground"
                        : isActive
                        ? "gradient-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs mt-1 ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-8 mx-2 ${isCompleted ? "bg-success" : "bg-secondary"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="glass-card rounded-2xl p-6 space-y-4 animate-fade-in">
            <h2 className="font-display text-lg font-bold">Personal Information</h2>
            <p className="text-sm text-muted-foreground">Please enter your legal information exactly as it appears on your ID.</p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_legal_name">Full Legal Name *</Label>
                <Input
                  id="full_legal_name"
                  value={personalInfo.full_legal_name}
                  onChange={(e) => setPersonalInfo(p => ({ ...p, full_legal_name: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={personalInfo.date_of_birth}
                  onChange={(e) => setPersonalInfo(p => ({ ...p, date_of_birth: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number *</Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={personalInfo.phone_number}
                  onChange={(e) => setPersonalInfo(p => ({ ...p, phone_number: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="address_line1">Address Line 1 *</Label>
                <Input
                  id="address_line1"
                  value={personalInfo.address_line1}
                  onChange={(e) => setPersonalInfo(p => ({ ...p, address_line1: e.target.value }))}
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <Label htmlFor="address_line2">Address Line 2</Label>
                <Input
                  id="address_line2"
                  value={personalInfo.address_line2}
                  onChange={(e) => setPersonalInfo(p => ({ ...p, address_line2: e.target.value }))}
                  placeholder="Apt 4B"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={personalInfo.city}
                    onChange={(e) => setPersonalInfo(p => ({ ...p, city: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={personalInfo.state}
                    onChange={(e) => setPersonalInfo(p => ({ ...p, state: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    value={personalInfo.postal_code}
                    onChange={(e) => setPersonalInfo(p => ({ ...p, postal_code: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="ssn_last4">SSN Last 4</Label>
                  <Input
                    id="ssn_last4"
                    maxLength={4}
                    value={personalInfo.ssn_last4}
                    onChange={(e) => setPersonalInfo(p => ({ ...p, ssn_last4: e.target.value.replace(/\D/g, "") }))}
                    placeholder="1234"
                  />
                </div>
              </div>
            </div>

            <Button onClick={handlePersonalInfoSubmit} className="w-full gap-2" disabled={loading}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Upload ID */}
        {currentStep === 2 && (
          <div className="glass-card rounded-2xl p-6 space-y-4 animate-fade-in">
            <h2 className="font-display text-lg font-bold">Upload ID Document</h2>
            <p className="text-sm text-muted-foreground">Upload clear photos of the front and back of your government-issued ID.</p>

            <div>
              <Label>ID Type</Label>
              <Select value={idType} onValueChange={setIdType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="state_id">State ID</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Front of ID</Label>
                <input
                  ref={idFrontRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setIdFront, setIdFrontPreview)}
                />
                <button
                  onClick={() => idFrontRef.current?.click()}
                  className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden"
                >
                  {idFrontPreview ? (
                    <img src={idFrontPreview} alt="ID Front" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload Front</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <Label>Back of ID</Label>
                <input
                  ref={idBackRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setIdBack, setIdBackPreview)}
                />
                <button
                  onClick={() => idBackRef.current?.click()}
                  className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden"
                >
                  {idBackPreview ? (
                    <img src={idBackPreview} alt="ID Back" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload Back</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleDocumentsSubmit} className="flex-1 gap-2" disabled={loading}>
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Selfie */}
        {currentStep === 3 && (
          <div className="glass-card rounded-2xl p-6 space-y-4 animate-fade-in">
            <h2 className="font-display text-lg font-bold">Take a Selfie</h2>
            <p className="text-sm text-muted-foreground">Upload a clear photo of your face. Make sure your face is well-lit and fully visible.</p>

            <input
              ref={selfieRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => handleFileChange(e, setSelfie, setSelfiePreview)}
            />
            <button
              onClick={() => selfieRef.current?.click()}
              className="w-full max-w-xs mx-auto aspect-square rounded-full border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 overflow-hidden"
            >
              {selfiePreview ? (
                <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-10 h-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Take Selfie</span>
                </>
              )}
            </button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleSelfieSubmit} className="flex-1 gap-2" disabled={loading}>
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="glass-card rounded-2xl p-6 space-y-4 animate-fade-in">
            <h2 className="font-display text-lg font-bold">Review & Submit</h2>
            <p className="text-sm text-muted-foreground">Please review your information before submitting.</p>

            <div className="space-y-4">
              <div className="bg-secondary/30 rounded-xl p-4">
                <h3 className="text-sm font-medium mb-2">Personal Information</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><span className="text-foreground">Name:</span> {personalInfo.full_legal_name}</p>
                  <p><span className="text-foreground">DOB:</span> {personalInfo.date_of_birth}</p>
                  <p><span className="text-foreground">Phone:</span> {personalInfo.phone_number}</p>
                  <p><span className="text-foreground">Address:</span> {personalInfo.address_line1}, {personalInfo.city}, {personalInfo.state} {personalInfo.postal_code}</p>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-4">
                <h3 className="text-sm font-medium mb-2">Documents</h3>
                <div className="grid grid-cols-3 gap-2">
                  {idFrontPreview && (
                    <img src={idFrontPreview} alt="ID Front" className="rounded-lg aspect-[4/3] object-cover" />
                  )}
                  {idBackPreview && (
                    <img src={idBackPreview} alt="ID Back" className="rounded-lg aspect-[4/3] object-cover" />
                  )}
                  {selfiePreview && (
                    <img src={selfiePreview} alt="Selfie" className="rounded-lg aspect-square object-cover" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setCurrentStep(3)} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button onClick={handleSubmitForReview} className="flex-1 gap-2" disabled={loading}>
                Submit for Review <CheckCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
