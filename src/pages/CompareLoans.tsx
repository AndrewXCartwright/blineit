import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/hooks/useComparison';
import { ComparisonTable } from '@/components/comparison/ComparisonTable';
import { SaveComparisonDialog } from '@/components/comparison/SaveComparisonDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Loan {
  id: string;
  name: string;
  city: string;
  state: string;
  loan_type: string;
  apy: number;
  loan_amount: number;
  ltv_ratio: number;
  term_months: number;
  loan_position: string;
  min_investment: number;
  amount_funded: number;
  dscr: number | null;
  image_url: string | null;
}

export default function CompareLoans() {
  const navigate = useNavigate();
  const { items, removeItem } = useComparison();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      if (items.length === 0) {
        navigate('/assets');
        return;
      }

      const ids = items.filter(i => i.type === 'loans').map(i => i.id);
      if (ids.length === 0) {
        navigate('/assets');
        return;
      }

      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .in('id', ids);

      if (error) {
        console.error('Error fetching loans:', error);
        toast.error('Failed to load loans');
        return;
      }

      setLoans(data || []);
      setLoading(false);
    };

    fetchLoans();
  }, [items, navigate]);

  const findBestIndex = (values: number[], higher = true) => {
    if (values.length === 0) return undefined;
    const validValues = values.filter(v => v !== null && v !== undefined);
    if (validValues.length === 0) return undefined;
    const best = higher ? Math.max(...validValues) : Math.min(...validValues);
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

  if (loans.length < 2) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Add at least 2 loans to compare.</p>
          <Button onClick={() => navigate('/assets')} className="mt-4">
            Browse Loans
          </Button>
        </div>
      </div>
    );
  }

  const columns = loans.map((l) => ({
    id: l.id,
    header: l.name,
    image: l.image_url || undefined,
    onRemove: () => removeItem(l.id),
    onAction: () => navigate(`/loan/${l.id}`),
    actionLabel: 'View Details',
  }));

  const getFundedPercentage = (l: Loan) => 
    ((l.amount_funded / l.loan_amount) * 100).toFixed(0);

  const rows = [
    {
      label: 'Loan Type',
      values: loans.map((l) => l.loan_type),
    },
    {
      label: 'Location',
      values: loans.map((l) => `${l.city}, ${l.state}`),
    },
    {
      label: 'APY',
      values: loans.map((l) => `${l.apy.toFixed(1)}%`),
      bestIndex: findBestIndex(loans.map((l) => l.apy), true),
      highlightBest: true,
    },
    {
      label: 'Term',
      values: loans.map((l) => `${l.term_months} months`),
      bestIndex: findBestIndex(loans.map((l) => l.term_months), false),
      highlightBest: true,
    },
    {
      label: 'LTV Ratio',
      values: loans.map((l) => `${l.ltv_ratio}%`),
      bestIndex: findBestIndex(loans.map((l) => l.ltv_ratio), false),
      highlightBest: true,
    },
    {
      label: 'DSCR',
      values: loans.map((l) => l.dscr ? `${l.dscr.toFixed(2)}x` : 'N/A'),
      bestIndex: findBestIndex(loans.map((l) => l.dscr || 0), true),
      highlightBest: true,
    },
    {
      label: 'Loan Amount',
      values: loans.map((l) => `$${(l.loan_amount / 1000000).toFixed(1)}M`),
    },
    {
      label: 'Position',
      values: loans.map((l) => l.loan_position),
    },
    {
      label: 'Min Investment',
      values: loans.map((l) => `$${l.min_investment.toLocaleString()}`),
      bestIndex: findBestIndex(loans.map((l) => l.min_investment), false),
      highlightBest: true,
    },
    {
      label: 'Funded',
      values: loans.map((l) => `${getFundedPercentage(l)}%`),
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
          ⚖️ Compare Loans
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
