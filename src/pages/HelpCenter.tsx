import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSupport, FAQ_CATEGORIES } from '@/hooks/useSupport';
import { 
  Search, 
  MessageCircle, 
  FileText, 
  Phone,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const { tickets, searchFAQs } = useSupport();

  const openTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
  const searchResults = searchQuery.length >= 2 ? searchFAQs(searchQuery) : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <HelpCircle className="h-7 w-7 text-primary" />
            Help Center
          </h1>
          <p className="text-muted-foreground">How can we help you today?</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">{searchResults.length} results found</p>
            {searchResults.slice(0, 5).map(faq => (
              <Link key={faq.id} to={`/help/article/${faq.id}`}>
                <div className="p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <p className="font-medium">{faq.question}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{faq.answer}</p>
                </div>
              </Link>
            ))}
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link to="/help/chat">
            <Card className="p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <MessageCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Start Chat</p>
            </Card>
          </Link>
          <Link to="/help/ticket/new">
            <Card className="p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Submit Ticket</p>
            </Card>
          </Link>
          <Link to="/help/contact">
            <Card className="p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer">
              <Phone className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Call Us</p>
            </Card>
          </Link>
        </div>

        {/* Open Tickets */}
        {openTickets.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Your Open Tickets</h2>
              <Link to="/help/tickets">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            {openTickets.slice(0, 2).map(ticket => (
              <Link key={ticket.id} to={`/help/ticket/${ticket.id}`}>
                <Card className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={ticket.status === 'in_progress' ? 'default' : 'secondary'}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{ticket.ticket_number}</span>
                      </div>
                      <p className="font-medium truncate">{ticket.subject}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* FAQ Categories */}
        <div className="space-y-3">
          <h2 className="font-semibold">Popular Topics</h2>
          <div className="grid gap-3">
            {FAQ_CATEGORIES.map(category => (
              <Link key={category.slug} to={`/help/category/${category.slug}`}>
                <Card className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{category.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="p-6 text-center bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">Can't find what you're looking for?</h3>
          <p className="text-sm text-muted-foreground mb-4">Our support team is here to help</p>
          <div className="flex gap-3 justify-center">
            <Link to="/help/chat">
              <Button>
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat with Us
              </Button>
            </Link>
            <Link to="/help/ticket/new">
              <Button variant="outline">
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
