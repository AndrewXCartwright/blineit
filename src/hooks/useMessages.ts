import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  last_message_preview: string | null;
  created_at: string;
  other_user: {
    user_id: string;
    display_name: string;
    avatar_url: string | null;
  };
  unread_count: number;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get other user profiles
      const otherUserIds = (data || []).map(c => 
        c.participant_1 === user.id ? c.participant_2 : c.participant_1
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', otherUserIds);

      const profileMap = (profiles || []).reduce((acc: Record<string, any>, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {});

      // Get unread counts
      const { data: unreadCounts } = await supabase
        .from('direct_messages')
        .select('conversation_id')
        .neq('sender_id', user.id)
        .is('read_at', null);

      const unreadMap = (unreadCounts || []).reduce((acc: Record<string, number>, m) => {
        acc[m.conversation_id] = (acc[m.conversation_id] || 0) + 1;
        return acc;
      }, {});

      setConversations((data || []).map(c => {
        const otherUserId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
        return {
          ...c,
          other_user: profileMap[otherUserId] || { user_id: otherUserId, display_name: 'Unknown', avatar_url: null },
          unread_count: unreadMap[c.id] || 0,
        };
      }));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const startConversation = async (otherUserId: string): Promise<string | null> => {
    if (!user) {
      toast.error('Please sign in to message');
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        p_other_user_id: otherUserId,
      });

      if (error) throw error;
      await fetchConversations();
      return data;
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast.error(error.message || 'Failed to start conversation');
      return null;
    }
  };

  return { conversations, loading, startConversation, refetch: fetchConversations };
}

export function useConversation(conversationId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{ user_id: string; display_name: string; avatar_url: string | null } | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      // Get conversation
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (conv) {
        const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .eq('user_id', otherUserId)
          .single();
        setOtherUser(profile);
      }

      // Get messages
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark as read
      await supabase
        .from('direct_messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as DirectMessage;
          setMessages(prev => [...prev, newMessage]);
          
          // Mark as read if from other user
          if (user && newMessage.sender_id !== user.id) {
            supabase
              .from('direct_messages')
              .update({ read_at: new Date().toISOString() })
              .eq('id', newMessage.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  const sendMessage = async (content: string) => {
    if (!user || !content.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.rpc('send_direct_message', {
        p_conversation_id: conversationId,
        p_content: content.trim(),
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, sending, sendMessage, otherUser, refetch: fetchMessages };
}
