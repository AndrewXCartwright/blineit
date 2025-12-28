import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BottomNav } from '@/components/BottomNav';
import { useTaxSettings, useUpdateTaxSettings } from '@/hooks/useTaxData';
import { toast } from 'sonner';

export default function TaxSettings() {
  const navigate = useNavigate();
  const { data: settings, isLoading } = useTaxSettings();
  const updateSettings = useUpdateTaxSettings();

  const [taxIdType, setTaxIdType] = useState<'ssn' | 'ein'>('ssn');
  const [costBasisMethod, setCostBasisMethod] = useState<'fifo' | 'lifo' | 'specific_id' | 'average'>('fifo');
  const [electronicDelivery, setElectronicDelivery] = useState(true);
  const [mailPaperCopies, setMailPaperCopies] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (settings) {
      setTaxIdType(settings.tax_id_type || 'ssn');
      setCostBasisMethod(settings.cost_basis_method);
      setElectronicDelivery(settings.electronic_delivery);
      setMailPaperCopies(settings.mail_paper_copies);
      setEmailNotifications(settings.email_notifications);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      tax_id_type: taxIdType,
      cost_basis_method: costBasisMethod,
      electronic_delivery: electronicDelivery,
      mail_paper_copies: mailPaperCopies,
      email_notifications: emailNotifications,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tax')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Tax Settings
            </h1>
            <p className="text-sm text-muted-foreground">Configure your tax preferences</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Tax ID Type</Label>
              <RadioGroup value={taxIdType} onValueChange={(v) => setTaxIdType(v as 'ssn' | 'ein')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ssn" id="ssn" />
                  <Label htmlFor="ssn" className="cursor-pointer">SSN (Social Security Number)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ein" id="ein" />
                  <Label htmlFor="ein" className="cursor-pointer">EIN (Employer Identification Number)</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tax ID</p>
                  <p className="text-sm text-muted-foreground">
                    {settings?.tax_id_last_four ? `XXX-XX-${settings.tax_id_last_four} ✓ Verified` : 'Not provided'}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Update Tax ID
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Basis Method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Basis Method</CardTitle>
            <CardDescription>
              Choose how to calculate cost basis for token sales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={costBasisMethod} onValueChange={(v) => setCostBasisMethod(v as typeof costBasisMethod)}>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="fifo" id="fifo" className="mt-1" />
                  <div>
                    <Label htmlFor="fifo" className="cursor-pointer font-medium">FIFO (First In, First Out)</Label>
                    <p className="text-sm text-muted-foreground">Oldest tokens sold first - Default</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="lifo" id="lifo" className="mt-1" />
                  <div>
                    <Label htmlFor="lifo" className="cursor-pointer font-medium">LIFO (Last In, First Out)</Label>
                    <p className="text-sm text-muted-foreground">Newest tokens sold first</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="specific_id" id="specific_id" className="mt-1" />
                  <div>
                    <Label htmlFor="specific_id" className="cursor-pointer font-medium">Specific Identification</Label>
                    <p className="text-sm text-muted-foreground">Choose which tokens to sell</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="average" id="average" className="mt-1" />
                  <div>
                    <Label htmlFor="average" className="cursor-pointer font-medium">Average Cost</Label>
                    <p className="text-sm text-muted-foreground">Average price of all tokens held</p>
                  </div>
                </div>
              </div>
            </RadioGroup>

            <Alert className="mt-4">
              <AlertDescription>
                ⚠️ Changing this will affect future sales only.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Document Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Document Delivery</CardTitle>
            <CardDescription>
              How would you like to receive tax documents?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Electronic delivery</p>
                <p className="text-sm text-muted-foreground">Documents available in Tax Center (recommended)</p>
              </div>
              <Switch
                checked={electronicDelivery}
                onCheckedChange={setElectronicDelivery}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mail paper copies</p>
                <p className="text-sm text-muted-foreground">Sent to address on file</p>
              </div>
              <Switch
                checked={mailPaperCopies}
                onCheckedChange={setMailPaperCopies}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email notifications</p>
                <p className="text-sm text-muted-foreground">Get notified when documents are ready</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button 
          className="w-full" 
          onClick={handleSave}
          disabled={updateSettings.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
