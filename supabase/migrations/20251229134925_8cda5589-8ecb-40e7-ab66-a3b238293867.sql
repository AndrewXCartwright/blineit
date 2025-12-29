-- =====================================================
-- MODERATION FUNCTIONS
-- =====================================================

-- Function to ban a user from a group
CREATE OR REPLACE FUNCTION public.ban_group_member(
  p_group_id UUID,
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_actor_role TEXT;
  v_target_role TEXT;
BEGIN
  IF v_actor_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  SELECT role INTO v_actor_role FROM group_members WHERE group_id = p_group_id AND user_id = v_actor_id;
  
  IF v_actor_role NOT IN ('owner', 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_permissions');
  END IF;
  
  SELECT role INTO v_target_role FROM group_members WHERE group_id = p_group_id AND user_id = p_user_id;
  
  IF v_target_role = 'owner' OR (v_actor_role = 'admin' AND v_target_role = 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'cannot_ban_this_user');
  END IF;
  
  DELETE FROM group_members WHERE group_id = p_group_id AND user_id = p_user_id;
  
  INSERT INTO group_bans (group_id, user_id, banned_by, reason, expires_at)
  VALUES (p_group_id, p_user_id, v_actor_id, p_reason, p_expires_at)
  ON CONFLICT (group_id, user_id) DO UPDATE
  SET banned_by = v_actor_id, reason = p_reason, expires_at = p_expires_at, created_at = now();
  
  INSERT INTO group_messages (group_id, sender_id, content, message_type)
  VALUES (p_group_id, v_actor_id, 'A member was banned from the group', 'system');
  
  RETURN json_build_object('success', true);
END;
$$;

-- Function to mute a group member
CREATE OR REPLACE FUNCTION public.mute_group_member(
  p_group_id UUID,
  p_user_id UUID,
  p_duration_seconds INTEGER DEFAULT NULL,
  p_reason TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_actor_role TEXT;
  v_target_role TEXT;
  v_muted_until TIMESTAMPTZ;
BEGIN
  IF v_actor_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  SELECT role INTO v_actor_role FROM group_members WHERE group_id = p_group_id AND user_id = v_actor_id;
  
  IF v_actor_role NOT IN ('owner', 'admin', 'moderator') THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_permissions');
  END IF;
  
  SELECT role INTO v_target_role FROM group_members WHERE group_id = p_group_id AND user_id = p_user_id;
  
  IF v_target_role IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'user_not_in_group');
  END IF;
  
  IF v_target_role = 'owner' OR 
     (v_actor_role = 'moderator' AND v_target_role IN ('admin', 'moderator')) OR
     (v_actor_role = 'admin' AND v_target_role IN ('owner', 'admin')) THEN
    RETURN json_build_object('success', false, 'error', 'cannot_mute_this_user');
  END IF;
  
  IF p_duration_seconds IS NOT NULL THEN
    v_muted_until := now() + (p_duration_seconds || ' seconds')::interval;
  END IF;
  
  UPDATE group_members
  SET muted = true, muted_until = v_muted_until, muted_by = v_actor_id, mute_reason = p_reason
  WHERE group_id = p_group_id AND user_id = p_user_id;
  
  RETURN json_build_object('success', true, 'muted_until', v_muted_until);
END;
$$;

-- Function to unmute a member
CREATE OR REPLACE FUNCTION public.unmute_group_member(p_group_id UUID, p_user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_actor_role TEXT;
BEGIN
  IF v_actor_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  SELECT role INTO v_actor_role FROM group_members WHERE group_id = p_group_id AND user_id = v_actor_id;
  
  IF v_actor_role NOT IN ('owner', 'admin', 'moderator') THEN
    RETURN json_build_object('success', false, 'error', 'insufficient_permissions');
  END IF;
  
  UPDATE group_members
  SET muted = false, muted_until = NULL, muted_by = NULL, mute_reason = NULL
  WHERE group_id = p_group_id AND user_id = p_user_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Function to use an invite code
CREATE OR REPLACE FUNCTION public.use_group_invite(p_invite_code TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_invite RECORD;
  v_is_banned BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  SELECT * INTO v_invite FROM group_invites WHERE invite_code = p_invite_code FOR UPDATE;
  
  IF v_invite IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'invalid_invite');
  END IF;
  
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
    RETURN json_build_object('success', false, 'error', 'invite_expired');
  END IF;
  
  IF v_invite.max_uses IS NOT NULL AND v_invite.uses >= v_invite.max_uses THEN
    RETURN json_build_object('success', false, 'error', 'invite_max_uses');
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM group_bans
    WHERE group_id = v_invite.group_id AND user_id = v_user_id
    AND (expires_at IS NULL OR expires_at > now())
  ) INTO v_is_banned;
  
  IF v_is_banned THEN
    RETURN json_build_object('success', false, 'error', 'user_banned');
  END IF;
  
  IF EXISTS(SELECT 1 FROM group_members WHERE group_id = v_invite.group_id AND user_id = v_user_id) THEN
    RETURN json_build_object('success', false, 'error', 'already_member');
  END IF;
  
  INSERT INTO group_members (group_id, user_id, role) VALUES (v_invite.group_id, v_user_id, 'member');
  UPDATE group_invites SET uses = uses + 1 WHERE id = v_invite.id;
  
  INSERT INTO group_messages (group_id, sender_id, content, message_type)
  VALUES (v_invite.group_id, v_user_id, 'joined the group via invite', 'system');
  
  RETURN json_build_object('success', true, 'group_id', v_invite.group_id);
END;
$$;

-- Function to update member role
CREATE OR REPLACE FUNCTION public.update_group_member_role(
  p_group_id UUID,
  p_user_id UUID,
  p_new_role TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_actor_role TEXT;
  v_target_role TEXT;
BEGIN
  IF v_actor_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  
  IF p_new_role NOT IN ('owner', 'admin', 'moderator', 'member') THEN
    RETURN json_build_object('success', false, 'error', 'invalid_role');
  END IF;
  
  SELECT role INTO v_actor_role FROM group_members WHERE group_id = p_group_id AND user_id = v_actor_id;
  SELECT role INTO v_target_role FROM group_members WHERE group_id = p_group_id AND user_id = p_user_id;
  
  IF v_target_role IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'user_not_in_group');
  END IF;
  
  -- Only owner can transfer ownership or promote to admin
  IF p_new_role = 'owner' THEN
    IF v_actor_role != 'owner' THEN
      RETURN json_build_object('success', false, 'error', 'only_owner_can_transfer');
    END IF;
    -- Transfer ownership
    UPDATE group_members SET role = 'admin' WHERE group_id = p_group_id AND user_id = v_actor_id;
    UPDATE group_members SET role = 'owner' WHERE group_id = p_group_id AND user_id = p_user_id;
    RETURN json_build_object('success', true);
  END IF;
  
  -- Owner can promote/demote anyone except themselves
  IF v_actor_role = 'owner' AND v_actor_id != p_user_id THEN
    UPDATE group_members SET role = p_new_role WHERE group_id = p_group_id AND user_id = p_user_id;
    RETURN json_build_object('success', true);
  END IF;
  
  -- Admins can only promote to moderator or demote from moderator
  IF v_actor_role = 'admin' AND v_target_role NOT IN ('owner', 'admin') AND p_new_role IN ('moderator', 'member') THEN
    UPDATE group_members SET role = p_new_role WHERE group_id = p_group_id AND user_id = p_user_id;
    RETURN json_build_object('success', true);
  END IF;
  
  RETURN json_build_object('success', false, 'error', 'insufficient_permissions');
END;
$$;

-- Function to create auto-join triggers for properties
CREATE OR REPLACE FUNCTION public.auto_join_property_owners_group()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_group_id UUID;
  v_property_name TEXT;
BEGIN
  -- Get property name
  SELECT name INTO v_property_name FROM properties WHERE id = NEW.property_id;
  
  -- Find or create owners group
  SELECT id INTO v_group_id FROM message_groups 
  WHERE property_id = NEW.property_id AND type = 'property_owners';
  
  IF v_group_id IS NULL THEN
    INSERT INTO message_groups (name, description, type, property_id, created_by)
    VALUES (
      COALESCE(v_property_name, 'Property') || ' - Owners',
      'Discussion group for owners of ' || COALESCE(v_property_name, 'this property'),
      'property_owners',
      NEW.property_id,
      NEW.user_id
    )
    RETURNING id INTO v_group_id;
    
    -- Creator becomes owner
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (v_group_id, NEW.user_id, 'owner')
    ON CONFLICT (group_id, user_id) DO NOTHING;
  ELSE
    -- Add as member if not already
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (v_group_id, NEW.user_id, 'member')
    ON CONFLICT (group_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to auto-join loan lenders group
CREATE OR REPLACE FUNCTION public.auto_join_loan_lenders_group()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_group_id UUID;
  v_loan_name TEXT;
BEGIN
  SELECT name INTO v_loan_name FROM loans WHERE id = NEW.loan_id;
  
  SELECT id INTO v_group_id FROM message_groups 
  WHERE loan_id = NEW.loan_id AND type = 'loan_lenders';
  
  IF v_group_id IS NULL THEN
    INSERT INTO message_groups (name, description, type, loan_id, created_by)
    VALUES (
      COALESCE(v_loan_name, 'Loan') || ' - Lenders',
      'Discussion group for lenders of ' || COALESCE(v_loan_name, 'this loan'),
      'loan_lenders',
      NEW.loan_id,
      NEW.user_id
    )
    RETURNING id INTO v_group_id;
    
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (v_group_id, NEW.user_id, 'owner')
    ON CONFLICT (group_id, user_id) DO NOTHING;
  ELSE
    INSERT INTO group_members (group_id, user_id, role)
    VALUES (v_group_id, NEW.user_id, 'member')
    ON CONFLICT (group_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trg_auto_join_property_owners ON public.user_holdings;
CREATE TRIGGER trg_auto_join_property_owners
  AFTER INSERT ON public.user_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_join_property_owners_group();

DROP TRIGGER IF EXISTS trg_auto_join_loan_lenders ON public.user_loan_investments;
CREATE TRIGGER trg_auto_join_loan_lenders
  AFTER INSERT ON public.user_loan_investments
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_join_loan_lenders_group();