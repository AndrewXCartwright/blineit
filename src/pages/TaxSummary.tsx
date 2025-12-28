import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, FileText, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BottomNav } from '@/components/BottomNav';
import { useTaxSummary } from '@/hooks/useTaxData';
import { formatCurrency } from '@/lib/formatters';

const currentYear = new Date().getFullYear();
const taxYears = [currentYear - 1, currentYear - 2, currentYear - 3];

export default function TaxSummary() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(currentYear - 1);
  
  const { data: summary, isLoading } = useTaxSummary(selectedYear);

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
              <FileText className="h-5 w-5 text-primary" />
              {t('tax.summaryReport')} - {selectedYear}
            </h1>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Year Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{t('tax.taxYear')}:</span>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {taxYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Income Summary */}
        <Card>
          <CardHeader>
            <CardTitle>{t('tax.incomeSummary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dividends Section */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">{t('tax.dividendsForm')}</h3>
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.ordinaryDividends')}:</span>
                    <span className="font-medium">{formatCurrency(summary?.dividends || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.qualifiedDividends')}:</span>
                    <span className="font-medium">{formatCurrency(summary?.qualifiedDividends || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.totalCapitalGainDistr')}:</span>
                    <span className="font-medium">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.federalTaxWithheld')}:</span>
                    <span className="font-medium">{formatCurrency(0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interest Section */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">{t('tax.interestForm')}</h3>
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.interestIncome')}:</span>
                    <span className="font-medium">{formatCurrency(summary?.interest || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.earlyWithdrawalPenalty')}:</span>
                    <span className="font-medium">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.federalTaxWithheld')}:</span>
                    <span className="font-medium">{formatCurrency(0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Other Income Section */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">{t('tax.otherIncomeForm')}</h3>
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.predictionWinnings')}:</span>
                    <span className="font-medium">{formatCurrency(summary?.predictionWinnings || 0)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">({t('tax.reportedAsOtherIncome')})</p>
                </CardContent>
              </Card>
            </div>

            {/* Capital Gains Section */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">{t('tax.capitalGainsForm')}</h3>
              <Card className="bg-muted/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.shortTermGains')}:</span>
                    <span className="font-medium text-green-500">{formatCurrency(summary?.capitalGains || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.shortTermLosses')}:</span>
                    <span className="font-medium text-red-500">{formatCurrency(summary?.capitalLosses || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.longTermGains')}:</span>
                    <span className="font-medium">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">{t('tax.longTermLosses')}:</span>
                    <span className="font-medium">{formatCurrency(0)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-sm">{t('tax.netCapitalGainLoss')}:</span>
                    <span className={summary?.netCapitalGainLoss && summary.netCapitalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {(summary?.netCapitalGainLoss || 0) >= 0 ? '+' : ''}{formatCurrency(summary?.netCapitalGainLoss || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Total Summary */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>{t('tax.totalTaxableIncome')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>{t('tax.dividends')}:</span>
              <span className="font-medium">{formatCurrency(summary?.dividends || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('tax.interest')}:</span>
              <span className="font-medium">{formatCurrency(summary?.interest || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('tax.predictionWinnings')}:</span>
              <span className="font-medium">{formatCurrency(summary?.predictionWinnings || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('tax.capitalGains')}:</span>
              <span className="font-medium">{formatCurrency(summary?.netCapitalGainLoss || 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>{t('tax.total')}:</span>
              <span className="text-primary">{formatCurrency(summary?.totalIncome || 0)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {t('tax.downloadPdf')}
          </Button>
          <Button variant="outline" className="flex-1">
            {t('tax.exportCsv')}
          </Button>
          <Button variant="outline" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
