import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building2, 
  Shield, 
  Zap, 
  Search,
  ArrowLeft,
  Check,
  Loader2,
  Lock
} from "lucide-react";
import { useBankAccounts } from "@/hooks/useBankAccounts";

interface LinkBankModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type Step = "intro" | "select-bank" | "login" | "select-account" | "success";

export function LinkBankModal({ open, onOpenChange, onSuccess }: LinkBankModalProps) {
  const { demoBanks, linkBankAccount } = useBankAccounts();
  const [step, setStep] = useState<Step>("intro");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState<typeof demoBanks[0] | null>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<"checking" | "savings">("checking");
  const [setAsPrimary, setSetAsPrimary] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [linkedAccount, setLinkedAccount] = useState<{ name: string; mask: string } | null>(null);

  const filteredBanks = demoBanks.filter(bank => 
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBank = (bank: typeof demoBanks[0]) => {
    setSelectedBank(bank);
    setStep("login");
  };

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      setStep("select-account");
    }, 1500);
  };

  const handleLinkAccount = async () => {
    if (!selectedBank) return;
    
    setIsLoading(true);
    const account = await linkBankAccount(selectedBank.id, selectedAccountType);
    setIsLoading(false);

    if (account) {
      setLinkedAccount({
        name: account.accountName,
        mask: account.accountMask || "0000",
      });
      setStep("success");
    }
  };

  const handleClose = () => {
    setStep("intro");
    setSearchQuery("");
    setSelectedBank(null);
    setSelectedAccountType("checking");
    setLinkedAccount(null);
    onOpenChange(false);
    if (step === "success") {
      onSuccess?.();
    }
  };

  const handleBack = () => {
    switch (step) {
      case "select-bank":
        setStep("intro");
        break;
      case "login":
        setStep("select-bank");
        setSelectedBank(null);
        break;
      case "select-account":
        setStep("login");
        break;
      default:
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step !== "intro" && step !== "success" && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute left-4 top-4"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        {step === "intro" && (
          <>
            <DialogHeader className="text-center pt-4">
              <Building2 className="h-12 w-12 mx-auto text-primary mb-3" />
              <DialogTitle className="text-xl">Link Your Bank Account</DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Securely connect your bank to deposit and withdraw funds instantly.
              </p>
            </DialogHeader>

            <div className="space-y-3 py-4">
              <Card className="bg-muted/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Bank-level security</p>
                    <p className="text-xs text-muted-foreground">256-bit encryption, never store credentials</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Instant verification</p>
                    <p className="text-xs text-muted-foreground">Most banks verify in seconds</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-sm">12,000+ supported banks</p>
                    <p className="text-xs text-muted-foreground">All major US banks supported</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Powered by Plaid
            </p>

            <Button className="w-full" onClick={() => setStep("select-bank")}>
              Continue to Link Bank
            </Button>
          </>
        )}

        {step === "select-bank" && (
          <>
            <DialogHeader className="text-center pt-6">
              <DialogTitle>Select your bank</DialogTitle>
            </DialogHeader>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for your bank"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredBanks.map((bank) => (
                <Card 
                  key={bank.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSelectBank(bank)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="text-2xl">{bank.logo}</span>
                    <span className="font-medium">{bank.name}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to Plaid's privacy policy
            </p>
          </>
        )}

        {step === "login" && selectedBank && (
          <>
            <DialogHeader className="text-center pt-6">
              <span className="text-3xl mb-2">{selectedBank.logo}</span>
              <DialogTitle>{selectedBank.name}</DialogTitle>
              <p className="text-muted-foreground text-sm">Enter your credentials</p>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input placeholder="Enter username" className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Password</label>
                <Input type="password" placeholder="Enter password" className="mt-1" />
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Your credentials are encrypted and never shared with B-LINE-IT</span>
            </div>

            <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </>
        )}

        {step === "select-account" && selectedBank && (
          <>
            <DialogHeader className="text-center pt-6">
              <span className="text-3xl mb-2">{selectedBank.logo}</span>
              <DialogTitle>{selectedBank.name}</DialogTitle>
              <p className="text-muted-foreground text-sm">Select account to link</p>
            </DialogHeader>

            <div className="space-y-2 py-4">
              <Card 
                className={`cursor-pointer transition-colors ${selectedAccountType === "checking" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                onClick={() => setSelectedAccountType("checking")}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedBank.name} Total Checking</p>
                    <p className="text-sm text-muted-foreground">****{Math.floor(1000 + Math.random() * 9000)} • $12,450.00</p>
                  </div>
                  {selectedAccountType === "checking" && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors ${selectedAccountType === "savings" ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}
                onClick={() => setSelectedAccountType("savings")}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedBank.name} Savings</p>
                    <p className="text-sm text-muted-foreground">****{Math.floor(1000 + Math.random() * 9000)} • $45,230.00</p>
                  </div>
                  {selectedAccountType === "savings" && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </CardContent>
              </Card>
            </div>

            <Button className="w-full" onClick={handleLinkAccount} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Linking...
                </>
              ) : (
                "Link Account"
              )}
            </Button>
          </>
        )}

        {step === "success" && linkedAccount && (
          <>
            <DialogHeader className="text-center pt-8">
              <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <DialogTitle className="text-xl">Account Linked Successfully!</DialogTitle>
            </DialogHeader>

            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="font-medium">{linkedAccount.name}</p>
                <p className="text-sm text-muted-foreground">****{linkedAccount.mask}</p>
              </CardContent>
            </Card>

            <p className="text-sm text-center text-muted-foreground">
              You can now deposit and withdraw funds from this account.
            </p>

            <div className="flex items-center justify-center space-x-2">
              <Checkbox 
                id="set-primary" 
                checked={setAsPrimary}
                onCheckedChange={(checked) => setSetAsPrimary(checked === true)}
              />
              <label 
                htmlFor="set-primary" 
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Set as primary account for deposits
              </label>
            </div>

            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
