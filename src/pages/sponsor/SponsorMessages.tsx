import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Send, Paperclip, MoreVertical, Check, CheckCheck, Clock, FileText, Users, MessageSquare, Headphones, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ThemeToggle';
import logo from '@/assets/logo.png';
import { SponsorNewMessageModal } from '@/components/sponsor/SponsorNewMessageModal';
import { SponsorMessageTemplates } from '@/components/sponsor/SponsorMessageTemplates';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  type: 'announcement' | 'direct' | 'support';
  title: string;
  subtitle?: string;
  dealName?: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  unreadCount?: number;
  messages: Message[];
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    type: 'announcement',
    title: 'Q4 Distribution Notice',
    subtitle: 'Sent to 156 investors',
    dealName: 'Sunset Apartments',
    lastMessage: 'Dear investors, we are pleased to announce the Q4 2024 distribution...',
    timestamp: '2024-01-15T10:30:00',
    unread: false,
    messages: [
      {
        id: 'm1',
        senderId: 'sponsor',
        senderName: 'You',
        content: 'Dear investors,\n\nWe are pleased to announce the Q4 2024 distribution for Sunset Apartments. Each investor will receive their proportional share of the $245,000 net operating income.\n\nDistributions will be processed within 5 business days.\n\nBest regards,\nSunset Properties LLC',
        timestamp: '2024-01-15T10:30:00',
        isRead: true,
      },
    ],
  },
  {
    id: '2',
    type: 'direct',
    title: 'John Anderson',
    subtitle: 'Sunset Apartments investor',
    dealName: 'Sunset Apartments',
    lastMessage: 'Thank you for the update. Quick question about the tax documents...',
    timestamp: '2024-01-14T16:45:00',
    unread: true,
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        senderId: 'investor',
        senderName: 'John Anderson',
        content: 'Hi, I wanted to ask about the upcoming distribution schedule.',
        timestamp: '2024-01-14T14:30:00',
        isRead: true,
      },
      {
        id: 'm2',
        senderId: 'sponsor',
        senderName: 'You',
        content: 'Hi John, distributions are scheduled for the 15th of each quarter. You should see the Q4 distribution in your account by January 20th.',
        timestamp: '2024-01-14T15:00:00',
        isRead: true,
      },
      {
        id: 'm3',
        senderId: 'investor',
        senderName: 'John Anderson',
        content: 'Thank you for the update. Quick question about the tax documents - when should I expect the K-1?',
        timestamp: '2024-01-14T16:45:00',
        isRead: false,
      },
    ],
  },
  {
    id: '3',
    type: 'direct',
    title: 'Sarah Chen',
    subtitle: 'Downtown Office investor',
    dealName: 'Downtown Office Complex',
    lastMessage: 'Looking forward to the quarterly report!',
    timestamp: '2024-01-13T09:15:00',
    unread: false,
    messages: [
      {
        id: 'm1',
        senderId: 'investor',
        senderName: 'Sarah Chen',
        content: 'When will the Q4 report be available?',
        timestamp: '2024-01-13T09:00:00',
        isRead: true,
      },
      {
        id: 'm2',
        senderId: 'sponsor',
        senderName: 'You',
        content: "Hi Sarah, the Q4 report will be published next week. We're finalizing the financials now.",
        timestamp: '2024-01-13T09:10:00',
        isRead: true,
      },
      {
        id: 'm3',
        senderId: 'investor',
        senderName: 'Sarah Chen',
        content: 'Looking forward to the quarterly report!',
        timestamp: '2024-01-13T09:15:00',
        isRead: true,
      },
    ],
  },
  {
    id: '4',
    type: 'support',
    title: 'B-LINE-IT Support',
    subtitle: 'Platform assistance',
    lastMessage: 'Your document upload issue has been resolved.',
    timestamp: '2024-01-12T11:00:00',
    unread: false,
    messages: [
      {
        id: 'm1',
        senderId: 'sponsor',
        senderName: 'You',
        content: "I'm having trouble uploading documents to the Sunset Apartments deal page. The upload keeps failing.",
        timestamp: '2024-01-12T10:30:00',
        isRead: true,
      },
      {
        id: 'm2',
        senderId: 'support',
        senderName: 'B-LINE-IT Support',
        content: "Hi, thank you for reaching out. We've identified a temporary issue with large file uploads. Can you try compressing the file or splitting it into smaller parts?",
        timestamp: '2024-01-12T10:45:00',
        isRead: true,
      },
      {
        id: 'm3',
        senderId: 'support',
        senderName: 'B-LINE-IT Support',
        content: 'Your document upload issue has been resolved. Please try uploading again.',
        timestamp: '2024-01-12T11:00:00',
        isRead: true,
      },
    ],
  },
  {
    id: '5',
    type: 'announcement',
    title: 'Property Milestone Update',
    subtitle: 'Sent to 89 investors',
    dealName: 'Downtown Office Complex',
    lastMessage: 'We are excited to share that the Downtown Office Complex has reached 75% occupancy...',
    timestamp: '2024-01-10T14:00:00',
    unread: false,
    messages: [
      {
        id: 'm1',
        senderId: 'sponsor',
        senderName: 'You',
        content: 'Dear investors,\n\nWe are excited to share that the Downtown Office Complex has reached 75% occupancy, ahead of our projected timeline!\n\nThis milestone positions us well for the projected returns outlined in our offering documents.\n\nBest regards,\nDowntown Developments LLC',
        timestamp: '2024-01-10T14:00:00',
        isRead: true,
      },
    ],
  },
];

