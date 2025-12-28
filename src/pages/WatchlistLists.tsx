import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Star, Edit2, Trash2, MoreVertical, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useWatchlists } from '@/hooks/useWatchlist';
import { format } from 'date-fns';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';

export default function WatchlistLists() {
  const navigate = useNavigate();
  const { watchlists, createWatchlist, updateWatchlist, deleteWatchlist } = useWatchlists();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWatchlist, setEditingWatchlist] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    createWatchlist.mutate({ name, description, isDefault }, {
      onSuccess: () => {
        setIsCreateOpen(false);
        resetForm();
      },
    });
  };

  const handleUpdate = () => {
    if (!editingWatchlist || !name.trim()) return;
    updateWatchlist.mutate({ id: editingWatchlist, name, description, isDefault }, {
      onSuccess: () => {
        setEditingWatchlist(null);
        resetForm();
      },
    });
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setIsDefault(false);
  };

  const openEdit = (watchlist: typeof watchlists[0]) => {
    setName(watchlist.name);
    setDescription(watchlist.description || '');
    setIsDefault(watchlist.is_default);
    setEditingWatchlist(watchlist.id);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FolderOpen className="h-6 w-6" />
              My Watchlists
            </h1>
            <p className="text-sm text-muted-foreground">Organize your tracked assets</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Watchlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g., High Yield Targets"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="What's this watchlist for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="default">Set as default watchlist</Label>
                  <Switch id="default" checked={isDefault} onCheckedChange={setIsDefault} />
                </div>
                <Button className="w-full" onClick={handleCreate} disabled={!name.trim()}>
                  Create Watchlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingWatchlist} onOpenChange={(open) => !open && setEditingWatchlist(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Watchlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g., High Yield Targets"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  placeholder="What's this watchlist for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="default-edit">Set as default watchlist</Label>
                <Switch id="default-edit" checked={isDefault} onCheckedChange={setIsDefault} />
              </div>
              <Button className="w-full" onClick={handleUpdate} disabled={!name.trim()}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Watchlists */}
        <div className="space-y-3">
          {watchlists.length === 0 ? (
            <Card className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No watchlists yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create watchlists to organize your tracked assets.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Watchlist
              </Button>
            </Card>
          ) : (
            watchlists.map((watchlist) => (
              <Card key={watchlist.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{watchlist.name}</span>
                          {watchlist.is_default && (
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {watchlist.item_count} items • Created {format(new Date(watchlist.created_at), 'MMM d, yyyy')}
                        </p>
                        {watchlist.description && (
                          <p className="text-sm text-muted-foreground">{watchlist.description}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/watchlist/${watchlist.id}`)}>
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(watchlist)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteWatchlist.mutate(watchlist.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => navigate(`/watchlist/${watchlist.id}`)}
                    >
                      View
                    </Button>
                    <Button variant="outline" onClick={() => openEdit(watchlist)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-destructive"
                      onClick={() => deleteWatchlist.mutate(watchlist.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
