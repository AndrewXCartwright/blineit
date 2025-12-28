import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupport } from '@/hooks/useSupport';
import { format } from 'date-fns';
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react';

export default function MyTickets() {
  const { tickets } = useSupport();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-yellow-500';
      case 'in_progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <Link to="/help" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Help Center
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">📋 My Tickets</h1>
          <Link to="/help/ticket/new">
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> New Ticket</Button>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No tickets yet</p>
            <Link to="/help/ticket/new">
              <Button>Submit Your First Ticket</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map(ticket => (
              <Link key={ticket.id} to={`/help/ticket/${ticket.id}`}>
                <Card className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{ticket.ticket_number}</span>
                      </div>
                      <p className="font-medium truncate">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.category} • {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
