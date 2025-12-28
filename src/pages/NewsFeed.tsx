import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNewsFeed } from '@/hooks/useNewsFeed';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Building2, 
  Megaphone, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Share2,
  Eye,
  Wrench,
  DollarSign,
  ChevronRight,
  Bell,
  Settings,
  ExternalLink
} from 'lucide-react';

const updateTypeIcons: Record<string, any> = {
  renovation: Wrench,
  construction: Wrench,
  distribution: DollarSign,
  leasing: Building2,
  financial: TrendingUp,
  milestone: Bell,
  general: Building2,
};

const updateTypeLabels: Record<string, string> = {
  renovation: 'Renovation Update',
  construction: 'Construction Update',
  distribution: 'Distribution',
  leasing: 'Leasing Update',
  financial: 'Financial Update',
  milestone: 'Milestone',
  general: 'Update',
};

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-primary/10 text-primary',
  high: 'bg-orange-500/10 text-orange-500',
  urgent: 'bg-destructive/10 text-destructive',
};

export default function NewsFeed() {
  const { propertyUpdates, announcements, marketNews, unreadCount, isRead, markAsRead } = useNewsFeed();
  const [filter, setFilter] = useState('all');

  const handleMarkAsRead = (id: string, type: string) => {
    markAsRead({ updateId: id, updateType: type });
  };

  // Demo property names
  const propertyNames: Record<string, string> = {
    'prop-1': 'Sunset Apartments',
    'prop-2': 'Marina Heights',
    'prop-3': 'Phoenix Development',
  };

  // Combine all items for "All" feed
  const allItems = [
    ...propertyUpdates.map(u => ({ ...u, feedType: 'property_update' as const })),
    ...announcements.map(a => ({ ...a, feedType: 'announcement' as const, published_at: a.created_at })),
    ...marketNews.map(n => ({ ...n, feedType: 'news' as const })),
  ].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  const filteredItems = filter === 'all' 
    ? allItems 
    : filter === 'properties' 
      ? allItems.filter(i => i.feedType === 'property_update')
      : filter === 'announcements'
        ? allItems.filter(i => i.feedType === 'announcement')
        : allItems.filter(i => i.feedType === 'news');

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              📰 News Feed
            </h1>
            <p className="text-muted-foreground">Stay updated on your investments</p>
          </div>
          <Link to="/settings/feed">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {unreadCount > 0 && (
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium">
            {unreadCount} new updates
          </div>
        )}

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="properties">My Properties</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="news">Market News</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4 mt-4">
            {filteredItems.map((item) => {
              if (item.feedType === 'property_update') {
                const update = item as typeof propertyUpdates[0] & { feedType: 'property_update' };
                const Icon = updateTypeIcons[update.update_type] || Building2;
                const isUnread = !isRead(update.id, 'property_update');
                
                return (
                  <Link 
                    key={`update-${update.id}`} 
                    to={`/feed/update/${update.id}`}
                    onClick={() => isUnread && handleMarkAsRead(update.id, 'property_update')}
                  >
                    <Card className={`p-4 hover:bg-muted/50 transition-colors ${isUnread ? 'border-primary' : ''}`}>
                      <div className="flex gap-3">
                        {update.images[0] && (
                          <img 
                            src={update.images[0]} 
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <Building2 className="h-3 w-3" />
                            <span>{propertyNames[update.item_id] || 'Property'}</span>
                            {isUnread && <span className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                          <h3 className="font-semibold truncate">{update.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Icon className="h-3 w-3" />
                            <span>{updateTypeLabels[update.update_type]}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(update.published_at), { addSuffix: true })}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {update.summary || update.content.slice(0, 100)}...
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> 234
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" /> 12
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" /> 45
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Card>
                  </Link>
                );
              }

              if (item.feedType === 'announcement') {
                const announcement = item as typeof announcements[0] & { feedType: 'announcement' };
                const isUnread = !isRead(announcement.id, 'announcement');
                
                return (
                  <Card key={`ann-${announcement.id}`} className={`p-4 ${isUnread ? 'border-primary' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Megaphone className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-muted-foreground">B-LINE-IT Announcement</span>
                          <Badge variant="outline" className={priorityColors[announcement.priority]}>
                            {announcement.announcement_type === 'feature' && '⭐ New Feature'}
                            {announcement.announcement_type === 'maintenance' && '🔧 Maintenance'}
                            {announcement.announcement_type === 'policy' && '📋 Policy Update'}
                            {announcement.announcement_type === 'promotion' && '🎉 Promotion'}
                            {announcement.announcement_type === 'general' && '📢 Update'}
                          </Badge>
                          {isUnread && <span className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {announcement.content}
                        </p>
                        {announcement.action_url && (
                          <Link to={announcement.action_url}>
                            <Button variant="link" className="p-0 h-auto mt-2" onClick={() => isUnread && handleMarkAsRead(announcement.id, 'announcement')}>
                              {announcement.action_text || 'Learn More'} →
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              }

              if (item.feedType === 'news') {
                const news = item as typeof marketNews[0] & { feedType: 'news' };
                const isUnread = !isRead(news.id, 'news');
                
                return (
                  <Link 
                    key={`news-${news.id}`} 
                    to={`/news/${news.id}`}
                    onClick={() => isUnread && handleMarkAsRead(news.id, 'news')}
                  >
                    <Card className={`p-4 hover:bg-muted/50 transition-colors ${isUnread ? 'border-primary' : ''}`}>
                      <div className="flex gap-3">
                        {news.image_url && (
                          <img 
                            src={news.image_url} 
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Market News</span>
                            {isUnread && <span className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                          <h3 className="font-semibold">{news.title}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="capitalize">{news.category.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(news.published_at), { addSuffix: true })}</span>
                            {news.source_name && (
                              <>
                                <span>•</span>
                                <span>Via {news.source_name}</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {news.summary || news.content.slice(0, 100)}...
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      </div>
                    </Card>
                  </Link>
                );
              }

              return null;
            })}

            {filteredItems.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No updates found</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
