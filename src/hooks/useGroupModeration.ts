import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface GroupBan {
  id: string;
  group_id: string;
  user_id: string;
  banned_by: string;
  reason: string | null;
  created_at: string;
  expires_at: string | null;
  banned_user?: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export interface MessageReport {
  id: string;
  message_id: string | null;
  group_id: string | null;
  reported_by: string;
  reason: string;
  details: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  action_taken: string | null;
  created_at: string;
  message?: {
    content: string;
    sender_id: string;
  };
  reporter?: {
    display_name: string;
  };
  group?: {
    name: string;
  };
}

export interface GroupInvite {
  id: string;
  group_id: string;
  invite_code: string;
  created_by: string;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  created_at: string;
}

export function useGroupBans(groupId: string) {
  const [bans, setBans] = useState<GroupBan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBans = useCallback(async () => {
    if (!groupId) return;
    
    try {
      const { data, error } = await supabase
        .from('group_bans')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user profiles
      const userIds = (data || []).map(b => b.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = (profiles || []).reduce((acc: Record<string, any>, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {});

      setBans((data || []).map(b => ({
        ...b,
        banned_user: profileMap[b.user_id] || { user_id: b.user_id, display_name: 'Unknown', avatar_url: null }
      })));
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const banMember = async (userId: string, reason?: string, expiresAt?: string) => {
    const { data, error } = await supabase.rpc('ban_group_member', {
      p_group_id: groupId,
      p_user_id: userId,
      p_reason: reason || null,
      p_expires_at: expiresAt || null
    });

    const result = data as { success?: boolean; error?: string } | null;
    if (error || !result?.success) {
      toast.error(result?.error || 'Failed to ban member');
      return false;
    }

    toast.success('Member banned');
    fetchBans();
    return true;
  };

  const unbanMember = async (userId: string) => {
    const { error } = await supabase
      .from('group_bans')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to unban member');
      return false;
    }

    toast.success('Member unbanned');
    fetchBans();
    return true;
  };

  return { bans, loading, fetchBans, banMember, unbanMember };
}

export function useMuteMember(groupId: string) {
  const [muting, setMuting] = useState(false);

  const muteMember = async (userId: string, durationSeconds?: number, reason?: string) => {
    setMuting(true);
    try {
      const { data, error } = await supabase.rpc('mute_group_member', {
        p_group_id: groupId,
        p_user_id: userId,
        p_duration_seconds: durationSeconds || null,
        p_reason: reason || null
      });

      const result = data as { success?: boolean; error?: string } | null;
      if (error || !result?.success) {
        toast.error(result?.error || 'Failed to mute member');
        return false;
      }

      toast.success('Member muted');
      return true;
    } finally {
      setMuting(false);
    }
  };

  const unmuteMember = async (userId: string) => {
    setMuting(true);
    try {
      const { data, error } = await supabase.rpc('unmute_group_member', {
        p_group_id: groupId,
        p_user_id: userId
      });

      const result = data as { success?: boolean; error?: string } | null;
      if (error || !result?.success) {
        toast.error(result?.error || 'Failed to unmute member');
        return false;
      }

      toast.success('Member unmuted');
      return true;
    } finally {
      setMuting(false);
    }
  };

  return { muteMember, unmuteMember, muting };
}

export function useGroupInvites(groupId: string) {
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchInvites = useCallback(async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('group_invites')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const createInvite = async (maxUses?: number, expiresInDays?: number) => {
    const { user } = useAuth();
    if (!user) return null;

    setCreating(true);
    try {
      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('group_invites')
        .insert({
          group_id: groupId,
          created_by: user.id,
          max_uses: maxUses || null,
          expires_at: expiresAt
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Invite created');
      fetchInvites();
      return data;
    } catch (error: any) {
      toast.error('Failed to create invite');
      return null;
    } finally {
      setCreating(false);
    }
  };

  const deleteInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from('group_invites')
      .delete()
      .eq('id', inviteId);

    if (error) {
      toast.error('Failed to delete invite');
      return false;
    }

    toast.success('Invite deleted');
    fetchInvites();
    return true;
  };

  const useInviteCode = async (inviteCode: string) => {
    const { data, error } = await supabase.rpc('use_group_invite', {
      p_invite_code: inviteCode
    });

    const result = data as { success?: boolean; error?: string; group_id?: string } | null;
    if (error || !result?.success) {
      toast.error(result?.error || 'Invalid invite');
      return null;
    }

    toast.success('Joined group');
    return result.group_id;
  };

  return { invites, loading, creating, fetchInvites, createInvite, deleteInvite, useInvite: useInviteCode };
}

export function useMessageReports() {
  const [reports, setReports] = useState<MessageReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async (status?: string) => {
    try {
      let query = supabase
        .from('message_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReports(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const reportMessage = async (messageId: string, groupId: string, reason: string, details?: string) => {
    const { user } = useAuth();
    if (!user) {
      toast.error('Please sign in to report');
      return false;
    }

    const { error } = await supabase
      .from('message_reports')
      .insert({
        message_id: messageId,
        group_id: groupId,
        reported_by: user.id,
        reason,
        details
      });

    if (error) {
      toast.error('Failed to submit report');
      return false;
    }

    toast.success('Report submitted. Our team will review.');
    return true;
  };

  const reviewReport = async (reportId: string, action: 'actioned' | 'dismissed', actionTaken?: string) => {
    const { user } = useAuth();
    if (!user) return false;

    const { error } = await supabase
      .from('message_reports')
      .update({
        status: action,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        action_taken: actionTaken
      })
      .eq('id', reportId);

    if (error) {
      toast.error('Failed to update report');
      return false;
    }

    toast.success('Report updated');
    fetchReports();
    return true;
  };

  return { reports, loading, fetchReports, reportMessage, reviewReport };
}

export function useGroupSettings(groupId: string) {
  const [updating, setUpdating] = useState(false);

  const updateSettings = async (settings: Record<string, any>) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('message_groups')
        .update({ settings, updated_at: new Date().toISOString() })
        .eq('id', groupId);

      if (error) throw error;

      toast.success('Settings updated');
      return true;
    } catch (error: any) {
      toast.error('Failed to update settings');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const updateGroupInfo = async (name?: string, description?: string, avatarUrl?: string) => {
    setUpdating(true);
    try {
      const updates: Record<string, any> = { updated_at: new Date().toISOString() };
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

      const { error } = await supabase
        .from('message_groups')
        .update(updates)
        .eq('id', groupId);

      if (error) throw error;

      toast.success('Group info updated');
      return true;
    } catch (error: any) {
      toast.error('Failed to update group info');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const deleteGroup = async () => {
    const { error } = await supabase
      .from('message_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      toast.error('Failed to delete group');
      return false;
    }

    toast.success('Group deleted');
    return true;
  };

  const leaveGroup = async (userId: string) => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) {
      toast.error('Failed to leave group');
      return false;
    }

    toast.success('Left group');
    return true;
  };

  const updateMemberRole = async (userId: string, newRole: string) => {
    const { data, error } = await supabase.rpc('update_group_member_role', {
      p_group_id: groupId,
      p_user_id: userId,
      p_new_role: newRole
    });

    const result = data as { success?: boolean; error?: string } | null;
    if (error || !result?.success) {
      toast.error(result?.error || 'Failed to update role');
      return false;
    }

    toast.success('Role updated');
    return true;
  };

  return { updating, updateSettings, updateGroupInfo, deleteGroup, leaveGroup, updateMemberRole };
}
