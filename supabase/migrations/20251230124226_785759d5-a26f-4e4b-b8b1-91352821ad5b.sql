-- Create sponsor reviews table
CREATE TABLE sponsor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL,
  investor_id UUID NOT NULL,
  deal_id UUID,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  transparency_rating INTEGER CHECK (transparency_rating >= 1 AND transparency_rating <= 5),
  returns_rating INTEGER CHECK (returns_rating >= 1 AND returns_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  review_text TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT TRUE,
  show_name BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reported')),
  moderation_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  UNIQUE(sponsor_id, investor_id, deal_id)
);

-- Create index for faster lookups
CREATE INDEX idx_sponsor_reviews_sponsor_id ON sponsor_reviews(sponsor_id);
CREATE INDEX idx_sponsor_reviews_investor_id ON sponsor_reviews(investor_id);
CREATE INDEX idx_sponsor_reviews_status ON sponsor_reviews(status);

-- Enable RLS
ALTER TABLE sponsor_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Anyone can view approved public reviews
CREATE POLICY "Anyone can view approved public reviews"
  ON sponsor_reviews FOR SELECT
  USING (status = 'approved' AND is_public = true);

-- Investors can view their own reviews (any status)
CREATE POLICY "Investors can view their own reviews"
  ON sponsor_reviews FOR SELECT
  USING (auth.uid() = investor_id);

-- Sponsors can view reviews about them
CREATE POLICY "Sponsors can view reviews about them"
  ON sponsor_reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sponsor_profiles
    WHERE sponsor_profiles.id = sponsor_reviews.sponsor_id
    AND sponsor_profiles.user_id = auth.uid()
  ));

-- Investors can create reviews (will add investment check via function)
CREATE POLICY "Authenticated users can create reviews"
  ON sponsor_reviews FOR INSERT
  WITH CHECK (auth.uid() = investor_id);

-- Investors can update their own pending reviews
CREATE POLICY "Investors can update their own pending reviews"
  ON sponsor_reviews FOR UPDATE
  USING (auth.uid() = investor_id AND status = 'pending');

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
  ON sponsor_reviews FOR ALL
  USING (public.is_admin());

-- Create review report table for flagged reviews
CREATE TABLE sponsor_review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES sponsor_reviews(id) NOT NULL,
  reported_by UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'fake', 'harassment', 'other')),
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE sponsor_review_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Authenticated users can report reviews"
  ON sponsor_review_reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON sponsor_review_reports FOR SELECT
  USING (auth.uid() = reported_by);

-- Admins can manage reports
CREATE POLICY "Admins can manage review reports"
  ON sponsor_review_reports FOR ALL
  USING (public.is_admin());

-- Create review prompts table to track which deals have been prompted
CREATE TABLE sponsor_review_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL,
  sponsor_id UUID NOT NULL,
  deal_id UUID,
  prompted_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  UNIQUE(investor_id, sponsor_id, deal_id)
);

-- Enable RLS
ALTER TABLE sponsor_review_prompts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own prompts
CREATE POLICY "Users can manage their own prompts"
  ON sponsor_review_prompts FOR ALL
  USING (auth.uid() = investor_id);

-- Function to submit a sponsor review with investment verification
CREATE OR REPLACE FUNCTION submit_sponsor_review(
  p_sponsor_id UUID,
  p_deal_id UUID,
  p_overall_rating INTEGER,
  p_communication_rating INTEGER DEFAULT NULL,
  p_transparency_rating INTEGER DEFAULT NULL,
  p_returns_rating INTEGER DEFAULT NULL,
  p_professionalism_rating INTEGER DEFAULT NULL,
  p_review_text TEXT DEFAULT NULL,
  p_show_name BOOLEAN DEFAULT FALSE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_review_id UUID;
  v_has_investment BOOLEAN := FALSE;
BEGIN
  -- Validate authentication
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  -- Validate rating
  IF p_overall_rating < 1 OR p_overall_rating > 5 THEN
    RETURN json_build_object('success', false, 'error', 'invalid_rating');
  END IF;

  -- Validate review text length
  IF p_review_text IS NOT NULL AND length(p_review_text) > 500 THEN
    RETURN json_build_object('success', false, 'error', 'review_text_too_long');
  END IF;

  -- Check if user has already reviewed this sponsor/deal combination
  IF EXISTS (
    SELECT 1 FROM sponsor_reviews
    WHERE sponsor_id = p_sponsor_id
    AND investor_id = v_user_id
    AND (deal_id = p_deal_id OR (deal_id IS NULL AND p_deal_id IS NULL))
  ) THEN
    RETURN json_build_object('success', false, 'error', 'already_reviewed');
  END IF;

  -- TODO: Add investment verification logic here when deal investments table is ready
  -- For now, we'll allow reviews (the UI should only show the option to verified investors)
  v_has_investment := TRUE;

  IF NOT v_has_investment THEN
    RETURN json_build_object('success', false, 'error', 'no_investment_found');
  END IF;

  -- Insert the review (with pending status for 24-hour moderation window)
  INSERT INTO sponsor_reviews (
    sponsor_id,
    investor_id,
    deal_id,
    overall_rating,
    communication_rating,
    transparency_rating,
    returns_rating,
    professionalism_rating,
    review_text,
    show_name,
    status,
    published_at
  )
  VALUES (
    p_sponsor_id,
    v_user_id,
    p_deal_id,
    p_overall_rating,
    p_communication_rating,
    p_transparency_rating,
    p_returns_rating,
    p_professionalism_rating,
    p_review_text,
    p_show_name,
    'pending',
    NOW() + INTERVAL '24 hours'
  )
  RETURNING id INTO v_review_id;

  -- Mark the prompt as reviewed if exists
  UPDATE sponsor_review_prompts
  SET reviewed_at = NOW()
  WHERE investor_id = v_user_id
  AND sponsor_id = p_sponsor_id
  AND (deal_id = p_deal_id OR (deal_id IS NULL AND p_deal_id IS NULL));

  RETURN json_build_object(
    'success', true,
    'review_id', v_review_id,
    'message', 'Review submitted. It will be published after a 24-hour review period.'
  );
END;
$$;

-- Function to get sponsor rating summary
CREATE OR REPLACE FUNCTION get_sponsor_rating_summary(p_sponsor_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'average_overall', COALESCE(ROUND(AVG(overall_rating)::numeric, 1), 0),
    'average_communication', COALESCE(ROUND(AVG(communication_rating)::numeric, 1), 0),
    'average_transparency', COALESCE(ROUND(AVG(transparency_rating)::numeric, 1), 0),
    'average_returns', COALESCE(ROUND(AVG(returns_rating)::numeric, 1), 0),
    'average_professionalism', COALESCE(ROUND(AVG(professionalism_rating)::numeric, 1), 0),
    'total_reviews', COUNT(*)
  )
  INTO v_result
  FROM sponsor_reviews
  WHERE sponsor_id = p_sponsor_id
  AND status = 'approved'
  AND is_public = true;

  RETURN v_result;
END;
$$;

-- Function to auto-approve reviews after 24 hours (can be called by a cron job)
CREATE OR REPLACE FUNCTION approve_pending_reviews()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE sponsor_reviews
  SET status = 'approved', updated_at = NOW()
  WHERE status = 'pending'
  AND published_at <= NOW();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Trigger to update updated_at
CREATE TRIGGER update_sponsor_reviews_updated_at
  BEFORE UPDATE ON sponsor_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();