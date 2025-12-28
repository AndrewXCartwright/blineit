import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Trophy,
  Heart,
  UserPlus,
  Bell,
  Shield,
  FileText,
  Vote,
  Zap,
  Home,
  Clock,
  MessageCircle,
  AlertTriangle,
  LucideIcon,
} from "lucide-react";

export type NotificationType =
  | "bet_won"
  | "bet_lost"
  | "dividend_received"
  | "market_expiring"
  | "new_property"
  | "investment"
  | "dividend"
  | "prediction"
  | "social"
  | "governance"
  | "security"
  | "system"
  | "achievement";

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  is_archived?: boolean;
  data: Record<string, any> | null;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data as unknown as Notification[]);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const updatedNotification = payload.new as Notification;
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
          // Recalculate unread count
          setNotifications(current => {
            setUnreadCount(current.filter(n => !n.is_read).length);
            return current;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (!error) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const archiveNotification = async (notificationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("notifications")
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    refetch: fetchNotifications,
  };
}

// Helper to get icon and color for notification type
export function getNotificationStyle(type: string): { icon: LucideIcon; color: string; bg: string } {
  switch (type) {
    case "bet_won":
    case "achievement":
      return { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-500/20" };
    case "bet_lost":
      return { icon: TrendingDown, color: "text-destructive", bg: "bg-destructive/20" };
    case "dividend_received":
    case "dividend":
      return { icon: DollarSign, color: "text-green-500", bg: "bg-green-500/20" };
    case "market_expiring":
      return { icon: Clock, color: "text-orange-500", bg: "bg-orange-500/20" };
    case "new_property":
      return { icon: Home, color: "text-blue-500", bg: "bg-blue-500/20" };
    case "investment":
      return { icon: TrendingUp, color: "text-primary", bg: "bg-primary/20" };
    case "prediction":
      return { icon: Zap, color: "text-purple-500", bg: "bg-purple-500/20" };
    case "social":
      return { icon: UserPlus, color: "text-pink-500", bg: "bg-pink-500/20" };
    case "governance":
      return { icon: Vote, color: "text-indigo-500", bg: "bg-indigo-500/20" };
    case "security":
      return { icon: Shield, color: "text-red-500", bg: "bg-red-500/20" };
    case "system":
      return { icon: FileText, color: "text-muted-foreground", bg: "bg-muted" };
    default:
      return { icon: Bell, color: "text-foreground", bg: "bg-secondary" };
  }
}
