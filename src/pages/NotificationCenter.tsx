import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useNotifications, getNotificationStyle } from "@/hooks/useNotifications";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Archive,
  Bell,
  Settings,
  Filter,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NotificationCenter = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filters = [
    { id: "all", label: "All" },
    { id: "unread", label: `Unread (${unreadCount})` },
    { id: "transaction", label: "Transactions" },
    { id: "portfolio", label: "Portfolio" },
    { id: "social", label: "Social" },
    { id: "system", label: "System" },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "all") return !n.is_read || true;
    if (activeFilter === "unread") return !n.is_read;
    return n.type === activeFilter;
  });

  const groupNotificationsByDate = () => {
    const groups: { [key: string]: typeof notifications } = {};

    filteredNotifications.forEach((notification) => {
      const date = parseISO(notification.created_at);
      let groupKey: string;

      if (isToday(date)) {
        groupKey = "Today";
      } else if (isYesterday(date)) {
        groupKey = "Yesterday";
      } else {
        groupKey = format(date, "MMMM d, yyyy");
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  };

  const groupedNotifications = groupNotificationsByDate();

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setExpandedId(expandedId === notification.id ? null : notification.id);
  };

  const getActionUrl = (notification: typeof notifications[0]) => {
    const data = notification.data as Record<string, any> | null;
    if (data?.action_url) return data.action_url;

    switch (notification.type) {
      case "investment":
        return data?.property_id ? `/property/${data.property_id}` : "/assets";
      case "dividend":
        return "/wallet";
      case "prediction":
        return data?.prediction_id ? `/predict` : "/predict";
      case "social":
        return data?.user_id ? `/user/${data.user_id}` : "/community";
      case "governance":
        return data?.proposal_id ? `/governance/${data.proposal_id}` : "/governance";
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
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
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings/notifications")}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Unread:</span>
            <Badge variant={unreadCount > 0 ? "default" : "secondary"}>
              {unreadCount}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Today:</span>
            <span className="font-medium">
              {notifications.filter((n) => isToday(parseISO(n.created_at))).length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">This Week:</span>
            <span className="font-medium">{notifications.length}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.id)}
              className="whitespace-nowrap"
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-8 w-8" />}
            title="No notifications"
            description={
              activeFilter === "unread"
                ? "You're all caught up!"
                : "You don't have any notifications yet"
            }
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([dateGroup, notifs]) => (
              <div key={dateGroup} className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground px-1">
                  {dateGroup}
                </h3>
                {notifs.map((notification) => {
                  const style = getNotificationStyle(notification.type);
                  const isExpanded = expandedId === notification.id;
                  const actionUrl = getActionUrl(notification);

                  return (
                    <div
                      key={notification.id}
                      className={`rounded-lg border p-4 transition-all cursor-pointer ${
                        !notification.is_read
                          ? "bg-primary/5 border-primary/20"
                          : "bg-card"
                      } ${isExpanded ? "ring-2 ring-primary/20" : ""}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-full ${style.bg}`}
                        >
                          <style.icon className={`h-4 w-4 ${style.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(parseISO(notification.created_at), "h:mm a")}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t space-y-3">
                              {notification.data && (
                                <div className="text-sm space-y-1">
                                  {Object.entries(
                                    notification.data as Record<string, any>
                                  )
                                    .filter(
                                      ([key]) =>
                                        !["action_url", "action_text"].includes(key)
                                    )
                                    .map(([key, value]) => (
                                      <div key={key} className="flex justify-between">
                                        <span className="text-muted-foreground capitalize">
                                          {key.replace(/_/g, " ")}:
                                        </span>
                                        <span className="font-medium">{String(value)}</span>
                                      </div>
                                    ))}
                                </div>
                              )}
                              <div className="flex items-center justify-between pt-2">
                                <div className="flex gap-2">
                                  {actionUrl && (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(actionUrl);
                                      }}
                                    >
                                      {(notification.data as any)?.action_text || "View Details"}
                                      <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Archive functionality
                                    }}
                                  >
                                    <Archive className="h-4 w-4 mr-1" />
                                    Archive
                                  </Button>
                                  {notification.is_read && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Mark unread
                                      }}
                                    >
                                      Mark Unread
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Mark as Read
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Archived Link */}
        <div className="pt-4">
          <Link
            to="/notifications/archived"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Archive className="h-4 w-4" />
            View Archived Notifications
          </Link>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default NotificationCenter;
