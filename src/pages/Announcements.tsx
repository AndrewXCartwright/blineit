import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  ArrowLeft,
  Megaphone,
  X,
  AlertTriangle,
  Sparkles,
  Wrench,
  FileText,
  Gift,
  Bell
} from 'lucide-react';

const typeIcons: Record<string, any> = {
  feature: Sparkles,
  maintenance: Wrench,
  policy: FileText,
  promotion: Gift,
  general: Bell,
};

const priorityStyles: Record<string, string> = {
  low: 'border-muted',
  normal: 'border-border',
  high: 'border-orange-500 bg-orange-500/5',
  urgent: 'border-destructive bg-destructive/5',
};

export default function Announcements() {
  const { announcements, isRead, markAsRead } = useNewsFeed();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const activeAnnouncements = announcements.filter(a => !dismissed.includes(a.id));
  const highPriorityAnnouncements = activeAnnouncements.filter(a => a.priority === 'high' || a.priority === 'urgent');
  const regularAnnouncements = activeAnnouncements.filter(a => a.priority !== 'high' && a.priority !== 'urgent');

  const handleDismiss = (id: string) => {
    setDismissed(prev => [...prev, id]);
    markAsRead({ updateId: id, updateType: 'announcement' });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Link to="/feed" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            📢 Announcements
          </h1>
          <p className="text-muted-foreground">Platform updates and news</p>
        </div>

        {/* High Priority / Pinned */}
        {highPriorityAnnouncements.length > 0 && (
          <div className="space-y-3">
            {highPriorityAnnouncements.map(announcement => {
              const Icon = typeIcons[announcement.announcement_type] || Bell;
              return (
                <Card 
                  key={announcement.id} 
                  className={`p-4 ${priorityStyles[announcement.priority]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${announcement.priority === 'urgent' ? 'bg-destructive/10' : 'bg-orange-500/10'}`}>
                      <AlertTriangle className={`h-5 w-5 ${announcement.priority === 'urgent' ? 'text-destructive' : 'text-orange-500'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={announcement.priority === 'urgent' ? 'border-destructive text-destructive' : 'border-orange-500 text-orange-500'}>
                          {announcement.priority === 'urgent' ? '🚨 Urgent' : '⚠️ Important'}
                        </Badge>
                      </div>
                      <h3 className="font-semibold">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {announcement.content}
                      </p>
                      {announcement.action_url && (
                        <Link to={announcement.action_url}>
                          <Button variant="link" className="p-0 h-auto mt-2">
                            {announcement.action_text || 'Learn More'} →
                          </Button>
                        </Link>
                      )}
                    </div>
                    {announcement.is_dismissible && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDismiss(announcement.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Regular Announcements */}
        <div className="space-y-3">
          {regularAnnouncements.map(announcement => {
            const Icon = typeIcons[announcement.announcement_type] || Bell;
            const isUnread = !isRead(announcement.id, 'announcement');
            
            return (
              <Card 
                key={announcement.id} 
                className={`p-4 ${isUnread ? 'border-primary' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">
                        {announcement.announcement_type === 'feature' && '🆕 New Feature'}
                        {announcement.announcement_type === 'maintenance' && '🔧 Maintenance'}
                        {announcement.announcement_type === 'policy' && '📋 Policy Update'}
                        {announcement.announcement_type === 'promotion' && '🎉 Promotion'}
                        {announcement.announcement_type === 'general' && '📢 Update'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                      </span>
                      {isUnread && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <h3 className="font-semibold">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {announcement.content}
                    </p>
                    {announcement.action_url && (
                      <Link to={announcement.action_url}>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto mt-2"
                          onClick={() => isUnread && markAsRead({ updateId: announcement.id, updateType: 'announcement' })}
                        >
                          {announcement.action_text || 'Learn More'} →
                        </Button>
                      </Link>
                    )}
                  </div>
                  {announcement.is_dismissible && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDismiss(announcement.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {activeAnnouncements.length === 0 && (
          <Card className="p-8 text-center">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No active announcements</p>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
