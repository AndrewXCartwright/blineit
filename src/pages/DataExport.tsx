import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, FileArchive, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BottomNav } from '@/components/BottomNav';
import { useReportExports } from '@/hooks/useReports';
import { toast } from 'sonner';

const exportCategories = [
  { id: 'holdings', label: 'All Holdings', description: 'Current portfolio holdings' },
  { id: 'transactions', label: 'All Transactions', description: 'Complete transaction history' },
  { id: 'dividends', label: 'Dividend History', description: 'All dividend payments' },
  { id: 'interest', label: 'Interest Payments', description: 'All interest income' },
  { id: 'predictions', label: 'Prediction History', description: 'Betting history and results' },
  { id: 'secondary', label: 'Secondary Market Trades', description: 'P2P marketplace activity' },
];

const templates = [
  {
    id: 'investor_update',
    icon: '📊',
    title: 'Investor Update',
    description: 'Share your portfolio performance with partners',
    detail: 'Professional PDF with charts and summary',
  },
  {
    id: 'cpa_export',
    icon: '🧾',
    title: 'CPA Export',
    description: 'Tax-ready data for your accountant',
    detail: 'CSV with all tax-relevant transactions',
  },
  {
    id: 'year_review',
    icon: '📈',
    title: 'Year in Review',
    description: 'Annual performance summary',
    detail: 'Comprehensive PDF with yearly analysis',
  },
  {
    id: 'loan_summary',
    icon: '🏦',
    title: 'Loan Portfolio Summary',
    description: 'Debt investment performance',
    detail: 'Focus on interest income and loan status',
  },
];

const DataExport = () => {
  const { createExport } = useReportExports();
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['holdings', 'transactions']);
  const [dateRange, setDateRange] = useState('all_time');
  const [fileMode, setFileMode] = useState<'single' | 'separate'>('separate');
  const [fileFormat, setFileFormat] = useState('csv');
  const [exporting, setExporting] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setExporting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    for (const category of selectedCategories) {
      await createExport(category, fileFormat);
    }

    toast.success(
      fileMode === 'single'
        ? 'Export complete! Your file is ready for download.'
        : `Export complete! ${selectedCategories.length} files ready for download.`
    );
    setExporting(false);
  };

  const handleTemplateExport = async (templateId: string) => {
    await createExport(templateId, 'pdf');
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
                <Download className="h-5 w-5" />
                Export Your Data
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* What to Export */}
        <Card>
          <CardHeader>
            <CardTitle>What to Export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCategories.includes(cat.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => toggleCategory(cat.id)}
                >
                  <Checkbox
                    id={cat.id}
                    checked={selectedCategories.includes(cat.id)}
                    onCheckedChange={() => toggleCategory(cat.id)}
                  />
                  <div className="flex-1">
                    <Label htmlFor={cat.id} className="cursor-pointer font-medium">
                      {cat.label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                  </div>
                  {selectedCategories.includes(cat.id) && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="this_quarter">This Quarter</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>File Mode</Label>
              <RadioGroup value={fileMode} onValueChange={(v) => setFileMode(v as 'single' | 'separate')} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="font-normal">Single file (combined)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="separate" id="separate" />
                  <Label htmlFor="separate" className="font-normal">Separate files (one per category)</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>File Format</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={fileFormat === 'csv' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileFormat('csv')}
                >
                  CSV
                </Button>
                <Button
                  variant={fileFormat === 'xlsx' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileFormat('xlsx')}
                >
                  Excel
                </Button>
                <Button
                  variant={fileFormat === 'json' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFileFormat('json')}
                >
                  JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleExport}
          disabled={exporting || selectedCategories.length === 0}
        >
          {exporting ? (
            <>Exporting...</>
          ) : (
            <>
              <FileArchive className="h-4 w-4 mr-2" />
              Export Selected Data
              {fileMode === 'separate' && selectedCategories.length > 1 && ` (${selectedCategories.length} files)`}
            </>
          )}
        </Button>

        {/* Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
            <CardDescription>Pre-built reports for common use cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleTemplateExport(template.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{template.title}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{template.detail}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">Use Template</Button>
                      <Button size="sm" variant="ghost">Customize</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default DataExport;
