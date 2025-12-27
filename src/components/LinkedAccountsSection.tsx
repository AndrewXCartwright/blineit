import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Building2, 
  Plus, 
  MoreHorizontal, 
  Star, 
  Trash2, 
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Clock
} from "lucide-react";
import { LinkedAccount, useBankAccounts } from "@/hooks/useBankAccounts";
import { LinkBankModal } from "./LinkBankModal";
import { TransferModal } from "./TransferModal";

export function LinkedAccountsSection() {
  const { linkedAccounts, loading, unlinkAccount, setPrimaryAccount } = useBankAccounts();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | undefined>();
  const [accountToRemove, setAccountToRemove] = useState<LinkedAccount | null>(null);

  const handleDeposit = (accountId: string) => {
    setSelectedAccountId(accountId);
    setShowDepositModal(true);
  };

  const handleWithdraw = (accountId: string) => {
    setSelectedAccountId(accountId);
    setShowWithdrawModal(true);
  };

  const handleRemoveAccount = async () => {
    if (accountToRemove) {
      await unlinkAccount(accountToRemove.id);
      setAccountToRemove(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Linked Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Linked Accounts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {linkedAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">
                No bank accounts linked yet
              </p>
              <Button onClick={() => setShowLinkModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Link Bank Account
              </Button>
            </div>
          ) : (
            <>
              {linkedAccounts.map((account) => (
                <Card key={account.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{account.institutionName}</span>
                            {account.isVerified ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} ****{account.accountMask}
                          </p>
                          {account.isPrimary && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!account.isPrimary && (
                            <DropdownMenuItem onClick={() => setPrimaryAccount(account.id)}>
                              <Star className="h-4 w-4 mr-2" />
                              Set as Primary
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setAccountToRemove(account)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleDeposit(account.id)}
                        disabled={!account.isVerified}
                      >
                        <ArrowDownToLine className="h-4 w-4 mr-2" />
                        Deposit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleWithdraw(account.id)}
                        disabled={!account.isVerified}
                      >
                        <ArrowUpFromLine className="h-4 w-4 mr-2" />
                        Withdraw
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowLinkModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Link New Bank Account
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <LinkBankModal 
        open={showLinkModal} 
        onOpenChange={setShowLinkModal}
      />

      {linkedAccounts.length > 0 && (
        <>
          <TransferModal
            open={showDepositModal}
            onOpenChange={setShowDepositModal}
            type="deposit"
            accounts={linkedAccounts}
            defaultAccountId={selectedAccountId}
          />
          <TransferModal
            open={showWithdrawModal}
            onOpenChange={setShowWithdrawModal}
            type="withdrawal"
            accounts={linkedAccounts}
            defaultAccountId={selectedAccountId}
          />
        </>
      )}

      <AlertDialog open={!!accountToRemove} onOpenChange={() => setAccountToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Bank Account?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink {accountToRemove?.institutionName} ****{accountToRemove?.accountMask}?
              <br /><br />
              • Any pending transfers will still complete<br />
              • You can always re-link this account later
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
