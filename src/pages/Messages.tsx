import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, ArrowLeft, Search, X } from "lucide-react";
import { useConversations } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/Skeleton";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UserResult {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  name: string | null;
}

export default function Messages() {
  const { conversations, loading, startConversation } = useConversations();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, name")
        .neq("user_id", user?.id || "")
        .or(`display_name.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
        .limit(10);
      
      setSearchResults(data || []);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, user?.id]);

  const handleStartConversation = async (userId: string) => {
    setStarting(userId);
    const conversationId = await startConversation(userId);
    if (conversationId) {
      navigate(`/messages/${conversationId}`);
    }
    setStarting(null);
  };

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

      <main className="container mx-auto px-4 py-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users to message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="space-y-2">
            {searching ? (
              <div className="flex items-center gap-3 p-4 bg-card rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
            ) : (
              searchResults.map((u) => (
                <button
                  key={u.user_id}
                  onClick={() => handleStartConversation(u.user_id)}
                  disabled={starting === u.user_id}
                  className="w-full flex items-center gap-3 p-4 bg-card hover:bg-muted/50 rounded-lg transition-colors text-left"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.avatar_url || undefined} />
                    <AvatarFallback>
                      {(u.display_name || u.name)?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{u.display_name || u.name || "User"}</span>
                  {starting === u.user_id && (
                    <span className="ml-auto text-xs text-muted-foreground">Starting...</span>
                  )}
                </button>
              ))
            )}
          </div>
        )}

        {/* Conversations List */}
        {!searchQuery && (loading ? (
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
              Search for users above to start a conversation
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
        ))}
      </main>
    </div>
  );
}
