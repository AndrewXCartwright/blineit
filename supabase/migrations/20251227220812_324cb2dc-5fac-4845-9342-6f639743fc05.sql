-- Add social fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS is_verified_investor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_invested NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS prediction_win_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS show_investments BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_predictions BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_on_leaderboard BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_mentions BOOLEAN DEFAULT true;

-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL, -- 'property', 'loan', 'prediction', 'post'
  entity_id UUID NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'comment', 'property', 'prediction', 'post'
  entity_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, entity_type, entity_id)
);

-- Create follows table
CREATE TABLE public.follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Create user_posts table
CREATE TABLE public.user_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  property_id UUID,
  prediction_id UUID,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table for moderation
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  entity_type TEXT NOT NULL, -- 'comment', 'post', 'user'
  entity_id UUID NOT NULL,
  reason TEXT NOT NULL, -- 'spam', 'harassment', 'misinformation', 'inappropriate', 'other'
  details TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'dismissed', 'actioned'
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_type TEXT NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_type)
);

-- Enable RLS on all new tables
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (is_hidden = false OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
  ON public.comments FOR ALL
  USING (is_admin());

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own likes"
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow others"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- User posts policies
CREATE POLICY "Posts are viewable by everyone"
  ON public.user_posts FOR SELECT
  USING (is_hidden = false OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own posts"
  ON public.user_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.user_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.user_posts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts"
  ON public.user_posts FOR ALL
  USING (is_admin());

-- Reports policies
CREATE POLICY "Users can submit reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.reports FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update reports"
  ON public.reports FOR UPDATE
  USING (is_admin());

-- Badges policies
CREATE POLICY "Badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage badges"
  ON public.user_badges FOR ALL
  USING (is_admin());

-- Trigger to update comments updated_at
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to toggle like
CREATE OR REPLACE FUNCTION public.toggle_like(p_entity_type TEXT, p_entity_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing_id UUID;
  v_is_liked BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  -- Check if already liked
  SELECT id INTO v_existing_id
  FROM likes
  WHERE user_id = v_user_id AND entity_type = p_entity_type AND entity_id = p_entity_id;

  IF v_existing_id IS NOT NULL THEN
    -- Unlike
    DELETE FROM likes WHERE id = v_existing_id;
    v_is_liked := false;
    
    -- Update counts
    IF p_entity_type = 'comment' THEN
      UPDATE comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = p_entity_id;
    ELSIF p_entity_type = 'post' THEN
      UPDATE user_posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = p_entity_id;
    END IF;
  ELSE
    -- Like
    INSERT INTO likes (user_id, entity_type, entity_id) VALUES (v_user_id, p_entity_type, p_entity_id);
    v_is_liked := true;
    
    -- Update counts
    IF p_entity_type = 'comment' THEN
      UPDATE comments SET likes_count = likes_count + 1 WHERE id = p_entity_id;
    ELSIF p_entity_type = 'post' THEN
      UPDATE user_posts SET likes_count = likes_count + 1 WHERE id = p_entity_id;
    END IF;
  END IF;

  RETURN json_build_object('success', true, 'is_liked', v_is_liked);
END;
$$;

-- Function to toggle follow
CREATE OR REPLACE FUNCTION public.toggle_follow(p_following_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_existing_id UUID;
  v_is_following BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  IF v_user_id = p_following_id THEN
    RETURN json_build_object('success', false, 'error', 'cannot_follow_self');
  END IF;

  -- Check if already following
  SELECT id INTO v_existing_id
  FROM follows
  WHERE follower_id = v_user_id AND following_id = p_following_id;

  IF v_existing_id IS NOT NULL THEN
    -- Unfollow
    DELETE FROM follows WHERE id = v_existing_id;
    v_is_following := false;
    
    -- Update counts
    UPDATE profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE user_id = p_following_id;
    UPDATE profiles SET following_count = GREATEST(0, following_count - 1) WHERE user_id = v_user_id;
  ELSE
    -- Follow
    INSERT INTO follows (follower_id, following_id) VALUES (v_user_id, p_following_id);
    v_is_following := true;
    
    -- Update counts
    UPDATE profiles SET followers_count = followers_count + 1 WHERE user_id = p_following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE user_id = v_user_id;
  END IF;

  RETURN json_build_object('success', true, 'is_following', v_is_following);
END;
$$;

-- Function to add comment and update reply count
CREATE OR REPLACE FUNCTION public.add_comment(
  p_entity_type TEXT,
  p_entity_id UUID,
  p_content TEXT,
  p_parent_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_comment_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  IF length(trim(p_content)) < 1 THEN
    RETURN json_build_object('success', false, 'error', 'content_required');
  END IF;

  IF length(p_content) > 2000 THEN
    RETURN json_build_object('success', false, 'error', 'content_too_long');
  END IF;

  INSERT INTO comments (user_id, entity_type, entity_id, content, parent_id)
  VALUES (v_user_id, p_entity_type, p_entity_id, trim(p_content), p_parent_id)
  RETURNING id INTO v_comment_id;

  -- Update parent reply count if this is a reply
  IF p_parent_id IS NOT NULL THEN
    UPDATE comments SET replies_count = replies_count + 1 WHERE id = p_parent_id;
  END IF;

  -- Update post comment count if commenting on a post
  IF p_entity_type = 'post' THEN
    UPDATE user_posts SET comments_count = comments_count + 1 WHERE id = p_entity_id;
  END IF;

  RETURN json_build_object('success', true, 'comment_id', v_comment_id);
END;
$$;