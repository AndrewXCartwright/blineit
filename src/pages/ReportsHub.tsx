import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, FileText, Calendar, Download, Clock, Trash2, Eye, Edit, TrendingUp, DollarSign, Receipt, PieChart, Wallet, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { useSavedReports, useReportExports, useReportStats } from '@/hooks/useReports';
import { formatDistanceToNow } from 'date-fns';
import { ScheduleReportModal } from '@/components/reports/ScheduleReportModal';

const quickReports = [
  { id: 'portfolio', icon: TrendingUp, title: 'Portfolio Summary', description: 'Complete overview of all holdings', color: 'text-blue-500' },
  { id: 'dividends', icon: DollarSign, title: 'Dividend Report', description: 'All dividend payments received', color: 'text-green-500' },
  { id: 'transactions', icon: Receipt, title: 'Transaction History', description: 'Complete transaction record', color: 'text-purple-500' },
  { id: 'tax', icon: FileText, title: 'Tax Report', description: 'Tax-ready income summary', color: 'text-orange-500' },
  { id: 'performance', icon: PieChart, title: 'Performance Analysis', description: 'Returns, IRR, and benchmarks', color: 'text-cyan-500' },
  { id: 'loans', icon: Building, title: 'Loan Portfolio', description: 'Debt investments summary', color: 'text-pink-500' },
];

const ReportsHub = () => {
  const { reports, loading: reportsLoading, deleteReport } = useSavedReports();
  const { exports, loading: exportsLoading, createExport, deleteExport } = useReportExports();
  const stats = useReportStats();
  const [scheduleModal, setScheduleModal] = useState<{ open: boolean; reportType: string }>({ open: false, reportType: '' });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleGenerateReport = async (reportType: string) => {
    await createExport(reportType, 'pdf');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/assets">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Reports & Analytics
              </h1>
              <p className="text-sm text-muted-foreground">Generate insights and export your data</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.reportsGenerated}</p>
              <p className="text-xs text-muted-foreground">Reports Generated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.scheduledReports}</p>
              <p className="text-xs text-muted-foreground">Scheduled Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {stats.lastExport ? formatDistanceToNow(new Date(stats.lastExport), { addSuffix: true }) : 'Never'}
              </p>
              <p className="text-xs text-muted-foreground">Last Export</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <p className="text-2xl font-bold text-foreground">{stats.dataPointsTracked.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Data Points</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Quick Reports</h2>
            <Link to="/reports/builder">
              <Button variant="outline" size="sm">
                Custom Report
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickReports.map((report) => (
              <Card key={report.id} className="hover:bg-muted/50 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <report.icon className={`h-8 w-8 ${report.color}`} />
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{report.title}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={() => handleGenerateReport(report.id)}>
                          Generate
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setScheduleModal({ open: true, reportType: report.id })}>
                          <Calendar className="h-3 w-3 mr-1" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Saved Reports */}
        {reports.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Saved Reports</h2>
            <div className="space-y-2">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground">{report.name}</p>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                        </div>
                        <Badge variant="secondary">{report.report_type}</Badge>
                        {report.schedule && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {report.schedule}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleGenerateReport(report.report_type)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteReport(report.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recent Exports */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recent Exports</h2>
          <Card>
            <CardContent className="p-0">
              {exports.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No exports yet</p>
              ) : (
                <div className="divide-y divide-border">
                  {exports.map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-foreground capitalize">{exp.report_type} Report</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(exp.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{exp.file_format.toUpperCase()}</Badge>
                        <span className="text-sm text-muted-foreground">{formatFileSize(exp.file_size)}</span>
                        <Badge variant={exp.status === 'ready' ? 'default' : 'secondary'}>{exp.status}</Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" disabled={exp.status !== 'ready'}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteExport(exp.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground mt-2">Exports expire after 7 days</p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/reports/builder">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-4 text-center">
                <Edit className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Report Builder</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/reports/scheduled">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-4 text-center">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Scheduled Reports</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/reports/analytics">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-4 text-center">
                <PieChart className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Analytics</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/reports/export">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="py-4 text-center">
                <Download className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Export Data</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <ScheduleReportModal
        open={scheduleModal.open}
        onClose={() => setScheduleModal({ open: false, reportType: '' })}
        reportType={scheduleModal.reportType}
      />

      <BottomNav />
    </div>
  );
};

export default ReportsHub;
