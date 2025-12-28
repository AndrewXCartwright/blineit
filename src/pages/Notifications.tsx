import { useState } from "react";
import { ArrowLeft, Bell, CheckCheck, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useNotifications, getNotificationStyle, Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";

export default function Notifications() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // Navigate based on type
    const url = getNotificationLink(notification);
    if (url !== "#") {
      navigate(url);
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case "bet_won":
      case "bet_lost":
      case "market_expiring":
        return "/predict";
      case "dividend_received":
      case "new_property":
        return notification.data?.property_id 
          ? `/property/${notification.data.property_id}` 
          : "/explore";
      default:
        return "#";
    }
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at);
    let key: string;
    
    if (isToday(date)) {
      key = "Today";
    } else if (isYesterday(date)) {
      key = "Yesterday";
    } else {
      key = format(date, "MMMM d, yyyy");
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/profile" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="font-display text-xl font-bold text-foreground">Notifications</h1>
            </div>
          </div>
        </header>
        <main className="px-4 py-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/profile" className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-display text-xl font-bold text-foreground">Notifications</h1>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                Mark All Read
              </Button>
            )}
            <Link to="/settings/notifications">
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-12 h-12" />}
            title="No notifications yet"
            description="When you have activity, you'll see it here"
          />
        ) : (
          Object.entries(groupedNotifications).map(([dateKey, items]) => (
            <div key={dateKey} className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground px-1">
                {dateKey}
              </h2>
              <div className="space-y-2">
                {items.map((notification) => {
                  const style = getNotificationStyle(notification.type);
                  return (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full glass-card rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors ${
                        !notification.is_read ? "border-l-4 border-l-primary bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl ${style.bg} flex-shrink-0`}>
                          <style.icon className={`h-5 w-5 ${style.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`font-medium ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                NEW
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {notifications.length > 0 && notifications.length >= 50 && (
          <div className="text-center py-4">
            <Button variant="outline" className="gap-2">
              Load More
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
