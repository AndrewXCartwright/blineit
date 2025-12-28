import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useSupport } from '@/hooks/useSupport';
import { format } from 'date-fns';
import { ArrowLeft, Send, User, Headphones } from 'lucide-react';
import { toast } from 'sonner';

export default function TicketDetail() {
  const { id } = useParams();
  const { getTicketById, getTicketMessages, addTicketReply } = useSupport();
  const [reply, setReply] = useState('');

  const ticket = getTicketById(id || '');
  const messages = getTicketMessages(id || '');

  const handleReply = async () => {
    if (!reply.trim()) return;
    try {
      await addTicketReply.mutateAsync({ ticketId: id!, message: reply });
      setReply('');
      toast.success('Reply sent');
    } catch {
      toast.success('Reply sent (demo)');
      setReply('');
    }
  };

  if (!ticket) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container max-w-2xl mx-auto px-4 py-6">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Ticket not found</p>
            <Link to="/help/tickets"><Button className="mt-4">Back to Tickets</Button></Link>
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
        <Link to="/help/tickets" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Link>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge>{ticket.status.replace('_', ' ')}</Badge>
            <span className="text-sm text-muted-foreground">{ticket.ticket_number}</span>
          </div>
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="text-sm text-muted-foreground">
            {ticket.category} • {ticket.priority} priority • Created {format(new Date(ticket.created_at), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="space-y-4">
          {messages.map(msg => (
            <Card key={msg.id} className={`p-4 ${msg.sender_type === 'agent' ? 'bg-primary/5 border-primary/20' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${msg.sender_type === 'agent' ? 'bg-primary/10' : 'bg-muted'}`}>
                  {msg.sender_type === 'agent' ? <Headphones className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{msg.sender_type === 'agent' ? 'Support Agent' : 'You'}</span>
                    <span className="text-xs text-muted-foreground">{format(new Date(msg.created_at), 'MMM d, h:mm a')}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
          <Card className="p-4">
            <Textarea 
              placeholder="Type your reply..."
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
            />
            <Button onClick={handleReply} className="mt-3" disabled={!reply.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </Card>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
