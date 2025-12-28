import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Target, Download, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BottomNav } from '@/components/BottomNav';
import { useTaxableEvents } from '@/hooks/useTaxData';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

const currentYear = new Date().getFullYear();
const taxYears = [currentYear - 1, currentYear - 2, currentYear - 3];

export default function TaxPredictions() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(currentYear - 1);
  
  const { data: events, isLoading } = useTaxableEvents(selectedYear, 'prediction_winnings');

  const netWinnings = events?.reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;
  const totalBets = events?.reduce((sum, e) => sum + Number(e.gross_amount), 0) || 0;
  const wins = events?.filter(e => Number(e.net_amount) > 0) || [];
  const losses = events?.filter(e => Number(e.net_amount) <= 0) || [];
  const winRate = events && events.length > 0 ? (wins.length / events.length) * 100 : 0;

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
              <Target className="h-5 w-5 text-primary" />
              {t('tax.predictionMarketIncome')} - {selectedYear}
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
            <p className="text-sm text-muted-foreground">{t('tax.netWinnings')}</p>
            <p className={`text-2xl font-bold ${netWinnings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(netWinnings)}
            </p>
          </div>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('tax.summary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('tax.totalBetsPlaced')}</p>
                <p className="text-lg font-semibold">{formatCurrency(totalBets)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('tax.totalWinnings')}</p>
                <p className="text-lg font-semibold text-green-500">{formatCurrency(totalBets + netWinnings)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('tax.netProfit')}</p>
                <p className={`text-lg font-semibold ${netWinnings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(netWinnings)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('tax.winRate')}</p>
                <p className="text-lg font-semibold">{winRate.toFixed(0)}%</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('tax.marketsWon')}</p>
                <p className="text-lg font-semibold text-green-500">{wins.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('tax.marketsLost')}</p>
                <p className="text-lg font-semibold text-red-500">{losses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('tax.note')}:</strong> {t('tax.predictionTaxNote')}
          </AlertDescription>
        </Alert>

        {/* Winning Positions */}
        {wins.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                {t('tax.winningPositions')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {wins.slice(0, 5).map(event => (
                <Card key={event.id} className="bg-green-500/5 border-green-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="font-medium">{event.item_name}</span>
                      </div>
                      <span className="text-lg font-bold text-green-500">
                        +{formatCurrency(event.net_amount)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{t('tax.resolved')}: {format(new Date(event.event_date), 'MMM d, yyyy')}</p>
                      <p>{t('tax.betAmount')}: {formatCurrency(event.gross_amount)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {wins.length > 5 && (
                <Button variant="outline" className="w-full">
                  {t('tax.viewAllWinning', { count: wins.length })}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Losing Positions */}
        {losses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                {t('tax.losingPositions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t('tax.totalLost')}: {formatCurrency(Math.abs(losses.reduce((sum, e) => sum + Number(e.net_amount), 0)))} {t('tax.acrossMarkets', { count: losses.length })}
              </p>
              <p className="text-xs text-muted-foreground">
                ({t('tax.offsetsWinnings')})
              </p>
              <Button variant="outline" className="w-full mt-4">
                {t('tax.viewAllLosing', { count: losses.length })}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Data */}
        {(!events || events.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t('tax.noPredictionActivity', { year: selectedYear })}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}