import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Building2, Landmark, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/Skeleton';
import { SearchResultCard } from '@/components/search/SearchResultCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const locationConfig: Record<string, { name: string; state: string }> = {
  'california': { name: 'California', state: 'CA' },
  'texas': { name: 'Texas', state: 'TX' },
  'florida': { name: 'Florida', state: 'FL' },
  'new-york': { name: 'New York', state: 'NY' },
  'arizona': { name: 'Arizona', state: 'AZ' },
  'colorado': { name: 'Colorado', state: 'CO' },
  'washington': { name: 'Washington', state: 'WA' },
  'georgia': { name: 'Georgia', state: 'GA' },
};

export default function LocationBrowse() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const config = locationConfig[slug || ''] || { name: 'Location', state: '' };

  const { data: properties, isLoading: loadingProperties } = useQuery({
    queryKey: ['location-properties', config.state],
    queryFn: async () => {
      if (!config.state) return [];
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('state', config.state)
        .limit(50);
      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        type: 'property' as const,
        title: item.name,
        subtitle: `${item.city}, ${item.state} • ${item.apy}% APY`,
        matches: [],
        data: item,
      }));
    },
    enabled: !!config.state,
  });

  const { data: loans, isLoading: loadingLoans } = useQuery({
    queryKey: ['location-loans', config.state],
    queryFn: async () => {
      if (!config.state) return [];
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('state', config.state)
        .limit(50);
      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        type: 'loan' as const,
        title: item.name,
        subtitle: `${item.apy}% APY • ${item.term_months} months`,
        matches: [],
        data: item,
      }));
    },
    enabled: !!config.state,
  });

  const isLoading = loadingProperties || loadingLoans;
  const totalCount = (properties?.length || 0) + (loans?.length || 0);

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
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">{config.name}</h1>
                  <p className="text-sm text-muted-foreground">{totalCount} listings</p>
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
        <Tabs defaultValue="all">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="all">
              All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-1">
              <Building2 className="h-4 w-4" />
              Properties ({properties?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="loans" className="gap-1">
              <Landmark className="h-4 w-4" />
              Loans ({loans?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[...(properties || []), ...(loans || [])].map((result) => (
                  <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
                ))}
                {totalCount === 0 && (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Results</h3>
                    <p className="text-muted-foreground">
                      No listings found in {config.name}.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="properties">
            {loadingProperties ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : properties && properties.length > 0 ? (
              <div className="space-y-3">
                {properties.map((result) => (
                  <SearchResultCard key={result.id} result={result} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No properties found in {config.name}
              </div>
            )}
          </TabsContent>

          <TabsContent value="loans">
            {loadingLoans ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : loans && loans.length > 0 ? (
              <div className="space-y-3">
                {loans.map((result) => (
                  <SearchResultCard key={result.id} result={result} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No loans found in {config.name}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}