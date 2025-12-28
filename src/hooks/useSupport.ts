import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SupportTicket {
  id: string;
  user_id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  related_item_type: string | null;
  related_item_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'agent' | 'system' | 'bot';
  sender_id: string | null;
  message: string;
  attachments: string[];
  is_internal: boolean;
  created_at: string;
}

export interface LiveChat {
  id: string;
  user_id: string;
  status: 'waiting' | 'active' | 'ended';
  agent_id: string | null;
  started_at: string | null;
  ended_at: string | null;
  rating: number | null;
  feedback: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  sender_type: 'user' | 'agent' | 'bot';
  sender_id: string | null;
  message: string;
  attachments: string[];
  created_at: string;
}

export interface FAQArticle {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  helpful_count: number;
  not_helpful_count: number;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Demo FAQ data
const demoFAQs: FAQArticle[] = [
  {
    id: 'faq-1',
    category: 'account',
    question: 'How do I reset my password?',
    answer: 'To reset your password:\n\n1. Go to the login page\n2. Click "Forgot Password"\n3. Enter your email address\n4. Check your email for a reset link\n5. Click the link and create a new password\n\nIf you don\'t receive the email, check your spam folder or contact support.',
    keywords: ['password', 'reset', 'forgot', 'login'],
    helpful_count: 45,
    not_helpful_count: 3,
    order_index: 1,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-2',
    category: 'account',
    question: 'How do I enable two-factor authentication?',
    answer: 'Two-factor authentication adds an extra layer of security:\n\n1. Go to Settings → Security\n2. Click "Enable 2FA"\n3. Scan the QR code with your authenticator app\n4. Enter the 6-digit code to verify\n5. Save your backup codes in a safe place\n\nYou\'ll need to enter a code from your authenticator app each time you log in.',
    keywords: ['2fa', 'two-factor', 'security', 'authenticator'],
    helpful_count: 32,
    not_helpful_count: 2,
    order_index: 2,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-3',
    category: 'investments',
    question: 'How do I buy property tokens?',
    answer: 'To purchase property tokens:\n\n1. Browse available properties on the Assets page\n2. Click on a property to view details\n3. Click "Invest" and enter the amount\n4. Review the investment summary\n5. Confirm with Face ID or PIN\n\nTokens will appear in your portfolio immediately after purchase.',
    keywords: ['buy', 'tokens', 'property', 'invest', 'purchase'],
    helpful_count: 89,
    not_helpful_count: 5,
    order_index: 1,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-4',
    category: 'investments',
    question: 'When do I receive dividends?',
    answer: 'Dividends are distributed quarterly:\n\n- Q1: April 15\n- Q2: July 15\n- Q3: October 15\n- Q4: January 15\n\nYou must hold tokens on the record date (last day of the quarter) to receive dividends. Payments are made within 15 days after quarter end.',
    keywords: ['dividends', 'payments', 'quarterly', 'distribution'],
    helpful_count: 67,
    not_helpful_count: 4,
    order_index: 2,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-5',
    category: 'payments',
    question: 'How do I withdraw funds?',
    answer: 'To withdraw funds from your wallet:\n\n1. Go to Wallet → Withdraw\n2. Select your linked bank account\n3. Enter the withdrawal amount\n4. Review the details and fees\n5. Confirm with Face ID or PIN\n\nWithdrawals typically process in 1-3 business days. Same-day processing is available for verified accounts.',
    keywords: ['withdraw', 'withdrawal', 'bank', 'transfer', 'cash out'],
    helpful_count: 112,
    not_helpful_count: 8,
    order_index: 1,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-6',
    category: 'payments',
    question: 'What are the deposit limits?',
    answer: 'Deposit limits depend on your verification level:\n\n**Basic Verified:**\n- Daily: $5,000\n- Monthly: $25,000\n\n**Fully Verified:**\n- Daily: $50,000\n- Monthly: $250,000\n\n**Accredited Investor:**\n- Daily: $250,000\n- Monthly: No limit\n\nTo increase limits, complete additional verification in Settings → Security.',
    keywords: ['deposit', 'limits', 'maximum', 'verification'],
    helpful_count: 54,
    not_helpful_count: 3,
    order_index: 2,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-7',
    category: 'predictions',
    question: 'How do prediction markets work?',
    answer: 'Prediction markets let you bet on real estate outcomes:\n\n1. Browse available markets on the Predict page\n2. Choose YES or NO on a question\n3. Enter your stake amount\n4. Submit your prediction\n\n**How payouts work:**\n- If you\'re correct, you receive $1 per share\n- Share price reflects probability (e.g., 65¢ = 65% chance)\n- Profit = $1 - purchase price per share\n\nMarkets resolve based on verified real-world data.',
    keywords: ['predictions', 'betting', 'markets', 'odds', 'payout'],
    helpful_count: 78,
    not_helpful_count: 6,
    order_index: 1,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'faq-8',
    category: 'platform',
    question: 'How does Auto-Invest work?',
    answer: 'Auto-Invest automatically invests your funds on a schedule:\n\n1. Go to Auto-Invest and create a plan\n2. Set your investment amount and frequency\n3. Choose allocation (specific properties or by category)\n4. Select funding source (wallet or linked bank)\n5. Activate the plan\n\nYour plan runs automatically. You can pause, modify, or cancel anytime.',
    keywords: ['auto-invest', 'automatic', 'recurring', 'schedule'],
    helpful_count: 43,
    not_helpful_count: 2,
    order_index: 1,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Demo tickets
const demoTickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    user_id: 'demo-user',
    ticket_number: 'TKT-2024-001234',
    subject: 'Withdrawal pending for 5 days',
    category: 'payments',
    priority: 'high',
    status: 'in_progress',
    assigned_to: 'agent-1',
    related_item_type: 'withdrawal',
    related_item_id: 'withdrawal-123',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    resolved_at: null,
  },
  {
    id: 'ticket-2',
    user_id: 'demo-user',
    ticket_number: 'TKT-2024-001198',
    subject: 'Question about dividend timing',
    category: 'investments',
    priority: 'low',
    status: 'resolved',
    assigned_to: 'agent-2',
    related_item_type: null,
    related_item_id: null,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    resolved_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Demo ticket messages
const demoTicketMessages: Record<string, TicketMessage[]> = {
  'ticket-1': [
    {
      id: 'msg-1',
      ticket_id: 'ticket-1',
      sender_type: 'user',
      sender_id: 'demo-user',
      message: 'My withdrawal request from Dec 23 is still showing as pending. The amount is $5,000 to my Chase account ending in 7890. Can you please check on this?',
      attachments: [],
      is_internal: false,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-2',
      ticket_id: 'ticket-1',
      sender_type: 'agent',
      sender_id: 'agent-1',
      message: 'Hi! I\'ve looked into this and found that your withdrawal required additional verification due to the amount. I\'ve escalated this to our finance team and it should process within 24 hours. I apologize for the delay.',
      attachments: [],
      is_internal: false,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-3',
      ticket_id: 'ticket-1',
      sender_type: 'user',
      sender_id: 'demo-user',
      message: 'Thank you for checking. Will I receive a notification when it\'s processed?',
      attachments: [],
      is_internal: false,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-4',
      ticket_id: 'ticket-1',
      sender_type: 'agent',
      sender_id: 'agent-1',
      message: 'Yes, you\'ll receive an email and push notification once the transfer is initiated. Is there anything else I can help with?',
      attachments: [],
      is_internal: false,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 52 * 60 * 1000).toISOString(),
    },
  ],
  'ticket-2': [
    {
      id: 'msg-5',
      ticket_id: 'ticket-2',
      sender_type: 'user',
      sender_id: 'demo-user',
      message: 'When will I receive my Q4 dividend for Sunset Apartments?',
      attachments: [],
      is_internal: false,
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-6',
      ticket_id: 'ticket-2',
      sender_type: 'agent',
      sender_id: 'agent-2',
      message: 'Q4 dividends are distributed by January 15th. You\'ll receive a notification when your dividend is credited to your wallet. Based on your holdings, you should receive approximately $234.56.',
      attachments: [],
      is_internal: false,
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

export const FAQ_CATEGORIES = [
  { slug: 'account', name: 'Account & Security', icon: '🔐', description: 'Login, password, 2FA, verification' },
  { slug: 'investments', name: 'Investments', icon: '💰', description: 'Buying, selling, dividends, returns' },
  { slug: 'payments', name: 'Payments & Withdrawals', icon: '💳', description: 'Deposits, withdrawals, wallet, banks' },
  { slug: 'portfolio', name: 'Portfolio & Reports', icon: '📊', description: 'Holdings, performance, tax documents' },
  { slug: 'predictions', name: 'Predictions', icon: '🎯', description: 'Betting, odds, payouts, rules' },
  { slug: 'platform', name: 'Platform Features', icon: '⚙️', description: 'Auto-invest, alerts, notifications' },
];

export const TICKET_CATEGORIES = [
  { value: 'account', label: 'Account & Security' },
  { value: 'investments', label: 'Investments' },
  { value: 'payments', label: 'Withdrawals & Payments' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'billing', label: 'Billing' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'other', label: 'Other' },
];

export function useSupport() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch FAQs
  const { data: faqs = demoFAQs, isLoading: faqsLoading } = useQuery({
    queryKey: ['faq-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq_articles')
        .select('*')
        .eq('is_published', true)
        .order('order_index');
      
      if (error || !data || data.length === 0) {
        return demoFAQs;
      }
      
      return data.map(faq => ({
        ...faq,
        keywords: faq.keywords as string[],
      })) as FAQArticle[];
    },
  });

  // Fetch user's tickets
  const { data: tickets = demoTickets, isLoading: ticketsLoading } = useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: async () => {
      if (!user) return demoTickets;
      
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error || !data || data.length === 0) {
        return demoTickets;
      }
      
      return data as SupportTicket[];
    },
    enabled: !!user,
  });

