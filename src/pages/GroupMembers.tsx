import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Search, Crown, Shield, ShieldCheck, User, 
  MoreVertical, UserMinus, Ban, VolumeX, ChevronUp, ChevronDown,
  Copy, Plus, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGroupMembers, useGroupDetails } from '@/hooks/useMessageGroups';
import { useGroupBans, useGroupInvites, useMuteMember, useGroupSettings } from '@/hooks/useGroupModeration';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Crown className="w-4 h-4 text-amber-500" />,
  admin: <ShieldCheck className="w-4 h-4 text-blue-500" />,
  moderator: <Shield className="w-4 h-4 text-green-500" />,
  member: <User className="w-4 h-4 text-muted-foreground" />
};

const roleOrder = ['owner', 'admin', 'moderator', 'member'];

export default function GroupMembers() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const { group } = useGroupDetails(groupId || '');
  const { members, loading, updateMemberRole, removeMember } = useGroupMembers(groupId || '');
  const { bans, fetchBans, banMember, unbanMember } = useGroupBans(groupId || '');
  const { invites, fetchInvites, createInvite, deleteInvite, creating } = useGroupInvites(groupId || '');
  const { muteMember, unmuteMember, muting } = useMuteMember(groupId || '');
  const { updateMemberRole: changeRole } = useGroupSettings(groupId || '');

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'joined'>('role');
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);
  const [muteDuration, setMuteDuration] = useState('3600');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  useEffect(() => {
    fetchBans();
    fetchInvites();
  }, [fetchBans, fetchInvites]);

  const userRole = group?.userRole;
  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin' || isOwner;
  const isModerator = userRole === 'moderator' || isAdmin;

  const filteredMembers = members
    .filter(m => m.profile?.display_name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'role') {
        return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
      }
      if (sortBy === 'name') {
        return (a.profile?.display_name || '').localeCompare(b.profile?.display_name || '');
      }
      return new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime();
    });

  const handlePromote = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'member' ? 'moderator' : currentRole === 'moderator' ? 'admin' : null;
    if (nextRole) {
      await changeRole(userId, nextRole);
    }
  };

  const handleDemote = async (userId: string, currentRole: string) => {
    const prevRole = currentRole === 'admin' ? 'moderator' : currentRole === 'moderator' ? 'member' : null;
    if (prevRole) {
      await changeRole(userId, prevRole);
    }
  };

  const handleMute = async () => {
    if (!selectedUser) return;
    await muteMember(selectedUser, parseInt(muteDuration));
    setMuteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleBan = async () => {
    if (!selectedUser) return;
    await banMember(selectedUser, banReason);
    setBanDialogOpen(false);
    setSelectedUser(null);
    setBanReason('');
  };

  const copyInviteLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/messages/invite/${code}`);
    toast.success('Invite link copied');
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
          <Skeleton className="h-6 w-32" />
        </header>
        <main className="px-4 py-6 space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to={`/messages/groups/${groupId}/settings`} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg">Members</h1>
            <p className="text-xs text-muted-foreground">{members.length} members</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <Tabs defaultValue="members">
          <TabsList className="w-full">
            <TabsTrigger value="members" className="flex-1">Members</TabsTrigger>
            {isAdmin && <TabsTrigger value="invites" className="flex-1">Invites</TabsTrigger>}
            {isAdmin && <TabsTrigger value="banned" className="flex-1">Banned</TabsTrigger>}
          </TabsList>

          <TabsContent value="members" className="space-y-4 mt-4">
            {/* Search & Sort */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="role">By Role</SelectItem>
                  <SelectItem value="name">By Name</SelectItem>
                  <SelectItem value="joined">By Join Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div key={member.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.profile?.avatar_url || undefined} />
                    <AvatarFallback>{member.profile?.display_name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{member.profile?.display_name || 'Unknown'}</p>
                      {roleIcons[member.role]}
                      {member.muted && <VolumeX className="w-4 h-4 text-destructive" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined {format(new Date(member.joined_at), 'MMM d, yyyy')}
                    </p>
                  </div>

                  {isModerator && member.user_id !== user?.id && member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isOwner && member.role !== 'admin' && (
                          <DropdownMenuItem onClick={() => handlePromote(member.user_id, member.role)}>
                            <ChevronUp className="w-4 h-4 mr-2" />
                            Promote
                          </DropdownMenuItem>
                        )}
                        {isOwner && member.role !== 'member' && (
                          <DropdownMenuItem onClick={() => handleDemote(member.user_id, member.role)}>
                            <ChevronDown className="w-4 h-4 mr-2" />
                            Demote
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {member.muted ? (
                          <DropdownMenuItem onClick={() => unmuteMember(member.user_id)}>
                            <VolumeX className="w-4 h-4 mr-2" />
                            Unmute
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => { setSelectedUser(member.user_id); setMuteDialogOpen(true); }}>
                            <VolumeX className="w-4 h-4 mr-2" />
                            Mute
                          </DropdownMenuItem>
                        )}
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => removeMember(member.user_id)} className="text-destructive">
                              <UserMinus className="w-4 h-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedUser(member.user_id); setBanDialogOpen(true); }} className="text-destructive">
                              <Ban className="w-4 h-4 mr-2" />
                              Ban
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="invites" className="space-y-4 mt-4">
            <Button onClick={() => createInvite(undefined, 7)} disabled={creating} className="w-full gap-2">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create Invite Link
            </Button>

            <div className="space-y-2">
              {invites.map((invite) => (
                <div key={invite.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm">{invite.invite_code}</p>
                    <p className="text-xs text-muted-foreground">
                      {invite.uses}/{invite.max_uses || '∞'} uses
                      {invite.expires_at && ` • Expires ${format(new Date(invite.expires_at), 'MMM d')}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => copyInviteLink(invite.invite_code)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteInvite(invite.id)}>
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {invites.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No active invites</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="banned" className="space-y-4 mt-4">
            <div className="space-y-2">
              {bans.map((ban) => (
                <div key={ban.id} className="glass-card rounded-xl p-4 flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={ban.banned_user?.avatar_url || undefined} />
                    <AvatarFallback>{ban.banned_user?.display_name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{ban.banned_user?.display_name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      {ban.reason || 'No reason provided'}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => unbanMember(ban.user_id)}>
                    Unban
                  </Button>
                </div>
              ))}
              {bans.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No banned users</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Mute Dialog */}
      <Dialog open={muteDialogOpen} onOpenChange={setMuteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mute Member</DialogTitle>
            <DialogDescription>Choose how long to mute this member.</DialogDescription>
          </DialogHeader>
          <Select value={muteDuration} onValueChange={setMuteDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3600">1 hour</SelectItem>
              <SelectItem value="86400">24 hours</SelectItem>
              <SelectItem value="604800">7 days</SelectItem>
              <SelectItem value="0">Permanent</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMuteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMute} disabled={muting}>
              {muting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Mute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Member</DialogTitle>
            <DialogDescription>This will remove the member and prevent them from rejoining.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Reason (optional)"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBan}>Ban</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
