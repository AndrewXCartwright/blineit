import { Scale, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComparison, ComparisonType, ComparisonItem } from '@/hooks/useComparison';
import { cn } from '@/lib/utils';

interface CompareButtonProps {
  item: Omit<ComparisonItem, 'type'>;
  type: ComparisonType;
  variant?: 'icon' | 'button';
  className?: string;
}

export function CompareButton({ item, type, variant = 'icon', className }: CompareButtonProps) {
  const { addItem, removeItem, isInComparison, canAdd } = useComparison();

  const inComparison = isInComparison(item.id);
  const canAddItem = canAdd(type);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (inComparison) {
      removeItem(item.id);
    } else if (canAddItem) {
      addItem({ ...item, type });
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        disabled={!inComparison && !canAddItem}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all',
          inComparison
            ? 'bg-primary text-primary-foreground'
            : 'bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground',
          !inComparison && !canAddItem && 'opacity-50 cursor-not-allowed',
          className
        )}
        title={inComparison ? 'Remove from comparison' : 'Add to compare'}
      >
        {inComparison ? (
          <Check className="h-4 w-4" />
        ) : (
          <Scale className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <Button
      variant={inComparison ? 'default' : 'outline'}
      size="sm"
      onClick={handleClick}
      disabled={!inComparison && !canAddItem}
      className={cn('gap-2', className)}
    >
      {inComparison ? (
        <>
          <Check className="h-4 w-4" />
          In Comparison
        </>
      ) : (
        <>
          <Scale className="h-4 w-4" />
          Compare
        </>
      )}
    </Button>
  );
}
