import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMarketNewsArticle, useNewsFeed } from '@/hooks/useNewsFeed';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  ExternalLink,
  Twitter,
  Linkedin,
  Facebook,
  Link as LinkIcon,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function NewsArticle() {
  const { id } = useParams();
  const article = useMarketNewsArticle(id || '');
  const { marketNews } = useNewsFeed();

  const relatedArticles = marketNews
    .filter(n => n.id !== id && n.category === article?.category)
    .slice(0, 3);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container max-w-2xl mx-auto px-4 py-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Article not found</p>
            <Link to="/news">
              <Button className="mt-4">Back to News</Button>
            </Link>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Link to="/news" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </Link>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="capitalize">
            {article.category.replace('_', ' ')}
          </Badge>
          <span>•</span>
          <span>{format(new Date(article.published_at), 'MMMM d, yyyy')}</span>
          {article.source_name && (
            <>
              <span>•</span>
              <span>{article.source_name}</span>
            </>
          )}
        </div>

        <h1 className="text-2xl font-bold">{article.title}</h1>

        {article.image_url && (
          <img 
            src={article.image_url} 
            alt=""
            className="w-full h-64 object-cover rounded-lg"
          />
        )}

        {/* Content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {article.content.split('\n').map((paragraph, i) => (
            <p key={i}>
              {paragraph.split(/(\*\*.*?\*\*)/).map((part, j) => {
                // Check if this part is bold (wrapped in **)
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={j}>{part.slice(2, -2)}</strong>;
                }
                return part;
              })}
            </p>
          ))}
        </div>

        {/* Source Attribution */}
        {article.source === 'external' && article.source_url && (
          <Card className="p-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Originally published on</p>
              <p className="font-medium">{article.source_name}</p>
            </div>
            <a href={article.source_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                View Original <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
          </Card>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, i) => (
              <Badge key={i} variant="secondary">#{tag}</Badge>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="py-4 border-t">
          <p className="text-sm font-medium mb-3">Share this article</p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`, '_blank')}>
              <Twitter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}>
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}>
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={copyLink}>
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Related Articles</h2>
            <div className="grid gap-3">
              {relatedArticles.map(news => (
                <Link key={news.id} to={`/news/${news.id}`}>
                  <Card className="p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex gap-3">
                      {news.image_url && (
                        <img 
                          src={news.image_url} 
                          alt=""
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium line-clamp-2">{news.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(news.published_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
