import { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchlists, useWatchlistItems, useIsInWatchlist } from '@/hooks/useWatchlist';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WatchlistButtonProps {
  itemType: 'property' | 'loan' | 'prediction';
  itemId: string;
  currentPrice: number;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'ghost' | 'outline' | 'default';
}

export function WatchlistButton({
  itemType,
  itemId,
  currentPrice,
  className,
  size = 'icon',
  variant = 'ghost',
}: WatchlistButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { watchlists, ensureDefaultWatchlist } = useWatchlists();
  const { addItem, removeItem, items } = useWatchlistItems();
  const { isInWatchlist, isLoading } = useIsInWatchlist(itemType, itemId);
  const [isPending, setIsPending] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({ title: 'Please sign in', description: 'You need to be signed in to use the watchlist.', variant: 'destructive' });
      return;
    }

    setIsPending(true);
    try {
      if (isInWatchlist) {
        // Find and remove the item
        const existingItem = items.find(
          (item) => item.item_type === itemType && item.item_id === itemId
        );
        if (existingItem) {
          await removeItem.mutateAsync(existingItem.id);
        }
      } else {
        // Get or create default watchlist
        let watchlistId = watchlists.find((w) => w.is_default)?.id;
        if (!watchlistId) {
          watchlistId = await ensureDefaultWatchlist();
        }
        if (watchlistId) {
          await addItem.mutateAsync({
            watchlistId,
            itemType,
            itemId,
            addedPrice: currentPrice,
          });
        }
      }
    } catch (error) {
      console.error('Watchlist error:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleClick}
      disabled={isPending || isLoading}
    >
      <Star
        className={cn(
          'h-4 w-4 transition-colors',
          isInWatchlist ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'
        )}
      />
    </Button>
  );
}
