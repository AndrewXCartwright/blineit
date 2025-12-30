import { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Copy, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  category: 'distribution' | 'update' | 'milestone' | 'custom';
  subject: string;
  body: string;
  isDefault: boolean;
}

interface SponsorMessageTemplatesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseTemplate: (template: { subject: string; body: string }) => void;
}

const defaultTemplates: Template[] = [
  {
    id: '1',
    name: 'Distribution Notice',
    category: 'distribution',
    subject: 'Distribution Notice - [Property Name]',
    body: `Dear Investors,

We are pleased to announce the [Q#] [Year] distribution for [Property Name].

Distribution Details:
- Total Distribution Amount: $[Amount]
- Distribution Date: [Date]
- Payment Method: Direct deposit to your linked account

Each investor will receive their proportional share based on ownership percentage.

If you have any questions, please don't hesitate to reach out.

Best regards,
[Sponsor Name]`,
    isDefault: true,
  },
  {
    id: '2',
    name: 'Quarterly Update',
    category: 'update',
    subject: 'Quarterly Update - [Property Name] Q[#] [Year]',
    body: `Dear Investors,

Please find below our quarterly update for [Property Name].

Property Performance:
- Occupancy Rate: [XX]%
- Net Operating Income: $[Amount]
- Collections Rate: [XX]%

Key Highlights:
- [Highlight 1]
- [Highlight 2]
- [Highlight 3]

Looking Ahead:
[Brief outlook for next quarter]

The full quarterly report has been uploaded to your investor portal.

Best regards,
[Sponsor Name]`,
    isDefault: true,
  },
  {
    id: '3',
    name: 'Deal Milestone',
    category: 'milestone',
    subject: 'Milestone Reached - [Property Name]',
    body: `Dear Investors,

We are excited to share that [Property Name] has reached a significant milestone!

[Describe the milestone - e.g., "The property is now 100% funded" or "We have achieved 95% occupancy"]

What this means for you:
- [Impact 1]
- [Impact 2]

Thank you for your continued trust and investment.

Best regards,
[Sponsor Name]`,
    isDefault: true,
  },
  {
    id: '4',
    name: 'K-1 Tax Document Notice',
    category: 'distribution',
    subject: 'K-1 Tax Documents Now Available - [Year]',
    body: `Dear Investors,

Your K-1 tax documents for [Year] are now available for download.

To access your K-1:
1. Log in to your investor portal
2. Navigate to Documents > Tax Documents
3. Download your K-1 for [Property Name]

Important Dates:
- K-1 documents are dated: [Date]
- Tax filing deadline: [Date]

If you have any questions about your tax documents, please consult with your tax advisor. For document access issues, contact our support team.

Best regards,
[Sponsor Name]`,
    isDefault: true,
  },
];

export function SponsorMessageTemplates({ open, onOpenChange, onUseTemplate }: SponsorMessageTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'distribution':
        return 'bg-green-500/10 text-green-500';
      case 'update':
        return 'bg-blue-500/10 text-blue-500';
      case 'milestone':
        return 'bg-primary/10 text-primary';
      case 'custom':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const handleUseTemplate = (template: Template) => {
    onUseTemplate({ subject: template.subject, body: template.body });
    onOpenChange(false);
    toast.success('Template applied');
  };

  const handleCopyTemplate = (template: Template) => {
    navigator.clipboard.writeText(template.body);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Template copied to clipboard');
  };

  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.body) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingTemplate) {
      setTemplates(prev =>
        prev.map(t =>
          t.id === editingTemplate.id
            ? { ...t, name: newTemplate.name, subject: newTemplate.subject, body: newTemplate.body }
            : t
        )
      );
      toast.success('Template updated');
    } else {
      const template: Template = {
        id: Date.now().toString(),
        name: newTemplate.name,
        category: 'custom',
        subject: newTemplate.subject,
        body: newTemplate.body,
        isDefault: false,
      };
      setTemplates(prev => [...prev, template]);
      toast.success('Template created');
    }

    setShowCreateModal(false);
    setEditingTemplate(null);
    setNewTemplate({ name: '', subject: '', body: '' });
  };

  const handleDeleteTemplate = (template: Template) => {
    if (template.isDefault) {
      toast.error('Cannot delete default templates');
      return;
    }
    setTemplates(prev => prev.filter(t => t.id !== template.id));
    toast.success('Template deleted');
  };

  const openEditModal = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplate({ name: template.name, subject: template.subject, body: template.body });
    setShowCreateModal(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Message Templates</span>
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-120px)] mt-4 -mx-6 px-6">
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate">{template.name}</span>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                      {template.subject && (
                        <p className="text-sm text-muted-foreground truncate mb-2">
                          {template.subject}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.body.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1"
                      onClick={() => handleUseTemplate(template)}
                    >
                      Use Template
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyTemplate(template)}
                    >
                      {copiedId === template.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {!template.isDefault && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditModal(template)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTemplate(template)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Create/Edit Template Modal */}
      <Dialog open={showCreateModal} onOpenChange={(open) => {
        setShowCreateModal(open);
        if (!open) {
          setEditingTemplate(null);
          setNewTemplate({ name: '', subject: '', body: '' });
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g., Monthly Update"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-subject">Subject Line</Label>
              <Input
                id="template-subject"
                placeholder="e.g., Monthly Update - [Property Name]"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-body">Message Body *</Label>
              <Textarea
                id="template-body"
                placeholder="Enter your template message..."
                value={newTemplate.body}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, body: e.target.value }))}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use placeholders like [Property Name], [Amount], [Date] for dynamic content.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              {editingTemplate ? 'Update' : 'Create'} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
