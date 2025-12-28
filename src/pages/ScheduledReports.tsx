import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Play, Pause, Trash2, Edit, Plus, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/BottomNav';
import { useScheduledReports } from '@/hooks/useReports';
import { format, formatDistanceToNow } from 'date-fns';

const reportTypeIcons: Record<string, string> = {
  portfolio: '📈',
  dividends: '💰',
  transactions: '📋',
  tax: '🧾',
  performance: '📊',
  loans: '🏦',
};

const ScheduledReports = () => {
  const { scheduled, loading, toggleSchedule, deleteSchedule } = useScheduledReports();

  const frequencyLabels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/reports">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Scheduled Reports
                </h1>
              </div>
            </div>
            <Link to="/reports/builder">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Schedule New
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading scheduled reports...</p>
          </div>
        ) : scheduled.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Scheduled Reports</h3>
              <p className="text-muted-foreground mb-4">
                Schedule reports to receive them automatically
              </p>
              <Link to="/reports/builder">
                <Button>Create Schedule</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          scheduled.map((schedule) => (
            <Card key={schedule.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">
                      {reportTypeIcons[schedule.saved_report?.report_type || 'portfolio']}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground">
                          {schedule.saved_report?.name || 'Unnamed Report'}
                        </h3>
                        <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                          {schedule.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {frequencyLabels[schedule.frequency]}
                        </span>
                        {schedule.day_of_month && (
                          <span>Day {schedule.day_of_month}</span>
                        )}
                        <span>{schedule.time_of_day.slice(0, 5)}</span>
                        <span className="uppercase">
                          {schedule.saved_report?.format || 'PDF'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Next: {format(new Date(schedule.next_send_at), 'MMM d, yyyy')}
                        </span>
                        {schedule.last_sent_at && (
                          <span className="text-muted-foreground">
                            Last sent: {formatDistanceToNow(new Date(schedule.last_sent_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {schedule.email_delivery && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          Email delivery enabled
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSchedule(schedule.id, !schedule.is_active)}
                    >
                      {schedule.is_active ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSchedule(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ScheduledReports;
