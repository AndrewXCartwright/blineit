import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { getNotificationStyle } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  ArrowLeft,
  Archive,
  RotateCcw,
  Trash2,
  Bell,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ArchivedNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  archived_at: string | null;
  data: any;
}

const ArchivedNotifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<ArchivedNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArchivedNotifications();
  }, [user]);

  const fetchArchivedNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_archived", true)
        .order("archived_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching archived notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const restoreNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_archived: false, archived_at: null })
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification restored");
    } catch (error) {
      console.error("Error restoring notification:", error);
      toast.error("Failed to restore notification");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const deleteAllArchived = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", user.id)
        .eq("is_archived", true);

      if (error) throw error;

      setNotifications([]);
      toast.success("All archived notifications deleted");
    } catch (error) {
      console.error("Error deleting all archived:", error);
      toast.error("Failed to delete notifications");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/notifications")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Archived
              </h1>
              <p className="text-sm text-muted-foreground">
                {notifications.length} archived notifications
              </p>
            </div>
          </div>
          {notifications.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete all archived notifications?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All {notifications.length} archived
                    notifications will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAllArchived}>
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Archive className="h-8 w-8" />}
            title="No archived notifications"
            description="Notifications you archive will appear here"
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const style = getNotificationStyle(notification.type);

              return (
                <div
                  key={notification.id}
                  className="rounded-lg border bg-card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${style.bg}`}>
                      <style.icon className={`h-4 w-4 ${style.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          Created: {format(parseISO(notification.created_at), "MMM d, yyyy")}
                        </span>
                        {notification.archived_at && (
                          <span>
                            Archived: {format(parseISO(notification.archived_at), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => restoreNotification(notification.id)}
                        title="Restore"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default ArchivedNotifications;
