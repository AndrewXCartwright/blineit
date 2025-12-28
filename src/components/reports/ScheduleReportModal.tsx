import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSavedReports, useScheduledReports } from '@/hooks/useReports';
import { toast } from 'sonner';

interface ScheduleReportModalProps {
  open: boolean;
  onClose: () => void;
  reportType: string;
  savedReportId?: string;
}

export const ScheduleReportModal = ({ open, onClose, reportType, savedReportId }: ScheduleReportModalProps) => {
  const { saveReport } = useSavedReports();
  const { createSchedule } = useScheduledReports();
  const [frequency, setFrequency] = useState('monthly');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [timeOfDay, setTimeOfDay] = useState('09:00');
  const [emailDelivery, setEmailDelivery] = useState(true);
  const [saveToHub, setSaveToHub] = useState(true);
  const [format, setFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);

  const handleSchedule = async () => {
    setLoading(true);
    try {
      // First save the report if no savedReportId
      let reportId = savedReportId;
      if (!reportId) {
        const saved = await saveReport({
          name: `Scheduled ${reportType} Report`,
          reportType,
          filters: {},
          columns: [],
          format: format as 'pdf' | 'csv' | 'xlsx',
        });
        reportId = saved?.id;
      }

      if (reportId) {
        await createSchedule(reportId, {
          frequency,
          dayOfWeek: frequency === 'weekly' ? parseInt(dayOfWeek) : undefined,
          dayOfMonth: frequency === 'monthly' || frequency === 'quarterly' ? parseInt(dayOfMonth) : undefined,
          timeOfDay: `${timeOfDay}:00`,
          emailDelivery,
        });
      }
      onClose();
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast.error('Failed to schedule report');
    } finally {
      setLoading(false);
    }
  };

  const reportTypeLabels: Record<string, string> = {
    portfolio: 'Portfolio Summary',
    dividends: 'Dividend Report',
    transactions: 'Transaction History',
    tax: 'Tax Report',
    performance: 'Performance Analysis',
    loans: 'Loan Portfolio',
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule This Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label className="text-sm text-muted-foreground">Report</Label>
            <p className="font-medium">{reportTypeLabels[reportType] || reportType}</p>
          </div>

          <div className="space-y-3">
            <Label>Frequency</Label>
            <RadioGroup value={frequency} onValueChange={setFrequency} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="font-normal">Daily (every day at {timeOfDay})</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="font-normal flex items-center gap-2">
                  Weekly (every
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek} disabled={frequency !== 'weekly'}>
                    <SelectTrigger className="w-28 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                  at {timeOfDay})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly" className="font-normal flex items-center gap-2">
                  Monthly (on day
                  <Select value={dayOfMonth} onValueChange={setDayOfMonth} disabled={frequency !== 'monthly'}>
                    <SelectTrigger className="w-16 h-7">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  at {timeOfDay})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarterly" id="quarterly" />
                <Label htmlFor="quarterly" className="font-normal">Quarterly (Jan 1, Apr 1, Jul 1, Oct 1)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Time</Label>
            <Select value={timeOfDay} onValueChange={setTimeOfDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => {
                  const hour = i.toString().padStart(2, '0');
                  return (
                    <SelectItem key={i} value={`${hour}:00`}>{hour}:00</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Delivery</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="email" className="font-normal">Email to: user@example.com</Label>
                <Switch id="email" checked={emailDelivery} onCheckedChange={setEmailDelivery} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="hub" className="font-normal">Save to Reports Hub</Label>
                <Switch id="hub" checked={saveToHub} onCheckedChange={setSaveToHub} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSchedule} disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
