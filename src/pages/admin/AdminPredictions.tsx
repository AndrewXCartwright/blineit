import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdminPredictions } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminPredictions() {
  const { markets, loading } = useAdminPredictions();

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">Predictions</h1>
          <Button className="gap-2"><Plus className="w-4 h-4" />Create Market</Button>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Yes/No</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Volume</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : markets.map((m) => (
                <tr key={m.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3 text-sm text-foreground">{m.title || m.question}</td>
                  <td className="px-4 py-3 text-sm">{m.yes_price}¢ / {m.no_price}¢</td>
                  <td className="px-4 py-3 text-sm">${m.volume.toLocaleString()}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full bg-secondary">{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
