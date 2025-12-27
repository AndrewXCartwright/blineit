import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type ComparisonType = 'properties' | 'loans' | 'predictions';

export interface ComparisonItem {
  id: string;
  type: ComparisonType;
  name: string;
  image?: string;
}

interface ComparisonContextType {
  items: ComparisonItem[];
  comparisonType: ComparisonType | null;
  addItem: (item: ComparisonItem) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  isInComparison: (id: string) => boolean;
  canAdd: (type: ComparisonType) => boolean;
  savedComparisons: SavedComparison[];
  saveComparison: (name: string) => Promise<void>;
  deleteComparison: (id: string) => Promise<void>;
  loadComparison: (comparison: SavedComparison) => void;
  isLoading: boolean;
  MAX_ITEMS: number;
}

interface SavedComparison {
  id: string;
  name: string | null;
  comparison_type: string;
  item_ids: string[];
  created_at: string;
  updated_at: string;
}

const MAX_ITEMS = 4;

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [comparisonType, setComparisonType] = useState<ComparisonType | null>(null);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load saved comparisons
  useEffect(() => {
    if (user) {
      loadSavedComparisons();
    }
  }, [user]);

  const loadSavedComparisons = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('comparisons')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSavedComparisons(data || []);
    } catch (error) {
      console.error('Error loading comparisons:', error);
    }
  };

  const addItem = useCallback((item: ComparisonItem) => {
    setItems(prev => {
      // Check if already in comparison
      if (prev.some(i => i.id === item.id)) {
        toast.info('Already in comparison');
        return prev;
      }

      // Check type compatibility
      if (prev.length > 0 && prev[0].type !== item.type) {
        toast.error('Can only compare items of the same type');
        return prev;
      }

      // Check max items
      if (prev.length >= MAX_ITEMS) {
        toast.error(`Maximum ${MAX_ITEMS} items in comparison`);
        return prev;
      }

      setComparisonType(item.type);
      toast.success('Added to comparison');
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const newItems = prev.filter(item => item.id !== id);
      if (newItems.length === 0) {
        setComparisonType(null);
      }
      return newItems;
    });
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    setComparisonType(null);
  }, []);

  const isInComparison = useCallback((id: string) => {
    return items.some(item => item.id === id);
  }, [items]);

  const canAdd = useCallback((type: ComparisonType) => {
    if (items.length === 0) return true;
    if (items.length >= MAX_ITEMS) return false;
    return items[0].type === type;
  }, [items]);

  const saveComparison = async (name: string) => {
    if (!user || items.length === 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('comparisons')
        .insert({
          user_id: user.id,
          name,
          comparison_type: comparisonType,
          item_ids: items.map(i => i.id),
        });

      if (error) throw error;

      // Also save to history
      await supabase.from('comparison_history').insert({
        user_id: user.id,
        comparison_type: comparisonType,
        item_ids: items.map(i => i.id),
      });

      toast.success('Comparison saved');
      loadSavedComparisons();
    } catch (error) {
      console.error('Error saving comparison:', error);
      toast.error('Failed to save comparison');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComparison = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('comparisons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Comparison deleted');
      loadSavedComparisons();
    } catch (error) {
      console.error('Error deleting comparison:', error);
      toast.error('Failed to delete comparison');
    }
  };

  const loadComparison = (comparison: SavedComparison) => {
    // This will be populated with actual items when navigating to comparison page
    setComparisonType(comparison.comparison_type as ComparisonType);
  };

  return (
    <ComparisonContext.Provider
      value={{
        items,
        comparisonType,
        addItem,
        removeItem,
        clearAll,
        isInComparison,
        canAdd,
        savedComparisons,
        saveComparison,
        deleteComparison,
        loadComparison,
        isLoading,
        MAX_ITEMS,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