export default function SponsorMessages() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'announcements' | 'direct'>('all');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredConversations = mockConversations.filter(conv => {
    const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (filter) {
      case 'unread':
        return conv.unread;
      case 'announcements':
        return conv.type === 'announcement';
      case 'direct':
        return conv.type === 'direct';
      default:
        return true;
    }
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Users className="h-4 w-4 text-primary" />;
      case 'direct':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'support':
        return <Headphones className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'announcement':
        return <Badge className="bg-primary/10 text-primary hover:bg-primary/20">Announcement</Badge>;
      case 'direct':
        return <Badge variant="secondary">Direct</Badge>;
      case 'support':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Support</Badge>;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    // In real app, would send via API
    setNewMessage('');
  };

  const handleUseTemplate = (template: { subject: string; body: string }) => {
    setNewMessage(template.body);
    setShowTemplates(false);
  };

  const unreadCount = mockConversations.filter(c => c.unread).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/sponsor/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logo} alt="B-LINE-IT" className="h-8" />
            <Badge variant="secondary" className="bg-primary/10 text-primary">Sponsor</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowTemplates(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <Button onClick={() => setShowNewMessageModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Conversation List */}
        <div className="w-80 border-r bg-card flex flex-col">
          {/* Search and Filter */}
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="unread" className="text-xs relative">
                  Unread
                  {unreadCount > 0 && (
                    <span className="ml-1 text-[10px]">({unreadCount})</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="announcements" className="text-xs">Blasts</TabsTrigger>
                <TabsTrigger value="direct" className="text-xs">Direct</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedConversation?.id === conv.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-muted">
                            {getTypeIcon(conv.type)}
                          </AvatarFallback>
                        </Avatar>
                        {conv.unread && (
                          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-medium truncate ${conv.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {conv.title}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(conv.timestamp)}
                          </span>
                        </div>
                        {conv.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">{conv.subtitle}</p>
                        )}
                        <p className={`text-sm truncate mt-1 ${conv.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Conversation View */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b bg-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted">
                      {getTypeIcon(selectedConversation.type)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{selectedConversation.title}</h2>
                      {getTypeBadge(selectedConversation.type)}
                    </div>
                    {selectedConversation.dealName && (
                      <p className="text-sm text-muted-foreground">
                        {selectedConversation.dealName}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Star className="h-4 w-4 mr-2" />
                      Star conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Clock className="h-4 w-4 mr-2" />
                      Mark as unread
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Archive conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-3xl mx-auto">
                  {selectedConversation.messages.map((message) => {
                    const isOwn = message.senderId === 'sponsor';
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                          {!isOwn && (
                            <p className="text-xs text-muted-foreground mb-1 ml-1">
                              {message.senderName}
                            </p>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                            {isOwn && (
                              message.isRead ? (
                                <CheckCheck className="h-3 w-3 text-primary" />
                              ) : (
                                <Check className="h-3 w-3 text-muted-foreground" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Reply Box - only for non-announcement conversations */}
              {selectedConversation.type !== 'announcement' && (
                <div className="p-4 border-t bg-card">
                  <div className="flex items-end gap-2 max-w-3xl mx-auto">
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[44px] max-h-32 resize-none"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-1">Select a conversation</h3>
                <p className="text-sm">Choose from your existing conversations or start a new one</p>
                <Button className="mt-4" onClick={() => setShowNewMessageModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      <SponsorNewMessageModal
        open={showNewMessageModal}
        onOpenChange={setShowNewMessageModal}
      />

      {/* Templates Sheet */}
      <SponsorMessageTemplates
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}
