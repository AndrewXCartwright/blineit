
-- Add language/locale preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS preferred_currency text DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS preferred_date_format text DEFAULT 'MM/DD/YYYY',
ADD COLUMN IF NOT EXISTS preferred_number_format text DEFAULT 'en-US';

-- Create supported_languages table
CREATE TABLE IF NOT EXISTS public.supported_languages (
  code text PRIMARY KEY,
  name text NOT NULL,
  native_name text NOT NULL,
  flag_emoji text NOT NULL,
  direction text NOT NULL DEFAULT 'ltr',
  is_active boolean DEFAULT true,
  completion_percentage integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.supported_languages ENABLE ROW LEVEL SECURITY;

-- Languages are viewable by everyone
CREATE POLICY "Languages are viewable by everyone" 
ON public.supported_languages 
FOR SELECT 
USING (true);

-- Only admins can manage languages
CREATE POLICY "Admins can manage languages" 
ON public.supported_languages 
FOR ALL 
USING (is_admin());

-- Create translations table for dynamic content
CREATE TABLE IF NOT EXISTS public.translations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  language text NOT NULL REFERENCES public.supported_languages(code),
  value text NOT NULL,
  context text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(key, language)
);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Translations are viewable by everyone
CREATE POLICY "Translations are viewable by everyone" 
ON public.translations 
FOR SELECT 
USING (true);

-- Only admins can manage translations
CREATE POLICY "Admins can manage translations" 
ON public.translations 
FOR ALL 
USING (is_admin());

-- Insert supported languages
INSERT INTO public.supported_languages (code, name, native_name, flag_emoji, direction, is_active, completion_percentage) VALUES
('en', 'English', 'English', '🇺🇸', 'ltr', true, 100),
('es', 'Spanish', 'Español', '🇪🇸', 'ltr', true, 85),
('zh', 'Chinese', '中文', '🇨🇳', 'ltr', true, 70),
('ar', 'Arabic', 'العربية', '🇸🇦', 'rtl', true, 45),
('pt', 'Portuguese', 'Português', '🇧🇷', 'ltr', true, 60),
('fr', 'French', 'Français', '🇫🇷', 'ltr', true, 55),
('de', 'German', 'Deutsch', '🇩🇪', 'ltr', true, 50),
('ja', 'Japanese', '日本語', '🇯🇵', 'ltr', true, 40),
('ko', 'Korean', '한국어', '🇰🇷', 'ltr', true, 35),
('hi', 'Hindi', 'हिन्दी', '🇮🇳', 'ltr', true, 30)
ON CONFLICT (code) DO NOTHING;
