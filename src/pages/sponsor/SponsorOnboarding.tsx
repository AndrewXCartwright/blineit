import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSponsor } from "@/hooks/useSponsor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building2, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  User,
  Linkedin,
  Globe,
  Shield,
  IdCard,
  FileCheck,
  TrendingUp,
  Clock,
  PlayCircle,
  LayoutDashboard,
  PlusCircle,
  Users,
  MessageSquare,
  BarChart3,
  Sparkles,
  Rocket,
  ChevronRight,
  Check,
  X
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

const ONBOARDING_STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "profile", title: "Profile" },
  { id: "verify", title: "Verify" },
  { id: "banking", title: "Banking" },
  { id: "tour", title: "Tour" },
  { id: "first_deal", title: "First Deal" },
];

const TOUR_FEATURES = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Dashboard Overview",
    description: "See all your deals, investors, and key metrics at a glance. Track performance and manage your portfolio from one central hub.",
  },
  {
    id: "list_deal",
    icon: PlusCircle,
    title: "List a Deal",
    description: "Create compelling deal pages with our step-by-step wizard. Add property details, financial projections, and documents.",
  },
  {
    id: "investors",
    icon: Users,
    title: "Manage Investors",
    description: "View all investors across your deals. Track commitments, KYC status, and manage investor relations.",
  },
  {
    id: "messages",
    icon: MessageSquare,
    title: "Send Messages",
    description: "Communicate directly with investors. Send announcements, respond to questions, and build relationships.",
  },
  {
    id: "reports",
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Generate detailed reports on deal performance, investor demographics, and capital raised over time.",
  },
];

