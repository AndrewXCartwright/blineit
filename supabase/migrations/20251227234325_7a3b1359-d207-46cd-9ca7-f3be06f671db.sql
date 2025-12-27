-- Create saved_calculations table
CREATE TABLE public.saved_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  calculator_type TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  loan_id UUID REFERENCES public.loans(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calculation_history table
CREATE TABLE public.calculation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  calculator_type TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for saved_calculations
CREATE POLICY "Users can view their own saved calculations"
  ON public.saved_calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved calculations"
  ON public.saved_calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved calculations"
  ON public.saved_calculations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved calculations"
  ON public.saved_calculations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for calculation_history
CREATE POLICY "Users can view their own calculation history"
  ON public.calculation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calculation history"
  ON public.calculation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculation history"
  ON public.calculation_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_saved_calculations_user_id ON public.saved_calculations(user_id);
CREATE INDEX idx_saved_calculations_type ON public.saved_calculations(calculator_type);
CREATE INDEX idx_calculation_history_user_id ON public.calculation_history(user_id);
CREATE INDEX idx_calculation_history_type ON public.calculation_history(calculator_type);

-- Add trigger for updated_at
CREATE TRIGGER update_saved_calculations_updated_at
  BEFORE UPDATE ON public.saved_calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();