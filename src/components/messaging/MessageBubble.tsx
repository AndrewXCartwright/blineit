import { useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { MoreHorizontal, Reply, Check, CheckCheck, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GroupMessage, useMessageReactions } from '@/hooks/useGroupMessages';
import { useAuth } from '@/hooks/useAuth';

interface MessageBubbleProps {
  message: GroupMessage;
  isOwn: boolean;
  showSender?: boolean;
  onReply?: (message: GroupMessage) => void;
  onEdit?: (message: GroupMessage) => void;
  onDelete?: (message: GroupMessage) => void;
  onPin?: (message: GroupMessage) => void;
  canPin?: boolean;
  canDelete?: boolean;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

export function MessageBubble({
  message,
  isOwn,
  showSender = true,
  onReply,
  onEdit,
  onDelete,
  onPin,
  canPin = false,
  canDelete = false,
}: MessageBubbleProps) {
  const { user } = useAuth();
  const { addReaction, removeReaction } = useMessageReactions(message.id);
  const [showReactions, setShowReactions] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  const canEdit = isOwn && 
    new Date().getTime() - new Date(message.created_at).getTime() < 15 * 60 * 1000;

  // Group reactions by emoji
  const reactionGroups = message.reactions?.reduce((acc: Record<string, string[]>, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r.user_id);
    return acc;
  }, {}) || {};

  const handleReaction = (emoji: string) => {
    const hasReacted = reactionGroups[emoji]?.includes(user?.id || '');
    if (hasReacted) {
      removeReaction(emoji);
    } else {
      addReaction(emoji);
    }
    setShowReactions(false);
  };

  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "group flex gap-2 mb-3 px-4",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {!isOwn && showSender && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender?.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {message.sender?.display_name?.charAt(0)?.toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        "flex flex-col max-w-[75%]",
        isOwn ? "items-end" : "items-start"
      )}>
        {!isOwn && showSender && (
          <span className="text-xs text-muted-foreground mb-1 ml-1">
            {message.sender?.display_name}
          </span>
        )}

        {message.parent && (
          <div className={cn(
            "text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1 mb-1 border-l-2",
            isOwn ? "border-primary" : "border-muted-foreground"
          )}>
            <span className="font-medium">{message.parent.sender?.display_name}</span>
            <p className="truncate">{message.parent.content}</p>
          </div>
        )}

        <div className="relative">
          <div
            className={cn(
              "rounded-2xl px-4 py-2 max-w-full break-words",
              isOwn 
                ? "bg-primary text-primary-foreground rounded-br-sm" 
                : "bg-muted rounded-bl-sm",
              message.is_pinned && "ring-2 ring-yellow-500/50"
            )}
          >
            {message.is_pinned && (
              <Pin className="h-3 w-3 inline-block mr-1 text-yellow-500" />
            )}
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Reactions quick picker */}
          {showReactions && (
            <div className={cn(
              "absolute bottom-full mb-1 bg-background border rounded-full shadow-lg p-1 flex gap-0.5 z-10",
              isOwn ? "right-0" : "left-0"
            )}>
              {QUICK_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="p-1.5 hover:bg-muted rounded-full transition-colors text-sm"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message options */}
          <div className={cn(
            "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
            isOwn ? "-left-8" : "-right-8"
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "end" : "start"}>
                <DropdownMenuItem onClick={() => setShowReactions(!showReactions)}>
                  😊 React
                </DropdownMenuItem>
                {onReply && (
                  <DropdownMenuItem onClick={() => onReply(message)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                  Copy text
                </DropdownMenuItem>
                {canPin && onPin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onPin(message)}>
                      <Pin className="h-4 w-4 mr-2" />
                      {message.is_pinned ? 'Unpin' : 'Pin'}
                    </DropdownMenuItem>
                  </>
                )}
                {canEdit && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(message)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {(isOwn || canDelete) && onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => onDelete(message)}
                      className="text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Reactions display */}
        {Object.keys(reactionGroups).length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {Object.entries(reactionGroups).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full border flex items-center gap-1",
                  users.includes(user?.id || '') 
                    ? "bg-primary/10 border-primary" 
                    : "bg-muted border-transparent"
                )}
              >
                <span>{emoji}</span>
                <span>{users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp and status */}
        <div className="flex items-center gap-1 mt-1">
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.created_at)}
          </span>
          {message.is_edited && (
            <span className="text-[10px] text-muted-foreground">(edited)</span>
          )}
          {isOwn && (
            <CheckCheck className="h-3 w-3 text-primary" />
          )}
        </div>
      </div>
    </div>
  );
}
