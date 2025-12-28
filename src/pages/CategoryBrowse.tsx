import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Landmark, Target, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/Skeleton';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const categoryConfig: Record<string, { 
  title: string; 
  description: string; 
  type: 'property' | 'loan' | 'prediction';
  filter?: Record<string, any>;
}> = {
  'multifamily': { 
    title: 'Multifamily Properties', 
    description: 'Apartment buildings and residential complexes',
    type: 'property',
    filter: { category: 'multifamily' }
  },
  'commercial': { 
    title: 'Commercial Properties', 
    description: 'Office buildings and retail spaces',
    type: 'property',
    filter: { category: 'commercial' }
  },
  'industrial': { 
    title: 'Industrial Properties', 
    description: 'Warehouses and manufacturing facilities',
    type: 'property',
    filter: { category: 'industrial' }
  },
  'bridge-loans': { 
    title: 'Bridge Loans', 
    description: 'Short-term financing for property acquisitions',
    type: 'loan',
    filter: { loan_type: 'bridge' }
  },
  'fix-flip': { 
    title: 'Fix & Flip Loans', 
    description: 'Financing for property renovations',
    type: 'loan',
    filter: { loan_type: 'fix_flip' }
  },
  'predictions': { 
    title: 'Prediction Markets', 
    description: 'Bet on real estate market outcomes',
    type: 'prediction',
    filter: { status: 'active' }
  },
};

export default function CategoryBrowse() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const config = categoryConfig[slug || ''] || { 
    title: 'Category', 
    description: 'Browse listings',
    type: 'property' as const 
  };

  const { data: results, isLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      if (config.type === 'property') {
        let query = supabase.from('properties').select('*');
        if (config.filter?.category) {
          query = query.ilike('category', `%${config.filter.category}%`);
        }
        const { data, error } = await query.limit(50);
        if (error) throw error;
        return (data || []).map(item => ({
          id: item.id,
          type: 'property' as const,
          title: item.name,
          subtitle: `${item.city}, ${item.state} • ${item.apy}% APY`,
          matches: [],
          data: item,
        }));
      } else if (config.type === 'loan') {
        let query = supabase.from('loans').select('*');
        if (config.filter?.loan_type) {
          query = query.ilike('loan_type', `%${config.filter.loan_type}%`);
        }
        const { data, error } = await query.limit(50);
        if (error) throw error;
        return (data || []).map(item => ({
          id: item.id,
          type: 'loan' as const,
          title: item.name,
          subtitle: `${item.apy}% APY • ${item.term_months} months`,
          matches: [],
          data: item,
        }));
      } else {
        let query = supabase.from('prediction_markets').select('*');
        if (config.filter?.status) {
          query = query.eq('status', config.filter.status);
        }
        const { data, error } = await query.limit(50);
        if (error) throw error;
        return (data || []).map(item => ({
          id: item.id,
          type: 'prediction' as const,
          title: item.title || item.question,
          subtitle: `${item.yes_price}% Yes • $${item.volume?.toLocaleString() || 0} volume`,
          matches: [],
          data: item,
        }));
      }
    },
  });

  const getIcon = () => {
    switch (config.type) {
      case 'property':
        return Building2;
      case 'loan':
        return Landmark;
      case 'prediction':
        return Target;
    }
  };

  const Icon = getIcon();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{config.title}</h1>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/search/advanced')}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : results && results.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-3">
              {results.map((result) => (
                <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Results</h3>
            <p className="text-muted-foreground">
              No listings found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}