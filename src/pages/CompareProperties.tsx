import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/hooks/useComparison';
import { ComparisonTable } from '@/components/comparison/ComparisonTable';
import { SaveComparisonDialog } from '@/components/comparison/SaveComparisonDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Property {
  id: string;
  name: string;
  city: string;
  state: string;
  category: string;
  apy: number;
  token_price: number;
  value: number;
  year_built: number | null;
  units: number;
  occupancy: number;
  holders: number;
  image_url: string | null;
}

export default function CompareProperties() {
  const navigate = useNavigate();
  const { items, removeItem } = useComparison();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      if (items.length === 0) {
        navigate('/assets');
        return;
      }

      const ids = items.filter(i => i.type === 'properties').map(i => i.id);
      if (ids.length === 0) {
        navigate('/assets');
        return;
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', ids);

      if (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties');
        return;
      }

      setProperties(data || []);
      setLoading(false);
    };

    fetchProperties();
  }, [items, navigate]);

  const findBestIndex = (values: number[], higher = true) => {
    if (values.length === 0) return undefined;
    const best = higher ? Math.max(...values) : Math.min(...values);
    return values.indexOf(best);
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (properties.length < 2) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Add at least 2 properties to compare.</p>
          <Button onClick={() => navigate('/assets')} className="mt-4">
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }

  const columns = properties.map((p) => ({
    id: p.id,
    header: p.name,
    image: p.image_url || undefined,
    onRemove: () => removeItem(p.id),
    onAction: () => navigate(`/property/${p.id}`),
    actionLabel: 'View Details',
  }));

  const rows = [
    {
      label: 'Location',
      values: properties.map((p) => `${p.city}, ${p.state}`),
    },
    {
      label: 'Type',
      values: properties.map((p) => p.category),
    },
    {
      label: 'APY',
      values: properties.map((p) => `${p.apy.toFixed(1)}%`),
      bestIndex: findBestIndex(properties.map((p) => p.apy), true),
      highlightBest: true,
    },
    {
      label: 'Token Price',
      values: properties.map((p) => `$${p.token_price.toFixed(2)}`),
      bestIndex: findBestIndex(properties.map((p) => p.token_price), false),
      highlightBest: true,
    },
    {
      label: 'Total Value',
      values: properties.map((p) => `$${(p.value / 1000000).toFixed(1)}M`),
    },
    {
      label: 'Year Built',
      values: properties.map((p) => p.year_built?.toString() || 'N/A'),
      bestIndex: findBestIndex(
        properties.map((p) => p.year_built || 0),
        true
      ),
      highlightBest: true,
    },
    {
      label: 'Units',
      values: properties.map((p) => p.units.toString()),
    },
    {
      label: 'Occupancy',
      values: properties.map((p) => `${p.occupancy}%`),
      bestIndex: findBestIndex(properties.map((p) => p.occupancy), true),
      highlightBest: true,
    },
    {
      label: 'Token Holders',
      values: properties.map((p) => p.holders.toLocaleString()),
      bestIndex: findBestIndex(properties.map((p) => p.holders), true),
      highlightBest: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <SaveComparisonDialog />
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          ⚖️ Compare Properties
        </h1>

        <div className="border rounded-lg bg-card">
          <ComparisonTable columns={columns} rows={rows} />
        </div>

        <div className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            ⭐ = Best value in category
          </span>
        </div>
      </div>
    </div>
  );
}
