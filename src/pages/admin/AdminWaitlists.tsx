import { useState } from "react";
import { Download, Trash2, Search } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { useAdminWaitlists } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const assetClassLabels: Record<string, { name: string; icon: string }> = {
  gold_commodities: { name: "Gold & Crypto", icon: "🥇" },
  private_business: { name: "Private Business", icon: "🏭" },
  startups_vc: { name: "Startups", icon: "🚀" },
};

export default function AdminWaitlists() {
  const { waitlists, counts, loading, deleteWaitlistEntry, exportToCsv } = useAdminWaitlists();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const filteredWaitlists = waitlists.filter((w) => {
    const matchesSearch = w.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || w.asset_class === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleDelete = async (id: string) => {
    if (confirm("Remove this entry from the waitlist?")) {
      await deleteWaitlistEntry(id);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">Waitlists</h1>
          <Button onClick={exportToCsv} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export to CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(assetClassLabels).map(([key, { name, icon }]) => (
            <StatCard
              key={key}
              icon={<span className="text-xl">{icon}</span>}
              label={name}
              value={(counts[key] || 0).toLocaleString()}
              subValue="signups"
            />
          ))}
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-secondary">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="gold_commodities">🥇 Gold</TabsTrigger>
              <TabsTrigger value="private_business">🏭 Business</TabsTrigger>
              <TabsTrigger value="startups_vc">🚀 Startups</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Asset Class</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Signed Up</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Account</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : filteredWaitlists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No waitlist entries found
                  </td>
                </tr>
              ) : (
                filteredWaitlists.map((entry) => {
                  const assetInfo = assetClassLabels[entry.asset_class] || { name: entry.asset_class, icon: "📋" };
                  return (
                    <tr key={entry.id} className="hover:bg-secondary/30">
                      <td className="px-4 py-3 text-sm text-foreground">
                        {entry.email}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-2 text-sm">
                          <span>{assetInfo.icon}</span>
                          <span className="text-muted-foreground">{assetInfo.name}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-3">
                        {entry.user_id ? (
                          <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                            Linked
                          </span>
                        ) : (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                            Guest
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(entry.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
          Showing {filteredWaitlists.length} of {waitlists.length} entries
        </div>
      </div>
    </AdminLayout>
  );
}
