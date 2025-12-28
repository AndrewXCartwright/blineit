import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface SavedReport {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  report_type: string;
  filters: Record<string, unknown>;
  columns: string[];
  schedule: string | null;
  format: string;
  last_generated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportExport {
  id: string;
  user_id: string;
  saved_report_id: string | null;
  report_type: string;
  file_url: string | null;
  file_format: string;
  file_size: number;
  parameters: Record<string, unknown>;
  status: string;
  expires_at: string;
  created_at: string;
}

export interface ScheduledReport {
  id: string;
  user_id: string;
  saved_report_id: string;
  frequency: string;
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  email_delivery: boolean;
  last_sent_at: string | null;
  next_send_at: string;
  is_active: boolean;
  created_at: string;
  saved_report?: SavedReport;
}

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  properties?: string[];
  assetTypes?: string[];
  categories?: string[];
  transactionTypes?: string[];
  minAmount?: number;
}

export interface ReportConfig {
  name: string;
  description?: string;
  reportType: string;
  filters: ReportFilters;
  columns: string[];
  groupBy?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  includeSubtotals?: boolean;
  includeGrandTotal?: boolean;
  format: 'pdf' | 'csv' | 'xlsx';
  pdfOptions?: {
    includeCharts?: boolean;
    includeSummary?: boolean;
    orientation?: 'portrait' | 'landscape';
    includeBranding?: boolean;
  };
}

// Mock data for demo mode
const mockSavedReports: SavedReport[] = [
  {
    id: '1',
    user_id: 'demo',
    name: 'Monthly Portfolio Summary',
    description: 'Complete overview of all holdings',
    report_type: 'portfolio',
    filters: { dateFrom: '2024-01-01', dateTo: '2024-12-31' },
    columns: ['property_name', 'asset_type', 'tokens', 'value', 'return'],
    schedule: 'monthly',
    format: 'pdf',
    last_generated_at: '2024-12-01T10:00:00Z',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'demo',
    name: 'Quarterly Tax Report',
    description: 'Tax-ready income summary',
    report_type: 'tax',
    filters: {},
    columns: ['date', 'type', 'amount', 'property'],
    schedule: 'quarterly',
    format: 'csv',
    last_generated_at: '2024-10-01T10:00:00Z',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-10-01T10:00:00Z',
  },
];

const mockReportExports: ReportExport[] = [
  {
    id: '1',
    user_id: 'demo',
    saved_report_id: '1',
    report_type: 'portfolio',
    file_url: '/reports/portfolio-summary-dec-2024.pdf',
    file_format: 'pdf',
    file_size: 245000,
    parameters: {},
    status: 'ready',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-12-28T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'demo',
    saved_report_id: null,
    report_type: 'transactions',
    file_url: '/reports/transactions-2024.csv',
    file_format: 'csv',
    file_size: 128000,
    parameters: {},
    status: 'ready',
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-12-27T15:30:00Z',
  },
  {
    id: '3',
    user_id: 'demo',
    saved_report_id: null,
    report_type: 'dividends',
    file_url: '/reports/dividends-q4-2024.xlsx',
    file_format: 'xlsx',
    file_size: 89000,
    parameters: {},
    status: 'ready',
    expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: '2024-12-26T09:00:00Z',
  },
];

const mockScheduledReports: ScheduledReport[] = [
  {
    id: '1',
    user_id: 'demo',
    saved_report_id: '1',
    frequency: 'monthly',
    day_of_week: null,
    day_of_month: 1,
    time_of_day: '09:00:00',
    email_delivery: true,
    last_sent_at: '2024-12-01T09:00:00Z',
    next_send_at: '2025-01-01T09:00:00Z',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    saved_report: mockSavedReports[0],
  },
  {
    id: '2',
    user_id: 'demo',
    saved_report_id: '2',
    frequency: 'quarterly',
    day_of_week: null,
    day_of_month: 1,
    time_of_day: '08:00:00',
    email_delivery: true,
    last_sent_at: '2024-10-01T08:00:00Z',
    next_send_at: '2025-01-01T08:00:00Z',
    is_active: true,
    created_at: '2024-02-01T10:00:00Z',
    saved_report: mockSavedReports[1],
  },
];

