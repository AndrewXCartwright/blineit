import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, Calendar, Filter, Columns, LayoutGrid, FileOutput, Eye, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BottomNav } from '@/components/BottomNav';
import { useSavedReports, useReportExports } from '@/hooks/useReports';
import { toast } from 'sonner';

const reportCategories = [
  { id: 'portfolio', label: 'Portfolio Holdings' },
  { id: 'transactions', label: 'Transaction History' },
  { id: 'dividends', label: 'Dividend Income' },
  { id: 'interest', label: 'Interest Income' },
  { id: 'capital_gains', label: 'Capital Gains/Losses' },
  { id: 'predictions', label: 'Prediction Markets' },
  { id: 'secondary', label: 'Secondary Market Activity' },
  { id: 'combined', label: 'Combined (Multiple)' },
];

const dateRangePresets = [
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_quarter', label: 'This Quarter' },
  { id: 'this_year', label: 'This Year' },
  { id: 'last_year', label: 'Last Year' },
  { id: 'all_time', label: 'All Time' },
];

const portfolioColumns = [
  { id: 'property_name', label: 'Property Name', default: true },
  { id: 'asset_type', label: 'Asset Type', default: true },
  { id: 'tokens_held', label: 'Tokens Held', default: true },
  { id: 'cost_basis', label: 'Cost Basis', default: true },
  { id: 'current_value', label: 'Current Value', default: true },
  { id: 'unrealized_gain', label: 'Unrealized Gain/Loss', default: true },
  { id: 'unrealized_pct', label: 'Unrealized %', default: true },
  { id: 'apy', label: 'APY', default: true },
  { id: 'dividends_received', label: 'Dividends Received', default: true },
  { id: 'purchase_date', label: 'Purchase Date', default: false },
  { id: 'average_cost', label: 'Average Cost', default: false },
  { id: 'market_price', label: 'Market Price', default: false },
  { id: 'pct_portfolio', label: '% of Portfolio', default: false },
];

