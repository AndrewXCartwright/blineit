import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
              {t('tax.taxSettings')}
            </h1>
            <p className="text-sm text-muted-foreground">{t('tax.configureTaxPreferences')}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('tax.taxInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>{t('tax.taxIdType')}</Label>
              <RadioGroup value={taxIdType} onValueChange={(v) => setTaxIdType(v as 'ssn' | 'ein')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ssn" id="ssn" />
                  <Label htmlFor="ssn" className="cursor-pointer">{t('tax.ssnLabel')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ein" id="ein" />
                  <Label htmlFor="ein" className="cursor-pointer">{t('tax.einLabel')}</Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('tax.taxId')}</p>
                  <p className="text-sm text-muted-foreground">
                    {settings?.tax_id_last_four ? `XXX-XX-${settings.tax_id_last_four} ✓ ${t('tax.verified')}` : t('tax.notProvided')}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {t('tax.updateTaxId')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Basis Method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('tax.costBasisMethod')}</CardTitle>
            <CardDescription>
              {t('tax.costBasisDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={costBasisMethod} onValueChange={(v) => setCostBasisMethod(v as typeof costBasisMethod)}>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="fifo" id="fifo" className="mt-1" />
                  <div>
                    <Label htmlFor="fifo" className="cursor-pointer font-medium">{t('tax.fifoLabel')}</Label>
                    <p className="text-sm text-muted-foreground">{t('tax.fifoDescription')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="lifo" id="lifo" className="mt-1" />
                  <div>
                    <Label htmlFor="lifo" className="cursor-pointer font-medium">{t('tax.lifoLabel')}</Label>
                    <p className="text-sm text-muted-foreground">{t('tax.lifoDescription')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="specific_id" id="specific_id" className="mt-1" />
                  <div>
                    <Label htmlFor="specific_id" className="cursor-pointer font-medium">{t('tax.specificIdLabel')}</Label>
                    <p className="text-sm text-muted-foreground">{t('tax.specificIdDescription')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="average" id="average" className="mt-1" />
                  <div>
                    <Label htmlFor="average" className="cursor-pointer font-medium">{t('tax.averageCostLabel')}</Label>
                    <p className="text-sm text-muted-foreground">{t('tax.averageCostDescription')}</p>
                  </div>
                </div>
              </div>
            </RadioGroup>

            <Alert className="mt-4">
              <AlertDescription>
                ⚠️ {t('tax.costBasisWarning')}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Document Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('tax.documentDelivery')}</CardTitle>
            <CardDescription>
              {t('tax.documentDeliveryDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('tax.electronicDelivery')}</p>
                <p className="text-sm text-muted-foreground">{t('tax.electronicDeliveryDesc')}</p>
              </div>
              <Switch
                checked={electronicDelivery}
                onCheckedChange={setElectronicDelivery}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('tax.mailPaperCopies')}</p>
                <p className="text-sm text-muted-foreground">{t('tax.mailPaperCopiesDesc')}</p>
              </div>
              <Switch
                checked={mailPaperCopies}
                onCheckedChange={setMailPaperCopies}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{t('tax.emailNotifications')}</p>
                <p className="text-sm text-muted-foreground">{t('tax.emailNotificationsDesc')}</p>
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
          {updateSettings.isPending ? t('common.loading') : t('tax.saveSettings')}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}