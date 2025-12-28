-- Create property_updates table
CREATE TABLE public.property_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'property',
  update_type TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  is_major BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform_announcements table
CREATE TABLE public.platform_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  announcement_type TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  target_audience TEXT NOT NULL DEFAULT 'all',
  banner_image TEXT,
  action_url TEXT,
  action_text TEXT,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_dismissible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_news table
CREATE TABLE public.market_news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  source TEXT NOT NULL DEFAULT 'internal',
  source_name TEXT,
  source_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  tags JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_feed_preferences table
CREATE TABLE public.user_feed_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  show_property_updates BOOLEAN NOT NULL DEFAULT true,
  show_announcements BOOLEAN NOT NULL DEFAULT true,
  show_market_news BOOLEAN NOT NULL DEFAULT true,
  show_social_activity BOOLEAN NOT NULL DEFAULT true,
  properties_filter JSONB,
  categories_filter JSONB,
  email_digest TEXT NOT NULL DEFAULT 'weekly',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create update_reads table
CREATE TABLE public.update_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  update_id UUID NOT NULL,
  update_type TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, update_id, update_type)
);

-- Enable RLS on all tables
ALTER TABLE public.property_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feed_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_reads ENABLE ROW LEVEL SECURITY;

-- Property updates policies
CREATE POLICY "Anyone can view published property updates"
  ON public.property_updates FOR SELECT
  USING (published_at <= now());

CREATE POLICY "Admins can manage all property updates"
  ON public.property_updates FOR ALL
  USING (is_admin());

-- Platform announcements policies
CREATE POLICY "Anyone can view active announcements"
  ON public.platform_announcements FOR SELECT
  USING (starts_at <= now() AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage all announcements"
  ON public.platform_announcements FOR ALL
  USING (is_admin());

-- Market news policies
CREATE POLICY "Anyone can view published news"
  ON public.market_news FOR SELECT
  USING (published_at <= now());

CREATE POLICY "Admins can manage all news"
  ON public.market_news FOR ALL
  USING (is_admin());

-- User feed preferences policies
CREATE POLICY "Users can view their own preferences"
  ON public.user_feed_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_feed_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_feed_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Update reads policies
CREATE POLICY "Users can view their own read status"
  ON public.update_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark updates as read"
  ON public.update_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_property_updates_updated_at
  BEFORE UPDATE ON public.property_updates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_feed_preferences_updated_at
  BEFORE UPDATE ON public.user_feed_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();