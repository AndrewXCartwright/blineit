-- Enable realtime for prediction_markets
ALTER PUBLICATION supabase_realtime ADD TABLE public.prediction_markets;

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Enable realtime for user_holdings
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_holdings;

-- Enable realtime for profiles (for wallet balance)
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;