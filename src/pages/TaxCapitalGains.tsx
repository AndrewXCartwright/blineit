import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { BottomNav } from '@/components/BottomNav';
import { useTaxableEvents } from '@/hooks/useTaxData';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

const currentYear = new Date().getFullYear();
const taxYears = [currentYear - 1, currentYear - 2, currentYear - 3];

export default function TaxCapitalGains() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(currentYear - 1);
  
  const { data: gainEvents } = useTaxableEvents(selectedYear, 'capital_gain');
  const { data: lossEvents } = useTaxableEvents(selectedYear, 'capital_loss');

  const allEvents = [...(gainEvents || []), ...(lossEvents || [])].sort(
    (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
  );

  const shortTermGains = gainEvents?.filter(e => e.holding_period === 'short_term')
    .reduce((sum, e) => sum + Number(e.gain_loss || 0), 0) || 0;
  const shortTermLosses = lossEvents?.filter(e => e.holding_period === 'short_term')
    .reduce((sum, e) => sum + Math.abs(Number(e.gain_loss || 0)), 0) || 0;
  const longTermGains = gainEvents?.filter(e => e.holding_period === 'long_term')
    .reduce((sum, e) => sum + Number(e.gain_loss || 0), 0) || 0;
  const longTermLosses = lossEvents?.filter(e => e.holding_period === 'long_term')
    .reduce((sum, e) => sum + Math.abs(Number(e.gain_loss || 0)), 0) || 0;

  const totalGains = shortTermGains + longTermGains;
  const totalLosses = shortTermLosses + longTermLosses;
  const netGainLoss = totalGains - totalLosses;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tax')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t('tax.capitalGainsLosses')} - {selectedYear}
            </h1>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t('tax.exportCsv')}
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Year Selector & Total */}
        <div className="flex items-center justify-between">
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
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t('tax.netGainLoss')}</p>
            <p className={`text-2xl font-bold ${netGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {netGainLoss >= 0 ? '+' : ''}{formatCurrency(netGainLoss)}
            </p>
          </div>
        </div>

        {/* Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('tax.summary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead className="text-right">{t('tax.gains')}</TableHead>
                  <TableHead className="text-right">{t('tax.losses')}</TableHead>
                  <TableHead className="text-right">{t('tax.net')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">{t('tax.shortTerm')}</TableCell>
                  <TableCell className="text-right text-green-500">{formatCurrency(shortTermGains)}</TableCell>
                  <TableCell className="text-right text-red-500">{formatCurrency(shortTermLosses)}</TableCell>
                  <TableCell className={`text-right font-medium ${shortTermGains - shortTermLosses >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {shortTermGains - shortTermLosses >= 0 ? '+' : ''}{formatCurrency(shortTermGains - shortTermLosses)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">{t('tax.longTerm')}</TableCell>
                  <TableCell className="text-right text-green-500">{formatCurrency(longTermGains)}</TableCell>
                  <TableCell className="text-right text-red-500">{formatCurrency(longTermLosses)}</TableCell>
                  <TableCell className={`text-right font-medium ${longTermGains - longTermLosses >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {longTermGains - longTermLosses >= 0 ? '+' : ''}{formatCurrency(longTermGains - longTermLosses)}
                  </TableCell>
                </TableRow>
                <TableRow className="border-t-2">
                  <TableCell className="font-bold">{t('tax.total')}</TableCell>
                  <TableCell className="text-right font-bold text-green-500">{formatCurrency(totalGains)}</TableCell>
                  <TableCell className="text-right font-bold text-red-500">{formatCurrency(totalLosses)}</TableCell>
                  <TableCell className={`text-right font-bold ${netGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {netGainLoss >= 0 ? '+' : ''}{formatCurrency(netGainLoss)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('tax.transactions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {allEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('tax.noCapitalGains', { year: selectedYear })}
              </p>
            ) : (
              allEvents.map(event => {
                const isGain = event.event_type === 'capital_gain';
                const gainLoss = Number(event.gain_loss || 0);
                return (
                  <Card key={event.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {isGain ? (
                            <TrendingUp className="h-5 w-5 text-green-500" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                          )}
                          <span className={`font-semibold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                            {isGain ? t('tax.gain') : t('tax.loss')}: {event.item_name}
                          </span>
                        </div>
                        <span className={`text-lg font-bold ${isGain ? 'text-green-500' : 'text-red-500'}`}>
                          {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('tax.sold')}:</span>
                          <span>{format(new Date(event.event_date), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('tax.proceeds')}:</span>
                          <span>{formatCurrency(event.gross_amount)}</span>
                        </div>
                        {event.cost_basis && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('tax.costBasis')}:</span>
                            <span>{formatCurrency(event.cost_basis)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('tax.holdingPeriod')}:</span>
                          <span>{event.holding_period === 'short_term' ? t('tax.shortTerm') : t('tax.longTerm')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}