-- Create saved_searches table
CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  search_type TEXT NOT NULL DEFAULT 'all',
  filters JSONB NOT NULL DEFAULT '{}',
  sort_by TEXT,
  sort_order TEXT DEFAULT 'desc',
  notify_new_matches BOOLEAN DEFAULT false,
  last_run_at TIMESTAMP WITH TIME ZONE,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recent_searches table
CREATE TABLE public.recent_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  search_type TEXT NOT NULL DEFAULT 'all',
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create search_analytics table
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT,
  search_type TEXT NOT NULL DEFAULT 'all',
  filters JSONB DEFAULT '{}',
  results_count INTEGER DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Saved searches policies
CREATE POLICY "Users can view their own saved searches"
  ON public.saved_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved searches"
  ON public.saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches"
  ON public.saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches"
  ON public.saved_searches FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all saved searches"
  ON public.saved_searches FOR SELECT
  USING (is_admin());

-- Recent searches policies
CREATE POLICY "Users can view their own recent searches"
  ON public.recent_searches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recent searches"
  ON public.recent_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recent searches"
  ON public.recent_searches FOR DELETE
  USING (auth.uid() = user_id);

-- Search analytics policies (admins only for viewing, anyone can insert)
CREATE POLICY "Admins can view all search analytics"
  ON public.search_analytics FOR SELECT
  USING (is_admin());

CREATE POLICY "Anyone can create search analytics"
  ON public.search_analytics FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX idx_recent_searches_user_id ON public.recent_searches(user_id);
CREATE INDEX idx_recent_searches_created_at ON public.recent_searches(created_at DESC);
CREATE INDEX idx_search_analytics_query ON public.search_analytics(query);
CREATE INDEX idx_search_analytics_created_at ON public.search_analytics(created_at DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();