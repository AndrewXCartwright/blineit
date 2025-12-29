import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Settings, Bell, Shield, Users, Trash2, LogOut, 
  Crown, Image, Link as LinkIcon, Building2, AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useGroupDetails } from '@/hooks/useMessageGroups';
import { useGroupSettings } from '@/hooks/useGroupModeration';
import { useAuth } from '@/hooks/useAuth';

export default function GroupSettings() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { group, loading } = useGroupDetails(groupId || '');
  const { updating, updateSettings, updateGroupInfo, deleteGroup, leaveGroup } = useGroupSettings(groupId || '');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [settings, setSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
      setSettings(group.settings || {});
    }
  }, [group]);

  const isOwnerOrAdmin = group?.userRole === 'owner' || group?.userRole === 'admin';
  const isOwner = group?.userRole === 'owner';

  const handleSaveInfo = async () => {
    await updateGroupInfo(name, description);
  };

  const handleSettingChange = async (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await updateSettings(newSettings);
  };

  const handleLeave = async () => {
    if (!user) return;
    const success = await leaveGroup(user.id);
    if (success) navigate('/messages');
  };

  const handleDelete = async () => {
    const success = await deleteGroup();
    if (success) navigate('/messages');
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24">
        <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-6 w-32" />
          </div>
        </header>
        <main className="px-4 py-6 space-y-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Group not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="sticky top-0 z-40 glass-card border-b border-border/50 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to={`/messages/groups/${groupId}`} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg">Group Settings</h1>
            <p className="text-xs text-muted-foreground">{group.name}</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Group Info */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent" />
            <h2 className="font-display font-semibold">Group Info</h2>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Group Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isOwnerOrAdmin}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isOwnerOrAdmin}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                {group.type.replace('_', ' ')}
              </span>
              {group.property_id && (
                <Link to={`/property/${group.property_id}`} className="flex items-center gap-1 hover:text-foreground">
                  <Building2 className="w-4 h-4" />
                  View Property
                </Link>
              )}
            </div>
            {isOwnerOrAdmin && (
              <Button onClick={handleSaveInfo} disabled={updating} size="sm">
                Save Changes
              </Button>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-accent" />
            <h2 className="font-display font-semibold">Notifications</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notification Level</p>
                <p className="text-sm text-muted-foreground">Choose what notifications you receive</p>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All messages</SelectItem>
                  <SelectItem value="mentions">Mentions only</SelectItem>
                  <SelectItem value="none">Nothing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Mute Group</p>
                <p className="text-sm text-muted-foreground">Temporarily disable notifications</p>
              </div>
              <Select defaultValue="off">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="8h">8 hours</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Privacy Settings (Admin only) */}
        {isOwnerOrAdmin && (
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-accent" />
              <h2 className="font-display font-semibold">Privacy & Permissions</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow member invites</p>
                  <p className="text-sm text-muted-foreground">Let members invite others</p>
                </div>
                <Switch
                  checked={settings.allow_member_invites}
                  onCheckedChange={(v) => handleSettingChange('allow_member_invites', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show member list</p>
                  <p className="text-sm text-muted-foreground">Allow members to see other members</p>
                </div>
                <Switch
                  checked={settings.members_can_see_members}
                  onCheckedChange={(v) => handleSettingChange('members_can_see_members', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow reactions</p>
                  <p className="text-sm text-muted-foreground">Let members react to messages</p>
                </div>
                <Switch
                  checked={settings.allow_reactions}
                  onCheckedChange={(v) => handleSettingChange('allow_reactions', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow replies/threading</p>
                  <p className="text-sm text-muted-foreground">Let members reply to specific messages</p>
                </div>
                <Switch
                  checked={settings.allow_replies}
                  onCheckedChange={(v) => handleSettingChange('allow_replies', v)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Who can send messages</p>
                </div>
                <Select 
                  value={settings.who_can_send || 'everyone'}
                  onValueChange={(v) => handleSettingChange('who_can_send', v)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="admins">Admins only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Who can pin messages</p>
                </div>
                <Select
                  value={settings.who_can_pin || 'admins'}
                  onValueChange={(v) => handleSettingChange('who_can_pin', v)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="moderators">Moderators+</SelectItem>
                    <SelectItem value="admins">Admins only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Slow mode</p>
                  <p className="text-sm text-muted-foreground">Limit message frequency</p>
                </div>
                <Select
                  value={String(settings.slow_mode_seconds || 0)}
                  onValueChange={(v) => handleSettingChange('slow_mode_seconds', parseInt(v))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Off</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Filter profanity</p>
                  <p className="text-sm text-muted-foreground">Auto-hide flagged messages</p>
                </div>
                <Switch
                  checked={settings.filter_profanity}
                  onCheckedChange={(v) => handleSettingChange('filter_profanity', v)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Member Management Link */}
        <Link to={`/messages/groups/${groupId}/members`} className="block">
          <div className="glass-card rounded-2xl p-5 hover:bg-accent/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Manage Members</p>
                  <p className="text-sm text-muted-foreground">{group.member_count} members</p>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
            </div>
          </div>
        </Link>

        {/* Danger Zone */}
        <div className="glass-card rounded-2xl p-5 space-y-4 border border-destructive/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h2 className="font-display font-semibold text-destructive">Danger Zone</h2>
          </div>

          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                  <LogOut className="w-4 h-4" />
                  Leave Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave group?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to leave this group? You'll need an invite to rejoin.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLeave} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Leave
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full justify-start gap-2">
                    <Trash2 className="w-4 h-4" />
                    Delete Group
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete group?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. All messages and member data will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
