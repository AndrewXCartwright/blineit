-- Create api_keys table
CREATE TABLE public.api_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  environment text NOT NULL DEFAULT 'sandbox',
  rate_limit_tier text NOT NULL DEFAULT 'free',
  requests_today integer NOT NULL DEFAULT 0,
  requests_this_month integer NOT NULL DEFAULT 0,
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  ip_whitelist jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create api_requests_log table
CREATE TABLE public.api_requests_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id uuid NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer NOT NULL,
  response_time_ms integer NOT NULL DEFAULT 0,
  ip_address text,
  user_agent text,
  request_body jsonb,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create api_webhooks table
CREATE TABLE public.api_webhooks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  secret text NOT NULL,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  last_triggered_at timestamp with time zone,
  failure_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create webhook_deliveries table
CREATE TABLE public.webhook_deliveries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id uuid NOT NULL REFERENCES public.api_webhooks(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  status_code integer,
  response_body text,
  attempts integer NOT NULL DEFAULT 0,
  next_retry_at timestamp with time zone,
  delivered_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create api_applications table (for OAuth apps)
CREATE TABLE public.api_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  website_url text,
  logo_url text,
  oauth_client_id text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  oauth_client_secret_hash text,
  redirect_uris jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_requests_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Users can view their own API keys" ON public.api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own API keys" ON public.api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own API keys" ON public.api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own API keys" ON public.api_keys FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all API keys" ON public.api_keys FOR SELECT USING (is_admin());

-- RLS Policies for api_requests_log
CREATE POLICY "Users can view their own API logs" ON public.api_requests_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all API logs" ON public.api_requests_log FOR SELECT USING (is_admin());

-- RLS Policies for api_webhooks
CREATE POLICY "Users can view their own webhooks" ON public.api_webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own webhooks" ON public.api_webhooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own webhooks" ON public.api_webhooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own webhooks" ON public.api_webhooks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all webhooks" ON public.api_webhooks FOR SELECT USING (is_admin());

-- RLS Policies for webhook_deliveries
CREATE POLICY "Users can view their webhook deliveries" ON public.webhook_deliveries FOR SELECT 
USING (EXISTS (SELECT 1 FROM api_webhooks WHERE api_webhooks.id = webhook_deliveries.webhook_id AND api_webhooks.user_id = auth.uid()));
CREATE POLICY "Admins can view all webhook deliveries" ON public.webhook_deliveries FOR SELECT USING (is_admin());

-- RLS Policies for api_applications
CREATE POLICY "Users can view their own applications" ON public.api_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own applications" ON public.api_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own applications" ON public.api_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own applications" ON public.api_applications FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all applications" ON public.api_applications FOR ALL USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_requests_log_api_key_id ON public.api_requests_log(api_key_id);
CREATE INDEX idx_api_requests_log_user_id ON public.api_requests_log(user_id);
CREATE INDEX idx_api_requests_log_created_at ON public.api_requests_log(created_at DESC);
CREATE INDEX idx_api_webhooks_user_id ON public.api_webhooks(user_id);
CREATE INDEX idx_webhook_deliveries_webhook_id ON public.webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON public.webhook_deliveries(status);

-- Create trigger for updated_at
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_api_webhooks_updated_at BEFORE UPDATE ON public.api_webhooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_api_applications_updated_at BEFORE UPDATE ON public.api_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();