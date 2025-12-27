-- Create comparisons table for saved comparisons
CREATE TABLE public.comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT,
  comparison_type TEXT NOT NULL CHECK (comparison_type IN ('properties', 'loans', 'predictions')),
  item_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comparison_history table for recent comparisons
CREATE TABLE public.comparison_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  comparison_type TEXT NOT NULL CHECK (comparison_type IN ('properties', 'loans', 'predictions')),
  item_ids UUID[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comparison_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for comparisons
CREATE POLICY "Users can view their own comparisons"
  ON public.comparisons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own comparisons"
  ON public.comparisons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comparisons"
  ON public.comparisons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comparisons"
  ON public.comparisons FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for comparison_history
CREATE POLICY "Users can view their own comparison history"
  ON public.comparison_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own comparison history"
  ON public.comparison_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comparison history"
  ON public.comparison_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_comparisons_user_id ON public.comparisons(user_id);
CREATE INDEX idx_comparisons_type ON public.comparisons(comparison_type);
CREATE INDEX idx_comparison_history_user_id ON public.comparison_history(user_id);
CREATE INDEX idx_comparison_history_created ON public.comparison_history(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER update_comparisons_updated_at
  BEFORE UPDATE ON public.comparisons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();