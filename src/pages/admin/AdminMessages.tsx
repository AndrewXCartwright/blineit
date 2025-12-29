import { useState, useEffect } from 'react';
import { 
  MessageSquare, Flag, Users, AlertTriangle, Check, X, 
  Eye, Trash2, Ban, Search, Filter, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useMessageReports } from '@/hooks/useGroupModeration';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface MessageGroup {
  id: string;
  name: string;
  type: string;
  member_count: number;
  created_at: string;
}

interface MessageStats {
  totalGroups: number;
  totalMessages: number;
  messagesThisWeek: number;
  pendingReports: number;
}

export default function AdminMessages() {
  const { reports, loading: reportsLoading, fetchReports, reviewReport } = useMessageReports();
  const [groups, setGroups] = useState<MessageGroup[]>([]);
  const [stats, setStats] = useState<MessageStats>({ totalGroups: 0, totalMessages: 0, messagesThisWeek: 0, pendingReports: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
    fetchReports('pending');
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch groups with member counts
      const { data: groupsData } = await supabase
        .from('message_groups')
        .select('id, name, type, created_at')
        .order('created_at', { ascending: false });

      // Get member counts
      const groupsWithCounts = await Promise.all((groupsData || []).map(async (group) => {
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);
        return { ...group, member_count: count || 0 };
      }));

      setGroups(groupsWithCounts);

      // Fetch stats
      const { count: totalGroups } = await supabase
        .from('message_groups')
        .select('*', { count: 'exact', head: true });

      const { count: totalMessages } = await supabase
        .from('group_messages')
        .select('*', { count: 'exact', head: true });

      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: messagesThisWeek } = await supabase
        .from('group_messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);

      const { count: pendingReports } = await supabase
        .from('message_reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalGroups: totalGroups || 0,
        totalMessages: totalMessages || 0,
        messagesThisWeek: messagesThisWeek || 0,
        pendingReports: pendingReports || 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReport = async (action: 'actioned' | 'dismissed', actionTaken?: string) => {
    if (!selectedReport) return;
    await reviewReport(selectedReport.id, action, actionTaken);
    setActionDialogOpen(false);
    setSelectedReport(null);
    fetchReports('pending');
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || g.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Message Moderation</h1>
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                <span className="text-2xl font-bold">{stats.totalGroups}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">{stats.messagesThisWeek.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-destructive" />
                <span className="text-2xl font-bold">{stats.pendingReports}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports">
          <TabsList>
            <TabsTrigger value="reports" className="gap-2">
              <Flag className="w-4 h-4" />
              Reports ({stats.pendingReports})
            </TabsTrigger>
            <TabsTrigger value="groups" className="gap-2">
              <Users className="w-4 h-4" />
              Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="mt-4 space-y-4">
            {reportsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
            ) : reports.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Check className="w-12 h-12 text-green-500 mb-4" />
                  <p className="text-lg font-medium">All caught up!</p>
                  <p className="text-muted-foreground">No pending reports to review</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                              {report.reason}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(report.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          {report.details && (
                            <p className="text-sm text-muted-foreground mb-2">{report.details}</p>
                          )}
                          <div className="bg-muted rounded-lg p-3">
                            <p className="text-sm">"{report.message?.content || 'Message deleted'}"</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { setSelectedReport(report); setActionDialogOpen(true); }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-green-500"
                            onClick={() => reviewReport(report.id, 'dismissed')}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => reviewReport(report.id, 'actioned', 'Message deleted')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="groups" className="mt-4 space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="property_owners">Property Owners</SelectItem>
                  <SelectItem value="loan_lenders">Loan Lenders</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              {filteredGroups.map((group) => (
                <Card key={group.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{group.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{group.type.replace('_', ' ')}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {group.member_count} members
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Created {format(new Date(group.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/messages/groups/${group.id}`}>View</a>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/messages/groups/${group.id}/settings`}>Settings</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>Choose an action for this report.</DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Reported Message:</p>
                <p className="text-sm">"{selectedReport.message?.content || 'Message deleted'}"</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Reason: {selectedReport.reason}</p>
                {selectedReport.details && (
                  <p className="text-sm text-muted-foreground">{selectedReport.details}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleReviewReport('dismissed')}>
              Dismiss
            </Button>
            <Button variant="destructive" onClick={() => handleReviewReport('actioned', 'Message deleted')}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Message
            </Button>
            <Button variant="destructive" onClick={() => handleReviewReport('actioned', 'User banned')}>
              <Ban className="w-4 h-4 mr-2" />
              Ban User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
