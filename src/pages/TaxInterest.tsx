import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Landmark, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BottomNav } from '@/components/BottomNav';
import { useTaxableEvents } from '@/hooks/useTaxData';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

const currentYear = new Date().getFullYear();
const taxYears = [currentYear - 1, currentYear - 2, currentYear - 3];

export default function TaxInterest() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState(currentYear - 1);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  
  const { data: events, isLoading } = useTaxableEvents(selectedYear, 'interest');

  const total = events?.reduce((sum, e) => sum + Number(e.net_amount), 0) || 0;

  // Group by loan
  const groupedByLoan = events?.reduce((acc, event) => {
    if (!acc[event.item_id]) {
      acc[event.item_id] = {
        name: event.item_name,
        events: [],
        total: 0,
      };
    }
    acc[event.item_id].events.push(event);
    acc[event.item_id].total += Number(event.net_amount);
    return acc;
  }, {} as Record<string, { name: string; events: typeof events; total: number }>);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

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
              <Landmark className="h-5 w-5 text-primary" />
              {t('tax.interestIncome')} - {selectedYear}
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
            <p className="text-sm text-muted-foreground">{t('tax.total')}</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
          </div>
        </div>

        {/* By Loan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('tax.byLoan')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!events || events.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {t('tax.noInterestIncome', { year: selectedYear })}
              </p>
            ) : (
              Object.entries(groupedByLoan || {}).map(([id, data]) => (
                <Collapsible key={id} open={expandedItems.includes(id)}>
                  <Card className="bg-muted/30">
                    <CollapsibleTrigger asChild>
                      <CardContent 
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => toggleExpand(id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedItems.includes(id) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-semibold">🏦 {data.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {data.events.length} {t('tax.payments')} • {formatCurrency(data.total)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-4 pb-4">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('tax.date')}</TableHead>
                              <TableHead className="text-right">{t('tax.amount')}</TableHead>
                              <TableHead>{t('tax.status')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.events.map(event => (
                              <TableRow key={event.id}>
                                <TableCell>{format(new Date(event.event_date), 'MMM d')}</TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatCurrency(event.net_amount)}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{t('tax.paid')}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}