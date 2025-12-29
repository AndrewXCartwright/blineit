-- Community Comments
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  is_pinned BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false,
  upvote_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT property_or_loan CHECK (
    (property_id IS NOT NULL AND loan_id IS NULL) OR
    (property_id IS NULL AND loan_id IS NOT NULL)
  )
);

-- Comment Upvotes
CREATE TABLE comment_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Comment Reports
CREATE TABLE comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_comments_property ON community_comments(property_id, created_at DESC);
CREATE INDEX idx_comments_loan ON community_comments(loan_id, created_at DESC);
CREATE INDEX idx_comments_parent ON community_comments(parent_id);
CREATE INDEX idx_upvotes_comment ON comment_upvotes(comment_id);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE community_comments;

-- RLS Policies for community_comments
CREATE POLICY "Anyone can view non-deleted comments"
ON community_comments FOR SELECT
USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can insert comments"
ON community_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON community_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete their own comments"
ON community_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
ON community_comments FOR ALL
USING (is_admin());

-- RLS Policies for comment_upvotes
CREATE POLICY "Anyone can view upvotes"
ON comment_upvotes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can upvote"
ON comment_upvotes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvote"
ON comment_upvotes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for comment_reports
CREATE POLICY "Users can submit reports"
ON comment_reports FOR INSERT
WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view their own reports"
ON comment_reports FOR SELECT
USING (auth.uid() = reported_by);

CREATE POLICY "Admins can manage all reports"
ON comment_reports FOR ALL
USING (is_admin());

-- Function to toggle upvote
CREATE OR REPLACE FUNCTION toggle_comment_upvote(p_comment_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_exists BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM comment_upvotes
    WHERE comment_id = p_comment_id AND user_id = v_user_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Remove upvote
    DELETE FROM comment_upvotes WHERE comment_id = p_comment_id AND user_id = v_user_id;
    UPDATE community_comments SET upvote_count = upvote_count - 1 WHERE id = p_comment_id;
    RETURN json_build_object('success', true, 'action', 'removed');
  ELSE
    -- Add upvote
    INSERT INTO comment_upvotes (comment_id, user_id) VALUES (p_comment_id, v_user_id);
    UPDATE community_comments SET upvote_count = upvote_count + 1 WHERE id = p_comment_id;
    RETURN json_build_object('success', true, 'action', 'added');
  END IF;
END;
$$;