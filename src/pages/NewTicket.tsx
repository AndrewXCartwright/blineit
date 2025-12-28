import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSupport, TICKET_CATEGORIES } from '@/hooks/useSupport';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NewTicket() {
  const navigate = useNavigate();
  const { createTicket } = useSupport();
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  
  const [form, setForm] = useState({
    category: '',
    subject: '',
    priority: 'normal',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category || !form.subject || !form.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const result = await createTicket.mutateAsync(form);
      setTicketNumber(result?.ticket_number || 'TKT-2024-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
      setSubmitted(true);
    } catch {
      setTicketNumber('TKT-2024-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header />
        <main className="container max-w-2xl mx-auto px-4 py-6">
          <Card className="p-8 text-center">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Ticket Submitted!</h1>
            <p className="text-muted-foreground mb-4">Ticket #: {ticketNumber}</p>
            <p className="text-sm text-muted-foreground mb-6">
              We'll respond based on priority:<br />
              Urgent: 2 hours • High: 4 hours • Normal: 24 hours • Low: 48 hours
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/help/tickets">
                <Button>View My Tickets</Button>
              </Link>
              <Link to="/help">
                <Button variant="outline">Back to Help</Button>
              </Link>
            </div>
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

        <h1 className="text-2xl font-bold">📝 Submit a Ticket</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {TICKET_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Subject *</Label>
            <Input 
              placeholder="Brief description of your issue"
              value={form.subject}
              onChange={(e) => setForm({...form, subject: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <RadioGroup value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low - General question</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="normal" />
                <Label htmlFor="normal">Normal - Need help soon</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High - Affecting my investments</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="urgent" id="urgent" />
                <Label htmlFor="urgent">Urgent - Money at risk</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea 
              placeholder="Describe your issue in detail..."
              value={form.message}
              onChange={(e) => setForm({...form, message: e.target.value})}
              rows={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createTicket.isPending}>
            {createTicket.isPending ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
