import { Link } from "react-router-dom";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { useConversations } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/Skeleton";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Messages() {
  const { conversations, loading } = useConversations();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-medium text-muted-foreground">No messages yet</h2>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Start a conversation from someone's profile
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/messages/${conv.id}`}
                className="flex items-center gap-3 p-4 bg-card hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conv.other_user.avatar_url || undefined} />
                  <AvatarFallback>
                    {conv.other_user.display_name?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{conv.other_user.display_name}</span>
                    {conv.unread_count > 0 && (
                      <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center text-xs">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.last_message_preview || "No messages yet"}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
