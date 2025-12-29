-- Add video_url and tagged_users columns to user_posts
ALTER TABLE public.user_posts 
ADD COLUMN video_url TEXT,
ADD COLUMN tagged_users UUID[] DEFAULT '{}';

-- Create index for efficient tagged user lookups
CREATE INDEX idx_user_posts_tagged_users ON public.user_posts USING GIN(tagged_users);