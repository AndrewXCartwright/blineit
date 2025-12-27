import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="p-8 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Settings</h1>

        <div className="space-y-8">
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-lg mb-4">Platform Settings</h2>
            <div className="space-y-4">
              <div>
                <Label>Platform Name</Label>
                <Input defaultValue="B-LINE-IT" className="mt-1" />
              </div>
              <div>
                <Label>Platform Fee (%)</Label>
                <Input type="number" defaultValue="1" step="0.1" className="mt-1" />
              </div>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-lg mb-4">Feature Toggles</h2>
            <div className="space-y-4">
              {[
                { label: "Enable Equity Trading", enabled: true },
                { label: "Enable Debt Investments", enabled: true },
                { label: "Enable Prediction Markets", enabled: true },
                { label: "Maintenance Mode", enabled: false },
              ].map((feature, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <Label>{feature.label}</Label>
                  <Switch defaultChecked={feature.enabled} />
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full">Save Settings</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
