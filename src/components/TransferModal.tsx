import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Building2, 
  Check,
  Loader2,
  Lock,
  Calendar
} from "lucide-react";
import { LinkedAccount, useBankAccounts } from "@/hooks/useBankAccounts";
import { useUserData } from "@/hooks/useUserData";
import { format, addDays } from "date-fns";

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "deposit" | "withdrawal";
  accounts: LinkedAccount[];
  defaultAccountId?: string;
  onSuccess?: () => void;
}

type Step = "amount" | "confirm" | "success";

export function TransferModal({ 
  open, 
  onOpenChange, 
  type, 
  accounts,
  defaultAccountId,
  onSuccess 
}: TransferModalProps) {
  const { deposit, withdraw } = useBankAccounts();
  const { profile } = useUserData();
  const [step, setStep] = useState<Step>("amount");
  const [selectedAccountId, setSelectedAccountId] = useState(defaultAccountId || accounts[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState("");

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const numericAmount = parseFloat(amount) || 0;
  const walletBalance = profile?.wallet_balance || 0;
  const maxWithdrawal = Math.min(walletBalance, 25000);
  const maxDeposit = 50000;

  const isValid = numericAmount > 0 && (
    type === "deposit" ? numericAmount <= maxDeposit : numericAmount <= maxWithdrawal
  );

  const quickAmounts = type === "deposit" 
    ? [100, 500, 1000, 5000]
    : [100, 500, 1000, 2500];

  const estimatedArrival = type === "deposit" 
    ? addDays(new Date(), 2)
    : addDays(new Date(), 3);

  const handleQuickAmount = (value: number) => {
    if (type === "withdrawal" && value > walletBalance) {
      setAmount(walletBalance.toString());
    } else {
      setAmount(value.toString());
    }
  };

  const handleMaxAmount = () => {
    if (type === "deposit") {
      setAmount(maxDeposit.toString());
    } else {
      setAmount(maxWithdrawal.toString());
    }
  };

  const handleContinue = () => {
    if (!isValid) return;
    setStep("confirm");
  };

  const handleProcess = async () => {
    if (!selectedAccountId || !numericAmount) return;
    
    setIsProcessing(true);
    
    const result = type === "deposit" 
      ? await deposit(selectedAccountId, numericAmount)
      : await withdraw(selectedAccountId, numericAmount);
    
    setIsProcessing(false);

    if (result.success) {
      setConfirmationNumber(result.transferId || "");
      setStep("success");
    }
  };

  const handleClose = () => {
    setStep("amount");
    setAmount("");
    onOpenChange(false);
    if (step === "success") {
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === "amount" && (
          <>
            <DialogHeader className="text-center">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                {type === "deposit" ? (
                  <ArrowDownToLine className="h-6 w-6 text-primary" />
                ) : (
                  <ArrowUpFromLine className="h-6 w-6 text-primary" />
                )}
              </div>
              <DialogTitle className="text-xl">
                {type === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
              </DialogTitle>
            </DialogHeader>

            {type === "withdrawal" && (
              <p className="text-center text-muted-foreground">
                Available Balance: <span className="font-semibold text-foreground">${walletBalance.toLocaleString()}</span>
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {type === "deposit" ? "From" : "To"}
                </label>
                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{account.institutionName} {account.accountType} ****{account.accountMask}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Amount</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-medium">$</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8 text-lg h-12 text-center"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((value) => (
                  <Button 
                    key={value} 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickAmount(value)}
                  >
                    ${value.toLocaleString()}
                  </Button>
                ))}
                <Button variant="outline" size="sm" onClick={handleMaxAmount}>
                  Max
                </Button>
              </div>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{type === "deposit" ? "Deposit" : "Withdrawal"} Amount</span>
                  <span className="font-medium">${numericAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-medium text-green-500">$0.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-medium">
                    {type === "deposit" ? "Total from Bank" : "You'll Receive"}
                  </span>
                  <span className="font-bold">${numericAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <Calendar className="h-3 w-3" />
                  <span>Estimated arrival: {format(estimatedArrival, "MMM d, yyyy")}</span>
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full" 
              onClick={handleContinue}
              disabled={!isValid}
            >
              Continue
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Secured by Plaid • Bank-level encryption</span>
            </div>
          </>
        )}

        {step === "confirm" && selectedAccount && (
          <>
            <DialogHeader className="text-center">
              <DialogTitle>Confirm {type === "deposit" ? "Deposit" : "Withdrawal"}</DialogTitle>
            </DialogHeader>

            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold text-lg">${numericAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{type === "deposit" ? "From" : "To"}</span>
                  <span className="font-medium">
                    {selectedAccount.institutionName} ****{selectedAccount.accountMask}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Arrival</span>
                  <span>{format(estimatedArrival, "MMM d, yyyy")}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep("amount")}>
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleProcess}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `${type === "deposit" ? "Deposit" : "Withdraw"} $${numericAmount.toLocaleString()}`
                )}
              </Button>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader className="text-center pt-6">
              <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <DialogTitle className="text-xl">
                {type === "deposit" ? "Deposit" : "Withdrawal"} Initiated!
              </DialogTitle>
            </DialogHeader>

            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-bold">${numericAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{type === "deposit" ? "From" : "To"}</span>
                  <span>{selectedAccount?.institutionName} ****{selectedAccount?.accountMask}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-yellow-500">Processing</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected</span>
                  <span>{format(estimatedArrival, "MMM d, yyyy")}</span>
                </div>
              </CardContent>
            </Card>

            <p className="text-sm text-center text-muted-foreground">
              We'll notify you when the transfer is complete.
            </p>

            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