  // Get FAQs by category
  const getFAQsByCategory = (category: string) => {
    return faqs.filter(faq => faq.category === category);
  };

  // Get single FAQ
  const getFAQById = (id: string) => {
    return faqs.find(faq => faq.id === id);
  };

  // Get single ticket
  const getTicketById = (id: string) => {
    return tickets.find(ticket => ticket.id === id);
  };

  // Get ticket messages
  const getTicketMessages = (ticketId: string): TicketMessage[] => {
    return demoTicketMessages[ticketId] || [];
  };

  // Search FAQs
  const searchFAQs = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return faqs.filter(faq => 
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery) ||
      faq.keywords.some(k => k.toLowerCase().includes(lowerQuery))
    );
  };

  // Create ticket mutation
  const createTicket = useMutation({
    mutationFn: async (ticket: {
      subject: string;
      category: string;
      priority: string;
      message: string;
      related_item_type?: string;
      related_item_id?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      // Generate ticket number
      const ticketNumber = 'TKT-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      
      // Create ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .insert([{
          user_id: user.id,
          ticket_number: ticketNumber,
          subject: ticket.subject,
          category: ticket.category,
          priority: ticket.priority,
          related_item_type: ticket.related_item_type || null,
          related_item_id: ticket.related_item_id || null,
        }])
        .select()
        .single();
      
      if (ticketError) throw ticketError;
      
      // Create first message
      const { error: messageError } = await supabase
        .from('ticket_messages')
        .insert([{
          ticket_id: ticketData.id,
          sender_type: 'user',
          sender_id: user.id,
          message: ticket.message,
        }]);
      
      if (messageError) throw messageError;
      
      return ticketData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });

  // Add reply to ticket
  const addTicketReply = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('ticket_messages')
        .insert([{
          ticket_id: ticketId,
          sender_type: 'user',
          sender_id: user.id,
          message,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages'] });
    },
  });

  // Mark FAQ helpful
  const markFAQHelpful = useMutation({
    mutationFn: async ({ faqId, helpful }: { faqId: string; helpful: boolean }) => {
      // For demo mode, just log the feedback
      console.log('FAQ feedback recorded:', { faqId, helpful });
    },
  });

  return {
    faqs,
    tickets,
    faqsLoading,
    ticketsLoading,
    getFAQsByCategory,
    getFAQById,
    getTicketById,
    getTicketMessages,
    searchFAQs,
    createTicket,
    addTicketReply,
    markFAQHelpful,
  };
}

