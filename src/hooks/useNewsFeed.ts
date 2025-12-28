import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PropertyUpdate {
  id: string;
  item_id: string;
  item_type: string;
  update_type: string;
  title: string;
  content: string;
  summary: string | null;
  images: string[];
  video_url: string | null;
  documents: { name: string; url: string }[];
  is_major: boolean;
  published_at: string;
  created_by: string;
  created_at: string;
}

export interface PlatformAnnouncement {
  id: string;
  title: string;
  content: string;
  announcement_type: string;
  priority: string;
  target_audience: string;
  banner_image: string | null;
  action_url: string | null;
  action_text: string | null;
  starts_at: string;
  expires_at: string | null;
  is_dismissible: boolean;
  created_at: string;
}

export interface MarketNews {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  source: string;
  source_name: string | null;
  source_url: string | null;
  category: string;
  tags: string[];
  image_url: string | null;
  published_at: string;
  created_at: string;
}

export interface FeedPreferences {
  id: string;
  user_id: string;
  show_property_updates: boolean;
  show_announcements: boolean;
  show_market_news: boolean;
  show_social_activity: boolean;
  properties_filter: string[] | null;
  categories_filter: string[] | null;
  email_digest: string;
}

// Demo data
const demoPropertyUpdates: PropertyUpdate[] = [
  {
    id: '1',
    item_id: 'prop-1',
    item_type: 'property',
    update_type: 'renovation',
    title: 'Q4 2024 Renovation Complete',
    content: `We're excited to announce the completion of our lobby renovation project at Sunset Apartments. The new modern design includes:\n\n- New marble flooring throughout the lobby\n- Updated lighting fixtures with energy-efficient LEDs\n- Redesigned seating area with comfortable furniture\n- New digital directory system\n- Enhanced security features\n\nThis renovation was completed on schedule and within budget. We expect this upgrade to improve tenant satisfaction and support future rent increases.`,
    summary: "We're excited to announce the completion of our lobby renovation project. The new modern design includes...",
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800'
    ],
    video_url: null,
    documents: [
      { name: 'Q4_Renovation_Report.pdf', url: '#' },
      { name: 'Before_After_Photos.zip', url: '#' }
    ],
    is_major: true,
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    created_by: 'admin',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    item_id: 'prop-2',
    item_type: 'property',
    update_type: 'distribution',
    title: 'Q4 Distribution Paid',
    content: 'Your Q4 dividend of $234.56 has been paid to your wallet. Thank you for your continued investment in Marina Heights.',
    summary: 'Your Q4 dividend of $234.56 has been paid',
    images: [],
    video_url: null,
    documents: [],
    is_major: false,
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'admin',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    item_id: 'prop-1',
    item_type: 'property',
    update_type: 'leasing',
    title: 'December Leasing Update',
    content: 'Occupancy remains strong at 96% with 2 new leases signed this month. Average rent increased 3.2% on renewals.',
    summary: 'Occupancy remains strong at 96% with 2 new leases signed this month.',
    images: [],
    video_url: null,
    documents: [],
    is_major: false,
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'admin',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    item_id: 'prop-3',
    item_type: 'property',
    update_type: 'construction',
    title: 'Construction Progress: 65% Complete',
    content: 'Phoenix Development is progressing on schedule. Foundation complete, now moving to framing phase.',
    summary: 'Phoenix Development is progressing on schedule at 65% completion.',
    images: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'
    ],
    video_url: null,
    documents: [],
    is_major: true,
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'admin',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const demoAnnouncements: PlatformAnnouncement[] = [
  {
    id: '1',
    title: 'Introducing Auto-Invest 2.0',
    content: "We've upgraded our auto-invest feature with new allocation strategies, improved scheduling options, and better performance tracking. Start building your portfolio automatically today!",
    announcement_type: 'feature',
    priority: 'normal',
    target_audience: 'all',
    banner_image: null,
    action_url: '/auto-invest',
    action_text: 'Learn More',
    starts_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    expires_at: null,
    is_dismissible: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Scheduled Maintenance - Jan 5, 2025',
    content: 'Platform will be unavailable 2-4 AM CT for scheduled maintenance and upgrades. We apologize for any inconvenience.',
    announcement_type: 'maintenance',
    priority: 'high',
    target_audience: 'all',
    banner_image: null,
    action_url: null,
    action_text: null,
    starts_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_dismissible: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Updated Terms of Service',
    content: 'We have updated our Terms of Service effective January 1, 2025. Please review the changes at your earliest convenience.',
    announcement_type: 'policy',
    priority: 'normal',
    target_audience: 'all',
    banner_image: null,
    action_url: '/legal/terms',
    action_text: 'Review Changes',
    starts_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: null,
    is_dismissible: true,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Refer a Friend - Get $50',
    content: 'Invite your friends to B-LINE-IT and earn $50 for each qualified referral. There is no limit to how much you can earn!',
    announcement_type: 'promotion',
    priority: 'normal',
    target_audience: 'all',
    banner_image: null,
    action_url: '/referrals',
    action_text: 'Start Referring',
    starts_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: null,
    is_dismissible: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const demoMarketNews: MarketNews[] = [
  {
    id: '1',
    title: '2025 Real Estate Market Outlook',
    content: `Experts predict continued growth in the multifamily sector as demand for rental housing remains strong. Key trends to watch:\n\n1. **Rising Rents**: Average rents expected to increase 3-5% nationwide\n2. **Sun Belt Growth**: Markets like Austin, Phoenix, and Miami continue to attract investment\n3. **Interest Rates**: Fed expected to maintain current rate levels through Q1\n4. **Tokenization**: Growing adoption of blockchain-based real estate investment\n\nInvestors should focus on quality assets in high-growth markets with strong fundamentals.`,
    summary: 'Experts predict continued growth in the multifamily sector as demand for rental housing remains strong...',
    source: 'internal',
    source_name: 'B-LINE-IT Research',
    source_url: null,
    category: 'real_estate',
    tags: ['outlook', '2025', 'multifamily'],
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    title: 'Federal Reserve Holds Rates Steady',
    content: 'The Federal Reserve announced today that interest rates will remain unchanged at 4.25-4.50%. This decision was widely expected as inflation continues to moderate.',
    summary: 'The Federal Reserve announced today that interest rates will remain unchanged...',
    source: 'external',
    source_name: 'Reuters',
    source_url: 'https://reuters.com',
    category: 'economy',
    tags: ['fed', 'interest-rates', 'economy'],
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    title: 'Austin Named Top Market for 2025',
    content: 'Austin, Texas has been named the top real estate market for 2025 according to the Urban Land Institute. Strong job growth and population influx continue to drive demand.',
    summary: 'Austin, Texas has been named the top real estate market for 2025...',
    source: 'external',
    source_name: 'Urban Land Institute',
    source_url: 'https://uli.org',
    category: 'real_estate',
    tags: ['austin', 'texas', 'top-markets'],
    image_url: 'https://images.unsplash.com/photo-1531218150217-54595bc2b934?w=800',
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'New SEC Guidelines for Tokenization',
    content: 'The SEC has issued new guidelines for tokenized securities, providing clearer regulatory framework for real estate tokenization platforms.',
    summary: 'The SEC has issued new guidelines for tokenized securities...',
    source: 'external',
    source_name: 'SEC',
    source_url: 'https://sec.gov',
    category: 'regulation',
    tags: ['sec', 'tokenization', 'regulation'],
    image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export function useNewsFeed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch property updates
  const { data: propertyUpdates = demoPropertyUpdates, isLoading: loadingUpdates } = useQuery({
    queryKey: ['property-updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_updates')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      if (!data || data.length === 0) return demoPropertyUpdates;
      return data.map(d => ({
        ...d,
        images: (d.images as string[]) || [],
        documents: (d.documents as { name: string; url: string }[]) || [],
      })) as PropertyUpdate[];
    },
  });

  // Fetch announcements
  const { data: announcements = demoAnnouncements, isLoading: loadingAnnouncements } = useQuery({
    queryKey: ['platform-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (!data || data.length === 0) return demoAnnouncements;
      return data as PlatformAnnouncement[];
    },
  });

  // Fetch market news
  const { data: marketNews = demoMarketNews, isLoading: loadingNews } = useQuery({
    queryKey: ['market-news'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_news')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      if (!data || data.length === 0) return demoMarketNews;
      return data as MarketNews[];
    },
  });

  // Fetch feed preferences
  const { data: preferences, isLoading: loadingPreferences } = useQuery({
    queryKey: ['feed-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_feed_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as FeedPreferences | null;
    },
    enabled: !!user,
  });

  // Fetch read status
  const { data: readUpdates = [] } = useQuery({
    queryKey: ['update-reads', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('update_reads')
        .select('update_id, update_type')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Save preferences
  const savePreferencesMutation = useMutation({
    mutationFn: async (prefs: Partial<FeedPreferences>) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_feed_preferences')
        .upsert({
          user_id: user.id,
          ...prefs,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-preferences'] });
    },
  });

  // Mark as read
  const markAsReadMutation = useMutation({
    mutationFn: async ({ updateId, updateType }: { updateId: string; updateType: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('update_reads')
        .upsert({
          user_id: user.id,
          update_id: updateId,
          update_type: updateType,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['update-reads'] });
    },
  });

  const isRead = useCallback((updateId: string, updateType: string) => {
    return readUpdates.some(r => r.update_id === updateId && r.update_type === updateType);
  }, [readUpdates]);

  const unreadCount = propertyUpdates.filter(u => !isRead(u.id, 'property_update')).length +
    announcements.filter(a => !isRead(a.id, 'announcement')).length +
    marketNews.filter(n => !isRead(n.id, 'news')).length;

  return {
    propertyUpdates,
    announcements,
    marketNews,
    preferences,
    readUpdates,
    unreadCount,
    isLoading: loadingUpdates || loadingAnnouncements || loadingNews || loadingPreferences,
    savePreferences: savePreferencesMutation.mutateAsync,
    markAsRead: markAsReadMutation.mutateAsync,
    isRead,
    isSavingPreferences: savePreferencesMutation.isPending,
  };
}

export function usePropertyUpdate(id: string) {
  const { propertyUpdates } = useNewsFeed();
  return propertyUpdates.find(u => u.id === id) || null;
}

export function useMarketNewsArticle(id: string) {
  const { marketNews } = useNewsFeed();
  return marketNews.find(n => n.id === id) || null;
}
