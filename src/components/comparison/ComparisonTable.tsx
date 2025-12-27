import { ReactNode } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ComparisonColumn {
  id: string;
  header: ReactNode;
  image?: string;
  onRemove?: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

interface ComparisonRow {
  label: string;
  values: (string | number | ReactNode)[];
  bestIndex?: number;
  highlightBest?: boolean;
}

interface ComparisonTableProps {
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  className?: string;
}

export function ComparisonTable({ columns, rows, className }: ComparisonTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 bg-background z-10 p-3 text-left text-sm font-medium text-muted-foreground min-w-[120px]">
              &nbsp;
            </th>
            {columns.map((col) => (
              <th key={col.id} className="p-3 text-center min-w-[150px]">
                <div className="flex flex-col items-center gap-2">
                  {col.image && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={col.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <span className="font-semibold text-sm">{col.header}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                'border-t border-border',
                rowIndex % 2 === 0 ? 'bg-muted/30' : ''
              )}
            >
              <td className="sticky left-0 bg-inherit z-10 p-3 text-sm font-medium text-muted-foreground">
                {row.label}
              </td>
              {row.values.map((value, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(
                    'p-3 text-center text-sm',
                    row.highlightBest && row.bestIndex === colIndex
                      ? 'font-semibold text-primary'
                      : ''
                  )}
                >
                  <div className="flex items-center justify-center gap-1">
                    {value}
                    {row.highlightBest && row.bestIndex === colIndex && (
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t border-border">
            <td className="sticky left-0 bg-background z-10 p-3">&nbsp;</td>
            {columns.map((col) => (
              <td key={col.id} className="p-3">
                <div className="flex flex-col items-center gap-2">
                  {col.onAction && (
                    <Button size="sm" onClick={col.onAction}>
                      {col.actionLabel || 'Invest'}
                    </Button>
                  )}
                  {col.onRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={col.onRemove}
                      className="text-muted-foreground"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
