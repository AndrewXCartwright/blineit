import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface SearchFilters {
  location?: string[];
  propertyType?: string[];
  apyMin?: number;
  apyMax?: number;
  priceMin?: number;
  priceMax?: number;
  minInvestment?: number;
  loanType?: string[];
  loanTerm?: string[];
  ltvMax?: number;
  loanPosition?: string[];
  fundingStatus?: string[];
  marketType?: string[];
  closingTime?: string;
  volume?: string;
  status?: string[];
  yearBuiltMin?: number;
  yearBuiltMax?: number;
  occupancyMin?: number;
}

export interface SearchResult {
  id: string;
  type: 'property' | 'loan' | 'prediction';
  title: string;
  subtitle: string;
  matches: string[];
  data: any;
}

export function useSearch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'properties' | 'loans' | 'predictions'>('all');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Search properties
  const searchProperties = useCallback(async (query: string, filters: SearchFilters) => {
    let queryBuilder = supabase
      .from('properties')
      .select('*');

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%,address.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (filters.location?.length) {
      const locationFilters = filters.location.map(loc => {
        const [city, state] = loc.split(', ');
        return `and(city.ilike.%${city}%,state.ilike.%${state}%)`;
      }).join(',');
      queryBuilder = queryBuilder.or(locationFilters);
    }

    if (filters.propertyType?.length) {
      queryBuilder = queryBuilder.in('category', filters.propertyType);
    }

    if (filters.apyMin !== undefined) {
      queryBuilder = queryBuilder.gte('apy', filters.apyMin);
    }

    if (filters.apyMax !== undefined) {
      queryBuilder = queryBuilder.lte('apy', filters.apyMax);
    }

    if (filters.priceMin !== undefined) {
      queryBuilder = queryBuilder.gte('token_price', filters.priceMin);
    }

    if (filters.priceMax !== undefined) {
      queryBuilder = queryBuilder.lte('token_price', filters.priceMax);
    }

    if (filters.occupancyMin !== undefined) {
      queryBuilder = queryBuilder.gte('occupancy', filters.occupancyMin);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      type: 'property' as const,
      title: item.name,
      subtitle: `${item.city}, ${item.state} • ${item.apy}% APY • $${item.token_price}/token`,
      matches: findMatches(query, [item.name, item.city, item.state, item.address, item.description]),
      data: item,
    }));
  }, []);

  // Search loans
  const searchLoans = useCallback(async (query: string, filters: SearchFilters) => {
    let queryBuilder = supabase
      .from('loans')
      .select('*');

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (filters.loanType?.length) {
      queryBuilder = queryBuilder.in('loan_type', filters.loanType);
    }

    if (filters.apyMin !== undefined) {
      queryBuilder = queryBuilder.gte('apy', filters.apyMin);
    }

    if (filters.apyMax !== undefined) {
      queryBuilder = queryBuilder.lte('apy', filters.apyMax);
    }

    if (filters.ltvMax !== undefined) {
      queryBuilder = queryBuilder.lte('ltv_ratio', filters.ltvMax);
    }

    if (filters.loanPosition?.length) {
      queryBuilder = queryBuilder.in('loan_position', filters.loanPosition);
    }

    if (filters.status?.length) {
      queryBuilder = queryBuilder.in('status', filters.status);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      type: 'loan' as const,
      title: item.name,
      subtitle: `$${(item.loan_amount / 1000000).toFixed(1)}M • ${item.apy}% APY • ${item.term_months} months`,
      matches: findMatches(query, [item.name, item.city, item.state, item.description]),
      data: item,
    }));
  }, []);

  // Search predictions
  const searchPredictions = useCallback(async (query: string, filters: SearchFilters) => {
    let queryBuilder = supabase
      .from('prediction_markets')
      .select('*');

    if (query) {
      queryBuilder = queryBuilder.or(`question.ilike.%${query}%,title.ilike.%${query}%`);
    }

    if (filters.status?.length) {
      queryBuilder = queryBuilder.in('status', filters.status);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      type: 'prediction' as const,
      title: item.title || item.question,
      subtitle: `🐂 ${item.yes_price}% vs 🐻 ${item.no_price}% • $${item.volume.toLocaleString()} volume`,
      matches: findMatches(query, [item.question, item.title]),
      data: item,
    }));
  }, []);

  // Combined search
  const performSearch = useCallback(async () => {
    const results: SearchResult[] = [];

    if (searchType === 'all' || searchType === 'properties') {
      const propertyResults = await searchProperties(searchQuery, filters);
      results.push(...propertyResults);
    }

    if (searchType === 'all' || searchType === 'loans') {
      const loanResults = await searchLoans(searchQuery, filters);
      results.push(...loanResults);
    }

    if (searchType === 'all' || searchType === 'predictions') {
      const predictionResults = await searchPredictions(searchQuery, filters);
      results.push(...predictionResults);
    }

    // Log search analytics
    if (searchQuery || Object.keys(filters).length > 0) {
      await supabase.from('search_analytics').insert({
        query: searchQuery || null,
        search_type: searchType,
        filters: filters as any,
        results_count: results.length,
        user_id: user?.id || null,
      });

      // Save to recent searches if logged in
      if (user && searchQuery) {
        await supabase.from('recent_searches').insert({
          user_id: user.id,
          query: searchQuery,
          search_type: searchType,
          filters: filters as any,
        });
      }
    }

    return results;
  }, [searchQuery, searchType, filters, searchProperties, searchLoans, searchPredictions, user]);

  // Search query
  const { data: searchResults, isLoading, refetch } = useQuery({
    queryKey: ['search', searchQuery, searchType, filters],
    queryFn: performSearch,
    enabled: !!(searchQuery || Object.keys(filters).length > 0),
  });

  // Recent searches
  const { data: recentSearches } = useQuery({
    queryKey: ['recentSearches', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('recent_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Saved searches
  const { data: savedSearches } = useQuery({
    queryKey: ['savedSearches', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Save search mutation
  const saveSearchMutation = useMutation({
    mutationFn: async ({ name, notifyNewMatches }: { name: string; notifyNewMatches: boolean }) => {
      if (!user) throw new Error('Must be logged in');
      const { data, error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name,
          search_type: searchType,
          filters: filters as any,
          sort_by: sortBy || null,
          sort_order: sortOrder,
          notify_new_matches: notifyNewMatches,
          results_count: searchResults?.length || 0,
          last_run_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
      toast({
        title: 'Search Saved',
        description: 'Your search has been saved successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete saved search
  const deleteSavedSearchMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
      toast({
        title: 'Search Deleted',
        description: 'Your saved search has been deleted.',
      });
    },
  });

  // Clear recent searches
  const clearRecentSearchesMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from('recent_searches')
        .delete()
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
    },
  });

  return {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    searchResults: searchResults || [],
    isLoading,
    refetch,
    recentSearches: recentSearches || [],
    savedSearches: savedSearches || [],
    saveSearch: saveSearchMutation.mutate,
    isSavingSearch: saveSearchMutation.isPending,
    deleteSavedSearch: deleteSavedSearchMutation.mutate,
    clearRecentSearches: clearRecentSearchesMutation.mutate,
  };
}

function findMatches(query: string, fields: (string | null | undefined)[]): string[] {
  if (!query) return [];
  const matches: string[] = [];
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/).filter(w => w.length > 2);

  for (const field of fields) {
    if (!field) continue;
    const fieldLower = field.toLowerCase();
    for (const word of words) {
      if (fieldLower.includes(word) && !matches.includes(word)) {
        matches.push(word);
      }
    }
  }

  return matches;
}
