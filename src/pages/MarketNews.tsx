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
  ArrowLeft,
  TrendingUp,
  ChevronRight,
  Building2,
  DollarSign,
  Gavel,
  BarChart3
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  real_estate: Building2,
  economy: DollarSign,
  regulation: Gavel,
  crypto: BarChart3,
  general: TrendingUp,
};

export default function MarketNews() {
  const { marketNews, isRead, markAsRead } = useNewsFeed();
  const [category, setCategory] = useState('all');

  const filteredNews = category === 'all' 
    ? marketNews 
    : marketNews.filter(n => n.category === category);

  const featuredNews = filteredNews[0];
  const restNews = filteredNews.slice(1);

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
            📈 Market News
          </h1>
          <p className="text-muted-foreground">Real estate and financial market updates</p>
        </div>

        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="w-full overflow-x-auto flex justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="real_estate">Real Estate</TabsTrigger>
            <TabsTrigger value="economy">Economy</TabsTrigger>
            <TabsTrigger value="regulation">Regulation</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Featured Article */}
        {featuredNews && (
          <Link 
            to={`/news/${featuredNews.id}`}
            onClick={() => !isRead(featuredNews.id, 'news') && markAsRead({ updateId: featuredNews.id, updateType: 'news' })}
          >
            <Card className="overflow-hidden hover:bg-muted/50 transition-colors">
              {featuredNews.image_url && (
                <img 
                  src={featuredNews.image_url} 
                  alt=""
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Badge variant="outline" className="capitalize">
                    {featuredNews.category.replace('_', ' ')}
                  </Badge>
                  {featuredNews.source_name && (
                    <>
                      <span>•</span>
                      <span>{featuredNews.source_name}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(featuredNews.published_at), { addSuffix: true })}</span>
                </div>
                <h2 className="text-xl font-bold">{featuredNews.title}</h2>
                <p className="text-muted-foreground mt-2 line-clamp-2">
                  {featuredNews.summary || featuredNews.content.slice(0, 150)}...
                </p>
                <Button variant="link" className="p-0 h-auto mt-3">
                  Read Full Article →
                </Button>
              </div>
            </Card>
          </Link>
        )}

        {/* News Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {restNews.map(news => {
            const Icon = categoryIcons[news.category] || TrendingUp;
            const isUnread = !isRead(news.id, 'news');
            
            return (
              <Link 
                key={news.id} 
                to={`/news/${news.id}`}
                onClick={() => isUnread && markAsRead({ updateId: news.id, updateType: 'news' })}
              >
                <Card className={`overflow-hidden hover:bg-muted/50 transition-colors h-full ${isUnread ? 'border-primary' : ''}`}>
                  {news.image_url && (
                    <img 
                      src={news.image_url} 
                      alt=""
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Icon className="h-3 w-3" />
                      <span className="capitalize">{news.category.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(news.published_at), { addSuffix: true })}</span>
                      {isUnread && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <h3 className="font-semibold line-clamp-2">{news.title}</h3>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredNews.length === 0 && (
          <Card className="p-8 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No news articles found</p>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
