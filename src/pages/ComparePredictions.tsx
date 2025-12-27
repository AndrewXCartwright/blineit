import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/hooks/useComparison';
import { ComparisonTable } from '@/components/comparison/ComparisonTable';
import { SaveComparisonDialog } from '@/components/comparison/SaveComparisonDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Prediction {
  id: string;
  question: string;
  title: string | null;
  yes_price: number;
  no_price: number;
  volume: number;
  traders_count: number;
  expires_at: string;
  status: string | null;
}

export default function ComparePredictions() {
  const navigate = useNavigate();
  const { items, removeItem } = useComparison();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (items.length === 0) {
        navigate('/predict');
        return;
      }

      const ids = items.filter(i => i.type === 'predictions').map(i => i.id);
      if (ids.length === 0) {
        navigate('/predict');
        return;
      }

      const { data, error } = await supabase
        .from('prediction_markets')
        .select('*')
        .in('id', ids);

      if (error) {
        console.error('Error fetching predictions:', error);
        toast.error('Failed to load predictions');
        return;
      }

      setPredictions(data || []);
      setLoading(false);
    };

    fetchPredictions();
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

  const calculateReturn = (price: number) => {
    // Return if you bet $100 and win
    return ((100 / price) * 100 - 100).toFixed(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (predictions.length < 2) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Add at least 2 predictions to compare.</p>
          <Button onClick={() => navigate('/predict')} className="mt-4">
            Browse Predictions
          </Button>
        </div>
      </div>
    );
  }

  const columns = predictions.map((p) => ({
    id: p.id,
    header: p.title || p.question.slice(0, 30) + '...',
    onRemove: () => removeItem(p.id),
    onAction: () => navigate(`/predict?market=${p.id}`),
    actionLabel: 'View Market',
  }));

  const rows = [
    {
      label: 'Question',
      values: predictions.map((p) => (
        <span className="text-xs max-w-[150px] line-clamp-2">{p.question}</span>
      )),
    },
    {
      label: 'YES Odds',
      values: predictions.map((p) => `${p.yes_price}%`),
      bestIndex: findBestIndex(predictions.map((p) => p.yes_price), true),
      highlightBest: true,
    },
    {
      label: 'NO Odds',
      values: predictions.map((p) => `${p.no_price}%`),
    },
    {
      label: 'Volume',
      values: predictions.map((p) => `$${p.volume.toLocaleString()}`),
      bestIndex: findBestIndex(predictions.map((p) => p.volume), true),
      highlightBest: true,
    },
    {
      label: 'Traders',
      values: predictions.map((p) => p.traders_count.toString()),
      bestIndex: findBestIndex(predictions.map((p) => p.traders_count), true),
      highlightBest: true,
    },
    {
      label: 'Closes In',
      values: predictions.map((p) => 
        formatDistanceToNow(new Date(p.expires_at), { addSuffix: false })
      ),
    },
    {
      label: 'YES Return',
      values: predictions.map((p) => `+$${calculateReturn(p.yes_price)} per $100`),
      bestIndex: findBestIndex(
        predictions.map((p) => parseFloat(calculateReturn(p.yes_price))),
        true
      ),
      highlightBest: true,
    },
    {
      label: 'NO Return',
      values: predictions.map((p) => `+$${calculateReturn(p.no_price)} per $100`),
      bestIndex: findBestIndex(
        predictions.map((p) => parseFloat(calculateReturn(p.no_price))),
        true
      ),
      highlightBest: true,
    },
    {
      label: 'Status',
      values: predictions.map((p) => (
        <span className={p.status === 'open' ? 'text-green-500' : 'text-muted-foreground'}>
          {p.status?.toUpperCase() || 'OPEN'}
        </span>
      )),
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
          ⚖️ Compare Predictions
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
