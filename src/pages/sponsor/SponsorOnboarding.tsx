import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsor } from "@/hooks/useSponsor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Building2, FileText, Users, DollarSign, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to the Sponsor Portal",
    description: "Set up your sponsor account to start listing deals and raising capital.",
    icon: Building2,
  },
  {
    id: "documents",
    title: "Upload Required Documents",
    description: "We'll need some documentation to verify your entity.",
    icon: FileText,
  },
  {
    id: "team",
    title: "Add Team Members",
    description: "Invite your team to collaborate on deals.",
    icon: Users,
  },
  {
    id: "banking",
    title: "Set Up Banking",
    description: "Connect your bank account for fund transfers.",
    icon: DollarSign,
  },
];

export default function SponsorOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sponsorProfile } = useSponsor();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const handleCompleteStep = () => {
    const stepId = ONBOARDING_STEPS[currentStep].id;
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.success("Onboarding complete! Welcome to the Sponsor Portal.");
      navigate("/sponsor/dashboard");
    }
  };

  const handleSkip = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/sponsor/dashboard");
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <span className="text-sm text-muted-foreground">Sponsor Onboarding</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="max-w-2xl mx-auto p-4 py-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {ONBOARDING_STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index < currentStep || completedSteps.includes(step.id)
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                }
              `}>
                {completedSteps.includes(step.id) ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < ONBOARDING_STEPS.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  index < currentStep ? "bg-primary" : "bg-muted"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Content */}
        <Card className="border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <StepIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription className="text-base">
              {currentStepData.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  Welcome, {sponsorProfile?.company_name || "Sponsor"}! Let's get your account set up so you can start listing deals.
                </p>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>List unlimited deals</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Access to qualified investors</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>Automated compliance tools</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Upload the following documents to complete verification:
                </p>
                <div className="space-y-2">
                  {["Formation Documents", "Operating Agreement", "Track Record Verification"].map((doc) => (
                    <div key={doc} className="flex items-center gap-3 p-3 rounded-lg border border-dashed">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{doc}</span>
                      <Button variant="outline" size="sm" className="ml-auto">
                        Upload
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm text-center">
                  You can invite team members later from Settings.
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm text-center">
                  You can set up banking later from Settings.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={handleSkip} className="flex-1">
                Skip for now
              </Button>
              <Button onClick={handleCompleteStep} className="flex-1">
                {currentStep === ONBOARDING_STEPS.length - 1 ? "Complete Setup" : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
