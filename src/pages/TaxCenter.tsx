import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Eye, Settings, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { useTaxDocuments, useTaxSummary, useGenerateTaxDocuments } from '@/hooks/useTaxData';
import { formatCurrency } from '@/lib/formatters';

const currentYear = new Date().getFullYear();
const taxYears = [currentYear - 1, currentYear - 2, currentYear - 3];

export default function TaxCenter() {
  const navigate = useNavigate();
  const [selectedYear, setSelectedYear] = useState(currentYear - 1);
  
  const { data: documents, isLoading: docsLoading } = useTaxDocuments(selectedYear);
  const { data: summary, isLoading: summaryLoading } = useTaxSummary(selectedYear);
  const generateDocs = useGenerateTaxDocuments();

  const getDocumentInfo = (docType: string) => {
    switch (docType) {
      case '1099-DIV':
        return { 
          title: 'Form 1099-DIV', 
          subtitle: 'Dividends and Distributions',
          amount: summary?.dividends || 0
        };
      case '1099-INT':
        return { 
          title: 'Form 1099-INT', 
          subtitle: 'Interest Income',
          amount: summary?.interest || 0
        };
      case '1099-MISC':
        return { 
          title: 'Form 1099-MISC', 
          subtitle: 'Miscellaneous Income (Prediction Winnings)',
          amount: summary?.predictionWinnings || 0
        };
      case '1099-B':
        return { 
          title: 'Form 1099-B', 
          subtitle: 'Proceeds from Broker Transactions',
          amount: summary?.netCapitalGainLoss || 0
        };
      case 'tax_summary':
        return { 
          title: 'Tax Summary Report', 
          subtitle: 'Complete summary of all taxable events',
          amount: summary?.totalIncome || 0
        };
      default:
        return { title: docType, subtitle: '', amount: 0 };
    }
  };

  const handleGenerateDocuments = () => {
    generateDocs.mutate(selectedYear);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Tax Center
              </h1>
              <p className="text-sm text-muted-foreground">
                Access your tax documents and history
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => navigate('/tax/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Year Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Tax Year:</span>
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

        {/* Summary Stats */}
        {summaryLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-16 mb-2" />
                  <div className="h-6 bg-muted rounded w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/tax/dividends')}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Dividends Received</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(summary?.dividends || 0)}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/tax/interest')}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Interest Received</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(summary?.interest || 0)}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/tax/predictions')}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Prediction Winnings</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(summary?.predictionWinnings || 0)}</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/tax/capital-gains')}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Capital Gains</p>
                <p className={`text-lg font-bold ${(summary?.netCapitalGainLoss || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {(summary?.netCapitalGainLoss || 0) >= 0 ? '+' : ''}{formatCurrency(summary?.netCapitalGainLoss || 0)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generate Documents Button */}
        {(!documents || documents.length === 0) && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No Tax Documents Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate your {selectedYear} tax documents to view and download them.
              </p>
              <Button onClick={handleGenerateDocuments} disabled={generateDocs.isPending}>
                {generateDocs.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Tax Documents
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tax Documents List */}
        {documents && documents.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tax Documents
              </h2>
              <Button variant="outline" size="sm" onClick={handleGenerateDocuments} disabled={generateDocs.isPending}>
                <RefreshCw className={`h-4 w-4 mr-2 ${generateDocs.isPending ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>

            <div className="space-y-3">
              {documents.map(doc => {
                const info = getDocumentInfo(doc.document_type);
                return (
                  <Card key={doc.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <FileText className="h-8 w-8 text-primary mt-1" />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{info.title}</h3>
                              <Badge variant={doc.status === 'ready' ? 'default' : 'secondary'}>
                                {doc.status === 'ready' ? '✓ Ready' : doc.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{info.subtitle}</p>
                            {doc.document_type !== 'tax_summary' && (
                              <p className="text-sm font-medium mt-1">
                                Total: {formatCurrency(info.amount)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {doc.status === 'ready' && (
                        <div className="flex gap-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/tax/view/${doc.document_type}?year=${selectedYear}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Download PDF
                          </Button>
                          {doc.document_type === 'tax_summary' && (
                            <Button variant="outline" size="sm">
                              Export CSV
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Download All */}
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download All Documents (ZIP)
            </Button>
          </div>
        )}

        {/* Quick Links */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/tax/summary')}>
              <CardContent className="p-4">
                <h3 className="font-medium">Tax Summary</h3>
                <p className="text-xs text-muted-foreground">Complete overview</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate('/tax/cost-basis')}>
              <CardContent className="p-4">
                <h3 className="font-medium">Cost Basis</h3>
                <p className="text-xs text-muted-foreground">Track your basis</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
