import { Scale, X, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/hooks/useComparison';
import { motion, AnimatePresence } from 'framer-motion';

export function ComparisonTray() {
  const navigate = useNavigate();
  const { items, comparisonType, removeItem, clearAll, MAX_ITEMS } = useComparison();

  if (items.length === 0) return null;

  const handleCompare = () => {
    if (comparisonType) {
      navigate(`/compare/${comparisonType}`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-16 md:bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-sm shadow-lg"
      >
        <div className="container max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">
                Compare ({items.length} of {MAX_ITEMS})
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Clear All
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex-shrink-0 relative group"
              >
                <div className="w-20 h-20 rounded-lg border bg-muted overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground text-center p-1">
                      {item.name.slice(0, 20)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}

            {items.length < MAX_ITEMS && (
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center flex-shrink-0">
                <Plus className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
          </div>

          <Button
            onClick={handleCompare}
            className="w-full mt-2"
            disabled={items.length < 2}
          >
            Compare Now →
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
