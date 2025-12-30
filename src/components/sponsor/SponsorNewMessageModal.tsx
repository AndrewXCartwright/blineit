import { useState } from 'react';
import { Send, Users, MessageSquare, Headphones, Calendar, Paperclip, Eye, X, Search, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface SponsorNewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockDeals = [
  { id: '1', name: 'Sunset Apartments', investors: 156, status: 'active' },
  { id: '2', name: 'Downtown Office Complex', investors: 89, status: 'active' },
  { id: '3', name: 'Marina Bay Condos', investors: 234, status: 'active' },
  { id: '4', name: 'Tech Park Building', investors: 67, status: 'funded' },
];

const mockInvestors = [
  { id: '1', name: 'John Anderson', email: 'john@example.com', deal: 'Sunset Apartments' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', deal: 'Downtown Office Complex' },
  { id: '3', name: 'Michael Brown', email: 'michael@example.com', deal: 'Sunset Apartments' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', deal: 'Marina Bay Condos' },
  { id: '5', name: 'Robert Wilson', email: 'robert@example.com', deal: 'Downtown Office Complex' },
];

export function SponsorNewMessageModal({ open, onOpenChange }: SponsorNewMessageModalProps) {
  const [messageType, setMessageType] = useState<'announcement' | 'direct' | 'support'>('announcement');
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<Date>();
  const [showPreview, setShowPreview] = useState(false);
  const [investorSearch, setInvestorSearch] = useState('');

  const handleDealToggle = (dealId: string) => {
    setSelectedDeals(prev =>
      prev.includes(dealId)
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  };

  const totalRecipients = selectedDeals.reduce((sum, dealId) => {
    const deal = mockDeals.find(d => d.id === dealId);
    return sum + (deal?.investors || 0);
  }, 0);

  const filteredInvestors = mockInvestors.filter(investor =>
    investor.name.toLowerCase().includes(investorSearch.toLowerCase()) ||
    investor.email.toLowerCase().includes(investorSearch.toLowerCase())
  );

  const handleSend = () => {
    if (messageType === 'announcement' && selectedDeals.length === 0) {
      toast.error('Please select at least one deal');
      return;
    }
    if (messageType === 'direct' && !selectedInvestor) {
      toast.error('Please select an investor');
      return;
    }
    if (!body.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (scheduleEnabled && scheduleDate) {
      toast.success(`Message scheduled for ${format(scheduleDate, 'PPP')}`);
    } else {
      toast.success('Message sent successfully');
    }
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setMessageType('announcement');
    setSelectedDeals([]);
    setSelectedInvestor(null);
    setSubject('');
    setBody('');
    setAttachments([]);
    setScheduleEnabled(false);
    setScheduleDate(undefined);
    setShowPreview(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        {showPreview ? (
          <div className="flex-1 overflow-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Message Preview</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Back to Edit
                </Button>
              </div>
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {messageType === 'announcement' ? 'Announcement' : messageType === 'direct' ? 'Direct Message' : 'Support'}
                    </Badge>
                    {messageType === 'announcement' && (
                      <span className="text-sm text-muted-foreground">
                        To: {totalRecipients} investors
                      </span>
                    )}
                  </div>
                  {subject && (
                    <div>
                      <p className="text-xs text-muted-foreground">Subject</p>
                      <p className="font-medium">{subject}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Message</p>
                    <p className="whitespace-pre-wrap">{body}</p>
                  </div>
                  {attachments.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {attachments.map((file, i) => (
                          <Badge key={i} variant="outline">
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {scheduleEnabled && scheduleDate && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Scheduled for</p>
                      <p>{format(scheduleDate, 'PPP')}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Edit
                </Button>
                <Button onClick={handleSend}>
                  <Send className="h-4 w-4 mr-2" />
                  {scheduleEnabled ? 'Schedule' : 'Send Now'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto space-y-4">
            {/* Message Type Selection */}
            <Tabs value={messageType} onValueChange={(v) => setMessageType(v as typeof messageType)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="announcement" className="gap-2">
                  <Users className="h-4 w-4" />
                  Announcement
                </TabsTrigger>
                <TabsTrigger value="direct" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Direct Message
                </TabsTrigger>
                <TabsTrigger value="support" className="gap-2">
                  <Headphones className="h-4 w-4" />
                  Support
                </TabsTrigger>
              </TabsList>

              <TabsContent value="announcement" className="space-y-4 mt-4">
                {/* Deal Selection */}
                <div className="space-y-2">
                  <Label>Select Deals to Broadcast</Label>
                  <div className="border rounded-lg divide-y">
                    {mockDeals.map((deal) => (
                      <label
                        key={deal.id}
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedDeals.includes(deal.id)}
                          onCheckedChange={() => handleDealToggle(deal.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{deal.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {deal.investors} investors
                          </p>
                        </div>
                        <Badge variant={deal.status === 'active' ? 'default' : 'secondary'}>
                          {deal.status}
                        </Badge>
                      </label>
                    ))}
                  </div>
                  {selectedDeals.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Total recipients: <span className="font-medium text-foreground">{totalRecipients}</span> investors
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter subject line..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="direct" className="space-y-4 mt-4">
                {/* Investor Selection */}
                <div className="space-y-2">
                  <Label>Select Investor</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search investors..."
                      value={investorSearch}
                      onChange={(e) => setInvestorSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <ScrollArea className="h-48 border rounded-lg">
                    <div className="divide-y">
                      {filteredInvestors.map((investor) => (
                        <button
                          key={investor.id}
                          onClick={() => setSelectedInvestor(investor.id)}
                          className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 ${
                            selectedInvestor === investor.id ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className="flex-1">
                            <p className="font-medium">{investor.name}</p>
                            <p className="text-sm text-muted-foreground">{investor.email}</p>
                            <p className="text-xs text-muted-foreground">{investor.deal}</p>
                          </div>
                          {selectedInvestor === investor.id && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="support" className="space-y-4 mt-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Contact B-LINE-IT support for platform assistance, technical issues, or account questions.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-subject">Subject</Label>
                  <Input
                    id="support-subject"
                    placeholder="Describe your issue briefly..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Message Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                placeholder="Type your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[150px]"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {file.name}
                    <button onClick={() => removeAttachment(i)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                    <Paperclip className="h-3 w-3 mr-1" />
                    Add File
                  </Badge>
                </label>
              </div>
            </div>

            {/* Schedule Option */}
            {messageType === 'announcement' && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Schedule for later</span>
                </div>
                <div className="flex items-center gap-2">
                  {scheduleEnabled && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          {scheduleDate ? format(scheduleDate, 'PPP') : 'Pick date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <CalendarComponent
                          mode="single"
                          selected={scheduleDate}
                          onSelect={setScheduleDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                  <Switch
                    checked={scheduleEnabled}
                    onCheckedChange={setScheduleEnabled}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                {scheduleEnabled ? 'Schedule' : 'Send'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
