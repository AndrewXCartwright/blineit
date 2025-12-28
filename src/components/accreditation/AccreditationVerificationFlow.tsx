import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronLeft, ChevronRight, User, Building2, FileText, 
  CheckCircle2, Upload, Shield, Lock, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAccreditation, AccreditationFormData, InvestorType, AccreditationType, VerificationMethod } from "@/hooks/useAccreditation";
import { format } from "date-fns";

interface Props {
  onClose: () => void;
  existingData?: any;
}

const steps = [
  { id: 1, title: "Investor Type", icon: User },
  { id: 2, title: "Qualification", icon: Building2 },
  { id: 3, title: "Documents", icon: FileText },
  { id: 4, title: "Certification", icon: CheckCircle2 },
];

const investorTypes = [
  { value: "individual", label: "Individual", description: "Investing as a personal investor" },
  { value: "entity", label: "Entity (LLC/Corp/Partnership)", description: "Investing through a business entity" },
  { value: "trust", label: "Trust", description: "Investing through a trust" },
  { value: "ira", label: "Self-Directed IRA/401(k)", description: "Investing through retirement accounts" },
];

const qualificationMethods = [
  { 
    value: "income", 
    label: "Income Test", 
    description: "$200K+ individual or $300K+ joint income for past 2 years",
    documents: "Tax returns, W-2s, or CPA letter"
  },
  { 
    value: "net_worth", 
    label: "Net Worth Test", 
    description: "$1M+ net worth excluding primary residence",
    documents: "Bank statements, brokerage statements, or CPA letter"
  },
  { 
    value: "professional", 
    label: "Professional Certification", 
    description: "Series 7, 65, or 82 license holders",
    documents: "FINRA BrokerCheck verification"
  },
  { 
    value: "entity", 
    label: "Entity Qualification", 
    description: "Entity with $5M+ in assets",
    documents: "Financial statements, formation documents"
  },
];

const verificationMethods = [
  { 
    value: "documents", 
    label: "Upload Documents", 
    description: "Free • 1-3 business days review",
    cost: "Free"
  },
  { 
    value: "third_party", 
    label: "Third-Party Verification (Verify Investor)", 
    description: "Instant verification through partner service",
    cost: "$50"
  },
  { 
    value: "self_certified", 
    label: "CPA/Attorney Letter", 
    description: "Submit a letter from your professional",
    cost: "Free"
  },
];

