import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, Users, Megaphone, Plus, Search, Building2, Landmark } from "lucide-react";
import { useConversations } from "@/hooks/useMessages";
import { useMessageGroups, MessageGroup } from "@/hooks/useMessageGroups";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/Skeleton";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MessagesHub() {
  const navigate = useNavigate();
  const { conversations, loading: dmsLoading } = useConversations();
  const { groups, loading: groupsLoading } = useMessageGroups();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("groups");

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const getGroupIcon = (group: MessageGroup) => {
    switch (group.type) {
      case 'property_owners':
      case 'property_lenders':
        return <Building2 className="h-5 w-5 text-primary" />;
      case 'loan_lenders':
        return <Landmark className="h-5 w-5 text-blue-500" />;
      default:
        return <Users className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const filteredGroups = groups.filter(g =>
    !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border pt-[env(safe-area-inset-top)]">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold flex-1">Messages</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="direct" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Direct
              {totalUnread > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                  {totalUnread}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <Users className="h-4 w-4" />
              Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="mt-4">
            {groupsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-card rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h2 className="text-lg font-medium text-muted-foreground">No groups yet</h2>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Invest in a property to join the owners group!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGroups.map((group) => (
                  <Link
                    key={group.id}
                    to={`/messages/groups/${group.id}`}
                    className="flex items-center gap-3 p-4 bg-card hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    <Avatar className="h-12 w-12 rounded-lg">
                      <AvatarImage src={group.avatar_url || undefined} className="rounded-lg" />
                      <AvatarFallback className="rounded-lg bg-muted flex items-center justify-center">
                        {getGroupIcon(group)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate block">{group.name}</span>
                      <p className="text-sm text-muted-foreground truncate">
                        {group.last_message?.content || "No messages yet"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {group.last_message && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(group.last_message.created_at), { addSuffix: true })}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {group.member_count}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="direct" className="mt-4">
            {dmsLoading ? (
              <div className="space-y-3">
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
                <h2 className="text-lg font-medium text-muted-foreground">No direct messages</h2>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Visit a user profile to start a conversation
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.filter(c => 
                  !searchQuery || 
                  c.other_user.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
                ).map((conv) => (
                  <Link
                    key={conv.id}
                    to={`/messages/dm/${conv.id}`}
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
                          <Badge variant="default" className="h-5 min-w-5 text-xs">
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