const ReportBuilder = () => {
  const { saveReport } = useSavedReports();
  const { createExport } = useReportExports();
  const [step, setStep] = useState(1);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('portfolio');
  const [datePreset, setDatePreset] = useState('this_year');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [comparePrevious, setComparePrevious] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    portfolioColumns.filter(c => c.default).map(c => c.id)
  );
  const [groupBy, setGroupBy] = useState('none');
  const [sortBy, setSortBy] = useState('property_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [includeSubtotals, setIncludeSubtotals] = useState(true);
  const [includeGrandTotal, setIncludeGrandTotal] = useState(true);
  const [format, setFormat] = useState<'pdf' | 'csv' | 'xlsx'>('pdf');
  const [pdfIncludeCharts, setPdfIncludeCharts] = useState(true);
  const [pdfIncludeSummary, setPdfIncludeSummary] = useState(true);
  const [pdfOrientation, setPdfOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pdfIncludeBranding, setPdfIncludeBranding] = useState(true);

  const toggleColumn = (columnId: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(c => c !== columnId)
        : [...prev, columnId]
    );
  };

  const handleSaveTemplate = async () => {
    if (!reportName) {
      toast.error('Please enter a report name');
      return;
    }

    await saveReport({
      name: reportName,
      reportType,
      filters: { dateFrom, dateTo },
      columns: selectedColumns,
      groupBy,
      sortBy,
      sortDirection,
      includeSubtotals,
      includeGrandTotal,
      format,
      pdfOptions: format === 'pdf' ? {
        includeCharts: pdfIncludeCharts,
        includeSummary: pdfIncludeSummary,
        orientation: pdfOrientation,
        includeBranding: pdfIncludeBranding,
      } : undefined,
    });
  };

  const handleGenerate = async () => {
    await createExport(reportType, format, {
      columns: selectedColumns,
      groupBy,
      sortBy,
      sortDirection,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/reports">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Custom Report Builder
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`flex items-center ${s < 6 ? 'flex-1' : ''}`}
            >
              <button
                onClick={() => setStep(s)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </button>
              {s < 6 && (
                <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Report Type */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileOutput className="h-5 w-5" />
                Step 1: Report Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Report Name</Label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="My Custom Report"
                />
              </div>
              <div>
                <Label>Select Report Category</Label>
                <RadioGroup value={reportType} onValueChange={setReportType} className="grid grid-cols-2 gap-2 mt-2">
                  {reportCategories.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={cat.id} id={cat.id} />
                      <Label htmlFor={cat.id} className="font-normal">{cat.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <Button onClick={() => setStep(2)}>Continue</Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Date Range */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Step 2: Date Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Quick Select</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dateRangePresets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant={datePreset === preset.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDatePreset(preset.id)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From</Label>
                  <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div>
                  <Label>To</Label>
                  <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="compare">Compare to previous period</Label>
                <Switch id="compare" checked={comparePrevious} onCheckedChange={setComparePrevious} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Continue</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Filters */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Step 3: Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Properties</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    <SelectItem value="sunset">Sunset Apartments</SelectItem>
                    <SelectItem value="marina">Marina Heights</SelectItem>
                    <SelectItem value="downtown">Downtown Tower</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Asset Types</Label>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm">All</Button>
                  <Button variant="outline" size="sm">Equity</Button>
                  <Button variant="outline" size="sm">Debt</Button>
                  <Button variant="outline" size="sm">Predictions</Button>
                </div>
              </div>
              <div>
                <Label>Minimum Amount</Label>
                <Input type="number" placeholder="$0" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={() => setStep(4)}>Continue</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Columns */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Columns className="h-5 w-5" />
                Step 4: Columns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedColumns(portfolioColumns.map(c => c.id))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedColumns([])}
                >
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {portfolioColumns.map((col) => (
                  <div key={col.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={col.id}
                      checked={selectedColumns.includes(col.id)}
                      onCheckedChange={() => toggleColumn(col.id)}
                    />
                    <Label htmlFor={col.id} className="font-normal">{col.label}</Label>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Drag to reorder columns (coming soon)</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={() => setStep(5)}>Continue</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Grouping & Sorting */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                Step 5: Grouping & Sorting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Group By</Label>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="asset_type">Asset Type</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="quarter">Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolioColumns.map((col) => (
                        <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Direction</Label>
                  <Select value={sortDirection} onValueChange={(v) => setSortDirection(v as 'asc' | 'desc')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="subtotals">Include subtotals</Label>
                  <Switch id="subtotals" checked={includeSubtotals} onCheckedChange={setIncludeSubtotals} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="grandtotal">Include grand total</Label>
                  <Switch id="grandtotal" checked={includeGrandTotal} onCheckedChange={setIncludeGrandTotal} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
                <Button onClick={() => setStep(6)}>Continue</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: Output Format */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileOutput className="h-5 w-5" />
                Step 6: Output Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Format</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={format === 'pdf' ? 'default' : 'outline'}
                    onClick={() => setFormat('pdf')}
                  >
                    PDF
                  </Button>
                  <Button
                    variant={format === 'csv' ? 'default' : 'outline'}
                    onClick={() => setFormat('csv')}
                  >
                    CSV
                  </Button>
                  <Button
                    variant={format === 'xlsx' ? 'default' : 'outline'}
                    onClick={() => setFormat('xlsx')}
                  >
                    Excel (.xlsx)
                  </Button>
                </div>
              </div>

              {format === 'pdf' && (
                <div className="space-y-3 p-4 bg-muted rounded-lg">
                  <p className="font-medium">PDF Options</p>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="charts">Include charts</Label>
                    <Switch id="charts" checked={pdfIncludeCharts} onCheckedChange={setPdfIncludeCharts} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="summary">Include summary</Label>
                    <Switch id="summary" checked={pdfIncludeSummary} onCheckedChange={setPdfIncludeSummary} />
                  </div>
                  <div>
                    <Label>Page Orientation</Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="sm"
                        variant={pdfOrientation === 'portrait' ? 'default' : 'outline'}
                        onClick={() => setPdfOrientation('portrait')}
                      >
                        Portrait
                      </Button>
                      <Button
                        size="sm"
                        variant={pdfOrientation === 'landscape' ? 'default' : 'outline'}
                        onClick={() => setPdfOrientation('landscape')}
                      >
                        Landscape
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="branding">Logo/branding</Label>
                    <Switch id="branding" checked={pdfIncludeBranding} onCheckedChange={setPdfIncludeBranding} />
                  </div>
                </div>
              )}

              {/* Preview */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Report will include {selectedColumns.length} columns, grouped by {groupBy === 'none' ? 'nothing' : groupBy}, 
                    sorted by {sortBy} ({sortDirection}).
                  </p>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(5)}>Back</Button>
                <Button variant="outline" onClick={handleSaveTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
                <Button onClick={handleGenerate}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ReportBuilder;