export function AccreditationVerificationFlow({ onClose, existingData }: Props) {
  const { submitAccreditation } = useAccreditation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<AccreditationFormData>>({
    investor_type: existingData?.investor_type,
    accreditation_type: existingData?.accreditation_type,
    verification_method: existingData?.verification_method,
  });
  const [certifications, setCertifications] = useState({
    truthful: false,
    consequences: false,
    annual: false,
    consent: false,
  });
  const [signature, setSignature] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.investor_type;
      case 2:
        return !!formData.accreditation_type;
      case 3:
        return !!formData.verification_method;
      case 4:
        return Object.values(certifications).every(Boolean) && signature.trim().length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    
    setIsSubmitting(true);
    try {
      await submitAccreditation.mutateAsync({
        investor_type: formData.investor_type as InvestorType,
        accreditation_type: formData.accreditation_type as AccreditationType,
        verification_method: formData.verification_method as VerificationMethod,
        documents: uploadedFiles.map(f => ({ name: f.name, size: f.size })),
      });
      
      setReferenceNumber(`ACC-${Date.now().toString(36).toUpperCase()}`);
      setIsComplete(true);
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-success/30">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Verification Submitted!</h2>
              <p className="text-muted-foreground">
                Your accreditation verification has been submitted successfully.
              </p>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Reference Number</p>
                <p className="font-mono font-semibold text-foreground">{referenceNumber}</p>
              </div>
              <div className="text-left space-y-2 bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground">What's Next?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Our team will review your submission within 1-3 business days</li>
                  <li>• You'll receive an email notification once the review is complete</li>
                  <li>• If approved, you'll gain access to exclusive offerings</li>
                </ul>
              </div>
              <Button onClick={onClose} className="w-full">
                Done
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Accredited Investor Verification
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      currentStep >= step.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs mt-1 ${
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-12 mx-2 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Investor Type */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground">Select Investor Type</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose how you'll be making investments on our platform.
                  </p>
                  
                  <RadioGroup 
                    value={formData.investor_type} 
                    onValueChange={(value) => setFormData({ ...formData, investor_type: value as InvestorType })}
                    className="space-y-3"
                  >
                    {investorTypes.map((type) => (
                      <Label 
                        key={type.value}
                        className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData.investor_type === type.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={type.value} className="mt-1" />
                        <div>
                          <p className="font-medium text-foreground">{type.label}</p>
                          <p className="text-sm text-muted-foreground">{type.description}</p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </motion.div>
              )}

              {/* Step 2: Qualification Method */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground">Qualification Method</h3>
                  <p className="text-sm text-muted-foreground">
                    Select the criteria by which you qualify as an accredited investor.
                  </p>
                  
                  <RadioGroup 
                    value={formData.accreditation_type} 
                    onValueChange={(value) => setFormData({ ...formData, accreditation_type: value as AccreditationType })}
                    className="space-y-3"
                  >
                    {qualificationMethods.map((method) => (
                      <Label 
                        key={method.value}
                        className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData.accreditation_type === method.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={method.value} className="mt-1" />
                        <div>
                          <p className="font-medium text-foreground">{method.label}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="font-medium">Documents:</span> {method.documents}
                          </p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>
                </motion.div>
              )}

              {/* Step 3: Document Upload */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground">Verification Method</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose how you'd like to verify your accredited investor status.
                  </p>
                  
                  <RadioGroup 
                    value={formData.verification_method} 
                    onValueChange={(value) => setFormData({ ...formData, verification_method: value as VerificationMethod })}
                    className="space-y-3"
                  >
                    {verificationMethods.map((method) => (
                      <Label 
                        key={method.value}
                        className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                          formData.verification_method === method.value 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={method.value} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-foreground">{method.label}</p>
                            <span className="text-sm font-medium text-primary">{method.cost}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>

                  {formData.verification_method === "documents" && (
                    <div className="mt-6 space-y-4">
                      <Label>Upload Supporting Documents</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop files here, or click to browse
                        </p>
                        <Input 
                          type="file" 
                          multiple 
                          onChange={handleFileChange}
                          className="max-w-xs mx-auto"
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </div>
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm bg-muted/50 rounded p-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="flex-1 truncate">{file.name}</span>
                              <span className="text-muted-foreground">
                                {(file.size / 1024).toFixed(0)} KB
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <Lock className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          Your documents are encrypted and stored securely. They will only be used for verification purposes.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 4: Certification */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-foreground">Review & Certify</h3>
                  
                  {/* Summary */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-foreground">Your Selections</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Investor Type</p>
                        <p className="font-medium capitalize">{formData.investor_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Qualification</p>
                        <p className="font-medium capitalize">{formData.accreditation_type?.replace("_", " ")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Verification</p>
                        <p className="font-medium capitalize">{formData.verification_method?.replace("_", " ")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Documents</p>
                        <p className="font-medium">{uploadedFiles.length} file(s)</p>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-3">
                    <Label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox 
                        checked={certifications.truthful}
                        onCheckedChange={(checked) => 
                          setCertifications({ ...certifications, truthful: checked as boolean })
                        }
                        className="mt-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        I certify that all information provided is true and accurate to the best of my knowledge.
                      </span>
                    </Label>
                    
                    <Label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox 
                        checked={certifications.consequences}
                        onCheckedChange={(checked) => 
                          setCertifications({ ...certifications, consequences: checked as boolean })
                        }
                        className="mt-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        I understand that providing false information may result in account suspension and legal consequences.
                      </span>
                    </Label>
                    
                    <Label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox 
                        checked={certifications.annual}
                        onCheckedChange={(checked) => 
                          setCertifications({ ...certifications, annual: checked as boolean })
                        }
                        className="mt-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        I understand that I must re-verify my accredited investor status annually.
                      </span>
                    </Label>
                    
                    <Label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox 
                        checked={certifications.consent}
                        onCheckedChange={(checked) => 
                          setCertifications({ ...certifications, consent: checked as boolean })
                        }
                        className="mt-1"
                      />
                      <span className="text-sm text-muted-foreground">
                        I consent to the verification of my information and documents.
                      </span>
                    </Label>
                  </div>

                  {/* Electronic Signature */}
                  <div className="space-y-2">
                    <Label htmlFor="signature">Electronic Signature</Label>
                    <Input 
                      id="signature"
                      placeholder="Type your full legal name"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Date: {format(new Date(), "MMMM d, yyyy")}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={currentStep === 1}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
              
              {currentStep < 4 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={!canProceed() || isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? "Submitting..." : "Submit for Verification"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
