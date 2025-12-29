import { useNavigate } from 'react-router-dom';
import { Crown, Shield, UserMinus, MessageSquare, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { GroupMember, MessageGroup } from '@/hooks/useMessageGroups';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useMessages';

interface GroupMembersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: GroupMember[];
  loading?: boolean;
  group?: MessageGroup | null;
  onUpdateRole?: (memberId: string, role: GroupMember['role']) => void;
  onRemoveMember?: (memberId: string) => void;
}

const ROLE_ORDER = { owner: 0, admin: 1, moderator: 2, member: 3 };

export function GroupMembersSheet({
  open,
  onOpenChange,
  members,
  loading,
  group,
  onUpdateRole,
  onRemoveMember,
}: GroupMembersSheetProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startConversation } = useConversations();

  const sortedMembers = [...members].sort((a, b) => 
    ROLE_ORDER[a.role] - ROLE_ORDER[b.role]
  );

  const myRole = members.find(m => m.user_id === user?.id)?.role;
  const canManage = myRole === 'owner' || myRole === 'admin';

  const getRoleIcon = (role: GroupMember['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-3 w-3 text-blue-500" />;
      case 'moderator':
        return <Shield className="h-3 w-3 text-purple-500" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: GroupMember['role']) => {
    const variants: Record<string, string> = {
      owner: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      admin: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      moderator: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      member: '',
    };

    if (role === 'member') return null;

    return (
      <Badge variant="outline" className={cn("text-[10px] capitalize", variants[role])}>
        {role}
      </Badge>
    );
  };

  const handleMessage = async (memberId: string) => {
    const conversationId = await startConversation(memberId);
    if (conversationId) {
      onOpenChange(false);
      navigate(`/messages/dm/${memberId}`);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
        <SheetHeader className="text-left">
          <SheetTitle>
            {group?.name} · {members.length} members
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {sortedMembers.map(member => {
                const isMe = member.user_id === user?.id;
                const canManageThis = canManage && !isMe && member.role !== 'owner';

                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.profile?.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      {getRoleIcon(member.role) && (
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
                          {getRoleIcon(member.role)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onOpenChange(false);
                            navigate(`/user/${member.user_id}`);
                          }}
                          className="font-medium truncate hover:underline"
                        >
                          {member.profile?.display_name}
                          {isMe && <span className="text-muted-foreground"> (you)</span>}
                        </button>
                        {getRoleBadge(member.role)}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!isMe && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMessage(member.user_id)}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}

                      {canManageThis && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {myRole === 'owner' && member.role !== 'admin' && (
                              <DropdownMenuItem onClick={() => onUpdateRole?.(member.id, 'admin')}>
                                Make Admin
                              </DropdownMenuItem>
                            )}
                            {member.role === 'admin' && myRole === 'owner' && (
                              <DropdownMenuItem onClick={() => onUpdateRole?.(member.id, 'member')}>
                                Remove Admin
                              </DropdownMenuItem>
                            )}
                            {member.role !== 'moderator' && (
                              <DropdownMenuItem onClick={() => onUpdateRole?.(member.id, 'moderator')}>
                                Make Moderator
                              </DropdownMenuItem>
                            )}
                            {member.role === 'moderator' && (
                              <DropdownMenuItem onClick={() => onUpdateRole?.(member.id, 'member')}>
                                Remove Moderator
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => onRemoveMember?.(member.id)}
                              className="text-destructive"
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remove from group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
