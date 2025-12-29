import { format, isToday, isYesterday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Megaphone, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageGroup } from '@/hooks/useMessageGroups';

interface GroupsListProps {
  groups: MessageGroup[];
  loading?: boolean;
  emptyMessage?: string;
}

export function GroupsList({ groups, loading, emptyMessage }: GroupsListProps) {
  const navigate = useNavigate();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const getGroupIcon = (type: MessageGroup['type']) => {
    switch (type) {
      case 'property_owners':
      case 'property_lenders':
        return Building2;
      case 'loan_lenders':
        return Building2;
      case 'announcement':
        return Megaphone;
      case 'management':
        return Users;
      default:
        return MessageSquare;
    }
  };

  const getGroupColor = (type: MessageGroup['type']) => {
    switch (type) {
      case 'property_owners':
        return 'bg-emerald-500';
      case 'property_lenders':
      case 'loan_lenders':
        return 'bg-blue-500';
      case 'announcement':
        return 'bg-amber-500';
      case 'management':
        return 'bg-purple-500';
      default:
        return 'bg-primary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-3 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          {emptyMessage || "No groups yet. Invest in a property to join the owners group!"}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {groups.map(group => {
        const Icon = getGroupIcon(group.type);
        const colorClass = getGroupColor(group.type);

        return (
          <button
            key={group.id}
            onClick={() => navigate(`/messages/groups/${group.id}`)}
            className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                {group.avatar_url ? (
                  <AvatarImage src={group.avatar_url} />
                ) : (
                  <AvatarFallback className={cn(colorClass, 'text-white')}>
                    <Icon className="h-5 w-5" />
                  </AvatarFallback>
                )}
              </Avatar>
              {group.unread_count && group.unread_count > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center"
                >
                  {group.unread_count > 99 ? '99+' : group.unread_count}
                </Badge>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn(
                  "font-medium truncate",
                  group.unread_count && group.unread_count > 0 && "font-semibold"
                )}>
                  {group.name}
                </h3>
                {group.is_readonly && (
                  <Badge variant="secondary" className="text-[10px] px-1">
                    Read-only
                  </Badge>
                )}
              </div>
              {group.last_message ? (
                <p className={cn(
                  "text-sm truncate",
                  group.unread_count && group.unread_count > 0 
                    ? "text-foreground font-medium" 
                    : "text-muted-foreground"
                )}>
                  <span className="font-medium">{group.last_message.sender_name}:</span>{' '}
                  {group.last_message.content}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No messages yet</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              {group.last_message && (
                <span className={cn(
                  "text-xs",
                  group.unread_count && group.unread_count > 0 
                    ? "text-primary font-medium" 
                    : "text-muted-foreground"
                )}>
                  {formatTime(group.last_message.created_at)}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {group.member_count}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
