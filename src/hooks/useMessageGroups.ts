import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface MessageGroup {
  id: string;
  name: string;
  description: string | null;
  type: 'property_owners' | 'property_lenders' | 'loan_lenders' | 'management' | 'announcement' | 'custom';
  property_id: string | null;
  loan_id: string | null;
  created_by: string;
  is_readonly: boolean;
  is_private: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  member_count?: number;
  unread_count?: number;
  last_message?: {
    content: string;
    sender_name: string;
    created_at: string;
  } | null;
  my_role?: 'owner' | 'admin' | 'moderator' | 'member';
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member';
  joined_at: string;
  muted: boolean;
  muted_until: string | null;
  last_read_at: string | null;
  profile?: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export function useMessageGroups(filter?: 'all' | 'property' | 'loan' | 'custom' | 'announcement') {
  const { user } = useAuth();
  const [groups, setGroups] = useState<MessageGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    if (!user) return;

    try {
      // Get groups user is a member of
      const { data: memberships, error: memberError } = await supabase
        .from('group_members' as any)
        .select('group_id, role, last_read_at')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      const membershipsData = (memberships || []) as any[];

      if (membershipsData.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      const groupIds = membershipsData.map((m: any) => m.group_id);
      const membershipMap = membershipsData.reduce((acc: Record<string, any>, m: any) => {
        acc[m.group_id] = m;
        return acc;
      }, {});

      // Get group details
      let query = supabase
        .from('message_groups' as any)
        .select('*')
        .in('id', groupIds);

      if (filter && filter !== 'all') {
        if (filter === 'property') {
          query = query.in('type', ['property_owners', 'property_lenders']);
        } else if (filter === 'loan') {
          query = query.eq('type', 'loan_lenders');
        } else {
          query = query.eq('type', filter);
        }
      }

      const { data: groupsData, error: groupsError } = await query.order('updated_at', { ascending: false });

      if (groupsError) throw groupsError;

      const groupsArray = (groupsData || []) as any[];

      // Get member counts
      const { data: memberCounts } = await supabase
        .from('group_members' as any)
        .select('group_id')
        .in('group_id', groupIds);

      const memberCountsData = (memberCounts || []) as any[];
      const countMap = memberCountsData.reduce((acc: Record<string, number>, m: any) => {
        acc[m.group_id] = (acc[m.group_id] || 0) + 1;
        return acc;
      }, {});

      // Get last messages
      const { data: lastMessages } = await supabase
        .from('group_messages' as any)
        .select('group_id, content, sender_id, created_at')
        .in('group_id', groupIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      const lastMessagesData = (lastMessages || []) as any[];
      const lastMessageMap: Record<string, any> = {};
      for (const msg of lastMessagesData) {
        if (!lastMessageMap[msg.group_id]) {
          lastMessageMap[msg.group_id] = msg;
        }
      }

      // Get sender names for last messages
      const senderIds = [...new Set(Object.values(lastMessageMap).map((m: any) => m.sender_id))];
      const { data: senderProfiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', senderIds);

      const senderMap = (senderProfiles || []).reduce((acc: Record<string, string>, p) => {
        acc[p.user_id] = p.display_name || 'Unknown';
        return acc;
      }, {});

      const enrichedGroups: MessageGroup[] = groupsArray.map((g: any) => ({
        ...g,
        member_count: countMap[g.id] || 0,
        unread_count: 0,
        my_role: membershipMap[g.id]?.role as MessageGroup['my_role'],
        last_message: lastMessageMap[g.id] ? {
          content: lastMessageMap[g.id].content,
          sender_name: senderMap[lastMessageMap[g.id].sender_id] || 'Unknown',
          created_at: lastMessageMap[g.id].created_at,
        } : null,
      }));

      // Sort by last activity
      enrichedGroups.sort((a, b) => {
        const aTime = a.last_message?.created_at || a.updated_at;
        const bTime = b.last_message?.created_at || b.updated_at;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      setGroups(enrichedGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return { groups, loading, refetch: fetchGroups };
}

export function useGroupMembers(groupId: string | undefined) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!groupId) return;

    try {
      const { data, error } = await supabase
        .from('group_members' as any)
        .select('*')
        .eq('group_id', groupId)
        .order('role', { ascending: true });

      if (error) throw error;

      const membersData = (data || []) as any[];

      // Fetch profiles
      const userIds = membersData.map((m: any) => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = (profiles || []).reduce((acc: Record<string, any>, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {});

      const membersWithProfiles: GroupMember[] = membersData.map((m: any) => ({
        ...m,
        profile: profileMap[m.user_id] || { user_id: m.user_id, display_name: 'Unknown', avatar_url: null },
      }));

      setMembers(membersWithProfiles);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const updateMemberRole = async (memberId: string, newRole: GroupMember['role']) => {
    try {
      const { error } = await supabase
        .from('group_members' as any)
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      toast.success('Member role updated');
      fetchMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('group_members' as any)
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      toast.success('Member removed');
      fetchMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    }
  };

  return { members, loading, updateMemberRole, removeMember, refetch: fetchMembers };
}

export function useGroupDetails(groupId: string | undefined) {
  const { user } = useAuth();
  const [group, setGroup] = useState<MessageGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !user) {
      setLoading(false);
      return;
    }

    const fetchGroup = async () => {
      try {
        const { data, error } = await supabase
          .from('message_groups' as any)
          .select('*')
          .eq('id', groupId)
          .single();

        if (error) throw error;

        // Get member count
        const { count } = await supabase
          .from('group_members' as any)
          .select('id', { count: 'exact', head: true })
          .eq('group_id', groupId);

        // Get my role
        const { data: membership } = await supabase
          .from('group_members' as any)
          .select('role')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .single();

        const membershipData = membership as any;

        setGroup({
          ...(data as any),
          member_count: count || 0,
          my_role: membershipData?.role as MessageGroup['my_role'],
        });
      } catch (error) {
        console.error('Error fetching group:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, user]);

  return { group, loading };
}

export function useCreateGroup() {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);

  const createGroup = async (name: string, description?: string, memberIds?: string[]) => {
    if (!user) return null;

    setCreating(true);
    try {
      // Create group
      const { data: group, error: groupError } = await supabase
        .from('message_groups' as any)
        .insert({
          name,
          description: description || null,
          type: 'custom',
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const groupData = group as any;

      // Add creator as owner
      await supabase
        .from('group_members' as any)
        .insert({
          group_id: groupData.id,
          user_id: user.id,
          role: 'owner',
        });

      // Add other members
      if (memberIds && memberIds.length > 0) {
        const memberInserts = memberIds.map(userId => ({
          group_id: groupData.id,
          user_id: userId,
          role: 'member',
        }));

        await supabase
          .from('group_members' as any)
          .insert(memberInserts);
      }

      toast.success('Group created!');
      return groupData.id;
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error('Failed to create group');
      return null;
    } finally {
      setCreating(false);
    }
  };

  return { createGroup, creating };
}

export function usePropertyGroup(propertyId: string | undefined) {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!propertyId) {
      setLoading(false);
      return;
    }

    const fetchGroup = async () => {
      try {
        const { data } = await supabase
          .from('message_groups' as any)
          .select('id')
          .eq('property_id', propertyId)
          .eq('type', 'property_owners')
          .single();

        const groupData = data as any;
        setGroupId(groupData?.id || null);
      } catch (error) {
        console.error('Error fetching property group:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [propertyId]);

  return { groupId, loading };
}

export function useLoanGroup(loanId: string | undefined) {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loanId) {
      setLoading(false);
      return;
    }

    const fetchGroup = async () => {
      try {
        const { data } = await supabase
          .from('message_groups' as any)
          .select('id')
          .eq('loan_id', loanId)
          .eq('type', 'loan_lenders')
          .single();

        const groupData = data as any;
        setGroupId(groupData?.id || null);
      } catch (error) {
        console.error('Error fetching loan group:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [loanId]);

  return { groupId, loading };
}
