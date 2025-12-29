import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Users, Pin, MoreVertical, Send, Settings } from "lucide-react";
import { useGroupMessages, useSendMessage, useTypingIndicator, useMarkAsRead, GroupMessage } from "@/hooks/useGroupMessages";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useGroupDetails, useGroupMembers } from "@/hooks/useMessageGroups";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { format, isToday, isYesterday, isSameDay } from "date-fns";

export default function GroupChatView() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");

  const { group, loading: groupLoading } = useGroupDetails(groupId);
  const { messages, loading: messagesLoading, hasMore, loadMore } = useGroupMessages(groupId);
  const { sendMessage, sending } = useSendMessage(groupId);
  const { typingUsers } = useTypingIndicator(groupId);
  const { markAsRead } = useMarkAsRead(groupId);

  useEffect(() => {
    if (groupId) markAsRead();
  }, [groupId, messages.length, markAsRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;
    const success = await sendMessage(message.trim());
    if (success) setMessage("");
  };

  const groupedMessages: { date: Date; messages: GroupMessage[] }[] = [];
  messages.forEach(msg => {
    const msgDate = new Date(msg.created_at);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && isSameDay(lastGroup.date, msgDate)) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: msgDate, messages: [msg] });
    }
  });

  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  if (groupLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
        </header>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">Group not found</p>
          <Button variant="outline" onClick={() => navigate("/messages")}>Back to Messages</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={group.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">{group.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{group.name}</h1>
            <p className="text-xs text-muted-foreground">{group.member_count} members</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/messages/groups/${groupId}/members`}>
                  <Users className="h-4 w-4 mr-2" />
                  Members
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/messages/groups/${groupId}/settings`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {hasMore && <div className="text-center"><Button variant="ghost" size="sm" onClick={loadMore}>Load older</Button></div>}
        
        {messagesLoading ? (
          <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-3/4" />)}</div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[50vh]">
            <p className="text-muted-foreground">Be the first to say hello! 👋</p>
          </div>
        ) : (
          groupedMessages.map((grp, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-4 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{formatDateHeader(grp.date)}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {grp.messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    {!isOwn && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={msg.sender?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">{msg.sender?.display_name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="max-w-[75%]">
                      {!isOwn && <p className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender?.display_name}</p>}
                      <div className={`px-4 py-2 rounded-2xl ${isOwn ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'}`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {format(new Date(msg.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        {typingUsers.length > 0 && <p className="text-sm text-muted-foreground animate-pulse">{typingUsers[0]} is typing...</p>}
        <div ref={messagesEndRef} />
      </main>

      {!group.is_readonly && (
        <footer className="sticky bottom-0 bg-background border-t border-border p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-muted rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={sending}
            />
            <Button type="submit" size="lg" className="rounded-full aspect-square" disabled={!message.trim() || sending}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </footer>
      )}
    </div>
  );
}
