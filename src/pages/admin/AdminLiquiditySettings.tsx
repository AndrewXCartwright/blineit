import { useState } from "react";
import { ArrowLeft, Plus, Trash2, Save, Droplets, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { FeeTier } from "@/types/liquidity";

// Sample offerings with liquidity settings
const sampleOfferings = [
  {
    id: '1',
    name: 'Sunbelt Tax Lien Fund - Arizona Portfolio',
    enabled: true,
    fee_tiers: [
      { min_months: 0, max_months: 12, fee_percent: 10 },
      { min_months: 12, max_months: 24, fee_percent: 7 },
      { min_months: 24, max_months: 36, fee_percent: 5 },
      { min_months: 36, max_months: null, fee_percent: 3 },
    ] as FeeTier[],
    reserve_percent: 5,
    reserve_balance: 45000,
    target_reserve: 50000,
    max_monthly_redemptions: null,
    min_holding_days: 30,
  },
  {
    id: '2',
    name: 'Phoenix Commercial Liens',
    enabled: true,
    fee_tiers: [
      { min_months: 0, max_months: 12, fee_percent: 12 },
      { min_months: 12, max_months: 24, fee_percent: 8 },
      { min_months: 24, max_months: 36, fee_percent: 5 },
      { min_months: 36, max_months: null, fee_percent: 3 },
    ] as FeeTier[],
    reserve_percent: 7,
    reserve_balance: 32000,
    target_reserve: 35000,
    max_monthly_redemptions: 50000,
    min_holding_days: 60,
  },
  {
    id: '3',
    name: 'Nevada Tax Lien Portfolio',
    enabled: false,
    fee_tiers: [
      { min_months: 0, max_months: 12, fee_percent: 10 },
      { min_months: 12, max_months: null, fee_percent: 5 },
    ] as FeeTier[],
    reserve_percent: 5,
    reserve_balance: 0,
    target_reserve: 25000,
    max_monthly_redemptions: null,
    min_holding_days: 30,
  },
];

interface OfferingSetting {
  id: string;
  name: string;
  enabled: boolean;
  fee_tiers: FeeTier[];
  reserve_percent: number;
  reserve_balance: number;
  target_reserve: number;
  max_monthly_redemptions: number | null;
  min_holding_days: number;
}

export default function AdminLiquiditySettings() {
  const [offerings, setOfferings] = useState<OfferingSetting[]>(sampleOfferings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOffering, setEditingOffering] = useState<OfferingSetting | null>(null);
  
  const handleEdit = (offering: OfferingSetting) => {
    setEditingId(offering.id);
    setEditingOffering({ ...offering, fee_tiers: [...offering.fee_tiers] });
  };
  
  const handleSave = () => {
    if (!editingOffering) return;
    
    setOfferings(offerings.map(o => 
      o.id === editingOffering.id ? editingOffering : o
    ));
    setEditingId(null);
    setEditingOffering(null);
    toast.success('Settings saved successfully');
  };
  
  const handleCancel = () => {
    setEditingId(null);
    setEditingOffering(null);
  };
  
  const handleToggleEnabled = (id: string) => {
    setOfferings(offerings.map(o => 
      o.id === id ? { ...o, enabled: !o.enabled } : o
    ));
    toast.success('Liquidity program updated');
  };
  
  const addFeeTier = () => {
    if (!editingOffering) return;
    const lastTier = editingOffering.fee_tiers[editingOffering.fee_tiers.length - 1];
    const newMinMonths = lastTier?.max_months || (lastTier?.min_months || 0) + 12;
    
    setEditingOffering({
      ...editingOffering,
      fee_tiers: [
        ...editingOffering.fee_tiers.map((t, i) => 
          i === editingOffering.fee_tiers.length - 1 && t.max_months === null
            ? { ...t, max_months: newMinMonths }
            : t
        ),
        { min_months: newMinMonths, max_months: null, fee_percent: 2 },
      ],
    });
  };
  
  const removeFeeTier = (index: number) => {
    if (!editingOffering || editingOffering.fee_tiers.length <= 1) return;
    
    const newTiers = editingOffering.fee_tiers.filter((_, i) => i !== index);
    // Ensure last tier has null max
    if (newTiers.length > 0) {
      newTiers[newTiers.length - 1].max_months = null;
    }
    
    setEditingOffering({
      ...editingOffering,
      fee_tiers: newTiers,
    });
  };
  
  const updateFeeTier = (index: number, field: keyof FeeTier, value: number | null) => {
    if (!editingOffering) return;
    
    const newTiers = [...editingOffering.fee_tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    
    setEditingOffering({
      ...editingOffering,
      fee_tiers: newTiers,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/admin/liquidity">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Liquidity Program Settings</h1>
            <p className="text-muted-foreground">Configure liquidity settings per offering</p>
          </div>
        </div>
        
        {/* Offerings List */}
        <div className="space-y-4">
          {offerings.map((offering) => (
            <Card key={offering.id} className={!offering.enabled ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{offering.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Droplets className="w-4 h-4" />
                      {offering.enabled ? 'Liquidity Enabled' : 'Liquidity Disabled'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={offering.enabled}
                      onCheckedChange={() => handleToggleEnabled(offering.id)}
                    />
                    {editingId !== offering.id && (
                      <Button variant="outline" size="sm" onClick={() => handleEdit(offering)}>
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {editingId === offering.id && editingOffering ? (
                  // Edit Mode
                  <div className="space-y-6 pt-4 border-t border-border">
                    {/* Fee Tiers */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Fee Tiers</Label>
                      <div className="space-y-2">
                        {editingOffering.fee_tiers.map((tier, index) => (
                          <div key={index} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3">
                            <div className="flex-1 grid grid-cols-3 gap-3">
                              <div>
                                <Label className="text-xs text-muted-foreground">Min Months</Label>
                                <Input
                                  type="number"
                                  value={tier.min_months}
                                  onChange={(e) => updateFeeTier(index, 'min_months', parseInt(e.target.value) || 0)}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Max Months</Label>
                                <Input
                                  type="number"
                                  value={tier.max_months ?? ''}
                                  onChange={(e) => updateFeeTier(index, 'max_months', e.target.value ? parseInt(e.target.value) : null)}
                                  placeholder="∞"
                                  className="h-8"
                                  disabled={index === editingOffering.fee_tiers.length - 1}
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-muted-foreground">Fee %</Label>
                                <Input
                                  type="number"
                                  value={tier.fee_percent}
                                  onChange={(e) => updateFeeTier(index, 'fee_percent', parseFloat(e.target.value) || 0)}
                                  className="h-8"
                                  step={0.5}
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeFeeTier(index)}
                              disabled={editingOffering.fee_tiers.length <= 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={addFeeTier}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Tier
                      </Button>
                    </div>
                    
                    {/* Other Settings */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Reserve Percentage</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editingOffering.reserve_percent}
                            onChange={(e) => setEditingOffering({
                              ...editingOffering,
                              reserve_percent: parseFloat(e.target.value) || 0,
                            })}
                            step={0.5}
                          />
                          <span className="text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Min Holding Days</Label>
                        <Input
                          type="number"
                          value={editingOffering.min_holding_days}
                          onChange={(e) => setEditingOffering({
                            ...editingOffering,
                            min_holding_days: parseInt(e.target.value) || 0,
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Redemption Cap</Label>
                        <Input
                          type="number"
                          value={editingOffering.max_monthly_redemptions ?? ''}
                          onChange={(e) => setEditingOffering({
                            ...editingOffering,
                            max_monthly_redemptions: e.target.value ? parseInt(e.target.value) : null,
                          })}
                          placeholder="No limit"
                        />
                      </div>
                    </div>
                    
                    {/* Save/Cancel */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                      <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    {/* Reserve Status */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Reserve Balance</span>
                        <span className="text-foreground">
                          ${offering.reserve_balance.toLocaleString()} / ${offering.target_reserve.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(offering.reserve_balance / offering.target_reserve) * 100} 
                        className="h-2"
                      />
                      {offering.reserve_balance < offering.target_reserve * 0.5 && (
                        <div className="flex items-center gap-2 text-amber-500 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          Reserve below 50% - consider adding funds
                        </div>
                      )}
                    </div>
                    
                    {/* Fee Tiers Display */}
                    <div className="grid grid-cols-4 gap-2">
                      {offering.fee_tiers.map((tier, idx) => (
                        <div key={idx} className="bg-secondary/50 rounded-lg p-2 text-center">
                          <p className="text-xs text-muted-foreground">
                            {tier.min_months}-{tier.max_months || '∞'} mo
                          </p>
                          <p className="text-lg font-bold text-primary">{tier.fee_percent}%</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Other Settings Display */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Reserve: {offering.reserve_percent}%</Badge>
                      <Badge variant="outline">Min Hold: {offering.min_holding_days} days</Badge>
                      {offering.max_monthly_redemptions && (
                        <Badge variant="outline">
                          Monthly Cap: ${offering.max_monthly_redemptions.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

