-- Function to increment reply count
CREATE OR REPLACE FUNCTION increment_reply_count(comment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE community_comments
  SET reply_count = reply_count + 1
  WHERE id = comment_id;
END;
$$;