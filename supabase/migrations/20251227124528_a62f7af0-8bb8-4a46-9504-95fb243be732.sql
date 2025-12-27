-- Add delete policy for user_holdings so users can sell all their tokens
CREATE POLICY "Users can delete their own holdings"
ON public.user_holdings
FOR DELETE
USING (auth.uid() = user_id);