import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronDown
} from "lucide-react";
import { Transfer, useBankAccounts } from "@/hooks/useBankAccounts";
import { format } from "date-fns";
import { useState } from "react";

export function TransferHistory() {
  const { transfers, loading } = useBankAccounts();
  const [showAll, setShowAll] = useState(false);

  const displayedTransfers = showAll ? transfers : transfers.slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">Completed</Badge>;
      case "failed":
        return <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">Failed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="text-red-500 border-red-500/30 bg-red-500/10">Cancelled</Badge>;
      case "processing":
        return <Badge variant="outline" className="text-blue-500 border-blue-500/30 bg-blue-500/10">Processing</Badge>;
      default:
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transfer History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transfers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transfer History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
            No transfers yet. Link a bank account to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Transfer History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedTransfers.map((transfer) => (
          <Card key={transfer.id} className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    transfer.type === "deposit" 
                      ? "bg-green-500/10" 
                      : "bg-red-500/10"
                  }`}>
                    {transfer.type === "deposit" ? (
                      <ArrowDownToLine className="h-5 w-5 text-green-500" />
                    ) : (
                      <ArrowUpFromLine className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{transfer.type}</span>
                      {getStatusIcon(transfer.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {transfer.linkedAccount 
                        ? `${transfer.type === "deposit" ? "From" : "To"} ${transfer.linkedAccount.institutionName} ****${transfer.linkedAccount.accountMask}`
                        : "Bank Account"
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(transfer.initiatedAt, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-bold ${transfer.type === "deposit" ? "text-green-500" : "text-red-500"}`}>
                    {transfer.type === "deposit" ? "+" : "-"}${transfer.amount.toLocaleString()}
                  </p>
                  {getStatusBadge(transfer.status)}
                </div>
              </div>

              {transfer.status === "pending" && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-primary rounded-full animate-pulse" />
                    </div>
                    <span className="text-xs text-muted-foreground">Processing</span>
                  </div>
                </div>
              )}

              {transfer.failureReason && (
                <p className="mt-2 text-sm text-red-500">
                  Reason: {transfer.failureReason}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {transfers.length > 5 && (
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : `Show All (${transfers.length})`}
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAll ? "rotate-180" : ""}`} />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
