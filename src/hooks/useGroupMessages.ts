import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'document' | 'poll' | 'system' | 'announcement';
  parent_id: string | null;
  metadata: Record<string, any> | null;
  is_pinned: boolean;
  is_edited: boolean;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
  sender?: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  };
  reactions?: MessageReaction[];
  parent?: GroupMessage | null;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export function useGroupMessages(groupId: string | undefined) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchMessages = useCallback(async (before?: string) => {
    if (!groupId || !user) return;

    try {
      let query = supabase
        .from('group_messages' as any)
        .select('*')
        .eq('group_id', groupId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data, error } = await query;

      if (error) throw error;

      const messagesData = (data || []) as any[];

      if (messagesData.length < 50) {
        setHasMore(false);
      }

      // Fetch sender profiles
      const senderIds = [...new Set(messagesData.map((m: any) => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', senderIds);

      const profileMap = (profiles || []).reduce((acc: Record<string, any>, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {});

      // Fetch reactions
      const messageIds = messagesData.map((m: any) => m.id);
      const { data: reactions } = await supabase
        .from('message_reactions' as any)
        .select('*')
        .in('message_id', messageIds);

      const reactionsData = (reactions || []) as any[];
      const reactionsMap = reactionsData.reduce((acc: Record<string, MessageReaction[]>, r: any) => {
        if (!acc[r.message_id]) acc[r.message_id] = [];
        acc[r.message_id].push(r as MessageReaction);
        return acc;
      }, {});

      const messagesWithProfiles: GroupMessage[] = messagesData.map((m: any) => ({
        ...m,
        sender: profileMap[m.sender_id] || { user_id: m.sender_id, display_name: 'Unknown', avatar_url: null },
        reactions: reactionsMap[m.id] || [],
      })).reverse();

      if (before) {
        setMessages(prev => [...messagesWithProfiles, ...prev]);
      } else {
        setMessages(messagesWithProfiles);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!groupId || !user) return;

    const channel = supabase
      .channel(`group-messages:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Fetch sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, display_name, avatar_url')
            .eq('user_id', newMessage.sender_id)
            .single();

          const messageWithProfile: GroupMessage = {
            ...newMessage,
            sender: profile || { user_id: newMessage.sender_id, display_name: 'Unknown', avatar_url: null },
            reactions: [],
          };

          setMessages(prev => [...prev, messageWithProfile]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setMessages(prev => prev.map(m => 
            m.id === updated.id ? { ...m, ...updated } : m
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, user]);

  const loadMore = useCallback(() => {
    if (messages.length > 0 && hasMore) {
      fetchMessages(messages[0].created_at);
    }
  }, [messages, hasMore, fetchMessages]);

  return { messages, loading, hasMore, loadMore, refetch: () => fetchMessages() };
}

export function useSendMessage(groupId: string | undefined) {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);

  const sendMessage = async (
    content: string, 
    messageType: GroupMessage['message_type'] = 'text',
    parentId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user || !groupId || !content.trim()) return false;

    setSending(true);
    try {
      const { error } = await supabase
        .from('group_messages' as any)
        .insert({
          group_id: groupId,
          sender_id: user.id,
          content: content.trim(),
          message_type: messageType,
          parent_id: parentId || null,
          metadata: metadata || null,
        });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    } finally {
      setSending(false);
    }
  };

  return { sendMessage, sending };
}

export function useMessageReactions(messageId: string) {
  const { user } = useAuth();

  const addReaction = async (emoji: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('message_reactions' as any)
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });

      if (error && error.code !== '23505') throw error;
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (emoji: string) => {
    if (!user) return;

    try {
      await supabase
        .from('message_reactions' as any)
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  return { addReaction, removeReaction };
}

export function useTypingIndicator(groupId: string | undefined) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!groupId || !user) return;

    const channel = supabase.channel(`typing:${groupId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state)
          .flat()
          .filter((p: any) => p.user_id !== user.id && p.typing)
          .map((p: any) => p.display_name || 'Someone');
        setTypingUsers(users);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, user]);

  const setTyping = useCallback(async (typing: boolean) => {
    if (!groupId || !user) return;

    const channel = supabase.channel(`typing:${groupId}`);
    await channel.track({
      user_id: user.id,
      display_name: user.email?.split('@')[0] || 'User',
      typing,
    });
  }, [groupId, user]);

  return { typingUsers, setTyping };
}

export function useMarkAsRead(groupId: string | undefined) {
  const { user } = useAuth();

  const markAsRead = useCallback(async () => {
    if (!groupId || !user) return;

    try {
      await supabase
        .from('group_members' as any)
        .update({ last_read_at: new Date().toISOString() })
        .eq('group_id', groupId)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [groupId, user]);

  return { markAsRead };
}
