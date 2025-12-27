import { useState } from "react";
import { Search, Download } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminTransactions } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const typeLabels: Record<string, { label: string; color: string }> = {
  buy_tokens: { label: "Buy Tokens", color: "text-purple-400" },
  sell_tokens: { label: "Sell Tokens", color: "text-blue-400" },
  bet_placed: { label: "Bet Placed", color: "text-amber-400" },
  bet_won: { label: "Bet Won", color: "text-success" },
  bet_lost: { label: "Bet Lost", color: "text-destructive" },
  debt_investment: { label: "Debt Investment", color: "text-blue-500" },
  interest_received: { label: "Interest Received", color: "text-success" },
  principal_returned: { label: "Principal Returned", color: "text-blue-400" },
};

export default function AdminTransactions() {
  const { transactions, loading, refetch } = useAdminTransactions();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = 
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalVolume = filteredTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground">
              Total volume: ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="buy_tokens">Buy Tokens</SelectItem>
              <SelectItem value="sell_tokens">Sell Tokens</SelectItem>
              <SelectItem value="bet_placed">Bet Placed</SelectItem>
              <SelectItem value="debt_investment">Debt Investment</SelectItem>
              <SelectItem value="interest_received">Interest Received</SelectItem>
              <SelectItem value="principal_returned">Principal Returned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Description</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const typeInfo = typeLabels[tx.type] || { label: tx.type, color: "text-foreground" };
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {format(new Date(tx.created_at), "MMM d, h:mm a")}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {tx.profile?.email || tx.profile?.display_name || "Unknown"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                        {tx.description || "—"}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium text-right ${
                        isPositive ? "text-success" : "text-destructive"
                      }`}>
                        {isPositive ? "+" : ""}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredTransactions.length} transactions
        </div>
      </div>
    </AdminLayout>
  );
}