export default function SponsorOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sponsorProfile } = useSponsor();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  
  // Form states
  const [profileData, setProfileData] = useState({
    logo: null as File | null,
    bio: '',
    website: '',
    linkedin: '',
  });
  
  const [verificationData, setVerificationData] = useState({
    governmentId: null as File | null,
    businessProof: null as File | null,
    trackRecord: null as File | null,
  });

  const progressPercent = ((currentStep) / (ONBOARDING_STEPS.length - 1)) * 100;

  const handleNext = () => {
    const stepId = ONBOARDING_STEPS[currentStep].id;
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = () => {
    toast.success("Welcome to the Sponsor Portal! Let's list your first deal.");
    navigate("/sponsor/deals/new");
  };

  const handleExploreDashboard = () => {
    toast.success("Welcome to the Sponsor Portal!");
    navigate("/sponsor/dashboard");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onStart={handleNext} />;
      case 1:
        return <ProfileStep data={profileData} onChange={setProfileData} onNext={handleNext} onSkip={handleSkip} onBack={handleBack} />;
      case 2:
        return <VerifyStep data={verificationData} onChange={setVerificationData} onNext={handleNext} onSkip={handleSkip} onBack={handleBack} />;
      case 3:
        return <BankingStep onNext={handleNext} onSkip={handleSkip} onBack={handleBack} />;
      case 4:
        return <TourStep currentIndex={currentTourIndex} onIndexChange={setCurrentTourIndex} onNext={handleNext} onBack={handleBack} />;
      case 5:
        return <FirstDealStep onListDeal={handleComplete} onExploreDashboard={handleExploreDashboard} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="flex items-center justify-between p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-8 w-auto" />
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Sponsor Onboarding
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">
            {currentStep + 1} of {ONBOARDING_STEPS.length} steps
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-4 py-3 border-b border-border/50 bg-background/50">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                  ${index < currentStep || completedSteps.includes(step.id)
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                  }
                `}>
                  {completedSteps.includes(step.id) && index < currentStep ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div className={`w-8 sm:w-16 lg:w-24 h-0.5 mx-1 transition-colors ${
                    index < currentStep ? "bg-primary" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {ONBOARDING_STEPS.map((step, index) => (
              <span key={step.id} className={`hidden sm:block ${index === currentStep ? 'text-primary font-medium' : ''}`}>
                {step.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Step Components

function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <Card className="border-primary/20 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
      <CardHeader className="text-center pt-8">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl">Welcome to B-LINE-IT Sponsor Portal</CardTitle>
        <CardDescription className="text-base max-w-md mx-auto">
          You're about to unlock powerful tools to raise capital and connect with qualified investors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pb-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: PlusCircle, title: "List Deals", desc: "Create compelling deal pages" },
            { icon: Users, title: "Find Investors", desc: "Access qualified investors" },
            { icon: BarChart3, title: "Track Progress", desc: "Real-time analytics" },
          ].map((item) => (
            <div key={item.title} className="text-center p-4 rounded-lg bg-muted/50">
              <item.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <Button size="lg" onClick={onStart} className="gap-2 px-8">
            Let's Get You Set Up
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileStep({ 
  data, 
  onChange, 
  onNext, 
  onSkip, 
  onBack 
}: { 
  data: any; 
  onChange: (data: any) => void; 
  onNext: () => void; 
  onSkip: () => void; 
  onBack: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>Help investors learn about you and your company</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Logo */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="bg-muted text-2xl">
              <Building2 className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Company Logo
            </Button>
            <p className="text-xs text-muted-foreground">PNG or JPG, 400x400px recommended</p>
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Company Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell investors about your company, experience, and investment philosophy..."
            value={data.bio}
            onChange={(e) => onChange({ ...data, bio: e.target.value })}
            rows={4}
          />
          <p className="text-xs text-muted-foreground">This appears on your deal pages</p>
        </div>

        {/* Links */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="website">
              <Globe className="h-3 w-3 inline mr-1" />
              Website URL
            </Label>
            <Input
              id="website"
              placeholder="https://yourcompany.com"
              value={data.website}
              onChange={(e) => onChange({ ...data, website: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">
              <Linkedin className="h-3 w-3 inline mr-1" />
              LinkedIn URL
            </Label>
            <Input
              id="linkedin"
              placeholder="https://linkedin.com/company/..."
              value={data.linkedin}
              onChange={(e) => onChange({ ...data, linkedin: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="ghost" onClick={onSkip} className="flex-1">
            Skip for now
          </Button>
          <Button onClick={onNext} className="flex-1">
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VerifyStep({ 
  data, 
  onChange, 
  onNext, 
  onSkip, 
  onBack 
}: { 
  data: any; 
  onChange: (data: any) => void; 
  onNext: () => void; 
  onSkip: () => void; 
  onBack: () => void;
}) {
  const documents = [
    { key: 'governmentId', icon: IdCard, title: 'Government ID', desc: 'Passport, Driver\'s License, or State ID' },
    { key: 'businessProof', icon: FileCheck, title: 'Proof of Business Entity', desc: 'Articles of Incorporation, Operating Agreement' },
    { key: 'trackRecord', icon: TrendingUp, title: 'Track Record Documentation', desc: 'Previous deal performance, investor returns' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Verify Your Identity</CardTitle>
            <CardDescription>Required to list deals and receive funds</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {documents.map((doc) => (
            <div 
              key={doc.key}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 border-dashed transition-colors ${
                data[doc.key] ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted-foreground/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                data[doc.key] ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {data[doc.key] ? <Check className="h-5 w-5" /> : <doc.icon className="h-5 w-5" />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{doc.title}</p>
                <p className="text-sm text-muted-foreground">{doc.desc}</p>
              </div>
              <Button 
                variant={data[doc.key] ? "secondary" : "outline"} 
                size="sm"
                onClick={() => onChange({ ...data, [doc.key]: new File([], 'mock.pdf') })}
              >
                {data[doc.key] ? 'Uploaded' : 'Upload'}
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Verification typically takes <span className="font-medium text-foreground">24-48 hours</span>
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="ghost" onClick={onSkip} className="flex-1">
            Skip for now
          </Button>
          <Button onClick={onNext} className="flex-1">
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BankingStep({ 
  onNext, 
  onSkip, 
  onBack 
}: { 
  onNext: () => void; 
  onSkip: () => void; 
  onBack: () => void;
}) {
  const [connected, setConnected] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Connect Banking</CardTitle>
            <CardDescription>Set up where you'll receive distributions and pay fees</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {connected ? (
          <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Chase Business Checking</p>
                <p className="text-sm text-muted-foreground">Account ending in ****4521</p>
              </div>
              <Badge className="bg-green-500/10 text-green-500">Connected</Badge>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-8 rounded-lg border-2 border-dashed">
              <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium mb-1">Connect your bank account</p>
              <p className="text-sm text-muted-foreground mb-4">
                Securely link your account via Plaid
              </p>
              <Button onClick={() => setConnected(true)}>
                Connect Bank Account
              </Button>
            </div>

            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span>Distributions from your deals will be sent here</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span>Platform fees (0.5% AUM annually) will be deducted</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                <span>256-bit encryption protects your data</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <Clock className="h-5 w-5 text-amber-500" />
          <p className="text-sm">
            <span className="font-medium text-amber-500">Note:</span>{' '}
            <span className="text-muted-foreground">Banking must be connected before your first deal goes live</span>
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button variant="ghost" onClick={onSkip} className="flex-1">
            Skip for now
          </Button>
          <Button onClick={onNext} className="flex-1">
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function TourStep({ 
  currentIndex, 
  onIndexChange, 
  onNext, 
  onBack 
}: { 
  currentIndex: number; 
  onIndexChange: (index: number) => void; 
  onNext: () => void; 
  onBack: () => void;
}) {
  const feature = TOUR_FEATURES[currentIndex];
  const FeatureIcon = feature.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <PlayCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Platform Tour</CardTitle>
            <CardDescription>Quick overview of key features</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Feature Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center p-8 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
          >
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <FeatureIcon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">{feature.description}</p>
          </motion.div>
        </AnimatePresence>

        {/* Feature Navigation */}
        <div className="flex items-center justify-center gap-2">
          {TOUR_FEATURES.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-6 bg-primary' : 'bg-muted hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Feature Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TOUR_FEATURES.map((f, index) => (
            <Button
              key={f.id}
              variant={index === currentIndex ? "default" : "outline"}
              size="sm"
              onClick={() => onIndexChange(index)}
              className="shrink-0"
            >
              <f.icon className="h-4 w-4 mr-2" />
              {f.title}
            </Button>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1 flex gap-2">
            {currentIndex > 0 && (
              <Button variant="ghost" onClick={() => onIndexChange(currentIndex - 1)}>
                Previous
              </Button>
            )}
            {currentIndex < TOUR_FEATURES.length - 1 ? (
              <Button onClick={() => onIndexChange(currentIndex + 1)} className="flex-1">
                Next Feature
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={onNext} className="flex-1">
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FirstDealStep({ 
  onListDeal, 
  onExploreDashboard, 
  onBack 
}: { 
  onListDeal: () => void; 
  onExploreDashboard: () => void; 
  onBack: () => void;
}) {
  return (
    <Card className="border-primary/20 overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
      <CardHeader className="text-center pt-8">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Rocket className="h-10 w-10 text-primary" />
          </div>
        </div>
        <CardTitle className="text-3xl">You're All Set!</CardTitle>
        <CardDescription className="text-base max-w-md mx-auto">
          Your sponsor account is ready. What would you like to do next?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-8">
        <Button 
          size="lg" 
          onClick={onListDeal} 
          className="w-full gap-2 h-16 text-lg"
        >
          <PlusCircle className="h-5 w-5" />
          List Your First Deal
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          onClick={onExploreDashboard} 
          className="w-full gap-2 h-12"
        >
          <LayoutDashboard className="h-4 w-4" />
          Explore Dashboard First
        </Button>

        <div className="text-center pt-4">
          <Button variant="ghost" onClick={onBack} className="text-muted-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
