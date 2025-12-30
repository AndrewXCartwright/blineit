import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSponsor, SponsorRegistrationData } from "@/hooks/useSponsor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Building2, ArrowLeft, ArrowRight, Check, Eye, EyeOff, Upload } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const STEPS = [
  { id: 1, title: "Account", description: "Basic account info" },
  { id: 2, title: "Company", description: "Company details" },
  { id: 3, title: "Track Record", description: "Investment history" },
  { id: 4, title: "Documents", description: "Verification docs" },
];

export default function SponsorRegister() {
  const navigate = useNavigate();
  const { registerSponsor } = useSponsor();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<SponsorRegistrationData>({
    email: "",
    password: "",
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    business_address: "",
    ein_tax_id: "",
    years_in_business: undefined,
    total_assets_managed: undefined,
    deals_completed: undefined,
    average_irr: undefined,
    bio: "",
    website_url: "",
    linkedin_url: "",
  });

  const updateField = (field: keyof SponsorRegistrationData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.email || !formData.password || !formData.company_name) {
          toast.error("Please fill in all required fields");
          return false;
        }
        if (formData.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          return false;
        }
        return true;
      case 2:
        if (!formData.contact_name || !formData.contact_email) {
          toast.error("Please fill in contact name and email");
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    const { error } = await registerSponsor(formData);

    if (error) {
      toast.error(error.message || "Registration failed");
      setIsLoading(false);
      return;
    }

    toast.success("Application submitted! We'll review it within 48 hours.");
    navigate("/sponsor/pending");
    setIsLoading(false);
  };

  const progress = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <header className="flex items-center justify-between p-4">
        <Link to="/sponsor/login" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">Back to Login</span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Building2 className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Become a Sponsor</CardTitle>
              <CardDescription className="mt-1">
                List deals and raise capital from our investor network
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                {STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center ${
                      step.id <= currentStep ? "text-primary" : ""
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                        step.id < currentStep
                          ? "bg-primary text-primary-foreground"
                          : step.id === currentStep
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {step.id < currentStep ? <Check className="h-3 w-3" /> : step.id}
                    </div>
                    <span className="hidden sm:block">{step.title}</span>
                  </div>
                ))}
              </div>
              <Progress value={progress} className="h-1" />
            </div>

            {/* Step 1: Account Basics */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    placeholder="Your Company LLC"
                    value={formData.company_name}
                    onChange={(e) => updateField("company_name", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Company Details */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Contact Name *</Label>
                    <Input
                      id="contact_name"
                      placeholder="John Doe"
                      value={formData.contact_name}
                      onChange={(e) => updateField("contact_name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email *</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.contact_email}
                      onChange={(e) => updateField("contact_email", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.contact_phone}
                    onChange={(e) => updateField("contact_phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business_address">Business Address</Label>
                  <Input
                    id="business_address"
                    placeholder="123 Main St, City, State 12345"
                    value={formData.business_address}
                    onChange={(e) => updateField("business_address", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ein_tax_id">EIN / Tax ID</Label>
                    <Input
                      id="ein_tax_id"
                      placeholder="XX-XXXXXXX"
                      value={formData.ein_tax_id}
                      onChange={(e) => updateField("ein_tax_id", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years_in_business">Years in Business</Label>
                    <Input
                      id="years_in_business"
                      type="number"
                      placeholder="5"
                      value={formData.years_in_business || ""}
                      onChange={(e) => updateField("years_in_business", parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Track Record */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_assets_managed">Total AUM ($)</Label>
                    <Input
                      id="total_assets_managed"
                      type="number"
                      placeholder="10000000"
                      value={formData.total_assets_managed || ""}
                      onChange={(e) => updateField("total_assets_managed", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deals_completed">Deals Completed</Label>
                    <Input
                      id="deals_completed"
                      type="number"
                      placeholder="25"
                      value={formData.deals_completed || ""}
                      onChange={(e) => updateField("deals_completed", parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="average_irr">Average IRR (%)</Label>
                  <Input
                    id="average_irr"
                    type="number"
                    step="0.1"
                    placeholder="18.5"
                    value={formData.average_irr || ""}
                    onChange={(e) => updateField("average_irr", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Company Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell investors about your company and investment philosophy..."
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website</Label>
                    <Input
                      id="website_url"
                      type="url"
                      placeholder="https://company.com"
                      value={formData.website_url}
                      onChange={(e) => updateField("website_url", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin_url">LinkedIn</Label>
                    <Input
                      id="linkedin_url"
                      type="url"
                      placeholder="https://linkedin.com/company/..."
                      value={formData.linkedin_url}
                      onChange={(e) => updateField("linkedin_url", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="text-center text-muted-foreground text-sm mb-4">
                  Upload supporting documents to verify your entity and track record
                </div>
                
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Entity Proof Documents</p>
                  <p className="text-xs text-muted-foreground">
                    Articles of Incorporation, Operating Agreement, etc.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Document upload will be available after registration
                  </p>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Track Record Documents</p>
                  <p className="text-xs text-muted-foreground">
                    Past deal summaries, investor letters, performance reports
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Document upload will be available after registration
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Our team will review your application within 48 hours</li>
                    <li>We may request additional documentation</li>
                    <li>Once approved, you can list deals and raise capital</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              {currentStep < 4 ? (
                <Button onClick={nextStep} className="flex-1">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/sponsor/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
