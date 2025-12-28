import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupport, FAQ_CATEGORIES } from '@/hooks/useSupport';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  FileText,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export default function FAQArticle() {
  const { id } = useParams();
  const { getFAQById, faqs, markFAQHelpful } = useSupport();
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  const article = getFAQById(id || '');
  const category = FAQ_CATEGORIES.find(c => c.slug === article?.category);

  const relatedArticles = faqs
    .filter(faq => faq.category === article?.category && faq.id !== id)
    .slice(0, 3);

  const handleFeedback = (helpful: boolean) => {
    if (feedbackGiven) return;
    
    setFeedbackGiven(helpful ? 'yes' : 'no');
    markFAQHelpful.mutate({ faqId: id!, helpful });
    toast.success('Thank you for your feedback!');
  };

  if (!article) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container max-w-2xl mx-auto px-4 py-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Article not found</p>
            <Link to="/help">
              <Button className="mt-4">Back to Help Center</Button>
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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/help" className="hover:text-foreground">Help</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/help/category/${category?.slug}`} className="hover:text-foreground">
            {category?.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{article.question}</span>
        </nav>

        {/* Article Header */}
        <div>
          <Badge variant="secondary" className="mb-3">
            {category?.icon} {category?.name}
          </Badge>
          <h1 className="text-2xl font-bold mb-2">{article.question}</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {format(new Date(article.updated_at), 'MMMM d, yyyy')}
          </p>
        </div>

        {/* Article Content */}
        <Card className="p-6">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {article.answer.split('\n').map((paragraph, i) => {
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <h3 key={i} className="font-semibold mt-4 mb-2">{paragraph.replace(/\*\*/g, '')}</h3>;
              }
              if (paragraph.startsWith('- ')) {
                return <li key={i} className="ml-4">{paragraph.substring(2)}</li>;
              }
              if (/^\d+\./.test(paragraph)) {
                return <li key={i} className="ml-4">{paragraph}</li>;
              }
              return paragraph ? <p key={i}>{paragraph}</p> : null;
            })}
          </div>
        </Card>

        {/* Feedback Section */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Was this article helpful?</h3>
          
          {!feedbackGiven ? (
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => handleFeedback(true)}
                className="flex-1"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Yes, it helped
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleFeedback(false)}
                className="flex-1"
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                No, I need more help
              </Button>
            </div>
          ) : feedbackGiven === 'yes' ? (
            <div className="text-center py-4">
              <p className="text-primary font-medium">Thank you for your feedback! 🎉</p>
              <p className="text-sm text-muted-foreground mt-1">
                Glad we could help!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Sorry this didn't help. Would you like to contact support?
              </p>
              <div className="flex gap-3">
                <Link to="/help/chat" className="flex-1">
                  <Button className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat with Support
                  </Button>
                </Link>
                <Link to="/help/ticket/new" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold">Related Articles</h2>
            {relatedArticles.map(faq => (
              <Link key={faq.id} to={`/help/article/${faq.id}`}>
                <Card className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{faq.question}</p>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Back to category */}
        <Link to={`/help/category/${category?.slug}`}>
          <Button variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {category?.name}
          </Button>
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}
