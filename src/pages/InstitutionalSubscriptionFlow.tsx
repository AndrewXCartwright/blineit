import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, ChevronLeft, ChevronRight, DollarSign, User, FileText, 
  Building2, CheckCircle2, Copy, AlertCircle, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { formatCurrency } from "@/lib/formatters";
import { toast } from "sonner";

const steps = [
  { id: 1, title: "Amount", icon: DollarSign },
  { id: 2, title: "Investor Info", icon: User },
  { id: 3, title: "Sign Documents", icon: FileText },
  { id: 4, title: "Wire Instructions", icon: Building2 },
];

const mockOffering = {
  id: "1",
  name: "Manhattan Prime Office Tower",
  minimum_investment: 100000,
  target_raise: 50000000,
  target_irr: 18.5,
  target_multiple: 2.1,
};

const mockDocuments = [
  { id: "sub", name: "Subscription Agreement", status: "pending" },
  { id: "op", name: "Operating Agreement", status: "pending" },
  { id: "accred", name: "Accredited Investor Questionnaire", status: "on_file" },
  { id: "w9", name: "W-9 Form", status: "on_file" },
];

const wireInstructions = {
  reference: "INV-2024-MPO-0049",
  bankName: "JPMorgan Chase Bank, N.A.",
  bankAddress: "383 Madison Avenue, New York, NY 10179",
  accountName: "PropVest Capital Partners LLC",
  accountNumber: "****4892",
  routingNumber: "021000021",
  swiftCode: "CHASUS33",
};

export default function InstitutionalSubscriptionFlow() {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [amount, setAmount] = useState(100000);
  const [fundingMethod, setFundingMethod] = useState("wire");
  const [isComplete, setIsComplete] = useState(false);

  const offering = mockOffering;
  const ownershipPercent = ((amount / offering.target_raise) * 100).toFixed(3);

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

  const handleCopyAll = () => {
    const text = `Reference: ${wireInstructions.reference}
Bank: ${wireInstructions.bankName}
Address: ${wireInstructions.bankAddress}
Account Name: ${wireInstructions.accountName}
Account Number: ${wireInstructions.accountNumber}
Routing Number: ${wireInstructions.routingNumber}
SWIFT: ${wireInstructions.swiftCode}
Amount: ${formatCurrency(amount)}`;
    
    navigator.clipboard.writeText(text);
    toast.success("Wire instructions copied to clipboard");
  };

  const handleComplete = () => {
    setIsComplete(true);
    toast.success("Subscription submitted! We'll confirm once we receive your wire.");
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <Header />
        <main className="container max-w-2xl mx-auto px-4 py-12">
          <Card className="text-center">
            <CardContent className="p-8 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Subscription Submitted!</h2>
              <p className="text-muted-foreground">
                Your subscription to {offering.name} has been submitted successfully.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-mono font-semibold">{wireInstructions.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className="bg-warning/20 text-warning">Awaiting Wire</Badge>
                </div>
              </div>
              <div className="flex gap-2 justify-center pt-4">
                <Link to="/institutional/investments">
                  <Button>View My Investments</Button>
                </Link>
                <Link to="/institutional">
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header />
      
      <main className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Link to={`/institutional/offering/${id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Offering
        </Link>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Subscribe to {offering.name}</CardTitle>
            
            {/* Progress Steps */}
            <div className="flex items-center justify-between mt-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
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
                    <div className={`h-0.5 w-16 mx-2 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Amount */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <Label>Investment Amount</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                          className="pl-8 text-lg"
                          min={offering.minimum_investment}
                          step={25000}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {[100000, 250000, 500000, 1000000].map((amt) => (
                        <Button
                          key={amt}
                          variant={amount === amt ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAmount(amt)}
                        >
                          {formatCurrency(amt)}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum investment: {formatCurrency(offering.minimum_investment)}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Ownership %</p>
                      <p className="text-lg font-bold">{ownershipPercent}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Est. Annual Cash</p>
                      <p className="text-lg font-bold text-success">{formatCurrency(amount * 0.08)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Target Exit</p>
                      <p className="text-lg font-bold">{formatCurrency(amount * offering.target_multiple)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Funding Method</Label>
                    <RadioGroup value={fundingMethod} onValueChange={setFundingMethod}>
                      <Label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer ${
                        fundingMethod === "wire" ? "border-primary bg-primary/5" : "border-border"
                      }`}>
                        <RadioGroupItem value="wire" />
                        <div>
                          <p className="font-medium">Wire Transfer</p>
                          <p className="text-sm text-muted-foreground">1-2 business days</p>
                        </div>
                      </Label>
                      <Label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer ${
                        fundingMethod === "ach" ? "border-primary bg-primary/5" : "border-border"
                      }`}>
                        <RadioGroupItem value="ach" />
                        <div>
                          <p className="font-medium">ACH Transfer</p>
                          <p className="text-sm text-muted-foreground">3-5 business days (up to $100K)</p>
                        </div>
                      </Label>
                    </RadioGroup>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Investor Info */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-2">Investing As</p>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-semibold">Acme Capital Partners LLC</p>
                        <p className="text-sm text-muted-foreground">Delaware LLC • EIN: **-***4567</p>
                      </div>
                      <Badge className="ml-auto">Verified Entity</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Entity Name</Label>
                      <Input value="Acme Capital Partners LLC" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Entity Type</Label>
                      <Input value="Limited Liability Company" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>State of Formation</Label>
                      <Input value="Delaware" disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>EIN</Label>
                      <Input value="**-***4567" disabled />
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Your entity information is pre-filled from your account. To update, go to Entity Setup.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Sign Documents */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-muted-foreground">
                    Review and sign the required documents to complete your subscription.
                  </p>

                  <div className="space-y-3">
                    {mockDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="font-medium">{doc.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.status === "on_file" ? (
                            <Badge className="bg-success/20 text-success">On File</Badge>
                          ) : doc.status === "signed" ? (
                            <Badge className="bg-success/20 text-success">Signed</Badge>
                          ) : (
                            <>
                              <Badge variant="outline">Pending</Badge>
                              <Button size="sm">Review & Sign</Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Wire Instructions */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Important: Include Reference Number</p>
                      <p className="text-sm text-muted-foreground">
                        Your wire must include the reference number to be properly credited.
                      </p>
                    </div>
                  </div>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-3">
                      <CardTitle className="text-base">Wire Instructions</CardTitle>
                      <Button variant="outline" size="sm" onClick={handleCopyAll} className="gap-2">
                        <Copy className="w-4 h-4" />
                        Copy All
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                        <p className="text-xs text-muted-foreground">Reference Number (REQUIRED)</p>
                        <p className="font-mono font-bold text-lg text-primary">{wireInstructions.reference}</p>
                      </div>
                      
                      <div className="grid gap-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bank Name</span>
                          <span className="font-medium">{wireInstructions.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bank Address</span>
                          <span className="font-medium text-right">{wireInstructions.bankAddress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Name</span>
                          <span className="font-medium">{wireInstructions.accountName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Account Number</span>
                          <span className="font-mono">{wireInstructions.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Routing Number</span>
                          <span className="font-mono">{wireInstructions.routingNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SWIFT Code</span>
                          <span className="font-mono">{wireInstructions.swiftCode}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-bold text-lg">{formatCurrency(amount)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Wire must be received within 5 business days</span>
                  </div>

                  <Button className="w-full" size="lg" onClick={handleComplete}>
                    I've Sent the Wire
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            {currentStep < 4 && (
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
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
