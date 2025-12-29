-- =====================================================
-- COMPLETE MESSAGING SYSTEM SCHEMA
-- =====================================================

-- Message Groups table
CREATE TABLE public.message_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'custom', -- property_owners, loan_lenders, management, announcement, custom
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  loan_id UUID REFERENCES public.loans(id) ON DELETE SET NULL,
  created_by UUID NOT NULL,
  is_readonly BOOLEAN NOT NULL DEFAULT false,
  is_private BOOLEAN NOT NULL DEFAULT false,
  avatar_url TEXT,
  settings JSONB DEFAULT '{
    "allow_member_invites": false,
    "allow_reactions": true,
    "allow_replies": true,
    "slow_mode_seconds": 0,
    "filter_profanity": false,
    "block_new_member_links": false,
    "require_approval": false,
    "members_can_see_members": true,
    "who_can_send": "everyone",
    "who_can_pin": "admins",
    "who_can_share_media": "everyone"
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group Members table
CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.message_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, moderator, member
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  muted BOOLEAN NOT NULL DEFAULT false,
  muted_until TIMESTAMPTZ,
  muted_by UUID,
  mute_reason TEXT,
  last_read_at TIMESTAMPTZ,
  UNIQUE(group_id, user_id)
);

-- Group Messages table
CREATE TABLE public.group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.message_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- text, image, document, poll, system, announcement
  parent_id UUID REFERENCES public.group_messages(id) ON DELETE SET NULL,
  metadata JSONB,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Message Reactions table
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.group_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Group Bans table
CREATE TABLE public.group_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.message_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(group_id, user_id)
);

-- Message Reports table
CREATE TABLE public.message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.group_messages(id) ON DELETE SET NULL,
  group_id UUID REFERENCES public.message_groups(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Group Invites table
CREATE TABLE public.group_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.message_groups(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_by UUID NOT NULL,
  max_uses INTEGER DEFAULT 1,
  uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all messaging tables
ALTER TABLE public.message_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_groups
CREATE POLICY "Users can view groups they are members of"
  ON public.message_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = message_groups.id AND gm.user_id = auth.uid()
    )
    OR is_admin()
  );

CREATE POLICY "Users can create custom groups"
  ON public.message_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by AND type = 'custom');

CREATE POLICY "Admins can manage all groups"
  ON public.message_groups FOR ALL
  USING (is_admin());

CREATE POLICY "Group admins can update their groups"
  ON public.message_groups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = message_groups.id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for group_members
CREATE POLICY "Users can view members of their groups"
  ON public.group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can manage members"
  ON public.group_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can update their own membership"
  ON public.group_members FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.group_members FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for group_messages
CREATE POLICY "Members can view group messages"
  ON public.group_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_messages.group_id AND gm.user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Members can send messages"
  ON public.group_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_messages.group_id
      AND gm.user_id = auth.uid()
      AND gm.muted = false
    )
    AND auth.uid() = sender_id
  );

CREATE POLICY "Users can update own messages"
  ON public.group_messages FOR UPDATE
  USING (auth.uid() = sender_id OR is_admin());

CREATE POLICY "Admins and moderators can delete messages"
  ON public.group_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_messages.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin', 'moderator')
    )
    OR auth.uid() = sender_id
  );

-- RLS Policies for message_reactions
CREATE POLICY "Members can view reactions"
  ON public.message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.group_messages gm
      JOIN public.group_members mem ON mem.group_id = gm.group_id
      WHERE gm.id = message_reactions.message_id AND mem.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can add reactions"
  ON public.message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
  ON public.message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for group_bans
CREATE POLICY "Group admins can manage bans"
  ON public.group_bans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_bans.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin')
    )
    OR is_admin()
  );

-- RLS Policies for message_reports
CREATE POLICY "Users can create reports"
  ON public.message_reports FOR INSERT
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Admins can manage all reports"
  ON public.message_reports FOR ALL
  USING (is_admin());

CREATE POLICY "Users can view their own reports"
  ON public.message_reports FOR SELECT
  USING (auth.uid() = reported_by);

-- RLS Policies for group_invites
CREATE POLICY "Group admins can manage invites"
  ON public.group_invites FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = group_invites.group_id
      AND gm.user_id = auth.uid()
      AND gm.role IN ('owner', 'admin')
    )
    OR is_admin()
  );

CREATE POLICY "Anyone can view valid invite codes"
  ON public.group_invites FOR SELECT
  USING (
    (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR uses < max_uses)
  );

-- Indexes for performance
CREATE INDEX idx_group_members_user_id ON public.group_members(user_id);
CREATE INDEX idx_group_members_group_id ON public.group_members(group_id);
CREATE INDEX idx_group_messages_group_id_created ON public.group_messages(group_id, created_at DESC);
CREATE INDEX idx_group_messages_parent_id ON public.group_messages(parent_id);
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_group_bans_group_user ON public.group_bans(group_id, user_id);
CREATE INDEX idx_message_reports_status ON public.message_reports(status);
CREATE INDEX idx_group_invites_code ON public.group_invites(invite_code);
CREATE INDEX idx_message_groups_property ON public.message_groups(property_id);
CREATE INDEX idx_message_groups_loan ON public.message_groups(loan_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;