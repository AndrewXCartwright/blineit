-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  apy DECIMAL(5, 2) NOT NULL DEFAULT 0,
  token_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 10000,
  holders INTEGER NOT NULL DEFAULT 0,
  occupancy DECIMAL(5, 2) NOT NULL DEFAULT 0,
  units INTEGER NOT NULL DEFAULT 0,
  year_built INTEGER,
  category TEXT NOT NULL DEFAULT 'Multifamily',
  description TEXT,
  image_url TEXT,
  is_hot BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create prediction markets table
CREATE TABLE public.prediction_markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  yes_price DECIMAL(5, 2) NOT NULL DEFAULT 50,
  no_price DECIMAL(5, 2) NOT NULL DEFAULT 50,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  volume DECIMAL(15, 2) NOT NULL DEFAULT 0,
  traders_count INTEGER NOT NULL DEFAULT 0,
  is_resolved BOOLEAN DEFAULT false,
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user holdings table
CREATE TABLE public.user_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  average_buy_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, property_id)
);

-- Create user bets table
CREATE TABLE public.user_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  market_id UUID REFERENCES public.prediction_markets(id) ON DELETE CASCADE NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('bull', 'bear')),
  amount DECIMAL(15, 2) NOT NULL,
  entry_price DECIMAL(5, 2) NOT NULL,
  shares DECIMAL(15, 4) NOT NULL,
  is_settled BOOLEAN DEFAULT false,
  payout DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create price history table for sparklines
CREATE TABLE public.market_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id UUID REFERENCES public.prediction_markets(id) ON DELETE CASCADE NOT NULL,
  yes_price DECIMAL(5, 2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_price_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Properties are publicly viewable
CREATE POLICY "Properties are viewable by everyone" ON public.properties FOR SELECT USING (true);

-- Prediction markets are publicly viewable
CREATE POLICY "Markets are viewable by everyone" ON public.prediction_markets FOR SELECT USING (true);

-- Price history is publicly viewable
CREATE POLICY "Price history is viewable by everyone" ON public.market_price_history FOR SELECT USING (true);

-- User holdings policies
CREATE POLICY "Users can view their own holdings" ON public.user_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own holdings" ON public.user_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own holdings" ON public.user_holdings FOR UPDATE USING (auth.uid() = user_id);

-- User bets policies
CREATE POLICY "Users can view their own bets" ON public.user_bets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bets" ON public.user_bets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bets" ON public.user_bets FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_prediction_markets_updated_at BEFORE UPDATE ON public.prediction_markets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_holdings_updated_at BEFORE UPDATE ON public.user_holdings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();