// Chat hook for live chat functionality
export function useLiveChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'bot-welcome',
      chat_id: 'demo',
      sender_type: 'bot',
      sender_id: null,
      message: "Hi! I'm BLIT, your virtual assistant. How can I help you today?",
      attachments: [],
      created_at: new Date().toISOString(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatStatus, setChatStatus] = useState<'bot' | 'waiting' | 'agent'>('bot');

  const botResponses: Record<string, string> = {
    'withdraw': "To withdraw funds from your B-LINE-IT wallet:\n\n1. Go to Wallet → Withdraw\n2. Select your linked bank account\n3. Enter the amount\n4. Confirm with Face ID/PIN\n\nWithdrawals typically process in 1-3 business days.\n\nWas this helpful?",
    'balance': "You can check your wallet balance on the Wallet page. Your current balance shows at the top of the screen, along with pending deposits and withdrawals.",
    'dividend': "Dividends are distributed quarterly (April, July, October, January). You'll receive an email notification when your dividend is credited. Check your transaction history for past payments.",
    'invest': "To invest in a property:\n\n1. Browse properties on the Assets page\n2. Click on a property to view details\n3. Click 'Invest' and enter your amount\n4. Review and confirm\n\nMinimum investments vary by property.",
    'help': "I can help with:\n• Account & Security\n• Investments & Dividends\n• Withdrawals & Deposits\n• Portfolio Questions\n\nWhat would you like to know about?",
  };

  const sendMessage = (text: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      chat_id: 'demo',
      sender_type: 'user',
      sender_id: user?.id || 'demo',
      message: text,
      attachments: [],
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let response = "I'm not sure I understand. Would you like me to connect you with a support agent?";
      
      for (const [keyword, reply] of Object.entries(botResponses)) {
        if (lowerText.includes(keyword)) {
          response = reply;
          break;
        }
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        chat_id: 'demo',
        sender_type: 'bot',
        sender_id: null,
        message: response,
        attachments: [],
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const connectToAgent = () => {
    setChatStatus('waiting');
    setIsTyping(true);
    
    const waitingMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      chat_id: 'demo',
      sender_type: 'bot',
      sender_id: null,
      message: "I'll connect you with a support agent. Please wait...",
      attachments: [],
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, waitingMessage]);

    // Simulate agent connection
    setTimeout(() => {
      setChatStatus('agent');
      setIsTyping(false);
      
      const agentMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        chat_id: 'demo',
        sender_type: 'agent',
        sender_id: 'agent-1',
        message: "Hi! I'm Sarah from Support. I can see your account - how can I help you today?",
        attachments: [],
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 3000);
  };

  const endChat = () => {
    const endMessage: ChatMessage = {
      id: `system-end-${Date.now()}`,
      chat_id: 'demo',
      sender_type: 'bot',
      sender_id: null,
      message: "Chat ended. Thank you for contacting B-LINE-IT Support!",
      attachments: [],
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, endMessage]);
    setChatStatus('bot');
  };

  return {
    messages,
    isTyping,
    chatStatus,
    sendMessage,
    connectToAgent,
    endChat,
  };
}
