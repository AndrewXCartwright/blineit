import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupport, FAQ_CATEGORIES } from '@/hooks/useSupport';
import { 
  ArrowLeft, 
  Search, 
  ChevronDown,
  ChevronUp,
  MessageCircle,
  FileText
} from 'lucide-react';

export default function FAQCategory() {
  const { slug } = useParams();
  const { getFAQsByCategory } = useSupport();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const category = FAQ_CATEGORIES.find(c => c.slug === slug);
  const faqs = getFAQsByCategory(slug || '');

  const filteredFaqs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  if (!category) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container max-w-2xl mx-auto px-4 py-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Category not found</p>
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
        <Link to="/help" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Help Center
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search in ${category.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No questions found</p>
            </Card>
          ) : (
            filteredFaqs.map(faq => (
              <Card key={faq.id} className="overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  {expandedId === faq.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                
                {expandedId === faq.id && (
                  <div className="px-4 pb-4 border-t">
                    <div className="pt-4 prose prose-sm max-w-none dark:prose-invert">
                      {faq.answer.split('\n').map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Was this helpful?</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">👍 Yes</Button>
                        <Button variant="outline" size="sm">👎 No</Button>
                      </div>
                    </div>
                    <Link to={`/help/article/${faq.id}`}>
                      <Button variant="link" size="sm" className="mt-2 px-0">
                        View full article →
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Still need help */}
        <Card className="p-6 text-center bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">Still need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">Our support team is ready to assist you</p>
          <div className="flex gap-3 justify-center">
            <Link to="/help/chat">
              <Button size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with Us
              </Button>
            </Link>
            <Link to="/help/ticket/new">
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Submit Ticket
              </Button>
            </Link>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
