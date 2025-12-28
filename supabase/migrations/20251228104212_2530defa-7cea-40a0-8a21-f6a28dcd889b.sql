
-- Create saved_reports table
CREATE TABLE public.saved_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  columns JSONB DEFAULT '[]'::jsonb,
  schedule TEXT,
  format TEXT NOT NULL DEFAULT 'pdf',
  last_generated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report_exports table
CREATE TABLE public.report_exports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  saved_report_id UUID REFERENCES public.saved_reports(id) ON DELETE SET NULL,
  report_type TEXT NOT NULL,
  file_url TEXT,
  file_format TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  parameters JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'generating',
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled_reports table
CREATE TABLE public.scheduled_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  saved_report_id UUID NOT NULL REFERENCES public.saved_reports(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL,
  day_of_week INTEGER,
  day_of_month INTEGER,
  time_of_day TIME NOT NULL DEFAULT '09:00:00',
  email_delivery BOOLEAN NOT NULL DEFAULT true,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_reports
CREATE POLICY "Users can view their own saved reports" ON public.saved_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved reports" ON public.saved_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved reports" ON public.saved_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved reports" ON public.saved_reports
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all saved reports" ON public.saved_reports
  FOR ALL USING (is_admin());

-- RLS Policies for report_exports
CREATE POLICY "Users can view their own exports" ON public.report_exports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exports" ON public.report_exports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exports" ON public.report_exports
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all exports" ON public.report_exports
  FOR ALL USING (is_admin());

-- RLS Policies for scheduled_reports
CREATE POLICY "Users can view their own scheduled reports" ON public.scheduled_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled reports" ON public.scheduled_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled reports" ON public.scheduled_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled reports" ON public.scheduled_reports
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all scheduled reports" ON public.scheduled_reports
  FOR ALL USING (is_admin());

-- Create updated_at trigger for saved_reports
CREATE TRIGGER update_saved_reports_updated_at
  BEFORE UPDATE ON public.saved_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