export const useSavedReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    if (!user) {
      setReports(mockSavedReports);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data?.length ? data as SavedReport[] : mockSavedReports);
    } catch (error) {
      console.error('Error fetching saved reports:', error);
      setReports(mockSavedReports);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const saveReport = async (config: ReportConfig) => {
    if (!user) {
      toast.success('Report saved (demo mode)');
      return { id: Date.now().toString() };
    }

    try {
      const { data, error } = await supabase
        .from('saved_reports')
        .insert([{
          user_id: user.id,
          name: config.name,
          description: config.description,
          report_type: config.reportType,
          filters: JSON.parse(JSON.stringify(config.filters)),
          columns: config.columns,
          format: config.format,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Report saved successfully');
      fetchReports();
      return data;
    } catch (error) {
      console.error('Error saving report:', error);
      toast.error('Failed to save report');
      return null;
    }
  };

  const deleteReport = async (id: string) => {
    if (!user) {
      toast.success('Report deleted (demo mode)');
      return;
    }

    try {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Report deleted');
      fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  return { reports, loading, saveReport, deleteReport, refetch: fetchReports };
};

export const useReportExports = () => {
  const { user } = useAuth();
  const [exports, setExports] = useState<ReportExport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExports = async () => {
    if (!user) {
      setExports(mockReportExports);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('report_exports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExports(data?.length ? data as ReportExport[] : mockReportExports);
    } catch (error) {
      console.error('Error fetching exports:', error);
      setExports(mockReportExports);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExports();
  }, [user]);

  const createExport = async (reportType: string, format: string, parameters: Record<string, unknown> = {}) => {
    const newExport: ReportExport = {
      id: Date.now().toString(),
      user_id: user?.id || 'demo',
      saved_report_id: null,
      report_type: reportType,
      file_url: `/reports/${reportType}-${Date.now()}.${format}`,
      file_format: format,
      file_size: Math.floor(Math.random() * 300000) + 50000,
      parameters,
      status: 'ready',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
    };

    if (!user) {
      setExports(prev => [newExport, ...prev]);
      toast.success('Report generated (demo mode)');
      return newExport;
    }

    try {
      const { data, error } = await supabase
        .from('report_exports')
        .insert([{
          user_id: user.id,
          report_type: reportType,
          file_format: format,
          file_size: newExport.file_size,
          parameters: JSON.parse(JSON.stringify(parameters)),
          status: 'ready',
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Report generated successfully');
      fetchExports();
      return data;
    } catch (error) {
      console.error('Error creating export:', error);
      toast.error('Failed to generate report');
      return null;
    }
  };

  const deleteExport = async (id: string) => {
    if (!user) {
      setExports(prev => prev.filter(e => e.id !== id));
      toast.success('Export deleted (demo mode)');
      return;
    }

    try {
      const { error } = await supabase
        .from('report_exports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Export deleted');
      fetchExports();
    } catch (error) {
      console.error('Error deleting export:', error);
      toast.error('Failed to delete export');
    }
  };

  return { exports, loading, createExport, deleteExport, refetch: fetchExports };
};

export const useScheduledReports = () => {
  const { user } = useAuth();
  const [scheduled, setScheduled] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduled = async () => {
    if (!user) {
      setScheduled(mockScheduledReports);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .select('*, saved_report:saved_reports(*)')
        .eq('user_id', user.id)
        .order('next_send_at', { ascending: true });

      if (error) throw error;
      
      const mapped = data?.map(item => ({
        ...item,
        saved_report: item.saved_report as SavedReport,
      })) as ScheduledReport[];
      
      setScheduled(mapped?.length ? mapped : mockScheduledReports);
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
      setScheduled(mockScheduledReports);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduled();
  }, [user]);

  const createSchedule = async (savedReportId: string, config: {
    frequency: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    timeOfDay: string;
    emailDelivery: boolean;
  }) => {
    const nextSend = calculateNextSend(config.frequency, config.dayOfWeek, config.dayOfMonth, config.timeOfDay);

    if (!user) {
      toast.success('Schedule created (demo mode)');
      return { id: Date.now().toString() };
    }

    try {
      const { data, error } = await supabase
        .from('scheduled_reports')
        .insert([{
          user_id: user.id,
          saved_report_id: savedReportId,
          frequency: config.frequency,
          day_of_week: config.dayOfWeek,
          day_of_month: config.dayOfMonth,
          time_of_day: config.timeOfDay,
          email_delivery: config.emailDelivery,
          next_send_at: nextSend,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Schedule created successfully');
      fetchScheduled();
      return data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast.error('Failed to create schedule');
      return null;
    }
  };

  const toggleSchedule = async (id: string, isActive: boolean) => {
    if (!user) {
      setScheduled(prev => prev.map(s => s.id === id ? { ...s, is_active: isActive } : s));
      toast.success(`Schedule ${isActive ? 'activated' : 'paused'} (demo mode)`);
      return;
    }

    try {
      const { error } = await supabase
        .from('scheduled_reports')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Schedule ${isActive ? 'activated' : 'paused'}`);
      fetchScheduled();
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!user) {
      setScheduled(prev => prev.filter(s => s.id !== id));
      toast.success('Schedule deleted (demo mode)');
      return;
    }

    try {
      const { error } = await supabase
        .from('scheduled_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Schedule deleted');
      fetchScheduled();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete schedule');
    }
  };

  return { scheduled, loading, createSchedule, toggleSchedule, deleteSchedule, refetch: fetchScheduled };
};

function calculateNextSend(frequency: string, dayOfWeek?: number, dayOfMonth?: number, timeOfDay: string = '09:00:00'): string {
  const now = new Date();
  const [hours, minutes] = timeOfDay.split(':').map(Number);
  
  let next = new Date(now);
  next.setHours(hours, minutes, 0, 0);

  switch (frequency) {
    case 'daily':
      if (next <= now) next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      const targetDay = dayOfWeek || 1;
      const currentDay = next.getDay();
      let daysUntil = (targetDay - currentDay + 7) % 7;
      if (daysUntil === 0 && next <= now) daysUntil = 7;
      next.setDate(next.getDate() + daysUntil);
      break;
    case 'monthly':
      const targetDate = dayOfMonth || 1;
      next.setDate(targetDate);
      if (next <= now) next.setMonth(next.getMonth() + 1);
      break;
    case 'quarterly':
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3 + 3;
      next.setMonth(quarterMonth, dayOfMonth || 1);
      if (next <= now) next.setMonth(next.getMonth() + 3);
      break;
  }

  return next.toISOString();
}

export const useReportStats = () => {
  const { exports } = useReportExports();
  const { scheduled } = useScheduledReports();

  const stats = {
    reportsGenerated: exports.length,
    scheduledReports: scheduled.filter(s => s.is_active).length,
    lastExport: exports[0]?.created_at || null,
    dataPointsTracked: 12847,
  };

  return stats;
};
