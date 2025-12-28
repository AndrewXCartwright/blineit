
-- Create watchlists table
CREATE TABLE public.watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  item_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create watchlist_items table
CREATE TABLE public.watchlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('property', 'loan', 'prediction')),
  item_id UUID NOT NULL,
  notes TEXT,
  target_price DECIMAL,
  added_price DECIMAL NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(watchlist_id, item_id)
);

-- Create price_alerts table
CREATE TABLE public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('property', 'loan', 'prediction')),
  item_id UUID NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'price_change_percent', 'apy_above', 'apy_below', 'funding_above', 'odds_above', 'odds_below')),
  threshold_value DECIMAL NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  trigger_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alert_history table
CREATE TABLE public.alert_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.price_alerts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  threshold_value DECIMAL NOT NULL,
  actual_value DECIMAL NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;

-- Watchlists policies
CREATE POLICY "Users can view their own watchlists" ON public.watchlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own watchlists" ON public.watchlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own watchlists" ON public.watchlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watchlists" ON public.watchlists FOR DELETE USING (auth.uid() = user_id);

-- Watchlist items policies
CREATE POLICY "Users can view their own watchlist items" ON public.watchlist_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own watchlist items" ON public.watchlist_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own watchlist items" ON public.watchlist_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watchlist items" ON public.watchlist_items FOR DELETE USING (auth.uid() = user_id);

-- Price alerts policies
CREATE POLICY "Users can view their own price alerts" ON public.price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own price alerts" ON public.price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own price alerts" ON public.price_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own price alerts" ON public.price_alerts FOR DELETE USING (auth.uid() = user_id);

-- Alert history policies
CREATE POLICY "Users can view their own alert history" ON public.alert_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own alert history" ON public.alert_history FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies
CREATE POLICY "Admins can view all watchlists" ON public.watchlists FOR SELECT USING (is_admin());
CREATE POLICY "Admins can view all price alerts" ON public.price_alerts FOR SELECT USING (is_admin());
CREATE POLICY "Admins can view all alert history" ON public.alert_history FOR SELECT USING (is_admin());

-- Indexes for performance
CREATE INDEX idx_watchlists_user_id ON public.watchlists(user_id);
CREATE INDEX idx_watchlist_items_watchlist_id ON public.watchlist_items(watchlist_id);
CREATE INDEX idx_watchlist_items_user_id ON public.watchlist_items(user_id);
CREATE INDEX idx_watchlist_items_item ON public.watchlist_items(item_type, item_id);
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_item ON public.price_alerts(item_type, item_id);
CREATE INDEX idx_price_alerts_active ON public.price_alerts(is_active) WHERE is_active = true;
CREATE INDEX idx_alert_history_user_id ON public.alert_history(user_id);
CREATE INDEX idx_alert_history_alert_id ON public.alert_history(alert_id);

-- Trigger for updating watchlist item count
CREATE OR REPLACE FUNCTION public.update_watchlist_item_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.watchlists SET item_count = item_count + 1, updated_at = now() WHERE id = NEW.watchlist_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.watchlists SET item_count = GREATEST(0, item_count - 1), updated_at = now() WHERE id = OLD.watchlist_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_watchlist_count
AFTER INSERT OR DELETE ON public.watchlist_items
FOR EACH ROW EXECUTE FUNCTION public.update_watchlist_item_count();

-- Function to create default watchlist for new users
CREATE OR REPLACE FUNCTION public.ensure_default_watchlist(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_watchlist_id UUID;
BEGIN
  SELECT id INTO v_watchlist_id FROM public.watchlists WHERE user_id = p_user_id AND is_default = true;
  
  IF v_watchlist_id IS NULL THEN
    INSERT INTO public.watchlists (user_id, name, is_default)
    VALUES (p_user_id, 'My Watchlist', true)
    RETURNING id INTO v_watchlist_id;
  END IF;
  
  RETURN v_watchlist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
